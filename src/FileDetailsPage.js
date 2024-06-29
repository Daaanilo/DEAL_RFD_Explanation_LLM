import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ReactComponent as DatabaseIcon } from 'bootstrap-icons/icons/database.svg';
import { ReactComponent as AspectRatioIcon } from 'bootstrap-icons/icons/aspect-ratio.svg';
import { ReactComponent as ColumnsIcon } from 'bootstrap-icons/icons/columns.svg';
import { ReactComponent as PcDisplayIcon } from 'bootstrap-icons/icons/pc-display.svg';
import { ReactComponent as Chart } from 'bootstrap-icons/icons/diagram-2.svg';
import { ReactComponent as BugIcon } from 'bootstrap-icons/icons/bug.svg';
import { ReactComponent as CpuIcon } from 'bootstrap-icons/icons/cpu.svg';
import { ReactComponent as RobotIcon } from 'bootstrap-icons/icons/robot.svg';
import { ReactComponent as PcIcon } from 'bootstrap-icons/icons/pc-horizontal.svg';
import { ReactComponent as MoonIcon } from 'bootstrap-icons/icons/moon-fill.svg';
import { ReactComponent as SunIcon } from 'bootstrap-icons/icons/brightness-high-fill.svg';
import { DarkModeContext } from './DarkModeProvider';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './FileDetailsPage.css';
import './DarkModeProvider.css';
const { handleUserInput } = require('./chatgptapi.js');

