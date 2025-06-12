import React, { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import atcData from '../../data/atc.json';
import '../styles/MetReport.css';
import '../styles/SetupPage.css';
import axios from 'axios';
import { URL_START } from '../../data/config';

const SetupPage = ({atisDep, atisArr, efhkData}) => {
  const [selectedTab, setSelectedTab] = useState('RUNWAYS');
  const { user, logout } = useAuth();
  const [controllers, setControllers] = useState([]);
  const [userIsAtc, setUserIsAtc] = useState(true); // normal false
  const [loading, setLoading] = useState(true);

  const renderContent = () => {
    switch (selectedTab) {
      case 'RUNWAYS':
        return <RUNWAYS efhkData={efhkData} atisDep={atisDep} atisArr={atisArr}/>;
      case 'ATCUNITS':
        return <ATCUNITS controllers={controllers} loading={loading}/>;
      case 'MESSAGES':
        return <MESSAGES cid={user.id} userIsAtc={userIsAtc} efhkData={efhkData}/>;
      case 'USER':
        return <USER user={user} logout={logout}/>;
      case 'RCR':
        return <RCR cid={user.id} efhkData={efhkData}/>;
      default:
        return null;
    }
  };

  useEffect(() => {
    console.log('loading ATC-units');
    const fetchControllers = async () => {
      try {
        const response = await fetch('https://data.vatsim.net/v3/vatsim-data.json');
        const data = await response.json();
        
        const onlineControllers = data.controllers
          .filter(controller => controller.callsign.startsWith('EF'))
          .map(controller => {
            const parts = controller.callsign.split('_');
            const ad = parts[0];
            const type = parts[parts.length - 1];
            const suffix = parts.length > 2 ? parts.slice(1, -1).join('_') : "";
            
            const match = atcData.find(entry => 
              entry.ad === ad &&
              entry.type === type &&
              (entry.suffix ? suffix.includes(entry.suffix) : suffix === "")
            );
            
            if (match) {
              if (controller.cid === user.id) {
                setUserIsAtc(true);
                // console.log('User is ATC');
                // controller.cid === user.id
              }
              return {
                ...match,
                login: controller.callsign.replace(/_/g, ' '),
                name: controller.name,
                cid: controller.cid
              };
            }
            return null;
          })
          .filter(Boolean);
        
        setControllers(onlineControllers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching controllers:', error);
        setLoading(false);
      }
    };

    fetchControllers();
  }, []);

  return (
    <div className='setup-div'>
      
      {/* Top Buttons (from index.css) */}
      <div className='page-buttons-container'>
        <button onClick={() => setSelectedTab('RUNWAYS')} className={selectedTab === 'RUNWAYS' ? 'page-button selected' : 'page-button'}>
          Runways
        </button>
        <button onClick={() => setSelectedTab('ATCUNITS')} className={selectedTab === 'ATCUNITS' ? 'page-button selected' : 'page-button'}>
          ATS-units
        </button>
        <button onClick={() => setSelectedTab('MESSAGES')} className={selectedTab === 'MESSAGES' ? 'page-button selected' : 'page-button'}>
          Messages
        </button>
        <button onClick={() => setSelectedTab('USER')} className={selectedTab === 'USER' ? 'page-button selected' : 'page-button'}>
          User
        </button>
        {(user.id === "10000004" || user.id === "1339541") && (
          <button onClick={() => setSelectedTab('RCR')} className={selectedTab === 'RCR' ? 'page-button selected' : 'page-button'}>
            SUPER
          </button>
        )}
      </div>

      {/* Render pages below the buttons */}
      <div className='setup-div-content'>{renderContent()}</div>

    </div>
  );
};

const RunwayBlock = ({ rwy1, rwy2, status }) => (
  <>
    <div className="setup-titlebar">{rwy1}/{rwy2}</div>

    <div className="setup-runway-table">
      <div className="setup-runway-table-column">RUNWAY IN USE:</div>
      <div className="setup-runway-table-column setup-runway-flex-slider">
        <div className='setup-text-bold'>AUTOMATIC</div>
        <img src="/images/slider.png" alt="slider" />
        <div>MANUAL</div>
      </div>
      <div className="setup-runway-table-column"><RunwaySVG rwy1={rwy1} rwy2={rwy2} status={status}/></div>
    </div>

    <div className="setup-runway-table">
      <div className="setup-runway-table-column">LIGHT INTENSITY:</div>
      <div className="setup-runway-table-column setup-runway-flex-slider">
        <div className='setup-text-bold'>AUTOMATIC</div>
        <img src="/images/slider.png" alt="slider" />
        <div>MANUAL</div>
      </div>
      <div className="setup-runway-table-column">1.00%</div>
    </div>
  </>
);



const RUNWAYS = ({efhkData, atisDep, atisArr}) => {

  const getRunwayStatus = (rwy1, rwy2) => {

    const isDepActive = (rwy) => {
      if (!atisDep?.preset) return false;
      const preset = atisDep.preset.toUpperCase();
      return preset.includes(rwy.toUpperCase());
    };
  
    const isArrActive = (rwy) => {
      if (!atisArr?.preset) return false;
      const preset = atisArr.preset.toUpperCase();
        if (preset.startsWith('SOIR')) {
        if (preset.includes('04') && (rwy === '04L' || rwy === '04R')) return true;
        if (preset.includes('22') && (rwy === '22L' || rwy === '22R')) return true;
      }
      return preset.includes(rwy.toUpperCase());
    };
  
    const isClosed1 = efhkData[`runway${rwy1}_closed`];
    const isClosed2 = efhkData[`runway${rwy2}_closed`];
  
    const statusForRunway = (rwy, isClosed) => {
      const depActive = isDepActive(rwy);
      const arrActive = isArrActive(rwy);
  
      if (isClosed) return 'CLOSED';
      if (depActive && arrActive) return 'TAKEOFF/LANDING';
      if (depActive) return 'TAKEOFF';
      if (arrActive) return 'LANDING';
  
      return 'NOT IN USE';
    };
  
    return [statusForRunway(rwy1, isClosed1), statusForRunway(rwy2, isClosed2)];
  };

  const runwayList = [
    ['04L', '22R'],
    ['15', '33'],
    ['04R', '22L']
  ];

  return (
    <div className="setup-page-container">
      {runwayList.map(([rwy1, rwy2]) => (
        <RunwayBlock key={`${rwy1}/${rwy2}`} rwy1={rwy1} rwy2={rwy2} status={getRunwayStatus(rwy1, rwy2)} />
      ))}
    </div>
  );
};

const ATCUNITS = ({controllers, loading}) => {


  return (
    <div className="setup-page-container" style={{fontSize: '0.9rem'}}>
      <div className="setup-titlebar">Online ATC-units</div>
      <div>
        {loading ? (
          <p style={{paddingLeft: '10px'}}>Loading...</p>
        ) : controllers.length > 0 ? (
          <div className="controller-table-container">
            <table className="controller-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Code</th>
                  <th>Call sign</th>
                  <th>ATCO</th>
                </tr>
              </thead>
              <tbody>
                {controllers.map((controller, index) => (
                  <tr key={index}>
                    <td>{controller.ad}{controller.suffix ? ` ${controller.suffix}` : ''} {controller.type}</td>
                    <td>{controller.lfunc}</td>
                    <td>{controller.cs}</td>
                    <td>{controller.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{paddingLeft: '10px'}}>No ATC-units online.<br/>Open Setup page again to refresh.</p>
        )}
      </div>
    </div>
  );

};

const MESSAGES = ({ cid, userIsAtc, efhkData }) => {
  const [messages, setMessages] = useState({
    info_left: [], info_right: [], info_bottom: []
  });

  useEffect(() => {
    // Initialize messages from props
    setMessages(efhkData);
  }, [efhkData]);

  const canEdit = (section, index) => {
    const originalBlock = efhkData[section][index];
    const blockCid = originalBlock.cid;
  
    // If no CID (i.e. new/empty block), allow editing of empty lines only
    if (!blockCid || blockCid === "") {
      return true;
    }
  
    // If the block belongs to current user
    return blockCid === cid;
  };
  
  const handleSave = async () => {
    const dataToSave = {
      info_left: [],
      info_right: [],
      info_bottom: []
    };
  
    for (const section of ["info_left", "info_right", "info_bottom"]) {
      for (let index = 0; index < messages[section].length; index++) {
        const block = messages[section][index];
  
        if (canEdit(section, index)) {
          const updatedLines = [...block.lines];
  
          // Check for line breaks (\n or \r)
          const hasLineBreak = updatedLines.some(line => line.includes('\n') || line.includes('\r'));
          if (hasLineBreak) {
            alert('No line changes allowed. Each message line must be a single line.');
            return; // Prevent saving
          }
  
          const allEmpty = updatedLines.every(line => !line.trim());
  
          dataToSave[section].push({
            cid: allEmpty ? null : cid,
            lines: updatedLines
          });
        } else {
          dataToSave[section].push(efhkData[section][index]);
        }
      }
    }
  
    try {
      await axios.post(URL_START + '/api/save-messages', dataToSave);
      alert('Messages saved successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to save messages.');
    }
  };  

  const renderTextAreas = (section) => {
    return messages[section].map((block, blockIndex) => {
      const editable = canEdit(section, blockIndex);
  
      return (
        <div key={`${section}-${blockIndex}`}>
          {block.lines.map((line, lineIndex) => (
            <textarea
              key={`${section}-${blockIndex}-${lineIndex}`}
              value={line}
              onChange={(e) =>
                setMessages(prev => {
                  const updated = { ...prev };
                  updated[section][blockIndex].lines[lineIndex] = e.target.value;
                  return updated;
                })
              }
              disabled={!editable}
            />
          ))}
        </div>
      );
    });
  };
  
  return (
    <div className="setup-page-container" style={{ fontSize: '0.9rem' }}>
      <div className="setup-titlebar">AWOS Messages</div>
      <ul>
        <li>tactical messages intended for all ATS-units</li>
        <li>EFHK and EFIN ATS-units have access</li>
        <li>you may need to wait a couple minutes after login with EuroScope</li>
        <li>write only in the visible parts of the text areas below</li>
      </ul>

      {!userIsAtc && (
        <div style={{ color: 'red', margin: '8px 12px' }}>
          Connect with EuroScope and reload page to add coordination messages
        </div>
      )}

      <div className='setup-message-windows-container'>
        <div className='setup-message-window-1'>
          <p>Message window left</p>
          {renderTextAreas('info_left')}
        </div>

        <div className='setup-message-window-2'>
          <p>Message window right</p>
          {renderTextAreas('info_right')}
        </div>

        <div className='setup-message-window-3'>
          <p>Message window bottom</p>
          {renderTextAreas('info_bottom')}
        </div>
      </div>

      <button className="save-button" onClick={handleSave} disabled={!userIsAtc}>
        Save Messages
      </button>
    </div>
  );
};

const USER = ({ user, logout }) => (
  <div className="setup-page-container">
    <div className="setup-titlebar">User Details</div>
    <div className="user-info">
      <p><span>VATSIM ID:</span> <span>{user.id}</span></p>
      <p><span>ATC Rating:</span> <span>{user.rating}</span></p>
      <p><span>Subdivision:</span> <span>{user.subdivision || 'NIL'}</span></p>
    </div>
    <button onClick={logout} className="logout-button">
      Logout
    </button>
    <button
      onClick={() => window.open('https://hold.lusep.fi/#/privacy-policy', '_blank')}
      className="policy-button"
    >
      Privacy Policy
    </button>
  </div>
);

const RCR = ({ cid, efhkData }) => {
  const isPrivileged = cid === "10000004" || cid === "1339541";

  const [rcrValues, setRcrValues] = useState([6, 6, 6]);
  const [rcrTrends, setRcrTrends] = useState([0, 0, 0]);
  const [runways, setRunways] = useState({
    runway04L_closed: false,
    runway15_closed: false,
    runway04R_closed: false,
  });

  useEffect(() => {
    // Load Manual RCR data
    axios.get(URL_START + '/api/manualRCC')
      .then(res => {
        const data = res.data.manual_rcc_value?.[0];
        if (data) {
          setRcrValues(data.values);
          setRcrTrends(data.trend);
        }
      })
      .catch(err => console.error("Failed to load manual RCC:", err));

    // Load runway status from efhkData
    setRunways({
      runway04L_closed: efhkData.runway04L_closed,
      runway15_closed: efhkData.runway15_closed,
      runway04R_closed: efhkData.runway04R_closed,
    });
  }, [efhkData]);

  const handleRcrChange = (index, type, value) => {
    const updater = type === 'value' ? setRcrValues : setRcrTrends;
    const current = type === 'value' ? [...rcrValues] : [...rcrTrends];
    current[index] = value;
    updater(current);
  };

  const handleRunwayToggle = (key) => {
    setRunways(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveRCR = async () => {
    if (!isPrivileged) return;

    try {
      await axios.post(URL_START + '/api/save-manual-rcr', {
        manual_rcc_value: [{ values: rcrValues, trend: rcrTrends }],
      });
      alert("Manual RCR saved.");
    } catch (err) {
      console.error(err);
      alert("Failed to save RCR.");
    }
  };

  const saveRunways = async () => {
    if (!isPrivileged) return;

    try {
      await axios.post(URL_START + '/api/save-runway-status', runways);
      alert("Runway status saved.");
    } catch (err) {
      console.error(err);
      alert("Failed to save runway status.");
    }
  };

  const trendOptions = [
    { label: '•', value: 0 },
    { label: '↑', value: 1 },
    { label: '↓', value: -1 },
  ];

  return (
    <div className="setup-page-container">
      <div className="setup-titlebar">Manual RCR</div>

      <div style={{ marginBottom: '1rem' }}>
        <select
          disabled={!isPrivileged}
          value={rcrValues[0]}
          onChange={e => setRcrValues([parseInt(e.target.value)])}
        >
          {[0, 1, 2, 3, 4, 5, 6].map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <select
          disabled={!isPrivileged}
          value={rcrTrends[0]}
          onChange={e => setRcrTrends([parseInt(e.target.value)])}
        >
          {[
            { label: '•', value: 0 },
            { label: '↑', value: 1 },
            { label: '↓', value: -1 },
          ].map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <button className="save-button" onClick={saveRCR} disabled={!isPrivileged}>
        Save RCR
      </button>

      <div className="setup-titlebar">Runway Status</div>

      {['runway04L_closed', 'runway15_closed', 'runway04R_closed'].map(key => (
        <div key={key}>
          <label>
            <input
              type="checkbox"
              disabled={!isPrivileged}
              checked={runways[key]}
              onChange={() => handleRunwayToggle(key)}
            />
            {key.replace('runway', '').replace('_closed', ' closed')}
          </label>
        </div>
      ))}

      <button className="save-button" onClick={saveRunways} disabled={!isPrivileged}>
        Save Runway Status
      </button>
    </div>
  );
};

const RunwaySVG = ({ rwy1, rwy2, status }) => {
  const [status1, status2] = status;

  const showHighlight1 = status1 !== 'NOT IN USE' && status1 !== 'CLOSED';
  const showHighlight2 = status2 !== 'NOT IN USE' && status2 !== 'CLOSED';
  const isClosed = status1 === 'CLOSED' || status2 === 'CLOSED';
  const isInactive = status1 === 'NOT IN USE' && status2 === 'NOT IN USE';

  const svgStyle = {
    '--rwy-bg-color': isClosed ? 'var(--rwy-bg-closed)' : isInactive ? 'var(--rwy-bg-inactive)' : 'var(--rwy-bg-active)',
  };

  const textStyle1 = {
    '--status-font': showHighlight1 ? 'var(--windmeter-font-highlight)' : 'inherit',
  };

  const textStyle2 = {
    '--status-font': showHighlight2 ? 'var(--windmeter-font-highlight)' : 'inherit',
  };

  return (
    <svg id="svg-setup-rwy" viewBox="0 0 276.968 40.14" style={svgStyle}>
      <path className="svg-setup-rwy-bg" style={{ fill: 'var(--rwy-bg-color)' }} d="M5.147,4.834v16h267V4.834H5.147ZM22.147,19.834H6.147v-2h16v2ZM22.147,15.834H6.147v-2h16v2ZM22.147,11.834H6.147v-2h16v2Z"/>
      {[5.834, 9.834, 13.834, 17.834].map((y, i) => ( <rect key={i} className="svg-setup-rwy-thr" x="6.147" y={y} width="16" height="2" /> ))}
      {[5.834, 9.834, 13.834, 17.834].map((y, i) => ( <rect key={i + 4} className="svg-setup-rwy-thr" x="255.147" y={y} width="16" height="2" /> ))}
      <text className="svg-setup-rwy-name" transform="translate(25.146 17.034)">{rwy1}</text>
      <text className="svg-setup-rwy-name" transform="translate(229.942 17.103)">{rwy2}</text>
      <text className="svg-setup-rwy-status" transform="translate(270 36.074)" textAnchor="end" style={{ fontFamily: 'var(--status-font)', ...textStyle2 }}>{status2}</text>
      <text className="svg-setup-rwy-status" transform="translate(5.427 36.074)" style={{ fontFamily: 'var(--status-font)', ...textStyle1 }}>{status1}</text>
    </svg>
  );
};



export default SetupPage;