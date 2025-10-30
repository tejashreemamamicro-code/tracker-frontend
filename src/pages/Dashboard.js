import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Box, Button, Card, CircularProgress, Input, Grid, Menu, MenuItem, IconButton } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from '@mui/icons-material/Close';
import { Table as AntdTable } from "antd";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { API_BASE_URL } from '../ApiConstant';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import GlobalState from '../GlobalState';

// --- status color map for maps ---
const statusColorMap = {
    login: "#007bff",
    logout: "#1976d2",
    auto: "#009688",
    static: "#FF5733",
    Current: "#00bd28"
};

export default function Dashboard({ user }) {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [loadingLeaves, setLoadingLeaves] = useState(false);
    const [leavesSearch, setLeavesSearch] = useState("");
    const [openMapFor, setOpenMapFor] = useState(null);
    const [locationData, setLocationData] = useState(null);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [myLocation, setMyLocation] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const navigate = useNavigate();
    const [state] = useContext(GlobalState);

    // --- Logged Users (Table 1) ---
    useEffect(() => {
        console.log("statestatestatestate", state)
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setMyLocation([pos.coords.latitude, pos.coords.longitude]),
                () => setMyLocation(null),
                { enableHighAccuracy: true }
            );
        }
        fetchLoggedUsers();
        fetchPendingLeaves();
        // eslint-disable-next-line
    }, []);

    const fetchLoggedUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await axios.get(API_BASE_URL + "/logged-in-users");
            setUsers(res.data || []);
            setFilteredUsers(res.data || []);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        if (!query) {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(
                (u) =>
                    u.first_name.toLowerCase().includes(query) ||
                    u.last_name?.toLowerCase().includes(query) ||
                    u.email?.toLowerCase().includes(query)
            );
            setFilteredUsers(filtered);
        }
    };

    const openMenu = (event, userId) => {
        setAnchorEl(event.currentTarget);
        setSelectedUserId(userId);
    };

    const closeMenu = () => {
        setAnchorEl(null);
        setSelectedUserId(null);
    };

    const handleCurrentLocation = async () => {
        closeMenu();
        if (!selectedUserId) return;
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const latitude = pos.coords.latitude;
                const longitude = pos.coords.longitude;
                try {
                    await axios.post(API_BASE_URL + "/location-point", {
                        user_id: selectedUserId,
                        status: "Current",
                        latitude,
                        longitude
                    });
                    await fetchLocationsFor(selectedUserId);
                    setOpenMapFor(selectedUserId);
                } catch (err) {
                    alert("Failed to save current location.");
                }
            }, () => {
                alert("Unable to fetch current location.");
            }, { enableHighAccuracy: true });
        } else {
            alert("Geolocation not available.");
        }
    };

    const fetchLocationsFor = async (userId) => {
        setLoadingLocations(true);
        setOpenMapFor(userId);
        try {
            const res = await axios.get(API_BASE_URL + '/employee/' + userId + '/location');
            setLocationData(res.data);
        } finally {
            setLoadingLocations(false);
        }
    };

    const closeMap = () => {
        setOpenMapFor(null);
        setLocationData(null);
    };

    // --- Map logic, unchanged ---
    function getPointPopup(point) {
        let content = [];
        content.push(<div><strong>Status:</strong> {point.status}</div>);
        content.push(<div><strong>Datetime:</strong> {new Date(point.datetime).toLocaleString()}</div>);
        content.push(<div><strong>Latitude:</strong> {point.latitude}</div>);
        content.push(<div><strong>Longitude:</strong> {point.longitude}</div>);
        if (point.status === "static" && point.duration) {
            content.push(<div><strong>Duration (sec):</strong> {point.duration}</div>);
            if (point.takentime) content.push(<div><strong>Takentime:</strong> {point.takentime}</div>);
            if (point.starttime) content.push(<div><strong>Start:</strong> {point.starttime}</div>);
            if (point.reachedtime) content.push(<div><strong>Reached:</strong> {point.reachedtime}</div>);
        }
        return <Popup>{content}</Popup>;
    }

    const renderMap = () => {
        if (!locationData || !locationData.raw || locationData.raw.length === 0) {
            return <Box>No location data available</Box>;
        }
        const logs = locationData.raw;
        const currentPoint = logs.find(l => l.status === "Current");
        const login = logs.find(l => l.status === "login");
        const center = currentPoint
            ? [currentPoint.latitude, currentPoint.longitude]
            : (login ? [login.latitude, login.longitude] : (myLocation || [12.9716, 77.5946]));

        return (
            <MapContainer center={center} zoom={15} style={{ height: "70vh", width: "100%" }}>
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polyline
                    positions={logs.map(l => [l.latitude, l.longitude])}
                    pathOptions={{ color: "#a7a7a7", weight: 2, dashArray: '6 6' }}
                />
                {logs.map((point, idx) => (
                    <CircleMarker
                        key={`raw-${idx}-${point.status}`}
                        center={[point.latitude, point.longitude]}
                        radius={point.status === "login" || point.status === "logout" ? 10 : point.status === "Current" ? 14 : 6}
                        pathOptions={{ color: statusColorMap[point.status] || "#444" }}
                        fillOpacity={0.9}
                    >
                        {getPointPopup(point)}
                    </CircleMarker>
                ))}
            </MapContainer>
        );
    };

    const fetchPendingLeaves = async () => {
        setLoadingLeaves(true);
        try {
            const response = await axios.get(API_BASE_URL + "/pending-leaves");
            console.log("respomse", response.data);
            setPendingLeaves(response.data || []);
        } finally {
            setLoadingLeaves(false);
        }
    };

    const handleApprove = async (leaveInfo) => {
        try {
            console.log("employeeId", leaveInfo)
            await axios.post(API_BASE_URL + "/approve-leave", {
                id: leaveInfo.log_id,
                employee_id: leaveInfo.employee_id,
                leave_id: leaveInfo.leave_id,
                approvedby: state?.loggedUser,
            });
            fetchPendingLeaves();
        } catch (err) {
            alert("Error approving leave: " + (err?.response?.data?.message || err.message));
        }
    };

    const leaveColumns = [
        {
            title: "Employee",
            dataIndex: "employee_name",
            key: "employee_name"
        },
        {
            title: "From",
            key: "from_date",
            render: (_, record) => record.leave?.[0]?.from_date || ""
        },
        {
            title: "To",
            key: "to_date",
            render: (_, record) => record.leave?.[0]?.to_date || ""
        },
        {
            title: "Reason",
            key: "reason",
            render: (_, record) => record.leave?.[0]?.reason || ""
        },
        {
            title: "Status",
            key: "status",
            render: (_, record) =>
                <span style={{ color: "#FF9800" }}>{record.leave?.[0]?.status || ""}</span>
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => {
                const leave = record.leave?.[0];
                return leave && leave.status === "pending" ? (
                    <IconButton
                        color="success"
                        aria-label="Approve"
                        onClick={() => handleApprove({
                            log_id: record.id,
                            employee_id: record.employee_id || record.user_id,
                            leave_id: leave.leave_id,
                            ...leave
                        })}
                    >
                        <ThumbUpOffAltIcon style={{ color: "#2e7d32" }} />
                    </IconButton>
                ) : "—";
            }
        }
    ];

    const columns = [
        {
            title: 'Name',
            dataIndex: 'first_name',
            key: 'name',
            render: (text, record) => <span>{record.first_name} {record.last_name || ''}</span>
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Active',
            dataIndex: 'active',
            key: 'active',
            render: (active) => <span>{active ? 'Yes' : 'No'}</span>
        },
        {
            title: 'Actions',
            key: 'action',
            render: (_, record) => (
                <span>
                    <Button variant="contained" color="primary" onClick={(e) => openMenu(e, record.id)}>
                        Actions
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && selectedUserId === record.id}
                        onClose={closeMenu}
                    >
                        <MenuItem onClick={handleCurrentLocation}>Current Location</MenuItem>
                        <hr />
                        <MenuItem onClick={() => fetchLocationsFor(record.id)}>Fetch Location</MenuItem>
                        <hr />
                        <MenuItem onClick={() => navigate('/log/' + record.id)}>Log</MenuItem>
                    </Menu>
                </span>
            ),
        },
    ];

    return (
        <Box style={{ backgroundColor: "white", padding: "20px", overflowY: "auto", borderRadius: "10px", minHeight: "100vh" }}>
            <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                        <h2>Dashboard</h2>
                        {myLocation ? (
                            <div>My location: {myLocation[0].toFixed(4)}, {myLocation[1].toFixed(4)}</div>
                        ) : (
                            <div>Location not available</div>
                        )}
                    </div>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                    <Card type="inner" title="Logged-In Users List (Today)" style={{ padding: "20px" }}>
                        <Input
                            placeholder="Search by name, email"
                            value={searchQuery}
                            onChange={handleSearch}
                            style={{ marginBottom: 20, width: 300 }}
                        />
                        {loadingUsers ? <CircularProgress /> : (
                            <AntdTable
                                dataSource={filteredUsers}
                                columns={columns}
                                rowKey="id"
                                pagination={{ pageSize: 5 }}
                            />
                        )}
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                    <Card type="inner" title="Pending Leaves (Requires Approval)" style={{ padding: "20px" }}>
                        <Input
                            placeholder="Search by employee, state, district, reason"
                            value={leavesSearch}
                            onChange={(e) => setLeavesSearch(e.target.value)}
                            style={{ marginBottom: 20, width: 300 }}
                        />
                        {loadingLeaves ? <CircularProgress /> : (
                            <AntdTable
                                dataSource={pendingLeaves}
                                columns={leaveColumns}
                                rowKey={record => record.leave?.[0]?.leave_id || record.id}
                                pagination={{ pageSize: 8 }}
                            />
                        )}
                    </Card>
                </Grid>
            </Grid>
            <Dialog open={!!openMapFor} onClose={closeMap} maxWidth="xl" fullWidth>
                <DialogTitle>
                    Employee Movement & Stops
                    <IconButton
                        aria-label="close"
                        onClick={closeMap}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {loadingLocations ? <CircularProgress /> : renderMap()}
                </DialogContent>
            </Dialog>
        </Box>
    );
}
