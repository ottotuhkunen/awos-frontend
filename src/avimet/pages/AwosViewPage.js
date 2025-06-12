import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SetupPage.css';

const airports = [
  { icao: "EFET", name: "EFET - Enontekiö" },
  { icao: "EFHA", name: "EFHA - Halli" },
  { icao: "EFIV", name: "EFIV - Ivalo" },
  { icao: "EFJO", name: "EFJO - Joensuu" },
  { icao: "EFJY", name: "EFJY - Jyväskylä" },
  { icao: "EFKE", name: "EFKE - Kemi-Tornio" },
  { icao: "EFKI", name: "EFKI - Kajaani" },
  { icao: "EFKK", name: "EFKK - Kokkola-Pietarsaari" },
  { icao: "EFKS", name: "EFKS - Kuusamo" },
  { icao: "EFKT", name: "EFKT - Kittilä" },
  { icao: "EFKU", name: "EFKU - Kuopio" },
  { icao: "EFLP", name: "EFLP - Lappeenranta" },
  { icao: "EFMA", name: "EFMA - Mariehamn" },
  { icao: "EFMI", name: "EFMI - Mikkeli" },
  { icao: "EFOU", name: "EFOU - Oulu" },
  { icao: "EFPO", name: "EFPO - Pori" },
  { icao: "EFRO", name: "EFRO - Rovaniemi" },
  { icao: "EFSA", name: "EFSA - Savonlinna" },
  { icao: "EFSI", name: "EFSI - Seinäjoki" },
  { icao: "EFTP", name: "EFTP - Tampere-Pirkkala" },
  { icao: "EFTU", name: "EFTU - Turku" },
  { icao: "EFUT", name: "EFUT - Utti" },
  { icao: "EFVA", name: "EFVA - Vaasa" }
];

const AwosViewPage = () => {
  const navigate = useNavigate();
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);

  return (
    <div className="setup-div" style={{height: 'calc(100% - 76px)'}}>
      <div className='setup-div-content'>

        <div className="setup-page-container">
          <div className="setup-titlebar">AWOSVIEW</div>

          <div className='awosview-buttons-container'>
            {airports.map((airport) => (
              <button
                key={airport.icao}
                onClick={() => navigate(`/${airport.icao.toLowerCase()}`)}
                className='awosview-buttons'
              >
                {airport.name}
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AwosViewPage;
