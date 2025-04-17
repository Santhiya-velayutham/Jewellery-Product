import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert
} from '@mui/material';
import axios from 'axios';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [responseMessage, setResponseMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Sending to server:", { email, password });

    if (!email?.trim() || !password?.trim()) {
      setResponseMessage({ type: 'error', text: 'Please enter both email and password.' });
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8080/api/admin/loginadmin",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      setResponseMessage({ type: 'success', text: res.data.message });
      localStorage.setItem('token', res.data.token);

      Swal.fire({
        title: 'Login Successful!',
        text: 'Welcome back!',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/product-form');
        }
      });

    } catch (err) {
      setResponseMessage({
        type: 'error',
        text: err.response?.data?.message || 'Login failed.'
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={10} p={4} boxShadow={3} borderRadius={2}>
        <Typography variant="h5" mb={2} align="center">
          Admin Login
        </Typography>

        {responseMessage && (
          <Alert severity={responseMessage.type} sx={{ mb: 2 }}>
            {responseMessage.text}
          </Alert>
        )}

        <form onSubmit={handleLogin} noValidate>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            fullWidth
            margin="normal"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginForm;
