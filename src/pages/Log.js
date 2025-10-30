import React, { useEffect, useState } from "react";
import { Box, Button, Grid } from "@mui/material";
import { DatePicker, message, Table, Spin, Space } from "antd";
import { useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { API_BASE_URL } from "../ApiConstant";
import { Card } from "antd";

const { RangePicker } = DatePicker;

export default function EmployeesList() {
    const params = useParams();

    // States for PDF Report
    const [pdfDates, setPdfDates] = useState([dayjs(), dayjs()]);

    // States for Logs Table
    const [logsDates, setLogsDates] = useState([dayjs(), dayjs()]);
    const [logsData, setLogsData] = useState([]);
    const [logSummary, setLogSummary] = useState({
        date_range: "",
        leaves_approved: 0,
        leaves_pending: 0,
    });
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        if (params.user_id) {
            fetchLogsData(logsDates);
        }
        // eslint-disable-next-line
    }, [params?.user_id]);

    const handlePdfDateChange = (values) => setPdfDates(values || [dayjs(), dayjs()]);
    const handleLogsDateChange = (values) => {
        setLogsDates(values || [dayjs(), dayjs()]);
        fetchLogsData(values || [dayjs(), dayjs()]);
    };

    const fetchLogsData = async (datePair) => {
        if (!params.user_id) return;
        const userId = Number(params.user_id);
        if (isNaN(userId)) {
            message.error("Invalid user ID");
            return;
        }
        const [from, to] = (datePair || []).map((d) => d.format("YYYY-MM-DD"));
        setLoadingLogs(true);
        try {
            const response = await axios.post(API_BASE_URL + "/employee-logs-data", {
                user_id: userId,
                from_date: from,
                to_date: to,
            });
            const { logs, date_range, leaves_approved, leaves_pending } = response.data;
            setLogsData(logs || []);
            setLogSummary({
                date_range: date_range || "",
                leaves_approved: leaves_approved || 0,
                leaves_pending: leaves_pending || 0,
            });
        } catch (error) {
            setLogsData([]);
            setLogSummary({ date_range: "", leaves_approved: 0, leaves_pending: 0 });
            message.error("Error loading logs");
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleGenerateReport = async () => {
        if (!params.user_id) {
            message.error("User ID missing from route params");
            return;
        }
        try {
            const userId = Number(params.user_id);
            if (isNaN(userId)) {
                message.error("Invalid user ID");
                return;
            }
            const [from, to] = pdfDates.map((d) => d.format("YYYY-MM-DD"));
            const requestData = {
                user_id: userId,
                from_date: from,
                to_date: to,
            };
            const response = await axios.post(API_BASE_URL + "/report", requestData, { responseType: "blob" });
            const file = new Blob([response.data], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, "_blank");
        } catch (error) {
            console.error("Error generating report", error);
            message.error("Failed to generate report");
        }
    };

    const columns = [
        { title: "Latitude", dataIndex: "latitude", key: "latitude" },
        { title: "Longitude", dataIndex: "longitude", key: "longitude" },
        { title: "Datetime", dataIndex: "datetime", key: "datetime" },
        { title: "Status", dataIndex: "status", key: "status" },
    ];

    return (
        <Box
            style={{
                backgroundColor: "white",
                padding: "20px",
                overflowY: "auto",
                borderRadius: "10px",
            }}
        >
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <Card type="inner" title="Employee Report">
                        <Space style={{ marginBottom: "5px" }}>
                            <RangePicker
                                value={pdfDates}
                                format="YYYY-MM-DD"
                                onChange={handlePdfDateChange}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleGenerateReport}
                            >
                                Generate Report
                            </Button>
                        </Space>
                    </Card>
                </Grid>
            </Grid>
            <br />
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <Card type="inner" title="Logs">
                        <Space style={{ marginBottom: "15px" }}>
                            <RangePicker
                                value={logsDates}
                                format="YYYY-MM-DD"
                                onChange={handleLogsDateChange}
                            />
                        </Space>
                        <Spin spinning={loadingLogs}>
                            <div style={{ marginBottom: 12 }}>
                                <b>Date Range:</b> {logSummary.date_range} &nbsp;&nbsp;
                                <b>Leaves Approved:</b> {logSummary.leaves_approved} &nbsp;&nbsp;
                                <b>Leaves Pending:</b> {logSummary.leaves_pending}
                            </div>
                            <Table
                                columns={columns}
                                dataSource={logsData}
                                rowKey={(r, i) => i}
                                pagination={{ pageSize: 10 }}
                                bordered
                            />
                        </Spin>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
