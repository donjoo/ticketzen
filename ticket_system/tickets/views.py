from rest_framework import generics, permissions , viewsets , filters , status, serializers
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer
from django_filters.rest_framework import DjangoFilterBackend
from .models import Ticket
from .serializers import TicketSerializer
from .permissions import IsOwnerOrAdmin, CanEditTicketPermission

from asgiref.sync import async_to_sync
from  channels.layers import get_channel_layer

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from .serializers import  BulkUserUpdateSerializer
from rest_framework.exceptions import PermissionDenied

# Djangos built user authentication for DRF + react project

class UserSerilializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email','is_staff', 'is_superuser', 'date_joined']

class RegisterUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username= validated_data['username'],
            email = validated_data['email'],
            password = validated_data['password'],

        )
        return user


class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterUserSerializer
    permission_classes = [permissions.AllowAny]

class UserProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerilializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims to the token
        token['username'] = user.username
        token['email'] = user.email
        token['is_superuser'] = user.is_superuser
        token['is_staff'] = user.is_staff

        return token


    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user info to the response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'is_superuser': self.user.is_superuser,
            'is_staff' : self.user.is_staff
        }

        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer



class UserViewSet(viewsets.ModelViewSet):
    # queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerilializer

    def get_queryset(self):
        # Add filter support if needed in query params
        queryset =  User.objects.all().order_by('-date_joined')

        is_staff_param = self.request.query_params.get('is_staff')
        if is_staff_param is not None:
            # Convert string to boolean
            if is_staff_param.lower() == 'true':
                queryset = queryset.filter(is_staff=True)
            elif is_staff_param.lower() == 'false':
                queryset = queryset.filter(is_staff=False)
        
        return queryset

    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

@action(detail=False, methods=['patch'], url_path='bulk-update')
def bulk_update(self, request):
    if not request.user.is_superuser:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    serializer = BulkUserUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user_ids = serializer.validated_data['user_ids']
    update_data = serializer.validated_data['update_data']

    updated_count = User.objects.filter(id__in=user_ids).update(**update_data)
    return Response({'updated': updated_count}, status=status.HTTP_200_OK)

@action(detail=False, methods=['post'], url_path='bulk-delete')
def bulk_delete(self, request):
    """
    Handle bulk delete of users.
    """
    if not request.user.is_superuser:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    user_ids = request.data.get('user_ids', [])
    if not isinstance(user_ids, list) or not user_ids:
        return Response({'error': 'user_ids must be a non-empty list'}, status=status.HTTP_400_BAD_REQUEST)

    deleted_count, _ = User.objects.filter(id__in=user_ids).delete()
    return Response({'deleted': deleted_count}, status=status.HTTP_200_OK)








# Ticket Views

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.select_related('user', 'assigned_to').all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated,CanEditTicketPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority','user', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'priority', 'status']


    # def get_queryset(self):
    #     user = self.request.user
    #     mine_only = self.request.query_params.get('mine_only') == 'true'
    #     if mine_only:
    #         return self.queryset.filter(user=user)

    #     if user.is_superuser:
    #         return self.queryset  # superadmins see everything
    #     view_all = self.request.query_params.get('view') == 'all'
    #     if view_all and user.is_staff:
    #         return self.queryset
    #     return self.queryset.filter(user=user)
    def get_queryset(self):
        try:
            user = self.request.user
            params = self.request.query_params

            mine_only = params.get('mine_only') == 'true'
            view_all = params.get('view') == 'all'
            user_filter = params.get('user')  # The ?user=<id> filter from frontend

            # Base queryset
            qs = self.queryset

            # If regular user and not requesting mine_only, force mine_only behaviour
            if not user.is_staff and not user.is_superuser and not mine_only:
                return qs.filter(user=user)

            # mine_only explicitly requested
            if mine_only:
                return qs.filter(user=user)

            # Admin / staff view_all
            if user.is_superuser or (user.is_staff and view_all):
                if user_filter:
                    # If ?user= given, filter by that user id or username
                    # Detect if it's numeric for id or string for username
                    if user_filter.isdigit():
                        qs = qs.filter(user__id=int(user_filter))
                    else:
                        qs = qs.filter(user__username=user_filter)
                return qs

            # Staff, not superuser, and no view_all — can still filter by their assigned tickets
            if user.is_staff:
                qs = qs.filter(assigned_to=user)
                if user_filter:
                    if user_filter.isdigit():
                        qs = qs.filter(user__id=int(user_filter))
                    else:
                        qs = qs.filter(user__username=user_filter)
                return qs

            # Default: Own tickets only
            return qs.filter(user=user)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='staff')
    def staff_tickets(self, request):
        try:
            """Return tickets assigned to the currently logged-in staff user."""
            user = request.user
            print(user)

            if not user.is_staff:
                return Response(
                    {'error': 'Only staff can access their assigned tickets.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            tickets = Ticket.objects.filter(assigned_to=user)
            print(tickets)
            serializer = self.get_serializer(tickets, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        try:
            ticket = serializer.save(user=self.request.user)
            self._broadcast('created',ticket)
        except Exception as e:
            raise serializers.ValidationError({'error': str(e)})

    def perform_update(self, serializer):
        try:
            print(self.request.data)  # see raw incoming dat
            ticket = serializer.save()
            self._broadcast('updated', ticket)  
        except Exception as e:
            raise serializers.ValidationError({'error': str(e)})

    def perform_destroy(self, instance):
        user = self.request.user
        try:
            # Only staff or admin can delete
            if not (user.is_staff or user.is_superuser):
                raise PermissionDenied("You do not have permission to delete this ticket.")        
            ticket_data = TicketSerializer(instance).data
            instance.delete()   
            self._broadcast('deleted', ticket_data,serialized=True)
        except PermissionDenied as e:
            raise e
        except Exception as e:
            raise serializers.ValidationError({'error': str(e)})


    

    def _broadcast(self, action , ticket_obj,serialized=False):
        try:
            layer = get_channel_layer()
            if serialized:
                payload = ticket_obj
            else:
                payload = TicketSerializer(ticket_obj).data
            message = {
                'action': action,
                'ticket': payload
            }
            async_to_sync(layer.group_send)(
                'ticket_updates', 
                {
                    'type': 'ticket_update',
                    'message': message
                }  
            )
        except Exception as e:
            print(f"WebSocket broadcast error: {e}")