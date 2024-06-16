import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, TextField, Typography, Box, Grid, FormHelperText, ButtonGroup, Divider } from '@mui/material';
import { DateTime } from 'luxon';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import ActivityList from './ActivityList';
import WarningDialog from './WarningDialog';
import { Activity, Session, defaultNewSession } from '../../types';

const SessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const sessions = useSelector((state: RootState) => state.sessions.sessions);
  const [sessionData, setSessionData] = useState<Session>(defaultNewSession());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [saveConfirmed, setSaveConfirmed] = useState(false);

  useEffect(() => {
    if (id === 'new') {
      setSessionData(defaultNewSession());
    } else {
      const session = sessions.find(s => s.id === Number(id));
      if (session) setSessionData(session);
    }
  }, [id, sessions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSessionData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleActivityChange = (updatedActivity: Activity) => {
    setSessionData(prevState => ({
      ...prevState,
      activities: prevState.activities.map(activity =>
        activity.id === updatedActivity.id ? updatedActivity : activity
      )
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const newWarnings: string[] = [];

    if (!sessionData.date) {
      newErrors.date = 'Session date is required';
    } else {
      const sessionDate = DateTime.fromISO(sessionData.date);
      if (sessionDate > DateTime.now()) {
        newErrors.date = 'Date cannot exceed today';
      } else {
        const now = DateTime.now();
        const monthsDifference = now.diff(sessionDate, 'months').months;
        if (monthsDifference > 6) {
          newWarnings.push('Date is over 6 months ago (often accidental year)');
        }
      }
    }

    if (sessionData.activities.length === 0) {
      newErrors.activities = 'At least one activity is required';
    }

    sessionData.activities.forEach((activity, index) => {
      if (!activity.name) {
        newErrors[`activity-name-${index}`] = 'Activity name is required';
      }
      if (!activity.startTime) {
        newErrors[`activity-startTime-${index}`] = 'Start time is required';
      }
      if (!activity.endTime) {
        newErrors[`activity-endTime-${index}`] = 'End time is required';
      }
      if (activity.intensities.fingers < 0 || activity.intensities.fingers > 10) {
        newErrors[`activity-intensities-${index}`] = 'Intensity must be between 0 and 10';
      }
      if (DateTime.fromISO(activity.startTime) >= DateTime.fromISO(activity.endTime)) {
        newErrors[`activity-time-${index}`] = 'Start time must be earlier than end time';
      }
      if (DateTime.fromISO(activity.endTime).diff(DateTime.fromISO(activity.startTime), 'hours').hours > 2) {
        newWarnings.push('Activity duration is longer than 2 hours (often an accidental am/pm)');
      }
      if (
        activity.intensities.fingers === 0 &&
        activity.intensities.upperBody === 0 &&
        activity.intensities.lowerBody === 0
      ) {
        newErrors[`activity-all-intensities-${index}`] = 'All intensities cannot be zero';
      }
    });

    setErrors(newErrors);
    setWarnings(newWarnings);
    return { valid: Object.keys(newErrors).length === 0, hasWarnings: newWarnings.length > 0 };
  };

  const handleSaveConfirmation = (confirm: boolean) => {
    setShowWarningDialog(false);
    if (confirm) {
      setSaveConfirmed(true);
    }
  };

  useEffect(() => {
    if (saveConfirmed) {
      // Save session logic
      // send the session to DB - get ids back
      // dispatch session to Redux w/ new ids
      setSaveConfirmed(false);
      navigate('/dashboard');
    }
  }, [saveConfirmed, navigate, sessionData]);

  const saveSession = () => {
    setErrors({});
    setWarnings([]);
    const { valid, hasWarnings } = validateForm();
    if (valid) {
      if (hasWarnings) {
        setShowWarningDialog(true);
      } else {
        setSaveConfirmed(true);
      }
    }
  };

  const deleteSession = () => {
    // Delete session logic
    navigate(-1);
  };

  if (!sessionData) {
    return <div>Loading session data...</div>;
  }

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12} md={4}>
          <Box component="form" noValidate autoComplete="off">
            <Typography variant="h4">{id === 'new' ? 'New Session' : 'Edit Session'}</Typography>
            <TextField
              label="Date"
              name="date"
              type="date"
              value={DateTime.fromISO(sessionData.date).toFormat('yyyy-MM-dd')}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!errors.date}
              helperText={errors.date}
              sx={{ mt: '8px', mb: '4px' }}
            />
            <TextField
              label="Name"
              name="name"
              value={sessionData.name}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              sx={{ mt: '8px', mb: '4px' }}
            />
            <TextField
              label="Session Notes"
              name="notes"
              value={sessionData.notes}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              sx={{ mt: '8px', mb: '4px' }}
            />
            <ActivityList
              activities={sessionData.activities}
              setActivities={(activities) => setSessionData({ ...sessionData, activities })}
              onActivityChange={handleActivityChange}
              errors={errors}
            />
            {warnings.length > 0 && (
              <Box my={2}>
                {warnings.map((warning, index) => (
                  <FormHelperText key={index} error>
                    {warning}
                  </FormHelperText>
                ))}
              </Box>
            )}
            <ButtonGroup variant="contained" fullWidth sx={{ marginTop:1 }}>
              <Button onClick={saveSession} color="primary">Save</Button>
              {id === 'new' ? (
                <Button onClick={() => navigate(-1)} color="secondary">Cancel</Button>
              ) : (
                <Button onClick={deleteSession} color="secondary">Delete</Button>
              )}
            </ButtonGroup>
          </Box>
        </Grid>
        <Grid item md={8} sx={{ display: { xs: 'none', md: 'block' } }}>
          {/* <SessionGantt data={sessionData.activities} /> */}
        </Grid>
      </Grid>
      <WarningDialog
        open={showWarningDialog}
        warnings={warnings}
        onClose={handleSaveConfirmation}
      />
    </>
  );
};

export default SessionPage;
