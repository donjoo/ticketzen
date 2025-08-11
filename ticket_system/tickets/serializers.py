from rest_framework import serializers
from .models import Ticket
from django.contrib.auth.models import User


class TicketSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    assigned_to = serializers.StringRelatedField(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        source='assigned_to',
        queryset=User.objects.all(),
        write_only=True,
        required=False

    )
    class Meta:
        model = Ticket
        fields = [
            'id',
            'title',
            'description',
            'priority',
            'status',
            'user',
            'assigned_to',
            'assigned_to_id',
            'created_at',
            'updated_at',
            'can_edit',
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
        extra_kwargs = {
            'priority': {'required': True},
            # 'status': {'required': True}
        }




class BulkUserUpdateSerializer(serializers.Serializer):
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    update_data = serializers.DictField()