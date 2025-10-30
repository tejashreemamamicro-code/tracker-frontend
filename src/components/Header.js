import React, { useState, useContext, useRef } from "react";
import { AppBar, Toolbar, IconButton, Box, Typography, Button, Menu, MenuItem, Chip, Avatar, Modal, TextField, Stack } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Profile from "../assets/Profile.png";
import GlobalState from '../GlobalState';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { API_BASE_URL } from '../ApiConstant'
import dayjs from "dayjs";
import { DatePicker } from "antd";
const { RangePicker } = DatePicker;

function Header({ handleDrawerToggle, setUser, handleLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveDates, setLeaveDates] = useState([]);
  const [leaveReason, setLeaveReason] = useState("");
  const [breakModalOpen, setBreakModalOpen] = useState(false);
  const [breakReason, setBreakReason] = useState("");
  const [breakOngoing, setBreakOngoing] = useState(false);

  const [state] = useContext(GlobalState);
  const navigate = useNavigate();

  const leaveModalRef = useRef(null);
  const breakModalRef = useRef(null); // <-- Fix here!

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogoutClick = async () => {
    await handleLogout();
    setAnchorEl(null);
    navigate("/");
  };

  const fullName =
    state?.loggedUser?.first_name +
    (state?.loggedUser?.middle_name ? " " + state?.loggedUser?.middle_name : "") +
    (state?.loggedUser?.last_name ? " " + state?.loggedUser?.last_name : "");

  // --- LEAVE LOGIC ---

  const handleLeaveSubmit = async () => {
    if (!state?.loggedUser?.id || !leaveDates[0] || !leaveDates[1] || !leaveReason.trim()) {
      alert("Please select leave dates and reason");
      return;
    }
    try {
      await axios.post(API_BASE_URL + "/add-leave", {
        user_id: state.loggedUser.id,
        from_date: leaveDates[0].format("YYYY-MM-DD"),
        to_date: leaveDates[1].format("YYYY-MM-DD"),
        reason: leaveReason.trim()
      });
      setLeaveModalOpen(false);
      setLeaveDates([]);
      setLeaveReason("");
      alert("Leave request submitted!");
    } catch (e) {
      alert("Error submitting leave");
    }
  };

  // --- BREAK LOGIC ---

  const handleStartBreak = async () => {
    if (!state?.loggedUser?.id || !breakReason.trim()) {
      alert("Please enter a reason");
      return;
    }
    try {
      const now = dayjs();
      await axios.post(API_BASE_URL + "/add-break", {
        user_id: state.loggedUser.id,
        reason: breakReason.trim(),
        startdatetime: now.format("YYYY-MM-DD HH:mm:ss"),
        enddatetime: null
      });
      setBreakModalOpen(false);
      setBreakReason("");
      setBreakOngoing(true);
      alert("Break started!");
    } catch (e) {
      alert("Error starting break");
    }
  };

  const handleEndBreak = async () => {
    if (!state?.loggedUser?.id) {
      alert("No user");
      return;
    }
    try {
      const now = dayjs();
      await axios.post(API_BASE_URL + "/end-break", {
        user_id: state.loggedUser.id,
        enddatetime: now.format("YYYY-MM-DD HH:mm:ss")
      });
      setBreakOngoing(false);
      alert("Break ended!");
    } catch (e) {
      alert("Error ending break");
    }
  };

  const handleEditProfile = () => {
    console.log("state.loggedUser.id", state.loggedUser.id)
    navigate('/user-details/' + state.loggedUser.id);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "white",
          color: "black",
        }}
      >
        <Toolbar sx={{ minHeight: 80, display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 1,
                bgcolor: "#ede7f6",
                color: "#5e35b1",
                "&:hover": { bgcolor: "#5e35b1", color: "#fff" },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Typography
            variant="h4"
            component="div"
            sx={{
              flexGrow: 1,
              textAlign: "center",
              fontFamily: "Georgia, serif",
            }}
          >
            <Box component="span" sx={{ fontWeight: 700 }}>
              Project
            </Box>
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setLeaveModalOpen(true)}
            >
              Leave
            </Button>
            {!breakOngoing ? (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setBreakModalOpen(true)}
              >
                Break
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                onClick={handleEndBreak}
              >
                End Break
              </Button>
            )}
            <Chip
              avatar={<Avatar src={Profile} alt="Profile" />}
              label={fullName}
              onClick={handleMenuClick}
              sx={{
                cursor: "pointer",
                bgcolor: "#fff",
                color: "primary.main",
                fontWeight: 'bold',
                border: "2px solid #3a57e8",
                "&:hover": { bgcolor: "#d7ddfa" },
                height: "40px",
                borderRadius: "20px",
              }}
            />
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{ mt: "5px" }}
            >
              <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
              <hr />
              <MenuItem onClick={handleEditProfile}>Edit Profile</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Leave Modal */}
      <Modal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        aria-labelledby="leave-modal-title"
        aria-describedby="leave-modal-description"
      >
        <Box
          ref={leaveModalRef}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
            minHeight: 250,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography id="leave-modal-title" variant="h6" component="h2">
            Request Leave
          </Typography>
          {/* Render picker in the modal, not at body level */}
          <RangePicker
            allowClear
            style={{ width: "100%" }}
            value={leaveDates}
            format="YYYY-MM-DD"
            onChange={setLeaveDates}
            getPopupContainer={() => leaveModalRef.current}
          />
          <TextField
            label="Reason"
            value={leaveReason}
            onChange={e => setLeaveReason(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => setLeaveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleLeaveSubmit}>
              Submit
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Break Modal */}
      <Modal
        open={breakModalOpen}
        onClose={() => setBreakModalOpen(false)}
        aria-labelledby="break-modal-title"
        aria-describedby="break-modal-description"
      >
        <Box
          ref={breakModalRef}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
            minHeight: 180,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography id="break-modal-title" variant="h6" component="h2">
            Start Break
          </Typography>
          <TextField
            label="Reason"
            value={breakReason}
            onChange={e => setBreakReason(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => setBreakModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleStartBreak}>
              Start Break
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}

export default Header;
