import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <SecurityIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Network Security AI
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/train">
            Train Model
          </Button>
          <Button color="inherit" component={RouterLink} to="/test">
            Test Model
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/ip-checker"
            startIcon={<GppMaybeIcon />}
          >
            IP Checker
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Network Security AI
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 