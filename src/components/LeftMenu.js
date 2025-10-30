import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
} from "@mui/material";
import {
  HomeOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import ReorderIcon from '@mui/icons-material/Reorder';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import { Link, useLocation } from "react-router-dom";

const drawerWidth = 240;
const minimizedWidth = 80;

function LeftMenu({ open, hasPermission }) {
  const location = useLocation();

  const menuItems = [
    { text: "Dashboard", path: "/dashboard", icon: <HomeOutlined /> },
    {
      text: "Employees List", path: "/employees-list", icon: <ReorderIcon />, permission: "EMPLOYEES LIST"
    },
    { text: "User Details", path: "/user-details", icon: <PersonIcon /> },
    { text: "Roles Permissions", path: "/roles-permissions", icon: <AdminPanelSettingsIcon /> },
  ];

  const getItemBoxStyles = (isActive, level = 1) => ({
    display: "flex",
    alignItems: "center",
    width: "100%",
    justifyContent: open ? "flex-start" : "center",
    px: open ? level * 2 : 0,
    py: 1,
    borderRadius: 1,
    bgcolor: isActive ? "#ede7f6" : "transparent",
    "&:hover": { bgcolor: "#ede7f6", cursor: "pointer" },
    color: isActive ? "#5e35b1" : "#364152",
  });

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : minimizedWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: open ? drawerWidth : minimizedWidth,
          boxSizing: "border-box",
          bgcolor: "white",
          top: "64px",
          borderRight: "none",
          overflowX: "hidden",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        },
      }}
    >
      <List>
        {menuItems.map((item) => {
          if (item.permission && !hasPermission(item.permission)) {
            return null;
          }
          return (
            <React.Fragment key={item.text}>
              <ListItem button component={Link} to={item.path} sx={{ py: 0, px: 0 }}>
                <Box sx={getItemBoxStyles(location.pathname === item.path, 1)}>
                  <ListItemIcon sx={{ minWidth: 40, justifyContent: "center", color: "inherit" }}>
                    {item.icon}
                  </ListItemIcon>
                  {open && <ListItemText primary={item.text} />}
                </Box>
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
    </Drawer>
  );
}

export default LeftMenu;
