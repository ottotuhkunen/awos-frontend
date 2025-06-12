import React, { useState } from 'react';
import '../styles/SetupPage.css';
import '../styles/SnowtamAndRunway.css';

const SnowtamPage = ({efhkData}) => {
  const [selectedTab, setSelectedTab] = useState('Snowtam');

  const renderContent = () => {
    switch (selectedTab) {
      case 'Snowtam':
        return <Snowtam efhkData={efhkData}/>;
      case 'Taxiways':
        return <Taxiways />;
      case 'Aprons':
        return <Aprons />;
      default:
        return null;
    }
  };

  return (
    <div className='setup-div'>
      
      {/* Top Buttons (from index.css) */}
      <div className='page-buttons-container'>
        <button onClick={() => setSelectedTab('Snowtam')} className={selectedTab === 'Snowtam' ? 'page-button selected' : 'page-button'}>
          Snowtam
        </button>
        <button onClick={() => setSelectedTab('Taxiways')} className={selectedTab === 'Taxiways' ? 'page-button selected' : 'page-button'}>
          Taxiways
        </button>
        <button onClick={() => setSelectedTab('Aprons')} className={selectedTab === 'Aprons' ? 'page-button selected' : 'page-button'}>
          Aprons
        </button>
      </div>

      {/* Render pages below the buttons */}
      <div className='setup-div-content'>{renderContent()}</div>

    </div>
  );
};

export default SnowtamPage;


const Snowtam = ({efhkData}) => {

  const rawSnowtam = efhkData?.snowtam || 'SNOWTAM NIL';

  // Regex to split on: space + 8 digits + space OR '/REMARK'
  const parts = rawSnowtam.split(/ (?=\d{8} )| (?=REMARK\/)/g);
  const timeMatch = rawSnowtam.match(/ (\d{8}) /);
  const snowtamTime = timeMatch ? timeMatch[1] : '//';
  const snowtamDatePart = snowtamTime !== '//' ? snowtamTime.slice(0, 4) : '//';
  const snowtamTimePart = snowtamTime !== '//' ? snowtamTime.slice(4) : '//';

  return (
    <div className="setup-page-container">
      <div className="snowtam-border-div">
        <h1>EFHK REPORT ID</h1>
        <p>EFHK_2025_{snowtamDatePart}{snowtamTimePart}_01</p>
      </div>
      <div className="snowtam-border-div">
        <h1>SNOWTAM #LOCAL</h1>
        <div>
          GG EFHKSUMM <br/>
          {snowtamTimePart} EFHKZTZX <br/>
          SWEF0000 EFHK {snowtamTime} <br/>
          <pre>({parts.join('\n')})</pre>
        </div>
      </div>
      <div className="snowtam-border-div">
        <h1>AIRPORT COMMENTS</h1>
        <p>COMMENT SNOWTAM:</p>
        <p>NIL</p>
        <p>COMMENT ATIS:</p>
        <p>NIL</p>
        <p>COMMENT 'TORNI':</p>
        <p>NIL</p>
      </div>
    </div>

  );
  

};

const taxiwayNames = [
  'TWY Y OUTDATED', 
  'TWY Z OUTDATED', 
  'TWY S OUTDATED', 
  'TWY D OUTDATED',
  'TWY G OUTDATED',
  'TWY W OUTDATED',
  '', ''];

const Taxiways = () => (
  <div className="setup-page-container">
    <div className="snowtam-border-div">
      <h1>TAXIWAYS</h1>
    </div>

    <div className="taxiway-grid">
      {taxiwayNames.map((name, index) => (
        <div className="taxiway-box" key={index}>
          {name}
        </div>
      ))}
    </div>
  </div>
);

const apronNames = [
  'APN 1N OUTDATED', 
  'APN 1W OUTDATED', 
  'APN 1S OUTDATED', 
  'APN 2 OUTDATED',
  'APN 3 OUTDATED',
  'APN 4 OUTDATED',
  'APN 6 OUTDATED', 
  'APN 8 OUTDATED',
  'APN 9 OUTDATED',
  'APN 1E OUTDATED',
  '', ''];

const Aprons = () => (
  <div className="setup-page-container">
    <div className="snowtam-border-div">
      <h1>APRONS</h1>
    </div>

    <div className="taxiway-grid">
      {apronNames.map((name, index) => (
        <div className="taxiway-box" key={index}>
          {name}
        </div>
      ))}
    </div>
  </div>
);