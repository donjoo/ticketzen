import json 
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import UntypedToken
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from jwt import decode as jwt_decode
from django.conf import settings
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth.models import User



class TicketConsumer(AsyncWebsocketConsumer):
        async def connect(self):
            self.user = await self._get_user_from_query()
            if self.user is None or isinstance(self.user, AnonymousUser):
                await self.close(code=4001)
                return
            await self.channel_layer.group_add(
                "ticket_updates", self.channel_name
            )
            await self.accept()

        async def disconnect(self, close_code):
            await self.channel_layer.group_discard(
                "ticket_updates", self.channel_name
            )
        

        async def  ticket_update(self, event):
            await self.send(
                text_data=json.dumps(
                    event["message"]
            ))

        async def _get_user_from_query(self):
            query = parse_qs(self.scope["query_string"].decode())
            token_list = query.get("token") or query.get('access')
            if not token_list:
                return AnonymousUser()
            token = token_list[0]
            try:
                validated_token = UntypedToken(token)
            except (invalidToken, TokenError):
                return AnonymousUser()

            from rest_framework_simplejwt.authentication import JWTAuthentication
            jwt_auth = JWTAuthentication()
            try:
                validated_data = jwt_auth.get_validated_token(token)
                user = await database_sync_to_async(jwt_auth.get_user)(validated_data)
                return user
            except Exception:
                return AnonymousUser()


        