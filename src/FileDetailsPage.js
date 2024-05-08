import React, { useState, useEffect } from 'react';
import { ReactComponent as DatabaseIcon } from 'bootstrap-icons/icons/database.svg';
import { ReactComponent as AspectRatioIcon } from 'bootstrap-icons/icons/aspect-ratio.svg';
import { ReactComponent as ColumnsIcon } from 'bootstrap-icons/icons/columns.svg';
import { ReactComponent as PcDisplayIcon } from 'bootstrap-icons/icons/pc-display.svg';
import { ReactComponent as BugIcon } from 'bootstrap-icons/icons/bug.svg';
import { ReactComponent as RobotIcon } from 'bootstrap-icons/icons/robot.svg';
import axios from 'axios';
import './FileDetailsPage.css';
const { handleUserInput } = require('./chatgptapi.js');

const FileDetailsPage = ({ fileName, onBack }) => {
  const [fileContent, setFileContent] = useState([]);
  const [rowsToRemove, setRowsToRemove] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTextGenerated, setIsTextGenerated] = useState(false);
  const [responseAI, setResponseAI] = useState(""); // Stato per salvare la risposta generata dall'IA

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

  const toggleRowSelection = (index) => {
    const selectedIndex = selectedRows.indexOf(index);
    if (selectedIndex === -1) {
      setSelectedRows([...selectedRows, index]);
    } else {
      setSelectedRows(selectedRows.filter(i => i !== index));
    }
  };

  const scrollToBottom = async () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    if (selectedRows.length === 0) {
      alert('Selezionare una o più RFDs');
    } else {
      if (window.confirm('Sei sicuro di voler generare il testo?')) {
        setIsLoading(true);
        const selectedCC = selectedRows.map(index => cc[index]);
        const response = await handleUserInput("ciao"); // Chiamata alla funzione che gestisce l'input utente
        setResponseAI(response); // Salvare la risposta generata dall'IA nello stato locale
        setIsTextGenerated(true);
        setIsLoading(false);
      }
    }
  };
  

  
  // INFO DATASET
  let name = [];
  let size = [];
  let format = [];
  let col_number = [];
  let row_number = [];

  // EXECUTION INFO
  let os = [];
  let os_version = [];
  let processor = [];
  let thread = [];
  let core = [];
  let ram = [];

  // ERROR
  let time_limit = [];
  let memory_limit = [];
  let general_error = [];

  let cc = [];

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
        switch (key) {
          case 'name':
            name.push(value);
            break;
          case 'size':
            size.push(value);
            break;
          case 'format':
            format.push(value);
            break;
          case 'col_number':
            col_number.push(value);
            break;
          case 'row_number':
            row_number.push(value);
            break;
          case 'cc':
            cc.push(value);
            break;
          case 'os':
            os.push(value);
            break;
          case 'os_version':
            os_version.push(value);
            break;
          case 'processor':
            processor.push(value);
            break;
          case 'thread':
            thread.push(value);
            break;
          case 'core':
            core.push(value);
            break;
          case 'ram':
            ram.push(value);
            break;
          case 'time_limit':
            time_limit.push(value);
            break;
          case 'memory_limit':
            memory_limit.push(value);
            break;
          case 'general_error':
            general_error.push(value);
            break;
        }

        return (
          <div key={`${key}-${depth}`} className="card">
            <div className="card-content">
              <span className="key">{indent}{key}: </span>
              <div className="value">
                <button className="remove-btn" onClick={() => removeRow(key, value)}>❌</button>
                <div className="cell">{value}</div>
              </div>
            </div>
          </div>
        );
      }

      return null;
    });
  };

  fileContent.forEach(row => formatData(row));

  return (
    <div className="file-details">
      <h2 className="title">Dettagli del File: {fileName}</h2>
      <button className="back-btn" onClick={onBack}>Torna Indietro</button>

      <div className="container">
        <div className="card mb-3">
          <div className="card-header">INFO DATASET <DatabaseIcon /></div>
          <div className="card-body">
            <div className="container">
              <div className="card mb-3">
                <div className="card-header">Header</div>
                <div className="card-body d-flex flex-row">
                  {name.map((item, index) => (
                    <div className="card m-1" key={index}>
                      <div className="card-body">{item}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header">Size & Format <AspectRatioIcon /></div>
                    <div className="card-body">
                      {size.map((item, index) => (
                        <div key={index}>
                          <strong>Size:</strong> {item} <br />
                          <strong>Format:</strong> {format[index]}
                          <hr />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header">Column & Row Number <ColumnsIcon /></div>
                    <div className="card-body">
                      {col_number.map((item, index) => (
                        <div key={index}>
                          <strong>Column:</strong> {item} <br />
                          <strong>Row:</strong> {row_number[index]}
                          <hr />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card mb-3">
          <div className="card-header">EXECUTION INFO <PcDisplayIcon /></div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-12">
                <div className="card-body">
                  {os.map((item, index) => (
                    <div key={index}>
                      <strong>Os:</strong> {item} <br />
                      <strong>Os Version:</strong> {os_version[index]} <br />
                      <strong>Processor:</strong> {processor[index]} <br />
                      <strong>Thread:</strong> {thread[index]} <br />
                      <strong>Core:</strong> {core[index]} <br />
                      <strong>Ram:</strong> {ram[index]} <br />
                      <hr />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">RFDs</div>
        <div className="card-body">
          {cc.map((item, index) => (
            <div key={index}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(index)}
                  onChange={() => toggleRowSelection(index)}
                />
                {item}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">ERROR <BugIcon /></div>
          <div className="card-body">
            {time_limit.map((item, index) => (
              <div key={index}>
                <strong>Time Limit:</strong> {item} <br />
                <strong>Memory Limit:</strong> {memory_limit[index]} <br />
                <strong>General Error:</strong> {general_error[index]} <br />
                <hr />
              </div>
            ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">TESTO GENERATO <RobotIcon /></div>
        <div className="card-body">
          {isTextGenerated && (
            <p>{responseAI}</p>
          )}
        </div>
      </div>

      <div className="fixed-button-container">
        <button className="fixed-button" onClick={scrollToBottom}>
          {isLoading ? "Caricamento..." : "Genera testo"}
        </button>
      </div>
    </div>
  );
};

export default FileDetailsPage;