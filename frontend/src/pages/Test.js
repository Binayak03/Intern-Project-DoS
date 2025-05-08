import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Grid,
  Slider,
  Tooltip,
  IconButton,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Container,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import TrainIcon from '@mui/icons-material/Train';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import BugReportIcon from '@mui/icons-material/BugReport';
import axios from 'axios';

const protocolAttributes = {
  icmp: [
    { name: 'duration', label: 'Duration', min: 0, max: 100, step: 1, description: 'Connection duration in seconds' },
    { name: 'src_bytes', label: 'Source Bytes', min: 0, max: 1500, step: 1, description: 'Number of data bytes from source to destination' },
    { name: 'wrong_fragment', label: 'Wrong Fragments', min: 0, max: 5, step: 1, description: 'Number of wrong fragments' },
    { name: 'count', label: 'Count', min: 0, max: 100, step: 1, description: 'Number of connections to the same host' },
    { name: 'urgent', label: 'Urgent', min: 0, max: 10, step: 1, description: 'Number of urgent packets' },
    { name: 'num_compromised', label: 'Compromised', min: 0, max: 10, step: 1, description: 'Number of compromised conditions' },
    { name: 'srv_count', label: 'Service Count', min: 0, max: 100, step: 1, description: 'Number of connections to the same service' },
  ],
  tcp_syn: [
    { name: 'service', label: 'Service', min: -1, max: 1, step: 0.1, description: 'Service type (normalized)' },
    { name: 'count', label: 'Count', min: 0, max: 500, step: 1, description: 'Number of connections to the same host' },
    { name: 'srv_count', label: 'Service Count', min: 0, max: 150, step: 1, description: 'Number of connections to the same service' },
    { name: 'src_bytes', label: 'Source Bytes', min: 0, max: 1000, step: 1, description: 'Number of data bytes from source to destination' },
    { name: 'serror_rate', label: 'Error Rate', min: 0, max: 1, step: 0.1, description: 'Percentage of connections with SYN errors' },
  ],
  udp: [
    { name: 'dst_bytes', label: 'Destination Bytes', min: 0, max: 1000, step: 1, description: 'Number of data bytes from destination to source' },
    { name: 'service', label: 'Service', min: -1, max: 1, step: 0.1, description: 'Service type (normalized)' },
    { name: 'src_bytes', label: 'Source Bytes', min: 0, max: 1000, step: 1, description: 'Number of data bytes from source to destination' },
    { name: 'dst_host_srv_count', label: 'Host Service Count', min: 0, max: 500, step: 1, description: 'Number of connections to the same service as the current connection' },
    { name: 'count', label: 'Count', min: 0, max: 500, step: 1, description: 'Number of connections to the same host' },
  ],
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 5000, // 5 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

const Test = () => {
  const [protocol, setProtocol] = useState('');
  const [attributes, setAttributes] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Enhanced backend status check
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get('/health');
        if (response.data.status === 'ok') {
          setBackendStatus('connected');
          setError(null); // Clear any previous errors
        } else {
          setBackendStatus('disconnected');
          setError('Backend server is not responding correctly. Please check the server status.');
        }
      } catch (err) {
        console.error('Backend connection error:', err);
        setBackendStatus('disconnected');
        setError('Backend server is not running. Please start the backend server and refresh the page.');
      }
    };

    // Check immediately
    checkBackend();

    // Set up periodic checking every 10 seconds (increased from 5)
    const interval = setInterval(checkBackend, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleProtocolChange = (e) => {
    const newProtocol = e.target.value;
    setProtocol(newProtocol);
    // Initialize attributes for the selected protocol
    const initialAttributes = {};
    protocolAttributes[newProtocol].forEach((attr) => {
      initialAttributes[attr.name] = attr.min;
    });
    setAttributes(initialAttributes);
    setShowPresets(false);
  };

  const handleAttributeChange = (name, value) => {
    setAttributes((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSliderChange = (name, value) => {
    setAttributes((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Enhanced error handling for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!protocol) {
      setError('Please select a protocol first');
      return;
    }

    if (backendStatus !== 'connected') {
      setError('Backend server is not running. Please start the backend server and refresh the page.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/test', {
        protocol,
        attributes: Object.values(attributes).map(Number),
      }, {
        timeout: 10000 // Increased timeout to 10 seconds
      });

      if (response.data.status === 'success') {
        setResult(response.data.result);
      } else {
        setError(response.data.error || 'Error testing model');
      }
    } catch (err) {
      console.error('Error testing model:', err);
      if (err.code === 'ECONNREFUSED') {
        setError('Backend server is not running. Please start the backend server and refresh the page.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.response?.data?.error || 'Error testing model. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const startTraining = async () => {
    if (backendStatus !== 'connected') {
      setError('Backend server is not running. Please start the backend server and refresh the page.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/train', {
        protocol,
        classifier: '0' // Using KNN classifier
      });

      if (response.data.status === 'success') {
        // Start polling for progress
        const progressInterval = setInterval(async () => {
          try {
            const progressResponse = await api.get(`/progress/${protocol}`);
            if (progressResponse.data.status === 'success') {
              const { stage, percentage, message } = progressResponse.data;
              setResult(message);
              if (stage === 'complete' || stage === 'error') {
                clearInterval(progressInterval);
                setLoading(false);
                if (stage === 'error') {
                  setError(message);
                }
              }
            }
          } catch (err) {
            console.error('Error checking progress:', err);
            clearInterval(progressInterval);
            setLoading(false);
            setError('Error checking training progress');
          }
        }, 1000);
      } else {
        setError(response.data.error || 'Error starting training');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error starting training:', err);
      if (err.code === 'ECONNREFUSED') {
        setError('Backend server is not running. Please start the backend server and refresh the page.');
      } else {
        setError(err.response?.data?.error || 'Error starting training. Please try again.');
      }
      setLoading(false);
    }
  };

  const loadPreset = (preset) => {
    setAttributes(preset);
    setShowPresets(false);
  };

  const presets = {
    icmp: {
      normal: { duration: 0, src_bytes: 30, wrong_fragment: 0, count: 1, urgent: 0, num_compromised: 0, srv_count: 1 },
      attack: { duration: 0, src_bytes: 1000, wrong_fragment: 0, count: 50, urgent: 0, num_compromised: 0, srv_count: 50 },
    },
    tcp_syn: {
      normal: { service: -0.5, count: 1, srv_count: 1, src_bytes: 100, serror_rate: 0.0 },
      attack: { service: -0.5, count: 150, srv_count: 10, src_bytes: 0, serror_rate: 1.0 },
    },
    udp: {
      normal: { dst_bytes: 110, service: -0.5, src_bytes: 105, dst_host_srv_count: 254, count: 1 },
      attack: { dst_bytes: 500, service: -0.5, src_bytes: 500, dst_host_srv_count: 255, count: 500 },
    },
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
          <BugReportIcon fontSize="large" />
          Model Testing
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Test your trained models with custom network scenarios
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardHeader
              title="Test Configuration"
              subheader="Select protocol and adjust parameters"
              sx={{ 
                bgcolor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider'
              }}
            />
            <CardContent>
              {backendStatus === 'checking' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>Checking backend connection...</Typography>
                </Box>
              )}

              {backendStatus === 'disconnected' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Backend server is not running. Please start the backend server and refresh the page.
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Protocol</InputLabel>
                  <Select
                    value={protocol}
                    label="Protocol"
                    onChange={handleProtocolChange}
                    required
                    disabled={backendStatus !== 'connected'}
                    sx={{ bgcolor: 'background.paper' }}
                  >
                    <MenuItem value="icmp">ICMP</MenuItem>
                    <MenuItem value="tcp_syn">TCP SYN</MenuItem>
                    <MenuItem value="udp">UDP</MenuItem>
                  </Select>
                </FormControl>

                {protocol && backendStatus === 'connected' && (
                  <>
                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setShowPresets(!showPresets)}
                        disabled={loading}
                        startIcon={<SpeedIcon />}
                      >
                        {showPresets ? 'Hide Presets' : 'Show Presets'}
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={startTraining}
                        disabled={loading}
                        startIcon={<TrainIcon />}
                      >
                        Train Model
                      </Button>
                    </Stack>

                    {showPresets && (
                      <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle1" gutterBottom>Quick Presets</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Button
                              fullWidth
                              variant="outlined"
                              color="success"
                              onClick={() => loadPreset(presets[protocol].normal)}
                              startIcon={<CheckCircleIcon />}
                            >
                              Load Normal Traffic
                            </Button>
                          </Grid>
                          <Grid item xs={6}>
                            <Button
                              fullWidth
                              variant="outlined"
                              color="error"
                              onClick={() => loadPreset(presets[protocol].attack)}
                              startIcon={<WarningIcon />}
                            >
                              Load Attack Pattern
                            </Button>
                          </Grid>
                        </Grid>
                      </Paper>
                    )}

                    <Grid container spacing={3}>
                      {protocolAttributes[protocol].map((attr) => (
                        <Grid item xs={12} key={attr.name}>
                          <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography sx={{ flex: 1, fontWeight: 'medium' }}>
                                {attr.label}
                                <Tooltip title={attr.description}>
                                  <IconButton size="small">
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Typography>
                              <TextField
                                size="small"
                                type="number"
                                value={attributes[attr.name] || ''}
                                onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                                inputProps={{
                                  min: attr.min,
                                  max: attr.max,
                                  step: attr.step
                                }}
                                sx={{ width: 100 }}
                              />
                            </Box>
                            <Slider
                              value={attributes[attr.name] || attr.min}
                              onChange={(e, value) => handleSliderChange(attr.name, value)}
                              min={attr.min}
                              max={attr.max}
                              step={attr.step}
                              sx={{ mt: 1 }}
                            />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>

                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      disabled={loading}
                      sx={{ mt: 3 }}
                      startIcon={<SecurityIcon />}
                    >
                      Test Model
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Panel */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
            <CardHeader
              title="Results"
              subheader="Test and training results"
              sx={{ 
                bgcolor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider'
              }}
            />
            <CardContent>
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress />
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    Processing request...
                  </Typography>
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {result !== null && !loading && !error && (
                <Alert 
                  severity={result === 1 ? "error" : "success"} 
                  sx={{ mb: 2 }}
                  icon={result === 1 ? <SecurityIcon /> : <CheckCircleIcon />}
                >
                  <Typography variant="h6">
                    {result === 1 ? "Attack Detected!" : "Normal Traffic"}
                  </Typography>
                  <Typography variant="body2">
                    {result === 1 
                      ? "Potential security threat identified" 
                      : "No suspicious activity detected"}
                  </Typography>
                </Alert>
              )}

              {!loading && !error && result === null && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <SecurityIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Select a protocol and adjust parameters to start testing
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Test; 