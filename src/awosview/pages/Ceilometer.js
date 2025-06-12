import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import '../styles/Charts.css';
import { airportData } from './utils'; 

const CLOUD_COVERAGE = {
  FEW: 0.1,
  SCT: 0.3,
  BKN: 0.7,
  OVC: 1.0,
};

const parseMetarTime = (metar) => {
  const match = metar.match(/\b(\d{2})(\d{2})(\d{2})Z\b/);
  if (!match) return null;
  const [, dayStr, hourStr, minuteStr] = match;
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const date = new Date(Date.UTC(year, month, day, hour, minute));
  return date;
};

const extractCloudLayers = (metar) => {
  const regex = /(?:\s|^)(FEW|SCT|BKN|OVC)(\d{3})/g;
  const layers = [];
  let match;
  while ((match = regex.exec(metar)) !== null) {
    const type = match[1];
    const altitude = parseInt(match[2], 10) * 100;
    layers.push({ type, altitude });
  }
  return layers;
};

const Ceilometer = ({ icao }) => {
  const [metars, setMetars] = useState([]);
  const [maxHeight, setMaxHeight] = useState(5000);

  useEffect(() => {
    const fetchMetars = async () => {
      try {
        const response = await fetch(`https://api.met.no/weatherapi/tafmetar/1.0/metar.txt?icao=${icao}`);
        const text = await response.text();

        const lines = text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .reverse()
          .slice(0, 12);

        setMetars(lines);
      } catch (error) {
        console.error('Failed to fetch METAR data:', error);
      }
    };

    fetchMetars();
  }, [icao]);

  const chartData = () => {
    const dataPoints = [];

    const styles = getComputedStyle(document.documentElement);
    const ceilometerDotColor = styles.getPropertyValue('--awosview-ceilometer-dot').trim();
  
    metars.forEach((metar) => {
      const time = parseMetarTime(metar);
      if (!time) return;
  
      const clouds = extractCloudLayers(metar);
  
      clouds.forEach(cloud => {
        const density = CLOUD_COVERAGE[cloud.type] || 0;
        const totalMinutes = 30;
        const dotSpacing = 2 + Math.round((1 - density) * 10); // sparse spacing for FEW, dense for OVC
        const steps = Math.floor(totalMinutes / dotSpacing);

        for (let i = 0; i <= steps; i++) {
          const offsetTime = new Date(time.getTime() + i * dotSpacing * 60 * 1000);
          const jitter = (Math.random() - 0.5) * 200; // ±100 ft
          const variedAltitude = cloud.altitude + jitter;
          dataPoints.push({ x: offsetTime, y: Math.max(0, Math.round(variedAltitude / 10) * 10) });
        }
      });
    });
  
    return {
      datasets: [
        {
          label: 'Cloud Layers (feet)',
          data: dataPoints,
          borderColor: ceilometerDotColor,
          backgroundColor: ceilometerDotColor,
          pointRadius: 1.6,
          showLine: false,
        },
      ],
    };
  }; 

  const getTimeRange = () => {
    if (metars.length === 0) return [null, new Date()]; // min null, max now
    const times = metars
      .map(metar => parseMetarTime(metar))
      .filter(t => t !== null)
      .sort((a, b) => a - b);
    if (times.length === 0) return [null, new Date()];
    return [times[0], new Date()];  // earliest METAR time, max = now
  };

  const [minTime, maxTime] = getTimeRange();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2, 
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.raw.y} ft`,
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        min: minTime,
        max: maxTime,
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm',
          },
          tooltipFormat: 'HH:mm',
        },
        title: {
          display: true,
          text: 'UTC',
        },
        grid: { color: 'gray', lineWidth: 0.3 },
        ticks: {
          color: 'gray',
          font: { weight: 'bold', size: 10, },
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          stepSize: 30,
          callback: (value) => {
            const date = new Date(value);
            return date.toISOString().substring(11, 16); // Show HH:mm
          },
        },
      },
      y: {
        min: 0,
        max: maxHeight,
        title: {
          display: true,
          text: 'cloud base height [ft]',
        },
        grid: { color: 'gray', lineWidth: 0.3 },
        ticks: {
          color: 'gray',
          font: { weight: 'bold', size: 10, },
          callback: function(value) {
            return value.toString();
          },
        },
      },
    },
  };

  const airport = airportData.find(
    (airport) => airport.icao.toLowerCase() === icao.toLowerCase()
  );

  const ceilometerNames = airport?.ceilometers?.map(c => c.name) || [];


  return (
    <div className="ceilometer-page-container">
      <div className="ceilometer-button-group">
        <p>Max height</p>
        {[1000, 2000, 5000, 10000].map(height => (
          <button
            key={height}
            className={maxHeight === height ? 'active' : ''}
            onClick={() => setMaxHeight(height)}
          >
            {height / 1000}
          </button>
        ))}
      </div>

      <div className='ceilometer-titles'>
        {ceilometerNames.length > 0 ? (
          ceilometerNames.map((name, idx) => (
            <p key={idx} className="chart-title">{icao.toUpperCase()}RWY{name.replace(/\s+/g, '')} Ceilometer</p>
          ))
        ) : (
          <p>No ceilometer data found for {icao.toUpperCase()}</p>
        )}
      </div>

      <div className="awosview-ceilometer-container">
        <div className="awosview-ceilometer-chart">
          <Line key={maxHeight} data={chartData()} options={chartOptions} />
        </div>
        {ceilometerNames.length > 1 && (
          <div className="awosview-ceilometer-chart">
            <Line key={maxHeight} data={chartData()} options={chartOptions} />
          </div>
        )}
      </div>


    </div>
  );
};

export default Ceilometer;
