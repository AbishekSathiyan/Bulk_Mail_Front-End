import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function EmailHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usedEndpoint, setUsedEndpoint] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try the most common endpoint
        let endpoint = '/api/email-history';
        let response = await tryEndpoint(endpoint);
        
        // If first attempt fails, try alternatives
        if (!response) {
          endpoint = '/api/history';
          response = await tryEndpoint(endpoint);
        }
        
        if (!response) {
          endpoint = '/api/sent-emails';
          response = await tryEndpoint(endpoint);
        }
        
        if (!response) {
          endpoint = '/emails';
          response = await tryEndpoint(endpoint);
        }
        
        if (!response) {
          throw new Error('No working email history endpoint found');
        }
        
        // Process successful response
        setUsedEndpoint(endpoint);
        const data = response.data.history || response.data.emails || response.data;
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }
        
        setHistory(data);
        
      } catch (err) {
        console.error('History fetch error:', err);
        setError(err.response?.data?.message || 
                err.message || 
                'Failed to load history. Please check backend connection.');
      } finally {
        setLoading(false);
      }
    };

    const tryEndpoint = async (endpoint) => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}${endpoint}`,
          {
            headers: {
              'Content-Type': 'application/json',
              // Add authorization if needed
              // 'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            timeout: 5000 // 5 second timeout
          }
        );
        return response;
      } catch (err) {
        console.log(`Endpoint ${endpoint} failed, trying next...`);
        return null;
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        {usedEndpoint && (
          <p className="mt-2 text-sm">Last tried endpoint: {usedEndpoint}</p>
        )}
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No email history found</h3>
        {usedEndpoint && (
          <p className="mt-1 text-sm text-gray-500">
            Using endpoint: {usedEndpoint}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="text-sm text-gray-500 mb-2">
        Showing data from: {usedEndpoint}
      </div>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {/* Table contents same as before */}
      </table>
    </div>
  );
}