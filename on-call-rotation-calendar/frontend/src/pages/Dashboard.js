import React from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';

function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Current Schedule" />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Month: July 2025
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: Active
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Collaborators: 8
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Today's Shifts" />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Morning: Luis Flores, Santiago Rivera
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Afternoon: Oscar Lopez
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Night: Edgar Pernalete
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Upcoming Events" />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Beatriz's Birthday: July 25
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Luis's Vacation: Aug 1-15
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This is a placeholder for the weekly schedule overview.
              In the actual implementation, this will show a mini calendar view
              of the current week's schedule.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Hours Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This is a placeholder for a chart showing hours distribution
              among collaborators for the current month.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Shift Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This is a placeholder for a chart showing shift type distribution
              (morning, afternoon, night) for the current month.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;