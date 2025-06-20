// EmailHistory.jsx – full‑feature version (export CSV, sort, chart, archive & delete)
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const LIMIT = 10;
const BASE = process.env.REACT_APP_API_URL; // e.g. http://localhost:5000/api
const STATUS_COLORS = {
  sent: "#22c55e", // green‑500
  partial: "#eab308", // yellow‑500
  failed: "#ef4444", // red‑500
  pending: "#6b7280", // gray‑500
};

export default function EmailHistory() {
  /* ------------------------------ state --------------------------------- */
  const [emails, setEmails] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotal] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ field: "createdAt", dir: "desc" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  /* --------------------------- data fetch -------------------------------- */
  const fetchData = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${BASE}/history`, {
          signal,
          params: {
            page,
            limit: LIMIT,
            ...(status && { status }),
            ...(search && { search }),
          },
        });
        let items = data.data;
        // client‑side sort (easy to move server‑side later)
        items = items.sort((a, b) => {
          const dir = sort.dir === "asc" ? 1 : -1;
          if (sort.field === "subject")
            return a.subject.localeCompare(b.subject) * dir;
          if (sort.field === "status")
            return a.status.localeCompare(b.status) * dir;
          // default date
          return (new Date(a.createdAt) - new Date(b.createdAt)) * dir;
        });
        setEmails(items);
        setTotal(data.pagination?.totalPages || 1);
      } catch (err) {
        if (axios.isCancel(err)) return;
        const msg = err.response?.data?.error || "Request failed";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [page, status, search, sort]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    fetchData(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchData]);

  const resetPage = () => setPage(1);

  /* --------------------------- helpers ----------------------------------- */
  const statusStats = useMemo(() => {
    const stats = { sent: 0, partial: 0, failed: 0, pending: 0 };
    emails.forEach((m) => stats[m.status]++);
    return Object.entries(stats)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: k, value: v, fill: STATUS_COLORS[k] }));
  }, [emails]);

  const exportCsv = () => {
    const header = ["Date", "Subject", "Status", "Recipients"];
    const rows = emails.map((m) => [
      new Date(m.createdAt).toLocaleString(),
      m.subject.replace(/\n/g, " "),
      m.status,
      m.recipientCount,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email_history_page${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${BASE}/history/${id}`);
      setEmails((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  const handleArchive = async (id) => {
    try {
      await axios.put(`${BASE}/history/${id}`, { archived: true });
      setEmails((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Archive failed");
    }
  };

  /* ------------------------------ UI ------------------------------------- */
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header + Export */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Mail History</h2>
        <button
          onClick={exportCsv}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Status filter */}
        <select
          className="border px-3 py-2 rounded"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            resetPage();
          }}
        >
          <option value="">All Statuses</option>
          {Object.keys(STATUS_COLORS).map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        {/* Search */}
        <input
          className="border px-3 py-2 rounded flex-1 min-w-[200px]"
          type="text"
          placeholder="Search subject or recipient"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPage();
          }}
        />

        {/* Sort */}
        <select
          className="border px-3 py-2 rounded"
          value={`${sort.field}:${sort.dir}`}
          onChange={(e) => {
            const [field, dir] = e.target.value.split(":");
            setSort({ field, dir });
          }}
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="subject:asc">Subject A→Z</option>
          <option value="subject:desc">Subject Z→A</option>
          <option value="status:asc">Status A→Z</option>
          <option value="status:desc">Status Z→A</option>
        </select>
      </div>

      {/* Stats PieChart */}
      {statusStats.length > 0 && (
        <div className="w-full h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                dataKey="value"
                data={statusStats}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusStats.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : emails.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border rounded">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3 cursor-pointer">Date</th>
                <th className="p-3 cursor-pointer">Subject</th>
                <th className="p-3 text-center">Recipients</th>
                <th className="p-3 cursor-pointer">Status</th>
                <th className="p-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <React.Fragment key={email._id}>
                  <tr className="border-t">
                    <td className="p-3 whitespace-nowrap">
                      {new Date(email.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 max-w-xs truncate" title={email.subject}>
                      {email.subject}
                    </td>
                    <td className="p-3 text-center">{email.recipientCount}</td>
                    <td className="p-3 capitalize">
                      <span
                        className="font-medium"
                        style={{ color: STATUS_COLORS[email.status] }}
                      >
                        {email.status}
                      </span>
                    </td>
                    <td className="p-3 text-end space-x-4 whitespace-nowrap">
                      <button
                        onClick={() => setOpenId(openId === email._id ? null : email._id)}
                        className="text-blue-600 underline"
                      >
                        {openId === email._id ? "Hide" : "View"}
                      </button>
                      <button
                        onClick={() => handleArchive(email._id)}
                        className="text-yellow-600 underline"
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => handleDelete(email._id)}
                        className="text-red-600 underline"
                      >
                        Delete
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
                              <span className="font-medium">{r.email}</span> – {" "}
                              <span
                                style={{ color: STATUS_COLORS[r.status] || "#6b7280" }}
                              >
                                {r.status}
                              </span>
                              {r.sentAt && (
                                <span className="ml-2 text-gray-500">
                                  ({new Date(r.sentAt).toLocaleTimeString()})
                                </span>
                              )}
                              {r.error && (
                                <span className="ml-2 text-red-500">Error: {r.error}</span>
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
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span>
            Page <strong>{page}</strong> / {totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
