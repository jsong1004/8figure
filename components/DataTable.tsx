import { useState } from 'react';

interface DataTableProps {
  data: any[];
  sql?: string;
}

export default function DataTable({ data, sql }: DataTableProps) {
  const [showSQL, setShowSQL] = useState(false);
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data found
      </div>
    );
  }

  const headers = Object.keys(data[0]);
  
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    
    // Handle BigQuery date/datetime objects
    if (value && typeof value === 'object' && value.value) {
      return value.value.toString();
    }
    
    // Format numbers
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(2) + 'M';
      } else if (value >= 1000) {
        return (value / 1000).toFixed(2) + 'K';
      } else if (value % 1 !== 0) {
        return value.toFixed(2);
      }
    }
    
    return value.toString();
  };

  const isNumeric = (value: any): boolean => {
    if (value && typeof value === 'object' && value.value) {
      return !isNaN(parseFloat(value.value));
    }
    return typeof value === 'number' && !isNaN(value);
  };

  const downloadJSON = () => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `query-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-700">Results</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={downloadJSON}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 
                       border border-gray-300 rounded-md transition-colors duration-200"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <span>Download JSON</span>
          </button>
          {sql && (
            <button
              onClick={() => setShowSQL(!showSQL)}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 
                         border border-gray-300 rounded-md transition-colors duration-200"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" 
                />
              </svg>
              <span>{showSQL ? 'Hide SQL' : 'Show SQL'}</span>
            </button>
          )}
        </div>
      </div>
      
      {sql && showSQL && (
        <div className="bg-gray-50 border-l-4 border-primary-500 p-4 rounded">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Generated SQL</h4>
          <pre className="text-sm text-gray-600 font-mono whitespace-pre-wrap overflow-x-auto">
            {sql}
          </pre>
        </div>
      )}
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr 
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {headers.map((header) => (
                    <td
                      key={header}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isNumeric(row[header])
                          ? 'text-right font-medium text-gray-900'
                          : 'text-gray-900'
                      }`}
                    >
                      {formatValue(row[header])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing <strong>{data.length}</strong> results
          </div>
        </div>
      </div>
    </div>
  );
}