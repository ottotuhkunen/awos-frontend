import React, { useMemo } from 'react';
import { calculateWindSpeeds, calculateWindDirections, calculateWindComponents } from './calculateWind';
import '../styles/MainPage.css';

const MainPage = ({ efhkData, atisDep, atisArr, randomizers }) => {

  const windSpeeds = useMemo(() => {
    if (!efhkData?.ws || !efhkData?.wg) {
      return Array(6).fill(['///', '///', '///']);
    }

    return Array.from({ length: 6 }, (_, index) =>
      calculateWindSpeeds({
        ws: efhkData.ws,
        wg: efhkData.wg,
        randomizers,
        index
      })
    );
  }, [efhkData.ws, efhkData.wg, randomizers]);

  const windDirections = useMemo(() => {
    if (!efhkData?.wd || !efhkData?.ws) {
      return Array(6).fill(['///', '///', '///']);
    }

    return Array.from({ length: 6 }, (_, index) =>
      calculateWindDirections({
        wd: efhkData.wd,
        ws: efhkData.ws,
        randomizers,
        index
      })
    );
  }, [efhkData.ws, efhkData.wd, randomizers]);

  // getActiveRunways function is at the end of this file
  const activeMap = getActiveRunways(atisDep, atisArr);

  const infoWindowLeft = efhkData.info_left || [];
  const infoWindowRight = efhkData.info_right || [];
  const infoWindowBottom = efhkData.info_bottom || [];

  const getRunwayBgColor = (runway, oppositeRunway) => {
    const isActive = activeMap[runway] || activeMap[oppositeRunway];
    if (isActive) return 'var(--rwy-bg-active)';

    const isClosed = efhkData[`runway${runway}_closed`] || efhkData[`runway${oppositeRunway}_closed`];
    if (isClosed) return 'var(--rwy-bg-closed)';

    return 'var(--rwy-bg-inactive)';
  };

  const getRunwayNameColor = (runway, oppositeRunway) => {
    if (activeMap[runway]) return 'var(--rwy-name-active)';
    if (activeMap[oppositeRunway]) return 'var(--rwy-name-opposite-active)';

    const isClosed = efhkData[`runway${runway}_closed`] || efhkData[`runway${oppositeRunway}_closed`];
    if (isClosed) return 'var(--rwy-name-closed)';

    return 'var(--rwy-name-inactive)';
  };

  const arrowVisibilityMap = useMemo(() => {
    const map = {};
  
    const checkVisibility = (rwy, type) => {
      const r = rwy.toUpperCase();
  
      if (type === 'dep') {
        const dep = atisDep?.preset?.toUpperCase();
        if (dep?.startsWith('DEP')) return dep.includes(r) ? 'visible' : 'hidden';
      }
  
      if (type === 'arr') {
        const arr = atisArr?.preset?.toUpperCase();
        if (arr?.startsWith('ARR')) return arr.includes(r) ? 'visible' : 'hidden';
        if (arr?.startsWith('SOIR')) {
          if (
            (arr.includes('04') && (r === '04L' || r === '04R')) ||
            (arr.includes('22') && (r === '22L' || r === '22R'))
          ) return 'visible';
        }
      }

      return 'hidden';
    };
  
    const allRunways = ['04L', '04R', '15', '33', '22L', '22R'];
    for (const rwy of allRunways) {
      map[rwy] = {
        arr: checkVisibility(rwy, 'arr'),
        dep: checkVisibility(rwy, 'dep'),
      };
    }
  
    return map;
  }, [atisDep, atisArr]);
  

  const RccTrendIndicator = ({ runway, part, pointsDn, pointsUp, cx, cy }) => {
    const trendValues = efhkData?.[`rcc_values_${runway}`]?.[0]?.trend;
  
    if (!trendValues || trendValues.length < part) return null;
    const trend = trendValues[part - 1];
  
    if (trend === -1) {
      return ( <polygon className="rcc-downgraded" points={pointsDn} /> );
    }
    if (trend === 1) {
      return ( <polygon className="rcc-upgraded" points={pointsUp} /> );
    }
    return ( <circle cx={cx} cy={cy} r="4.5" className='rcc-neutral' /> );
  };

  const now = new Date();

  function getMetarDate(metarString) {
    const match = metarString?.match(/(\d{2})(\d{2})(\d{2})Z/);
    if (!match) return null;
  
    const day = parseInt(match[1], 10);
    const hour = parseInt(match[2], 10);
    const minute = parseInt(match[3], 10);
  
    const utcNow = new Date();
    const metarDate = new Date(Date.UTC(
      utcNow.getUTCFullYear(),
      utcNow.getUTCMonth(),
      day,
      hour,
      minute
    ));
  
    // Handle month rollover (e.g., METAR says 31, but today is the 1st)
    if (metarDate > utcNow) {
      metarDate.setUTCMonth(metarDate.getUTCMonth() - 1);
    }
  
    return metarDate;
  }

  const metarTime = getMetarDate(efhkData?.metar);
  const minutesOld = metarTime ? (now.getTime() - metarTime.getTime()) / (1000 * 60) : Infinity;
  const showAtisWarning = !atisDep || !atisArr;
  const showMetarWarning = !efhkData?.metar || minutesOld > 42;
  const showWarnings = showAtisWarning || showMetarWarning;

  return (
    <svg preserveAspectRatio="xMinYMin meet" viewBox="0 0 1853.793 1289.179" className='main-svg'>
      <g id="runways">
        <rect id="rwy_04L" style={{ fill: getRunwayBgColor('04L', '22R') }} className="runway-bg" x="369.568" y="212.232" width="114.813" height="696.213" transform="translate(461.631 -143.285) rotate(40.127)"/>
        <rect id="rwy_04R" style={{ fill: getRunwayBgColor('04R', '22L') }} className="runway-bg" x="894.5" y="212.232" width="114.813" height="696.213" transform="translate(585.19 -481.594) rotate(40.127)"/>
        <rect id="rwy_15" style={{ fill: getRunwayBgColor('15', '33') }} className="runway-bg" x="1052.861" y="211.598" width="114.813" height="696.213" transform="translate(2351.511 487.066) rotate(149.897)"/>
        <text id="rwy-name-04R" style={{ fill: getRunwayNameColor('04R', '22L') }} className="runway-name" transform="translate(701.268 784.441) rotate(40.127)">04R</text>
        <text id="rwy-name-04L" style={{ fill: getRunwayNameColor('04L', '22R') }} className="runway-name" transform="translate(177.23 786.261) rotate(40.127)">04L</text>
        <text id="rwy-name-22R" style={{ fill: getRunwayNameColor('22R', '04L') }} className="runway-name" transform="translate(678.535 336.432) rotate(-139.873)">22R</text>
        <text id="rwy-name-22L" style={{ fill: getRunwayNameColor('22L', '04R') }} className="runway-name" transform="translate(1201.487 334.59) rotate(-139.873)">22L</text>
        <text id="rwy-name-33" style={{ fill: getRunwayNameColor('33', '15') }} className="runway-name" transform="translate(1251.255 863.83) rotate(-30.103)">33</text>
        <text id="rwy-name-15" style={{ fill: getRunwayNameColor('15', '33') }} className="runway-name" transform="translate(970.515 255.474) rotate(149.897)">15</text>
      </g>
      <g id="windmeter-04L">
        <rect data-name="base" className="windmeter-base" x="305.339" y="860.637" width="264.975" height="182.947"/>
        <rect data-name="background" style={{ fill: activeMap['04L'] ? 'var(--windmeter-bg-active)' : 'var(--windmeter-bg-inactive)' }} className="windmeter-bg" x="349.353" y="822.623" width="176.947" height="258.975" rx="6" ry="6" transform="translate(1389.937 514.284) rotate(90)"/>
        <text data-name="variable-between" 
          className={`windmeter-small-values${
            !isNaN(parseInt(windDirections[0][1])) &&
            !isNaN(parseInt(windDirections[0][2])) &&
            Math.min(
              (parseInt(windDirections[0][2]) - parseInt(windDirections[0][1]) + 360) % 360,
              (parseInt(windDirections[0][1]) - parseInt(windDirections[0][2]) + 360) % 360
            ) >= 60
              ? ' avimet-windmeter-highlight'
              : ''
          }`}
          style={{
            fill: activeMap['04L'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(317.195 907.73)"
        >
          {windDirections[0][1]}-{windDirections[0][2]}
        </text>
        <text data-name="tailwind-crosswind" className="windmeter-small-values" transform="translate(319.959 1022.28)">
          {calculateWindComponents({ wd: windDirections[0][0], ws: windSpeeds[0][0], rwyh: 47.5 })}
        </text>
        <text 
          style={{
            fill: activeMap['04L'] ? 'var(--windmeter-value-highlight)' : 'var(--windmeter-value-color)',
            fontFamily: activeMap['04L'] ? 'var(--windmeter-font-highlight)' : 'var(--font-avimet)',
          }}
          className="windmeter-large-values" transform="translate(319.96 971.532)">
            {windDirections[0][0]}
        </text>
        <text 
          style={{
            fill: activeMap['04L'] ? 'var(--windmeter-value-highlight)' : 'var(--windmeter-value-color)',
            fontFamily: activeMap['04L'] ? 'var(--windmeter-font-highlight)' : 'var(--font-avimet)',
          }}
          className="windmeter-large-values" transform="translate(560 971.533)">
            {windSpeeds[0][0]}
        </text>
        <text data-name="max-speed"
          className={`windmeter-small-values text-right${
            !isNaN(parseInt(windSpeeds[0][0])) &&
            !isNaN(parseInt(windSpeeds[0][2])) &&
            parseInt(windSpeeds[0][2]) - parseInt(windSpeeds[0][0]) > 9
              ? ' avimet-windmeter-highlight'
              : ''
          }`} 
          style={{
            fill: activeMap['04L'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(558.545 907.73)"
        >
          {windSpeeds[0][2]}
        </text>
        <text data-name="min-speed" 
          className={`windmeter-small-values text-right${
            !isNaN(parseInt(windSpeeds[0][0])) &&
            !isNaN(parseInt(windSpeeds[0][2])) &&
            parseInt(windSpeeds[0][2]) - parseInt(windSpeeds[0][0]) > 9
              ? ' avimet-windmeter-highlight'
              : ''
          }`} 
          style={{
            fill: activeMap['04L'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(558.545 1022.806)"
        >
          {windSpeeds[0][1]}
        </text>
        <path 
          style={{
            fill: activeMap['04L'] ? 'var(--windmeter-arrow-color)' : 'transparent',
            stroke: 'var(--windmeter-arrow-color)',
            strokeWidth: 2,
            visibility: (windDirections[0][0] === '' || windDirections[0][0] === 'VRB') ? 'hidden' : 'visible',
            transform: `rotate(${windDirections[0][0] || 0}deg)`,
          }}
          className='wind-arrow' d="M123.28,1015.022h16.019c.837,0,1.515-.678,1.515-1.515v-110.239c0-.837.678-1.515,1.515-1.515h40.789c.837,0,1.515.678,1.515,1.515v110.239c0,.837.678,1.515,1.515,1.515h16.019c1.269,0,1.976,1.467,1.185,2.46l-39.444,49.484c-.607.761-1.763.761-2.37,0l-39.444-49.484c-.791-.993-.084-2.46,1.185-2.46Z"
        />
      </g>
      <g id="windmeter-04R">
        <rect data-name="base" className="windmeter-base" x="849.845" y="860.637" width="264.975" height="182.947"/>
        <rect data-name="background" style={{ fill: activeMap['04R'] ? 'var(--windmeter-bg-active)' : 'var(--windmeter-bg-inactive)' }} className="windmeter-bg" x="893.86" y="822.623" width="176.947" height="258.975" rx="6" ry="6" transform="translate(1934.444 -30.223) rotate(90)"/>
        <text data-name="variable-between" 
          className={`windmeter-small-values${
            !isNaN(parseInt(windDirections[1][1])) &&
            !isNaN(parseInt(windDirections[1][2])) &&
            Math.min(
              (parseInt(windDirections[1][2]) - parseInt(windDirections[1][1]) + 360) % 360,
              (parseInt(windDirections[1][1]) - parseInt(windDirections[1][2]) + 360) % 360
            ) >= 60
              ? ' avimet-windmeter-highlight'
              : ''
          }`}
          style={{
            fill: activeMap['04R'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(861.701 907.73)"
        >
          {windDirections[1][1]}-{windDirections[1][2]}
        </text>
        <text data-name="tailwind-crosswind" className="windmeter-small-values" transform="translate(864.466 1022.28)">
          {calculateWindComponents({ wd: windDirections[1][0], ws: windSpeeds[1][0], rwyh: 47.5 })}
        </text>
        <text 
          style={{
            fill: activeMap['04R'] ? 'var(--windmeter-value-highlight)' : 'var(--windmeter-value-color)',
            fontFamily: activeMap['04R'] ? 'var(--windmeter-font-highlight)' : 'var(--font-avimet)',
          }}
          className="windmeter-large-values" transform="translate(864.466 971.532)">
          {windDirections[1][0]}
        </text>
        <text
          style={{
            fill: activeMap['04R'] ? 'var(--windmeter-value-highlight)' : 'var(--windmeter-value-color)',
            fontFamily: activeMap['04R'] ? 'var(--windmeter-font-highlight)' : 'var(--font-avimet)',
          }}
          className="windmeter-large-values" transform="translate(1100 971.533)">
            {windSpeeds[1][0]}
        </text>
        <text data-name="max-speed" 
          className={`windmeter-small-values text-right${
            !isNaN(parseInt(windSpeeds[1][0])) &&
            !isNaN(parseInt(windSpeeds[1][2])) &&
            parseInt(windSpeeds[0][2]) - parseInt(windSpeeds[0][0]) > 9
              ? ' avimet-windmeter-highlight'
              : ''
          }`} 
          style={{
            fill: activeMap['04R'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(1100.052 907.73)"
        >
          {windSpeeds[1][2]}
        </text>
        <text data-name="min-speed" 
          className={`windmeter-small-values text-right${
            !isNaN(parseInt(windSpeeds[1][0])) &&
            !isNaN(parseInt(windSpeeds[1][2])) &&
            parseInt(windSpeeds[0][2]) - parseInt(windSpeeds[0][0]) > 9
              ? ' avimet-windmeter-highlight'
              : ''
          }`} 
          style={{
            fill: activeMap['04R'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(1100.052 1022.806)"
        >
          {windSpeeds[1][1]}
        </text>
        <path 
          style={{
            fill: activeMap['04R'] ? 'var(--windmeter-arrow-color)' : 'transparent',
            stroke: 'var(--windmeter-arrow-color)',
            strokeWidth: 2,
            visibility: (windDirections[1][0] === '' || windDirections[1][0] === 'VRB') ? 'hidden' : 'visible',
            transform: `rotate(${windDirections[1][0] || 0}deg)`,
          }}
          className='wind-arrow' d="M693.358,1015.022h16.019c.837,0,1.515-.678,1.515-1.515v-110.239c0-.837.678-1.515,1.515-1.515h40.789c.837,0,1.515.678,1.515,1.515v110.239c0,.837.678,1.515,1.515,1.515h16.019c1.269,0,1.976,1.467,1.185,2.46l-39.444,49.484c-.607.761-1.763.761-2.37,0l-39.444-49.484c-.791-.993-.084-2.46,1.185-2.46Z"
        />
      </g>
      <g id="windmeter-33">
        <rect data-name="base" className="windmeter-base" x="1577.621" y="646.401" width="264.975" height="182.947"/>
        <rect data-name="background" style={{ fill: activeMap['33'] ? 'var(--windmeter-bg-active)' : 'var(--windmeter-bg-inactive)' }} className="windmeter-bg" x="1621.635" y="608.387" width="176.947" height="258.975" rx="6" ry="6" transform="translate(2447.983 -972.234) rotate(90)"/>
        <text data-name="variable-between" 
          className={`windmeter-small-values${
            !isNaN(parseInt(windDirections[2][1])) &&
            !isNaN(parseInt(windDirections[2][2])) &&
            Math.min(
              (parseInt(windDirections[2][2]) - parseInt(windDirections[2][1]) + 360) % 360,
              (parseInt(windDirections[2][1]) - parseInt(windDirections[2][2]) + 360) % 360
            ) >= 60
              ? ' avimet-windmeter-highlight'
              : ''
          }`}
          style={{
            fill: activeMap['33'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(1589.476 693.494)"
        >
          {windDirections[2][1]}-{windDirections[2][2]}
        </text>
        <text data-name="tailwind-crosswind" className="windmeter-small-values" transform="translate(1592.241 808.044)">
          {calculateWindComponents({ wd: windDirections[2][0], ws: windSpeeds[2][0], rwyh: 333.1 })}
        </text>
        <text 
          style={{
            fill: activeMap['33'] ? 'var(--windmeter-value-highlight)' : 'var(--windmeter-value-color)',
            fontFamily: activeMap['33'] ? 'var(--windmeter-font-highlight)' : 'var(--font-avimet)',
          }}
          className="windmeter-large-values" transform="translate(1592.241 757.296)">
            {windDirections[2][0]}
        </text>
        <text 
          style={{
            fill: activeMap['33'] ? 'var(--windmeter-value-highlight)' : 'var(--windmeter-value-color)',
            fontFamily: activeMap['33'] ? 'var(--windmeter-font-highlight)' : 'var(--font-avimet)',
          }}
          className="windmeter-large-values" transform="translate(1828 757.296)">
            {windSpeeds[2][0]}
        </text>
        <text data-name="max-speed" 
          className={`windmeter-small-values text-right${
            !isNaN(parseInt(windSpeeds[2][0])) &&
            !isNaN(parseInt(windSpeeds[2][2])) &&
            parseInt(windSpeeds[0][2]) - parseInt(windSpeeds[0][0]) > 9
              ? ' avimet-windmeter-highlight'
              : ''
          }`} 
          style={{
            fill: activeMap['33'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(1829.827 693.494)"
        >
          {windSpeeds[2][2]}
        </text>
        <text data-name="min-speed" 
          className={`windmeter-small-values text-right${
            !isNaN(parseInt(windSpeeds[2][0])) &&
            !isNaN(parseInt(windSpeeds[2][2])) &&
            parseInt(windSpeeds[0][2]) - parseInt(windSpeeds[0][0]) > 9
              ? ' avimet-windmeter-highlight'
              : ''
          }`} 
          style={{
            fill: activeMap['33'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(1829.827 808.569)"
        >
          {windSpeeds[2][1]}
        </text>
        <path 
          style={{
            fill: activeMap['33'] ? 'var(--windmeter-arrow-color)' : 'transparent',
            stroke: 'var(--windmeter-arrow-color)',
            strokeWidth: 2,
            visibility: (windDirections[2][0] === '' || windDirections[2][0] === 'VRB') ? 'hidden' : 'visible',
            transform: `rotate(${windDirections[2][0] || 0}deg)`,
          }}
          className='wind-arrow' d="M1420.531,780.794h16.019c.837,0,1.515-.678,1.515-1.515v-110.239c0-.837.678-1.515,1.515-1.515h40.789c.837,0,1.515.678,1.515,1.515v110.239c0,.837.678,1.515,1.515,1.515h16.019c1.269,0,1.976,1.467,1.185,2.46l-39.444,49.484c-.607.761-1.763.761-2.37,0l-39.444-49.484c-.791-.993-.084-2.46,1.185-2.46Z"
        />
      </g>
      <g id="windmeter-22L">
        <rect data-name="base" className="windmeter-base" x="1449.269" y="192.614" width="264.975" height="182.947"/>
        <rect data-name="background" style={{ fill: activeMap['22L'] ? 'var(--windmeter-bg-active)' : 'var(--windmeter-bg-inactive)' }} className="windmeter-bg" x="1493.283" y="154.6" width="176.947" height="258.975" rx="6" ry="6" transform="translate(1865.844 -1297.67) rotate(90)"/>
        <text data-name="variable-between" 
          className={`windmeter-small-values${
            !isNaN(parseInt(windDirections[3][1])) &&
            !isNaN(parseInt(windDirections[3][2])) &&
            Math.min(
              (parseInt(windDirections[3][2]) - parseInt(windDirections[3][1]) + 360) % 360,
              (parseInt(windDirections[3][1]) - parseInt(windDirections[3][2]) + 360) % 360
            ) >= 60
              ? ' avimet-windmeter-highlight'
              : ''
          }`}
          style={{
            fill: activeMap['22L'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(1461.125 239.707)"
        >
          {windDirections[3][1]}-{windDirections[3][2]}
        </text>
        <text data-name="tailwind-crosswind" className="windmeter-small-values" transform="translate(1463.889 354.257)">
          {calculateWindComponents({ wd: windDirections[3][0], ws: windSpeeds[3][0], rwyh: 227.5 })}
        </text>
        <text 
          style={{
            fill: activeMap['22L'] ? 'var(--windmeter-value-highlight)' : 'var(--windmeter-value-color)',
            fontFamily: activeMap['22L'] ? 'var(--windmeter-font-highlight)' : 'var(--font-avimet)',
          }}
          className="windmeter-large-values" transform="translate(1463.889 303.509)">
            {windDirections[3][0]}
          </text>
        <text 
          style={{
            fill: activeMap['22L'] ? 'var(--windmeter-value-highlight)' : 'var(--windmeter-value-color)',
            fontFamily: activeMap['22L'] ? 'var(--windmeter-font-highlight)' : 'var(--font-avimet)',
          }}
          className="windmeter-large-values" transform="translate(1700 303.509)">
            {windSpeeds[3][0]}
        </text>
        <text data-name="max-speed" 
          className={`windmeter-small-values text-right${
            !isNaN(parseInt(windSpeeds[3][0])) &&
            !isNaN(parseInt(windSpeeds[3][2])) &&
            parseInt(windSpeeds[0][2]) - parseInt(windSpeeds[0][0]) > 9
              ? ' avimet-windmeter-highlight'
              : ''
          }`} 
          style={{
            fill: activeMap['22L'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(1700.475 239.707)"
        >
          {windSpeeds[3][2]}
        </text>
        <text data-name="min-speed" 
          className={`windmeter-small-values text-right${
            !isNaN(parseInt(windSpeeds[3][0])) &&
            !isNaN(parseInt(windSpeeds[3][2])) &&
            parseInt(windSpeeds[0][2]) - parseInt(windSpeeds[0][0]) > 9
              ? ' avimet-windmeter-highlight'
              : ''
          }`} 
          style={{
            fill: activeMap['22L'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(1700.475 354.782)"
        >
          {windSpeeds[3][1]}
        </text>
        <path 
          style={{
            fill: activeMap['22L'] ? 'var(--windmeter-arrow-color)' : 'transparent',
            stroke: 'var(--windmeter-arrow-color)',
            strokeWidth: 2,
            visibility: (windDirections[3][0] === '' || windDirections[3][0] === 'VRB') ? 'hidden' : 'visible',
            transform: `rotate(${windDirections[3][0] || 0}deg)`,
          }}
          className='wind-arrow' d="M1296.765,303.243h16.019c.837,0,1.515-.678,1.515-1.515v-110.239c0-.837.678-1.515,1.515-1.515h40.789c.837,0,1.515.678,1.515,1.515v110.239c0,.837.678,1.515,1.515,1.515h16.019c1.269,0,1.976,1.467,1.185,2.46l-39.444,49.484c-.607.761-1.763.761-2.37,0l-39.444-49.484c-.791-.993-.084-2.46,1.185-2.46Z"
        />
      </g>
      <g id="windmeter-15">
        <rect data-name="base" className="windmeter-base" x="890.92" y="7.314" width="264.975" height="182.947"/>
        <rect data-name="background" style={{ fill: activeMap['15'] ? 'var(--windmeter-bg-active)' : 'var(--windmeter-bg-inactive)' }} className="windmeter-bg" x="934.934" y="-30.7" width="176.947" height="258.975" rx="6" ry="6" transform="translate(1122.195 -924.621) rotate(90)"/>
        <text data-name="variable-between" 
          className={`windmeter-small-values${
            !isNaN(parseInt(windDirections[4][1])) &&
            !isNaN(parseInt(windDirections[4][2])) &&
            Math.min(
              (parseInt(windDirections[4][2]) - parseInt(windDirections[4][1]) + 360) % 360,
              (parseInt(windDirections[4][1]) - parseInt(windDirections[4][2]) + 360) % 360
            ) >= 60
              ? ' avimet-windmeter-highlight'
              : ''
          }`}
          style={{
            fill: activeMap['15'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(902.776 54.407)"
        >
          {windDirections[4][1]}-{windDirections[4][2]}
        </text>
        <text data-name="tailwind-crosswind" className="windmeter-small-values" transform="translate(905.541 168.957)">
          {calculateWindComponents({ wd: windDirections[4][0], ws: windSpeeds[4][0], rwyh: 153.0 })}
        </text>
        <text 
          style={{
            fill: activeMap['15'] ? 'var(--windmeter-value-highlight)' : 'var(--windmeter-value-color)',
            fontFamily: activeMap['15'] ? 'var(--windmeter-font-highlight)' : 'var(--font-avimet)',
          }}
          className="windmeter-large-values" transform="translate(905.541 118.209)">
            {windDirections[4][0]}
        </text>
        <text 
          style={{
            fill: activeMap['15'] ? 'var(--windmeter-value-highlight)' : 'var(--windmeter-value-color)',
            fontFamily: activeMap['15'] ? 'var(--windmeter-font-highlight)' : 'var(--font-avimet)',
          }}
          className="windmeter-large-values" transform="translate(1141.399 118.21)">
            {windSpeeds[4][0]}
        </text>
        <text data-name="max-speed" 
          className={`windmeter-small-values text-right${
            !isNaN(parseInt(windSpeeds[4][0])) &&
            !isNaN(parseInt(windSpeeds[4][2])) &&
            parseInt(windSpeeds[0][2]) - parseInt(windSpeeds[0][0]) > 9
              ? ' avimet-windmeter-highlight'
              : ''
          }`} 
          style={{
            fill: activeMap['15'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(1144.127 54.407)"
        >
          {windSpeeds[4][2]}
        </text>
        <text data-name="min-speed" 
          className={`windmeter-small-values text-right${
            !isNaN(parseInt(windSpeeds[4][0])) &&
            !isNaN(parseInt(windSpeeds[4][2])) &&
            parseInt(windSpeeds[0][2]) - parseInt(windSpeeds[0][0]) > 9
              ? ' avimet-windmeter-highlight'
              : ''
          }`} 
          style={{
            fill: activeMap['15'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(1144.127 169.483)"
        >
          {windSpeeds[4][1]}
        </text>
        <path 
          style={{
            fill: activeMap['15'] ? 'var(--windmeter-arrow-color)' : 'transparent',
            stroke: 'var(--windmeter-arrow-color)',
            strokeWidth: 2,
            visibility: (windDirections[4][0] === '' || windDirections[4][0] === 'VRB') ? 'hidden' : 'visible',
            transform: `rotate(${windDirections[4][0] || 0}deg)`,
          }}
          className='wind-arrow' d="M755.241,213.124h16.019c.837,0,1.515-.678,1.515-1.515v-110.239c0-.837.678-1.515,1.515-1.515h40.789c.837,0,1.515.678,1.515,1.515v110.239c0,.837.678,1.515,1.515,1.515h16.019c1.269,0,1.976,1.467,1.185,2.46l-39.444,49.484c-.607.761-1.763.761-2.37,0l-39.444-49.484c-.791-.993-.084-2.46,1.185-2.46Z"
        />
      </g>
      <g id="windmeter-22R">
        <rect data-name="base" className="windmeter-base" x="305.177" y="7.662" width="264.975" height="182.947"/>
        <rect data-name="background" style={{ fill: activeMap['22R'] ? 'var(--windmeter-bg-active)' : 'var(--windmeter-bg-inactive)' }} className="windmeter-bg" x="349.191" y="-30.352" width="176.947" height="258.975" rx="6" ry="6" transform="translate(536.8 -338.529) rotate(90)"/>
        <text data-name="variable-between" 
          className={`windmeter-small-values${
            !isNaN(parseInt(windDirections[5][1])) &&
            !isNaN(parseInt(windDirections[5][2])) &&
            Math.min(
              (parseInt(windDirections[5][2]) - parseInt(windDirections[5][1]) + 360) % 360,
              (parseInt(windDirections[5][1]) - parseInt(windDirections[5][2]) + 360) % 360
            ) >= 60
              ? ' avimet-windmeter-highlight'
              : ''
          }`}
          style={{
            fill: activeMap['22R'] ? '' : 'var(--windmeter-value-color)',
          }} 
          transform="translate(317.032 54.756)"
        >
          {windDirections[5][1]}-{windDirections[5][2]}
        </text>
        <text data-name="tailwind-crosswind" className="windmeter-small-values" transform="translate(319.797 169.306)">
          {calculateWindComponents({ wd: windDirections[5][0], ws: windSpeeds[5][0], rwyh: 227.5 })}
        </text>
        <text 
          style={{
            fill: activeMap['22R'] ? 'var(--windmeter-value-highlight)' : 'var(--windmeter-value-color)',
            fontFamily: activeMap['22R'] ? 'var(--windmeter-font-highlight)' : 'var(--font-avimet)',
          }}
          className="windmeter-large-values" transform="translate(319.797 118.557)">
            {windDirections[5][0]}
        </text>
        <text 
          style={{
            fill: activeMap['22R'] ? 'var(--windmeter-value-highlight)' : 'var(--windmeter-value-color)',
            fontFamily: activeMap['22R'] ? 'var(--windmeter-font-highlight)' : 'var(--font-avimet)',
          }}
          className="windmeter-large-values" transform="translate(555.655 118.558)">
            {windSpeeds[5][0]}
        </text>
        <text data-name="max-speed" 
          className={`windmeter-small-values text-right${
            !isNaN(parseInt(windSpeeds[5][0])) &&
            !isNaN(parseInt(windSpeeds[5][2])) &&
            parseInt(windSpeeds[0][2]) - parseInt(windSpeeds[0][0]) > 9
              ? ' avimet-windmeter-highlight'
              : ''
          }`} 
          style={{
            fill: activeMap['22R'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(558.383 54.756)"
        >
          {windSpeeds[5][2]}
        </text>
        <text data-name="min-speed" 
          className={`windmeter-small-values text-right${
            !isNaN(parseInt(windSpeeds[5][0])) &&
            !isNaN(parseInt(windSpeeds[5][2])) &&
            parseInt(windSpeeds[0][2]) - parseInt(windSpeeds[0][0]) > 9
              ? ' avimet-windmeter-highlight'
              : ''
          }`} 
          style={{
            fill: activeMap['22R'] ? '' : 'var(--windmeter-value-color)',
          }}
          transform="translate(558.383 169.831)"
        >
          {windSpeeds[5][1]}
        </text>
        <path 
          style={{
            fill: activeMap['22R'] ? 'var(--windmeter-arrow-color)' : 'transparent',
            stroke: 'var(--windmeter-arrow-color)',
            strokeWidth: 2,
            visibility: (windDirections[5][0] === '' || windDirections[5][0] === 'VRB') ? 'hidden' : 'visible',
            transform: `rotate(${windDirections[5][0] || 0}deg)`,
          }}
          className='wind-arrow' d="M347.929,324.979h16.019c.837,0,1.515-.678,1.515-1.515v-110.239c0-.837.678-1.515,1.515-1.515h40.789c.837,0,1.515.678,1.515,1.515v110.239c0,.837.678,1.515,1.515,1.515h16.019c1.269,0,1.976,1.467,1.185,2.46l-39.444,49.484c-.607.761-1.763.761-2.37,0l-39.444-49.484c-.791-.993-.084-2.46,1.185-2.46Z"
        />
      </g>
      <g id="arrows-22L">
        <polygon style={{ visibility: arrowVisibilityMap['22L'].arr }} className="arrow-arrival" points="1165.427 232.245 1239.071 294.318 1181.907 287.416 1165.427 232.245"/>
        <polygon style={{ visibility: arrowVisibilityMap['22L'].dep }} className="arrow-departure" points="1092.618 318.936 1166.262 381.009 1109.098 374.107 1092.618 318.936"/>
      </g>
      <g id="arrows-22R">
        <polygon style={{ visibility: arrowVisibilityMap['22R'].arr }} className="arrow-arrival" points="641.067 230.821 714.711 292.893 657.547 285.991 641.067 230.821"/>
        <polygon style={{ visibility: arrowVisibilityMap['22R'].dep }} className="arrow-departure" points="568.258 317.511 641.902 379.584 584.738 372.682 568.258 317.511"/>
      </g>
      <g id="arrows-04L">
        <polygon style={{ visibility: arrowVisibilityMap['04L'].arr }} className="arrow-arrival" points="212.938 888.919 139.294 826.846 196.458 833.749 212.938 888.919"/>
        <polygon style={{ visibility: arrowVisibilityMap['04L'].dep }} className="arrow-departure" points="285.747 802.228 212.104 740.156 269.268 747.058 285.747 802.228"/>
      </g>
      <g id="arrows-04R">
        <polygon style={{ visibility: arrowVisibilityMap['04R'].arr }} className="arrow-arrival" points="737.777 889.245 664.134 827.172 721.298 834.074 737.777 889.245"/>
        <polygon style={{ visibility: arrowVisibilityMap['04R'].dep }} className="arrow-departure" points="810.586 802.554 736.943 740.481 794.107 747.383 810.586 802.554"/>
      </g>
      <g id="arrows-15">
        <polygon style={{ visibility: arrowVisibilityMap['15'].arr }} className="arrow-arrival" points="874.661 248.831 957.985 200.524 932.154 251.984 874.661 248.831"/>
        <polygon style={{ visibility: arrowVisibilityMap['15'].dep }} className="arrow-departure" points="931.614 346.671 1014.938 298.365 989.107 349.824 931.614 346.671"/>
      </g>
      <g id="arrows-33">
        <polygon style={{ visibility: arrowVisibilityMap['33'].arr }} className="arrow-arrival" points="1347.794 874.868 1264.469 923.175 1290.301 871.715 1347.794 874.868"/>
        <polygon style={{ visibility: arrowVisibilityMap['33'].dep }} className="arrow-departure" points="1290.84 777.028 1207.516 825.334 1233.348 773.875 1290.84 777.028"/>
      </g>
      <g id="rcc-04L">
        <g data-name="first-part">
          <rect data-name="background" className="rcc-background" x="397.148" y="709.703" width="101.413" height="41.094"/>
          <text className={`rcc-value ${efhkData?.rcc_values_04L?.[0]?.values?.[0] == null ? 'svg-no-data' : ''}`} transform="translate(427.658 742.76)">
            {efhkData?.rcc_values_04L?.[0]?.values?.[0] == null ? '//' : efhkData.rcc_values_04L[0].values[0]}
          </text>
          <RccTrendIndicator 
            runway={'04L'} part={1} 
            pointsDn={'486.401 734.671 476.041 742.56 465.691 734.671 470.81 734.671 470.81 721.85 481.282 721.85 481.282 734.671 486.401 734.671'} 
            pointsUp={'465.691 725.455 476.051 717.566 486.401 725.455 481.282 725.455 481.282 738.276 470.81 738.276 470.81 725.455 465.691 725.455'} 
            cx={'478.842'} cy={'728.65'}  
          />


        </g>
        <g data-name="second-part">
          <rect data-name="background" className="rcc-background" x="500.24" y="589.554" width="101.413" height="41.094"/>
          <text className={`rcc-value ${efhkData?.rcc_values_04L?.[0]?.values?.[1] == null ? 'svg-no-data' : ''}`} transform="translate(530.75 622.611)">
            {efhkData?.rcc_values_04L?.[0]?.values?.[1] == null ? '//' : efhkData.rcc_values_04L[0].values[1]}
          </text>
          <RccTrendIndicator 
            runway={'04L'} part={2} 
            pointsDn={'589.493 614.522 579.133 622.411 568.783 614.522 573.902 614.522 573.902 601.701 584.374 601.701 584.374 614.522 589.493 614.522'} 
            pointsUp={'568.783 605.306 579.142 597.417 589.493 605.306 584.374 605.306 584.374 618.127 573.902 618.127 573.902 605.306 568.783 605.306'} 
            cx={'581.934'} cy={'608.501'}  
          />
        </g>
        <g data-name="third-part">
          <rect data-name="background" className="rcc-background" x="600.398" y="469.427" width="101.413" height="41.094"/>
          <text className={`rcc-value ${efhkData?.rcc_values_04L?.[0]?.values?.[2] == null ? 'svg-no-data' : ''}`} transform="translate(630.908 502.485)" >
            {efhkData?.rcc_values_04L?.[0]?.values?.[2] == null ? '//' : efhkData.rcc_values_04L[0].values[2]}
          </text>
          <RccTrendIndicator 
            runway={'04L'} part={3} 
            pointsDn={'689.651 494.396 679.291 502.285 668.941 494.396 674.06 494.396 674.06 481.575 684.532 481.575 684.532 494.396 689.651 494.396'} 
            pointsUp={'668.941 485.18 679.301 477.291 689.651 485.18 684.532 485.18 684.532 498.001 674.06 498.001 674.06 485.18 668.941 485.18'} 
            cx={'682.092'} cy={'488.375'}  
          />
        </g>
      </g>
      <g id="rcc-04R">
        <g data-name="first-part">
          <rect data-name="background" className="rcc-background" x="867.646" y="755.199" width="101.413" height="41.094"/>
          <text className={`rcc-value ${efhkData?.rcc_values_04R?.[0]?.values?.[0] == null ? 'svg-no-data' : ''}`} transform="translate(898.157 788.257)">
            {efhkData?.rcc_values_04R?.[0]?.values?.[0] == null ? '//' : efhkData.rcc_values_04R[0].values[0]}
          </text>
          <RccTrendIndicator 
            runway={'04R'} part={1} 
            pointsDn={'956.899 780.168 946.54 788.057 936.189 780.168 941.308 780.168 941.308 767.347 951.78 767.347 951.78 780.168 956.899 780.168'} 
            pointsUp={'936.189 770.952 946.549 763.063 956.899 770.952 951.78 770.952 951.78 783.773 941.308 783.773 941.308 770.952 936.189 770.952'} 
            cx={'949.341'} cy={'774.147'}  
          />
        </g>
        <g data-name="second-part">
          <rect data-name="background" className="rcc-background" x="924.657" y="689.801" width="101.413" height="41.094"/>
          <text className={`rcc-value ${efhkData?.rcc_values_04R?.[0]?.values?.[1] == null ? 'svg-no-data' : ''}`} transform="translate(955.168 722.858)">
            {efhkData?.rcc_values_04R?.[0]?.values?.[1] == null ? '//' : efhkData.rcc_values_04R[0].values[1]}
          </text>
          <RccTrendIndicator 
            runway={'04R'} part={2} 
            pointsDn={'1013.91 714.769 1003.55 722.658 993.2 714.769 998.319 714.769 998.319 701.948 1008.791 701.948 1008.791 714.769 1013.91 714.769'} 
            pointsUp={'993.2 705.553 1003.56 697.664 1013.91 705.553 1008.791 705.553 1008.791 718.374 998.319 718.374 998.319 705.553 993.2 705.553'} 
            cx={'1006.351'} cy={'708.748'}  
          />
        </g>
        <g data-name="third-part">
          <rect data-name="background" className="rcc-background" x="976.996" y="624.402" width="101.413" height="41.094"/>
          <text className={`rcc-value ${efhkData?.rcc_values_04R?.[0]?.values?.[2] == null ? 'svg-no-data' : ''}`} transform="translate(1007.507 657.46)">
            {efhkData?.rcc_values_04R?.[0]?.values?.[2] == null ? '//' : efhkData.rcc_values_04R[0].values[2]}
          </text>
          <RccTrendIndicator 
            runway={'04R'} part={3} 
            pointsDn={'1066.249 649.371 1055.89 657.26 1045.539 649.371 1050.658 649.371 1050.658 636.55 1061.13 636.55 1061.13 649.371 1066.249 649.371'} 
            pointsUp={'1045.539 640.155 1055.899 632.266 1066.249 640.155 1061.13 640.155 1061.13 652.976 1050.658 652.976 1050.658 640.155 1045.539 640.155'} 
            cx={'1058.691'} cy={'643.35'}  
          />
        </g>
      </g>
      <g id="rcc-15">
        <g data-name="first-part">
          <rect data-name="background" className="rcc-background" x="1174.372" y="468.96" width="101.413" height="41.094"/>
          <text className={`rcc-value ${efhkData?.rcc_values_15?.[0]?.values?.[0] == null ? 'svg-no-data' : ''}`} transform="translate(1204.882 502.018)">
            {efhkData?.rcc_values_15?.[0]?.values?.[0] == null ? '//' : efhkData.rcc_values_15[0].values[0]}
          </text>
          <RccTrendIndicator 
            runway={'15'} part={1} 
            pointsDn={'1263.625 493.929 1253.265 501.818 1242.915 493.929 1248.034 493.929 1248.034 481.108 1258.506 481.108 1258.506 493.929 1263.625 493.929'} 
            pointsUp={'1242.915 484.713 1253.275 476.824 1263.625 484.713 1258.506 484.713 1258.506 497.534 1248.034 497.534 1248.034 484.713 1242.915 484.713'} 
            cx={'1256.066'} cy={'487.908'}  
          />
        </g>
        <g data-name="second-part">
          <rect data-name="background" className="rcc-background" x="1225.078" y="559.229" width="101.413" height="41.094"/>
          <text className={`rcc-value ${efhkData?.rcc_values_15?.[0]?.values?.[1] == null ? 'svg-no-data' : ''}`} transform="translate(1255.589 592.287)">
            {efhkData?.rcc_values_15?.[0]?.values?.[1] == null ? '//' : efhkData.rcc_values_15[0].values[1]}
          </text>
          <RccTrendIndicator 
            runway={'15'} part={2} 
            pointsDn={'1314.332 584.197 1303.972 592.086 1293.621 584.197 1298.74 584.197 1298.74 571.376 1309.212 571.376 1309.212 584.197 1314.332 584.197'} 
            pointsUp={'1293.621 574.981 1303.981 567.092 1314.332 574.981 1309.213 574.981 1309.213 587.802 1298.74 587.802 1298.74 574.981 1293.621 574.981'} 
            cx={'1306.773'} cy={'578.176'}  
          />
        </g>
        <g data-name="third-part">
          <rect id="background-15" data-name="background" className="rcc-background" x="1275.725" y="660.256" width="101.413" height="41.094"/>
          <text className={`rcc-value ${efhkData?.rcc_values_15?.[0]?.values?.[2] == null ? 'svg-no-data' : ''}`} transform="translate(1306.235 693.314)">
            {efhkData?.rcc_values_15?.[0]?.values?.[2] == null ? '//' : efhkData.rcc_values_15[0].values[2]}
          </text>
          <RccTrendIndicator 
            runway={'15'} part={3} 
            pointsDn={'1364.978 685.225 1354.618 693.114 1344.268 685.225 1349.387 685.225 1349.387 672.404 1359.859 672.404 1359.859 685.225 1364.978 685.225'} 
            pointsUp={'1344.268 676.009 1354.627 668.12 1364.978 676.009 1359.859 676.009 1359.859 688.83 1349.387 688.83 1349.387 676.009 1344.268 676.009'} 
            cx={'1357.419'} cy={'679.204'}  
          />
        </g>
      </g>
      <g id="rvr-15">
        <text className={`rvr-value ${!efhkData?.rvr_values_15?.[0] ? 'svg-no-data' : ''}`} transform="translate(1102.861 562.266)">
          {efhkData?.rvr_values_15?.[0] === 0 ? '////' : efhkData?.rvr_values_15?.[0] === 2000 ? '' : efhkData?.rvr_values_15?.[0] ?? ''}
        </text>
        <text className={`rvr-value ${!efhkData?.rvr_values_15?.[1] ? 'no-data' : ''}`} transform="translate(1144.77 632.266)">
          {efhkData?.rvr_values_15?.[1] === 0 ? '////' : efhkData?.rvr_values_15?.[1] === 2000 ? '' : efhkData?.rvr_values_15?.[1] ?? ''}
        </text>
        <text className={`rvr-value ${!efhkData?.rvr_values_15?.[2] ? 'no-data' : ''}`} transform="translate(1186.423 702.265)">
          {efhkData?.rvr_values_15?.[2] === 0 ? '////' : efhkData?.rvr_values_15?.[2] === 2000 ? '' : efhkData?.rvr_values_15?.[2] ?? ''}
        </text>
      </g>

      <g id="rvr-04R">
        <text className={`rvr-value ${!efhkData?.rvr_values_04R?.[0] ? 'svg-no-data' : ''}`} transform="translate(846.72 697.664)">
          {efhkData?.rvr_values_04R?.[0] === 0 ? '////' : efhkData?.rvr_values_04R?.[0] === 2000 ? '' : efhkData?.rvr_values_04R?.[0] ?? ''}
        </text>
        <text className={`rvr-value ${!efhkData?.rvr_values_04R?.[1] ? 'svg-no-data' : ''}`} transform="translate(902.747 630.648)">
          {efhkData?.rvr_values_04R?.[1] === 0 ? '////' : efhkData?.rvr_values_04R?.[1] === 2000 ? '' : efhkData?.rvr_values_04R?.[1] ?? ''}
        </text>
        <text className={`rvr-value ${!efhkData?.rvr_values_04R?.[2] ? 'svg-no-data' : ''}`} transform="translate(963.375 560.648)">
          {efhkData?.rvr_values_04R?.[2] === 0 ? '////' : efhkData?.rvr_values_04R?.[2] === 2000 ? '' : efhkData?.rvr_values_04R?.[2] ?? ''}
        </text>
      </g>

      <g id="rvr-04L">
        <text className={`rvr-value ${!efhkData?.rvr_values_04L?.[0] ? 'svg-no-data' : ''}`} transform="translate(344.598 671.93)">
          {efhkData?.rvr_values_04L?.[0] === 0 ? '////' : efhkData?.rvr_values_04L?.[0] === 2000 ? '' : efhkData?.rvr_values_04L?.[0] ?? ''}
        </text>
        <text className={`rvr-value ${!efhkData?.rvr_values_04L?.[1] ? 'svg-no-data' : ''}`} transform="translate(420.044 581.93)">
          {efhkData?.rvr_values_04L?.[1] === 0 ? '////' : efhkData?.rvr_values_04L?.[1] === 2000 ? '' : efhkData?.rvr_values_04L?.[1] ?? ''}
        </text>
        <text className={`rvr-value ${!efhkData?.rvr_values_04L?.[2] ? 'svg-no-data' : ''}`} transform="translate(494.514 491.93)">
          {efhkData?.rvr_values_04L?.[2] === 0 ? '////' : efhkData?.rvr_values_04L?.[2] === 2000 ? '' : efhkData?.rvr_values_04L?.[2] ?? ''}
        </text>
      </g>

      <g id="info-windows">
      <rect
        visibility={infoWindowRight?.[0]?.lines?.some(line => line !== '') ? 'visible' : 'hidden'}
        className="info-window-border"
        x="1257.779"
        y="7.257"
        width="582.067"
        height="160.736"
      />
      <rect
        visibility={infoWindowBottom?.[0]?.lines?.some(line => line !== '') ? 'visible' : 'hidden'}
        className="info-window-border"
        x="1254.331"
        y="1055.329"
        width="585.862"
        height="222.364"
      />
      <rect
        visibility={infoWindowLeft?.[0]?.lines?.some(line => line !== '') ? 'visible' : 'hidden'}
        className="info-window-border"
        x="5.199"
        y="387.029"
        width="322.965"
        height="161.797"
      />
      </g>

      {showWarnings && (
        <rect id="warnings-bg" className="info-window-border" x="6.629" y="1087.877" width="845.108" height="180.524" />
      )}

      <text className="info-window-text warnings-window-text" transform="translate(720 1134)" textAnchor="end">
        <tspan x="0" y="0"></tspan>
        <tspan x="0" dy="1.4em" visibility={showAtisWarning ? 'visible' : 'hidden'}>
          EFHK ATIS MISSING
        </tspan>
        <tspan x="0" dy="1.4em" visibility={showMetarWarning ? 'visible' : 'hidden'}>
          EFHK METAR MISSING
        </tspan>
        <tspan x="0" dy="1.4em" visibility="hidden">
          MET WARNINGS EXIST
        </tspan>
      </text>

      <g id="info-window-text">
        <text id="info-top-left" className='info-window-text' transform="translate(13.964 426)">
          <tspan x="0" y="0">{infoWindowLeft?.[0]?.lines?.[0] ?? ''}</tspan>
          <tspan x="0" dy="1.2em">{infoWindowLeft?.[0]?.lines?.[1] ?? ''}</tspan>
          <tspan x="0" dy="1.2em">{infoWindowLeft?.[0]?.lines?.[2] ?? ''}</tspan>
          <tspan x="0" dy="1.2em">{infoWindowLeft?.[0]?.lines?.[3] ?? ''}</tspan>
        </text>     
        <text id="info-top-right" className='info-window-text' transform="translate(1265.522 46)">
          <tspan x="0" y="0">{infoWindowRight?.[0]?.lines?.[0] ?? ''}</tspan>
          <tspan x="0" dy="1.2em">{infoWindowRight?.[0]?.lines?.[1] ?? ''}</tspan>
          <tspan x="0" dy="1.2em">{infoWindowRight?.[0]?.lines?.[2] ?? ''}</tspan>
          <tspan x="0" dy="1.2em">{infoWindowRight?.[0]?.lines?.[3] ?? ''}</tspan>  
        </text>
        <text id="info-bottom-right" className='info-window-text' transform="translate(1265.449 1104.026)">
          <tspan x="0" y="0">{infoWindowBottom?.[0]?.lines?.[0] ?? ''}</tspan>
          <tspan x="0" dy="1.2em">{infoWindowBottom?.[0]?.lines?.[1] ?? ''}</tspan>
          <tspan x="0" dy="1.2em">{infoWindowBottom?.[0]?.lines?.[2] ?? ''}</tspan>
          <tspan x="0" dy="1.2em">{infoWindowBottom?.[0]?.lines?.[3] ?? ''}</tspan>
        </text>
      </g>
    </svg>
  );
};

const getActiveRunways = (atisDep, atisArr) => {
  const active = {
    '04L': false,
    '04R': false,
    '15': false,
    '33': false,
    '22L': false,
    '22R': false,
  };

  const allRunways = Object.keys(active);

  const markRunways = (type) => {
    const preset = (type === 'departure' ? atisDep?.preset : atisArr?.preset)?.toUpperCase();
    if (!preset) return;

    allRunways.forEach(rwy => {
      if (type === 'departure' && preset.startsWith('DEP') && preset.includes(rwy)) {
        active[rwy] = true;
      }

      if (type === 'arrival') {
        if (preset.startsWith('ARR') && preset.includes(rwy)) {
          active[rwy] = true;
        }

        if (preset.startsWith('SOIR')) {
          if ((preset.includes('04') && (rwy === '04L' || rwy === '04R')) ||
              (preset.includes('22') && (rwy === '22L' || rwy === '22R'))) {
            active[rwy] = true;
          }
        }
      }
    });
  };

  markRunways('departure');
  markRunways('arrival');

  return active;
};

export default MainPage;
