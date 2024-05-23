import React, { useState, useEffect } from 'react';
import { ReactComponent as DatabaseIcon } from 'bootstrap-icons/icons/database.svg';
import { ReactComponent as AspectRatioIcon } from 'bootstrap-icons/icons/aspect-ratio.svg';
import { ReactComponent as ColumnsIcon } from 'bootstrap-icons/icons/columns.svg';
import { ReactComponent as PcDisplayIcon } from 'bootstrap-icons/icons/pc-display.svg';
import { ReactComponent as BugIcon } from 'bootstrap-icons/icons/bug.svg';
import { ReactComponent as RobotIcon } from 'bootstrap-icons/icons/robot.svg';
import { ReactComponent as Graph } from 'bootstrap-icons/icons/diagram-2.svg';
import { ReactComponent as ToggleOffIcon } from 'bootstrap-icons/icons/toggle-off.svg';
import { ReactComponent as ToggleOnIcon } from 'bootstrap-icons/icons/toggle-on.svg';
import { ReactComponent as PressedIcon } from 'bootstrap-icons/icons/check-square-fill.svg';
import { ReactComponent as NotPressedIcon } from 'bootstrap-icons/icons/square.svg';

import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './FileDetailsPage.css';
const { handleUserInput } = require('./chatgptapi.js');

