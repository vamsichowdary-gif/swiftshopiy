import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  ArrowLeft,
  RefreshCw,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  CircleDollarSign,
  Clock3,
  Ban,
} from "lucide-react";

const API_URL = "https://swiftshopiy-backend.onrender.com/api/products";

const INITIAL_FORM = {
  name: "",
  category: "Electronics",
  price: "",
  rating: "5.0",
  reviews: "0",
  image: "",
  description: "",
};

export default function AdminPanel({ onBackToStore, token, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [section, setSection] = useState("overview");
  const [users, setUsers] = useState([]);
  const [overview, setOverview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("All");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load products from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOverview();
    fetchUsers();
    fetchOrders();
  }, []);

  const authConfig = { headers: { Authorization: `Bearer ${token}` } };
  const fetchOverview = async () => {
    try {
      const res = await axios.get(
        "https://swiftshopiy-backend.onrender.com/api/admin/overview",
        authConfig,
      );
      setOverview(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "https://swiftshopiy-backend.onrender.com/api/admin/users",
        authConfig,
      );
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchOrders = async (status = orderFilter) => {
    try {
      const res = await axios.get(
        "https://swiftshopiy-backend.onrender.com/api/admin/orders",
        { ...authConfig, params: status === "All" ? {} : { status } },
      );
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.patch(
        `https://swiftshopiy-backend.onrender.com/api/admin/orders/${orderId}/status`,
        { status },
        authConfig,
      );
      await fetchOrders();
      await fetchOverview();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update order status.");
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      rating: product.rating,
      reviews: product.reviews,
      image: product.image,
      description: product.description,
    });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        rating: parseFloat(formData.rating || 5.0),
        reviews: parseInt(formData.reviews || 0, 10),
      };

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(API_URL, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save product. Please check the fields.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product from database.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 shrink-0 bg-gradient-to-b from-slate-800 to-slate-950 text-slate-300 md:min-h-screen md:sticky md:top-0 p-5 flex flex-col">
        <div className="flex items-center gap-3 px-2 pb-7 border-b border-white/10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white grid place-items-center font-black text-xl">
            S
          </div>
          <div>
            <p className="font-bold text-white text-lg">SwiftShop</p>
            <p className="text-xs text-slate-400">ADMIN WORKSPACE</p>
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-[.18em] text-slate-500 font-bold mt-7 mb-3 px-3">
          Management
        </p>
        <nav className="space-y-2">
          {[
            ["overview", "Overview", LayoutDashboard],
            ["orders", "Orders", ShoppingBag],
            ["products", "Products", Package],
            ["users", "Users", Users],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${section === id ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-950/30" : "hover:bg-white/10 text-slate-300"}`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 space-y-2">
          <button
            onClick={onBackToStore}
            className="w-full rounded-xl px-4 py-3 text-left text-sm hover:bg-white/10"
          >
            ← Back to store
          </button>
          <button
            onClick={onLogout}
            className="w-full rounded-xl px-4 py-3 text-left text-sm text-slate-400 hover:bg-white/10 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToStore}
                className="hidden text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Store
              </button>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                {
                  {
                    overview: "Dashboard Overview",
                    orders: "Order Management",
                    products: "Product Management",
                    users: "User Management",
                  }[section]
                }
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openCreateModal}
                className={`${section !== "products" ? "hidden" : "flex"} items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow`}
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>
        </header>

        {/* Main Table */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
          {section === "overview" ? (
            <Overview
              overview={overview}
              orders={overview?.recent_orders || []}
              setSection={setSection}
              updateOrderStatus={updateOrderStatus}
            />
          ) : section === "orders" ? (
            <OrdersTable
              orders={orders}
              orderFilter={orderFilter}
              setOrderFilter={(value) => {
                setOrderFilter(value);
                fetchOrders(value);
              }}
              updateOrderStatus={updateOrderStatus}
            />
          ) : section === "users" ? (
            <div className="bg-white rounded-2xl border overflow-hidden">
              <div className="p-5 border-b">
                <h2 className="font-bold">Customer accounts</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Administrator and customer accounts
                </p>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Name", "Email", "Role", "Joined"].map((x) => (
                        <th key={x} className="p-3">
                          {x}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="p-3">{u.name}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">{u.role}</td>
                        <td className="p-3">{u.created_at?.slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <p className="p-6 text-sm text-slate-500">
                    No user accounts were returned.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Manage Inventory
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      PostgreSQL Table: `products`
                    </p>
                  </div>
                  <button
                    onClick={fetchProducts}
                    className="p-2 text-slate-500 hover:text-slate-900 transition"
                    title="Refresh table"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-4">Item</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Price</th>
                        <th className="py-3.5 px-4">Rating</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50/70 transition"
                        >
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-lg bg-slate-100 border border-slate-200"
                            />
                            <div>
                              <span className="font-semibold text-slate-900 block leading-tight">
                                {p.name}
                              </span>
                              <span className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                                {p.description}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">
                            {p.category}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            ${parseFloat(p.price).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-xs font-semibold text-amber-600">
                            {p.rating} ★ ({p.reviews})
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(p)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal for Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {editingId ? "Edit Product" : "Create New Product"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="text-rose-600 text-xs bg-rose-50 p-2.5 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Home">Home</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow"
                >
                  {saving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Overview({ overview, orders, setSection, updateOrderStatus }) {
  const stats = [
    [
      "Total orders",
      overview?.total_orders ?? "—",
      ShoppingBag,
      "from all time",
    ],
    [
      "Pending",
      overview?.status_counts?.pending ?? "—",
      Clock3,
      "need attention",
    ],
    [
      "Processing",
      overview?.status_counts?.processing ?? "—",
      Package,
      "being prepared",
    ],
    [
      "Delivered",
      overview?.status_counts?.delivered ?? "—",
      ShoppingBag,
      "completed orders",
    ],
    [
      "Cancelled",
      overview?.status_counts?.cancelled ?? "—",
      Ban,
      "cancelled orders",
    ],
    [
      "Revenue",
      overview ? `$${Number(overview.total_revenue).toFixed(2)}` : "—",
      CircleDollarSign,
      "excluding cancelled",
    ],
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
        <p className="text-sm text-slate-500 mt-1">
          Here’s what’s happening with your store today.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map(([label, value, Icon, hint]) => (
          <div
            key={label}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-bold mt-2">{value}</p>
              </div>
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white grid place-items-center">
                <Icon size={19} />
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-3">{hint}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="font-bold">Recent orders</h3>
            <p className="text-xs text-slate-500 mt-1">
              Latest customer orders
            </p>
          </div>
          <button
            onClick={() => setSection("orders")}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View all orders →
          </button>
        </div>
        {orders.length ? (
          <OrderRows orders={orders} updateOrderStatus={updateOrderStatus} />
        ) : (
          <div className="p-10 text-center">
            <ShoppingBag className="mx-auto text-slate-300" size={30} />
            <p className="font-semibold mt-3">No orders yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Orders will appear here when customers place them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersTable({
  orders,
  orderFilter,
  setOrderFilter,
  updateOrderStatus,
}) {
  const filters = [
    "All",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b">
        <h2 className="font-bold">Orders</h2>
        <p className="text-sm text-slate-500 mt-1">
          Review orders and update their status.
        </p>
        <div className="flex gap-2 overflow-x-auto mt-4">
          {filters.map((status) => (
            <button
              key={status}
              onClick={() => setOrderFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${orderFilter === status ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      {orders.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                {[
                  "Order",
                  "Customer",
                  "Date",
                  "Total",
                  "Status",
                  "Update status",
                ].map((x) => (
                  <th key={x} className="p-3">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="p-3 font-semibold">#{order.id}</td>
                  <td className="p-3">
                    {order.customer_name}
                    <div className="text-xs text-slate-400">
                      {order.customer_email}
                    </div>
                  </td>
                  <td className="p-3">{order.created_at?.slice(0, 10)}</td>
                  <td className="p-3 font-semibold">
                    ${Number(order.total).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-3">
                    <select
                      aria-label={`Update order ${order.id} status`}
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value)
                      }
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    >
                      {filters.slice(1).map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-10 text-center">
          <p className="font-semibold">
            No{" "}
            {orderFilter === "All"
              ? "orders"
              : orderFilter.toLowerCase() + " orders"}{" "}
            found
          </p>
          <p className="text-sm text-slate-500 mt-1">
            New orders will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

function OrderRows({ orders, updateOrderStatus }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
          <tr>
            {["Order", "Customer", "Date", "Total", "Status", "Update"].map(
              (x) => (
                <th key={x} className="p-3">
                  {x}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t">
              <td className="p-3 font-semibold">#{order.id}</td>
              <td className="p-3">{order.customer_name}</td>
              <td className="p-3">{order.created_at?.slice(0, 10)}</td>
              <td className="p-3">${Number(order.total).toFixed(2)}</td>
              <td className="p-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="p-3">
                <select
                  aria-label={`Update order ${order.id} status`}
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                >
                  {[
                    "Pending",
                    "Processing",
                    "Shipped",
                    "Delivered",
                    "Cancelled",
                  ].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    Pending: "bg-amber-50 text-amber-700",
    Processing: "bg-blue-50 text-blue-700",
    Shipped: "bg-violet-50 text-violet-700",
    Delivered: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status] || "bg-slate-100 text-slate-600"}`}
    >
      {status}
    </span>
  );
}
