import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EmailHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/history`)
      .then((res) => setHistory(res.data))
      .catch((err) => console.error("Error fetching history", err));
  }, []);

  return (
    <div className="w-full max-w-6xl bg-white text-black rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-blue-800">
        Sent Email History
      </h2>
      {history.length === 0 ? (
        <p className="text-gray-500">No emails sent yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="p-2 text-left">Subject</th>
                <th className="p-2 text-left">Content</th>
                <th className="p-2 text-left">Recipients</th>
                <th className="p-2 text-left">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 align-top">
                  <td className="p-2 font-medium">{item.subject}</td>
                  <td className="p-2 max-w-xs whitespace-pre-wrap break-words">
                    {item.content}
                  </td>
                  <td className="p-2">
                    <div className="font-semibold text-blue-700 mb-1">
                      {item.recipients.length} user(s)
                    </div>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {item.recipients.map((email, i) => (
                        <li key={i}>{email}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-2 text-gray-600">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
