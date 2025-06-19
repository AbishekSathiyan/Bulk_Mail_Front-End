import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ onAuthSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  const validPassword = process.env.REACT_APP_VALID_PASSWORD || "defaultPassword123";
  const validEmail = "abishek.sathiyan.2002@gmail.com";

  const navigate = useNavigate();

  useEffect(() => {
    const handleVoicesChanged = () => setVoicesLoaded(true);
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

    if (window.speechSynthesis.getVoices().length > 0) {
      setVoicesLoaded(true);
    }
    return () => (window.speechSynthesis.onvoiceschanged = null);
  }, []);

  const speak = (msg) => {
    if (!voicesLoaded) return;
    const u = new SpeechSynthesisUtterance(msg);
    u.rate = 0.9;
    u.pitch = 1.2;
    const female = window.speechSynthesis
      .getVoices()
      .find((v) => ["Female", "woman", "Zira", "Samantha"].some((k) => v.name.includes(k)));
    if (female) u.voice = female;
    window.speechSynthesis.speak(u);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const okEmail = email === validEmail;
      const okPass = password === validPassword;

      if (okEmail && okPass) {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);
        console.log("Generated OTP:", newOtp);
        setShowOtp(true);
        speak("Email and password verified. Please enter the OTP sent.");
      } else {
        const err = !okEmail ? "Invalid email address" : "Invalid password";
        setErrorMessage(err);
        setShowError(true);
        speak(`Access denied. ${err}.`);
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleOtpVerify = () => {
    if (otp === generatedOtp) {
      sessionStorage.setItem("isAuth", "true");
      navigate("/", { replace: true });
    } else {
      setErrorMessage("Incorrect OTP");
      setShowError(true);
      speak("Incorrect OTP entered.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-poppins relative">
      {/* Error Popup */}
      {showError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md z-50 animate-fade-in">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-md p-4 shadow-lg">
            <div className="flex">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
                <p className="mt-2 text-sm text-red-700">
                  {errorMessage}. Please try again.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    setShowError(false);
                  }}
                  className="mt-4 text-sm font-medium text-red-800 hover:text-red-700"
                >
                  Dismiss
                </button>
              </div>
              <button
                onClick={() => {
                  window.speechSynthesis.cancel();
                  setShowError(false);
                }}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Box */}
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-lg rounded-xl p-6 sm:p-10">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center text-gray-800 mb-2">
          Welcome back Abishek
        </h2>
        <p className="text-center text-gray-500 mb-8">Sign in to your account</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            required
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-2.5 px-3 rounded-md border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2.5 px-3 pr-10 rounded-md border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {!showOtp && (
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          )}
        </form>

        {/* OTP Section */}
        {showOtp && (
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700 text-center">
              Enter the 6-digit OTP
            </label>
            <OtpInput length={6} value={otp} onChange={setOtp} />
            <button
              onClick={handleOtpVerify}
              className="w-full py-2.5 rounded-md text-white font-medium bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition"
            >
              Verify OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───── Internal Component ───── */
function OtpInput({ length = 6, value, onChange }) {
  const inputs = useRef([]);

  const handleChange = (val, index) => {
    const otpArr = value.split("");
    otpArr[index] = val.slice(-1);
    const newOtp = otpArr.join("");
    onChange(newOtp);

    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-10 h-12 border border-gray-300 rounded text-center text-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />
      ))}
    </div>
  );
}
