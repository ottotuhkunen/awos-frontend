import React from 'react';
import './styles/Metar.css';

const Metar = ({ metar }) => {
 
  return (
    <div className="metar">
      <div className='metar-bg'>{metar || 'No METAR data'}</div>
    </div>
  );
};

export default Metar;
