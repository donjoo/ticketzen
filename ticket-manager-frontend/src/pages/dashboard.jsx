import { useEffect, useState } from 'react';
// import { useAuth } from '../context/AuthContext';
import { Box, Button, TextField, Typography, Card, CardContent } from '@mui/material';
import api from '../serivces/api';
import { useAuth } from '../context/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets/', {
        headers: {
          Authorization: `Bearer ${user.access}`,
        },
      });
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTicket = async () => {
    try {
      const res = await api.post('/tickets/', formData, {
        headers: {
          Authorization: `Bearer ${user.access}`,
        },
      });
      setFormData({ title: '', description: '' });
      setTickets([...tickets, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ticket Dashboard
      </Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          margin="normal"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <Button variant="contained" onClick={handleCreateTicket}>
          Create Ticket
        </Button>
      </Box>

      <Typography variant="h6">Tickets:</Typography>
      {tickets.map((ticket) => (
        <Card key={ticket.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{ticket.title}</Typography>
            <Typography variant="body2">{ticket.description}</Typography>
            <Typography variant="caption">Status: {ticket.status}</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default Dashboard;
