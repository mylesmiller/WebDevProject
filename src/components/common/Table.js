import React, { useState } from 'react';
import { searchFilter } from '../../utils/helpers';
import '../../styles/dashboard.css';

const Table = ({ columns, data, searchFields = [], emptyMessage = 'No data available' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = searchTerm
    ? data.filter(item => searchFilter(item, searchTerm, searchFields))
    : data;

  return (
    <div>
      {searchFields.length > 0 && (
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-state">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
