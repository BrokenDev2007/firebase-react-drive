import React, { useState, useEffect } from "react";
import { Container, TextField, Button, Typography, Paper } from '@mui/material';
import { auth } from '../../firebase/firebase';  // Adjust the path as necessary
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        message.success('Welcome back, Chirag!');
        navigate('/home');
        
      }
    });
    // Clean up subscription to avoid memory leaks
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        console.log("User signed in:", userCredential.user);
        navigate('/home');
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div style={{ backgroundColor: '#1f1f1f', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ color: '#1f1f1f' }}>
          Please Login, Chirag!
        </Typography>
        {error && (
          <Typography variant="body2" color="error" align="center" sx={{ color: '#1f1f1f' }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Email"
            variant="outlined"
            margin="normal"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ marginBottom: '16px' }}
          />
          <TextField
            label="Password"
            variant="outlined"
            margin="normal"
            fullWidth
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ marginBottom: '16px' }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Login
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default Login;
