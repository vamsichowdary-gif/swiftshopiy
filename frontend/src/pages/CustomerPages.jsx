import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Trash2, FileText, Package, MapPin, Send, MessageSquare, CheckCircle2, Clock, Ticket, X } from "lucide-react";
import axios from "axios";
import { openInvoice } from "../utils/invoice";
import OrderSuccessTicket from "../components/OrderSuccessTicket";

const API_URL =
  import.meta.env?.VITE_API_URL || "https://swiftshopiy-backned.onrender.com/api";

export function ProfilePage() {
  const { user } = useOutletContext();
  const fields = [
    ["Customer ID", user?.user_id || (user?.id ? `SW${String(user.id).padStart(6, "0")}` : "SW-MEMBER")],
    ["Username", user?.username ? `@${user.username}` : "—"],
    ["Full Name", user?.name || "Customer"],
    ["Email Address", user?.email || "—"],
    ["Account Tier", "Verified Customer"],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">My Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your customer credentials and account information</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        {fields.map(([label, value]) => (
          <div key={label} className="bg-[#131d33] border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
              {label}
            </span>
            <span className="text-sm font-semibold text-white block truncate">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrdersPage() {
  const { token, user } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicketOrder, setSelectedTicketOrder] = useState(null);

  useEffect(() => {
    const authToken = token || localStorage.getItem("token") || localStorage.getItem("swiftshop_token");
    if (!authToken) {
      setError("Please sign in to view your orders.");
      setLoading(false);
      return;
    }

    axios
      .get(`${API_URL}/user/orders`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
        },
      })
      .then(({ data }) => {
        const orderList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setOrders(orderList);
      })
      .catch((err) => {
        console.error("Order load error:", err);
        setError(err.response?.data?.message || "Unable to load your orders right now.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Order History</h1>
        <p className="text-xs text-slate-400 mt-1">Review your purchases, delivery statuses, and official invoices</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <Clock className="mx-auto text-blue-500 animate-spin mb-2" size={24} />
          <p className="text-xs">Loading your order history...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
          {error}
        </div>
      ) : orders.length ? (
        <div className="space-y-4">
          {orders.map((order) => {
            let items = [];
            if (Array.isArray(order.items)) {
              items = order.items;
            } else if (typeof order.items === "string") {
              try {
                items = JSON.parse(order.items);
              } catch {
                items = [];
              }
            }

            const statusColors = {
              Pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
              Processing: "bg-blue-500/15 text-blue-400 border-blue-500/30",
              Shipped: "bg-purple-500/15 text-purple-400 border-purple-500/30",
              Delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
              Cancelled: "bg-rose-500/15 text-rose-400 border-rose-500/30",
            };
            const badgeClass = statusColors[order.status] || "bg-slate-700/30 text-slate-300 border-slate-600/30";

            return (
              <article
                key={order.id}
                className="bg-[#131d33] border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">
                        Order #{order.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                        {order.status || "Pending"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Placed on {order.created_at ? order.created_at.slice(0, 10) : "Recent"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-white mr-1">
                      ${Number(order.total || 0).toFixed(2)}
                    </span>
                    <button
                      onClick={() => setSelectedTicketOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/70 text-xs font-semibold transition cursor-pointer"
                      title="View barcode ticket receipt"
                    >
                      <Ticket size={13} />
                      <span>Ticket</span>
                    </button>
                    <button
                      onClick={() =>
                        openInvoice(
                          order,
                          user || {
                            name: order.customer_name,
                            email: order.customer_email,
                          }
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition cursor-pointer"
                      title="Download or print invoice"
                    >
                      <FileText size={13} />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Items Ordered ({items.length})
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 bg-[#0e1628] p-2.5 rounded-xl border border-slate-800/60 text-xs"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-200 truncate text-[11px]">
                              {item.name || `Item #${idx + 1}`}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Qty: {item.quantity || item.qty || 1} × ${Number(item.price || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 bg-[#131d33] border border-dashed border-slate-800 rounded-3xl p-8">
          <Package className="mx-auto text-slate-600 mb-3" size={36} />
          <p className="font-bold text-white text-sm">No orders yet</p>
          <p className="text-xs text-slate-400 mt-1">
            When you purchase items from our catalog, your delivery status and scannable invoices will appear here.
          </p>
        </div>
      )}

      {/* Modal for viewing Order Ticket with Barcode */}
      {selectedTicketOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-md my-auto">
            <button
              onClick={() => setSelectedTicketOrder(null)}
              className="absolute -top-3 -right-3 z-30 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-600 border border-slate-700 flex items-center justify-center transition shadow-lg cursor-pointer"
              aria-label="Close ticket modal"
            >
              <X size={16} />
            </button>
            <OrderSuccessTicket
              order={selectedTicketOrder}
              customer={
                user || {
                  name: selectedTicketOrder.customer_name,
                  email: selectedTicketOrder.customer_email,
                }
              }
              onContinueShopping={() => setSelectedTicketOrder(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function AddressesPage() {
  const { user } = useOutletContext();
  const storageKey = `customerAddresses:${user?.id || user?.email || "guest"}`;
  const [addresses, setAddresses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState({ name: "", address: "", city: "", postal: "" });

  const save = (next) => {
    setAddresses(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.address) return;
    save([...addresses, { ...form, id: Date.now() }]);
    setForm({ name: "", address: "", city: "", postal: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Delivery Addresses</h1>
        <p className="text-xs text-slate-400 mt-1">Save preferred shipping locations for fast single-click checkout</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
        {addresses.map((address) => (
          <div key={address.id} className="bg-[#131d33] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-xs text-white">{address.name}</span>
                <button
                  onClick={() => save(addresses.filter((item) => item.id !== address.id))}
                  className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-1"
                  aria-label="Remove address"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {address.address}<br />
                {address.city} {address.postal}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="bg-[#131d33] border border-slate-800 rounded-2xl p-5 max-w-2xl space-y-3">
        <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-2">
          Add New Delivery Location
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            required
            placeholder="Label (e.g. Home, Office)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-[#0e1628] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
          />
          <input
            required
            placeholder="Street address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full bg-[#0e1628] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
          />
          <input
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full bg-[#0e1628] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
          />
          <input
            placeholder="Postal code"
            value={form.postal}
            onChange={(e) => setForm({ ...form, postal: e.target.value })}
            className="w-full bg-[#0e1628] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
          />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-md shadow-blue-900/30"
        >
          <Plus size={15} />
          <span>Save Address</span>
        </button>
      </form>
    </div>
  );
}

export function SupportPage() {
  const { token } = useOutletContext();
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const authToken = token || localStorage.getItem("token") || localStorage.getItem("swiftshop_token");
  const auth = { headers: { Authorization: `Bearer ${authToken}` } };

  useEffect(() => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    axios
      .get(`${API_URL}/user/support-tickets`, auth)
      .then(({ data }) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => setError("Unable to load support tickets."))
      .finally(() => setLoading(false));
  }, [authToken]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await axios.post(`${API_URL}/user/support-tickets`, form, auth);
      setTickets((curr) => [data.ticket, ...curr]);
      setForm({ subject: "", message: "" });
      setSuccess("Your support request has been submitted to customer service.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit your support request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Contact Support</h1>
        <p className="text-xs text-slate-400 mt-1">Submit inquiries regarding deliveries, refunds, or product details</p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="bg-[#131d33] border border-slate-800 rounded-2xl p-5 max-w-xl space-y-3 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Subject</label>
          <input
            required
            maxLength={150}
            placeholder="e.g. Question about order tracking"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full bg-[#0e1628] border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Message</label>
          <textarea
            required
            minLength={5}
            maxLength={5000}
            rows={4}
            placeholder="Describe your inquiry in detail..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full bg-[#0e1628] border border-slate-800 rounded-xl p-3.5 text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600 resize-none leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-md shadow-blue-900/30 transition cursor-pointer disabled:opacity-50"
        >
          <Send size={14} />
          <span>{saving ? "Sending..." : "Submit Ticket"}</span>
        </button>
      </form>

      {/* Ticket List */}
      <div className="pt-4 space-y-3">
        <h3 className="font-bold text-sm text-white">Your Recent Support Requests</h3>
        {loading ? (
          <p className="text-xs text-slate-500">Loading requests...</p>
        ) : tickets.length ? (
          tickets.map((t) => (
            <div key={t.id} className="bg-[#131d33] border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{t.subject}</span>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  {t.status}
                </span>
              </div>
              <p className="text-slate-300 whitespace-pre-wrap">{t.message}</p>
              {t.admin_response && (
                <div className="p-3 bg-[#0e1628] rounded-xl border border-blue-500/20 mt-2">
                  <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                    Staff Response:
                  </p>
                  <p className="text-slate-200 mt-1 whitespace-pre-wrap">{t.admin_response}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500">No support inquiries opened yet.</p>
        )}
      </div>
    </div>
  );
}
