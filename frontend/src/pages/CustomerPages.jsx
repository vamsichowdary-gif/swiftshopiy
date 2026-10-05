import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { openInvoice } from "../utils/invoice";

const API_URL = "https://swiftshopiy-backned.onrender.com/api";

export function ProfilePage() {
  const { user } = useOutletContext();
  const fields = [
    ["User ID", user.user_id || `#${user.id}`],
    ["Username", user.username],
    ["Full name", user.name],
    ["Email address", user.email],
    ["Account role", user.role || "Customer"],
  ];

  return <><h1 className="text-2xl font-bold">My profile</h1><p className="text-slate-500 mt-1 mb-7">Your account information</p><div className="max-w-lg space-y-4">{fields.map(([label, value]) => <label key={label} className="block text-sm font-medium text-slate-600">{label}<input readOnly value={value || ""} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800" /></label>)}</div></>;
}

export function OrdersPage() {
  const { token, user } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`${API_URL}/user/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setOrders(Array.isArray(data) ? data : data.data || []))
      .catch(() => setError("Unable to load your orders right now."))
      .finally(() => setLoading(false));
  }, [token]);

  return <><h1 className="text-2xl font-bold">Order history</h1><p className="text-slate-500 mt-1">Your purchases and delivery updates</p>
    {loading ? <p className="mt-8 text-slate-500">Loading orders...</p> : error ? <p role="alert" className="mt-8 text-rose-600">{error}</p> : orders.length ? <div className="mt-8 space-y-4">{orders.map(order => <article key={order.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">Order #{order.id}</p><p className="text-sm text-slate-500">{order.created_at?.slice(0, 10)}</p></div><div className="flex items-center gap-3"><div className="text-right"><p className="font-bold">${Number(order.total).toFixed(2)}</p><span className="text-sm text-indigo-700">{order.status}</span></div><button onClick={() => openInvoice(order, user)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Invoice</button></div></div><ul className="mt-4 border-t pt-3 text-sm text-slate-600">{(order.items || []).map((item, index) => <li key={`${item.id || item.name}-${index}`}>{item.name} × {item.quantity || item.qty || 1}</li>)}</ul></article>)}</div> : <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">No orders to show yet. Your purchases will appear here.</div>}
  </>;
}

export function AddressesPage() {
  const { user } = useOutletContext();
  const storageKey = `customerAddresses:${user.id || user.email}`;
  const [addresses, setAddresses] = useState(() => JSON.parse(localStorage.getItem(storageKey) || "[]"));
  const [form, setForm] = useState({ name: "", address: "", city: "", postal: "" });
  const save = (next) => { setAddresses(next); localStorage.setItem(storageKey, JSON.stringify(next)); };
  const submit = (event) => { event.preventDefault(); save([...addresses, { ...form, id: Date.now() }]); setForm({ name: "", address: "", city: "", postal: "" }); };

  return <><h1 className="text-2xl font-bold">Delivery addresses</h1><p className="text-slate-500 mt-1 mb-7">Manage saved delivery locations on this device</p><div className="grid sm:grid-cols-2 gap-3">{addresses.map(address => <div key={address.id} className="rounded-xl border p-4"><div className="flex justify-between font-semibold">{address.name}<button onClick={() => save(addresses.filter(item => item.id !== address.id))} aria-label="Remove address"><Trash2 size={16}/></button></div><p className="text-sm text-slate-600 mt-2">{address.address}<br/>{address.city} {address.postal}</p></div>)}</div><form onSubmit={submit} className="mt-7 grid sm:grid-cols-2 gap-3 max-w-2xl">{[["name","Label (Home, Work)"],["address","Street address"],["city","City"],["postal","Postal code"]].map(([key,label])=><input key={key} required placeholder={label} value={form[key]} onChange={event=>setForm({...form,[key]:event.target.value})} className="rounded-xl border px-4 py-3 text-sm"/>)}<button className="sm:col-span-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white py-3"><Plus size={16}/>Add address</button></form></>;
}

export function SupportPage() {
  const { token } = useOutletContext();
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get(`${API_URL}/user/support-tickets`, auth)
      .then(({ data }) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => setError("Unable to load your support requests."))
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { data } = await axios.post(`${API_URL}/user/support-tickets`, form, auth);
      setTickets(current => [data.ticket, ...current]);
      setForm({ subject: "", message: "" });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not send your support request.");
    } finally {
      setSaving(false);
    }
  };

  return <><h1 className="text-2xl font-bold">Contact support</h1><p className="text-slate-500 mt-1 mb-7">Send a request to our team and follow its status here.</p>{error && <p role="alert" className="mb-4 text-sm text-rose-600">{error}</p>}<form onSubmit={submit} className="max-w-xl space-y-4"><label className="block text-sm font-medium">Subject<input required maxLength="150" value={form.subject} onChange={event=>setForm({...form, subject:event.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 p-3" /></label><label className="block text-sm font-medium">How can we help?<textarea required minLength="5" maxLength="5000" rows="5" value={form.message} onChange={event=>setForm({...form, message:event.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 p-4"/></label><button disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-3 text-white font-semibold disabled:opacity-60">{saving ? "Sending..." : "Send request"}</button></form><section className="mt-10"><h2 className="text-lg font-bold">Your support requests</h2>{loading ? <p className="mt-4 text-sm text-slate-500">Loading requests...</p> : tickets.length ? <div className="mt-4 space-y-3">{tickets.map(ticket => <article key={ticket.id} className="rounded-xl border border-slate-200 p-4"><div className="flex justify-between gap-3"><h3 className="font-semibold">{ticket.subject}</h3><span className="text-xs font-semibold text-indigo-700">{ticket.status}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{ticket.message}</p>{ticket.admin_response && <div className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm text-slate-700"><strong>Support reply:</strong><p className="mt-1 whitespace-pre-wrap">{ticket.admin_response}</p></div>}<p className="mt-3 text-xs text-slate-400">{ticket.created_at?.slice(0, 10)}</p></article>)}</div> : <p className="mt-4 text-sm text-slate-500">You have no support requests yet.</p>}</section></>;
}
