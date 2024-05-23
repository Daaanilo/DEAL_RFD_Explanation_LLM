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
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTextGenerated, setIsTextGenerated] = useState(false);
  const [responseAI, setResponseAI] = useState("");
  const [allRFDs, setAllRFDs] = useState([]);

  const info = {
    name: [],
    header: [],
    size: [],
    format: [],
    col_number: [],
    row_number: [],
    separator: [],
    blank_char: [],

    os: [],
    os_version: [],
    processor: [],
    thread: [],
    core: [],
    ram: [],
    
    time_limit: [],
    memory_limit: [],
    general_error: []
  };

  const header = [];

  useEffect(() => {
    axios.get(`http://localhost:5000/files/${fileName}`)
      .then(response => {
        const data = response.data;
        if (data) {
          const formattedData = Object.entries(data).map(([key, value]) => ({ key, value }));
          setFileContent(formattedData);
          extractLhsAndRhs(data);
        } else {
          console.error('Dati non definiti o nulli');
        }
      })
      .catch(error => {
        console.error(error);
        alert('Errore durante il recupero del contenuto del file');
      });
  }, [fileName]);
  

  const extractLhsAndRhs = (data) => {
    const extractedRFDs = [];
    
    if (data && data.length) {
      data.forEach(item => {
        if (item.execution && item.execution.result && item.execution.result.length) {
          item.execution.result.forEach(execution => {
            if (execution.data && execution.data.length) {
              execution.data.forEach(resultData => {
                if (resultData.lhs && resultData.rhs) {
                  const lhsColumns = resultData.lhs.map(lhsItem => `${lhsItem.column}@${lhsItem.comparison_relaxation.toFixed(1)}`).join(' ');
                  const rhsColumns = resultData.rhs.map(rhsItem => `${rhsItem.column}@${rhsItem.comparison_relaxation.toFixed(1)}`).join(' ');
                  const rfdString = `${lhsColumns} -> ${rhsColumns}`;
                  extractedRFDs.push(rfdString);
                }
              });
            }
          });
        }
      });
    } 
    
    setAllRFDs(extractedRFDs);
  };
  

  const toggleRowSelection = (index) => {
    const selectedIndex = selectedRows.indexOf(index);
    if (selectedIndex === -1) {
      setSelectedRows([...selectedRows, index]);
    } else {
      setSelectedRows(selectedRows.filter(i => i !== index));
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === allRFDs.length) {
      setSelectedRows([]);
    } else {
      const allIndexes = allRFDs.map((_, index) => index);
      setSelectedRows(allIndexes);
    }
  };

  const scrollToBottom = async () => {
    if (selectedRows.length === 0) {
      alert('Selezionare una o più RFDs');
    } else {
      if (window.confirm('Sei sicuro di voler generare il testo?')) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

        setIsLoading(true);
        const selectedRFDs = selectedRows.map(index => allRFDs[index]);
        //alert(selectedRFDs)
        const response = await handleUserInput(
          "Potresti spiegarmi il significato delle seguenti dipendenze RFD?"
        + "Vorrei una comprensione approfondita delle variabili coinvolte e delle relative soglie di tolleranza. Per esempio, nel seguente elenco di dipendenze:"
        + selectedRFDs
        + "Vorrei una disamina approfondita delle variabili coinvolte in ciascuna dipendenza, insieme alle rispettive soglie di tolleranza. Grazie!"
      );
        setResponseAI(response);
        setIsTextGenerated(true);
        setIsLoading(false);
      }
    }
  };


  const formatData = (obj, depth = 0) => {
    return Object.entries(obj).map(([key, value]) => {
      const indent = '  '.repeat(depth);
      if (key === 'header') {
        header.push(value);
      }
  
      if (typeof value === 'object' && value !== null) {
        return `${indent}${key}: ${formatData(value, depth + 1)}`;
      }
      if (info.hasOwnProperty(key)) { 
        const uniqueValues = new Set(info[key]);
        if (!uniqueValues.has(value)) {
          info[key].push(value);
        }
      }
      return null;
    });
  };
  const [selectedHeaderValues, setSelectedHeaderValues] = useState([]);

  const toggleHeaderSelection = (value) => {
    const selectedIndex = selectedHeaderValues.indexOf(value);
    if (selectedIndex === -1) {
      setSelectedHeaderValues([...selectedHeaderValues, value]);
    } else {
      setSelectedHeaderValues(selectedHeaderValues.filter(item => item !== value));
    }
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
                  {header && header[0] && (
          <div className="card-body d-flex flex-row flex-wrap">
            {header[0].map((item, index) => (
              <div key={index} className="card mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span>{item}</span>
                  <input
                    type="checkbox"
                    checked={selectedHeaderValues.includes(item)}
                    onChange={() => toggleHeaderSelection(item)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header">Size & Format <AspectRatioIcon /></div>
                    <div className="card-body">
                      {info.size.map((item, index) => (
                        <div key={index}>
                          <strong>Size:</strong> {item} <br />
                          <strong>Format:</strong> {info.format[index]} <br />
                          <strong>Separator:</strong> {info.separator[index]}
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
                      {info.col_number.map((item, index) => (
                    <div key={index}>
                    <strong>Column:</strong> {item} <br />
                    <strong>Row:</strong> {info.row_number[index]} <br />
                    <strong>Blank char:</strong> {info.blank_char[index]}
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
                            {info.os.map((item, index) => (
                              <div key={index}>
                                <strong>Os:</strong> {item} <br />
                                <strong>Os Version:</strong> {info.os_version[index]} <br />
                                <strong>Processor:</strong> {info.processor[index]} <br />
                                <strong>Thread:</strong> {info.thread[index]} <br />
                                <strong>Core:</strong> {info.core[index]} <br />
                                <strong>Ram:</strong> {info.ram[index]} <br />
                                <hr />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

            <div className="container">
              <div className="card mb-3">
                <div className="card-header">RFDs</div>
                <div className="card-body">
                  <button onClick={toggleSelectAll}>
                    {selectedRows.length === allRFDs.length ? "Deseleziona tutte" : "Seleziona tutte"}
                  </button>
                  <ul style={{ whiteSpace: 'pre-wrap' }}>
                    {allRFDs.map((rfd, index) => {
                      const containsSelectedHeader = selectedHeaderValues.some(value => rfd.includes(value));
                      if (containsSelectedHeader) {
                        return null;
                      }
                      return (
                        <li key={index}>
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(index)}
                            onChange={() => toggleRowSelection(index)}
                          />
                          {rfd}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            <div className="container">
              <div className="card mb-3">
                <div className="card-header">ERROR <BugIcon /></div>
                <div className="card-body">
                  {info.time_limit.map((item, index) => (
                    <div key={index}>
                      <strong>Time Limit:</strong> {item} <br />
                      <strong>Memory Limit:</strong> {info.memory_limit[index]} <br />
                      <strong>General Error:</strong> {info.general_error[index]} <br />
                      <hr />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="container">
              <div className="card mb-3">
                <div className="card-header">TESTO GENERATO <RobotIcon /></div>
                <div className="card-body">
                  {isTextGenerated && (
                    <p>{responseAI}</p>
                  )}
                </div>
              </div>
            </div>

            <div style={{ height: '100px' }}></div>

            <div className="fixed-button-container">
              <button className="fixed-button" onClick={scrollToBottom}>
                {isLoading ? "Caricamento..." : "Genera testo"}
              </button>
            </div>
          </div>
        );
      };

      export default FileDetailsPage;

