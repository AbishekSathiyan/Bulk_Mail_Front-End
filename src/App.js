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
import LoginPage from "./Login";
import "./App.css";

// Auth wrapper for protected routes
function PrivateRoute({ children }) {
  const isAuth = sessionStorage.getItem("isAuth") === "true";
  return isAuth ? children : <Navigate to="/login" replace />;
}

// Main layout
function AppContent() {
  const [showHistory, setShowHistory] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const location = useLocation();
  const isLoginOrOtp =
    location.pathname === "/login" || location.pathname === "/otp";

  const generateOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    setGeneratedOtp(newOtp);
    console.log("Generated OTP:", newOtp); // For testing
    setShowOtpVerification(true);
    return newOtp;
  };

  const verifyOtp = () => {
    if (parseInt(otp) === generatedOtp) {
      setShowOtpVerification(false);
      setShowHistory(true);
    } else {
      alert("Invalid OTP. Access Denied");
      // Speech synthesis for "Access Denied"
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance("Access Denied");
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    }
  };

  const handleViewHistoryClick = () => {
    generateOtp();
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
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                {showHistory ? <EmailHistory /> : <BulkMailForm />}
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* OTP Verification Modal for History */}
      {showOtpVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">OTP Verification</h3>
            <p className="mb-2">Enter OTP to view history</p>
            <input
              type="number"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full py-2 px-3 rounded-md border border-gray-300 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowOtpVerification(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={verifyOtp}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

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
