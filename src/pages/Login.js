import React, { useState, useContext } from "react";
import axios from "axios";
import { FormControl, InputLabel, OutlinedInput, Button, Card, CardContent, Grid, Alert, CircularProgress, Box } from '@mui/material';
import '../styles.css';
import { API_BASE_URL } from '../ApiConstant'
import GlobalState from '../GlobalState';

export default function Login({ setUser, locationAllowed, userLocation }) {
    const [loginDetails, setLoginDetails] = useState({});
    const [state, setState] = useContext(GlobalState);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!locationAllowed || !userLocation) return; // Extra safeguard

        setLoading(true);
        try {
            const response = await axios.post(API_BASE_URL + '/login', {
                ...loginDetails,
                latitude: userLocation.latitude,
                longitude: userLocation.longitude
            });

            // Save user info in your desired format/location
            state['loggedUser'] = response.data;
            setState({
                ...state,
                loggedUser: response.data,
            });
            sessionStorage.setItem("loggedUser", JSON.stringify(response.data));
            setUser(response.data);
        } catch (err) {
            console.error("Login error:", err);
            alert("Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginDetails(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleCancel = () => {
        setLoginDetails({});
    };

    // Button should be enabled if locationAllowed and userLocation exist and both fields filled
    const loginDisabled = !locationAllowed || !userLocation || !loginDetails.username || !loginDetails.password;

    return (
        <div className="login-container">
            <Card className="login-card">
                <CardContent>
                    <h2 className="login-heading">Login</h2>
                    {!locationAllowed && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Location permission is required to login. Please allow location permission in your browser.
                        </Alert>
                    )}
                    {locationAllowed && !userLocation && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            <span>Waiting for location coordinates...</span>
                        </Box>
                    )}
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel htmlFor="username">Username</InputLabel>
                        <OutlinedInput
                            id="username"
                            type="text"
                            name="username"
                            value={loginDetails.username || ""}
                            onChange={handleChange}
                            label="Username"
                            autoComplete="username"
                            disabled={loading}
                        />
                    </FormControl>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel htmlFor="password">Password</InputLabel>
                        <OutlinedInput
                            id="password"
                            type="password"
                            name="password"
                            value={loginDetails.password || ""}
                            onChange={handleChange}
                            label="Password"
                            autoComplete="current-password"
                            disabled={loading}
                        />
                    </FormControl>
                    <Grid container spacing={2} sx={{ mt: 2 }} justifyContent="center">
                        <Grid item>
                            <Button
                                variant="contained"
                                color="warning"
                                className="cancel-button"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                className="login-button"
                                onClick={handleLogin}
                                disabled={loginDisabled || loading}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </div>
    );
}