const FileDetailsPage = ({ fileName, onBack }) => {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

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
    algorithm: true,
    executionInfo: true,
    system: true,
    executionParameters: true,
    result: true,
    timeExecution: true,
    timeLeft: true,
    ramUsage: true,
    error: true,
    count: true,
    frequency: true,
    implicating: true,
    triplem: true,
    column: true,
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

    //name: [],
    language: [],
    platform: [],
    execution_type: [],
    
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

  const statistics = {
    type: [],
    mean: [],
    median: [],
    mode: [],
    distribution: []
  };
  
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
      if (key === 'statistics' && typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([statKey, statValue]) => {
          if (statistics.hasOwnProperty(statKey) && typeof statistics[statKey] === 'object') {
            Object.entries(statValue).forEach(([innerKey, innerValue]) => {
              const uniqueValues = new Set(statistics[statKey][innerKey]);
              if (!uniqueValues.has(innerValue)) {
                statistics[statKey][innerKey] = innerValue;
              }
            });
          }
        });
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
              const lhsColumns = resultData.lhs.map(lhsItem => `${lhsItem.column}@[${lhsItem.comparison_relaxation.toFixed(1)}]`).join(', ');
              const rhsColumns = resultData.rhs.map(rhsItem => `${rhsItem.column}@[${rhsItem.comparison_relaxation.toFixed(1)}]`).join(', ');
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
    setSelectedHeaderValues(prevSelected => {
      if (prevSelected.includes(value)) {
        return prevSelected.filter(item => item !== value);
      } else {
        return [...prevSelected, value];
      }
    });
  };

  fileContent.forEach(row => formatData(row));

  const toggleCardVisibility = (cardName) => {
    setCardVisibility({ ...cardVisibility, [cardName]: !cardVisibility[cardName] });
  };


  // GENERATE TEXT

  const generateText = () => {
    const selectedRFDs = selectedRows.map(index => allRFDs[index]);
    setPromptAI(initialPrompt + selectedRFDs.join('\n'));
  };

  const scrollToBottom = async () => {

    if (selectedRows.length === 0) {
      alert('Select one or more RFDs');
      return;
    }
  
    const selectedRFDs = selectedRows.map(index => allRFDs[index]);
    const support = promptAI;
  
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
  

    if (window.confirm('Are you sure you want to summarize the text?')) {
      setIsLoading(true);

      const response = await handleUserInput(support ? support + selectedRFDs.join('\n') : promptAI + selectedRFDs.join('\n'));
      setResponseAI(response);
      setIsTextGenerated(true);
      setIsLoading(false);
    }
  };

  // CHARTS

  const convertToFloatArray = (data) => {
    if (Array.isArray(data) && data.length > 0) {
      return data.map(value => {
        if (value !== null && /^[a-zA-Z]$/.test(value) && value.endsWith('s')) {
          return 1000;
        } else if (value !== null && value.endsWith('s')) {
          return parseFloat(value.slice(0, -1).replace(',', '.')) * 1000;
        } else if (value !== null) {
          return parseFloat(value.replace(',', '.'));
        } else {
          return 0;
        }
      });
    } else {
      console.error('Invalid data format or empty array');
      return [];
    }
  };

  const temp = {
    dataset_loading: convertToFloatArray(info.dataset_loading),
    preprocessing: convertToFloatArray(info.preprocessing),
    discovery: convertToFloatArray(info.discovery),
    total: convertToFloatArray(info.total),
  };
  
  const left = temp.total.map((total, index) => {
    const discovery = temp.discovery[index] || 0;
    const preprocessing = temp.preprocessing[index] || 0;
    const dataset_loading = temp.dataset_loading[index] || 0;
    return total - (discovery + preprocessing + dataset_loading);
  });

  const totalSum = temp.total.reduce((acc, value) => acc + value, 0);
  const percentages = {
    dataset_loading: temp.dataset_loading.map(value => ((value / totalSum) * 100).toFixed(2)),
    preprocessing: temp.preprocessing.map(value => ((value / totalSum) * 100).toFixed(2)),
    discovery: temp.discovery.map(value => ((value / totalSum) * 100).toFixed(2)),
    left: left.map(value => ((value / totalSum) * 100).toFixed(2)),
  };
  
  const timeChartData = {
    labels: temp.dataset_loading.map((_, index) => `Time ${index + 1}`),
    datasets: [
      {
        label: 'Dataset Loading',
        data: percentages.dataset_loading,
        backgroundColor: '#0052CC', // Blu scuro
        borderColor: '#0052CC',
        borderWidth: 1,
      },
      {
        label: 'Preprocessing',
        data: percentages.preprocessing,
        backgroundColor: '#FF5630', 
        borderColor: '#00A3BF',
        borderWidth: 1,
      },
      {
        label: 'Discovery',
        data: percentages.discovery,
        backgroundColor: '#36B37E', // Verde
        borderColor: '#36B37E',
        borderWidth: 1,
      },
      {
        label: 'Left',
        data: percentages.left,
        backgroundColor: '#00A3BF', // Rosso-arancio
        borderColor: '#FF5630',
        borderWidth: 1,
      }
    ],
  };
  
  const timeChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Importante per controllare manualmente le dimensioni
    indexAxis: 'x',
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            let label = tooltipItem.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (tooltipItem.raw !== undefined) {
              let value = tooltipItem.raw;
              if (typeof value === 'number') {
                label += value.toFixed(2) + '%';
              } else {
                label += value + '%';
              }
            }
            return label;
          }
        }
      }
    }
  };
  
  const getRandomColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 20) + 80;
    const l = Math.floor(Math.random() * 20) + 50;
    return hslToHex(h, s, l);
  };
  
  const hslToHex = (h, s, l) => {
    s /= 100;
    l /= 100;
    
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(color * 255).toString(16).padStart(2, '0');
    };
  
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };

  const gradientColors = [
    'rgba(255, 0, 0, 1)',
    'rgba(255, 51, 0, 1)',
    'rgba(255, 102, 0, 1)',
    'rgba(255, 153, 0, 1)',
    'rgba(255, 204, 0, 1)',
    'rgba(255, 255, 0, 1)',
    'rgba(204, 255, 0, 1)',
    'rgba(153, 255, 0, 1)',
    'rgba(102, 255, 0, 1)',
    'rgba(51, 255, 0, 1)',
    'rgba(0, 255, 0, 1)',
    'rgba(0, 255, 51, 1)',
    'rgba(0, 255, 102, 1)',
    'rgba(0, 255, 153, 1)',
    'rgba(0, 255, 204, 1)',
    'rgba(0, 255, 255, 1)',
    'rgba(0, 204, 255, 1)',
    'rgba(0, 153, 255, 1)',
    'rgba(0, 102, 255, 1)',
    'rgba(0, 51, 255, 1)',
    'rgba(0, 0, 255, 1)'
]



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
      backgroundColor: 'rgba(0, 92, 230, 1)',
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
        backgroundColor: 'rgba(0, 153, 255, 1)',
      },
      {
        label: 'RHS Frequency',
        data: rhsCounts,
        backgroundColor: 'rgba(0, 204, 255, 1)',
      },
    ],
  };


  const findImplicatingAttributes = (rfdArray, attributesHeader) => {
    const implicatingAttributes = {};
  
    const extractAttributes = (str) => {
      return str.match(/[a-zA-Z1-9\s]+/g).filter(attr => !attr.includes('@'));
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
      backgroundColor: 'rgba(51, 204, 255, 1)',
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

  const statisticLabels = Object.keys(statistics.type);
  const statisticMeans = statisticLabels.map(label => statistics.mean[label]);
  const statisticMedians = statisticLabels.map(label => statistics.median[label]);
  const statisticModes = statisticLabels.map(label => statistics.mode[label]);

  const statisticsChartData = {
    labels: statisticLabels,
    datasets: [
      {
        label: 'Mean',
        data: statisticMeans,
        backgroundColor: 'rgba(255, 153, 51, 1)',
      },
      {
        label: 'Median',
        data: statisticMedians,
        backgroundColor: 'rgba(255, 102, 0, 1)',
      },
      {
        label: 'Mode',
        data: statisticModes,
        backgroundColor: 'rgba(255, 51, 51, 1)',
      }
    ],
  };


  const statisticsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const calculateRelativeFrequency = (distribution) => {
    const relativeFrequency = {};
  
    Object.keys(distribution).forEach(attribute => {
      const attributeCounts = distribution[attribute];
      const total = Object.values(attributeCounts).reduce((sum, item) => sum + item.count, 0);
      relativeFrequency[attribute] = {};
  
      Object.keys(attributeCounts).forEach(value => {
        const count = attributeCounts[value].count;
        relativeFrequency[attribute][value] = (count / total) * 100;
      });
    });
  
    return relativeFrequency;
  };

  const relativeFrequency = calculateRelativeFrequency(statistics.distribution);
  const [chartDataLimit, setChartDataLimit] = useState({});


  const handleSliderChange = (attribute, value) => {
    setChartDataLimit(prevState => ({
      ...prevState,
      [attribute]: value
    }));
  };

  const getChartDataForAttribute = useMemo(() => (attribute) => {
    const dataLimit = chartDataLimit[attribute] || Math.min(Object.keys(relativeFrequency[attribute]).length, 10);
    const allValues = Object.keys(relativeFrequency[attribute]);
    const sortedValues = allValues.sort((a, b) => relativeFrequency[attribute][b] - relativeFrequency[attribute][a]);
    const displayedValues = sortedValues.slice(0, dataLimit);
    const otherValues = sortedValues.slice(dataLimit);
  
    const data = displayedValues.map(value => relativeFrequency[attribute][value]);
    const otherData = otherValues.reduce((acc, value) => acc + relativeFrequency[attribute][value], 0);
  
    if (otherData > 0) {
      data.push(otherData);
      displayedValues.push('others');
    }
    
    return {
      labels: displayedValues.map(value => `${attribute}:${value}`),
      datasets: [{
        data: data,
        backgroundColor: gradientColors,
        label: 'Relative Frequency (%)'
      }]
    };
  }, [relativeFrequency, chartDataLimit]);
  
  const distributionChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label.split(':')[1].trim();
            const value = context.raw.toFixed(2);
            return `${label}: ${value}%`;
          }
        },
        backgroundColor: '#000000',
        titleFont: { size: 0 },
        bodyFont: { size: 14 },
        padding: 10,
        caretPadding: 5,
        caretSize: 5,
        cornerRadius: 4,
        borderWidth: 1,
        borderColor: '#cccccc',
        displayColors: false,
        titleMarginBottom: 0
      },
      legend: { display: false }
    },
    elements: {
      arc: {
        borderColor: '#000000',
        borderWidth: 0.2
      }
    }
  }), []);

  return (

<div className={`file-details ${darkMode ? 'dark-mode' : ''}`}>
  <div className="title-back-container">
    <button className="back-btn" onClick={onBack}>
      <i className="fas fa-arrow-alt-circle-left" style={{ fontSize: "1.2em" }}></i>
    </button>
    <div className="toggle-button" onClick={toggleDarkMode}>
      <SunIcon name="sun" className="sun"></SunIcon>
      <MoonIcon name="moon" className="moon"></MoonIcon>
      <div className="toggle"></div>
      <div className="animateBg"></div>
    </div>
    <h2 className="title">File Details: <span style={{ color: '#005AC1' }}>{info.name[0]}</span></h2>
  </div>
  <div className="container">
    <div className="card mb-3">
      <div className="card-header">
        <span className="details-text">Header </span>
      </div>
      {header && header[0] && (
        <div className="card-body">
          <div className="horizontal-scroll">
            {header[0].map((item, index) => (
              <div key={index} className="item-container">
                <button
                  type="button"
                  className={`btn ${selectedHeaderValues.includes(item) ? 'btn-primary active' : 'btn btn-secondary'}`}
                  onClick={() => toggleHeaderSelection(item)}
                  style={{
                    background: selectedHeaderValues.includes(item) ? 'white' : 'linear-gradient(30deg, #5799E5, #005AC1)',
                    color: selectedHeaderValues.includes(item) ? 'black' : '',
                  }}
                >
                  <span className={`details-header ${selectedHeaderValues.includes(item) ? 'selected' : ''}`}>{item}</span>
                </button>
                <div style={{ height: '5px' }}></div>
                <button
                  type="button"
                  className={`btn ${selectedHeaderValues.includes(statistics.type[item]) ? 'btn-group-toggle active' : 'btn btn-secondary'} no-pulse`}
                  style={{ background: '#E1E1E1' }}
                >
                  <span className="details-header">{statistics.type[item]}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    <div className="row">
  <div className="col-md-6">
    <div className="card mb-3">
      <div className="d-flex justify-content-between align-items-center card-header">
        <span className="details-text">Details <AspectRatioIcon /></span>
        <div className="toggle-button-cover">
          <div id="button-3" className="button r">
            <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('sizeAndFormat')} checked={cardVisibility.sizeAndFormat} />
            <div className="knobs"></div>
            <div className="layer"></div>
          </div>
        </div>
      </div>
      {cardVisibility.sizeAndFormat && (
        <div className="card-body">
          {info.size.length > 0 ? (
            info.size.map((item, index) => (
              <div key={index}>
                <strong>Size:</strong> {item} <br />
                <strong>Format:</strong> {info.format[index]} <br />
                <strong>Separator:</strong> {info.separator[index]}
              </div>
            ))
          ) : (
            <div>
                <strong>Size:</strong> N/A <br />
                <strong>Format:</strong> N/A <br />
                <strong>Separator:</strong> N/A
            </div>
          )}
        </div>
      )}
    </div>
  </div>

      <div className="col-md-6">
  <div className="card mb-3">
    <div className="d-flex justify-content-between align-items-center card-header">
      <span className="details-text">Content Specifications <ColumnsIcon /></span>
      <div className="toggle-button-cover">
        <div id="button-3" className="button r">
          <input
            className="checkbox"
            type="checkbox"
            onChange={() => toggleCardVisibility('columnAndRowNumber')}
            checked={cardVisibility.columnAndRowNumber}
          />
          <div className="knobs"></div>
          <div className="layer"></div>
        </div>
      </div>
    </div>
    {cardVisibility.columnAndRowNumber && (
      <div className="card-body">
        {info.col_number.length > 0 ? (
          info.col_number.map((item, index) => (
            <div key={index}>
              <strong>Column:</strong> {item} <br />
              <strong>Row:</strong> {info.row_number[index]} <br />
              <strong>Blank char:</strong> {info.blank_char[index]}
            </div>
          ))
        ) : (
          <div>
            <strong>Column:</strong> N/A <br />
            <strong>Row:</strong> N/A <br />
            <strong>Blank char:</strong> N/A
          </div>
        )}
      </div>
    )}
  </div>
  </div>
  </div>



    <div className="card mb-3">
  <div className="d-flex justify-content-between align-items-center card-header">
    <span className="details-text">Algorithm <PcIcon /></span>
    <div className="toggle-button-cover">
      <div id="button-3" className="button r">
        <input
          className="checkbox"
          type="checkbox"
          onChange={() => toggleCardVisibility('algorithm')}
          checked={cardVisibility.algorithm}
        />
        <div className="knobs"></div>
        <div className="layer"></div>
      </div>
    </div>
  </div>
  {cardVisibility.algorithm && (
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                     </div>
                        {info.language.map((item, index) => (
                          <div key={index}>
                            <strong>Name:</strong> {info.name[1]} <br />
                            <strong>Language:</strong> {info.language[index]} <br />
                            <strong>Platform:</strong> {info.platform[index]} <br />
                            <strong>Execution Type:</strong> {info.execution_type[index]}<br />
                          </div>
                        ))}
              </div>
            </div>
          )}
</div>

        
        

    <div className="row">
      <div className="col-md-6">
        <div className="card mb-3">
          <div className="d-flex justify-content-between align-items-center card-header">
            <span className="details-text">System <PcDisplayIcon /></span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('system')} checked={cardVisibility.system} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="col-md-6">
        <div className="card mb-3">
          <div className="d-flex justify-content-between align-items-center card-header">
            <span className="details-text">Execution Parameters <CpuIcon /></span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('executionParameters')} checked={cardVisibility.executionParameters} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>



    <div className="row d-flex">
    <div className="col-md-4">
        <div className={`card mb-3 w-100 ${cardVisibility.timeExecution ? 'h-100' : ''}`}>
          <div className="d-flex justify-content-between align-items-center card-header">
            <span className="details-text">Time Execution <BugIcon /></span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('timeExecution')} checked={cardVisibility.timeExecution} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
          </div>
          {cardVisibility.timeExecution && (
            <div className="card-body">
              {info.dataset_loading.length > 0 && info.preprocessing.length > 0 && info.discovery.length > 0 ? (
                info.dataset_loading.map((item, index) => (
                  <div key={index}>
                    <strong>Dataset Loading:</strong> {item && (item.endsWith('s') ? parseFloat(item) * 1000 : parseFloat(item))}ms<br />
                    <strong>Preprocessing:</strong> {info.preprocessing[index] && (info.preprocessing[index].endsWith('s') ? parseFloat(info.preprocessing[index]) * 1000 : parseFloat(info.preprocessing[index]))}ms<br />
                    <strong>Discovery:</strong> {info.discovery[index] && (info.discovery[index].endsWith('s') ? parseFloat(info.discovery[index]) * 1000 : parseFloat(info.discovery[index]))}ms<br />
                    <strong>Left:</strong> {left > 1000 ? (left / 1000).toFixed(2).replace('.', ',') + 's' : left + 'ms'}<br />
                    <strong>Total:</strong> {info.total[index]} <br />
                  </div>
                ))
              ) : (
                <div>
                  <strong>Data not available</strong>
                </div>
              )}
            </div>
          )}
        </div>
      </div><div className="col-md-4">
        <div className={`card mb-3 w-100 ${cardVisibility.ramUsage ? 'h-100' : ''}`}>
          <div className="d-flex justify-content-between align-items-center card-header">
            <span className="details-text">Ram Usage <CpuIcon /></span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('ramUsage')} checked={cardVisibility.ramUsage} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
          </div>
          {cardVisibility.ramUsage && (
            <div className="card-body">
              {info.max_ram_used.length > 0 && info.unit.length > 0 ? (
                info.max_ram_used.map((item, index) => (
                  <div key={index}>
                    <strong>Unit:</strong> {info.unit[index]} <br />
                    <strong>Max Ram Used:</strong> {info.max_ram_used[index]} <br />
                  </div>
                ))
              ) : (
                <div>
                    <strong>Unit:</strong> N/A <br />
                    <strong>Max Ram Used:</strong> N/A <br />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="col-md-4">
        <div className={`card mb-3 w-100 ${cardVisibility.error ? 'h-100' : ''}`}>
          <div className="d-flex justify-content-between align-items-center card-header">
            <span className="details-text">Error <BugIcon /></span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('error')} checked={cardVisibility.error} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
          </div>
          {cardVisibility.error && (
            <div className="card-body">
              {info.time_limit.length > 0 && info.memory_limit.length > 0 && info.general_error.length > 0 ? (
                info.time_limit.map((item, index) => (
                  <div key={index}>
                    <strong>Time Limit:</strong> {item} <br />
                    <strong>Memory Limit:</strong> {info.memory_limit[index]} <br />
                    <strong>General Error:</strong> {info.general_error[index]} <br />
                  </div>
                ))
              ) : (
                <div>
                    <strong>Time Limit:</strong> N/A <br />
                    <strong>Memory Limit:</strong> N/A <br />
                    <strong>General Error:</strong> N/A <br />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
        <div style={{ marginBottom: '20px' }}></div>
      </div>


    <div className="card mb-3">
          <div className="d-flex justify-content-between align-items-center card-header">
            <span className="details-text">TIME EXECUTION <PcIcon /></span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('timeExecution')} checked={cardVisibility.timeExecution} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
          </div>
          {cardVisibility.timeExecution && (
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                     </div>
                     <div style={{ height: '500px', marginTop: '20px' }}>
            <Bar data={timeChartData} options={timeChartOptions} />
          </div>
              </div>
            </div>
          )}
        </div>
  

    <div className="card mb-3">
      <div className="d-flex justify-content-between align-items-center card-header">
        <span className="details-text">ATTRIBUTE COUNT <Chart /></span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('count')} checked={cardVisibility.count} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
          </div>
      {cardVisibility.count && (
        <div className="card-body">
          <div style={{ height: '300px' }}>
            <Bar data={lhsAttributeChartData} options={lhsAttributeChartOptions} />
          </div>
        </div>
      )}
    </div>

    <div className="card mb-3">
      <div className="d-flex justify-content-between align-items-center card-header">
        <span className="details-text">FREQUENCY <Chart /></span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('frequency')} checked={cardVisibility.frequency} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
          </div>
      {cardVisibility.frequency && (
        <div className="card-body">
          <div style={{ height: '300px' }}>
            <Bar data={variableChartData} options={variableChartOptions} />
          </div>
        </div>
      )}
    </div>

    <div className="card mb-3">
      <div className="d-flex justify-content-between align-items-center card-header">
        <span className="details-text">IMPLICATING ATTRIBUTES <Chart /> </span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('implicating')} checked={cardVisibility.implicating} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
          </div>
      {cardVisibility.implicating && (
        <div className="card-body">
          <div style={{ height: '300px' }}>
            <Bar data={implicatingChartData} options={implicatingChartOptions} />
          </div>
        </div>
      )}
    </div>

    <div className="card mb-3">
      <div className="d-flex justify-content-between align-items-center card-header">
        <span className="details-text">MEAN, MEDIAN, MODE <Chart /></span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('triplem')} checked={cardVisibility.triplem} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
          </div>
      {cardVisibility.triplem && (
        <div className="card-body">
          <div style={{ height: '300px' }}>
            <Bar data={statisticsChartData} options={statisticsChartOptions} />
          </div>
        </div>
      )}
    </div>

    <div className="card mb-3" style={{ marginTop: 0 }}>
      <div className="d-flex justify-content-between align-items-center card-header">
        <span className="details-text">CHARTS</span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('column')} checked={cardVisibility.column} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div></div>
      {cardVisibility.column && (
        <div className="card-body d-flex flex-wrap justify-content-center">
          {Object.keys(relativeFrequency).map((attribute) => {
            const dataForAttribute = getChartDataForAttribute(attribute);
            const labels = dataForAttribute.labels.map((label, index) => {
              const value = dataForAttribute.datasets[0].data[index];
              const percentage = value.toFixed(2);
              return `${label.split(':')[1]}: ${percentage}%`;
            });

            const backgroundColors = dataForAttribute.datasets[0].backgroundColor;
            const maxValues = Object.keys(relativeFrequency[attribute]).length;

            return (
              <div key={attribute} className="col-lg-6 mb-4" style={{ marginBottom: '50px' }}>
                <h3 className="attribute-title text-center">{attribute}</h3>
                <div className="label-boxes-container mt-2 mx-auto">
                  <div className="label-boxes">
                    {labels.map((label, index) => (
                      <div key={index} className="label-box">
                        <div className="color-box" style={{ backgroundColor: backgroundColors[index] }}></div>
                        {' ' + label}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ height: '10px' }}></div>
                <div className="chart-container text-center">
                  <Pie data={dataForAttribute} options={distributionChartOptions} />
                </div>
                <select
                  value={chartDataLimit[attribute] ?? (maxValues >= 10 ? 10 : Math.min(maxValues, 10))}
                  onChange={(e) => handleSliderChange(attribute, parseInt(e.target.value))}
                  className="form-select mt-2 mx-auto"
                  style={{ display: 'block', margin: '10px auto 0 auto', width: '80%' }}
                >
                  {maxValues < 5 && (
                    <option value={maxValues}>{maxValues} values</option>
                  )}
                  {(maxValues >= 5 && maxValues < 10) && (
                    <>
                      <option value="5">5 values</option>
                      <option value={maxValues}>{maxValues} values</option>
                    </>
                  )}
                  {maxValues >= 10 && maxValues < 20 && (
                    <>
                      <option value="5">5 values</option>
                      <option value="10">10 values</option>
                      <option value={maxValues}>{maxValues} values</option>
                    </>
                  )}
                  {maxValues >= 20 && (
                    <>
                      <option value="5">5 values</option>
                      <option value="10">10 values</option>
                      <option value="20">20 values</option>
                    </>
                  )}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>

    <div className="card mb-3">
  <div className="d-flex justify-content-between align-items-center card-header">
    <span className="details-text">RFDs </span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('rfd')} checked={cardVisibility.rfd} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
            </div>
  {cardVisibility.rfd && (
    <div className="card-body">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          className="select-btn larger-checkbox"
          checked={selectedRows.length === filterRFDs(allRFDs, selectedHeaderValues).length}
          onChange={toggleSelectAll}
        />
        <label style={{ marginLeft: '10px' }}>
          {selectedRows.length === filterRFDs(allRFDs, selectedHeaderValues).length ? "Deselect all" : "Select all"}
        </label>
      </div>
      <div style={{ height: '15px' }}></div>

      <div style={{ whiteSpace: 'pre-wrap' }}>
        {allRFDs.map((rfd, index) => {
          const containsSelectedHeader = selectedHeaderValues.some(value => rfd.includes(value));
          if (containsSelectedHeader) {
            return null;
          }
          return (
            <div key={index} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                className="larger-checkbox"
                checked={selectedRows.includes(index)}
                onChange={() => toggleRowSelection(index)}
              />
              <label style={{ marginLeft: '10px' }}>
                {rfd}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  )}
</div>
    

    <div className="card mb-3">
      <div className="d-flex justify-content-between align-items-center card-header">
        <span className="details-text">PROMPT <CpuIcon /></span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('prompt')} checked={cardVisibility.prompt} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
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
          <button className="select-btn" onClick={generateText}>GENERATE TEXT</button>
          <button className="select-btn" onClick={scrollToBottom}>
            {isLoading ? "LOADING..." : "SUMMARIZE"}
          </button>
        </div>
      </div>
      )}
    </div>


    <div className="card mb-3">
      <div className="d-flex justify-content-between align-items-center card-header">
        <span className="details-text">SUMMARY <RobotIcon /></span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('generatedText')} checked={cardVisibility.generatedText} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
            </div>
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