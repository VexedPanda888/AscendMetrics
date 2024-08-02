import { IconButton, Drawer, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import QuizIcon from '@mui/icons-material/Quiz';
import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SessionIcon from '@mui/icons-material/EventNote'; // Example icon for "Sessions"
import { useNavigate } from 'react-router-dom';
import SignoutButton from '../auth/SignoutButton';
import UnderConstructionBadge from './UnderConstructionBadge';

const MyAppBar: React.FC = () => {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <AppBar position="static" sx={{ marginBottom:1, borderRadius: 1, boxShadow: "none", background: "linear-gradient(45deg, #7e57c2 30%, #3f51b5 90%)" }}>
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Ascend Metrics
                </Typography>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="end"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                >
                    <Button onClick={() => navigate('/dashboard')} sx={{ my: 1 }}>
                        Dashboard
                    </Button>
                    <Button onClick={() => navigate('/sessions')} sx={{ my: 1 }}>
                        Sessions
                    </Button>
                    <SignoutButton />
                </Drawer>
                <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' }, justifyContent: 'right' }}>
                    <Button color="inherit" startIcon={<DashboardIcon />} onClick={() => navigate('/dashboard')} sx={{ mx: 1 }}>
                        Dashboard
                    </Button>
                    <UnderConstructionBadge>
                        <Button color="inherit" startIcon={<SessionIcon />} onClick={() => navigate('/sessions/manage')} sx={{ mx: 1 }}>
                            Sessions
                        </Button>
                    </UnderConstructionBadge>
                    <UnderConstructionBadge>
                        <Button color="inherit" startIcon={<FitnessCenterIcon />} onClick={() => navigate('/sessions')} sx={{ mx: 1 }}>
                            Activities
                        </Button>
                    </UnderConstructionBadge>
                    <UnderConstructionBadge>
                        <Button color="inherit" startIcon={<QuizIcon />} onClick={() => navigate('/sessions')} sx={{ mx: 1 }}>
                            Calibration
                        </Button>
                    </UnderConstructionBadge>
                    <UnderConstructionBadge>
                        <Button color="inherit" startIcon={<BarChartIcon />} onClick={() => navigate('/sessions')} sx={{ mx: 1 }}>
                            Visualizations
                        </Button>
                    </UnderConstructionBadge>
                    <UnderConstructionBadge>
                        <Button color="inherit" startIcon={<CalendarMonthIcon />} onClick={() => navigate('/sessions')} sx={{ mx: 1 }}>
                            Planning
                        </Button>
                    </UnderConstructionBadge>
                    <UnderConstructionBadge>
                        <Button color="inherit" startIcon={<SettingsIcon />} onClick={() => navigate('/sessions')} sx={{ mx: 1 }}>
                            Settings
                        </Button>
                    </UnderConstructionBadge>
                    <SignoutButton />
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default MyAppBar;