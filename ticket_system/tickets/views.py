from rest_framework import generics, permissions , viewsets , filters , status
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer
from django_filters.rest_framework import DjangoFilterBackend
from .models import Ticket
from .serializers import TicketSerializer
from .permissions import IsOwnerOrAdmin

from asgiref.sync import async_to_sync
from  channels.layers import get_channel_layer



# Djangos built user authentication for DRF + react project

class UserSerilializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RegisterUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

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



# Ticket Views

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.select_related('user', 'assigned_to').all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority','user', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'priority', 'status']


    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(user=user)

    def perform_create(self, serializer):
        ticket = serializer.save(user=self.request.user)
        self._broadcast('created',ticket)


    def perform_update(self, serializer):
        ticket = serializer.save()
        self._broadcast('updated', ticket)  


    def perform_destroy(self, instance):
        ticket_data = TicketSerializer(instance).data
        instance.delete()   
        self._broadcast('deleted', ticket_data,serialized=True)

    def _broadcast(self, action , ticket_obj,serialized=False):
        layer = get_channel_layer()
        if serialized:
            payload = ticket
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
