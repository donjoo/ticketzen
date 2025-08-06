// src/components/auth/Signup.jsx
import React, { useState } from 'react';
import {
  Container, TextField, Button, Typography, Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../serivces/api';

function Signup() {
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('http://localhost:8000/api/register/', formData);
      alert('User created! Please log in.');
      navigate('/');
    } catch (error) {
      alert('Error creating user');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={10}>
        <Typography variant="h4" align="center">Signup</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Signup
          </Button>
        </form>
        <Box mt={2}>
          <Button onClick={() => navigate('/')} fullWidth>Go to Login</Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Signup;
