import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, message, Spin } from "antd";
import { Box } from "@mui/material";
import { API_BASE_URL } from "../ApiConstant";

export default function EmployeesList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_BASE_URL + "/user");
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            message.error("Failed to fetch user list");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Employee Code",
            dataIndex: "employee_code",
            key: "employee_code",
            width: 120,
        },
        {
            title: "Name",
            key: "name",
            render: (record) => `${record.salutation || ""} ${record.first_name} ${record.middle_name || ""} ${record.last_name}`,
        },
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
            width: 120,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
            width: 120,
        },
        {
            title: "City",
            dataIndex: "city",
            key: "city",
            width: 120,
        },
        {
            title: "Country",
            dataIndex: "country",
            key: "country",
            width: 120,
        },
        {
            title: "Active",
            dataIndex: "active",
            key: "active",
            render: (val) => (val ? "Yes" : "No"),
            width: 80,
        },
    ];

    return (
        <Box
            sx={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "10px",
                overflowY: "auto",
            }}
        >
            <h2 style={{ marginBottom: 16 }}>Employee List</h2>
            {loading ? (
                <Spin tip="Loading users..." />
            ) : (
                <Table
                    dataSource={users}
                    columns={columns}
                    rowKey="id"
                    bordered
                    pagination={{ pageSize: 5 }}
                />
            )}
        </Box>
    );
}
