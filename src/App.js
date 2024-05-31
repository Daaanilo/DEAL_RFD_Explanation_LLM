import { ReactComponent as CloudPlusFillIcon } from 'bootstrap-icons/icons/cloud-plus-fill.svg';
import { ReactComponent as CloudArrowUpFillIcon } from 'bootstrap-icons/icons/cloud-arrow-up-fill.svg';
import { ReactComponent as TrashIcon } from 'bootstrap-icons/icons/trash3-fill.svg';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileDetailsPage from './FileDetailsPage';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);

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

  /*
    const handleMouseMove = (event) => {
      const x = event.clientX / window.innerWidth * 100;
      const y = event.clientY / window.innerHeight * 100;
      document.body.style.background = `radial-gradient(75px circle at ${x}% ${y}%, #99bdf6 0%, #eceff1 100%)`;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  */

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

  return (
    <div className={fadeIn ? 'fade-in' : ''}>
      {!selectedFileName ? (
        <div>
          <div className="upload-container">
            <input type="file" onChange={handleFileChange} />
            <button id="upload" onClick={handleUpload}><CloudArrowUpFillIcon /></button>
          </div>
          <h2>Files in the database:</h2>
          <div className="file-container">
            {files.map((file, index) => (
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
    </div>
  );
}

export default App;
