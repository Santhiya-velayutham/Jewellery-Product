import React, { useState } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const SignupForm = () => {
  const navigate = useNavigate();
  const [useremail, setUseremail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [responseMessage, setResponseMessage] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!useremail.trim() || !password.trim() || !confirmPassword.trim()) {
      setResponseMessage({
        type: 'error',
        text: 'All fields are required.'
      });
      return;
    }

    if (password !== confirmPassword) {
      setResponseMessage({
        type: 'error',
        text: 'Passwords do not match.'
      });
      return;
    }

    try {
      const res = await axios.post("http://localhost:8080/api/admin/signup", {
        useremail,
        password
      });

      if (res.data.error) {
        setResponseMessage({
          type: 'error',
          text: res.data.errorMessage
        });
      } else {
        Swal.fire("Success", res.data.message, "success").then(() => {
          navigate('/'); // ✅ redirect after success
        });
      }
    } catch (err) {
      console.error(err);
      setResponseMessage({
        type: 'error',
        text: 'Signup failed. Try again.'
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={10} p={4} boxShadow={3} borderRadius={2}>
        <Typography variant="h5" align="center" gutterBottom>
          Admin Signup
        </Typography>

        {responseMessage && (
          <Alert severity={responseMessage.type} sx={{ mb: 2 }}>
            {responseMessage.text}
          </Alert>
        )}

        <form onSubmit={handleSignup}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={useremail}
            onChange={(e) => setUseremail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Sign Up
          </Button>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account? <Link to="/">Login</Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default SignupForm;
