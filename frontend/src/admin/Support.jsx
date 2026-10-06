import React, { useState } from "react";
import {
  MessageSquare,
  RefreshCw,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
} from "lucide-react";
import { updateAdminSupportTicket } from "./api";

export default function Support({
  tickets = [],
  token,
  onRefresh,
  loading = false,
}) {
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [successToast, setSuccessToast] = useState("");

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter === "All") return true;
    return (ticket.status || "").toLowerCase() === statusFilter.toLowerCase();
  });

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 4000);
  };

  const handleSaveReply = async (ticket) => {
    const draftText = drafts[ticket.id] !== undefined ? drafts[ticket.id] : ticket.admin_response || "";
    setSavingId(ticket.id);

    try {
      await updateAdminSupportTicket(token, ticket.id, {
        status: ticket.status || "In Progress",
        admin_response: draftText,
      });
      showToast(`Reply saved for ticket #${ticket.id}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Support update error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update support ticket. Please try again."
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleStatusChange = async (ticket, newStatus) => {
    const draftText = drafts[ticket.id] !== undefined ? drafts[ticket.id] : ticket.admin_response || "";
    setSavingId(ticket.id);

    try {
      await updateAdminSupportTicket(token, ticket.id, {
        status: newStatus,
        admin_response: draftText,
      });
      showToast(`Status updated to ${newStatus} for ticket #${ticket.id}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update ticket status.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} />
          {successToast}
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-400" />
              Customer Support Desk
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review inquiries, reply to customer tickets, and update resolution states
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 bg-[#1e293b] hover:bg-[#28354f] text-slate-200 text-xs font-semibold rounded-xl transition border border-[#2b3a56] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh Desk
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-[#1e293b]">
          {["All", "Open", "In Progress", "Resolved"].map((status) => {
            const count =
              status === "All"
                ? tickets.length
                : tickets.filter(
                    (t) => (t.status || "").toLowerCase() === status.toLowerCase()
                  ).length;
            const active = statusFilter === status;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                    : "bg-[#0e1424] text-slate-400 hover:text-slate-200 hover:bg-[#1a233a] border border-[#1e293b]"
                }`}
              >
                <span>{status}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    active ? "bg-blue-700 text-blue-100" : "bg-[#1e293b] text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => {
            const currentDraft =
              drafts[ticket.id] !== undefined
                ? drafts[ticket.id]
                : ticket.admin_response || "";

            return (
              <div
                key={ticket.id}
                className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e293b]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        #{ticket.id}
                      </span>
                      <h3 className="font-bold text-white text-sm">
                        {ticket.subject}
                      </h3>
                      <SupportStatusBadge status={ticket.status} />
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <User size={13} className="text-slate-500" />
                      <span className="text-slate-300 font-medium">
                        {ticket.user?.name || "Customer"}
                      </span>
                      <span>·</span>
                      <span>{ticket.user?.email || "—"}</span>
                      {ticket.user?.user_id && (
                        <>
                          <span>·</span>
                          <span className="text-blue-400/80 font-mono text-[11px]">
                            {ticket.user.user_id}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 sm:text-right">
                    <span className="flex items-center gap-1 sm:justify-end">
                      <Clock size={13} />
                      {ticket.created_at
                        ? ticket.created_at.slice(0, 10)
                        : "Recent"}
                    </span>
                  </div>
                </div>

                {/* User Message Box */}
                <div className="bg-[#0e1424] border border-[#1e293b] rounded-xl p-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Customer Inquiry:
                  </p>
                  <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {ticket.message}
                  </p>
                </div>

                {/* Response Composer */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Administrator Reply & Status
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Type your response to the customer..."
                    value={currentDraft}
                    onChange={(e) =>
                      setDrafts({ ...drafts, [ticket.id]: e.target.value })
                    }
                    className="w-full bg-[#0e1424] text-slate-200 text-xs rounded-xl p-3 border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-600 resize-none leading-relaxed"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Set Ticket Status:</span>
                      <select
                        aria-label={`Status for ticket ${ticket.id}`}
                        value={ticket.status}
                        onChange={(e) =>
                          handleStatusChange(ticket, e.target.value)
                        }
                        className="bg-[#0e1424] text-slate-200 border border-[#1e293b] rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleSaveReply(ticket)}
                      disabled={savingId === ticket.id}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-blue-900/30 cursor-pointer disabled:opacity-50"
                    >
                      <Send size={13} />
                      {savingId === ticket.id ? "Saving..." : "Send / Save Reply"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-12 text-center text-slate-400 shadow-sm">
            <MessageSquare className="mx-auto text-slate-600 mb-2" size={32} />
            <p className="font-semibold text-slate-300 text-sm">
              No support tickets found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {statusFilter === "All"
                ? "Customers haven't submitted any inquiries yet."
                : `No tickets currently marked as "${statusFilter}".`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SupportStatusBadge({ status }) {
  const configs = {
    Open: {
      bg: "bg-amber-500/15",
      border: "border-amber-500/30",
      text: "text-amber-400",
    },
    "In Progress": {
      bg: "bg-blue-500/15",
      border: "border-blue-500/30",
      text: "text-blue-400",
    },
    Resolved: {
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
    },
  };

  const style = configs[status] || {
    bg: "bg-slate-700/30",
    border: "border-slate-600/30",
    text: "text-slate-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${style.bg} ${style.border} ${style.text}`}
    >
      {status || "Open"}
    </span>
  );
}
