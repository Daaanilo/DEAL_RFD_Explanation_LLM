import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import FileDetailsPage from './FileDetailsPage';
import './App.css';
import './DarkModeProvider.css';
import { DarkModeContext } from './DarkModeProvider';
import { ReactComponent as CloudArrowUpFillIcon } from 'bootstrap-icons/icons/cloud-arrow-up-fill.svg';
import { ReactComponent as TrashIcon } from 'bootstrap-icons/icons/trash3-fill.svg';
import { ReactComponent as SearchIcon } from 'bootstrap-icons/icons/search.svg';
import { ReactComponent as PinIcon } from 'bootstrap-icons/icons/pin-fill.svg';
import { ReactComponent as PencilIcon } from 'bootstrap-icons/icons/pencil-square.svg';
import { ReactComponent as MoonIcon } from 'bootstrap-icons/icons/moon-fill.svg';
import { ReactComponent as SunIcon } from 'bootstrap-icons/icons/brightness-high-fill.svg';

function App() {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadButtonColor, setUploadButtonColor] = useState('#007bff');
  const [pinnedFiles, setPinnedFiles] = useState([]);
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? 'black' : '#f8f8f8';

    axios.get('http://localhost:5000/files')
      .then(response => {
        setFiles(response.data);
      })
      .catch(error => {
        console.error(error);
        alert('Error retrieving file names');
      });
  }, [darkMode]);


  const promptForNewFileName = () => {
    if (selectedFile) {
      let newName = window.prompt('Enter the file name:', selectedFile.name);
      
      while (newName !== null && newName.trim() === '') {
        alert('File name cannot be empty');
        newName = window.prompt('Enter the file name:', selectedFile.name);
      }
      
      if (newName === null) {
        return;
      }
  
      let fileNameToUpload = newName.trim();
  
      if (!fileNameToUpload.endsWith('.json')) {
        fileNameToUpload += '.json';
      }
  
      if (fileNameToUpload === selectedFile.name) {
        handleUpload();
        return;
      }
  
      const confirmUseNewName = window.confirm(`Do you want to use "${fileNameToUpload}" as the file name?`);
  
      if (confirmUseNewName) {
        setNewFileName(fileNameToUpload);
        handleUpload(fileNameToUpload);
      }
  
    } else {
      alert('Select a JSON file to upload');
    }
  };  

  const handleUpload = async (finalFileName = null) => {
  
    let existingFileNames = [];
    try {
      const response = await axios.get('http://localhost:5000/files');
      existingFileNames = response.data.map(file => file.fileName);
    } catch (error) {
      console.error(error);
      alert('Error retrieving file names');
      return;
    }
  
    let fileNameToUpload = finalFileName ? finalFileName : selectedFile.name;
  
    while (existingFileNames.includes(fileNameToUpload) || fileNameToUpload === '') {
      let newFileNameToUpload = window.prompt(`File name "${fileNameToUpload}" already exists. Please enter a new file name:`);
      if (newFileNameToUpload === null) {
        return;
      }
      if (newFileNameToUpload.trim() === '') {
        alert('File name cannot be empty');
      }
      else {
        let trimmedFileName = newFileNameToUpload.trim();
        if (!trimmedFileName.endsWith('.json')) {
          trimmedFileName += '.json';
        }
        fileNameToUpload = trimmedFileName;
      }
    }
  
    const formData = new FormData();
    formData.append('file', selectedFile, fileNameToUpload);
  
    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(response.data);
      const filesResponse = await axios.get('http://localhost:5000/files');
      setFiles(filesResponse.data);
    } catch (error) {
      console.error(error);
      alert('Error uploading JSON file');
    }
  };

  const handleEditFileName = async (fileId, currentFileName) => {
    let newName = window.prompt('Enter the new file name:', currentFileName);
    if (newName === null) {
      return;
    }
  
    newName = newName.trim();
  
    if (newName === '' || newName === '.json') {
      alert('File name cannot be empty.');
      return;
    }

    if (!newName.toLowerCase().endsWith('.json')) {
      alert('File name must end with ".json"');
      return;
    }
  
    try {
      const response = await axios.get('http://localhost:5000/files');
      const existingFileNames = response.data.map(file => file.fileName);
  
      if (existingFileNames.includes(newName)) {
        alert(`File name "${newName}" already exists. Please choose a different name.`);
        return;
      }
  
      const trimmedNewName = newName.trim();
      const updatedFiles = files.map(file => {
        if (file._id === fileId) {
          return { ...file, fileName: trimmedNewName };
        }
        return file;
      });
  
      setFiles(updatedFiles);
  
      const putResponse = await axios.put(`http://localhost:5000/files/${fileId}`, { fileName: trimmedNewName });
      alert(putResponse.data.message);
    } catch (error) {
      console.error(error);
      alert('Error updating file name');
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadButtonColor('#4caf50');
  };

  const handleFileNameClick = (fileName) => {
    setSelectedFileName(fileName);
  };

  const handleDelete = (fileId, event) => {
    event.stopPropagation();
    const confirmation = window.confirm(`Are you sure you want to delete this file?`);
    if (confirmation) {
      axios.delete(`http://localhost:5000/files/${fileId}`)
        .then(response => {
          alert(response.data.message);
          setFiles(files.filter(file => file._id !== fileId));
        })
        .catch(error => {
          console.error(error);
          alert('Error deleting file');
        });
    }
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
    setSelectedFileName(null);
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

      {!selectedFileName && (
        <>
          <section className="wrapper">
            <div className="top">JSONInsight</div>
            <div className="bottom" aria-hidden="true">JSONInsight</div>
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

      {!selectedFileName ? (
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
                <p>{file.fileName}</p>
                <button className="remove-btn" onClick={(event) => handleDelete(file._id, event)}><TrashIcon /></button>
                <button className="pin-btn" onClick={(event) => handlePinToggle(file._id, event)}>
                  <PinIcon fill="#f00" />
                </button>
                <button className="edit-btn" onClick={(event) => event.stopPropagation()} onMouseDown={() => handleEditFileName(file._id, file.fileName)}>
                  <PencilIcon fill={darkMode ? "#fff" : "#000"} />
                </button>
                <p>{file.timestamp}</p>
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
                onDrop={(e) => handleDrop(e, pinnedFilesList.length + index)}>
                <i className="fas fa-file"></i>
                <p>{file.fileName}</p>
                <button className="remove-btn" onClick={(event) => handleDelete(file._id, event)}><TrashIcon /></button>
                <button className="pin-btn" onClick={(event) => handlePinToggle(file._id, event)}>
                  <PinIcon fill={darkMode ? "#fff" : (pinnedFiles.includes(file._id) ? "#f00" : "#000")} />
                </button>
                <button className="edit-btn" onClick={(event) => event.stopPropagation()} onMouseDown={() => handleEditFileName(file._id, file.fileName)}>
                  <PencilIcon fill={darkMode ? "#fff" : "#000"} />
                </button>
                <p>{file.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <FileDetailsPage fileName={selectedFileName} onBack={handleBack} />
      )}

      {!selectedFileName && (
        <div className="upload-section">
          <input id="file-upload" type="file" onChange={handleFileChange} />
          <button id="upload" style={{ backgroundColor: uploadButtonColor }} onClick={promptForNewFileName}><CloudArrowUpFillIcon /></button>
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
