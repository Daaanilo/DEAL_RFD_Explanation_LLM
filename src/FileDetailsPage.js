import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ReactComponent as DatabaseIcon } from 'bootstrap-icons/icons/database.svg';
import { ReactComponent as AspectRatioIcon } from 'bootstrap-icons/icons/aspect-ratio.svg';
import { ReactComponent as ColumnsIcon } from 'bootstrap-icons/icons/columns.svg';
import { ReactComponent as PcDisplayIcon } from 'bootstrap-icons/icons/pc-display.svg';
import { ReactComponent as ChartIcon } from 'bootstrap-icons/icons/diagram-2.svg';
import { ReactComponent as BugIcon } from 'bootstrap-icons/icons/bug.svg';
import { ReactComponent as CpuIcon } from 'bootstrap-icons/icons/cpu.svg';
import { ReactComponent as RobotIcon } from 'bootstrap-icons/icons/robot.svg';
import { ReactComponent as PcIcon } from 'bootstrap-icons/icons/pc-horizontal.svg';
import { ReactComponent as MoonIcon } from 'bootstrap-icons/icons/moon-fill.svg';
import { ReactComponent as SunIcon } from 'bootstrap-icons/icons/brightness-high-fill.svg';
import { DarkModeContext } from './DarkModeProvider';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import ReactApexChart from 'react-apexcharts';
import 'chart.js/auto';
import './FileDetailsPage.css';
import './DarkModeProvider.css';
const { handleUserInput } = require('./chatgptapi.js');

