import React, { useState, useEffect } from 'react';
import { ReactComponent as DatabaseIcon } from 'bootstrap-icons/icons/database.svg';
import { ReactComponent as AspectRatioIcon } from 'bootstrap-icons/icons/aspect-ratio.svg';
import { ReactComponent as ColumnsIcon } from 'bootstrap-icons/icons/columns.svg';
import { ReactComponent as PcDisplayIcon } from 'bootstrap-icons/icons/pc-display.svg';
import { ReactComponent as Chart } from 'bootstrap-icons/icons/diagram-2.svg';
import { ReactComponent as BugIcon } from 'bootstrap-icons/icons/bug.svg';
import { ReactComponent as CpuIcon } from 'bootstrap-icons/icons/cpu.svg';
import { ReactComponent as RobotIcon } from 'bootstrap-icons/icons/robot.svg';
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
  const [allRFDs, setAllRFDs] = useState([]);
  
  const [responseAI, setResponseAI] = useState();
  const initialPrompt = "I would like a thorough understanding of the RFD dependencies listed below, "+
  "including a detailed analysis of the variables involved and the related tolerance thresholds. "+
  "I want an overall summary that explains the general concept of these dependencies, "+
  "how variables interact with each other and how tolerance thresholds affect these relationships. The dependencies are as follows:\n";
  const [promptAI, setPromptAI] = useState("");

  const [cardVisibility, setCardVisibility] = useState({
    infoDataset: true,
    header: true,
    sizeAndFormat: true,
    columnAndRowNumber: true,
    executionInfo: true,
    system: true,
    executionParameters: true,
    result: true,
    timeExecution: true,
    ramUsage: true,
    error: true,
    graphs: true,
    rfd: true,
    prompt: true,
    generatedText: true
  });

  const info = {
    name: [],
    header: [],

    size: [],
    format: [],
    separator: [],

    col_number: [],
    row_number: [],
    blank_char: [],
    
    os: [],
    os_version: [],
    processor: [],
    thread: [],
    core: [],
    ram: [],

    execution_command: [],
    max_execution_time: [],
    max_ram_usage: [],
    start_time: [],
    end_time: [],

    unit: [],
    dataset_loading: [],
    preprocessing: [],
    discovery: [],
    total: [],

    //unit: [],
    max_ram_used: [],

    time_limit: [],
    memory_limit: [],
    general_error: []
  };
  const header = [];

  // RETRIEVING FILE

  useEffect(() => {
    axios.get(`http://localhost:5000/files/${fileName}`)
      .then(response => {
        const data = response.data;
        if (data) {
          const formattedData = Object.entries(data).map(([key, value]) => ({ key, value }));
          setFileContent(formattedData);
          extractLhsAndRhs(data);
        } else {
          console.error('Undefined or null data');
        }
      })
      .catch(error => {
        console.error(error);
        alert('Error retrieving file contents');
      });
  }, [fileName]);

  // EXTRACT INFORMATION

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

  // MAKE THE RFDS

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

  // HIDE/SELECT ROWS/CARDS

  const toggleRowSelection = (index) => {
    setSelectedRows(prevSelectedRows => {
      const selectedIndex = prevSelectedRows.indexOf(index);
      const updatedSelectedRows = selectedIndex === -1 ? [...prevSelectedRows, index] : prevSelectedRows.filter(i => i !== index);
      return updatedSelectedRows;
    });
  };
  

  const toggleSelectAll = () => {
    const visibleRFDsIndexes = allRFDs.map((_, index) => index).filter(index => !selectedHeaderValues.some(value => allRFDs[index].includes(value)));
    setSelectedRows(selectedRows.length === visibleRFDsIndexes.length ? [] : visibleRFDsIndexes);
  };

  const [selectedHeaderValues, setSelectedHeaderValues] = useState([]);
  const toggleHeaderSelection = (value) => {
    setSelectedHeaderValues(selectedHeaderValues.includes(value) ? selectedHeaderValues.filter(item => item !== value) : [...selectedHeaderValues, value]);
  };

  fileContent.forEach(row => formatData(row));

  const toggleCardVisibility = (cardName) => {
    setCardVisibility({ ...cardVisibility, [cardName]: !cardVisibility[cardName] });
  };


  // GENERATE TEXT

  const scrollToBottom = async () => {

    if (selectedRows.length === 0) {
      alert('Select one or more RFDs');
      return;
    }
  
    const selectedRFDs = selectedRows.map(index => allRFDs[index]);
    const support = promptAI;
    setPromptAI(promptAI + selectedRFDs.join('\n'));
  
    await new Promise(resolve => setTimeout(resolve, 0));
  
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

    await new Promise(resolve => {
      const checkIfScrolled = () => {
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
          resolve();
        } else {
          requestAnimationFrame(checkIfScrolled);
        }
      };
      checkIfScrolled();
    });
  

    if (window.confirm('Are you sure you want to generate the text?')) {
      setIsLoading(true);

      const response = await handleUserInput(support ? support + selectedRFDs.join('\n') : promptAI + selectedRFDs.join('\n'));
      setResponseAI(response);
      setIsTextGenerated(true);
      setIsLoading(false);
    }
  };

  // CHARTS

  const filterRFDs = (rfdArray, attributesHeader) => {
    const filteredArray = rfdArray.filter(rfd => {
      return !attributesHeader.some(attribute => rfd.includes(attribute));
    });  
    return filteredArray;
  };

  const countLHSAttributes = (rfdArray, attributesHeader) => {
    const lhsCount = {};
    rfdArray.forEach(rfd => {
      const lhs = rfd.split(' -> ')[0];
      const attributes = lhs.match(/[^@]+@[\d.]+/g) || [];
      const numAttributes = attributes.length;
      if (!lhsCount[numAttributes]) {
        lhsCount[numAttributes] = 0;
      }
      lhsCount[numAttributes] += 1;
    });
    return lhsCount;
  };  
  
  const lhsAttributesCount = countLHSAttributes(filterRFDs(allRFDs, selectedHeaderValues), header[0]);
  const lhsAttributeLabels = Object.keys(lhsAttributesCount).sort((a, b) => a - b);
  const lhsAttributeData = lhsAttributeLabels.map(label => lhsAttributesCount[label]);
  
  const lhsAttributeChartData = {
    labels: lhsAttributeLabels,
    datasets: [{
      label: 'LHS Attribute Count',
      data: lhsAttributeData,
      backgroundColor: '#FFA726',
    }],
  };
  
  const lhsAttributeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  
  const countVariableFrequency = (rfdArray, attributesHeader) => {
    const variableFrequency = {};
    rfdArray.forEach(rfd => {
      const [lhs, rhs] = rfd.split(' -> ');
      const lhsAttributes = attributesHeader.filter(attribute => lhs.includes(attribute));
      const rhsAttributes = attributesHeader.filter(attribute => rhs.includes(attribute));
  
      lhsAttributes.forEach(attribute => {
        const variable = attribute.split('@')[0];
        if (!variableFrequency[variable]) {
          variableFrequency[variable] = { lhs: 0, rhs: 0 };
        }
        variableFrequency[variable].lhs += 1;
      });
  
      rhsAttributes.forEach(attribute => {
        const variable = attribute.split('@')[0];
        if (!variableFrequency[variable]) {
          variableFrequency[variable] = { lhs: 0, rhs: 0 };
        }
        variableFrequency[variable].rhs += 1;
      });
    });
    return variableFrequency;
  };
  
  const variableFrequency = countVariableFrequency(filterRFDs(allRFDs, selectedHeaderValues), header[0]);
  const variableLabels = Object.keys(variableFrequency);
  const lhsCounts = variableLabels.map(label => variableFrequency[label].lhs);
  const rhsCounts = variableLabels.map(label => variableFrequency[label].rhs);
  

  const variableChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  

  const variableChartData = {
    labels: variableLabels,
    datasets: [
      {
        label: 'LHS Frequency',
        data: lhsCounts,
        backgroundColor: '#36A2EB',
      },
      {
        label: 'RHS Frequency',
        data: rhsCounts,
        backgroundColor: '#FF6384',
      },
    ],
  };

  const findImplicatingAttributes = (rfdArray, attributesHeader) => {
    const implicatingAttributes = {};
  
    const extractAttributes = (str) => {
      return str.match(/[a-zA-Z\s]+/g).filter(attr => !attr.includes('@'));
    };
  
    attributesHeader.forEach(attribute => {
      implicatingAttributes[attribute] = new Set();
      rfdArray.forEach(rfd => {
        const [lhs, rhs] = rfd.split(' -> ');
        if (rhs.includes(attribute)) {
          const leftAttributes = extractAttributes(lhs);
          leftAttributes.forEach(attr => implicatingAttributes[attribute].add(attr.trim()));
        }
      });
    });
  
    return implicatingAttributes;
  };

  let implicatingAttributes = 0;
  if(header[0]) {
    implicatingAttributes = findImplicatingAttributes(filterRFDs(allRFDs, selectedHeaderValues), header[0]);
  }

  const implicatingChartData = {
    labels: Object.keys(implicatingAttributes),
    datasets: [{
      label: 'Implicating Attributes',
      data: Object.values(implicatingAttributes).map(set => set.size),
      backgroundColor: '#4CAF50',
    }],
  };

  const implicatingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const attribute = context.label;
            const implicatingAttrs = Array.from(implicatingAttributes[attribute]).join(', ');
            return `${attribute}: ${implicatingAttrs}`;
          }
        }
      }
    }
  };

  return (
    <div className="file-details">
      <div className="title-back-container">
        <button className="back-btn" onClick={onBack}>Go Back</button>
        <h2 className="title">File Details: {fileName}</h2>
      </div>
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
                        <span>Details <AspectRatioIcon /></span> {cardVisibility.sizeAndFormat ? <ToggleOnIcon onClick={() => toggleCardVisibility('sizeAndFormat')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('sizeAndFormat')} />}</div>
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
                        <span>Content Specifications <ColumnsIcon /></span>{cardVisibility.columnAndRowNumber ? <ToggleOnIcon onClick={() => toggleCardVisibility('columnAndRowNumber')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('columnAndRowNumber')} />}</div>
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
              <div className="row">
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="d-flex justify-content-between align-items-center card-header">
                      <span>System <PcDisplayIcon /></span> {cardVisibility.system ? <ToggleOnIcon onClick={() => toggleCardVisibility('system')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('system')} />}
                    </div>
                    {cardVisibility.system && (
                      <div className="card-body">
                        {info.os.map((item, index) => (
                          <div key={index}>
                            <strong>OS:</strong> {item} <br />
                            <strong>OS Version:</strong> {info.os_version[index]} <br />
                            <strong>Processor:</strong> {info.processor[index]} <br />
                            <strong>Core/Thread:</strong> {info.core[index]}/{info.thread[index]}<br />
                            <strong>RAM:</strong> {info.ram[index]} <br />
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
                      <span>Execution Parameters <CpuIcon /></span> {cardVisibility.executionParameters ? <ToggleOnIcon onClick={() => toggleCardVisibility('executionParameters')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('executionParameters')} />}
                    </div>
                    {cardVisibility.executionParameters && (
                      <div className="card-body">
                        {info.execution_command.map((item, index) => (
                          <div key={index}>
                            <strong>Execution Command:</strong> {item} <br />
                            <strong>Max Execution Time:</strong> {info.max_execution_time[index]} <br />
                            <strong>Max Ram Usage:</strong> {info.max_ram_usage[index]} <br />
                            <strong>Start Time:</strong> {info.start_time[index]} <br />
                            <strong>End Time:</strong> {info.end_time[index]} <br />
                            <hr />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="card mb-3">
          <div className="d-flex justify-content-between align-items-center card-header">
            <span>RESULT<PcDisplayIcon /></span>
            <div>
              {cardVisibility.result ? (
                <ToggleOnIcon onClick={() => toggleCardVisibility('result')} />
              ) : (
                <ToggleOffIcon onClick={() => toggleCardVisibility('result')} />
              )}
            </div>
          </div>
          {cardVisibility.result && (
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="d-flex justify-content-between align-items-center card-header">
                      <span>Time Execution <BugIcon /></span> {cardVisibility.timeExecution ? <ToggleOnIcon onClick={() => toggleCardVisibility('timeExecution')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('timeExecution')} />}
                    </div>
                    {cardVisibility.timeExecution && (
                      <div className="card-body">
                        {info.dataset_loading.map((item, index) => (
                          <div key={index}>
                            <strong>Dataset Loading:</strong> {item}{info.unit[0]} <br />
                            <strong>Preprocessing:</strong> {info.preprocessing[index]}{info.unit[0]} <br />
                            <strong>Discovery:</strong> {info.discovery[index]}{info.unit[0]} <br />
                            <strong>Total:</strong> {info.total[index]}{info.unit[0]} <br />
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
                      <span> Ram Usage <CpuIcon /></span> {cardVisibility.ramUsage ? <ToggleOnIcon onClick={() => toggleCardVisibility('ramUsage')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('ramUsage')} />}
                    </div>
                    {cardVisibility.ramUsage && (
                      <div className="card-body">
                        {info.max_ram_used.map((item, index) => (
                          <div key={index}>
                            <strong>Unit:</strong> {info.unit[1]} <br />
                            <strong>Max Ram Used:</strong> {info.max_ram_used[index]} <br />
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
                      <span>Error <BugIcon /></span> {cardVisibility.system ? <ToggleOnIcon onClick={() => toggleCardVisibility('error')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('error')} />}
                    </div>
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
                </div>

              </div>
            </div>
          )}
        </div>

    <div className="card mb-3">
      <div className="d-flex justify-content-between align-items-center card-header">
        <span>RFDs </span>{cardVisibility.rfd ? <ToggleOnIcon onClick={() => toggleCardVisibility('rfd')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('rfd')} />}</div>
      {cardVisibility.rfd && (
        <div className="card-body">
          <button className="select-btn" onClick={toggleSelectAll} >
            {selectedRows.length === allRFDs.length ? "Deselect all" : "Select all"}
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
        <span>CHARTS <Chart /> </span>
        {cardVisibility.graphs ? <ToggleOnIcon onClick={() => toggleCardVisibility('graphs')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('graphs')} />}
      </div>
      {cardVisibility.graphs && (
        <div className="card-body">
          <div style={{ height: '300px' }}>
            <Bar data={lhsAttributeChartData} options={lhsAttributeChartOptions} />
          </div>
          <div style={{ height: '300px' }}>
            <Bar data={variableChartData} options={variableChartOptions} />
          </div>
          <div style={{ height: '300px' }}>
            <Bar data={implicatingChartData} options={implicatingChartOptions} />
          </div>
        </div>
      )}
    </div>



    <div className="card mb-3">
      <div className="d-flex justify-content-between align-items-center card-header">
        <span>PROMPT <CpuIcon /></span>
        {cardVisibility.prompt ? <ToggleOnIcon onClick={() => toggleCardVisibility('prompt')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('prompt')} />}
      </div>
      {cardVisibility.prompt && (
        <div className="card-body">
        <textarea
          type="text"
          value={promptAI}
          onChange={(e) => setPromptAI(e.target.value)}
          style={{ width: "100%", minHeight: "200px" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <button className="select-btn" onClick={() => setPromptAI(initialPrompt)}>RESET</button>
          <button className="select-btn" onClick={scrollToBottom}>
            {isLoading ? "LOADING..." : "GENERATE TEXT"}
          </button>
        </div>
      </div>
      )}
    </div>


    <div className="card mb-3">
      <div className="d-flex justify-content-between align-items-center card-header">
        <span>GENERATED TEXT <RobotIcon /></span> {cardVisibility.generatedText ? <ToggleOnIcon onClick={() => toggleCardVisibility('generatedText')} /> : <ToggleOffIcon onClick={() => toggleCardVisibility('generatedText')} />}</div>
          {cardVisibility.generatedText && (
            <div className="card-body">
              {isTextGenerated && (
                <p>{responseAI}</p>
              )}
            </div>
          )}
      </div>

      </div>
    </div>

  );
};

export default FileDetailsPage;