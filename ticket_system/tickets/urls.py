from django.urls import path
from .views import RegisterUserView, UserProfileView


urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterUserView.as_view(), name='register_user'),
    path('me/', UserProfileView.as_view(), name='user_profile'),

]