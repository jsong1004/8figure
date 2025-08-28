import { useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '@/components/Layout';
import TabNavigation from '@/components/TabNavigation';
import QueryInput from '@/components/QueryInput';
import ExampleQueries from '@/components/ExampleQueries';
import MetricsGrid from '@/components/MetricsGrid';
import DataTable from '@/components/DataTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import { QueryMode, QueryResult, MetricsResponse } from '@/types';

export default function Home() {
  const { data: session, status } = useSession();
  const [activeMode, setActiveMode] = useState<QueryMode>('nl');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [selectedDays, setSelectedDays] = useState(30);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <Layout>
        <div className="card">
          <LoadingSpinner message="Loading..." />
        </div>
      </Layout>
    );
  }

  // Show sign in message if not authenticated
  if (!session) {
    return (
      <Layout>
        <div className="text-center">
          <div className="card max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Authentication Required
              </h2>
              <p className="text-gray-600 mb-4">
                Please sign in with your Google account to access your BigQuery data.
              </p>
            </div>

            <button
              onClick={() => window.location.href = '/auth/signin'}
              className="btn w-full"
            >
              Sign In with Google
            </button>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>You'll need access to the BigQuery project: <strong>ai-biz-6b7ec</strong></p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const handleNLQuery = async (query: string) => {
    setIsLoading(true);
    setResults(null);
    setMetricsData(null);

    try {
      const response = await axios.post<QueryResult>('/api/query/nl', { query });
      
      if (response.data.success) {
        setResults(response.data);
        toast.success(`Found ${response.data.rowCount} results`);
      } else {
        toast.error(response.data.error || 'Query failed');
      }
    } catch (error: any) {
      console.error('NL Query error:', error);
      const errorData = error.response?.data;
      
      if (errorData?.code === 'SESSION_INVALID' || errorData?.code === 'TOKEN_EXPIRED') {
        toast.error('Session expired. Redirecting to reset...');
        setTimeout(() => {
          window.location.href = '/auth/reset';
        }, 1500);
      } else {
        toast.error(errorData?.error || 'Network error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSQLQuery = async (sql: string) => {
    setIsLoading(true);
    setResults(null);
    setMetricsData(null);

    try {
      const response = await axios.post<QueryResult>('/api/query/sql', { sql });
      
      if (response.data.success) {
        setResults(response.data);
        toast.success(`Found ${response.data.rowCount} results`);
      } else {
        toast.error(response.data.error || 'Query failed');
      }
    } catch (error: any) {
      console.error('SQL Query error:', error);
      const errorData = error.response?.data;
      
      if (errorData?.code === 'SESSION_INVALID' || errorData?.code === 'TOKEN_EXPIRED') {
        toast.error('Session expired. Redirecting to reset...');
        setTimeout(() => {
          window.location.href = '/auth/reset';
        }, 1500);
      } else {
        toast.error(errorData?.error || 'Network error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetricsQuery = async (days: number = selectedDays) => {
    setIsLoading(true);
    setResults(null);
    setMetricsData(null);

    try {
      const response = await axios.get<MetricsResponse>(`/api/metrics/overview?days=${days}`);
      
      if (response.data.success) {
        setMetricsData(response.data);
        toast.success(`Loaded metrics for ${response.data.period}`);
      } else {
        toast.error(response.data.error || 'Metrics query failed');
      }
    } catch (error: any) {
      console.error('Metrics query error:', error);
      const errorData = error.response?.data;
      
      if (errorData?.code === 'SESSION_INVALID' || errorData?.code === 'TOKEN_EXPIRED') {
        toast.error('Session expired. Redirecting to reset...');
        setTimeout(() => {
          window.location.href = '/auth/reset';
        }, 1500);
      } else {
        toast.error(errorData?.error || 'Network error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (query: string) => {
    switch (activeMode) {
      case 'nl':
        handleNLQuery(query);
        break;
      case 'sql':
        handleSQLQuery(query);
        break;
      case 'metrics':
        handleMetricsQuery();
        break;
    }
  };

  const handleModeChange = (mode: QueryMode) => {
    setActiveMode(mode);
    setResults(null);
    setMetricsData(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Toaster position="top-right" />
        
        
        {/* Main Query Interface */}
        <div className="card">
          <TabNavigation activeMode={activeMode} onModeChange={handleModeChange} />
          
          <div className="pt-6">
            {activeMode === 'nl' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Ask a Question
                  </h2>
                  <QueryInput
                    mode={activeMode}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                  />
                </div>
                
                <ExampleQueries onSelectQuery={handleNLQuery} />
              </div>
            )}

            {activeMode === 'sql' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  SQL Query
                </h2>
                <QueryInput
                  mode={activeMode}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              </div>
            )}

            {activeMode === 'metrics' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Quick Metrics Overview
                </h2>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedDays}
                    onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                    className="input-field w-48"
                    disabled={isLoading}
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={60}>Last 60 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                  <button
                    onClick={() => handleMetricsQuery(selectedDays)}
                    disabled={isLoading}
                    className="btn"
                  >
                    {isLoading ? 'Loading...' : 'Get Metrics'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="card">
            <LoadingSpinner message="Processing your query..." />
          </div>
        )}

        {/* Results Display */}
        {!isLoading && metricsData && (
          <div className="card">
            <MetricsGrid 
              metrics={metricsData.metrics} 
              period={metricsData.period} 
            />
          </div>
        )}

        {!isLoading && results && results.results && (
          <div className="card">
            <DataTable 
              data={results.results} 
              sql={results.sql}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}