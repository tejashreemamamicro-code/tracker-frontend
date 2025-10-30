import { Spinner } from 'react-bootstrap'
import { Card, Button, Radio, Space } from 'antd'
import { useEffect, useState, useRef } from 'react';
import axios from "axios";
import { API_BASE_URL } from '../ApiConstant';
import { useNavigate, useParams } from 'react-router-dom';
import * as React from 'react';
import { Box, Divider, FormControl, InputLabel, MenuItem, Select, TextField, Stack, FormLabel, InputAdornment, IconButton } from '@mui/material';
import MandatoryIndicator from '../form-components/MandatoryIndicator';
import SimpleReactValidator from 'simple-react-validator';
import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import * as moment from 'moment';
import { useMask } from '@react-input/mask';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


const UserDetails = ({ }) => {
    const [user, setUser] = useState({});
    const params = useParams();
    const navigate = useNavigate();
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const validator = useRef(new SimpleReactValidator());
    const [, forceUpdate] = useState();
    const [loading, setLoading] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [mobileLength, setMobileLength] = useState(10);
    const [isValidPhoneNumber, setIsValidPhoneNumber] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        getCountries();
        console.log("params", params)
        if (params.user_id) {
            getUserById()
        }
    }, [])

    const mask = "_".repeat(mobileLength);

    const mobileRef = useMask({ mask: mask, replacement: { '_': /[0-9]/, }, placeholderChar: '_', lazy: false });

    const getCountries = async () => {
        const response = await axios.get(API_BASE_URL + '/countries');
        setCountries(response?.data)
    }

    const getStates = async (country) => {
        const response = await axios.get(API_BASE_URL + '/states/' + country);
        setStates(response?.data)
    }

    const getDistricts = async (state) => {
        const response = await axios.get(API_BASE_URL + '/districts/' + state);
        setDistricts(response?.data)
    }

    const getUserById = async () => {
        const response = await axios.get(API_BASE_URL + '/users/' + params?.user_id);
        if (response?.data) {
            if (response?.data?.country)
                getStates(response?.data?.country);
            if (response?.data?.state)
                getDistricts(response?.data?.state);
            setUser(response.data);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'country') {
            user['state'] = '';
            user['district'] = '';
            if (value === 'India') {
                getStates(value);
            } else {
                setStates([]);
                setDistricts([]);
            }
        }
        if (name === 'state') {
            user['district'] = '';
            if (user.country === 'India') {
                getDistricts(value);
            }
        }
        if (name === 'gender') {
            // Handle gender change
            setUser({ ...user, gender: value });
        } else if (name === 'phone_1') {
            if (value.length === mobileLength) {
                setIsValidPhoneNumber(true);
            } else {
                setIsValidPhoneNumber(false);
            }
        } else {
            // Update other fields
            setUser({ ...user, [name]: value });
        }
    };

    const addNewUser = async () => {
        if (validator.current.allValid()) {
            if (user.password !== user.repeat_password) {
                alert("Password and Confirm Password must match!");
                return;
            }
            setLoading(true);
            try {
                await axios.post(API_BASE_URL + '/user', user);
                setLoading(false);
                setUser({});
                setStates([]);
                setDistricts([]);
                setSelectedCountry(countries[0]);
                validator.current.hideMessages();
                navigate('/');
            } catch (error) {
                console.error("Error creating user:", error);
                setLoading(false);
            }
        } else {
            validator.current.showMessages();
            forceUpdate(1);
        }
    };

    // ==== UPDATE USER FUNCTION ====
    const updateUser = async () => {
        if (validator.current.allValid()) {
            setLoading(true);
            await axios.put(API_BASE_URL + '/updateUser/' + params?.user_id, user,);
            setLoading(false);
            navigate('/');
        }
        else {
            validator.current.showMessages();
            forceUpdate(1)
        }
    }
    // =============================

    const handleClose = () => {
        setUser({});
        setStates([]);
        setDistricts([]);
        setSelectedCountry(countries[0]);
        setIsValidPhoneNumber(true);
        validator.current.hideMessages();
        forceUpdate(1);
    };

    return (
        <>
            <div>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                        <Card type="inner" title={"Create User"}>
                            <div className="new-user-info">
                                <form>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                            <TextField id="first_name" label={<MandatoryIndicator label="First Name" isRequired={true} />} fullWidth variant="outlined" onChange={(e) => handleChange(e)} type="text" name={'first_name'}
                                                placeholder="First Name" value={user?.first_name ?? ''} />
                                            {validator?.current.message('first_name', user?.first_name, 'required|alpha_space|min:2', { className: 'text-danger' })}
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                            <TextField id="mname" label={"Middle Name"} fullWidth variant="outlined" onChange={(e) => handleChange(e)} type="text" name={'middle_name'}
                                                placeholder="Middle Name" value={user?.middle_name ?? ''} />
                                            {validator?.current.message('middle_name', user?.middle_name, 'alpha_space', { className: 'text-danger' })}
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                            <TextField id="lname" label="Last Name" fullWidth variant="outlined" onChange={(e) => handleChange(e)} type="text" name={'last_name'}
                                                placeholder="Last Name" value={user?.last_name ?? ''} />
                                            {validator?.current.message('last_name', user?.last_name, 'alpha_space', { className: 'text-danger' })}
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                            <TextField id="username" label="User Name" fullWidth variant="outlined" onChange={(e) => handleChange(e)} type="text" name={'username'}
                                                placeholder="User Name" value={user?.username ?? ''} />
                                            {validator.current.message('username', user?.username, 'required|regex:^[A-Za-z0-9]+$', { className: 'text-danger' })}
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                            <TextField
                                                id="password"
                                                fullWidth
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                label={<MandatoryIndicator label="Password" isRequired={true} />}
                                                value={user?.password ?? ''}
                                                onChange={handleChange}
                                                variant="outlined"
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            {validator.current.message('password', user?.password, 'required|min:6', { className: 'text-danger' })}
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                            <TextField
                                                id="repeat_password"
                                                fullWidth
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="repeat_password"
                                                label={<MandatoryIndicator label="Confirm Password" isRequired={true} />}
                                                value={user?.repeat_password ?? ''}
                                                onChange={handleChange}
                                                variant="outlined"
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            {validator.current.message('repeat_password', user?.repeat_password, 'required|min:6', { className: 'text-danger' })}
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                            <TextField id="employee_code" label="Employee Code" fullWidth variant="outlined" onChange={(e) => handleChange(e)} type="text" name={'employee_code'}
                                                placeholder="Employee Code" value={user?.employee_code ?? ''} />
                                            {validator.current.message('employee_code', user?.employee_code, 'required|regex:^[A-Za-z0-9]+$', { className: 'text-danger' })}
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                            <Stack spacing={1}>
                                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                                    <DatePicker
                                                        label="Date of Birth"
                                                        name="dob"
                                                        onChange={(newValue) =>
                                                            setUser({ ...user, ['dob']: moment(newValue).format('YYYY-MM-DD') })
                                                        }
                                                        format="DD-MM-YYYY"
                                                        value={user?.dob ? moment(user.dob, 'YYYY-MM-DD') : null}
                                                        slotProps={{
                                                            field: {
                                                                readOnly: true
                                                            }
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                            </ Stack>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                            <TextField
                                                inputRef={mobileRef}
                                                fullWidth
                                                id="phone"
                                                label={<MandatoryIndicator label="Mobile Number" isRequired={true} />}
                                                variant="outlined"
                                                onChange={(e) => handleChange(e)} type="text" name={'phone'}
                                                placeholder={"_".repeat(mobileLength)} value={user?.phone || ''} maxLength={selectedCountry?.mobile_length} />
                                            {selectedCountry && !isValidPhoneNumber && user.phone.length > 0 && (
                                                <p style={{ color: "red", marginTop: "4px" }}>
                                                    Please enter your {mobileLength} digits number.
                                                </p>
                                            )}
                                            {/* {validator?.current.message('phone_1', user?.phone_1, 'required|phone', { className: 'text-danger' })} */}
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                            <TextField
                                                inputRef={mobileRef}
                                                fullWidth
                                                id="alternate_contact"
                                                label="Alternate Contact"
                                                variant="outlined"
                                                onChange={(e) => handleChange(e)} type="text" name={'alternate_contact'}
                                                placeholder={"_".repeat(mobileLength)} value={user?.alternate_contact || ''} maxLength={selectedCountry?.mobile_length} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                            <TextField id="email" label={<MandatoryIndicator label="Email" isRequired={true} />} fullWidth variant="outlined" onChange={(e) => handleChange(e)} type="email" name={'email'}
                                                placeholder="email" value={user?.email ?? ''} />
                                            {validator?.current.message('email', user?.email, 'required|email', { className: 'text-danger' })}
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={6}>
                                            <div style={{ position: "relative" }}>
                                                <FormLabel
                                                    sx={{
                                                        display: "block",
                                                        marginBottom: "8px",
                                                    }}
                                                    id="demo-radio-buttons-group-label"
                                                >
                                                    <MandatoryIndicator label="Gender" isRequired={true} />
                                                </FormLabel>
                                                <div
                                                    style={{
                                                        position: "relative",
                                                        left: "24px",
                                                    }}
                                                >
                                                    <Radio.Group
                                                        name="gender"
                                                        onChange={handleChange}
                                                        value={user.gender}
                                                    >
                                                        <Space direction="horizontal">
                                                            <Radio key="Male" value="Male">Male</Radio>
                                                            <Radio key="Female" value="Female">Female</Radio>
                                                            <Radio key="Others" value="Others">Others</Radio>
                                                        </Space>
                                                    </Radio.Group>
                                                </div>

                                                <div style={{ marginLeft: "24px", marginTop: "4px" }}>
                                                    {validator?.current.message("status", user?.gender, "required", { className: "text-danger" })}
                                                </div>
                                            </div>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} >
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Divider sx={{ flex: 1, borderColor: "black" }} />
                                                        <InputLabel variant="h6" sx={{ padding: '0 16px', fontWeight: 'bold', color: "black" }}>
                                                            Location Details
                                                        </InputLabel>
                                                        <Divider sx={{ flex: 1, borderColor: "black" }} />
                                                    </Box>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                                    <FormControl fullWidth>
                                                        <InputLabel id="country"><MandatoryIndicator label="Country" isRequired={true} /></InputLabel>
                                                        <Select
                                                            labelId="country"
                                                            name='country'
                                                            value={user?.country ?? ''}
                                                            label="Country"
                                                            onChange={(e) => handleChange(e)}
                                                        >
                                                            <MenuItem value={""}></MenuItem>
                                                            {countries?.map((item) => (
                                                                <MenuItem value={item.name} key={item.name}> {item.name}</MenuItem>
                                                            ))}
                                                        </Select>
                                                        {validator?.current.message('country', user?.country, 'required', { className: 'text-danger' })}
                                                    </FormControl>
                                                </Grid>
                                                {user?.country === 'India' ? (<>
                                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                                        <FormControl fullWidth>
                                                            <InputLabel id="state"><MandatoryIndicator label="State" isRequired={true} /></InputLabel>
                                                            <Select
                                                                labelId="state"
                                                                name='state'
                                                                value={(user?.country && states?.length > 0) ? (user?.state ?? '') : ''}
                                                                label="State"
                                                                onChange={(e) => handleChange(e)}
                                                            >
                                                                <MenuItem value={""}></MenuItem>
                                                                {states?.map((item) => (
                                                                    <MenuItem value={item} key={item}> {item}</MenuItem>
                                                                ))}
                                                            </Select>
                                                            {validator?.current.message('state', user?.state, 'required', { className: 'text-danger' })}
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                                        <FormControl fullWidth>
                                                            <InputLabel id="district"><MandatoryIndicator label="District" isRequired={true} /></InputLabel>
                                                            <Select
                                                                labelId="district"
                                                                name='district'
                                                                value={(user?.country && user?.state && districts?.length > 0) ? (user?.district ?? '') : ''}
                                                                label="District"
                                                                onChange={(e) => handleChange(e)}
                                                            >
                                                                <MenuItem value={""}></MenuItem>
                                                                {districts?.map((item) => (
                                                                    <MenuItem value={item} key={item}> {item}</MenuItem>
                                                                ))}
                                                            </Select>
                                                            {validator?.current.message('district', user?.district, 'required', { className: 'text-danger' })}
                                                        </FormControl>
                                                    </Grid> </>) :
                                                    (<>
                                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                                            <TextField
                                                                fullWidth
                                                                label={<MandatoryIndicator label="State" isRequired={true} />}
                                                                name="state"
                                                                value={user?.state ?? ''}
                                                                onChange={handleChange}
                                                                placeholder="Enter State"
                                                            />
                                                            {validator?.current.message('state', user?.state, 'required', { className: 'text-danger' })}
                                                        </Grid>
                                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                                            <TextField
                                                                fullWidth
                                                                label={"District"}
                                                                name="district"
                                                                value={user?.district ?? ''}
                                                                onChange={handleChange}
                                                                placeholder="Enter District"
                                                            />
                                                        </Grid></>)}
                                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                                    <TextField fullWidth id="city" label={<MandatoryIndicator label="City" isRequired={true} />} variant="outlined" onChange={(e) => handleChange(e)}
                                                        type="text" name={'city'} placeholder="City" value={user?.city ?? ''} />
                                                    {validator?.current.message('city', user?.city, 'required|alpha_space', { className: 'text-danger' })}
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                                    <TextField fullWidth id="pincode" label={<MandatoryIndicator label="Pincode" isRequired={true} />} variant="outlined" onChange={(e) => handleChange(e)}
                                                        type="text" name={'pincode'} placeholder="pincode" value={user?.pincode ?? ''} />
                                                    {validator?.current.message('pincode', user?.pincode, 'required|integer', { className: 'text-danger' })}
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                                    <TextField fullWidth id="address" label={<MandatoryIndicator label="Address" isRequired={true} />} variant="outlined" onChange={(e) => handleChange(e)} type="text"
                                                        name={'address'} placeholder="Address" value={user?.address ?? ''} multiline rows={2} />
                                                    {validator?.current.message('address', user?.address, 'required', { className: 'text-danger' })}
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid size={12}>
                                            <Grid container spacing={1} justifyContent={"flex-end"}>
                                                <Grid>
                                                    <Button style={{
                                                        backgroundColor: "Red",
                                                        color: 'white',
                                                        border: 'none',
                                                    }}
                                                        onClick={() => { handleClose() }}
                                                        type="primary">Cancel</Button>
                                                </Grid>
                                                <Grid>
                                                    {!params?.user_id ? (
                                                        <Button onClick={addNewUser} type="primary">
                                                            {loading ? (
                                                                <>
                                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{" "}
                                                                    Adding New User...
                                                                </>
                                                            ) : (
                                                                "Add New User"
                                                            )}
                                                        </Button>
                                                    ) : (
                                                        <Button onClick={updateUser} type="primary">
                                                            {loading ? (
                                                                <>
                                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{" "}
                                                                    Updating User...
                                                                </>
                                                            ) : (
                                                                "Update User"
                                                            )}
                                                        </Button>
                                                    )}
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </form>
                            </div>
                        </Card>
                    </Grid>
                </Grid>
            </div >
        </>
    )
}

export default UserDetails;
