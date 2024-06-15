import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Box, Grid } from '@mui/material';
import ActivityList from './ActivityList';
import { Session, defaultNewSession } from '../../types';
import SessionGantt from '../charts/SessionGantt';

// Session creation/editing form - additional visualizations for desktop
const SessionPage = ({ session }: { session?: Session }) => {
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<Session>(session || defaultNewSession);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSessionData({ ...sessionData, [name]: value });
  };

  const saveSession = () => {
    // Logic to save session data
  };

  const deleteSession = () => {
    // Logic to delete session
    navigate(-1);
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={4}>
        <Box component="form" noValidate autoComplete="off" >
          <Typography variant="h4">{session ? 'Edit Session' : 'New Session'}</Typography>
          <TextField
            label="Date"
            name="date"
            type="date"
            value={sessionData.date}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            sx={{ mt:'8px', mb:'4px' }}
          />
          <TextField
            label="Name"
            name="name"
            value={sessionData.name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            sx={{ mt:'8px', mb:'4px' }}
          />
          <TextField
            label="Session Notes"
            name="notes"
            value={sessionData.notes}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            sx={{ mt:'8px', mb:'4px' }}
          />
          <ActivityList activities={sessionData.activities} setActivities={(activities) => setSessionData({ ...sessionData, activities })} />
          <Button onClick={saveSession} variant="contained" color="primary">Save</Button>
          {session && <Button onClick={deleteSession} variant="contained" color="secondary">Delete</Button>}
          {!session && <Button onClick={() => navigate(-1)} variant="contained" color="secondary">Cancel</Button>}
        </Box>
      </Grid>
      <Grid item md={8} sx={{ display: { xs: 'none', md: 'block' } }}>
        {/* <SessionGantt data={sessionData.activities} /> */}
      </Grid>
    </Grid>
  );
};

export default SessionPage;
