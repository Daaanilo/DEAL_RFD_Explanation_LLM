import { ReactComponent as CloudArrowUpFillIcon } from 'bootstrap-icons/icons/cloud-arrow-up-fill.svg';
import { ReactComponent as TrashIcon } from 'bootstrap-icons/icons/trash3-fill.svg';
import { ReactComponent as SearchIcon } from 'bootstrap-icons/icons/search.svg';
import { ReactComponent as PinIcon } from 'bootstrap-icons/icons/pin-fill.svg';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileDetailsPage from './FileDetailsPage';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadButtonColor, setUploadButtonColor] = useState('#007bff');
  const [pinnedFiles, setPinnedFiles] = useState([]);

  useEffect(() => {
    document.body.style.backgroundColor = '#eceff1';

    axios.get('http://localhost:5000/files')
      .then(response => {
        setFiles(response.data);
        setFadeIn(true);
      })
      .catch(error => {
        console.error(error);
        alert('Error retrieving file names');
      });
  }, []);

  const handleUpload = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
  
      axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(response => {
        alert(response.data);
        setSelectedFile(null);
        setUploadButtonColor('#007bff');
        axios.get('http://localhost:5000/files')
          .then(response => {
            setFiles(response.data);
          })
          .catch(error => {
            console.error(error);
            alert('Error retrieving file names');
          });
      }).catch(error => {
        console.error(error);
        alert('Error uploading JSON file');
      });
    } else {
      alert('Select a JSON file to upload');
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
    <div className={`app-container ${fadeIn ? 'fade-in' : ''}`}>

      {!selectedFileName && (
        <>
          <section class="wrapper">
            <div class="top">JSONInsight</div>
            <div class="bottom" aria-hidden="true">JSONInsight</div>
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
                onDrop={(e) => handleDrop(e, index)}>
                <i className="fas fa-file"></i>
                <p>{file.fileName}</p>
                <button className="remove-btn" onClick={(event) => handleDelete(file._id, event)}><TrashIcon /></button>
                <button className="pin-btn" onClick={(event) => handlePinToggle(file._id, event)}>
                  <PinIcon fill="#f00" />
                </button>
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
                  <PinIcon fill={pinnedFiles.includes(file._id) ? "#f00" : "#000"} />
                </button>
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
          <button id="upload" style={{ backgroundColor: uploadButtonColor }} onClick={handleUpload}><CloudArrowUpFillIcon /></button>
        </div>
      )}
    </div>
  );
}

export default App;
