import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileDetailsPage from './FileDetailsPage';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileNames, setFileNames] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState(null);

  useEffect(() => {
    // Effettua una richiesta al server per ottenere i nomi dei file una volta che il componente è montato
    axios.get('http://localhost:5000/files')
      .then(response => {
        setFileNames(response.data);
      })
      .catch(error => {
        console.error(error);
        alert('Errore durante il recupero dei nomi dei file');
      });
  }, []); // Assicurati che questo effetto venga eseguito solo una volta

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
        // Aggiorna i nomi dei file dopo aver caricato un nuovo file
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
    event.stopPropagation(); // Impedisci la propagazione dell'evento
    axios.delete(`http://localhost:5000/files/${fileName}`)
      .then(response => {
        alert(response.data.message);
        // Aggiorna i nomi dei file dopo l'eliminazione
        setFileNames(fileNames.filter(name => name !== fileName));
      })
      .catch(error => {
        console.error(error);
        alert('Errore durante l\'eliminazione del file');
      });
  };

  const handleBack = () => {
    setSelectedFileName(null);
  };

  return (
    <div>
      {!selectedFileName ? (
        <div>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>Carica File</button>

          <h2>Nomi dei file nel database:</h2>
          <ul>
            {fileNames.map((fileName, index) => (
              <li key={index} onClick={() => handleFileNameClick(fileName)} style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}>
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
