
import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import FileDetailsPage from './FileDetailsPage';
import './App.css';
import './DarkModeProvider.css';
import { DarkModeContext } from './DarkModeProvider';
import { ReactComponent as TrashIcon } from 'bootstrap-icons/icons/trash3-fill.svg';
import { ReactComponent as SearchIcon } from 'bootstrap-icons/icons/search.svg';
import { ReactComponent as PinIcon } from 'bootstrap-icons/icons/pin-fill.svg';
import { ReactComponent as PencilIcon } from 'bootstrap-icons/icons/pencil-square.svg';
import { ReactComponent as MoonIcon } from 'bootstrap-icons/icons/moon-fill.svg';
import { ReactComponent as SunIcon } from 'bootstrap-icons/icons/brightness-high-fill.svg';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function App() {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  const [selectedFile, setSelectedFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');  
  const [files, setFiles] = useState([]);
  const [selectedFileNameId, setSelectedFileNameId] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadButtonColor, setUploadButtonColor] = useState('#007bff');
  const [pinnedFiles, setPinnedFiles] = useState([]);

  
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFile(null); 
    setNewFileName(''); 
  };
  const handleShowModal = () => setShowModal(true);

 
  const fileInputRefModal = useRef(null);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? 'black' : '#f8f8f8';

    axios.get('http://localhost:5000/files')
      .then(response => {
        setFiles(response.data);
      })
      .catch(error => {
        console.error(error);
        MySwal.fire('Error', 'Failed to retrieve file names', 'error');
      });
  }, [darkMode]);

  
  const handleUpload = async () => {
    if (!selectedFile) {
      MySwal.fire('Warning', 'Please select a JSON file to upload', 'warning');
      return;
    }

    let fileNameToUpload = newFileName.trim();

    if (!fileNameToUpload.endsWith('.json')) {
      fileNameToUpload += '.json';
    }

    if (fileNameToUpload === selectedFile.name) {
     
    } else {
   
      const fileExists = files.some(file => file.fileName.toLowerCase() === fileNameToUpload.toLowerCase());

      if (fileExists) {
        const { isConfirmed } = await MySwal.fire({
          title: 'File Name Exists',
          text: `A file named "${fileNameToUpload}" already exists. Do you want to overwrite it?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, overwrite',
          cancelButtonText: 'No, choose another name'
        });

        if (isConfirmed) {
          
        } else {
      
          const { value: newName } = await MySwal.fire({
            title: 'Enter a Different File Name',
            input: 'text',
            inputPlaceholder: 'New file name',
            inputValue: fileNameToUpload.replace('.json', ''),
            showCancelButton: true,
            inputValidator: (value) => {
              if (!value.trim()) {
                return 'File name cannot be empty!';
              }
              return null;
            }
          });

          if (newName) {
            fileNameToUpload = newName.trim();
            if (!fileNameToUpload.endsWith('.json')) {
              fileNameToUpload += '.json';
            }

          
            handleUploadWithName(fileNameToUpload);
            return;
          } else {
       
            return;
          }
        }
      }
    }

    
    await handleUploadWithName(fileNameToUpload);
  };


  const handleUploadWithName = async (fileNameToUpload) => {
    const formData = new FormData();
    formData.append('file', selectedFile, fileNameToUpload);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      MySwal.fire('Success', response.data, 'success');
      const filesResponse = await axios.get('http://localhost:5000/files');
      setFiles(filesResponse.data);
      setSelectedFile(null); 
      setNewFileName(''); 
      handleCloseModal(); 
    } catch (error) {
      console.error(error);
      MySwal.fire('Error', 'Failed to upload the JSON file', 'error');
    }
  };

  
  const handleEditFileName = async (fileId, currentFileName) => {
   
    const { value: newName } = await MySwal.fire({
      title: 'Enter New File Name',
      input: 'text',
      inputLabel: 'File Name',
      inputValue: currentFileName,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value.trim()) {
          return 'File name cannot be empty!';
        }
        return null;
      }
    });

    if (newName) {
      let updatedName = newName.trim();

      if (updatedName === '.json') {
        MySwal.fire('Error', 'File name cannot be just ".json".', 'error');
        return;
      }

      if (!updatedName.toLowerCase().endsWith('.json')) {
        updatedName += '.json';
      }

      try {
        const response = await axios.get('http://localhost:5000/files');
        const existingFileNames = response.data.map(file => file.fileName);

        if (existingFileNames.includes(updatedName)) {
          MySwal.fire('Error', `The file name "${updatedName}" already exists. Please choose a different name.`, 'error');
          return;
        }

        const trimmedNewName = updatedName.trim();
        const updatedFiles = files.map(file => {
          if (file._id === fileId) {
            return { ...file, fileName: trimmedNewName };
          }
          return file;
        });

        setFiles(updatedFiles);

        const putResponse = await axios.put(`http://localhost:5000/files/${fileId}`, { fileName: trimmedNewName });
        MySwal.fire('Success', putResponse.data.message, 'success');
      } catch (error) {
        console.error(error);
        MySwal.fire('Error', 'Failed to update the file name', 'error');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setNewFileName(file.name.replace('.json', '')); 
    }
    setUploadButtonColor('#4caf50');
  };

 
  const handleFileNameClick = (fileId) => {
    setSelectedFileNameId(fileId);
  };

  
  const handleDelete = (fileId, event) => {
    event.stopPropagation();
    MySwal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this file?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'No, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/files/${fileId}`)
          .then(response => {
            MySwal.fire('Deleted!', response.data.message, 'success');
            setFiles(files.filter(file => file._id !== fileId));
          })
          .catch(error => {
            console.error(error);
            MySwal.fire('Error', 'Failed to delete the file', 'error');
          });
      }
    });
  };

  
  const handlePinToggle = (fileId, event) => {
    event.stopPropagation();
    const index = pinnedFiles.indexOf(fileId);
    if (index === -1) {
      setPinnedFiles([...pinnedFiles, fileId]);
    } else {
      const updatedPinnedFiles = [...pinnedFiles];
      updatedPinnedFiles.splice(index, 1);
      setPinnedFiles(updatedPinnedFiles);
    }
  };


  const handleBack = () => {
    setSelectedFileNameId(null);
  };

 
  const handleDragStart = (e, fileId) => {
    e.dataTransfer.setData('fileId', fileId);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const draggedFileId = e.dataTransfer.getData('fileId');
    const draggedFile = files.find(file => file._id === draggedFileId);
    const updatedFiles = [...files];
    const currentIndex = updatedFiles.findIndex(file => file._id === draggedFileId);
    updatedFiles.splice(currentIndex, 1);
    updatedFiles.splice(targetIndex, 0, draggedFile);
    setFiles(updatedFiles);
  };

  
  const filteredFiles = files.filter(file => file.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
  const pinnedFilesList = filteredFiles.filter(file => pinnedFiles.includes(file._id));
  const otherFilesList = filteredFiles.filter(file => !pinnedFiles.includes(file._id));

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>

      {!selectedFileNameId && (
        <>
          <section className="wrapper">
            <div className="top">D.E.A.L.</div>
            <div className="bottom" aria-hidden="true">D.E.A.L.</div>
          </section>

          <section className="wrapper2">
            <div className="top2">Dependencies Explanation with Advanced Language Models</div>
          </section>
          
          <div className="search-section">
            <input
              type="text"
              placeholder="Search by file name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon />
          </div>
        </>
      )}

      {!selectedFileNameId ? (
        <div>
          <div className="file-container">
            {pinnedFilesList.map((file, index) => (
              <div
                key={file._id}
                className={`desktop-icon ${file._id}`}
                onClick={() => handleFileNameClick(file._id)}
                draggable
                onDragStart={(e) => handleDragStart(e, file._id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <i className="fas fa-file"></i>
                <p className="file-name" title={file.fileName}>{file.fileName}</p>
                <button className="remove-btn" onClick={(event) => handleDelete(file._id, event)}><TrashIcon /></button>
                <button className="pin-btn" onClick={(event) => handlePinToggle(file._id, event)}>
                  <PinIcon fill="#f00" />
                </button>
                <button className="edit-btn" onClick={(event) => { event.stopPropagation(); handleEditFileName(file._id, file.fileName); }}>
                  <PencilIcon fill={darkMode ? "#fff" : "#000"} />
                </button>
                <p className="timestamp">{file.timestamp}</p>
              </div>
            ))}

            {otherFilesList.map((file, index) => (
              <div
                key={file._id}
                className={`desktop-icon ${file._id}`}
                onClick={() => handleFileNameClick(file._id)}
                draggable
                onDragStart={(e) => handleDragStart(e, file._id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, pinnedFilesList.length + index)}
              >
                <i className="fas fa-file"></i>
                <p className="file-name" title={file.fileName}>{file.fileName}</p>
                <button className="remove-btn" onClick={(event) => handleDelete(file._id, event)}><TrashIcon /></button>
                <button className="pin-btn" onClick={(event) => handlePinToggle(file._id, event)}>
                  <PinIcon fill={darkMode ? "#fff" : (pinnedFiles.includes(file._id) ? "#f00" : "#000")} />
                </button>
                <button className="edit-btn" onClick={(event) => { event.stopPropagation(); handleEditFileName(file._id, file.fileName); }}>
                  <PencilIcon fill={darkMode ? "#fff" : "#000"} />
                </button>
                <p className="timestamp">{file.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <FileDetailsPage fileName={selectedFileNameId} onBack={handleBack} />
      )}

      {!selectedFileNameId && (
        <div className="upload-section">
          <Button variant="primary" onClick={handleShowModal} className="mt-3">
            Upload File
          </Button>
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Upload a File</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <input
                type="file"
                ref={fileInputRefModal}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSelectedFile(file);
                    setNewFileName(file.name.replace('.json', '')); 
                  }
                }}
                style={{ display: 'none' }}
                accept=".json" 
              />
              <Button variant="secondary" onClick={() => fileInputRefModal.current.click()} className="mb-3">
                Choose File
              </Button>
              {selectedFile && (
                <div>
                  <p>Selected File: {selectedFile.name}</p>
                  <label htmlFor="new-file-name">Rename file:</label>
                  <input
                    type="text"
                    id="new-file-name"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Enter new file name"
                    className="form-control"
                  />
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
              <Button variant="primary" onClick={handleUpload} disabled={!selectedFile}>
                Upload File
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
     
      <div className="toggle-button" onClick={toggleDarkMode}>
        <SunIcon name="sun" className="sun" />
        <MoonIcon name="moon" className="moon" />
        <div className="toggle"></div>
        <div className="animateBg"></div>
      </div>

    </div>
  );
}

export default App;
