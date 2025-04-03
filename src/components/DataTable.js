import React from 'react';
import moment from 'moment';
import './DataTable.css';


export default function DataTable({ currentScan, searchTerm, filter, currentPage, onPageChange,onSelectIp  }) {

  
  if (!currentScan) {
    return (
      <div className="no-data-message">
        <p>No scan data available</p>
      </div>
    );
  }


  const itemsPerPage = 10;
  const results = currentScan.data.attributes.results;


  // Filter and search functionality
  const filteredResults = Object.entries(results).filter(([engine, result]) => {
    const matchesSearch =
      engine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (result.result && result.result.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesFilter = true;
    if (filter === 'malicious') {
      matchesFilter = result.category === 'malicious';
    } else if (filter === 'clean') {
      matchesFilter = result.category === 'harmless';
    }

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Engine</th>
            <th>Category</th>
            <th>Result</th>
            <th>Method</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        

        <tbody>
          {paginatedResults.map(([engine, result]) => (
            <tr key={engine} className={`result-row ${result.category}`}>
              <td>{engine}</td>
              <td>
                <span className={`category-badge ${result.category}`}>
                  {result.category}
                </span>
              </td>
              <td>{result.result || 'N/A'}</td>
              <td>{result.method || 'N/A'}</td>
              <td>{moment(currentScan.data.attributes.date * 1000).format('YYYY-MM-DD HH:mm')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredResults.length === 0 && (
        <div className="no-results-message">
          <p>No results found matching your criteria</p>
        </div>
      )}

      {filteredResults.length > 0 && (
        <div className="pagination-controls">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            <i className="fas fa-chevron-left"></i> Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            Next <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}