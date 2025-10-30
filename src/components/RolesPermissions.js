import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap';
import { Button, Modal as ConfirmModal } from 'antd';
import { Link } from 'react-router-dom';
import Card from 'antd/es/card/Card'
import { API_BASE_URL } from '../ApiConstant'
import axios from "axios";
import { CheckCircleOutlined, ExclamationCircleFilled, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { TextField } from '@mui/material';
import { Grid } from '@mui/material';
import MandatoryIndicator from '../form-components/MandatoryIndicator';

const RoleAndPermissions = () => {
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [showRolesModal, setShowRolesModal] = useState(false);
    const [permissionsList, setPermissionsList] = useState([]);
    const [selectedRole, setSelectedRole] = useState({});
    const [selectedPermission, setSelectedPermission] = useState({});
    const [rolesList, setRolesList] = useState([]);

    const handleCheckboxChange = (role, permission, isChecked) => {
        if (isChecked) {

            if (role['permissions']?.length > 0) {
                if (role['permissions'].includes(permission.code)) {
                    return
                }
                else {
                    role['permissions'].push(permission.code)
                }
            }
            else {
                role['permissions'] = [permission.code]
            }
            addPermissionsToRole(role)
        }
        else {
            if (role['permissions'].includes(permission.code)) {
                let obj = { ...role }
                obj['permissions'] = [permission.code];
                removePermissionsToRole(obj)
            }
        }
    };

    const addPermissionsToRole = async (role) => {
        await axios.post(API_BASE_URL + '/addPermissionsToRole', role)
        getAllRoles()
    }

    const removePermissionsToRole = async (role) => {
        await axios.post(API_BASE_URL + '/removePermissionsFromRole', role)
        getAllRoles()
    }

    useEffect(() => {
        getAllRoles();
        getPermissions();
    }, []);

    useEffect(() => {
        if (!selectedRole?.id && selectedRole.name) {
            setSelectedRole((prev) => ({ ...prev, role_code: prev.name.toUpperCase() }));
        }
        if (!selectedPermission?.id && selectedPermission.title) {

            setSelectedPermission((prev) => ({ ...prev, code: prev.title.toUpperCase() }));
        }
    }, [selectedRole.name, selectedPermission.title]);

    const handleClosePermissionsModal = () => {
        setSelectedPermission({});
        setShowPermissionsModal(false);
    }

    const handleShowPermissionsModal = () => setShowPermissionsModal(true);

    const handleCloseRolesModal = () => {
        setSelectedRole({});
        setShowRolesModal(false);
    };

    const handleShowRolesModal = () => setShowRolesModal(true);

    const addNewRole = async () => {
        await axios.post(API_BASE_URL + '/createRole', selectedRole);
        setSelectedRole({})
        handleCloseRolesModal()
        getAllRoles()
    }

    const getAllRoles = async () => {
        const response = await axios.get(API_BASE_URL + '/roles');
        setRolesList(response?.data);
    };

    function roleedit(role, openmodal) {
        setSelectedRole(role);
        handleShowRolesModal(openmodal);
    }

    function permissionedit(permissionname, openmodal) {
        setSelectedPermission(permissionname);
        handleShowPermissionsModal(openmodal);
    }

    const { confirm } = ConfirmModal;
    const showDeleteConfirm = (item) => {
        confirm({
            title: `Are you sure to ${item.is_active ? 'deactivate' : 'activate'} this role?`,
            icon: item.is_active ? <ExclamationCircleFilled /> : <CheckCircleOutlined style={{ color: 'green' }} />,
            content: item.is_active ? 'Role will be deactivated' : 'Role will be activated',
            okText: item.is_active ? 'Deactivate' : 'Activate',
            okType: item.is_active ? 'danger' : '',
            cancelText: 'No',
            onOk() {
                updateRole(item);
            },
            onCancel() {
            },
        });
    };

    const updateRole = async (item) => {
        item.is_active = !item.is_active
        const response = await axios.put(API_BASE_URL + '/updateRole/' + item?.id, item)
        setRolesList(response?.data)
    }

    const showDisableConfirm = (item) => {
        confirm({
            title: `Are you sure to ${item.is_active ? 'deactivate' : 'activate'} this permission?`,
            icon: item.is_active ? <ExclamationCircleFilled /> : <CheckCircleOutlined style={{ color: 'green' }} />,
            content: item.is_active ? 'Permission will be deactivated' : 'Permission will be activated',
            okText: item.is_active ? 'Deactivate' : 'Activate',
            okType: item.is_active ? 'danger' : '',
            cancelText: 'No',
            onOk() {
                updatePermission(item);
            },
            onCancel() {
            },
        });
    };

    const updatePermission = async (item) => {
        item.is_active = !item.is_active
        const response = await axios.put(API_BASE_URL + '/updatePermission/' + item?.id, item)
        setPermissionsList(response.data)
    }

    const saveRole = async () => {
        const response = await axios.put(API_BASE_URL + '/updateRole/' + selectedRole?.id, selectedRole)
        handleCloseRolesModal()
        getAllRoles()
    }

    const getPermissions = async () => {
        const response = await axios.get(API_BASE_URL + '/permissions');
        setPermissionsList(response?.data)
    }

    const addNewPermission = async () => {
        const response = await axios.post(API_BASE_URL + '/permissions', selectedPermission);
        handleClosePermissionsModal()
        getPermissions()
    }

    const savePermission = async () => {
        const response = await axios.put(API_BASE_URL + '/updatePermission/' + selectedPermission?.id, selectedPermission)
        handleClosePermissionsModal()
        getPermissions()
    }

    return (
        <>
            <Card size='small' type="inner" title={<span style={{ color: 'black' }}>Role & Permission</span>} extra={
                <>
                    <Link onClick={handleShowPermissionsModal}>
                        <svg width={18} style={{ marginTop: '-3px' }} xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="item-name">&nbsp;Add New Permission</span>
                    </Link>
                    <Link rel="noopener noreferrer" onClick={handleShowRolesModal}>
                        <svg width={18} style={{ marginTop: '-3px' }} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="item-name">&nbsp;Add New Role</span>
                    </Link>
                </>
            }>
                <>
                    <Modal show={showPermissionsModal} onHide={handleClosePermissionsModal} centered>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: 'black' }}>{!(selectedPermission?.id) ? "Add New" : "Update "} Permission</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField label={<MandatoryIndicator label="Permission Title" isRequired={true} />}
                                        variant="outlined"
                                        onChange={(e) => setSelectedPermission({ ...selectedPermission, [e.target.name]: e.target.value })}
                                        type="text" name={'title'} value={(selectedPermission?.title) ?? ''} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label={<MandatoryIndicator label="Permission Code" isRequired={true} />}
                                        disabled={selectedPermission?.id}
                                        variant="outlined"
                                        onChange={(e) => setSelectedPermission({ ...selectedPermission, [e.target.name]: e.target.value })}
                                        type="text" name={'code'} value={(selectedPermission?.code) ?? ''} />
                                </Grid>
                                <Grid item xs={12} align="right">
                                    <Button onClick={handleClosePermissionsModal}>Cancel</Button>&nbsp;
                                    {(selectedPermission?.id) ?
                                        <Button variant="primary" onClick={savePermission} disabled={!selectedPermission?.title || !selectedPermission?.code}>
                                            Save
                                        </Button> :
                                        <Button variant="primary" onClick={addNewPermission} disabled={!selectedPermission?.title || !selectedPermission?.code}>
                                            Save
                                        </Button>}
                                </Grid>
                            </Grid>
                        </Modal.Body>
                    </Modal>
                    <Modal show={showRolesModal} onHide={handleCloseRolesModal} centered>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: 'black' }}>{!(selectedRole?.id) ? "Add New" : "Update "} Role</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField label={<MandatoryIndicator label="Role Name" isRequired={true} />}
                                        variant="outlined" name="name"
                                        value={(selectedRole?.name) ?? ''}
                                        onChange={(e) => setSelectedRole({ ...selectedRole, [e.target.name]: e.target.value })} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label={<MandatoryIndicator label="Role Code" isRequired={true} />}
                                        variant="outlined" disabled={selectedRole?.id}
                                        name="role_code"
                                        value={(selectedRole?.role_code) ?? ''}
                                        onChange={(e) => setSelectedRole({ ...selectedRole, [e.target.name]: e.target.value })} />
                                </Grid>
                                <Grid item xs={12} align="right">
                                    <Button onClick={handleCloseRolesModal}>Cancel</Button>&nbsp;
                                    {selectedRole?.id ?
                                        <Button onClick={saveRole} disabled={!selectedRole?.name || !selectedRole?.role_code}>Save</Button> :
                                        <Button onClick={addNewRole} disabled={!selectedRole?.name || !selectedRole?.role_code}>Save</Button>}
                                </Grid>
                            </Grid>
                        </Modal.Body>
                    </Modal>
                </>
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <colgroup>
                            <col style={{ width: '500px' }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th style={{ color: 'black' }}>Permissions</th>
                                {rolesList.map((item, index) => (
                                    <th className="text-center" key={index} style={{ color: !item.is_active ? 'black' : 'black' }}>
                                        {item.name}
                                        <>
                                            <div style={{ float: "right" }}>

                                                {item.is_active ? (
                                                    <Link
                                                        className="btn btn-sm btn-icon text-primary flex-end"
                                                        data-bs-toggle="tooltip"
                                                        title="Edit User"
                                                        to="#"
                                                        onClick={() => { roleedit(item, true) }}
                                                    >
                                                        <span className="btn-inner">
                                                            <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M11.4925 2.78906H7.75349C4.67849 2.78906 2.75049 4.96606 2.75049 8.04806V16.3621C2.75049 19.4441 4.66949 21.6211 7.75349 21.6211H16.5775C19.6625 21.6211 21.5815 19.4441 21.5815 16.3621V12.3341" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M8.82812 10.921L16.3011 3.44799C17.2321 2.51799 18.7411 2.51799 19.6721 3.44799L20.8891 4.66499C21.8201 5.59599 21.8201 7.10599 20.8891 8.03599L13.3801 15.545C12.9731 15.952 12.4211 16.181 11.8451 16.181H8.09912L8.19312 12.401C8.20712 11.845 8.43412 11.315 8.82812 10.921Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                <path d="M15.1655 4.60254L19.7315 9.16854" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                            </svg>
                                                        </span>
                                                    </Link>
                                                ) : (
                                                    <span className="btn btn-sm btn-icon text-secondary flex-end" title="User is inactive">
                                                        <span className="btn-inner">
                                                            <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M11.4925 2.78906H7.75349C4.67849 2.78906 2.75049 4.96606 2.75049 8.04806V16.3621C2.75049 19.4441 4.66949 21.6211 7.75349 21.6211H16.5775C19.6625 21.6211 21.5815 19.4441 21.5815 16.3621V12.3341" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M8.82812 10.921L16.3011 3.44799C17.2321 2.51799 18.7411 2.51799 19.6721 3.44799L20.8891 4.66499C21.8201 5.59599 21.8201 7.10599 20.8891 8.03599L13.3801 15.545C12.9731 15.952 12.4211 16.181 11.8451 16.181H8.09912L8.19312 12.401C8.20712 11.845 8.43412 11.315 8.82812 10.921Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                <path d="M15.1655 4.60254L19.7315 9.16854" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                            </svg>
                                                        </span>
                                                    </span>
                                                )}<Link className="btn btn-sm btn-icon text-danger" data-bs-toggle="tooltip" title="Status" to="#"
                                                    onClick={() => showDeleteConfirm(item)}>
                                                    <span>{item.is_active ? <EyeOutlined style={{ color: 'black' }} /> : <EyeInvisibleOutlined style={{ color: 'black' }} />}</span>
                                                </Link>
                                            </div>
                                        </>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {permissionsList.map((item, index) =>
                            ((item.visibility) &&
                                <tr className='' key={index} >
                                    <td className="" style={{
                                        color: !item.is_active ? '#ccc' : 'inherit'
                                    }}> {item.title}
                                        <div style={{ float: "right" }}>
                                            <React.Fragment>
                                                {item.is_active ?
                                                    <>
                                                        <Link className="btn btn-sm btn-icon text-primary flex-end" data-bs-toggle="tooltip" title="Edit User" to="#"
                                                            onClick={() => { permissionedit(item, true) }} >
                                                            <span className="btn-inner">
                                                                <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                                                                    <path d="M11.4925 2.78906H7.75349C4.67849 2.78906 2.75049 4.96606 2.75049 8.04806V16.3621C2.75049 19.4441 4.66949 21.6211 7.75349 21.6211H16.5775C19.6625 21.6211 21.5815 19.4441 21.5815 16.3621V12.3341" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                    <path fillRule="evenodd" clipRule="evenodd" d="M8.82812 10.921L16.3011 3.44799C17.2321 2.51799 18.7411 2.51799 19.6721 3.44799L20.8891 4.66499C21.8201 5.59599 21.8201 7.10599 20.8891 8.03599L13.3801 15.545C12.9731 15.952 12.4211 16.181 11.8451 16.181H8.09912L8.19312 12.401C8.20712 11.845 8.43412 11.315 8.82812 10.921Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                    <path d="M15.1655 4.60254L19.7315 9.16854" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                </svg>
                                                            </span>
                                                        </Link>
                                                    </> : (
                                                        <span className="btn btn-sm btn-icon text-secondary flex-end" title="Permission is disabled">
                                                            <span className="btn-inner">
                                                                <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M11.4925 2.78906H7.75349C4.67849 2.78906 2.75049 4.96606 2.75049 8.04806V16.3621C2.75049 19.4441 4.66949 21.6211 7.75349 21.6211H16.5775C19.6625 21.6211 21.5815 19.4441 21.5815 16.3621V12.3341" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                    <path fillRule="evenodd" clipRule="evenodd" d="M8.82812 10.921L16.3011 3.44799C17.2321 2.51799 18.7411 2.51799 19.6721 3.44799L20.8891 4.66499C21.8201 5.59599 21.8201 7.10599 20.8891 8.03599L13.3801 15.545C12.9731 15.952 12.4211 16.181 11.8451 16.181H8.09912L8.19312 12.401C8.20712 11.845 8.43412 11.315 8.82812 10.921Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                    <path d="M15.1655 4.60254L19.7315 9.16854" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                </svg>
                                                            </span>
                                                        </span>
                                                    )}
                                                <Link className="btn btn-sm btn-icon text-danger" data-bs-toggle="tooltip" title="Status" to="#"
                                                    onClick={() => showDisableConfirm(item)}>
                                                    <span>{item.is_active ? <EyeOutlined style={{ color: 'black' }} /> : <EyeInvisibleOutlined style={{ color: 'black' }} />}</span>
                                                </Link>
                                            </React.Fragment>
                                        </div>
                                    </td>
                                    {rolesList.map((item1, index) => (
                                        <td className="text-center" key={index}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={item1.permissions?.includes(item.code)}
                                                disabled={!item1.is_active || !item.is_active}
                                                onClick={(e) => handleCheckboxChange(item1, item, e.target.checked)} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card >
        </>
    )
}

export default RoleAndPermissions;