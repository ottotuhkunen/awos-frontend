import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { XMLParser } from 'fast-xml-parser';
import '../styles/Charts.css';

const Charts = ({ fmisid }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchXML = async () => {
      const url = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::observations::weather::multipointcoverage&fmisid=${fmisid}`;

      try {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
        const result = parser.parse(text);
        const data = extractWeatherData(result);
        setChartData(data);
      } catch (err) {
        console.error('Error loading/parsing XML:', err);
      }
    };

    fetchXML();
  }, [fmisid]);

  if (!chartData) return <div>Loading...</div>;

  return (
    <div className="charts-container">
      <ChartBox 
        title="Wind dir (MAG)" 
        legend={[
          { label: 'DIR 2min AVG', color: '#3495e5' },
        ]}
        data={chartData.windDir} options={chartData.windDirOptions}
      />
      <ChartBox 
        title="Wind speed (kt)" 
        legend={[
          { label: 'SPD 2min AVG', color: '#3495e5' },
          { label: 'SPD 2min MAX', color: 'gray' }
        ]} 
        data={chartData.windSpeed} options={chartData.windSpeedOptions} 
      />
      <ChartBox 
        title="Temp / dew point / humidity" 
        legend={[
          { label: 'T', color: '#3495e5' },
          { label: 'DP', color: '#2b4c70' },
          { label: 'RH %', color: 'gray' }
        ]}
        data={chartData.tempDewRH} options={chartData.tempDewRHOptions}
      />
      <ChartBox 
        title="QNH (hPa)" 
        legend={[
          { label: 'QNH', color: 'green' },
        ]}
        data={chartData.pressure} options={chartData.pressureOptions}
      />
      <ChartBox 
        title="Prevailing VIS" 
        legend={[
          { label: 'PVIS 10min', color: '#3495e5' },
        ]}
        data={chartData.visibility} options={chartData.visibilityOptions}
        />
      <ChartBox title="CB on/off (Not implemented)" legend={[{ label: 'CB 5min', color: 'red' },]} data={{ labels: [], datasets: [] }} />
    </div>
  );
};


const ChartBox = ({ title, legend = [], data, options }) => (
  <div className="chart-box">
    <p className="chart-title">{title}</p>
    <div className="chart-legend">
      {legend.map(({ label, color }, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <div className="chart-legend-color" style={{ backgroundColor: color }}/>
          <span>{label}</span>
        </div>
      ))}
    </div>
    <div className="chart-container">
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          ...options
        }}
      />
    </div>
  </div>
);



const extractWeatherData = (xml) => {
  const member = xml['wfs:FeatureCollection']['wfs:member'];
  const observation = member['omso:GridSeriesObservation'];
  const range = observation['om:result']['gmlcov:MultiPointCoverage']['gml:rangeSet']['gml:DataBlock']['gml:doubleOrNilReasonTupleList'];
  const timePeriod = observation['om:phenomenonTime']['gml:TimePeriod'];
  
  // Parse the end time from the XML (most recent observation)
  const endTime = new Date(timePeriod['gml:endPosition']);

  const values = range.trim().split(/\s+/).map(Number);
  const stepSize = 13;
  const timeLabels = [];
  const t2m = [], td = [], rh = [], ws = [], wg = [], wd = [], p = [], vis = [];

  // Get the time interval between observations
  const beginTime = new Date(timePeriod['gml:beginPosition']);
  const interval = (endTime - beginTime) / (values.length / stepSize - 1);

  // Calculate the index where we should start collecting data (last 3 hours)
  const totalPoints = values.length / stepSize;
  const pointsToKeep = Math.min(totalPoints, 200); // interval
  const startIndex = Math.max(0, totalPoints - pointsToKeep) * stepSize;

  for (let i = startIndex; i < values.length; i += stepSize) {
    const observationTime = new Date(endTime.getTime() - (pointsToKeep - 1 - (i - startIndex)/stepSize) * interval);
    
    timeLabels.push(observationTime.toISOString().slice(11, 16));
    t2m.push(values[i]);
    ws.push(values[i + 1] * 1.94384);
    wg.push(values[i + 2] * 1.94384);
    wd.push(values[i + 3]);
    rh.push(values[i + 4]);
    td.push(values[i + 5]);
    p.push(values[i + 9]);
    vis.push(values[i + 10] / 1000);
  }

  const lineOnlyOptions = {
    pointRadius: 0,
    pointHoverRadius: 0,
    borderWidth: 2
  };

  const pointsOnlyOptions = {
    pointRadius: 1.4,
    pointHoverRadius: 4,
    borderWidth: 0,
    showLine: false
  };

  const minPressure = Math.min(...p);
  const maxPressure = Math.max(...p);
  const rangePressure = maxPressure - minPressure;
  const paddingPressure = Math.max((6 - rangePressure) / 2, 0);

  const maxGust = Math.max(...wg);
  const paddingWindSpeed = Math.max((maxGust + 2));

  return {
    windDir: {
      labels: timeLabels,
      datasets: [{
        label: 'Wind Direction',
        data: wd,
        borderColor: '#3495e5',
        tension: 0.4,
        ...lineOnlyOptions
      }]
    },
    windDirOptions: {
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 0,
            color: 'gray',
            font: { weight: 'bold', size: 10, },
          },
          grid: { color: 'gray', lineWidth: 0.3 },
        },
        y: {
          type: 'linear',
          position: 'left',
          min: 0,
          max: 360,
          ticks: {
            color: 'gray',
            font: { weight: 'bold', size: 10, },
            stepSize: 45,
            callback: value => {
              const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
              return directions[Math.round(value / 45) % 8];
            }
          },
          grid: { color: 'gray', lineWidth: 0.3 },
        },
        y1: {  // Add a second y-axis on the right
          type: 'linear',
          position: 'right',
          min: 0,
          max: 360,
          grid: {
            drawOnChartArea: false,
            color: 'gray', lineWidth: 0.3
          },
          ticks: {
            color: 'gray',
            font: { weight: 'bold', size: 10, },
            stepSize: 45,
            callback: value => {
              const degrees = ['360°', '', '90°', '', '180°', '', '270°', '', '0°'];
              return degrees[Math.round(value / 45) % 8];
            }
          }
        }
      }
    },

    windSpeed: {
      labels: timeLabels,
      datasets: [
        {
          label: 'Wind Speed',
          data: ws,
          borderColor: '#3495e5',
          tension: 0.4,
          ...lineOnlyOptions
        },
        { 
          label: 'Wind MAX', 
          data: wg, 
          borderColor: 'gray',
          tension: 0.4,
          ...lineOnlyOptions
        },
      ]
    },
    windSpeedOptions: {
      scales: {
        x: {
          ticks: {
            callback: function(value, index, values) {
              return index % 2 === 0 ? this.getLabelForValue(value) : '';
            },
            autoSkip: true,
            maxRotation: 45,
            minRotation: 0,
            color: 'gray',
            font: { weight: 'bold', size: 10, },
          },
          grid: { color: 'gray', lineWidth: 0.3 },
        },
        y: {
          
          position: 'right',
          min: 0,
          max: Math.ceil(paddingWindSpeed),
          ticks: {
            color: 'gray',
            font: { weight: 'bold', size: 10, },
            callback: value => `${value} kt`
          },
          grid: { color: 'gray', lineWidth: 0.3 },
        }
      }
    },

    tempDewRH: {
      labels: timeLabels,
      datasets: [
        { 
          label: 'Temp', 
          data: t2m, 
          borderColor: '#3495e5', 
          yAxisID: 'y', 
          tension: 0.4,
          ...lineOnlyOptions
        },
        { 
          label: 'Dew Point', 
          data: td, 
          borderColor: '#2b4c70', 
          yAxisID: 'y', 
          tension: 0.4,
          ...lineOnlyOptions
        },
        { 
          label: 'RH', 
          data: rh, 
          backgroundColor: 'gray', 
          yAxisID: 'y1', 
          tension: 0.4,
          ...pointsOnlyOptions
        },
      ]
    },
    tempDewRHOptions: {
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 0,
            color: 'gray',
            font: { weight: 'bold', size: 10, },
          },
          grid: { color: 'gray', lineWidth: 0.3 },
        },
        y: {
          position: 'left',
          ticks: {
            callback: value => `${value.toFixed(1)}°C`,
            color: 'gray',
            font: { weight: 'bold', size: 10, },
          },
          grid: { color: 'gray', lineWidth: 0.3 },
        },
        y1: {
          position: 'right',
          min: 0,
          max: 100,
          ticks: {
            stepSize: 10,
            callback: value => `${value} %`,
            color: 'gray',
            font: { weight: 'bold', size: 10, },
          },
          grid: {
            drawOnChartArea: false,
            color: 'gray', lineWidth: 0.3
          }
        }
      }
    },

    pressure: {
      labels: timeLabels,
      datasets: [{
        label: 'Pressure',
        data: p,
        backgroundColor: 'green',
        ...pointsOnlyOptions
      }]
    },
    pressureOptions: {
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 0,
            color: 'gray',
            font: { weight: 'bold', size: 10, },
          },
          grid: { color: 'gray', lineWidth: 0.3 },
        },
        y: {
          position: 'right',
          min: Math.floor(minPressure - paddingPressure),
          max: Math.ceil(maxPressure + paddingPressure),
          ticks: {
            callback: value => `${value}`,
            color: 'gray',
            font: { weight: 'bold', size: 10, },
          },
          grid: { color: 'gray', lineWidth: 0.3 },
        }
      }
    },

    visibility: {
      labels: timeLabels,
      datasets: [{
        label: 'Visibility',
        data: vis,
        backgroundColor: '#3495e5',
        ...pointsOnlyOptions
      }]
    },
    visibilityOptions: {
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 0,
            color: 'gray',
            font: { weight: 'bold', size: 10, },
          },
          grid: { color: 'gray', lineWidth: 0.3 },
        },
        y: {
          position: 'right',
          min: 0,
          ticks: {
            callback: value => `${value} km`,
            color: 'gray',
            font: { weight: 'bold', size: 10, },
          },
          grid: { color: 'gray', lineWidth: 0.3 },
        }
      }
    }
  };
};

export default Charts;