const FileDetailsPage = ({ fileName, onBack }) => {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  const [fileContent, setFileContent] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [allRFDs, setAllRFDs] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTextGenerated, setIsTextGenerated] = useState(false);
  const [responseAI, setResponseAI] = useState();
  
  const [isLoading2, setIsLoading2] = useState(false);
  const [isTextGenerated2, setIsTextGenerated2] = useState(false);
  const [responseAI2, setResponseAI2] = useState();
  


  const prompts = {
    'RFDs Overview': "I would like a thorough understanding of the RFD dependencies listed below, "+
        "including a detailed analysis of the variables involved and the related tolerance thresholds. "+
        "I want an overall summary that explains the general concept of these dependencies, "+
        "how variables interact with each other and how tolerance thresholds affect these relationships. The dependencies are as follows:\n",
    'Statistical Measures Analysis': "I would like a thorough understanding of the following statistics, including a detailed analysis of the variables "+
        "involved and their measures of central tendency and dispersion. I'm looking for an overall summary that explains the concept of each statistic, "+
        "how these measures interact with each other, and their impact on data. The statistics are as follows: mean, median, and mode:\n",
    'Dataset Value Distribution Analysis': "I would like to gain a comprehensive understanding of the dataset headers and the distribution of most frequent "+
        "values associated with each. This includes a detailed analysis of header names and the prevalent values within them. I'm seeking an overarching summary "+
        "that explains how these values are distributed across different headers and the significance of this distribution for an overall understanding of the dataset. "+
        "The values are as follows:\n"
  };

  const [selectedPrompt, setSelectedPrompt] = useState('RFDs Overview');
  const [customPromptAI, setCustomPromptAI] = useState('');
  const [basePrompt, setBasePrompt] = useState('');

  useEffect(() => {
    const newBasePrompt = prompts[selectedPrompt];
    setBasePrompt(newBasePrompt);
    if (newBasePrompt !== basePrompt) {

      const selectedRFDs = selectedRows.map(index => allRFDs[index]);

      let newPrompt = newBasePrompt;
      if(selectedPrompt === "RFDs Overview") {
        newPrompt = [newBasePrompt, ...selectedRFDs].join('\n');
      }
      else {
        newPrompt = [newBasePrompt];
      }
      setCustomPromptAI(newPrompt);
    }

  }, [selectedPrompt, selectedRows]);
  
 
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
    timeExecution2: true,
    timeLeft: true,
    ramUsage: true,
    error: true,
    cardinality: true,
    frequency: true,
    implicating: true,
    boxplot: true,
    minmax: true,
    nullValues: true,
    column: true,
    rfd: true,
    prompt: true,
    explanation: true,
    summary: true
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
    min: [],
    max: [],
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
      updateCustomPrompt(index, selectedIndex === -1);

      return updatedSelectedRows;
    });
  };
  
  const toggleSelectAll = () => {
    const visibleRFDsIndexes = filteredRFDs.map((_, index) => index);

    setSelectedRows(prevSelectedRows => {
      const newSelectedRows = prevSelectedRows.length === visibleRFDsIndexes.length ? [] : visibleRFDsIndexes;


      if(selectedPrompt === "RFDs Overview"){
        setCustomPromptAI(prevPrompt => {
          const promptLines = prevPrompt.split('\n');
          const baseLines = promptLines.filter(line => !allRFDs.includes(line));

          if (newSelectedRows.length === 0) {

            return baseLines.join('\n');
          } else {

            const selectedRFDs = newSelectedRows.map(index => allRFDs[index]);
            return [...baseLines, ...selectedRFDs].join('\n');
          }
        });
      }

      return newSelectedRows;
    });
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

  const handlePromptChange = (event) => {
    setSelectedPrompt(event.target.value);
    };
  
  const handleTextareaChange = (e) => {
    setCustomPromptAI(e.target.value);
  };

  const updateCustomPrompt = (index, isAdding) => {
    const rfdToToggle = allRFDs[index];
  
    if (selectedPrompt === "RFDs Overview") {
      setCustomPromptAI(prevPrompt => {
        const promptLines = prevPrompt.split('\n');
  
        if (isAdding) {
          if (!promptLines.includes(rfdToToggle)) {
            return prevPrompt + '\n' + rfdToToggle;
          }
        } else {
          return promptLines.filter(line => line !== rfdToToggle).join('\n');
        }
  
        return prevPrompt;
      });
    }
  };
  
  const scrollToBottom = async () => {

    if (selectedPrompt === "RFDs Overview" && selectedRows.length === 0) {
      alert('Select one or more RFDs');
      return;
    }
  
    // const selectedRFDs = selectedRows.map(index => allRFDs[index]);
  
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

      const response = await handleUserInput(customPromptAI);

      setResponseAI(response);
      setIsTextGenerated(true);
      setIsLoading(false);
    }
  };

  const summarizeText = async () => {
  
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
      setIsLoading2(true);

      const response = await handleUserInput('Can you give me a little summary of this: ' + responseAI);

      setResponseAI2(response);
      setIsTextGenerated2(true);
      setIsLoading2(false);
    }
  };

  // CHARTS

  const gradientColors = [
    'rgba(255, 128, 128, 1)',
    'rgba(255, 159, 128, 1)',
    'rgba(255, 191, 128, 1)',
    'rgba(255, 223, 128, 1)',
    'rgba(255, 255, 128, 1)',
    'rgba(223, 255, 128, 1)',
    'rgba(191, 255, 128, 1)',
    'rgba(159, 255, 128, 1)',
    'rgba(128, 255, 128, 1)',
    'rgba(128, 255, 159, 1)',
    'rgba(128, 255, 191, 1)',
    'rgba(128, 255, 223, 1)',
    'rgba(128, 255, 255, 1)',
    'rgba(128, 223, 255, 1)',
    'rgba(128, 191, 255, 1)',
    'rgba(128, 159, 255, 1)',
    'rgba(128, 128, 255, 1)',
    'rgba(159, 128, 255, 1)',
    'rgba(191, 128, 255, 1)',
    'rgba(223, 128, 255, 1)',
    'rgba(255, 128, 255, 1)'
  ];
  

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
    labels: [''],
    datasets: [
      {
        label: 'Dataset Loading',
        data: percentages.dataset_loading,
        backgroundColor: gradientColors[0],
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 0.5,
      },
      {
        label: 'Preprocessing',
        data: percentages.preprocessing,
        backgroundColor: gradientColors[5],
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 0.5,
      },
      {
        label: 'Discovery',
        data: percentages.discovery,
        backgroundColor: gradientColors[10],
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 0.5,
      },
      {
        label: 'Left',
        data: percentages.left,
        backgroundColor: gradientColors[15],
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 0.5,
      }
    ],
  };

  const timeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      y: {
        stacked: true,
      },
      x: {
        stacked: true,
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return value + '%';
          }
        }
      }
    },
    layout: {
      padding: {
        left: 20,
        right: 20,
        
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
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

  const isAllZerosOrNull = (arr) => arr.every(item => item === 0 || item === null || item === '');
  const shouldDisplayCard = !isAllZerosOrNull(temp.dataset_loading) || !isAllZerosOrNull(temp.preprocessing) || !isAllZerosOrNull(temp.discovery) || !isAllZerosOrNull(temp.total);

  
  const [frequencyValues, setFrequencyValues] = useState([]);
  const [filteredRFDs, setFilteredRFDs] = useState([]);


  const filterRFDs = (rfdArray, attributesHeader, frequency) => {
    if (!Array.isArray(rfdArray)) return [];
  
    let filteredArray = rfdArray.filter(rfd => {
      return !attributesHeader.some(attribute => rfd.includes(attribute));
    });
  
    if (frequency.length > 0) {
      frequency.forEach(freq => {
        const match = freq.match(/\[(.*?)\] (LHS|RHS)/);
        if (match) {
          const value = match[1];
          const type = match[2];
  
          filteredArray = filteredArray.filter(rfd => {
            const [lhs, rhs] = rfd.split(' -> ');
            if (type === 'LHS') {
              return !lhs.includes(`[${value}]`);
            } else if (type === 'RHS') {
              return !rhs.includes(`[${value}]`);
            }
          });
        }
      });
    }
  
    return filteredArray;
  };
  
  useEffect(() => {
    setFilteredRFDs(filterRFDs(allRFDs, selectedHeaderValues, frequencyValues));
  }, [allRFDs, selectedHeaderValues, frequencyValues]);



  const countLHSAttributes = (rfdArray) => {
    const lhsCount = {};
    rfdArray.forEach(rfd => {
      const lhs = rfd.split(' -> ')[0];
      const attributes = lhs.split(',').map(attr => attr.trim()).filter(attr => attr !== '');
      const numAttributes = attributes.length;
      if (!lhsCount[numAttributes]) {
        lhsCount[numAttributes] = 0;
      }
      lhsCount[numAttributes] += 1;
    });
  
    return lhsCount;
  };
  
  const lhsAttributesCount = countLHSAttributes(filterRFDs(allRFDs, selectedHeaderValues, frequencyValues));
  const lhsAttributeLabels = Object.keys(lhsAttributesCount).sort((a, b) => a - b);
  const lhsAttributeData = lhsAttributeLabels.map(label => lhsAttributesCount[label]);
  
  const lhsAttributeChartData = {
    labels: lhsAttributeLabels.map(label => `${label} attribute(s)`),
    datasets: lhsAttributeLabels.map((label, index) => ({
      label: `${label} attribute(s)`,
      data: lhsAttributeLabels.map((_, i) => i === index ? lhsAttributeData[index] : null),
      backgroundColor: gradientColors[13],
      borderColor: 'rgba(0, 0, 0, 1)',
      borderWidth: 0.5,
    })),
  };
  
  const lhsAttributeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'LHS cardinality'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };
  
  



  const countVariableFrequency = (rfdArray) => {
    const variableFrequency = {};
    
    rfdArray.forEach(rfd => {
      const [lhs, rhs] = rfd.split(' -> ');
      const lhsAttributes = lhs.split(', ');
      const rhsAttributes = rhs.split(', ');
      
      const processAttributes = (attributes, side) => {
        attributes.forEach(attribute => {
          const [col, value] = attribute.split('@');
          if (!variableFrequency[col]) {
            variableFrequency[col] = {};
          }
          if (!variableFrequency[col][value]) {
            variableFrequency[col][value] = { lhs: 0, rhs: 0 };
          }
          variableFrequency[col][value][side] += 1;
        });
      };
      
      processAttributes(lhsAttributes, 'lhs');
      processAttributes(rhsAttributes, 'rhs');
    });
    
    return variableFrequency;
  };
  
  
  const prepareChartData = (variableFrequency, header) => {
    const labels = Object.keys(variableFrequency);
    const datasets = [];
    const labelsAndColors = [];
    
    const getColor = (index) => gradientColors[index % 2 === 0 ? index / 2 : (gradientColors.length - 1) - (index - 1) / 2];
  
    labels.sort((a, b) => {
      return header.indexOf(a) - header.indexOf(b);
    });
  
    const allValues = new Set();
    labels.forEach(col => {
      Object.keys(variableFrequency[col]).forEach(value => allValues.add(value));
    });
    const uniqueValues = Array.from(allValues).sort();
  
    uniqueValues.forEach((value, index) => {
      const colorLHS = getColor(index * 2);
      const colorRHS = getColor(index * 2 + 1);
  
      labelsAndColors.push([`${value} LHS`, colorLHS]);
      labelsAndColors.push([`${value} RHS`, colorRHS]);

      datasets.push(
        {
          label: `${value} LHS`,
          data: labels.map(col => variableFrequency[col][value]?.lhs || 0),
          backgroundColor: colorLHS,
          borderColor: 'rgba(0, 0, 0, 1)',
          borderWidth: 0.5,
          stack: 'lhs'
        },
        {
          label: `${value} RHS`,
          data: labels.map(col => variableFrequency[col][value]?.rhs || 0),
          backgroundColor: colorRHS,
          borderColor: 'rgba(0, 0, 0, 1)',
          borderWidth: 0.5,
          stack: 'rhs'
        }
      );
    });
  
    return { labels, datasets, labelsAndColors };
  };
  


  const variableChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  const variableFrequency = countVariableFrequency(filterRFDs(allRFDs, selectedHeaderValues, frequencyValues));
  
  const variableChartData = prepareChartData(variableFrequency, header[0]);

  const handleLegendClick = (legendText) => {
    const frequencyIndex = frequencyValues.indexOf(legendText);
    
    if (frequencyIndex !== -1) {
      const newFrequencyValues = [...frequencyValues];
      newFrequencyValues.splice(frequencyIndex, 1);
      setFrequencyValues(newFrequencyValues);
    } else {
      setFrequencyValues([...frequencyValues, legendText]);
    }

    setFilteredRFDs(filterRFDs(allRFDs, selectedHeaderValues, frequencyValues));
  };









  const findImplicatingAttributes = (rfdArray, attributesHeader) => {
    const implicatingAttributes = {};
  
    const extractAttributes = (str) => {
      return str.match(/[a-zA-Z][a-zA-Z0-9\s]*/g).filter(attr => !attr.includes('@'));
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
    implicatingAttributes = findImplicatingAttributes(filterRFDs(allRFDs, selectedHeaderValues, frequencyValues), header[0]);
  }




  const implicatingChartData = {
    labels: Object.keys(implicatingAttributes).map(label => `${label}`),
    datasets: Object.keys(implicatingAttributes).map(label => {
      const data = Object.keys(implicatingAttributes).map(key => {
        return key === label ? implicatingAttributes[key].size : 0;
      });

      return {
        label: `${label}`,
        data: data,
        backgroundColor: 'rgba(51, 204, 255, 1)',
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 0.5,
      };
    }),
  };

  
  const implicatingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
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
  const statisticMins = statisticLabels.map(label => statistics.min[label]);
  const statisticMaxs = statisticLabels.map(label => statistics.max[label]);

  prompts[`Statistical Measures Analysis`] += header[0]+'\n'+statisticMeans+'\n'+statisticMedians+'\n'+statisticModes;


  const series = statisticLabels.map((label, index) => {
    return {
      type: 'boxPlot',
      data: [{
        x: label,
        y: [statisticMins[index], statisticMeans[index], statisticMedians[index], statisticModes[index], statisticMaxs[index]]
      }]
    };
  });
  
  const options = {
    chart: {
      type: 'boxPlot',
      height: 350
    },
    title: {
      text: 'Box Plot',
      align: 'left'
    },
    plotOptions: {
      boxPlot: {
        colors: {
          upper: '#5C4742',
          lower: '#A5978B'
        }
      }
    },
    xaxis: {
      type: 'category',
      labels: {
        formatter: function(val) {
          return val;
        }
      },
      title: {
        text: 'Statistics'
      }
    },
    yaxis: {
      title: {
        text: 'Values'
      },
      labels: {
        formatter: function(val) {
          return val.toFixed(2);
        }
      }
    },
    tooltip: {
      shared: false,
      intersect: true,
      custom: function({ seriesIndex, dataPointIndex, w }) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        return (
          `<div class="apexcharts-tooltip-box-plot">
            <div><b>${data.x}</b></div>
            <div>Min: ${data.y[0].toFixed(2)}</div>
            <div>Mean: ${data.y[1].toFixed(2)}</div>
            <div>Median: ${data.y[2].toFixed(2)}</div>
            <div>Mode: ${data.y[3].toFixed(2)}</div>
            <div>Max: ${data.y[4].toFixed(2)}</div>
          </div>`
        );
      }
    }
    
  };



  const [currentPageBoxPlot, setcurrentPageBoxPlot] = useState(1);
  const chartsPerPageBoxPlot = 2;
  const totalChartsBoxPlot = Object.keys(statistics.type).length;
  const totalPagesBoxPlot = Math.ceil(totalChartsBoxPlot / chartsPerPageBoxPlot);
  
  const getPaginatedChartsBoxPlot = () => {
    const start = (currentPageBoxPlot - 1) * chartsPerPageBoxPlot;
    const end = start + chartsPerPageBoxPlot;
    const statisticLabels = Object.keys(statistics.type).slice(start, end);
    const seriesData = statisticLabels.map((label, index) => ({
      x: label,
      y: [statistics.min[label], statistics.mean[label], statistics.median[label], statistics.mode[label], statistics.max[label]]
    }));
    return seriesData;
  };
  
  const handlePageChangeBoxPlot = (page) => {
    if (page >= 1 && page <= totalPagesBoxPlot) {
      setcurrentPageBoxPlot(page);
    }
  };
  
  const renderPaginationButtonsBoxPlot = () => {
    const pages = [];
  
    if (currentPageBoxPlot > 1) pages.push(<button key="first" onClick={() => handlePageChangeBoxPlot(1)} className="pagination-button">1</button>);
    if (currentPageBoxPlot > 3) pages.push(<span key="dots1" className="pagination-dots">...</span>);
    if (currentPageBoxPlot > 2) pages.push(<button key="prev" onClick={() => handlePageChangeBoxPlot(currentPageBoxPlot - 1)} className="pagination-button">{currentPageBoxPlot - 1}</button>);
  
    pages.push(<span key="current" className="pagination-button current-page">{currentPageBoxPlot}</span>);
  
    if (currentPageBoxPlot < totalPagesBoxPlot - 1) pages.push(<button key="next" onClick={() => handlePageChangeBoxPlot(currentPageBoxPlot + 1)} className="pagination-button">{currentPageBoxPlot + 1}</button>);
    if (currentPageBoxPlot < totalPagesBoxPlot - 2) pages.push(<span key="dots2" className="pagination-dots">...</span>);
    if (currentPageBoxPlot < totalPagesBoxPlot) pages.push(<button key="last" onClick={() => handlePageChangeBoxPlot(totalPagesBoxPlot)} className="pagination-button">{totalPagesBoxPlot}</button>);

    return pages;
  };










  const statisticMin = statisticLabels.map(label => statistics.min[label]);
  const statisticMax = statisticLabels.map(label => statistics.max[label]);  

  const minMaxChartData = {
    labels: statisticLabels,
    datasets: [
      {
        label: 'Min',
        data: statisticMin,
        backgroundColor: gradientColors[13],
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 0.5,
      },
      {
        label: 'Max',
        data: statisticMax,
        backgroundColor: gradientColors[14],
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 0.5,
      },
    ],
  };

  const minMaxChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'logarithmic',
        beginAtZero: true,
        min: 0,
      },
    },
  };


  const calculateNullPercentages = (distribution) => {
    const nullPercentages = {};
    
    for (const col in distribution) {
      const colData = distribution[col];
      let totalCount = 0;
      let nullCount = 0;
  
      for (const key in colData) {
        totalCount += colData[key].count;
        if (key === "") {
          nullCount += colData[key].count;
        }
      }
  
      const nullPercentage = totalCount ? ((nullCount / totalCount) * 100).toFixed(2) : 0;
      nullPercentages[col] = {
        nullCount,
        nullPercentage
      };
    }
  
    return nullPercentages;
  };
  
  
  const nullPercentages = calculateNullPercentages(statistics.distribution);

  const NullPercentageLabels = Object.keys(nullPercentages);
  const nullPercentageValues = NullPercentageLabels.map(label => parseFloat(nullPercentages[label].nullPercentage || 0));

  const nullValuesChartData = {
    labels: statisticLabels,
    datasets: [
      {
        label: 'Null Percentage',
        data: nullPercentageValues,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const nullValuesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
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

  Object.keys(relativeFrequency).forEach(attribute => {
    const dataLimit = chartDataLimit[attribute] || Math.min(Object.keys(relativeFrequency[attribute]).length, 10);
    const allValues = Object.keys(relativeFrequency[attribute]);
    const sortedValues = allValues.sort((a, b) => relativeFrequency[attribute][b] - relativeFrequency[attribute][a]);
    const displayedValues = sortedValues.slice(0, dataLimit);
    
    const total = displayedValues.reduce((acc, value) => acc + relativeFrequency[attribute][value], 0);
        
    prompts[`Dataset Value Distribution Analysis`] += `\n${attribute}\n${displayedValues.join('\n')}`;
  });

  const getChartDataForAttribute = useMemo(() => (attribute) => {
    const dataLimit = chartDataLimit[attribute] || Math.min(Object.keys(relativeFrequency[attribute]).length, 10);
    const allValues = Object.keys(relativeFrequency[attribute]);
    const sortedValues = allValues.sort((a, b) => relativeFrequency[attribute][b] - relativeFrequency[attribute][a]);
    const displayedValues = sortedValues.slice(0, dataLimit);
  
    const total = displayedValues.reduce((acc, value) => acc + relativeFrequency[attribute][value], 0);
  
    const data = displayedValues.map(value => (relativeFrequency[attribute][value] / total) * 100);

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
        borderWidth: 0.5,
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const chartsPerPage = 2;
  const totalCharts = Object.keys(relativeFrequency).length;
  const totalPages = Math.ceil(totalCharts / chartsPerPage);

  const getPaginatedCharts = () => {
    const start = (currentPage - 1) * chartsPerPage;
    return Object.keys(relativeFrequency).slice(start, start + chartsPerPage);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationButtons = () => {
    const pages = [];

    if (currentPage > 1) pages.push(<button key="first" onClick={() => handlePageChange(1)} className="pagination-button">1</button>);
    if (currentPage > 3) pages.push(<span key="dots1" className="pagination-dots">...</span>);
    if (currentPage > 2) pages.push(<button key="prev" onClick={() => handlePageChange(currentPage - 1)} className="pagination-button">{currentPage - 1}</button>);

    pages.push(<span key="current" className="pagination-button current-page">{currentPage}</span>);

    if (currentPage < totalPages - 1) pages.push(<button key="next" onClick={() => handlePageChange(currentPage + 1)} className="pagination-button">{currentPage + 1}</button>);
    if (currentPage < totalPages - 2) pages.push(<span key="dots2" className="pagination-dots">...</span>);
    if (currentPage < totalPages) pages.push(<button key="last" onClick={() => handlePageChange(totalPages)} className="pagination-button">{totalPages}</button>);

    return pages;
  };



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
  
    <h2 className="section">DATASET</h2>

    <div className="card mb-3">
      <div className="card-header"> 
        <span className="details-text">Header <DatabaseIcon /></span>
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
        <span className="details-text">MEAN, MEDIAN, MODE <ChartIcon /></span>
        <div className="toggle-button-cover">
          <div id="button-3" className="button r">
            <input
              className="checkbox"
              type="checkbox"
              onChange={() => toggleCardVisibility('boxplot')}
              checked={cardVisibility.boxplot}
            />
            <div className="knobs"></div>
            <div className="layer"></div>
          </div>
        </div>
      </div>
      {cardVisibility.boxplot && (
        <div className="card-body">
          <div className="row">
            {getPaginatedChartsBoxPlot().map((seriesItem, index) => (
              <div key={index} className="col-md-6 mb-3">
                <ReactApexChart options={options} series={[{ type: 'boxPlot', data: [seriesItem] }]} type="boxPlot" height={350} />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="pagination-container d-flex justify-content-center mt-3">
        <div className="pagination-bar">
          <button onClick={() => handlePageChangeBoxPlot(currentPageBoxPlot - 1)} disabled={currentPageBoxPlot === 1} className="pagination-button">{'<'}</button>
          {renderPaginationButtonsBoxPlot()}
          <button onClick={() => handlePageChangeBoxPlot(currentPageBoxPlot + 1)} disabled={currentPageBoxPlot === totalPagesBoxPlot} className="pagination-button">{'>'}</button>
        </div>
      </div>
    </div>


    <div className="row">
    <div className="col-md-12">
        <div className="card mb-3">
          <div className="d-flex justify-content-between align-items-center card-header">
            <span className="details-text">MIN, MAX <ChartIcon /></span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('minmax')} checked={cardVisibility.minmax} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
            </div>
        {cardVisibility.minmax && (
          <div className="card-body">
            <div style={{ height: '300px' }}>
              <Bar data={minMaxChartData} options={minMaxChartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
    </div>


    <div className="row">
    <div className="col-md-12">
        <div className="card mb-3">
          <div className="d-flex justify-content-between align-items-center card-header">
            <span className="details-text">NULL VALUES <ChartIcon /></span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('nullValues')} checked={cardVisibility.nullValues} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
            </div>
        {cardVisibility.nullValues && (
            <div className="card-body d-flex flex-column align-items-center">
            <div style={{ width: '100%', height: '200px' }}>
              <Bar data={nullValuesChartData} options={nullValuesChartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
    </div>


    <div className="card mb-3" style={{ marginTop: 0 }}>
        <div className="d-flex justify-content-between align-items-center card-header">
          <span className="details-text">CHARTS</span>
          <div className="toggle-button-cover">
            <div id="button-3" className="button r">
              <input
                className="checkbox"
                type="checkbox"
                onChange={() => toggleCardVisibility('column')}
                checked={cardVisibility.column}
              />
              <div className="knobs"></div>
              <div className="layer"></div>
            </div>
          </div>
        </div>
        {cardVisibility.column && (
          <>
            <div className="card-body d-flex flex-wrap justify-content-center">
              {getPaginatedCharts().map((attribute) => {
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
                      {maxValues < 5 && <option value={maxValues}>{maxValues} values</option>}
                      {maxValues >= 5 && maxValues < 10 && (
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
            <div className="pagination-container d-flex justify-content-center mt-3">
              <div className="pagination-bar">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">{'<'}</button>
                {renderPaginationButtons()}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-button">{'>'}</button>
              </div>
            </div>
          </>
        )}
      </div>


      <h2 className="section">ALGORITHM</h2>


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


      <div className="row">
    <div className="col-md-12">
      {shouldDisplayCard && (
        <div className="card mb-3">
          <div className="d-flex justify-content-between align-items-center card-header">
            <span className="details-text">TIME EXECUTION <PcIcon /></span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('timeExecution2')} checked={cardVisibility.timeExecution2} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
          </div>
          {cardVisibility.timeExecution2 && (
            <div className="card-body d-flex flex-column align-items-center">
              <div style={{ width: '100%', height: '200px' }}>
                <Bar data={timeChartData} options={timeChartOptions} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>


      <h2 className="section">RESULT</h2>

  
   
  <div className="col-md-12">
    <div className="card mb-3">
      <div className="d-flex justify-content-between align-items-center card-header">
        <span className="details-text">LHS CARDINALITY <ChartIcon /></span>
        <div className="toggle-button-cover">
          <div id="button-3" className="button r">
            <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('cardinality')} checked={cardVisibility.cardinality} />
            <div className="knobs"></div>
            <div className="layer"></div>
          </div>
        </div>
      </div>
      {cardVisibility.cardinality && (
        <div className="card-body d-flex flex-column align-items-center">
          <div style={{ width: '100%', height:'300px'}}>
            <Bar data={lhsAttributeChartData} options={lhsAttributeChartOptions} />
          </div>
        </div>
      )}
    </div>
  </div>
</div>

<div className="card mb-12">
  <div className="d-flex justify-content-between align-items-center card-header">
    <span className="details-text">FREQUENCY <ChartIcon /></span>
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
            <div className="label-boxes-container mt-2 mx-auto">
              <div className="label-boxes">
                {variableChartData.labelsAndColors.map(([label, color], index) => (
                  <div key={index} className="label-box" onClick={() => handleLegendClick(label)}>
                    <div className="color-box" style={{ backgroundColor: color }}></div>
                    {' ' + label}
                  </div>
                ))}
              </div>
        </div>
      <div style={{ height: '300px' }}>
        <Bar data={variableChartData} options={variableChartOptions} />
      </div>
    </div>
  )}
</div>

    <div className="card mb-3">
      <div className="d-flex justify-content-between align-items-center card-header">
        <span className="details-text">IMPLICATING ATTRIBUTES <ChartIcon /> </span>
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
      <span className="details-text">RFDs (total: {allRFDs.length} - filtered: {filteredRFDs.length})</span>
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
              checked={selectedRows.length === filteredRFDs.length}
              onChange={toggleSelectAll}
        />
        <label style={{ marginLeft: '10px' }}>
          {selectedRows.length === filteredRFDs.length ? "Deselect all" : "Select all"}
        </label>
      </div>
      <div style={{ height: '15px' }}></div>

      <div style={{ whiteSpace: 'pre-wrap' }}>
        {filteredRFDs.map((rfd, index) => {

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
          value={customPromptAI}
          onChange={handleTextareaChange}
          style={{ width: "100%", minHeight: "200px" }}
        />
        
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <select
            className="form-select mt-2"
            style={{ display: 'block', marginLeft: '0', width: '300px' }}
            value={selectedPrompt}
            onChange={handlePromptChange}
            >
            {Object.keys(prompts).map((prompt, index) => (
            <option key={index} value={prompt}>
            {prompt}
            </option>
            ))}
         </select>
          <button className="select-btn" onClick={scrollToBottom}>
            {isLoading ? "LOADING..." : "EXPLANATION"}
          </button>
        </div>
      </div>
      )}
    </div>

    <div className="card mb-3">
  <div className="d-flex justify-content-between align-items-center card-header">
    <span className="details-text">EXPLANATION <RobotIcon /></span>
    <div className="toggle-button-cover">
      <div id="button-3" className="button r">
        <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('explanation')} checked={cardVisibility.explanation} />
        <div className="knobs"></div>
        <div className="layer"></div>
      </div>
    </div>
  </div>
  {cardVisibility.explanation && (
    <div className="card-body">
      {isTextGenerated && (
        <>
          <p>{responseAI}</p>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
            <button className="select-btn" onClick={summarizeText}>
              {isLoading2 ? "LOADING..." : "SUMMARY"}
            </button>        
          </div>
        </>
      )}
    </div>
  )}
</div>



    <div className="card mb-3">
      <div className="d-flex justify-content-between align-items-center card-header">
        <span className="details-text">SUMMARY <RobotIcon /></span>
            <div className="toggle-button-cover">
              <div id="button-3" className="button r">
                <input className="checkbox" type="checkbox" onChange={() => toggleCardVisibility('summary')} checked={cardVisibility.summary} />
                <div className="knobs"></div>
                <div className="layer"></div>
              </div>
            </div>
            </div>
          {cardVisibility.summary && (
            <div className="card-body">
              {isTextGenerated2 && (
                <p>{responseAI2}</p>
              )}
            </div>
          )}
      </div>
      </div>
    </div>

    

  );
};

export default FileDetailsPage;