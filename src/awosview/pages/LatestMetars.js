import React, { useEffect, useState } from 'react';
import '../styles/Metars.css';

const LatestMetars = ({ icao }) => {
  const [metars, setMetars] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const fetchMetars = async () => {
      try {
        const response = await fetch(
          `https://api.met.no/weatherapi/tafmetar/1.0/metar.txt?icao=${icao}`
        );
        const text = await response.text();

        const lines = text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .reverse();

        setMetars(lines);
      } catch (error) {
        console.error('Failed to fetch METAR data:', error);
      }
    };

    fetchMetars();
  }, [icao]);

  const totalPages = Math.ceil(metars.length / pageSize);

  // Clamp page value
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  // Slice data for current page
  const pagedMetars = metars.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Parse time from METAR and format it as requested
  const formatTime = (metar) => {
    // Time is like: "091250Z" (DDHHMMZ)
    // Extract pattern of 6 digits + Z (day, hour, minute)
    const timeMatch = metar.match(/\b(\d{6})Z\b/);
    if (!timeMatch) return '';

    const timeStr = timeMatch[1];
    const day = timeStr.slice(0, 2);
    const hour = timeStr.slice(2, 4);
    const minute = timeStr.slice(4, 6);

    // Construct date string: "2025-06-04 07:20:07"
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute}:07`;
  };

  if (metars.length === 0) return <div>Loading...</div>;

  return (
    <div className="awosview-metars-container">
      {totalPages > 1 && (
        <div className="awosview-pagination-controls">
          <button onClick={() => setPage(1)} disabled={currentPage === 1}>
            <img src="/images/awosview/first.svg"></img>
          </button>
          <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
            <img src="/images/awosview/backward.svg"></img>
          </button>
          <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>
            <img src="/images/awosview/forward.svg"></img>
          </button>
          <button onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>
            <img src="/images/awosview/last.svg"></img>
          </button>
          <span>{currentPage}/{totalPages}</span>
        </div>
      )}
  
      <table className="awosview-metars-table">
        <thead>
          <tr>
            <th>Report</th>
            <th>Sent</th>
          </tr>
        </thead>
        <tbody>
          {pagedMetars.map((metar, i) => (
            <tr key={i} className="awosview-metar-row">
              <td className="awosview-report-cell">{metar}</td>
              <td className="awosview-sent-cell">{formatTime(metar)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );  
};

export default LatestMetars;
