import React from 'react';
import { FaShieldVirus, FaCheckCircle, FaQuestionCircle, FaClock, FaChartLine } from 'react-icons/fa';
import './StatsCards.css';

export default function StatsCards({ currentScan, scanHistory = [] }) {
  const hasScanData = currentScan && 
                     (currentScan.data?.attributes?.stats || 
                      currentScan.data?.attributes?.last_analysis_stats);
  
  if (!hasScanData) {
    return (
      <div className="stats-cards-container">
        <div className="stats-cards-grid">
          <div className="stats-card total">
            <div className="stats-icon">
              <FaChartLine />
            </div>
            <div className="stats-content">
              <h3>Total Scans</h3>
              <p>0</p>
            </div>
          </div>
          
          <div className="stats-card malicious">
            <div className="stats-icon">
              <FaShieldVirus />
            </div>
            <div className="stats-content">
              <h3>Malicious</h3>
              <p>0</p>
            </div>
          </div>
          
          <div className="stats-card suspicious">
            <div className="stats-icon">
              <FaQuestionCircle />
            </div>
            <div className="stats-content">
              <h3>Suspicious</h3>
              <p>0</p>
            </div>
          </div>

          <div className="stats-card harmless">
            <div className="stats-icon">
              <FaCheckCircle />
            </div>
            <div className="stats-content">
              <h3>Clean</h3>
              <p>0</p>
            </div>
          </div>

          <div className="stats-card timeout">
            <div className="stats-icon">
              <FaClock />
            </div>
            <div className="stats-content">
              <h3>Timeout</h3>
              <p>0</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = currentScan.data.attributes.stats || currentScan.data.attributes.last_analysis_stats;
  const totalScans = Object.values(stats).reduce((sum, val) => sum + val, 0);
  const detectionRate = totalScans > 0 ? Math.round((stats.malicious / totalScans) * 100) : 0;

  const getTrend = () => {
    if (!Array.isArray(scanHistory) || scanHistory.length === 0) return 'stable';
    
    const currentMalicious = stats.malicious || 0;
    const lastMalicious = scanHistory[scanHistory.length - 1]?.stats?.malicious || 0;
  
    const threshold = 0.1 * lastMalicious; 
    if (currentMalicious > lastMalicious + threshold) return 'up';
    if (currentMalicious < lastMalicious - threshold) return 'down';
    
    return 'stable';
  };

  const trend = getTrend();

  return (
    <div className="stats-cards-container">
      <div className="stats-cards-grid">
        <div className="stats-card total">
          <div className="stats-icon">
            <FaChartLine />
          </div>
          <div className="stats-content">
            <h3>Total Scans</h3>
            <p>{totalScans || 0}</p>
          </div>
        </div>
        
        <div className="stats-card malicious">
          <div className="stats-icon">
            <FaShieldVirus />
          </div>
          <div className="stats-content">
            <h3>Malicious</h3>
            <p>{stats.malicious || 0}</p>
            <span className={`trend ${trend}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} 
              {trend !== 'stable' && ` ${detectionRate}%`}
            </span>
          </div>
        </div>
        
        <div className="stats-card suspicious">
          <div className="stats-icon">
            <FaQuestionCircle />
          </div>
          <div className="stats-content">
            <h3>Suspicious</h3>
            <p>{stats.suspicious || 0}</p>
          </div>
        </div>

        <div className="stats-card harmless">
          <div className="stats-icon">
            <FaCheckCircle />
          </div>
          <div className="stats-content">
            <h3>Clean</h3>
            <p>{stats.harmless || 0}</p>
          </div>
        </div>

        <div className="stats-card timeout">
          <div className="stats-icon">
            <FaClock />
          </div>
          <div className="stats-content">
            <h3>Timeout</h3>
            <p>{stats.timeout || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}