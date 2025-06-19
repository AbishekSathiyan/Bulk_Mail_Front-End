import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiRefreshCw, FiMail, FiClock, FiUsers, FiAlertCircle } from "react-icons/fi";

export default function EmailHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL || 'https://bulk-mail-back-end-q0zk.onrender.com'}/api/history`
      );
      
      if (Array.isArray(res.data)) {
        setHistory(res.data);
      } else {
        throw new Error("Unexpected API response format");
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(err.message || "Failed to load email history");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-4xl mx-auto">
      <div className="flex items-center">
        <FiAlertCircle className="text-red-500 mr-2" size={20} />
        <div>
          <p className="font-medium text-red-800">Error loading history</p>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
      <button 
        onClick={fetchHistory}
        className="mt-3 flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <FiRefreshCw className="mr-2" /> Try Again
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FiMail className="mr-2" /> Email History
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              All your sent email campaigns
            </p>
          </div>
          <button
            onClick={fetchHistory}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiRefreshCw className="mr-2" /> Refresh
          </button>
        </div>
        
        {history.length === 0 ? (
          <div className="text-center py-12">
            <FiMail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No emails sent yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by sending your first email campaign.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {history.map((mail) => (
              <div key={mail._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {mail.subject || 'No subject'}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FiClock className="mr-1" /> 
                    {new Date(mail.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <FiUsers className="mr-1.5" size={16} />
                  <span>
                    Sent to {mail.recipients?.length || 0} recipients
                  </span>
                </div>
                
                <div className="mt-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Recipients:</span> {mail.recipients?.join(', ') || 'None'}
                  </div>
                </div>
                
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Delivered
                  </span>
                  <span className="ml-2">
                    {new Date(mail.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}