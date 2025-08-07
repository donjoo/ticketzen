from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/tickets/updated/?$', consumers.TicketConsumer.as_asgi()),
]