import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileDetailsPage from './FileDetailsPage';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileNames, setFileNames] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/files')
      .then(response => {
        setFileNames(response.data);
        setFadeIn(true);
      })
      .catch(error => {
        console.error(error);
        alert('Errore durante il recupero dei nomi dei file');
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
            setFileNames(response.data);
          })
          .catch(error => {
            console.error(error);
            alert('Errore durante il recupero dei nomi dei file');
          });
      }).catch(error => {
        console.error(error);
        alert('Errore durante il caricamento del file JSON');
      });
    } else {
      alert('Seleziona un file JSON da caricare');
    }
  };

  const handleFileNameClick = (fileName) => {
    setSelectedFileName(fileName);
  };

  const handleDelete = (fileName, event) => {
    event.stopPropagation();
    const confirmation = window.confirm(`Sei sicuro di voler eliminare il file "${fileName}"?`);
    if (confirmation) {
      axios.delete(`http://localhost:5000/files/${fileName}`)
        .then(response => {
          alert(response.data.message);
          setFileNames(fileNames.filter(name => name !== fileName));
        })
        .catch(error => {
          console.error(error);
          alert('Errore durante l\'eliminazione del file');
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
            <button id="caricamento" onClick={handleUpload}>Carica File</button>
          </div>
          <h2>File nel database:</h2>
          <ul>
            {fileNames.map((fileName, index) => (
              <li key={index} onClick={() => handleFileNameClick(fileName)} >
                {fileName}
                <button onClick={(event) => handleDelete(fileName, event)}>Elimina</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <FileDetailsPage fileName={selectedFileName} onBack={handleBack} />
      )}
    </div>
  );
}

export default App;
