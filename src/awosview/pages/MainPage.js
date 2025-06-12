import React, { useRef, useEffect, useState, useMemo } from 'react';
import '../styles/AwosView.css';
import '../styles/StaticBars.css';
import { EFET, EFHA, EFIV, EFJO, EFJY, EFKE, EFKI, EFKK, EFKS, EFKT, EFKU, EFLP, EFMA, EFMI, EFOU, EFPO, EFRO, EFSA, EFSI, EFTP, EFTU, EFUT, EFVA, WindmeterSvg } from '../svg/svg'
import { getWeatherCode, airportData, updateWindComponents, calculateWindValues } from './utils'

const svgsMap = {
  EFET, EFHA, EFIV, EFJO, EFJY, EFKE,
  EFKI, EFKK, EFKS, EFKT, EFKU, EFLP,
  EFMA, EFMI, EFOU, EFPO, EFRO, EFSA,
  EFSI, EFTP, EFTU, EFUT, EFVA
};

function createWindSector(id, fromDeg, toDeg, cx = 93.633, cy = 93.739, radius = 55.535) {
  const startAngle = (fromDeg - 90) * (Math.PI / 180);
  const endAngle = (toDeg - 90) * (Math.PI / 180);

  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy + radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(endAngle);
  const y2 = cy + radius * Math.sin(endAngle);

  const largeArcFlag = ((toDeg - fromDeg + 360) % 360) > 180 ? 1 : 0;

  return `
      M ${cx},${cy}
      L ${x1},${y1}
      A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}
      Z
  `;
}

const isEmpty = (value) => {
  return value === undefined || value === null || value === '' || Number.isNaN(value);
};

