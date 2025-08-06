// src/components/auth/Login.jsx
import React, { useState } from 'react';
import {
  Container, TextField, Button, Typography, Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../serivces/api';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('http://localhost:8000/api/token/', formData);
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      navigate('/dashboard');
    } catch (error) {
      alert('Invalid credentials');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={10}>
        <Typography variant="h4" align="center">Login</Typography>
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
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </form>
        <Box mt={2}>
          <Button onClick={() => navigate('/signup')} fullWidth>Go to Signup</Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;
