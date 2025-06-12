
export const calculateWindSpeeds = ({ ws, wg, randomizers, index }) => {
  const formatSpeed = (spd) => String(Math.max(0, Math.round(spd)));

  if (ws === undefined || wg === undefined) {
    return ['///', '///', '///'];
  }

  const partKey =
    index < 2 ? 'firstPart' :
    index < 4 ? 'secondPart' :
    'thirdPart';

  const randomizer = randomizers?.randomizers?.[0]?.[partKey]?.[0];

  if (!randomizer) return ['///', '///', '///'];

  // Calculate minimum wind speed
  let newMin;
  if (ws < 10) {
    newMin = ws - (randomizer.min || 2);
  } else {
    newMin = ws - (randomizer.min || 0) - 5;
  }
  newMin = Math.max(0, newMin);

  // Adjusted gust value
  const newWg = wg + (randomizer.max || 2);

  // If wind is calm, only return 'CALM' for ws
  const newWs = ws < 1 ? 'CALM' : formatSpeed(ws + (randomizer.speed || 0));

  return [
    newWs,                 // Sustained wind (CALM or number)
    formatSpeed(newMin),   // Minimum wind
    formatSpeed(newWg)     // Gust
  ];
};


export const calculateWindDirections = ({ wd, ws, randomizers, index }) => {
  const formatDeg = (deg) => {
    let rounded = Math.round(deg / 10) * 10;
    if (rounded <= 0) rounded += 360;
    return String(rounded).padStart(3, '0').replace(/^000$/, '360');
  };

  if (wd === undefined || ws === undefined) {
    return ['///', '///', '///'];
  }

  const partKey =
    index < 2 ? 'firstPart' :
    index < 4 ? 'secondPart' :
    'thirdPart';

  const randomizer = randomizers?.randomizers?.[0]?.[partKey]?.[0];
  const metarText = randomizers?.efhk?.[0]?.metar;

  if (!randomizer || !metarText) return ['///', '///', '///'];

  let newDir;
  let baseDir = wd;

  if (ws < 1) {
    newDir = '';
  } else if (metarText.includes('VRB')) {
    newDir = 'VRB';
  } else {
    baseDir = (wd + (randomizer.direction || 0)) % 360;
    newDir = formatDeg(baseDir);
  }

  let newCC = '///';
  let newC = '///';

  const variableMatch = metarText.match(/(\d{3})V(\d{3})/);

  if (variableMatch) {
    let cc = parseInt(variableMatch[1], 10);
    let c = parseInt(variableMatch[2], 10);
    let dirDeg = newDir === 'VRB' ? wd : parseInt(newDir, 10);

    const inRange = (start, end, value) => {
      if (start < end) return value >= start && value <= end;
      return value >= start || value <= end; // wraparound case
    };

    if (!inRange(cc, c, dirDeg)) {
      const diffToCC = (cc - dirDeg + 360) % 360;
      const diffToC = (dirDeg - c + 360) % 360;

      if (diffToCC < diffToC) {
        cc = (dirDeg - 10 + 360) % 360;
      } else {
        c = (dirDeg + 10) % 360;
      }
    }

    newCC = formatDeg(cc);
    newC = formatDeg(c);
  } else {
    let dirDeg = newDir === 'VRB' ? wd : baseDir;
    const ccDeg = (dirDeg - (randomizer.cc || 0) + 360) % 360;
    const cDeg = (dirDeg + (randomizer.cc || 0)) % 360;

    newCC = formatDeg(ccDeg);
    newC = formatDeg(cDeg);
  }

  return [newDir, newCC, newC];
};

export const calculateWindComponents = ({ wd, ws, rwyh }) => {
  const NBSP = '\u00A0'; // Unicode non-breaking space
  let windComponentText = NBSP + NBSP + NBSP + 'X0';

  if (ws === 'CALM' || wd === 'VRB') {
    return [windComponentText];
  }

  const wdNum = parseInt(wd, 10);
  const wsNum = parseInt(ws, 10);

  if (!isNaN(wdNum) && !isNaN(wsNum)) {
    let angle = wdNum - rwyh;
    if (angle < -180) angle += 360;
    if (angle > 180) angle -= 360;

    const angleRad = angle * (Math.PI / 180);
    const headwind = Math.round(wsNum * Math.cos(angleRad));
    const crosswind = Math.round(wsNum * Math.sin(angleRad));

    const absHeadwind = Math.abs(headwind);
    const absCrosswind = Math.abs(crosswind);

    const tailwindText = headwind < 0 ? `T${absHeadwind}` : '';
    const crosswindText = `X${absCrosswind}`;

    windComponentText =
      (tailwindText ? tailwindText + ' ' : NBSP + NBSP + NBSP) + crosswindText;
  }

  return [windComponentText];
};