const MainPage = ({icao, data, wx, activeRunway}) => {
    const wrapperRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [isRotated, setIsRotated] = useState(false);

    // calculate random wind values
    // direction, speed, gust, data (randomizers)
    const windValues = useMemo(() => {
      if (!wx?.wd_10min || !wx?.ws_10min || !wx?.wg_10min || !data?.randomizers?.[0]) return null;
      return calculateWindValues(wx.wd_10min, wx.ws_10min, wx.wg_10min, data.randomizers, data[icao]?.[0].metar);
    }, [wx, data]);

    const metarText = data[icao.toLowerCase()]?.[0]?.metar != null ? data[icao.toLowerCase()]?.[0]?.metar : 'METAR NIL=';
  
    useEffect(() => {
      const airport = data[icao]?.[0];
      if (!airport) return;
      if (!windValues?.part1 || !windValues?.part2 || !windValues?.part3) return;
      
      updateWindComponents(40, windValues.part1[0], windValues.part1[1]);

      const meterCount = airportData.find(a => a.icao === icao).windmeters?.length;
      
      for (let i = 1; i <= meterCount; i++) {

        const counterClockwise = windValues[`part${i}`][4];
        const clockwise = windValues[`part${i}`][5];

        const sectorPath = createWindSector(`sector${i}`, counterClockwise, clockwise);
        const pathElement = document.getElementById(`degreeCircle${i}`);

        if (pathElement) {
            const speedElem = document.getElementById(`speed${i}`);
            const dirElem = document.getElementById(`direction${i}`);
            const varDirElem = document.getElementById(`variable-direction${i}`);
            const windArrow = document.getElementById(`windArrow${i}`);

            const minSpeedElem = document.getElementById(`minSpeed${i}`);
            const maxSpeedElem = document.getElementById(`maxSpeed${i}`);
            minSpeedElem.textContent = String(windValues[`part${i}`][3]).padStart(2, '0');
            maxSpeedElem.textContent = String(windValues[`part${i}`][2]).padStart(2, '0');

            const speed = windValues[`part${i}`][1];
            const direction = windValues[`part${i}`][0];

            const centerX = 187.387 / 2;
            const centerY = 187.387 / 2;
            windArrow.setAttribute('transform', `rotate(${direction}, ${centerX}, ${centerY})`);

            if (windValues[`part${i}`][2] >= (speed + 10)) {
              document.getElementById(`maxBase${i}`).classList.add('windmeter-boxes-highlight');
              document.getElementById(`minBase${i}`).classList.add('windmeter-boxes-highlight');
            } else {
              document.getElementById(`maxBase${i}`).classList.remove('windmeter-boxes-highlight');
              document.getElementById(`minBase${i}`).classList.remove('windmeter-boxes-highlight');
            }
        
            const formatDirection = (dir) => String(dir).padStart(3, '0') + '°';
            const formatSpeed = (spd) => String(spd).padStart(2, '0') + ' kt';
        
            // Handle calm wind
            if (speed < 1) {
                speedElem.textContent = '';
                dirElem.textContent = '';
                varDirElem.textContent = 'CALM';
                varDirElem.classList.add('windmeter-calm-hihglight');
                windArrow.style.visibility = 'hidden';
            } else {
                // Set speed and direction
                speedElem.textContent = formatSpeed(speed);
        
                if (metarText.includes('VRB')) dirElem.textContent = 'VRB';
                else if (direction === 0) dirElem.textContent = '360';
                else dirElem.textContent = formatDirection(direction);
                
                // Format variable direction range
                const formattedCounter = String(counterClockwise).padStart(3, '0');
                const formattedClockwise = String(clockwise).padStart(3, '0');
                varDirElem.textContent = `${formattedCounter} - ${formattedClockwise}`;
                varDirElem.classList.remove('windmeter-calm-hihglight');
                windArrow.style.visibility = 'visible';
            }
        
            // Set SVG path
            pathElement.setAttribute("d", sectorPath);
        
            // Highlight wind direction area
            const angleDiff = (clockwise - counterClockwise + 360) % 360;
            if (angleDiff >= 60) {
                pathElement.classList.add("wind-dir-area-highlight");
                varDirElem.classList.add("windmeter-vrb-between-highlight");
            } else {
                pathElement.classList.remove("wind-dir-area-highlight");
                varDirElem.classList.remove("windmeter-vrb-between-highlight");
            }
        }
      }
    }, [icao, data, windValues]);  
  
    useEffect(() => {
    const resize = () => {
        if (!wrapperRef.current) return;

        const containerWidth = wrapperRef.current.offsetWidth;
        const containerHeight = wrapperRef.current.offsetHeight;

        const scaleWidth = containerWidth / 1150;
        const scaleHeight = containerHeight / 716;
        const newScale = Math.min(scaleWidth, scaleHeight, 1);

        setScale(newScale);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
    }, []);

    useEffect(() => {
      const stored = localStorage.getItem('awos-rotate');
      if (stored === 'true') setIsRotated(true);
    }, []);

    useEffect(() => {
      localStorage.setItem('awos-rotate', isRotated.toString());
    }, [isRotated]);

    const toggleRotation = () => {
      setIsRotated((prev) => !prev);
    };

    const airport = airportData.find(a => a.icao === icao);
    if (!airport) { return <div>Airport not found</div>;}
    const rwyHeading = airport.windmeters[0].rwyh
    const rotationDeg = isRotated ? rwyHeading - 90 : 0;
    const compassDeg = isRotated ? 0 : 90 - rwyHeading ;

    const rvrValues = data[icao.toLowerCase()]?.[0]?.rvr;

    return (
        <div className='awosview-body'>
          <div className="scalable-wrapper" ref={wrapperRef}>
            <div className="scalable-content" style={{ transform: `scale(${scale})` }}>

              <button 
                className='awosview-compass' 
                onClick={toggleRotation}
                style={{ transform: `rotate(${compassDeg}deg)` }}
              >
                <img src='/images/awosview/compass.svg' alt='compass'></img>
              </button>

                <MainSvg icao={icao} deg={rotationDeg} activeRunway={activeRunway} rvr={rvrValues} />
                <WeatherDisplay icao={icao} isRotated={isRotated} vis={wx?.vis} wawa={wx?.wawa} />
                <Ceilometers icao={icao} isRotated={isRotated} metar={metarText} activeRunway={activeRunway}/>
                <Windmeter icao={icao} isRotated={isRotated} activeRunway={activeRunway} />
            </div>
          </div>
        </div>
    );
};

const WeatherDisplay = ({ icao, isRotated, vis, wawa }) => {
  const airport = airportData.find(a => a.icao === icao);
  if (!airport) { return <div>Airport not found</div>;}

  let visibility = null;
  let visibilityUnit = null;
  let wxCode = 'NSW';

  if (wawa != null) {
    wxCode = getWeatherCode(wawa);
  }
  
  if (vis != null) {
    if (vis > 9500) {
      visibility = 10;
      visibilityUnit = 'km';
    }
    else if (vis > 6000) {
      visibility = (vis / 1000).toFixed(0);
      visibilityUnit = 'km';
    }
    else {
      visibility = (Math.round(vis / 100) * 100).toFixed(0);
      visibilityUnit = 'm';
    }
  }

  return (
    <>
        <div
          className="awosview-ceilometer weather"
          style={{
            left: `${isRotated ? airport.weather.x2 : airport.weather.x}px`,
            top: `${isRotated ? airport.weather.y2 : airport.weather.y}px`
          }}
        >
          <span className="awosview-meter-name">Weather</span>
          <div className={isEmpty(visibility) ? 'awos-weather-no-data' : ''}>
              <p className='text-gray'>VIS</p>
              <p>{visibility}</p>
              <p className='text-meter-gray'>{visibilityUnit}</p>
          </div>

          <div className='wx-vis-separator'></div>

          <div className={isEmpty(wxCode) ? 'awos-weather-no-data' : ''}>
              <p className='text-gray'>WX</p>
              <p>{wxCode}</p>
          </div>

        </div>
    </>
  );
};


const Ceilometers = ({ icao, isRotated, metar, activeRunway }) => {
  const airport = airportData.find(a => a.icao === icao);
  if (!airport) return <div>Airport not found</div>;

  const cloudLayerMap = { FEW: '1/8', SCT: '3/8', BKN: '6/8', OVC: '8/8' };

  // Extract cloud layers
  const cloudRegex = /\b(FEW|SCT|BKN|OVC)(\d{3})([A-Z]{0,2})\b/g;
  const cloudLayers = [];
  let match;
  while ((match = cloudRegex.exec(metar)) !== null && cloudLayers.length < 3) {
    const type = match[1];
    const height = parseInt(match[2], 10) * 100;
    const octas = cloudLayerMap[type];
    cloudLayers.push({ type, height, octas });
  }

  if (cloudLayers.length === 0) {
    cloudLayers.push({ type: '', height: '-- ft', octas: '' });
  }

  return (
    <>
      {airport.ceilometers.map((meter, index) => {
        const isActive = (
          activeRunway != null &&
          activeRunway !== "" &&
          (((activeRunway < 18 || activeRunway === 36) && index === 0) || ((activeRunway >= 18 && activeRunway != 36) && index === 1))
        );
        return (
          <div
            key={index}
            className={`awosview-ceilometer${isActive ? ' active-meter' : ''}`}
            style={{
              left: `${isRotated ? meter.x2 : meter.x}px`,
              top: `${isRotated ? meter.y2 : meter.y}px`
            }}
          >
            <span className="awosview-meter-name">{meter.name}</span>
            <button className="awosview-mode-toggle-button">AVG</button>
            <button className="awosview-mode-toggle-button">INST</button>
  
            {cloudLayers.map((layer, i) => (
              <div key={i}>
                <p>{layer.type}</p>
                <p className="text-gray">{layer.octas}</p>
                <p>{typeof layer.height === 'number' ? layer.height : layer.height}</p>
                <p className="text-meter-gray">{typeof layer.height === 'number' ? 'ft' : ''}</p>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
  
};

const MainSvg = ({ icao, deg, activeRunway, rvr }) => {
  const Component = svgsMap[icao?.toUpperCase()];
  const airport = airportData.find(a => a.icao === icao);
  if (!airport) { return <div>Airport not found</div>;}

  const leftActive = activeRunway != null && activeRunway !== "" && (activeRunway < 18 || activeRunway === 36);
  const rightActive = activeRunway != null && activeRunway !== "" && (activeRunway >= 18 && activeRunway != 36);

  return (
    <div className='awosview-svg-container' style={{ '--rotate-deg': `${deg}deg` }}>
      <Component deg={deg} leftActive={leftActive} rightActive={rightActive}/>

      <div className='awosview-rvr-container'>
        {airport.rvr.map((meter, index) => {
          const value = rvr[index];
          const highlight = typeof value === "number" && value < 2000 ? "rvr-highlight" : "";
          return (
            <div key={index} className={`awosview-rvr counter-rotate ${highlight}`}>
              <span className="awosview-meter-name">{meter.name}</span>
              <div>{typeof value === "number" && value < 2000 ? value : "ABV 2000"}</div>
            </div>
          );
        })}
      </div>

      <img 
        src='/images/awosview/twr.svg' 
        className='awosview-twr-location'
        style={{ 
          left: `${airport.twrLocation.x}px`, 
          top: `${airport.twrLocation.y}px`,
          rotate: `${-deg}deg`
        }}></img>
      
    </div>


  );
};

const Windmeter = ({ icao, isRotated, activeRunway }) => {
  const airport = airportData.find(a => a.icao === icao);
  if (!airport) { return <div>Airport not found</div>; }

  const isActiveMeter = (index) => {
    if (!activeRunway || activeRunway === '') return false;
    return (activeRunway < 18 || activeRunway === 36) ? index === 0 : index === airport.windmeters.length - 1;
  };

  return (
    <>
      {airport.windmeters.map((meter, index) => (
        <div 
          key={index} 
          className={`awosview-windmeter-container${isActiveMeter(index) ? ' active-meter' : ''}`}
          style={{
            left: `${isRotated ? meter.x2 : meter.x}px`,
            top: `${isRotated ? meter.y2 : meter.y}px`
          }}
        >
          <span className="awosview-meter-name">{meter.name}</span>
          <button className="awosview-mode-toggle-button">2 MIN</button>
          <button className="awosview-mode-toggle-button">10 MIN</button>

          <WindmeterSvg 
            type={meter.type} 
            rwyh={meter.rwyh} 
            index={index + 1}
          />
        </div>
      ))}
    </>
  );
};

export default MainPage;

