import { ReactComponent as CloudArrowUpFillIcon } from 'bootstrap-icons/icons/cloud-arrow-up-fill.svg';
import { ReactComponent as TrashIcon } from 'bootstrap-icons/icons/trash3-fill.svg';
import { ReactComponent as SearchIcon } from 'bootstrap-icons/icons/search.svg';
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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

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

  const handleBack = () => {
    setSelectedFileName(null);
  };

  const filteredFiles = files.filter(file => file.fileName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={`app-container ${fadeIn ? 'fade-in' : ''}`}>
      {!selectedFileName && (
        <>
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
            {filteredFiles.map((file, index) => (
              <div className="desktop-icon" key={index} onClick={() => handleFileNameClick(file._id)} >
                <i className="fas fa-file"></i>
                <p>{file.fileName}</p>
                <button className="remove-btn" onClick={(event) => handleDelete(file._id, event)}><TrashIcon /></button>
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
          <button id="upload" onClick={handleUpload}><CloudArrowUpFillIcon /></button>
        </div>
      )}
    </div>
  );
}

export default App;
