import React, { useState } from 'react';
import '../styles/MetReport.css';
import '../styles/SetupPage.css';

const MetReportPage = ({metarTaf, efhkData}) => {
  const [selectedTab, setSelectedTab] = useState('MET EFHK');

  const renderContent = () => {
    switch (selectedTab) {
      case 'MET EFHK':
        return <METREP efhkData={efhkData}/>;
      case 'METARs':
        return <METARs metarTaf={metarTaf}/>;
      case 'TAFs':
        return <TAFs metarTaf={metarTaf}/>;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Top Buttons (from index.css) */}
      <div className='page-buttons-container'>
        <button onClick={() => setSelectedTab('MET EFHK')} className={selectedTab === 'MET EFHK' ? 'page-button selected' : 'page-button'}>
          MET EFHK
        </button>
        <button onClick={() => setSelectedTab('METARs')} className={selectedTab === 'METARs' ? 'page-button selected' : 'page-button'}>
          METARs
        </button>
        <button onClick={() => setSelectedTab('TAFs')} className={selectedTab === 'TAFs' ? 'page-button selected' : 'page-button'}>
          TAFs
        </button>
      </div>

      {/* Render pages below the buttons */}
      {renderContent()}

    </div>
  );
};

const METREP = ({efhkData}) => {

  const metrep = efhkData.metrep || '';

  let header = 'EFHK METREP';
  let wind = '';
  let visibility = '10KM';
  let clouds = '';
  let temps = ['//', '//'];
  let pressures = ['//', '//'];
  let trend = 'NOSIG';

  if (metrep.trim()) {
    // 1. HEADER: EFHK + 6 digits + Z
    const headerMatch = metrep.match(/EFHK\s\d{6}Z/);
    if (headerMatch) header = headerMatch[0];

    // 2. WIND RWY 04L until RWY 04R or RWY 15 or VIS
    const windMatch = metrep.match(/RWY 04L(.*?)RWY 04R|RWY 15|VIS/);
    if (windMatch) wind = 'RWY 04L ' + windMatch[1].trim();

    // 3. VISIBILITY: match VIS + value
    const visMatch = metrep.match(/VIS\s+(\d+KM|\d+M)/);
    if (visMatch) visibility = visMatch[1];

    // 4. CLOUDS: after CLD until T or QNH
    const cloudsMatch = metrep.match(/CLD\s+(.*?)(T[-+]?\d{1,2}|QNH)/);
    if (cloudsMatch) clouds = cloudsMatch[1].trim();

    // 5. TEMPERATURES: Txx DPxx (with possible negatives)
    const tempsMatch = metrep.match(/T(-?\d{1,2})\s+DP(-?\d{1,2})/);
    if (tempsMatch) temps = [tempsMatch[1], tempsMatch[2]];

    // 6. PRESSURES: QNH + value and QFE + value
    const pressMatch = metrep.match(/QNH\s+(\d{4})HPA\s+QFE\s+(\d{4})HPA/);
    if (pressMatch) pressures = [pressMatch[1], pressMatch[2]];

    // 7. TREND: everything after TREND until =
    const trendMatch = metrep.match(/TREND\s+(.*?)=/);
    if (trendMatch) trend = trendMatch[1].trim();
  }

  const rvrData1 = efhkData?.rvr_values_04L || ['//', '//', '"//'];
  const rvrData2 = efhkData?.rvr_values_04R || ['//', '//', '"//'];
  const rvrData3 = efhkData?.rvr_values_15 || ['//', '//', '"//'];

  const isRvrData1All2000 = rvrData1.every(value => Number(value) === 2000);
  const isRvrData2All2000 = rvrData2.every(value => Number(value) === 2000);
  const isRvrData3All2000 = rvrData3.every(value => Number(value) === 2000);
  
  const metrepData = [
    { title: 'HEADER', value: header },
    { title: 'WIND', value: wind },
    { title: 'VIS', value: visibility },
    { title: 'RVR', value: isRvrData1All2000 ? '' : 'RWY 04L ' + rvrData1.join('M, ') + 'M' },
    { title: 'RVR 2', value: isRvrData2All2000 ? '' : 'RWY 04R ' + rvrData2.join('M, ') + 'M' },
    { title: 'RVR 3', value: isRvrData3All2000 ? '' : 'RWY 15 ' + rvrData3.join('M, ') + 'M' },
    { title: 'CLOUDS', value: clouds },
    { title: 'WX', value: '//' }
  ];

  return (
    <div className="metrep-container">
      <div className="metrep-top">

        {/* LEFT SECTION */}
        <div className="metrep-section metrep-left">
          <div className="metrep-table">
            {metrepData.map((item, index) => (
              <div className="metrep-table-row" key={index}>
                <div className="metrep-table-title">{item.title}</div>
                <div className="metrep-table-value"><p>{item.value}</p></div>
              </div>
            ))}

              {/* TA and TD side-by-side */}
              <div className="metrep-double-row-wrapper">
                <div className="metrep-table-double-row">
                  <div className="metrep-table-title">TA</div>
                  <div className="metrep-table-value"><p>{temps[0]}</p></div>
                  <div className="metrep-table-gap"></div>
                  <div className="metrep-table-title">TD</div>
                  <div className="metrep-table-value"><p>{temps[1]}</p></div>
                </div>
              </div>

            {/* QNH and QFE side-by-side */}
            <div className="metrep-double-row-wrapper">
              <div className="metrep-table-double-row">
                <div className="metrep-table-title">QNH</div>
                <div className="metrep-table-value"><p>{pressures[0]}</p></div>
                <div className="metrep-table-gap"></div>
                <div className="metrep-table-title">QFE</div>
                <div className="metrep-table-value"><p>{pressures[1]}</p></div>
              </div>
            </div>

            {/* TREND */}
            <div className="metrep-table-row">
              <div className="metrep-table-title">TREND</div>
              <div className="metrep-table-value"><p>{trend}</p></div>
            </div>

          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="metrep-section metrep-right">

          <div className="current-wx-table">
            <div style={{display: 'contents'}}>
              <div className="current-wx-table-title">VIS</div>
              <div className="current-wx-table-value"><p>{typeof efhkData?.vis === 'number' ? Math.round(efhkData.vis / 100) * 100 : '//'}</p></div>
            </div>
            <div style={{display: 'contents'}}>
              <div className="current-wx-table-title">CLOUD</div>
              <div className="current-wx-table-value wx-table-multirow">
                <p></p> <p></p>
                <p></p> <p></p>
                <p>//</p> <p>//</p>
              </div>
            </div>
            <div style={{display: 'contents'}}>
              <div className="current-wx-table-title">T/DP</div>
              <div className="current-wx-table-value wx-table-multirow label-c">
                <p style={{width: 'calc(50% - 32px)'}}>{efhkData?.t2m.toFixed(1) || '//'}</p> / <p style={{width: 'calc(50% - 32px)'}}>{efhkData?.td.toFixed(1) || '//'}</p>
              </div>
            </div>
            <div style={{display: 'contents'}}>
              <div className="current-wx-table-title">QNH</div>
              <div className="current-wx-table-value">
                <p className='label-hpa'>{efhkData?.qnh || '//'}</p>
              </div>
            </div>
            <div style={{display: 'contents'}}>
              <div className="current-wx-table-title">QFE</div>
              <div className="current-wx-table-value wx-table-multirow">
                <h3>RWY 04R</h3> <h3>RWY 22L</h3>
                <p className='label-hpa' style={{width: 'calc(50% - 36px)'}}>{efhkData?.qfe[0] || '//'}</p>
                <p className='label-hpa' style={{width: 'calc(50% - 36px)'}}>{efhkData?.qfe[1] || '//'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="metrep-bottom">

        <div className="metrep-table">
          {/* TAF */}
          <div className="metrep-table-row">
            <div className="metrep-table-title efhk-taf">TAF</div>
            <div className="metrep-table-value efhk-taf"><p>{efhkData?.taf || 'TAF NIL'}</p></div>
          </div>

          {/* LOW WIND and WARNINGS */}
          <div className="metrep-double-row-wrapper">
            <div className="metrep-table-low-wind">
              <div className="metrep-table-low-wind-container">
                <p className='low-wind-title'>{efhkData?.low_wind_header || 'LOW WIND NIL'}</p>
                <div className="low-wind-table">
                  {['500FT', '1000FT', '2000FT', 'FL050', 'FL100'].map((alt, idx) => (
                    <div key={alt} className="low-wind-cell">
                      <div className="low-wind-alt">{alt}</div>
                      <div className="low-wind-value">{efhkData.low_wind?.[idx] || '//'}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="metrep-table-gap"></div>
              <div className="metrep-table-title warnings-title">WARNINGS</div>
              <div className="metrep-table-value warnings-value">
                <p>//</p> { /* NO ACTUAL WARNINGS */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const METARs = ({ metarTaf }) => {
  const icaoList = ['EFTU', 'EFTP', 'EETN', 'EFJY', 'ESSA', 'ULLI'];

  return (
    <div className='metrep-container'>
      <div className="metrep-section metrep-left">
        <div className="metrep-table">
          {icaoList.map((icao, index) => {
            const report = metarTaf[icao.toLowerCase()]?.[0]?.metar || 'METAR NIL';
            return (
              <div className="metrep-table-row" key={index}>
                <div className="metrep-table-title" style={{ minHeight: '50px' }}>{icao}</div>
                <div className="metrep-table-value"><p>{report}</p></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


const TAFs = ({ metarTaf }) => {
  const icaoList = ['EFTU', 'EFTP', 'EETN', 'EFJY', 'ESSA', 'ULLI'];

  return (
    <div className='metrep-container'>
      <div className="metrep-section metrep-left">
        <div className="metrep-table">
          {icaoList.map((icao, index) => {
            const report = metarTaf[icao.toLowerCase()]?.[0]?.taf || 'TAF NIL';
            return (
              <div className="metrep-table-row" key={index}>
                <div className="metrep-table-title" style={{ minHeight: '50px' }}>{icao}</div>
                <div className="metrep-table-value"><p style={{fontSize: '0.85rem'}}>{report}</p></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};



export default MetReportPage;
