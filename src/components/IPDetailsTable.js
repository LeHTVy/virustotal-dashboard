import React, { useState, useEffect, useRef } from 'react';
import { scanIP, scanUrl } from '../api/virusTotal';
import './IPDetailsTable.css';

const IPDetailsTable = ({ ip, isUrl = false }) => {
  const [ipDetails, setIpDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const previousInputRef = useRef('');

  useEffect(() => {
    const fetchDetails = async () => {
      if (!ip) {
        console.log('IPDetailsTable: No input provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`IPDetailsTable: Fetching details for ${isUrl ? 'URL' : 'IP'}: ${ip}`);

        let details;
        if (isUrl) {
          details = await scanUrl(ip);
        } else {
          // Kiểm tra nếu là URL chứa IP thay vì IP thuần túy
          if (ip.startsWith('http') && !isValidIP(extractHostFromUrl(ip))) {
            details = await scanUrl(ip);
          } else {
            // Trích xuất IP từ URL nếu cần
            const inputToScan = ip.startsWith('http') ? extractHostFromUrl(ip) : ip;
            if (!isValidIP(inputToScan)) {
              throw new Error(`Invalid IP address format: ${inputToScan}`);
            }
            details = await scanIP(inputToScan);
          }
        }

        console.log(`IPDetailsTable: API response for ${isUrl ? 'URL' : 'IP'} ${ip}:`, details);

        setIpDetails(details);
      } catch (error) {
        console.error(`Error fetching details for ${isUrl ? 'URL' : 'IP'} ${ip}:`, error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (ip && ip !== previousInputRef.current) {
      fetchDetails();
      previousInputRef.current = ip;
    }
  }, [ip, isUrl]);

  // Hàm kiểm tra định dạng IP hợp lệ
  const isValidIP = (ip) => {
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Pattern.test(ip)) return false;

    const octets = ip.split('.');
    return octets.every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  };

  // Hàm trích xuất host từ URL
  const extractHostFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="ip-details-loading">
        <i className="fas fa-spinner fa-spin"></i> Loading information for {isUrl ? 'URL' : 'IP'}: {ip}...
      </div>
    );
  }

  if (error) {
    return (
      <div className="ip-details-error">
        <i className="fas fa-exclamation-circle"></i> Error: {error}
      </div>
    );
  }

  if (!ipDetails || !ipDetails.data) {
    return (
      <div className="ip-details-empty">
        No detailed information available for {isUrl ? 'URL' : 'IP'}: {ip}
      </div>
    );
  }

  const returnedIp = ipDetails.data.id;
  const ipMismatch = ip !== returnedIp;

  const renderAnalysisStats = () => {
    const stats = ipDetails.data.attributes?.stats || {};

    if (Object.keys(stats).length === 0) {
      return <p>No analysis statistics available.</p>;
    }

    return (
      <div className="analysis-stats">
        <h4>Analysis Statistics</h4>
        <div className="stats-grid">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className={`stat-item ${key.toLowerCase()}`}>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{formatStatLabel(key)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAnalysisResults = () => {
    const results = ipDetails.data.attributes?.results || {};

    if (Object.keys(results).length === 0) {
      return <p>No analysis results from engines.</p>;
    }

    return (
      <div className="analysis-results">
        <h4>Analysis Results</h4>
        <div className="results-list">
          {Object.entries(results).map(([engine, data]) => (
            <div key={engine} className={`result-item ${data.category}`}>
              <div className="result-engine">{engine}</div>
              <div className="result-value">{data.result}</div>
              <div className="result-category">
                <span className={`category-badge ${data.category}`}>
                  {formatCategory(data.category)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const formatCategory = (category) => {
    switch (category) {
      case 'harmless': return 'Harmless';
      case 'malicious': return 'Malicious';
      case 'suspicious': return 'Suspicious';
      case 'undetected': return 'Undetected';
      case 'timeout': return 'Timeout';
      default: return category;
    }
  };

  const formatStatLabel = (label) => {
    switch (label) {
      case 'harmless': return 'Harmless';
      case 'malicious': return 'Malicious';
      case 'suspicious': return 'Suspicious';
      case 'undetected': return 'Undetected';
      case 'timeout': return 'Timeout';
      default: return label;
    }
  };

  const renderWhoisInfo = () => {
    const whois = ipDetails.data.attributes?.whois;

    if (!whois) {
      return <p>No WHOIS information available.</p>;
    }

    return (
      <div className="whois-info">
        <h4>WHOIS Information</h4>
        <div className="whois-content">
          <pre>{whois}</pre>
        </div>
      </div>
    );
  };

  return (
    <div className="ip-details-container">
      <div className="ip-header">
        <h3>{isUrl ? 'URL' : 'IP'} Details: {ip}</h3>
        <div className="ip-badge">{isUrl ? 'URL' : 'IP Address'}</div>
        {ipMismatch && (
          <div className="ip-warning">
            <i className="fas fa-exclamation-triangle"></i>
            <span>
              Warning: Requested {isUrl ? 'URL' : 'IP'} (<span className="hash-id">{ip}</span>)
              differs from returned data (<span className="hash-id">{returnedIp}</span>)
            </span>
          </div>
        )}
      </div>

      {renderAnalysisStats()}

      {renderAnalysisResults()}

      {renderWhoisInfo()}

      <div className="raw-data">
        <details>
          <summary>Raw Data</summary>
          <pre>{JSON.stringify(ipDetails, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

export default IPDetailsTable;
