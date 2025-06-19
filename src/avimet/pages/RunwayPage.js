import React, { useState } from 'react';
import '../styles/SetupPage.css';
import '../styles/SnowtamAndRunway.css';

const RunwayPage = ({rwys, efhkData}) => {
  const [selectedTab, setSelectedTab] = useState('Report1');

  const efhkRcr = efhkData?.[`rcc_values_${rwys[0]}`];
  const isClosed = efhkData?.[`runway${rwys[0]}_closed`];

  const renderContent = () => {
    switch (selectedTab) {
      case 'Report1':
        return <Report1 rwy1={rwys[0]} rwy2={rwys[1]} efhkRcr={efhkData?.[`rcc_values_${rwys[0]}`]} isClosed={isClosed} />;
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

const SvgRcr = ({ rcc, trend, isClosed }) => {
  // Determine visibility of closedMark and trendMark
  const closedVisibility = isClosed ? 'visible' : 'hidden';
  const showTrendMark = !isClosed && trend !== 0;
  const trendVisibility = showTrendMark ? 'visible' : 'hidden';
  const trendTransform = trend === 1 ? 'rotate(180, 404, 193)' : undefined; // center of polygon is near (404, 193)

  // Determine visibility of RCR text
  const rccVisibility = isClosed ? 'hidden' : 'visible';

  return (
    <svg viewBox="0 0 632.772 381.37">
      <rect y="5.095" width="632.772" height="372.812"/>
      <line className="rwysvg-border" y1="5.095" x2="632.772" y2="5.095"/>
      <line className="rwysvg-border" y1="377.907" x2="632.772" y2="377.907"/>

      {/* Lights */}
      {[45.715, 94.31, 142.906, 191.501, 240.097, 288.692, 337.288].map((cy, i) => (
        <circle key={i} className="rwysvg-lights" cx="27.658" cy={cy} r="12.069"/>
      ))}
      {[47.212, 95.808, 144.403, 192.999, 241.594, 290.19, 338.785].map((cy, i) => (
        <circle key={i + 10} className="rwysvg-lights" cx="603.71" cy={cy} r="12.069"/>
      ))}

      {/* Centerline */}
      {[28.735, 120.515, 212.296, 304.076].map((y, i) => (
        <rect key={i} className="rwysvg-centerline" x="306.996" y={y} width="18.78" height="53.186"/>
      ))}

      {/* RCR Value */}
      <text className="rwysvg-rcc" transform="translate(205.215 229.526)" visibility={rccVisibility}>
        {rcc}
      </text>

      {/* Trend Arrow */}
      <polygon className="rwysvg-fill-white" points="375.2953 163.994 433.3052 163.994 404.7527 222.0039 375.2953 163.994"
        visibility={trendVisibility}
        transform={trendTransform}
      />

      {/* Closed Mark */}
      <polygon className="rwysvg-fill-white" visibility={closedVisibility}
        points="339.889 191.496 434.949 286.556 410.749 310.766 315.689 215.706 220.619 310.766 196.419 286.556 291.479 191.496 196.419 96.436 220.619 72.236 315.689 167.296 410.749 72.236 434.949 96.436 339.889 191.496"
      />

      {/* Snwow banks */}
      <rect id="snowBanks1" visibility={'hidden'} className="rwysvg-fill-white" x="52.9211" y="7.621" width="111.1177" height="367.563"/>
      <rect id="snowBanks2" visibility={'hidden'} className="rwysvg-fill-white" x="468.9117" y="7.621" width="111.1177" height="367.563"/>

    </svg>
  );
};

const SvgRcrBottomPart = ({rwy, isClosed}) => {

  const clearedWidth = '60 m';
  const snowBanksLeftRight = '';
  const snowBanksHeight = 5;
  const showSnowBanks = snowBanksLeftRight.trim() !== '';

  return (
    <svg viewBox="0 0 632.772 213.287">
      <rect y="96.94" width="632.772" height="71.399"/>
      <text className="rwysvg-widthText-rwy" transform="translate(316 78.721)" textAnchor='middle'>{rwy}</text>
      {!isClosed && (
        <text className="rwysvg-widthText-white" transform="translate(279.769 142.707)">{clearedWidth}</text>
      )}
      {showSnowBanks && !isClosed && (
        <g>
          <path className="rwysvg-fill-white" d="M147.974,29.825H16.065C7.14,29.825,0,36.965,0,45.89v50.872h164.039v-50.872c0-8.746-7.14-16.065-16.065-16.065Z" />
          <path className="rwysvg-fill-white" d="M616.707,29.825h-131.731c-8.925,0-16.065,7.14-16.065,16.065v50.872h163.86v-50.872c0-8.746-7.14-16.065-16.065-16.065Z" />
          <text className="rwysvg-widthText-black" transform="translate(82 61)" textAnchor='middle'>{snowBanksHeight}<tspan x="0" dy="0.9em">cm</tspan></text>
      <text className="rwysvg-widthText-black" transform="translate(550.5 61)" textAnchor='middle'>{snowBanksHeight}<tspan x="0" dy="0.9em">cm</tspan></text>
          <text className="rwysvg-widthText-white" transform="translate(129.576 142.707)">{snowBanksLeftRight}</text>
          <text className="rwysvg-widthText-white" transform="translate(432.794 142.707)">{snowBanksLeftRight}</text>
        </g>
      )}
    </svg>
  );
};

const Report1 = ({rwy1, rwy2, efhkRcr, isClosed}) => {

  const rcc = efhkRcr?.[0]?.values || [6, 6, 6];
  const trend = efhkRcr?.[0]?.trend || [0, 0, 0];

  const trendText = trend.map(t => t === -1 ? 'DOWNGRADED' : t === 1 ? 'UPGRADED' : '');

  return (
    <div className="setup-page-container rwy-report-columns">
      <div className="rwy-report-column-left">
        {/* Left content */}
        <div className='rwysvg-container'>
          <p>RWYCC</p>
          <SvgRcr rcc={rcc[0]} trend={trend[0]} isClosed={isClosed}/>
          <p className='rwysvg-contaminant'>///</p>
          <SvgRcr rcc={rcc[1]} trend={trend[1]} isClosed={isClosed}/>
          <p className='rwysvg-contaminant'>///</p>
          <SvgRcr rcc={rcc[2]} trend={trend[2]} isClosed={isClosed}/>
          <p className='rwysvg-contaminant'>///</p>
          <SvgRcrBottomPart rwy={rwy1} isClosed={isClosed}/>
        </div>
        
      </div>
      <div className="rwy-report-column-right">
        {/* Right content */}
        <div className="snowtam-border-div">
          <h1>EFHK {rwy1}</h1>
          <div className='rwy-report-text-table'>
            <p>ASSESSED</p> <p>//.//.2025</p> <p>//:// UTC</p>
            <p>REPORTED</p> <p>//.//.2025</p> <p>//:// UTC</p>
            <p>VALID</p> <p>NIL</p> <p>NIL</p>
          </div>
        </div>

        <div className="snowtam-border-div">
          <p><u>ATIS READOUT</u></p>

          <p className='rwy-text-pt'><u>RWY {rwy1}</u></p>
          <p>RUNWAY {rwy1} CONDITION REPORT AT //:// UTC</p>
          {!isClosed ? (
            <div>
              <p>RUNWAY CONDITION CODES {rcc[0]} {trendText[0]}, {rcc[1]} {trendText[1]}, {rcc[2]} {trendText[2]}</p>
              <p>CONTAMINANTS ALL PARTS ///</p>
            </div>
          ) : 
            <p>RUNWAY NOT IN USE</p>
          }

          <p className='rwy-text-pt'><u>RWY {rwy2}</u></p>
          <p>RUNWAY {rwy2} CONDITION REPORT AT //:// UTC</p>

          {!isClosed ? (
            <div>
              <p>RUNWAY CONDITION CODES {rcc[2]} {trendText[2]}, {rcc[1]} {trendText[1]}, {rcc[0]} {trendText[0]}</p>
              <p>CONTAMINANTS ALL PARTS ///</p>
            </div>
          ) : 
            <p>RUNWAY NOT IN USE</p>
          }
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

