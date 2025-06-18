import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

export default function BulkMailForm() {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [emails, setEmails] = useState([]);
  const [sending, setSending] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const extracted = data
        .map((row) => row[0])
        .filter((v) => v && v.includes("@"));
      setEmails(extracted);
    };
    reader.readAsArrayBuffer(file);
  };

  const send = () => {
    if (emails.length === 0) return alert("No emails loaded!");
    if (!subject || !message) return alert("Subject and message are required!");

    setSending(true);
    axios
      .post("http://localhost:5000/api/send-bulk", {
        recipients: emails,
        subject,
        message,
      })
      .then(() => alert("Email sent successfully!"))
      .catch(() => alert("There was an error sending the email."))
      .finally(() => setSending(false));
  };

  return (
    <div className="w-full max-w-4xl bg-white text-black rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
      {/* Header section */}
     

      {/* Subject Input */}
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Message Box */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your email content"
        className="w-full h-36 sm:h-40 py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />

      {/* File Upload */}
      <div className="flex flex-col items-center border-2 border-dashed border-blue-300 py-6 px-4 rounded-md bg-blue-50">
        <input
          type="file"
          onChange={handleFileUpload}
          className="text-sm text-blue-700 cursor-pointer"
        />
        <p className="mt-2 text-sm text-gray-700">
          Total Emails Loaded: <strong>{emails.length}</strong>
        </p>
      </div>

      {/* Send Button */}
      <div className="flex justify-center">
        <button
          onClick={send}
          disabled={sending}
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-md transition duration-200 disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send Emails"}
        </button>
      </div>
    </div>
  );
}
