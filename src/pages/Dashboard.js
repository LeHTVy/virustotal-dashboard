import React, { useState, useEffect } from 'react';
import useScanStore from '../store/scanStore';
import usePolling from '../hooks/usePolling';
import StatsCards from '../components/StatsCards';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import DetectionBarChart from '../components/charts/DetectionBarChart';
import DataTable from '../components/DataTable';
import IPDetailsTable from '../components/IPDetailsTable';
import FileTypeChart from '../components/charts/FileTypeChart';
import './Dashboard.css';

const Dashboard = () => {
  const [urlToScan, setUrlToScan] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showIpDetails, setShowIpDetails] = useState(false);
  const [selectedIp, setSelectedIp] = useState('');
  const [chartsKey, setChartsKey] = useState(Date.now());
  const [isIpInput, setIsIpInput] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputType, setInputType] = useState('unknown');
  const [isUrlInput, setIsUrlInput] = useState(false);

  const { currentScan, scanHistory, isLoading: isScanLoading, error, fetchScan } = useScanStore();

  const { timeLeft, resetTimer, isLoading: isPolling } = usePolling(() => fetchScan(urlToScan), 60000);

  const checkIfIpInput = (input) => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipRegex.test(input);
  };

  useEffect(() => {
    if (urlToScan.startsWith('http')) {
      setInputType('url');
      setIsUrlInput(true);
      setIsIpInput(false);
    } else if (checkIfIpInput(urlToScan)) {
      setInputType('ip');
      setIsIpInput(true);
      setIsUrlInput(false);
    } else {
      setInputType('unknown');
    }
  }, [urlToScan]);

  useEffect(() => {
    console.log('Current Scan Updated:', currentScan);
    if (currentScan && currentScan.data && currentScan.data.attributes) {
      console.log('Scan Attributes:', currentScan.data.attributes);

      if (isIpInput) {
        setSelectedIp(urlToScan);
        console.log('Using input IP:', urlToScan);
      } else if (isUrlInput) {
        setSelectedIp(urlToScan);
        console.log('Using input URL:', urlToScan);
      } else {
        const ip = extractIpFromScan(currentScan);
        console.log('Extracted IP:', ip);

        if (ip) {
          setSelectedIp(ip);
          console.log('Selected IP set to:', ip);
        }
      }
    }
  }, [currentScan, isIpInput, isUrlInput, urlToScan]);


  const extractIpFromScan = (scan) => {
    try {
      console.log('Trying to extract IP from scan...');

      if (!scan || !scan.data || !scan.data.attributes) {
        console.log('Scan data structure is incomplete');
        return null;
      }
      console.log('Top level data keys:', Object.keys(scan.data));
      console.log('Attributes keys:', Object.keys(scan.data.attributes));

      if (scan.data.attributes.last_http_response_headers) {
        console.log('HTTP Headers:', scan.data.attributes.last_http_response_headers);
        if (scan.data.attributes.last_http_response_headers.x_server) {
          return scan.data.attributes.last_http_response_headers.x_server;
        }
      }

      if (scan.data.attributes.resolution) {
        console.log('Resolution:', scan.data.attributes.resolution);
        if (scan.data.attributes.resolution.ip_address) {
          return scan.data.attributes.resolution.ip_address;
        }
      }

      if (scan.data.attributes.ip_address) {
        return scan.data.attributes.ip_address;
      }

      if (scan.data.attributes.url_hostname) {
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipRegex.test(scan.data.attributes.url_hostname)) {
          return scan.data.attributes.url_hostname;
        }
      }

      if (scan.data.attributes.last_analysis_results) {
        console.log('Last analysis results keys:',
          Object.keys(scan.data.attributes.last_analysis_results));

        const firstResult = Object.values(scan.data.attributes.last_analysis_results)[0];
        if (firstResult && firstResult.ip) {
          return firstResult.ip;
        }
      }

      console.log('No IP found in scan data');
      return null;
    } catch (error) {
      console.error('Lỗi khi trích xuất IP:', error);
      return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    resetTimer();
    setChartsKey(Date.now());
    setShowIpDetails(false);
    fetchScan(urlToScan);
  };

  const showIpDetailsModal = (ip) => {
    if (ip) {
      setSelectedIp(ip);
      setShowIpDetails(true);
      setModalVisible(true); 
    } else {
      setShowIpDetails(!showIpDetails);
      setModalVisible(!modalVisible);
    }
  };

  const showDetailsModal = (input) => {
    if (input) {
      setSelectedIp(input);
      setModalVisible(true);
    }
  };

  const getPlaceholder = () => {
    if (isIpInput) return "Enter IP to scan";
    if (isUrlInput) return "Enter URL to scan";
    return "Enter URL or IP to scan";
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const isLoading = isScanLoading || isPolling;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>VirusTotal Dashboard</h1>
          <p>Real-time URL scanning and threat detection</p>
        </div>
        <div className="header-right">
          <div className="refresh-controls">
            <div className="timer">
              <span>Next refresh in: {timeLeft}</span>
            </div>
            <button
              onClick={() => {
                resetTimer();
                fetchScan(urlToScan);
                setChartsKey(Date.now());
              }}
              disabled={isLoading}
              className="refresh-btn"
            >
              {isLoading ? (
                <><i className="fas fa-spinner fa-spin"></i> Refreshing...</>
              ) : (
                <><i className="fas fa-sync-alt"></i> Refresh Now</>
              )}
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="scan-controls">
        <form onSubmit={handleSubmit} className="scan-form">
          <input
            type="text"
            value={urlToScan}
            onChange={(e) => setUrlToScan(e.target.value)}
            //placeholder={isIpInput ? "Enter IP to scan" : "Enter URL or IP to scan"}
            placeholder={getPlaceholder()}
            className="scan-input"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="scan-btn"
          >
            {isLoading ? (
              <><i className="fas fa-spinner fa-spin"></i> Scanning...</>
            ) : (
              'Scan Now'
            )}
          </button>
        </form>

        {/* IP Details Button */}
        {!isLoading && selectedIp && (
          <button
            type="button"
            onClick={() => showDetailsModal(selectedIp)}
            className="ip-details-btn"
          >
            Show Details
          </button>
        )}
      </div>

      <StatsCards currentScan={currentScan} scanHistory={scanHistory} />

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Scan Activity Over Time</h3>
          <TimeSeriesChart
            data={scanHistory}
            key={`timeseries-${chartsKey}`}
          />
        </div>

        <div className="chart-card">
          <h3>Detection Breakdown</h3>
          <DetectionBarChart
            data={scanHistory}
            key={`detection-${chartsKey}`}
          />
        </div>

        <div className="chart-card">
          <h3>File Type Distribution</h3>
          <FileTypeChart
            currentScan={currentScan}
            key={`filetype-${chartsKey}`}
          />
        </div>
      </div>

      <div className="results-section">
        <div className="results-header">
          <h3>Scan Results</h3>
          <div className="results-controls">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search results..."
              className="search-input"
            />

            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">All Results</option>
              <option value="malicious">Malicious Only</option>
              <option value="clean">Clean Only</option>
            </select>
          </div>
        </div>

        <DataTable
          currentScan={currentScan}
          searchTerm={searchTerm}
          filter={filter}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onSelectIp={showIpDetailsModal}
        />

        {/* Modal Show IP Details */}
        {modalVisible && selectedIp && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
              <h3>{inputType === 'url' ? 'URL' : 'IP'} Details: {selectedIp}</h3>
                <button className="modal-close" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <IPDetailsTable ip={selectedIp} key={selectedIp} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;