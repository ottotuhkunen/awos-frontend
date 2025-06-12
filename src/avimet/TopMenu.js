// src/avimet/TopMenu.js
import React, { useEffect, useState, useMemo } from 'react';
import './styles/TopMenu.css';

const TopMenu = ({efhkData, atisDep, atisArr, onOpenAtis}) => {
    const [time, setTime] = useState(new Date());
    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem('theme') === 'dark'
    );

    const atisDepId = useMemo(() => atisDep?.atisLetter || '', [atisDep]);
    const atisArrId = useMemo(() => atisArr?.atisLetter || '', [atisArr]);

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


    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const utcHours = String(time.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(time.getUTCMinutes()).padStart(2, '0');
    const utcSeconds = String(time.getUTCSeconds()).padStart(2, '0');
    const utcDay = String(time.getUTCDate()).padStart(2, '0');
    const utcMonth = String(time.getUTCMonth() + 1).padStart(2, '0'); // Month is zero-based
    const utcYear = time.getUTCFullYear();

    return (
        <header className="top-menu">
            <div className="top-menu__logo">
                <img src={'/images/logo.svg'} alt="Logo" />
            </div>

            <div className="top-menu__items">
                <button onClick={() => onOpenAtis('DEPARTURE')} className={`top-menu__atis top-menu__atis-dep ${!atisDepId ? 'no-data' : ''}`}>
                    {atisDepId}
                </button>

                <button onClick={() => onOpenAtis('ARRIVAL')} className={`top-menu__atis top-menu__atis-arr ${!atisArrId ? 'no-data' : ''}`}>
                    {atisArrId}
                </button>
                
                <button className={`top-menu__qnh ${!efhkData.qnh ? 'no-data' : ''}`}>
                    {efhkData.qnh !== undefined ? Math.floor(Number(efhkData.qnh)) : ''}
                </button>

                <button className="top-menu__qfe-trl">
                    <div className="top-menu__qfe-trl-row">
                        <span className="top-menu__qfe-trl-label">QFE</span>
                        <span className={`top-menu__qfe-trl-value ${!efhkData.qfe ? 'no-data' : ''}`}>
                            {efhkData.qfe?.[1] !== undefined ? Math.floor(Number(efhkData.qfe[1])) : ''}
                        </span>
                    </div>
                    <div className="top-menu__qfe-trl-separator" />
                    <div className="top-menu__qfe-trl-row">
                        <span className="top-menu__qfe-trl-label">TRL</span>
                        <span className={`top-menu__qfe-trl-value ${!efhkData.trl ? 'no-data' : ''}`}>
                            {efhkData.trl?.[1] !== undefined ? efhkData.trl : ''}
                        </span>
                    </div>
                </button>

                <button className={`top-menu__metcond ${!efhkData.metcond ? 'no-data' : ''}`}>
                    {efhkData.metcond?.[1] !== undefined ? efhkData.metcond : ''}
                </button>

                <button className={`top-menu__metcond top-menu__date`}>
                    {utcDay}.{utcMonth}.{utcYear}
                </button>

                <button className={`top-menu__metcond top-menu__time`} style={{fontSize: '1.5rem'}}>{utcHours}:{utcMinutes}</button>
                <button className={`top-menu__metcond top-menu__seconds`}>:{utcSeconds}</button>

                <button className="top-menu__toggle" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle Theme">
                    <img src='/images/mode.png' alt='mode'/>
                </button>

            </div>
        </header>
    );
};

export default TopMenu;
