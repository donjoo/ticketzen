from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from tickets.models import Ticket  
from rest_framework_simplejwt.tokens import RefreshToken



class TicketTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='user1',
            password='pass123',
        )
        self.admin = User.objects.create_superuser(
            username='admin',
            password='adminpass',
        )
        self.create_url = reverse('ticket-list')
        self.client.login = lambda *args, **kwargs: None


    def get_token_header(self, user):
        refresh = RefreshToken.for_user(user)
        return {'HTTP_AUTHORIZATION': f'Bearer {str(refresh.access_token)}'}

    def test_user_can_create_ticket(self):
        data = {
            'title': 'Test',
            'description': 'This is a test ticket.',
            'priority': 'low',
            'status': 'open',
        }
        headers = self.get_token_header(self.user)
        resp = self.client.post(self.create_url, data, **headers)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED )
        self.assertEqual(Ticket.objects.count(), 1)
        self.assertEqual(Ticket.objects.first().user, self.user)


    def test_non_owner_cannot_update_other_ticket(self):
        ticket = Ticket.objects.create(title='T',description='D',priority='low',status='open', user=self.user)
        user2 = User.objects.create_user(username='user2', password='pass1234')
        header = self.get_token_header(user2)
        url = reverse('ticket-detail', args=[ticket.id])
        resp = self.client.put(url, {'title': 'Updated', 'description':'new updation', 'priority':'low','status':'open'}, **header)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)



