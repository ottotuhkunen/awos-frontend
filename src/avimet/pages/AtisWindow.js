import React, { useState } from 'react';
import '../styles/MainPage.css';
import '../styles/SetupPage.css';

const AtisWindow = ({ atisText, type = 'DEPARTURE', onClose }) => {
  return (
    <div className="main-content efhk-atis-window">
      <div 
        className="setup-titlebar"
        style={{borderTopLeftRadius: '8px', borderTopRightRadius: '8px', height: '24px', fontSize: '1.2rem'}}
      >
        {type} ATIS
      </div>
      <div className="efhk-atis-content">
        {atisText}
      </div>
    </div>
  );
};

export default AtisWindow;
