// FileDetailsPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileDetailsPage.css';

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
          <div key={`${key}-${depth}`} className="nested">
            <span className="key">{indent}{key}: </span>
            <div className="value">{formatData(value, depth + 1)}</div>
          </div>
        );
      } else if (!rowsToRemove.find(row => row.key === key && row.value === value)) {
        return (
          <div key={`${key}-${depth}`} className="row">
            <span className="key">{indent}{key}: </span>
            <div className="value">
              <button className="remove-btn" onClick={() => removeRow(key, value)}>❌</button>
              <span>{value}</span>
            </div>
          </div>
        );
      }
      return null;
    });
  };
  

  return (
    <div className="file-details">
      <h2 className="title">Dettagli del File: {fileName}</h2>
      <button className="back-btn" onClick={onBack}>Torna Indietro</button>
      <div className="content">
        {fileContent.map((row, index) => (
          <div key={index} className="content-row">
            {formatData(row)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileDetailsPage;
