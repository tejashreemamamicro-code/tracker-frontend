import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Dropzone from 'react-dropzone';
import { Icon, Label } from 'semantic-ui-react';
// import FileUploadService from '../../apis/FileUploadService';
import { Paper, Dialog, DialogTitle, DialogContent, Grid, ButtonGroup, Button } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ADMIN_API_BASE_URL } from '../../ApiConstants';
import * as appConstants from '../../AppContants';
// import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { toast } from 'react-toastify';
import Toaster from './Toaster';
import { confirmAlert } from 'react-confirm-alert';
import * as sharedServices from '../../shared/SharedService';
import CloseIcon from '@mui/icons-material/Close';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import { useSelector } from 'react-redux';

const DragAndDropFileUpload = forwardRef((props, ref) => {
    const [files, setFiles] = useState({ data: [] });
    const [fileList, setFileList] = useState([]);
    const [rejectedFiles] = useState([]);
    const formData = new FormData();
    const [modalOpen, setModalOpen] = useState(false)
    const [, setDocs] = useState();
    const [fileName, setFileName] = useState();
    const [ngo] = useState({});
    const [ngoAllFiles,] = useState({});
    const [videoModal, setVideoModal] = useState(false);
    const [vedioUrl, setVedioUrl] = useState();
    const [multiMediaFormat, setMultiMediaFormat] = useState();
    const navigate = useNavigate();
    const { loggedTheme } = useSelector((SettingSelector) => ({
        loggedTheme: SettingSelector.setting?.loggedTheme
    }));

    useEffect(() => {
        getAllNgoFilesById();
    }, [])

    // gets all uploaded files of the user
    const getAllNgoFilesById = async () => {
        const id = props.isNgoId ? props?.data?.ngo_id : props?.data?.id;
        if (id) {
            const resp = await axios.get(ADMIN_API_BASE_URL + '/get_file_uploads/' + id + '/' + props?.category + '/' + props?.categoryId);
            setFileList(resp?.data);
            if (props?.sendDataToParent && resp?.data.length > 0)
                showUserProfilePic(resp?.data);
        }
    }

    const onDrop = (file) => {
        if (!props.disabled) {
            setFiles({ ...files, ['data']: files['data']?.concat(file) });
        }
    };

    // handling rejected files
    const onReject = (file) => {
        let rejectMessage = 'exceeded maximum size of 2MB ';
        file.map((item, index) => {
            rejectMessage += (item?.file?.name) + (index < file?.length ? ' ,' : '');
        })
        toast.error(rejectMessage)
        // setRejectedFiles(file)
    }

    const handleModalClose = () => {
        setModalOpen(false)
    }

    const handleVideoModalClose = () => {
        setVideoModal(false)
    }

    // handling file upload
    const handleFileUpload = async (id) => {
        if (props.disabled) return;
        if (!props?.data?.id)
            return;
        let fileFormat = sharedServices.getFileUploadFormat(props?.fileFormat, props?.delimiter);
        const dataId = props.isNgoId ? props?.data?.ngo_id : props?.data?.id;
        formData.append('ngoId', dataId);
        formData.append('category', props?.category);
        formData.append('categoryId', props?.categoryId);
        formData.append('fileFormat', fileFormat);
        formData.append('title', props?.title);
        if (files?.data?.length > 0) {
            files['data'].forEach(file => {
                formData.append('file', file);
            });
            try {
                const resp = await axios.post(ADMIN_API_BASE_URL + '/file_uploads', formData);
                setFileList(resp.data)
                setFiles({ data: [] });
                if (props?.sendDataToParent && resp?.data.length > 0) {
                    if (resp.data.length === 1) {
                        showUserProfilePic(resp.data);
                    } else {
                        // const latestFile = resp.data[resp.data.length - 1];
                        for (let i = 0; i < resp.data.length - 1; i++) {
                            await deleteFile(resp.data[i]);
                        }
                        // showUserProfilePic(latestFile);
                    }
                }
            } catch {
                toast.error('Unable to upload file',)
            }
        }
    }

    const handleSingleFileUpload = async () => {
        if (props.disabled) return;

        // Check if multiple files are selected
        if (files?.data?.length > 1) {
            toast.error('Please select only one file.');
            setFiles({ data: [] }); // Remove all selected files
            return;
        }

        if (!props?.data?.id || files?.data?.length === 0) return;

        let fileFormat = sharedServices.getFileUploadFormat(props?.fileFormat, props?.delimiter);
        const dataId = props.isNgoId ? props?.data?.ngo_id : props?.data?.id;

        formData.append('ngoId', dataId);
        formData.append('category', props?.category);
        formData.append('categoryId', props?.categoryId);
        formData.append('fileFormat', fileFormat);
        formData.append('title', props?.title);
        formData.append('file', files?.data[0]);

        try {
            const resp = await axios.post(ADMIN_API_BASE_URL + '/file_uploads', formData);
            setFileList(resp.data);
            setFiles({ data: [] });
            if (props?.sendDataToParent && resp?.data.length > 0) {
                showUserProfilePic(resp?.data);
            }
        } catch (error) {
            toast.error('Unable to upload file');
        }
    }

    useImperativeHandle(ref, () => ({
        handleFileUpload,
        handleSingleFileUpload
    }));

    const removeFileFromUploadList = (index) => {
        if (!props.disabled) {
            const newData = [...files.data];
            newData.splice(index, 1);
            setFiles({ ...files, data: newData });
        }
    };

    const uploadList = files?.data?.map((file, index) => (
        <Label as="a" color="grey" key={file.name} style={{ margin: '10px 0px 0px 10px', display: 'flex', alignItems: 'center' }}>
            {file.name} - {file.size} bytes
            <CloseIcon
                name="delete"
                style={{
                    cursor: 'pointer',
                    marginLeft: '8px',
                    fontSize: '14px',
                    color: 'red'
                }}
                onClick={() => removeFileFromUploadList(index)}
            />
        </Label>
    ));

    const rejectedList = rejectedFiles.map(fileitem => (
        <Label as='a' color='grey' key={fileitem.file.name} style={{ margin: '10px 0px 0px 10px' }}>
            {fileitem.file.name} - {fileitem.file.size} bytes &nbsp;
            <Label.Detail><Icon color="red" name='delete' /></Label.Detail>
        </Label>
    ))

    const showUserProfilePic = async (files) => {
        try {
            const fileName = files[0]?.filename;
            const resp = await axios.get(ADMIN_API_BASE_URL + '/preview_files/' + props?.data?.id + '/' + props?.category + '/' + props?.categoryId + '/' + fileName);
            if (resp?.data?.uri) {
                props?.sendDataToParent(resp?.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    // handling file preview
    const previewFile = async (e, file) => {
        e.preventDefault();
        setFileName(file?.filename);
        let fileFormat = file?.filename.split('.')[1];
        try {
            const id = props.isNgoId ? props?.data?.ngo_id : props?.data?.id;
            const resp = await axios.get(ADMIN_API_BASE_URL + '/preview_files/' + id + '/' + props?.category + '/' + props?.categoryId + '/' + file?.filename);
            if (resp?.data?.uri) {
                // props?.sendDataToParent(resp?.data);
                if (appConstants.DOCVIEWER_FILE_TYPES.includes(fileFormat)) {
                    setDocs([{ uri: resp?.data?.uri }]);
                    let elm = (`<title>${file?.filename}</title><body style='margin:0'>
                    <embed type='application/pdf' background-color="4283586137" src=${resp?.data?.uri} width='100%' height='100%' javascript="allow" full-frame/>
                    </body>`);
                    const blobUrl = URL.createObjectURL((new Blob([elm], { type: 'text/html' })));
                    window.open(blobUrl, "_blank");
                } else if (appConstants.VEDIO_FILE_FORMATS.includes(fileFormat)) {
                    setMultiMediaFormat('video/' + fileFormat);
                    setVedioUrl(resp?.data?.uri);
                    videoRenderer();
                    setVideoModal(true);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    // video file renderer
    const videoRenderer = () => {
        return (
            <Dialog
                open={videoModal}
                onClose={handleVideoModalClose}
                size='lg'
                backdrop="static"
            >
                <DialogTitle >{fileName}</DialogTitle >
                <CloseIcon onClick={handleVideoModalClose} sx={{ position: 'absolute', right: 10, top: 10 }} />
                <DialogContent>
                    <video aria-label="Video player" width="100%" height="100%" controls controlsList="nodownload" autoPlay>
                        <source src={vedioUrl} type={multiMediaFormat} />
                        {/* <track src="captions_en.vtt" kind="captions" srcLang="en" label="English" /> */}
                        <track kind="captions" srcLang="en" label="English" default />
                    </video>
                </DialogContent>
            </Dialog>
        )
    }

    // confirmation before delete
    const confirmationAlert = (element) => {
        confirmAlert({
            title: 'Confirm to submit',
            message: 'Are you sure you want to delete ' + element?.filename + '?',
            buttons: [
                {
                    className: "text-bg-danger justify-content-end",
                    label: 'No',
                    color: 'error',
                    onClick: () => {
                        // Cancel code here
                    }
                },
                {
                    className: "text-bg-success justify-content-end",
                    label: 'Yes',
                    onClick: () => {
                        //to delete uploaded file
                        deleteFile(element);
                    }
                }
            ]
        });
    }

    // handling file delete
    const deleteFile = async (file) => {
        try {
            const id = props.isNgoId ? props?.data?.ngo_id : props?.data?.id;
            const resp = await axios.get(ADMIN_API_BASE_URL + '/remove_file/' + id + '/' + props?.category + '/' + props?.categoryId + '/' + file?.filename)
            setFileList(resp.data);
            if (props?.sendDataToParent && resp?.data.length > 0)
                showUserProfilePic(resp?.data);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <><Toaster position='bottom-left' duration='5000' />
            <Dialog
                open={modalOpen}
                onClose={handleModalClose}
                size='lg'
                backdrop="static"
            >
                <DialogTitle>{fileName}</DialogTitle>
                <CloseIcon onClick={handleModalClose} sx={{ position: 'absolute', right: 10, top: 10 }} />
                <DialogContent >
                    {/* <DocViewer
                        pluginRenderers={DocViewerRenderers}
                        documents={[{ uri: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }]}
                        config={{
                            header: {
                                disableHeader: true,
                                disableFileName: true,
                                retainURLParams: true
                            }
                        }}
                    // style={{ height: '65vh', width: '100%' }}
                    /> */}
                </DialogContent >
            </Dialog>
            {
                videoRenderer()
            }
            <React.Fragment>

                {/* <h6> Drag and Drop multiple files</h6> */}
                <Dropzone
                    onDrop={onDrop}
                    name='file'
                    ccept={[props?.accept ? props.accept : '.jpg,.png,.jpeg']}
                    maxSize={props?.maxSize ? props?.maxSize : appConstants?.FILE_UPLOAD_MAX_SIZE}
                    onDropRejected={onReject}
                    disabled={props.disabled}
                >
                    {({ isDragActive, getRootProps, getInputProps }) => (
                        <section className="container">
                            <div {...getRootProps({ className: 'dropzone' })} style={{ height: '150px', paddingTop: '5px', borderRadius: '5px', background: 'aliceblue', textAlign: 'center' }}>
                                <input {...getInputProps()} disabled={props.disabled} />
                                {
                                    isDragActive ?
                                        <p>Drop the files here ...</p> :
                                        <div>
                                            {props.disabled ?
                                                <div>
                                                    {/* <p>File upload.</p> */}
                                                    <p> Files can view uploaded files but cannot upload.</p>
                                                </div> :
                                                <div>
                                                    <p>Drag and drop the files here</p>
                                                    <p>or </p>
                                                    <p>Click to select the files</p>
                                                </div>
                                            }
                                        </div>
                                }
                            </div>
                            <aside>
                                {uploadList?.length > 0 &&
                                    <>
                                        <h4>Files ready to be uploaded</h4>
                                        <ul>{uploadList}</ul>
                                    </>
                                }
                                {rejectedFiles?.length > 0 &&
                                    <>
                                        <h4>Files larger than 2mb rejected</h4>
                                        <ul>{rejectedList}</ul>
                                    </>
                                }
                            </aside>
                        </section>
                    )}
                </Dropzone><br />
                {<div container spacing={1}>
                    <div item xs={12} align="right">
                        <Button
                            size="small"
                            onClick={props.isSingleFileUpload ? handleSingleFileUpload : handleFileUpload}
                            sx={{ backgroundColor: loggedTheme?.primaryColor }}
                            type="button"
                            disabled={
                                props.disabled ||
                                (props.isSingleFileUpload && fileList?.length > 0)
                            }
                            variant="contained"
                        >
                            Upload File
                        </Button>
                    </div>
                </div>}
                <br /><br />
                {/* for category specific files */}
                {/* {props?.props?.sendDataToParent && */}
                <div>
                    <div container direction="row"
                        // justifyContent="space-evenly"
                        // alignItems="center"
                        spacing={1} >
                        {fileList?.map((file, index) => (
                            <div item xs key={index + 1}>
                                <ButtonGroup >
                                    <Button variant="outlined" color="error" size="small"
                                        onClick={() => confirmationAlert(file)} disabled={(props.isTeacher) || (props.isDisabled)} >
                                        <DeleteIcon />
                                    </Button>
                                    <Button variant="outlined" size="small" title={"Preview File"}
                                        onClick={(e) => previewFile(e, file)} >
                                        <b>{file?.filename}</b>
                                    </Button>
                                    <Button variant="contained" sx={{ backgroundColor: loggedTheme.infoColor }}
                                        size="small" title={"Preview File"} onClick={(e) => previewFile(e, file)} >
                                        <RemoveRedEyeOutlinedIcon />
                                    </Button>
                                </ButtonGroup>
                            </div>
                        ))}
                    </div>
                </div>
                {/* } */}

                {/* rendering all files in the uploaded by user */}
                {props?.listAllFiles === true &&
                    <fieldset className="scheduler-border" >
                        <legend className="scheduler-border"><h3 className="subHeading">Already Uploaded Files</h3></legend>

                        {/* {appConstants.FILE_UPLOAD_CATEGORIES.map((item) => ( */}
                        <>
                            {ngoAllFiles ? ngoAllFiles.length > 0 &&
                                <h4>Files Uploaded </h4>
                                : ''}
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                {ngoAllFiles ? ngoAllFiles.length > 0 && ngoAllFiles.map((file, index) => (
                                    <Paper elevation={appConstants.paperElevation} className='m-2' key={index + 1}>
                                        <div container spacing={2}>
                                            <div item xs={12} md={12} lg={12}>
                                                <label className='cardOverflow' style={{ width: '300px' }} title={file}><b>{file} new</b></label>
                                            </div>
                                            <div item >
                                                <ButtonGroup>
                                                    <Button
                                                        size="small"
                                                        title="Delete"
                                                        color="error"
                                                        disabled={props.disabled}
                                                        onClick={() => confirmationAlert({ filename: file })}
                                                    >
                                                        {/* <FontAwesomeIcon icon={faTrash} /> */}
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        title="Preview"
                                                        color="secondary"
                                                        disabled={props.disabled}
                                                    // onClick={() => 
                                                    //     { previewFile({ filename: file, category: appConstants.FILE_UPLOAD_FOLDER[item.value].value })
                                                    //  }}
                                                    >
                                                        {/* <FontAwesomeIcon icon={faEye} /> */}
                                                    </Button>
                                                </ButtonGroup>
                                            </div>
                                        </div>
                                    </Paper>
                                )) : ''}
                            </div>
                        </>
                        ))
                        {/* } */}
                    </fieldset>
                }

            </React.Fragment >
        </>
    );
})

export default DragAndDropFileUpload; 