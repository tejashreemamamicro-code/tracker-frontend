import React, { useState, useEffect, useContext, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Header from "./components/Header";
import LeftMenu from "./components/LeftMenu";
import RolesPermissions from "./components/RolesPermissions";
import Dashboard from "./pages/Dashboard";
import EmployeesList from "./pages/EmployeesList";
import UserDetails from "./pages/UserDetails";
import Log from "./pages/Log";
import Login from './pages/Login';
import GlobalState from './GlobalState';
import axios from "axios";
import { API_BASE_URL, API_REQUEST_HEADER } from './ApiConstant'

const theme = createTheme();

function getStoredUser() {
  const localUser = localStorage.getItem("loggedUser");
  if (localUser) {
    try { return JSON.parse(localUser); } catch (e) { return null; }
  }
  const sessionUser = sessionStorage.getItem("loggedUser");
  if (sessionUser) {
    try { return JSON.parse(sessionUser); } catch (e) { return null; }
  }
  return null;
}

function App() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [user, setUser] = useState(getStoredUser());
  const [state, setState] = useContext(GlobalState);
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [loginPageKey, setLoginPageKey] = useState(0);
  const locationIntervalRef = useRef(null);
  const locationTimeoutRef = useRef(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setState(prev => ({
        ...prev,
        loggedUser: storedUser,
      }));
    } else {
      setState(prev => ({
        ...prev,
        loggedUser: null,
      }));
    }
  }, [setState]);

  useEffect(() => {
    if (user) {
      const userStr = JSON.stringify(user);
      localStorage.setItem("loggedUser", userStr);
      sessionStorage.setItem("loggedUser", userStr);
      setState(prev => ({ ...prev, loggedUser: user }));
    } else {
      localStorage.removeItem("loggedUser");
      sessionStorage.removeItem("loggedUser");
      setState(prev => ({ ...prev, loggedUser: null }));
    }
  }, [user, setState]);

  useEffect(() => {
    if (!user) {
      setUserLocation(null);
      setLocationAllowed(false);
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            setLocationAllowed(true);
            setUserLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          },
          err => {
            setLocationAllowed(false);
            setUserLocation(null);
          },
          { enableHighAccuracy: true }
        );
      }
    }

    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
        locationTimeoutRef.current = null;
      }
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    };
  }, [loginPageKey, user]);

  useEffect(() => {
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = null;
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }

    if (user && locationAllowed && userLocation) {
      locationTimeoutRef.current = setTimeout(() => {
        navigator.geolocation.getCurrentPosition(pos => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ latitude, longitude });
          axios.post(
            API_BASE_URL + '/location-point',
            {
              user_id: user.id,
              status: 'auto',
              latitude: latitude,
              longitude: longitude,
            },
            API_REQUEST_HEADER
          );
        });

        locationIntervalRef.current = setInterval(() => {
          navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            setUserLocation({ latitude, longitude });
            axios.post(
              API_BASE_URL + '/location-point',
              {
                user_id: user.id,
                status: 'auto',
                latitude: latitude,
                longitude: longitude,
              },
              API_REQUEST_HEADER
            );
          });
        }, 2 * 60 * 1000);
      }, 2 * 60 * 1000);
    }

    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
        locationTimeoutRef.current = null;
      }
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    };
  }, [user, locationAllowed, userLocation]);

  const handleDrawerToggle = () => {
    setDrawerOpen(prev => !prev);
  };

  const handleLogout = async () => {
    let latitude = userLocation?.latitude || null;
    let longitude = userLocation?.longitude || null;

    if ("geolocation" in navigator) {
      await new Promise(resolve => {
        navigator.geolocation.getCurrentPosition((pos) => {
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
          resolve();
        }, resolve);
      });
    }

    sessionStorage.clear();
    localStorage.removeItem("loggedUser");
    setUser(null);
    setState({ loggedUser: null });
    setUserLocation(null);
    setLocationAllowed(false);

    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = null;
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }

    setLoginPageKey(key => key + 1);
  };

  function hasPermission(permission) {
    return state?.loggedUser?.roles?.some(role =>
      role.permissions.includes(permission)
    );
  }

  return user ? (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header handleDrawerToggle={handleDrawerToggle} setUser={setUser} handleLogout={handleLogout} />
        <Box sx={{ display: "flex" }}>
          <LeftMenu open={drawerOpen} setOpen={setDrawerOpen} hasPermission={hasPermission} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              mt: "64px",
              p: 2,
              borderRadius: "10px",
              background: "linear-gradient(to bottom, #d7ddfa, #dbf3f6)",
              height: "calc(100vh - 64px)",
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {hasPermission("EMPLOYEES LIST") && (
                <Route path="/employees-list" element={<EmployeesList />} />
              )}
              <Route path="/user-details" element={<UserDetails />} />
              <Route path="/user-details/:user_id" element={<UserDetails />} />
              <Route path="/roles-permissions" element={<RolesPermissions />} />
              <Route path="/log/:user_id" element={<Log />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  ) : (
    <Login
      key={loginPageKey}
      setUser={setUser}
      locationAllowed={locationAllowed}
      userLocation={userLocation}
    />
  );
}

export default App;
