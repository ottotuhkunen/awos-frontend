import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { airportData } from './utils'
import { URL_START } from '../../data/config';

import StaticBars from './StaticBars';
import MainPage from './MainPage';
import Charts from './Charts';
import Ceilometer from './Ceilometer';
import LatestMetars from './LatestMetars';

const AwosView = ({data}) => {
  const { airportCode } = useParams();
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [atisData, setAtisData] = useState({});

  useEffect(() => {
    document.title = airportCode.toUpperCase() + ' | AWOS Display';
  }, [airportCode]);

  useEffect(() => {
    // Initial fetch to get current ATIS data
    fetch(URL_START + '/atis')
      .then(res => res.json())
      .then(data => setAtisData(data))
      .catch(err => console.error('Failed to fetch initial ATIS data:', err));
  
    // Create WebSocket with explicit config
    const socket = io(URL_START, {
      transports: ['websocket'],
    });
  
    socket.on('connect', () => {
      console.log('Websocket connected');
    });
  
    socket.on('atisUpdate', ({ icao, atisData }) => {
      setAtisData(prev => ({
        ...prev,
        [icao]: atisData,
      }));
    });
  
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
  
    return () => {
      socket.disconnect();
    };
  }, []);  

  // get ATIS for selected airport
  const atis = atisData[airportCode.toUpperCase()];
  const activeRunway = parseInt(atis?.preset?.split(' ')[0], 10);
  // console.log('ATIS data loaded for ' + airportCode + ' ' + atis);

  const fetchWeather = async (fmisid) => {
    console.log('Fetching FMI Weather');
    const url = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::observations::weather::multipointcoverage&fmisid=${fmisid}`;
    try {
        const res = await fetch(url);
        const xmlText = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, 'text/xml');

        // Extract the fields (order matters!)
        const fields = Array.from(xml.getElementsByTagNameNS('http://www.opengis.net/swe/2.0', 'field')).map(el =>
            el.getAttribute('name')
        );

        const tupleList = xml.getElementsByTagNameNS('http://www.opengis.net/gml/3.2', 'doubleOrNilReasonTupleList')[0]?.textContent.trim();
        if (!tupleList) return;

        const rows = tupleList.split(/\s+/g);
        const fieldCount = fields.length;
        const latestRow = rows.slice(-fieldCount);

        const result = {};
        fields.forEach((name, index) => {
            result[name] = parseFloat(latestRow[index]) || null;
        });

        setWeatherData(result);

    } catch (error) {
        console.error("Failed to load FMI data:", error);
    }
  };

  useEffect(() => {
    const selected = airportData.find(a => a.icao === airportCode);
    if (!selected) return;

    fetchWeather(selected.fmisid);

    const interval = setInterval(() => {
      fetchWeather(selected.fmisid);
    }, 5 * 60 * 1000); // every 5 minutes

    return () => clearInterval(interval);
  }, [airportCode]);

  const renderContent = () => {
    switch (selectedMenuIndex) {
      case 0: return <MainPage icao={airportCode} data={data} wx={weatherData} activeRunway={activeRunway}/>;
      case 1: return <Charts fmisid={airportData.find(a => a.icao === airportCode).fmisid}/>
      case 2: return <Ceilometer icao={airportCode}/>
      case 3: return <LatestMetars icao={airportCode}/>
      case 4: return <ScreenCleaningPage />
      default: return <div style={{padding: '10px'}}>Work in progress. New AWOS version relased.</div>;
    }
  };

  return (
    <div>
      <StaticBars 
        onSelect={setSelectedMenuIndex}
        selectedIndex={selectedMenuIndex} 
        icao={airportCode}
        wx={weatherData}
        data={data}
        activeRunway={activeRunway}
        atis={atis}
      />
      <main style={{height: 'calc(100vh - 148px)'}}>{renderContent()}</main>
    </div>
  );
};

const ScreenCleaningPage = () => {
  return (
      <div className='awosview-screen-cleaning'>
          <div className='awosview-screen-cleaning-box'>
            You may now clean the touch screen. <br />
            Use the home button in the top menu to return to AWOS.
          </div>
      </div>
  );
};

export default AwosView;
