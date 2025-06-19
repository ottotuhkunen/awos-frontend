import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { URL_START } from './data/config';
import TopMenu from './avimet/TopMenu';
import LeftMenu from './avimet/LeftMenu';
import Metar from './avimet/Metar';

import ProtectedRoute from './ProtectedRoute';
import Login from './Login';
import { AuthProvider } from './AuthContext';

import MainPage from './avimet/pages/MainPage';
import RunwayPage from './avimet/pages/RunwayPage';
import SnowtamPage from './avimet/pages/SnowtamPage';
import MetReportPage from './avimet/pages/MetReportPage';
import SetupPage from './avimet/pages/SetupPage';
import AwosViewPage from './avimet/pages/AwosViewPage';
import AtisWindow from './avimet/pages/AtisWindow';

import AwosView from './awosview/pages/AwosView';
import './fonts/fonts.css';

function App() {
  const [awosData, setAwosData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let isMounted = true;
  
    const fetchMetars = async () => {
      console.log('Fetching METARs');
      try {
        const response = await fetch(URL_START + '/api/metars');
        if (!response.ok) {
          throw new Error(`Failed to fetch METARs: ${response.statusText}`);
        }
        const data = await response.json();
        if (isMounted) setAwosData(data);
        if (isMounted) setFetchError(null);
      } catch (error) {
        if (isMounted) setFetchError(error.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
  
    fetchMetars();
    const intervalId = setInterval(fetchMetars, 2 * 60 * 1000);
  
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);  

  if (loading) return <div>Loading AWOS data...</div>;
  if (fetchError) return <div>Error loading AWOS data: {fetchError}</div>;
  
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Login page */}
            <Route path="/login" element={<Login />} />

              {/* Main AVIMET app */}
              <Route path="/" element={<ProtectedRoute><AvimetLayout metarTaf={awosData}/></ProtectedRoute>} />

              {/* AWOSVIEW app */}
              <Route path="/:airportCode" element={<ProtectedRoute><AwosView data={awosData} /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

const AvimetLayout = ({metarTaf}) => {
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [atisData, setAtisData] = useState({});
  const [efhkData, setEfhkData] = useState({});
  const [atisOpen, setAtisOpen] = useState(false);
  const [atisType, setAtisType] = useState(null);

  useEffect(() => {
    document.title = 'EFHK | AWOS Display';
  }, []);

  useEffect(() => {
    const fetchEfhk = () => {
      fetch(URL_START + '/api/efhk')
        .then(res => res.json())
        .then(data => setEfhkData(data))
        .catch(err => console.error('Failed to fetch EFHK data:', err));
    };
  
    fetchEfhk(); // Initial fetch
    const intervalId = setInterval(fetchEfhk, 2 * 60 * 1000); // Refresh every 2 minutes
  
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);  

  useEffect(() => {
    // Initial fetch to get current ATIS data
    fetch(URL_START + '/atis')
      .then(res => res.json())
      .then(data => setAtisData(data))
      .catch(err => console.error('Failed to fetch initial ATIS data:', err));

    // Set up WebSocket connection for live updates
    const socket = io(URL_START);

    socket.on('connect', () => {
      console.log('Socket connected'); // socket.id
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

  // get ATIS for user-entered ICAO (uppercase)
  const atisDep = atisData['EFHKD'];
  const atisArr = atisData['EFHKA'];


  const handleOpenAtis = (type) => {
    setAtisType(type);
    setAtisOpen(true);
  };

  const handleCloseAtis = () => {
    setAtisOpen(false);
    setAtisType(null);
  };

  const renderContent = () => {
    switch (selectedMenuIndex) {
      case 0: return <MainPage efhkData={efhkData} atisDep={atisDep} atisArr={atisArr} randomizers={metarTaf}/>;
      case 1: return <RunwayPage rwys={['04R', '22L']} efhkData={efhkData}/>;
      case 2: return <RunwayPage rwys={['15', '33']} efhkData={efhkData}/>;
      case 3: return <RunwayPage rwys={['04L', '22R']} efhkData={efhkData}/>;
      case 4: return <SnowtamPage efhkData={efhkData}/>;
      case 5: return <MetReportPage metarTaf={metarTaf} efhkData={efhkData}/>;
      case 6: return <SetupPage atisDep={atisDep} atisArr={atisArr} efhkData={efhkData}/>;
      case 7: return <AwosViewPage />;
      default: return <div>Not Found</div>;
    }
  };

  return (
    <>
      <TopMenu efhkData={efhkData} atisDep={atisDep} atisArr={atisArr}  onOpenAtis={handleOpenAtis}/>
      <div className="app__content">
        <LeftMenu onSelect={setSelectedMenuIndex} selectedIndex={selectedMenuIndex}  onCloseAtis={handleCloseAtis} efhkData={efhkData}/>
        <main className="main-content">{renderContent()}</main>
        {atisOpen && <AtisWindow type={atisType} onClose={handleCloseAtis} atisText="ATIS NIL" />}
      </div>
      <Metar metar={efhkData.metar} />
    </>
  );
};

export default App;
