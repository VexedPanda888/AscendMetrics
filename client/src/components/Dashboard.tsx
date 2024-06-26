import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import ReadinessTile from './ReadinessTile';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import TileTrainingSession from './TileTrainingSession';
import { BarChart, LineChart } from '@mui/x-charts';
import NewSessionButton from './NewSessionButton';
import { RootState } from '../store/store'; 
import { Session } from '../types';
import { useSelector } from 'react-redux';

// Landing page after logging in - surface level information about your Readiness, Past Sessions, and Visualizations for trends in past month
const Dashboard: React.FC = () => {
    const sessions = useSelector((state: RootState) => state.sessions.sessions);

    return (
        <div>
            <Grid container spacing={2} sx={{ minHeight: '90vh' }}>
                <Grid xs={12} md={4}>
                    <DashboardColumn>
                        <Stack direction='column' width={'100%'}>
                            <NewSessionButton/>
                            <ReadinessTile>Fingers and Forearms</ReadinessTile>
                            <ReadinessTile>Upper Body</ReadinessTile>
                            <ReadinessTile>Lower Body</ReadinessTile>
                        </Stack>
                    </DashboardColumn>
                </Grid>
                <Grid xs={12} md={4}>
                    <DashboardColumn>
                        <Typography variant='h5' >Past Training Sessions</Typography>
                        <Stack width={'100%'}>
                        {sessions.map((session: Session) => (
                            <TileTrainingSession key={session.id} session={session} />
                        ))}
                        </Stack>
                    </DashboardColumn>
                </Grid>
                <Grid xs={12} md={4}>
                    <DashboardColumn>
                        <Typography variant='h5'>Visualizations</Typography>
                        <Stack width={'100%'}>
                            <BarChart
                                xAxis={[{ scaleType: 'band', data: ['group A', 'group B', 'group C'] }]}
                                series={[{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]}
                                height={300}
                            />
                            <LineChart
                                xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                                series={[
                                    {
                                    data: [2, 5.5, 2, 8.5, 1.5, 5],
                                    },
                                ]}
                                height={300}
                            />
                        </Stack>
                    </DashboardColumn>
                </Grid>
            </Grid>
        </div>
    );
}

export default Dashboard;


interface DashboardColumnProps {
    children: React.ReactNode; // Specifying that children must be a string
}

const DashboardColumn: React.FC<DashboardColumnProps> = ({children}) => {
    return (
        <Box sx={{
            height: '100%',
            width: '100%',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {children}
        </Box>
    );
};