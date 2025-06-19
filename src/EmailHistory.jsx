import React, { useEffect, useState } from "react";
import axios from "axios";

const LIMIT = 10;

export default function EmailHistory() {
  const [emails, setEmails] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null); // ID of the email to expand

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/history`,
          {
            params: {
              page,
              limit: LIMIT,
              status: status || undefined,
              search: search || undefined,
            },
          }
        );
        setEmails(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, status, search]);

  const refresh = () => setPage(1);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Mail History</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            refresh();
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="partial">Partial</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>

        <input
          type="text"
          placeholder="Search subject / recipient"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            refresh();
          }}
          className="border px-3 py-2 rounded flex-1"
        />
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : emails.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border rounded">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Subject</th>
                <th className="p-3 text-center">Count</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <React.Fragment key={email._id}>
                  <tr className="border-t">
                    <td className="p-3">
                      {new Date(email.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 max-w-xs truncate">{email.subject}</td>
                    <td className="p-3 text-center">{email.recipientCount}</td>
                    <td className="p-3 capitalize">
                      <span
                        className={
                          email.status === "sent"
                            ? "text-green-600"
                            : email.status === "partial"
                            ? "text-yellow-600"
                            : email.status === "failed"
                            ? "text-red-600"
                            : "text-gray-600"
                        }
                      >
                        {email.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() =>
                          setOpenId(openId === email._id ? null : email._id)
                        }
                        className="text-blue-600 underline"
                      >
                        {openId === email._id ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {openId === email._id && (
                    <tr className="bg-gray-50 border-t">
                      <td colSpan="5" className="p-4">
                        <h4 className="font-semibold mb-2">Recipients</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {email.recipients.map((r, idx) => (
                            <li key={idx}>
                              <span className="font-medium">{r.email}</span>{" "}
                              –{" "}
                              <span
                                className={
                                  r.status === "sent"
                                    ? "text-green-600"
                                    : r.status === "failed"
                                    ? "text-red-600"
                                    : "text-gray-600"
                                }
                              >
                                {r.status}
                              </span>{" "}
                              {r.sentAt && (
                                <span className="ml-2 text-gray-500">
                                  ({new Date(r.sentAt).toLocaleTimeString()})
                                </span>
                              )}
                              {r.error && (
                                <span className="ml-2 text-red-500">
                                  Error: {r.error}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page <strong>{page}</strong> / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
