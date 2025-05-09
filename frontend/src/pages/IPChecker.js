import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import axios from 'axios';

function IPChecker() {
  const [ipAddress, setIpAddress] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckIP = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await axios.post('http://localhost:5000/api/check-ip', {
        ip_address: ipAddress
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error checking IP address');
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'Blocked IP':
        return 'error';
      case 'Malicious IP':
        return 'error';
      case 'Suspicious IP':
        return 'warning';
      case 'Normal IP':
        return 'success';
      default:
        return 'info';
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          IP Address Checker
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="IP Address"
            variant="outlined"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="Enter IP address (e.g., 192.168.1.1)"
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="contained"
            onClick={handleCheckIP}
            disabled={loading || !ipAddress}
            fullWidth
          >
            {loading ? 'Checking...' : 'Check IP'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Alert severity={getResultColor(result.result)}>
            <Typography variant="subtitle1">
              IP Address: {result.ip_address}
            </Typography>
            <Typography variant="subtitle1">
              Status: {result.result}
            </Typography>
          </Alert>
        )}
      </Paper>
    </Container>
  );
}

export default IPChecker; 