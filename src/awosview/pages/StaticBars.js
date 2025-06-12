import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { airportData } from './utils'
import '../styles/StaticBars.css';

const airports = [
    { icao: "EFET", name: "Enontekiö" },
    { icao: "EFHA", name: "Halli" },
    { icao: "EFIV", name: "Ivalo" },
    { icao: "EFJO", name: "Joensuu" },
    { icao: "EFJY", name: "Jyväskylä" },
    { icao: "EFKE", name: "Kemi-Tornio" },
    { icao: "EFKI", name: "Kajaani" },
    { icao: "EFKK", name: "Kokkola" },
    { icao: "EFKS", name: "Kuusamo" },
    { icao: "EFKT", name: "Kittilä" },
    { icao: "EFKU", name: "Kuopio" },
    { icao: "EFLP", name: "Lappeenranta" },
    { icao: "EFMA", name: "Mariehamn" },
    { icao: "EFMI", name: "Mikkeli" },
    { icao: "EFOU", name: "Oulu" },
    { icao: "EFPO", name: "Pori" },
    { icao: "EFRO", name: "Rovaniemi" },
    { icao: "EFSA", name: "Savonlinna" },
    { icao: "EFSI", name: "Seinäjoki" },
    { icao: "EFTP", name: "Tampere-Pirkkala" },
    { icao: "EFTU", name: "Turku" },
    { icao: "EFUT", name: "Utti" },
    { icao: "EFVA", name: "Vaasa" }
];

const getTrl = ({ qnh }) => {
    if (qnh == null || isNaN(qnh)) return null;
  
    const conditions = [
      { min: 943, max: 959, value: 80 },
      { min: 960, max: 977, value: 75 },
      { min: 978, max: 995, value: 70 },
      { min: 996, max: 1013, value: 65 },
      { min: 1014, max: 1031, value: 60 },
      { min: 1032, max: 1050, value: 55 },
      { min: 1051, max: 1068, value: 50 },
    ];
  
    for (let condition of conditions) {
      if (qnh >= condition.min && qnh <= condition.max) {
        return condition.value;
      }
    }
    return null;
};
  
