import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

interface VerificationResult {
  success: boolean;
  status: string;
  message: string;
  details: any;
}

interface DiscoveryResult {
  success: boolean;
  totalDatasets: number;
  totalTables: number;
  data: any[];
}

export default function ConfigurationStatus() {
  const { data: session } = useSession();
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [discovery, setDiscovery] = useState<DiscoveryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);

  const checkConfiguration = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const response = await axios.get('/api/verify');
      setVerification(response.data);
    } catch (error: any) {
      setVerification(error.response?.data || { 
        success: false, 
        status: 'error', 
        message: 'Failed to verify configuration',
        details: { error: error.message }
      });
    } finally {
      setLoading(false);
    }
  };

  const discoverResources = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const response = await axios.get('/api/discover');
      setDiscovery(response.data);
      setShowDiscovery(true);
    } catch (error: any) {
      console.error('Discovery error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      checkConfiguration();
    }
  }, [session]);

  if (!session) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-50 border-green-200';
      case 'dataset_not_found':
      case 'table_not_found': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'permission_denied': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return '✅';
      case 'dataset_not_found':
      case 'table_not_found': return '⚠️';
      case 'permission_denied': return '❌';
      default: return '🔄';
    }
  };

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          BigQuery Configuration Status
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={discoverResources}
            disabled={loading}
            className="btn-secondary text-sm"
          >
            Discover
          </button>
        </div>
      </div>

      {verification && (
        <div className={`border rounded-lg p-4 ${getStatusColor(verification.status)}`}>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getStatusIcon(verification.status)}</span>
            <span className="font-medium capitalize">{verification.status.replace('_', ' ')}</span>
          </div>
          
          <p className="text-sm mb-3">{verification.message}</p>
          
          {verification.details && (
            <div className="text-sm space-y-1">
              {verification.details.project && (
                <div><strong>Project:</strong> {verification.details.project}</div>
              )}
              {verification.details.dataset && (
                <div><strong>Dataset:</strong> {verification.details.dataset}</div>
              )}
              {verification.details.table && (
                <div><strong>Table:</strong> {verification.details.table}</div>
              )}
              {verification.details.tableRows && (
                <div><strong>Rows:</strong> {verification.details.tableRows}</div>
              )}
              {verification.details.datasetLocation && (
                <div><strong>Dataset Location:</strong> {verification.details.datasetLocation}</div>
              )}
              {verification.details.configuredLocation && (
                <div><strong>Configured Location:</strong> {verification.details.configuredLocation}</div>
              )}
              {verification.details.suggestion && (
                <div className="mt-2 p-2 bg-white/50 rounded">
                  <strong>Suggestion:</strong> {verification.details.suggestion}
                </div>
              )}
              {verification.details.availableTables && (
                <div className="mt-2">
                  <strong>Available Tables:</strong>
                  <ul className="ml-4 mt-1">
                    {verification.details.availableTables.map((table: any, index: number) => (
                      <li key={index} className="text-xs">
                        • {table.id} ({table.schema} fields)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showDiscovery && discovery && (
        <div className="mt-4 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-800">Discovered Resources</h3>
            <button
              onClick={() => setShowDiscovery(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="text-sm text-gray-600 mb-3">
            Found {discovery.totalDatasets} datasets with {discovery.totalTables} tables
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-3">
            {discovery.data.map((item, index) => (
              <div key={index} className="border border-gray-100 rounded p-3">
                <div className="font-medium text-sm">
                  {item.project}.{item.dataset}
                  <span className="ml-2 text-xs text-gray-500">
                    ({item.location})
                  </span>
                </div>
                
                {item.error ? (
                  <div className="text-xs text-red-600 mt-1">{item.error}</div>
                ) : (
                  <div className="mt-2 space-y-1">
                    {item.tables.slice(0, 5).map((table: any, tableIndex: number) => (
                      <div key={tableIndex} className="text-xs text-gray-600 ml-2">
                        • {table.id} 
                        {table.rows && (
                          <span className="ml-1 text-gray-500">
                            ({table.rows} rows, {table.schemaFields} fields)
                          </span>
                        )}
                        {table.error && (
                          <span className="ml-1 text-red-500">- {table.error}</span>
                        )}
                      </div>
                    ))}
                    {item.tables.length > 5 && (
                      <div className="text-xs text-gray-500 ml-2">
                        ... and {item.tables.length - 5} more tables
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}