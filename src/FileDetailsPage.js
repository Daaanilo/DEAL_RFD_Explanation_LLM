import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileDetailsPage = ({ fileName, onBack }) => {
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/files/${fileName}`)
      .then(response => {
        setFileContent(response.data);
      })
      .catch(error => {
        console.error(error);
        alert('Errore durante il recupero del contenuto del file');
      });
  }, [fileName]);

  return (
    <div>
      <h2>Dettagli del File: {fileName}</h2>
      <button onClick={onBack} style={{ marginBottom: '20px' }}>Torna Indietro</button>
      <pre>{JSON.stringify(fileContent, null, 2)}</pre>
    </div>
  );
}

export default FileDetailsPage;
