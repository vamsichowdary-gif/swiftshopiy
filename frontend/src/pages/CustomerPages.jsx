import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import axios from "axios";

export function ProfilePage() {
  const { user } = useOutletContext();
  return <><h1 className="text-2xl font-bold">My profile</h1><p className="text-slate-500 mt-1 mb-7">Your account information</p><div className="max-w-lg space-y-4">{[["User ID", user.user_id || `#${user.id}`], ["Full name", user.name], ["Email address", user.email], ["Account role", user.role || "Customer"]].map(([label, value]) => <label key={label} className="block text-sm font-medium text-slate-600">{label}<input readOnly value={value || ""} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800" /></label>)}</div></>;
}

export function OrdersPage() {
  const { token } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("https://swiftshopiy-backned.onrender.com/api/user/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setOrders(Array.isArray(data) ? data : data.data || []))
      .catch(() => setError("Unable to load your orders right now."))
      .finally(() => setLoading(false));
  }, [token]);

  return <><h1 className="text-2xl font-bold">Order history</h1><p className="text-slate-500 mt-1">Your purchases and delivery updates</p>{loading ? <p className="mt-8 text-slate-500">Loading orders…</p> : error ? <p role="alert" className="mt-8 text-rose-600">{error}</p> : orders.length ? <div className="mt-8 space-y-4">{orders.map(order => <article key={order.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-bold">Order #{order.id}</p><p className="text-sm text-slate-500">{order.created_at?.slice(0, 10)}</p></div><div className="text-right"><p className="font-bold">${Number(order.total).toFixed(2)}</p><span className="text-sm text-indigo-700">{order.status}</span></div></div><ul className="mt-4 border-t pt-3 text-sm text-slate-600">{(order.items || []).map((item, index) => <li key={`${item.id || item.name}-${index}`}>{item.name} × {item.quantity || 1}</li>)}</ul></article>)}</div> : <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">No orders to show yet. Your purchases will appear here.</div>}</>;
}

export function AddressesPage() {
  const { user } = useOutletContext();
  const storageKey = `customerAddresses:${user.id || user.email}`;
  const [addresses, setAddresses] = useState(() => JSON.parse(localStorage.getItem(storageKey) || "[]"));
  const [form, setForm] = useState({ name: "", address: "", city: "", postal: "" });
  const save = (next) => { setAddresses(next); localStorage.setItem(storageKey, JSON.stringify(next)); };
  const submit = (e) => { e.preventDefault(); save([...addresses, { ...form, id: Date.now() }]); setForm({ name: "", address: "", city: "", postal: "" }); };
  return <><h1 className="text-2xl font-bold">Delivery addresses</h1><p className="text-slate-500 mt-1 mb-7">Manage saved delivery locations on this device</p><div className="grid sm:grid-cols-2 gap-3">{addresses.map((a) => <div key={a.id} className="rounded-xl border p-4"><div className="flex justify-between font-semibold">{a.name}<button onClick={() => save(addresses.filter(x => x.id !== a.id))} aria-label="Remove address"><Trash2 size={16}/></button></div><p className="text-sm text-slate-600 mt-2">{a.address}<br/>{a.city} {a.postal}</p></div>)}</div><form onSubmit={submit} className="mt-7 grid sm:grid-cols-2 gap-3 max-w-2xl">{[["name","Label (Home, Work)"],["address","Street address"],["city","City"],["postal","Postal code"]].map(([key,label])=><input key={key} required placeholder={label} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} className="rounded-xl border px-4 py-3 text-sm"/>)}<button className="sm:col-span-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white py-3"><Plus size={16}/>Add address</button></form></>;
}

export function SupportPage() {
  const [message, setMessage] = useState(""); const [sent, setSent] = useState(false);
  return <><h1 className="text-2xl font-bold">Contact support</h1><p className="text-slate-500 mt-1 mb-7">Send our team a message and we’ll get back to you.</p><form onSubmit={e => {e.preventDefault(); setSent(true); setMessage("");}} className="max-w-xl space-y-4"><label className="block text-sm font-medium">How can we help?<textarea required rows="6" value={message} onChange={e=>setMessage(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-4"/></label><button className="rounded-xl bg-indigo-600 px-5 py-3 text-white font-semibold">Send message</button>{sent && <p className="text-sm text-amber-700">The support form is ready, but message delivery requires a backend support endpoint.</p>}</form></>;
}
