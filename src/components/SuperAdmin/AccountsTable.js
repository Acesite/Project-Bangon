import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaEllipsisH, FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import axios from "axios";

const PAGE_SIZE = 10;

/* ------------------------------ UI Helpers ------------------------------ */
const Pill = ({ tone = "gray", children }) => {
  const tones = {
    green: "bg-green-50 text-green-700 ring-green-600/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
    red:   "bg-red-50 text-red-700 ring-red-600/20",
    gray:  "bg-gray-50 text-gray-700 ring-gray-600/20",
  };
  const dot =
    tone === "green" ? "bg-green-600" :
    tone === "amber" ? "bg-amber-600" :
    tone === "red" ? "bg-red-600" : "bg-gray-500";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ring-1 ${tones[tone]}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {children}
    </span>
  );
};

/* ------------------------------ Menu Portal ----------------------------- */
/** Renders the actions menu in a portal and auto-flips up if near the bottom */
function ActionMenuPortal({ anchorRect, onClose, children }) {
  const boxRef = useRef(null);
  const [style, setStyle] = useState(null);

  useEffect(() => {
    if (!anchorRect) return;
    const compute = () => {
      const right = Math.max(0, window.innerWidth - anchorRect.right);
      // initial position: below the button
      let top = anchorRect.bottom + 8;

      // measure height and flip if needed
      const h = boxRef.current?.offsetHeight ?? 0;
      const spaceBelow = window.innerHeight - anchorRect.bottom;
      if (spaceBelow < h + 8) {
        top = anchorRect.top - h - 8;
      }
      setStyle({ top, right, position: "fixed" });
    };

    // compute after first paint so the element has dimensions
    requestAnimationFrame(compute);

    const close = () => onClose?.();
    const onKey = (e) => e.key === "Escape" && close();

    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true); // close if any scroll happens
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [anchorRect, onClose]);

  if (!anchorRect) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000]" onMouseDown={onClose}>
      <div
        ref={boxRef}
        className="z-[1001]"
        style={style ?? { position: "fixed", top: -9999, right: 0 }}
        onMouseDown={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ------------------------------ Main Table ------------------------------ */
const AccountsTable = ({ accounts, onDelete, onUpdateStatus }) => {
  // toolbar
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  // sorting
  const [sort, setSort] = useState({ by: "first_name", dir: "asc" });

  // single global menu state (id + anchor rect)
  const [menuFor, setMenuFor] = useState(null); // { id, rect } | null

  // pagination
  const [page, setPage] = useState(1);

  // build filter options from data
  const roles = useMemo(
    () => ["all", ...Array.from(new Set(accounts.map(a => a.role).filter(Boolean))).sort()],
    [accounts]
  );
  const statuses = useMemo(() => {
    const set = new Set(accounts.map(a => a.status).filter(Boolean));
    const list = Array.from(set);
    const common = ["Approved", "Pending", "Declined"];
    const rest = list.filter(x => !common.includes(x)).sort();
    return ["all", ...common.filter(x => list.includes(x)), ...rest];
  }, [accounts]);

  // filter + sort
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts
      .filter(a =>
        (role === "all" || (a.role || "").toLowerCase() === role.toLowerCase()) &&
        (status === "all" || (a.status || "").toLowerCase() === status.toLowerCase()) &&
        (!q || [a.first_name, a.last_name, a.email].filter(Boolean).some(v => v.toLowerCase().includes(q)))
      )
      .sort((a, b) => {
        const { by, dir } = sort;
        const av = (a[by] ?? "").toString().toLowerCase();
        const bv = (b[by] ?? "").toString().toLowerCase();
        if (av < bv) return dir === "asc" ? -1 : 1;
        if (av > bv) return dir === "asc" ? 1 : -1;
        return 0;
      });
  }, [accounts, query, role, status, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSlice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [query, role, status]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    try {
      await axios.delete(`http://localhost:5000/manageaccount/accounts/${id}`);
      onDelete(id);
      setMenuFor(null);
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/manageaccount/accounts/${id}/status`, { status: newStatus });
      onUpdateStatus(id, newStatus);
      setMenuFor(null);
    } catch (error) {
      console.error(`Error updating account status to ${newStatus}:`, error);
    }
  };

  const statusTone = (s) => {
    const v = (s || "").toLowerCase();
    if (v === "approved") return "green";
    if (v === "pending") return "amber";
    if (v === "declined" || v === "disabled") return "red";
    return "gray";
  };

  const onSort = (by) => {
    setSort((prev) => (prev.by === by ? { by, dir: prev.dir === "asc" ? "desc" : "asc" } : { by, dir: "asc" }));
  };

  const openMenu = (id, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuFor({ id, rect });
  };

  const closeMenu = () => setMenuFor(null);

  return (
    <div className="mt-6">
      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email…"
            className="w-64 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-gray-400">⌘K</span>
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          {roles.map(r => <option key={r} value={r}>{r === "all" ? "All roles" : r}</option>)}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          {statuses.map(s => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}
        </select>
      </div>

      {/* Table (horizontal scroll only) */}
      <div className="overflow-x-auto overflow-y-visible rounded-xl shadow-sm">
        <table className="min-w-full border border-gray-200 border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50">
              {[
                ["first_name", "First Name"],
                ["last_name", "Last Name"],
                ["email", "Email"],
                ["status", "Status"],
                ["role", "Role"],
              ].map(([key, label]) => (
                <th
                  key={key}
                  className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-800 bg-gray-50"
                >
                  <button
                    className="inline-flex select-none items-center gap-1 hover:text-green-700"
                    onClick={() => onSort(key)}
                    title={`Sort by ${label}`}
                  >
                    {label}
                    {sort.by === key && (
                      <span className="text-xs">{sort.dir === "asc" ? "▲" : "▼"}</span>
                    )}
                  </button>
                </th>
              ))}
              <th className="border border-gray-200 px-4 py-3 text-right text-sm font-semibold text-gray-800 bg-gray-50">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {pageSlice.length === 0 && (
              <tr>
                <td colSpan={6} className="border border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
                  No accounts match your filters.
                </td>
              </tr>
            )}

            {pageSlice.map((account) => (
              <tr key={account.id} className="odd:bg-white even:bg-gray-50/30 hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{account.first_name}</td>
                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{account.last_name}</td>
                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                  <span className="block max-w-[280px] truncate">{account.email}</span>
                </td>
                <td className="border border-gray-200 px-4 py-3 text-sm">
                  <Pill tone={statusTone(account.status)}>{account.status || "—"}</Pill>
                </td>
                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">{account.role || "—"}</td>
                <td className="border border-gray-200 px-4 py-3">
                  <div className="flex justify-end">
                    <button
                      className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                      onClick={(e) => openMenu(account.id, e)}
                      title="Actions"
                      aria-haspopup="menu"
                      aria-expanded={menuFor?.id === account.id}
                    >
                      <FaEllipsisH size={16} />
                    </button>
                  </div>

                  {menuFor?.id === account.id && (
                    <ActionMenuPortal anchorRect={menuFor.rect} onClose={closeMenu}>
                      <div className="w-44 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                        {account.status !== "Approved" && (
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-green-700 hover:bg-green-50"
                            onClick={() => { handleStatusUpdate(account.id, "Approved"); }}
                          >
                            <FaCheck size={14} /> Approve
                          </button>
                        )}
                        {account.status !== "Declined" && (
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50"
                            onClick={() => { handleStatusUpdate(account.id, "Pending"); }}
                          >
                            <FaTimes size={14} /> Mark Pending
                          </button>
                        )}
                        <button
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          onClick={() => { handleStatusUpdate(account.id, "Declined"); }}
                        >
                          <FaTimes size={14} /> Decline
                        </button>
                        <div className="h-px bg-gray-200" />
                        <button
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          onClick={() => { handleDelete(account.id); }}
                        >
                          <FaTrash size={14} /> Delete
                        </button>
                      </div>
                    </ActionMenuPortal>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Showing{" "}
          <strong>{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong>{" "}
          of <strong>{filtered.length}</strong>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border px-3 py-1.5 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="text-gray-700">
            Page {page} of {pageCount}
          </span>
          <button
            className="rounded-md border px-3 py-1.5 disabled:opacity-50"
            disabled={page === pageCount}
            onClick={() => setPage(p => Math.min(pageCount, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountsTable;
