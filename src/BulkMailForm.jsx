import React, { useState, useCallback } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

export default function BulkMailForm() {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [emails, setEmails] = useState([]);
  const [sending, setSending] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Handle file processing
  const processFile = (file) => {
    if (!file) return;
    
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid Excel or CSV file');
      return;
    }

    setFileUploaded(false);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const extracted = data
        .map((row) => row[0])
        .filter((v) => v && v.includes("@"));
      setEmails(extracted);
      setFileUploaded(true);
    };
    reader.readAsArrayBuffer(file);
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      processFile(files[0]);
    }
  }, []);

  // Regular file input handler
  const handleFileUpload = (e) => {
    processFile(e.target.files[0]);
  };

  const sendEmails = async () => {
    if (emails.length === 0) {
      alert("No emails loaded!");
      return;
    }
    if (!subject || !message) {
      alert("Subject and message are required!");
      return;
    }

    setSending(true);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/send-bulk`, {
        recipients: emails,
        subject,
        message,
      });
      alert("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("There was an error sending the email.");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendEmails();
  };

  return (
    <div className="w-full max-w-4xl bg-white dark:bg-gray-800 text-black dark:text-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6 transition-all duration-300">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Input */}
        <div className="space-y-2">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            placeholder="Enter email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 transition duration-200 hover:border-blue-400 focus:border-blue-500"
            required
          />
        </div>

        {/* Message Box */}
        <div className="space-y-2">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your email content here..."
            className="w-full h-48 sm:h-56 py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 resize-none transition duration-200 hover:border-blue-400 focus:border-blue-500"
            required
          />
        </div>

        {/* File Upload with Drag and Drop */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recipient List
          </label>
          <div 
            className={`flex flex-col items-center justify-center border-2 border-dashed ${
              isDragging ? 'border-blue-500 bg-blue-100 dark:bg-gray-600' : 
              fileUploaded ? 'border-green-500' : 'border-blue-300'
            } rounded-xl p-6 bg-blue-50 dark:bg-gray-700 transition duration-200`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <svg
                className={`mx-auto h-12 w-12 ${
                  isDragging ? 'text-blue-500' :
                  fileUploaded ? 'text-green-500' : 'text-blue-400'
                } transition duration-200`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div className="mt-4 flex flex-col items-center text-sm text-gray-600 dark:text-gray-300">
                {isDragging ? (
                  <span className="text-blue-500 font-medium">Drop your file here</span>
                ) : (
                  <>
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white dark:bg-gray-600 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 transition duration-200"
                    >
                      <span>Select a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        onChange={handleFileUpload}
                        className="sr-only"
                        accept=".xlsx,.xls,.csv"
                        required
                      />
                    </label>
                    <p className="mt-2">or drag and drop Excel/CSV here</p>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Only Excel (.xlsx, .xls) or CSV files accepted
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
            Total Emails Loaded: <strong className="text-blue-600 dark:text-blue-400">{emails.length}</strong>
          </p>
        </div>

        {/* Send Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={sending}
            className={`relative px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              sending
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 shadow-md hover:shadow-lg'
            }`}
          >
            {sending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send Emails'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}