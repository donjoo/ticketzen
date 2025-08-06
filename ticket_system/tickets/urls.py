from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterUserView, UserProfileView,TicketViewSet
router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterUserView.as_view(), name='register_user'),
    path('me/', UserProfileView.as_view(), name='user_profile'),

]