const StaticBars = ({ onSelect, selectedIndex, icao, wx, data, activeRunway, atis }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [atisWindowOpen, setAtisWindowOpen] = useState(false);
    const [time, setTime] = useState(new Date());
    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem('theme') === 'dark'
    );

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const buttons = [
        'Airfield view',
        'Chart display',
        'Ceilometer display',
        'Latest METARs',
        'Screen cleaning',
    ];

    const atisId = useMemo(() => atis?.atisLetter || '', [atis]);

    useEffect(() => {
        const interval = setInterval(() => {
        setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const utcHours = time.getUTCHours().toString().padStart(2, "0");
    const utcMinutes = time.getUTCMinutes().toString().padStart(2, "0");
    const utcSeconds = time.getUTCSeconds().toString().padStart(2, "0");

    const airport = airports.find(a => a.icao === icao.toUpperCase());
    const airportName = airport ? `${airport.name} (${airport.icao})` : "Unknown Airport";

    const isEmpty = (value) => {
        return value === undefined || value === null || value === '' || Number.isNaN(value);
    };

    const pSeaRaw = wx?.p_sea ?? null;
    const pSeaString = pSeaRaw != null ? pSeaRaw.toString() : '';
    const [qnh, qnhDecimal] = pSeaString.split('.');
    const decimalPart = qnhDecimal !== undefined ? qnhDecimal : '0';
    
    const selected = airportData.find(a => a.icao === icao);
    let qfe = null;

    if (selected) {
        qfe = (pSeaRaw - selected.qfesub).toFixed(1);
    }

    const metarText = data[icao.toLowerCase()]?.[0]?.metar != null ? data[icao.toLowerCase()]?.[0]?.metar : 'METAR NIL=';
    const hasFZ = metarText.includes("FZ");
    const hasCB = metarText.includes("CB");
    const hasTS = metarText.includes("TS");

    const metCondVis = wx?.vis ?? 10000;
    const metCond = metCondVis < 5000 ? "IMC" : "VMC";

    return (
        <nav>
            <div className='awosview-top-container-1'>
                <img src='/images/awosview/home.svg' onClick={() => onSelect(0)}></img>
                <p>AWOSVIEW - {icao.toUpperCase()} - TWR - {buttons[selectedIndex]}</p>
                <button onClick={() => setModalOpen(true)}>
                    {airportName}
                </button>

                <button onClick={() => setDarkMode(!darkMode)} aria-label="Theme">
                    {darkMode ? 'To light mode' : 'To dark mode'}
                </button>
            </div>

            <div className='awosview-top-container-2'>
                {buttons.map((label, index) => (
                    <button key={index} className={`awosview-page-selector ${selectedIndex === index ? 'selected' : ''}`} onClick={() => onSelect(index)} >
                        {index !== 5 && ( <img src={`/images/awosview/${index}.svg`} alt={`icon`}/> )}
                        <p>{label}</p>
                    </button>
                ))}
            </div>

            <div className='awosview-top-container-3'>
                <div className={isEmpty(activeRunway) ? 'awos-no-rwy' : ''}>
                    {String(activeRunway).padStart(2, "0")}
                </div>
                <div className={isEmpty(`${utcHours}:${utcMinutes}`) ? 'awos-no-data' : ''}>
                    {utcHours}:{utcMinutes}<span className='awosview-sec'>:{utcSeconds}</span>
                </div>
                <div className={isEmpty(metCond) ? 'awos-no-data' : ''}>{metCond}</div>
                <div className={hasCB ? 'awosview-alert-bg' : ''}>{hasCB ? 'CB' : ''}</div>
                <div className={hasTS ? 'awosview-alert-bg' : ''}>{hasTS ? 'TS' : ''}</div>
                <div className={hasFZ ? 'awosview-alert-bg' : ''}>{hasFZ ? 'FZ' : ''}</div>
                <div className={isEmpty(wx?.t2m) ? 'awos-no-data' : ''}>{isEmpty(wx?.t2m) ? '' : wx.t2m.toFixed(1)}</div>
                <div className={isEmpty(wx?.td) ? 'awos-no-data' : ''}>{isEmpty(wx?.td) ? '' : wx.td.toFixed(1)}</div>
                <div className={isEmpty(qfe) ? 'awos-no-data' : ''}>{qfe}</div>
                <div className={isEmpty(getTrl({ qnh })) ? 'awos-no-data' : ''}>{getTrl({ qnh })}</div>
                <div onClick={() => setAtisWindowOpen(true)} className={isEmpty(atisId) ? 'awos-no-data' : ''}>{atisId}</div>
                <div className={isEmpty(wx?.p_sea) ? 'awos-no-data' : ''}>
                {qnh}<span className='awosview-qnh-decimal'>.{decimalPart}</span>
                </div>
            </div>

            <div className='awosview-top-container-metar'>
                <div>{metarText}</div>
            </div>

            <div className='awosview-footer'>
                <p>Simulator use only on VATSIM network</p>
                <p>(TWRVIEW)</p>
                <p>DS</p>
            </div>

            {modalOpen && (
                <AerodromeSelector icao={icao} onClose={() => setModalOpen(false)} />
            )}

            {atisWindowOpen && (
                <AtisWindow icao={icao} onClose={() => setAtisWindowOpen(false)} />
            )}

        </nav>
    );
};

const AerodromeSelector = ({ icao, onClose }) => {
    const navigate = useNavigate();
    return (
        <div className='awosview-overlay'>
            <div className='awosview-aerodrome-selector'>
                <p>Aerodrome Selection</p>
                <button onClick={() => { navigate(`/`); onClose();}}>
                    EFHK - Helsinki-Vantaa
                </button>
                {airports.map((airport) => (
                    <button
                        key={airport.icao}
                        className={airport.icao === icao.toUpperCase() ? "awosview-selector-current" : ""}
                        onClick={() => {
                            navigate(`/${airport.icao.toLowerCase()}`);
                            onClose();
                        }}
                    >
                        {airport.icao} - {airport.name}
                    </button>
                ))}
                <button className='awosview-selector-close' onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

const AtisWindow = ({ icao, onClose }) => {
    return (
        <div className='awosview-overlay'>
            <div className='awosview-aerodrome-selector'>
                <p>{icao.toUpperCase()} D-ATIS</p>
                <div className='awosview-atis-container'>
                    ATIS NIL
                </div>
                <button className='awosview-selector-close' onClick={onClose}>Close</button>
            </div>
        </div>
    );
};


export default StaticBars;