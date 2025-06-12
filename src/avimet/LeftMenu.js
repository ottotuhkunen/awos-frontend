import React from 'react';
import './styles/LeftMenu.css';

const LeftMenu = ({ onSelect, selectedIndex, onCloseAtis, efhkData}) => {
  const isSpeci = efhkData?.metar?.includes("SPECI");
  const speciMatch = efhkData?.metar?.match(/\b\d{6}Z\b/);
  const minutes = speciMatch ? speciMatch[0].substring(4, 6) : null;

  const buttons = [
    'Main',
    '04R-22L',
    '15-33',
    '04L-22R',
    'SNOWTAM TAXIWAYS APRON',
    isSpeci && minutes ? `SPECIAL ${minutes}` : 'MET REPORT',
    'Setup',
    'AWOSVIEW'
  ];

  return (
    <nav className="left-menu">
        {buttons.map((label, index) => (
            <button 
                key={index} 
                className={`left-menu__button ${selectedIndex === index ? 'selected' : ''}`} 
                onClick={() => {
                  onSelect(index);
                  onCloseAtis();
                }}            >
                {index !== 4 && (
                    <img src={`/images/buttons/${index}.svg`} alt={`icon`}/>
                )}
                {label}
            </button>
        ))}
    </nav>
  );
};

export default LeftMenu;
