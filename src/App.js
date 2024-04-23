import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileNames, setFileNames] = useState([]);

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

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Carica File</button>

      <h2>Nomi dei file nel database:</h2>
      <ul>
        {fileNames.map((fileName, index) => (
          <li key={index}>{fileName}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