const FileDetailsPage = ({ fileName, onBack }) => {
  const [fileContent, setFileContent] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTextGenerated, setIsTextGenerated] = useState(false);
  const [responseAI, setResponseAI] = useState("Ciao come posso aiutarti?");
  const [allRFDs, setAllRFDs] = useState([]);
  const [cardVisibility, setCardVisibility] = useState({ infoDataset: true, sizeAndFormat: true, columnAndRowNumber: true, executionInfo: true, graphs: true, rfd: true, prompt: true, error: true, generatedText: true });

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
        if (item.execution && item.execution.result && item.execution.result.data && item.execution.result.data.length) {
          item.execution.result.data.forEach(resultData => {
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
    const visibleRFDsIndexes = allRFDs
      .map((_, index) => index)
      .filter(index => !selectedHeaderValues.some(value => allRFDs[index].includes(value)));

    if (selectedRows.length === visibleRFDsIndexes.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(visibleRFDsIndexes);
    }
  };

  const scrollToBottom = async () => {
    if (selectedRows.length === 0) {
      alert('Selezionare una o piÃ¹ RFDs');
    } else {
      if (window.confirm('Sei sicuro di voler generare il testo?')) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

        setIsLoading(true);
        const selectedRFDs = selectedRows.map(index => allRFDs[index]);
        alert(selectedRFDs)
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

  const toggleCardVisibility = (cardName) => {
    setCardVisibility({
      ...cardVisibility,
      [cardName]: !cardVisibility[cardName]
    });
  };

  const countAttributes = (rfdArray) => {
    let lhsCount = 0;
    let rhsCount = 0;

    rfdArray.forEach(rfd => {
      const [lhs, rhs] = rfd.split(' -> ');
      lhsCount += lhs.split(' ').length;
      rhsCount += rhs.split(' ').length;
    });

    return { lhsCount, rhsCount };
  };

  const { lhsCount, rhsCount } = countAttributes(allRFDs);

  const chartData = {
    labels: ['LHS', 'RHS'],
    datasets: [
      {
        label: 'Number of Attributes',
        data: [lhsCount, rhsCount],
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="file-details">
      <h2 className="title">Dettagli del File: {fileName}</h2>
      <button className="back-btn" onClick={onBack}>Torna Indietro</button>

      <div className="container">
        <div className="card mb-3">
          <div className="d-flex justify-content-between align-items-center card-header">
            <span>INFO DATASET <DatabaseIcon /></span>
            <div>
              {cardVisibility.infoDataset ? (
                <ToggleOnIcon onClick={() => toggleCardVisibility('infoDataset')} />
              ) : (
                <ToggleOffIcon onClick={() => toggleCardVisibility('infoDataset')} />
              )}
            </div>
          </div>
          {cardVisibility.infoDataset && (
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
                            <div>
                              {selectedHeaderValues.includes(item) ? (
                                <NotPressedIcon onClick={() => toggleHeaderSelection(item)} />
                              ) : (
                                <PressedIcon onClick={() => toggleHeaderSelection(item)} />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="card mb-3">
                      <div className="d-flex justify-content-between align-items-center card-header">
                        <span>Size & Format <AspectRatioIcon /></span> {cardVisibility.sizeAndFormat ? <ToggleOnIcon onClick={() => toggleCardVisibility('sizeAndFormat')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('sizeAndFormat')} />}</div>
                      {cardVisibility.sizeAndFormat && (
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
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card mb-3">
                      <div className="d-flex justify-content-between align-items-center card-header">
                        <span>Column & Row Number <ColumnsIcon /></span>{cardVisibility.columnAndRowNumber ? <ToggleOnIcon onClick={() => toggleCardVisibility('columnAndRowNumber')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('columnAndRowNumber')} />}</div>
                      {cardVisibility.columnAndRowNumber && (
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
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card mb-3">
          <div className="d-flex justify-content-between align-items-center card-header">
            <span>EXECUTION INFO <PcDisplayIcon /></span>
            <div>
              {cardVisibility.executionInfo ? (
                <ToggleOnIcon onClick={() => toggleCardVisibility('executionInfo')} />
              ) : (
                <ToggleOffIcon onClick={() => toggleCardVisibility('executionInfo')} />
              )}
            </div>
          </div>
          {cardVisibility.executionInfo && (
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
          )}
        </div>

        <div className="card mb-3">
          <div className="d-flex justify-content-between align-items-center card-header">
            <span>GRAFICI <Graph /> </span>
            {cardVisibility.graphs ? <ToggleOnIcon onClick={() => toggleCardVisibility('graphs')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('graphs')} />}</div>
          {cardVisibility.graphs && (
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          )}
        </div>

        <div className="card mb-3">
          <div className="d-flex justify-content-between align-items-center card-header">
            <span>RFDs </span>{cardVisibility.rfd ? <ToggleOnIcon onClick={() => toggleCardVisibility('rfd')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('rfd')} />}</div>
          {cardVisibility.rfd && (
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
          )}
        </div>

        <div className="card mb-3">
          <div className="d-flex justify-content-between align-items-center card-header">
            <span>ERROR <BugIcon /> </span>
            {cardVisibility.error ? <ToggleOnIcon onClick={() => toggleCardVisibility('error')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('error')} />}</div>
          {cardVisibility.error && (
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
          )}
        </div>


        <div className="card mb-3">
        <div className="d-flex justify-content-between align-items-center card-header">
          <span>PROMPT <RobotIcon/></span>
           {cardVisibility.prompt ? <ToggleOnIcon onClick={() => toggleCardVisibility('prompt')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('prompt')} />}</div>
            {cardVisibility.prompt && (
              <div className="card-body">
                <input
                   type="text"
                   value={responseAI}
                   onChange={(e) => setResponseAI(e.target.value)}
                />
              </div>
            )}
          </div>

        <div className="card mb-3">
          <div className="d-flex justify-content-between align-items-center card-header">
            <span>TESTO GENERATO <RobotIcon /></span> {cardVisibility.generatedText ? <ToggleOnIcon onClick={() => toggleCardVisibility('generatedText')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('generatedText')} />}</div>
          {cardVisibility.generatedText && (
            <div className="card-body">
              {isTextGenerated && (
                <p>{responseAI}</p>
              )}
            </div>
          )}
        </div>

        <div style={{ height: '100px' }}></div>

        <div className="fixed-button-container">
          <button className="fixed-button" onClick={scrollToBottom}>
            {isLoading ? "Caricamento..." : "Genera testo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileDetailsPage;