import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Container,
  Grid,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import axios from 'axios';
import TrainIcon from '@mui/icons-material/Train';
import SecurityIcon from '@mui/icons-material/Security';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SpeedIcon from '@mui/icons-material/Speed';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const Train = () => {
  const [protocol, setProtocol] = useState('');
  const [classifier, setClassifier] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');

  // Check backend connection
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get('/health');
        if (response.data.status === 'ok') {
          setBackendStatus('connected');
          setError(null);
        } else {
          setBackendStatus('disconnected');
          setError('Backend server is not responding correctly');
        }
      } catch (err) {
        setBackendStatus('disconnected');
        setError('Backend server is not running. Please start the backend server and refresh the page.');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (backendStatus !== 'connected') {
      setError('Backend server is not running. Please start the backend server and refresh the page.');
      return;
    }

    if (!protocol) {
      setError('Please select a protocol');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);
    setMessage('Starting training process...');

    try {
      const response = await api.post('/train', {
        protocol,
        classifier,
      });

      if (response.data.status === 'success') {
        // Start polling for progress
        const interval = setInterval(async () => {
          try {
            const progressResponse = await api.get(`/progress/${protocol}`);
            if (progressResponse.data.status === 'success') {
              const { stage, percentage, message } = progressResponse.data;
              setProgress(percentage);
              setMessage(message);
              
              if (stage === 'complete' || stage === 'error') {
                clearInterval(interval);
                setLoading(false);
                if (stage === 'error') {
                  setError(message);
                  setSuccess(false);
                } else {
                  setSuccess(true);
                }
              }
            }
          } catch (err) {
            clearInterval(interval);
            setLoading(false);
            setError('Error checking training progress');
          }
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error starting training');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <TrainIcon fontSize="large" />
          Model Training
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Train machine learning models for network security analysis
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Training Configuration */}
        <Grid item xs={12} md={8}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardHeader
              title="Training Configuration"
              subheader="Select protocol and classifier type"
              sx={{ 
                bgcolor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider'
              }}
            />
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Protocol</InputLabel>
                      <Select
                        value={protocol}
                        label="Protocol"
                        onChange={(e) => setProtocol(e.target.value)}
                        required
                        disabled={loading || backendStatus !== 'connected'}
                        sx={{ bgcolor: 'background.paper' }}
                      >
                        <MenuItem value="icmp">ICMP</MenuItem>
                        <MenuItem value="tcp_syn">TCP SYN</MenuItem>
                        <MenuItem value="udp">UDP</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Classifier</InputLabel>
                      <Select
                        value={classifier}
                        label="Classifier"
                        onChange={(e) => setClassifier(e.target.value)}
                        required
                        disabled={loading || backendStatus !== 'connected'}
                        sx={{ bgcolor: 'background.paper' }}
                      >
                        <MenuItem value="0">K-Nearest Neighbors (KNN)</MenuItem>
                        <MenuItem value="1">Decision Tree</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {backendStatus === 'checking' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                    <CircularProgress size={20} />
                    <Typography>Checking backend connection...</Typography>
                  </Box>
                )}

                {backendStatus === 'disconnected' && (
                  <Alert severity="error" sx={{ my: 2 }}>
                    Backend server is not running. Please start the backend server and refresh the page.
                  </Alert>
                )}

                {error && (
                  <Alert severity="error" sx={{ my: 2 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ my: 2 }}>
                    Training completed successfully!
                  </Alert>
                )}

                {loading && (
                  <Box sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {message}
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%' }}>
                      <CircularProgress 
                        variant="determinate" 
                        value={progress} 
                        size={60}
                        thickness={4}
                        sx={{ color: 'primary.main' }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" component="div" color="text.secondary">
                          {`${Math.round(progress)}%`}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading || backendStatus !== 'connected'}
                  sx={{ mt: 3 }}
                  startIcon={<TrainIcon />}
                >
                  {loading ? 'Training in Progress...' : 'Start Training'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Info Panel */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
            <CardHeader
              title="Training Information"
              subheader="About the training process"
              sx={{ 
                bgcolor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider'
              }}
            />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Protocol Selection"
                    secondary="Choose between ICMP, TCP SYN, or UDP protocols for training"
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon>
                    <PsychologyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Classifier Types"
                    secondary="KNN for pattern recognition or Decision Tree for rule-based classification"
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon>
                    <SpeedIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Training Process"
                    secondary="Real-time progress tracking with detailed status updates"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Train; 