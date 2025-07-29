from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import User


class AuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        self.profile_url = reverse('user_profile')


        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123'
        }

    def test_user_registration(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.filter(username='testuser').exists())


        def test_user_login(self):
            # Registerss the user first
            self.client.post(self.register_url, self.user_data)

            #  login the user
            login_response = self.client.post(self.login_url, {
                'username': 'testuser',
                'password': 'testpassword123'
            })
            self.assertEqual(login_response.status_code, status.HTTP_200_OK)
            self.assertIn('access', login_response.data)

        def test_profile_access_with_token(self):
            # Register and login
            self.client.post(self.register_url,self.uesr_data)
            login_response = self.client.post(self.login_url, {
                'username': 'testuser',
                'password': 'testpassword123'
            })

            access_token = login_response.data['access']
           
            # use the token 
            self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
            profile_response = self.client.get(self.profile_url)

            self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
            self.assertEqual(profile_response.data['username'], 'testuser')