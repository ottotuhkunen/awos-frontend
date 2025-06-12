import React, { useState } from 'react';
import '../styles/SetupPage.css';
import '../styles/SnowtamAndRunway.css';

const RunwayPage = ({rwy1, rwy2}) => {
  const [selectedTab, setSelectedTab] = useState('Report1');

  const renderContent = () => {
    switch (selectedTab) {
      case 'Report1':
        return <Report1 rwy1={rwy1} rwy2={rwy2} />;
      case 'Report2':
        return <Report2 />;
      default:
        return null;
    }
  };

  return (
    <div className='setup-div'>
      
      {/* Top Buttons (from index.css) */}
      <div className='page-buttons-container'>
        <button onClick={() => setSelectedTab('Report1')} className={selectedTab === 'Report1' ? 'page-button selected' : 'page-button'}>
          Report 1
        </button>
        <button onClick={() => setSelectedTab('Report2')} className={selectedTab === 'Report2' ? 'page-button selected' : 'page-button'}>
          Report 2
        </button>
      </div>

      {/* Render pages below the buttons */}
      <div className='setup-div-content'>{renderContent()}</div>

    </div>
  );
};

export default RunwayPage;

const SvgRcr = ({rcc}) => {
  return (
    <svg viewBox="0 0 632.772 381.37">
      <rect y="5.095" width="632.772" height="372.812"/>
      <line className="rwysvg-border" y1="5.095" x2="632.772" y2="5.095"/>
      <line className="rwysvg-border" y1="377.907" x2="632.772" y2="377.907"/>
      <circle className="rwysvg-lights" cx="27.658" cy="45.715" r="12.069"/>
      <circle className="rwysvg-lights" cx="27.658" cy="94.31" r="12.069"/>
      <circle className="rwysvg-lights" cx="27.658" cy="142.906" r="12.069"/>
      <circle className="rwysvg-lights" cx="27.658" cy="191.501" r="12.069"/>
      <circle className="rwysvg-lights" cx="27.658" cy="240.097" r="12.069"/>
      <circle className="rwysvg-lights" cx="27.658" cy="288.692" r="12.069"/>
      <circle className="rwysvg-lights" cx="27.658" cy="337.288" r="12.069"/>
      <circle className="rwysvg-lights" cx="603.71" cy="47.212" r="12.069"/>
      <circle className="rwysvg-lights" cx="603.71" cy="95.808" r="12.069"/>
      <circle className="rwysvg-lights" cx="603.71" cy="144.403" r="12.069"/>
      <circle className="rwysvg-lights" cx="603.71" cy="192.999" r="12.069"/>
      <circle className="rwysvg-lights" cx="603.71" cy="241.594" r="12.069"/>
      <circle className="rwysvg-lights" cx="603.71" cy="290.19" r="12.069"/>
      <circle className="rwysvg-lights" cx="603.71" cy="338.785" r="12.069"/>
      <rect className="rwysvg-centerline" x="306.996" y="28.735" width="18.78" height="53.186"/>
      <rect className="rwysvg-centerline" x="306.996" y="120.515" width="18.78" height="53.186"/>
      <rect className="rwysvg-centerline" x="306.996" y="212.296" width="18.78" height="53.186"/>
      <rect className="rwysvg-centerline" x="306.996" y="304.076" width="18.78" height="53.186"/>
      <text className="rwysvg-rcc" transform="translate(205.215 229.526)">{rcc}</text>
    </svg>
  );
};

const Report1 = ({rwy1, rwy2}) => {

  const rcc = [5, 4, 5]

  return (
    <div className="setup-page-container rwy-report-columns">
      <div className="rwy-report-column-left">
        {/* Left content */}
        <div className="snowtam-border-div">
          <h1>EFHK {rwy1}</h1>
          <div className='rwy-report-text-table'>
            <p>ASSESSED</p> <p>02.06.2025</p> <p>08:31 UTC</p>
            <p>REPORTED</p> <p>02.06.2025</p> <p>08:31 UTC</p>
            <p>VALID</p> <p>NIL</p> <p>NIL</p>
          </div>
        </div>
        <div className='rwysvg-container'>
          <p>RWYCC</p>
          <SvgRcr rcc={rcc[0]} />
          <p className='rwysvg-contaminant'>WET 1mm</p>
          <SvgRcr rcc={rcc[1]} />
          <p className='rwysvg-contaminant'>WET 1mm</p>
          <SvgRcr rcc={rcc[2]} />
          <p className='rwysvg-contaminant'>WET 1mm</p>
        </div>
        
      </div>
      <div className="rwy-report-column-right">
        {/* Right content */}
        <div className="snowtam-border-div">
          <p><u>ATIS READOUT</u></p>

          <p className='rwy-text-pt'><u>RWY {rwy1}</u></p>
          <p>RUNWAY {rwy1} CONDITION REPORT AT 08:31 UTC</p>
          <p>RUNWAY CONDITION CODES 5, 5, 5</p>
          <p>CONTAMINANTS ALL PARTS 100 PERCENT WET</p>


          <p className='rwy-text-pt'><u>RWY {rwy2}</u></p>
          <p>RUNWAY {rwy2} CONDITION REPORT AT 08:31 UTC</p>
          <p>RUNWAY CONDITION CODES 5, 5, 5</p>
          <p>CONTAMINANTS ALL PARTS 100 PERCENT WET</p>
          <br/>
        </div>

        <div className="snowtam-border-div">
          <p><u>LFC READOUT</u></p>

          <p className='rwy-text-pt'><u>RWY {rwy1}</u></p>
          <p>FRICTION COEFFICIENTS NR/NR/NR</p>


          <p className='rwy-text-pt'><u>RWY {rwy2}</u></p>
          <p>FRICTION COEFFICIENTS NR/NR/NR</p>
          <br/>
        </div>
      </div>
    </div>

  )


};





const Report2 = () => (
  <div className="setup-page-container">
    <div className="snowtam-border-div">
      <h1>NIL</h1>
    </div>
  </div>
);

