import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(false);
  const [emails, setEmails] = useState([]); // State to store emails
  const [subject, setSubject] = useState(""); // State to store the email subject

  // Function to handle message input changes
  function handleMessage(e) {
    setMessage(e.target.value);
  }

  // Function to handle subject input changes
  function handleSubject(e) {
    setSubject(e.target.value);
  }

  // Handle file upload and read the Excel file
  function handleFileUpload(e) {
    const file = e.target.files[0]; // Get the file from the input element

    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const arrayBuffer = event.target.result;
        const binaryString = new Uint8Array(arrayBuffer).reduce(
          (acc, byte) => acc + String.fromCharCode(byte),
          ""
        );
        const wb = XLSX.read(binaryString, { type: "binary" });

        // Assuming the emails are in the first sheet
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Extract emails from the first column (adjust if needed)
        const emailsList = data.map((row) => row[0]);

        // Filter out any empty or invalid email values
        const validEmails = emailsList.filter(
          (email) => email && email.includes("@")
        );

        setEmails(validEmails); // Store valid emails in the state
        console.log("Extracted Emails:", validEmails);
      };

      reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
    }
  }

  // Function to send the email to the backend
  function send() {
    setStatus(true); // Set the status to "Sending Mail..." when starting
    axios
      .post("https://bulk-mail-back-end.vercel.app/send-bulk", {
        recipients: emails,
        subject: subject,
        message: message,
      })
      .then((response) => {
        console.log("Email sent successfully:", response);
        setStatus(false); // Set status to false when done
        alert("Email sent successfully!"); // Show success alert
      })
      .catch((error) => {
        console.error("There was an error sending the email:", error);
        setStatus(false); // Reset status to false in case of error
        alert("There was an error sending the email."); // Show error alert
      });
  }

  return (
    <div>
      <div className="bg-blue-950 text-white text-center p-4">
        <h1 className="text-2xl font-bold">Bulk Mail</h1>
      </div>

      <div className="bg-blue-800 text-white text-center p-4">
        <h1 className="text-2xl font-medium">
          We can help your Business with sending multiple emails at once
        </h1>
      </div>

      <div className="bg-blue-600 text-white text-center p-4">
        <h1 className="text-2xl font-medium">Drag and Drop</h1>
      </div>

      <div className="bg-blue-400 flex flex-col items-center text-center text-black px-5 py-3">
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={handleSubject}
          className="w-[80%] py-2 outline-none px-2 border-black rounded-md placeholder:text-gray-500"
        />
        <textarea
          onChange={handleMessage}
          value={message}
          className="w-[80%] h-32 py-2 outline-none px-2 border-black rounded-md placeholder:text-gray-500 mt-4"
          placeholder="Enter the Email Content"
        ></textarea>
        <div>
          <input
            type="file"
            className="border-4 border-dashed py-4 px-4 mt-5 mb-5"
            onChange={handleFileUpload}
          />
        </div>
        <p>Total Emails in the File: {emails.length}</p>
        <button
          onClick={send}
          className="bg-blue-600 py-2 px-2 mt-2 text-white font-medium rounded-md w-fit"
        >
          {status ? "Sending Mail..." : "Send"}
        </button>
      </div>

      <div className="bg-blue-300 text-white text-center p-12"></div>
      <div className="bg-blue-200 text-white text-center p-10"></div>
    </div>
  );
}

export default App;
