import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import BulkMailForm from "./BulkMailForm";
import EmailHistory from "./EmailHistory";
import "./App.css";

// Main layout
function AppContent() {
  const [showHistory, setShowHistory] = useState(false);
  const location = useLocation();
  const isLoginOrOtp = false; // No login, always show header/footer

  const handleViewHistoryClick = () => {
    setShowHistory(true);
  };

  return (
    <div className="text-center">
      {/* Header */}
      {!isLoginOrOtp && (
        <header className="py-6 bg-blue-950 text-white">
          <h2 className="text-3xl font-bold">
            Abishek S (MCA) – Bulk Mail Sender
          </h2>
          <p className="italic mt-2 text-sm">
            "Technology is best when it brings people together." – Matt
            Mullenweg
          </p>
          <div className="mt-4 space-x-4">
            <button
              onClick={() => setShowHistory(false)}
              className={`px-4 py-2 rounded ${
                !showHistory
                  ? "bg-white text-blue-700"
                  : "bg-blue-700 text-white"
              }`}
            >
              Send Email
            </button>
            <button
              onClick={handleViewHistoryClick}
              className={`px-4 py-2 rounded ${
                showHistory
                  ? "bg-white text-blue-700"
                  : "bg-blue-700 text-white"
              }`}
            >
              View History
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main
        className={
          isLoginOrOtp
            ? "flex justify-center py-8"
            : "flex justify-center px-4 py-8"
        }
      >
        <Routes>
          <Route
            path="/"
            element={showHistory ? <EmailHistory /> : <BulkMailForm />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      {!isLoginOrOtp && (
        <footer className="text-sm text-gray-300 mt-10 pb-4">
          &copy; {new Date().getFullYear()} Bulk Mail Sender
        </footer>
      )}
    </div>
  );
}

// Root component
function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
