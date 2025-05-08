import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Container,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import TrainIcon from '@mui/icons-material/Train';
import BugReportIcon from '@mui/icons-material/BugReport';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: "Real-time Analysis",
      description: "Monitor and analyze network traffic in real-time using advanced AI algorithms",
      color: "primary.main"
    },
    {
      icon: <TrainIcon sx={{ fontSize: 40 }} />,
      title: "Train Models",
      description: "Train custom models for specific network security scenarios",
      color: "secondary.main"
    },
    {
      icon: <BugReportIcon sx={{ fontSize: 40 }} />,
      title: "Test Models",
      description: "Test your trained models with custom network scenarios",
      color: "error.main"
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ 
        bgcolor: 'background.paper',
        py: 8,
        mb: 4,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Chip 
                  icon={<ShieldIcon />} 
                  label="AI-Powered Security" 
                  color="primary" 
                  sx={{ width: 'fit-content' }}
                />
                <Typography variant="h2" component="h1" sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}>
                  Network Security AI
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                  Advanced AI-powered Network Security Analysis Platform
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Protect your network with state-of-the-art machine learning models trained to detect and prevent security threats in real-time.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/train')}
                    startIcon={<TrainIcon />}
                  >
                    Start Training
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/test')}
                    startIcon={<BugReportIcon />}
                  >
                    Test Models
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                position: 'relative',
                height: 400,
                bgcolor: 'background.default',
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AnalyticsIcon sx={{ fontSize: 200, color: 'primary.main', opacity: 0.1 }} />
                <Box sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <SpeedIcon sx={{ fontSize: 100, color: 'primary.main' }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h2" align="center" sx={{ 
          fontWeight: 'bold',
          mb: 4
        }}>
          Key Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card elevation={3} sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)'
                }
              }}>
                <CardContent sx={{ 
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 4
                }}>
                  <Box sx={{ 
                    color: feature.color,
                    mb: 2,
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'background.default'
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer Section */}
      <Box sx={{ 
        bgcolor: 'background.paper',
        py: 4,
        mt: 8,
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Network Security AI. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 