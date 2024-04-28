import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileDetailsPage = ({ fileName, onBack }) => {
  const [fileContent, setFileContent] = useState([]);
  const [rowsToRemove, setRowsToRemove] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/files/${fileName}`)
      .then(response => {
        const data = response.data;
        const formattedData = Object.entries(data).map(([key, value]) => ({ key, value }));
        setFileContent(formattedData);
      })
      .catch(error => {
        console.error(error);
        alert('Errore durante il recupero del contenuto del file');
      });
  }, [fileName]);

  const removeRow = (keyToRemove, valueToRemove) => {
    setRowsToRemove([...rowsToRemove, { key: keyToRemove, value: valueToRemove }]);
  };

  const formatData = (obj, depth = 0) => {
    return Object.entries(obj).map(([key, value]) => {
      const indent = '  '.repeat(depth);
      if (typeof value === 'object') {
        return (
          <div key={`${key}-${depth}`}>
            {indent}{key}:
            <div style={{ marginLeft: '20px' }}>{formatData(value, depth + 1)}</div>
          </div>
        );
      } else if (!rowsToRemove.find(row => row.key === key && row.value === value)) {
        return (
          <div key={`${key}-${depth}`}>
            {indent}{key}: {value}
            <button onClick={() => removeRow(key, value)}>Rimuovi riga</button>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div>
      <h2>Dettagli del File: {fileName}</h2>
      <button onClick={onBack} style={{ marginBottom: '20px' }}>Torna Indietro</button>
      {fileContent.map((row, index) => (
        <div key={index}>
          {formatData(row)}
        </div>
      ))}
    </div>
  );
};

export default FileDetailsPage;
