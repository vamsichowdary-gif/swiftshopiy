import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import axios from "axios";
import {
  Package,
  DollarSign,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Ticket,
  X,
  BellRing,
  ExternalLink,
} from "lucide-react";
import NewsTicker from "../components/NewsTicker";
import OrderSuccessTicket from "../components/OrderSuccessTicket";
import { openInvoice } from "../utils/invoice";
import { API_URL } from "../config/api";

export default function DashboardOverview() {
  const { user, token } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedTicketOrder, setSelectedTicketOrder] = useState(null);

  // Fetch customer orders
  useEffect(() => {
    const authToken =
      token ||
      localStorage.getItem("swiftshop_token") ||
      localStorage.getItem("token");
    if (!authToken) {
      setLoadingOrders(false);
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
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setOrders(list);
      })
      .catch((err) => {
        console.error("Failed to load user orders:", err);
      })
      .finally(() => setLoadingOrders(false));
  }, [token]);

  // Fetch catalog to identify newest products for the alert
  useEffect(() => {
    axios
      .get(`${API_URL}/products`)
      .then(({ data }) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setProducts(list);
      })
      .catch((err) => {
        console.error("Failed to load catalog products:", err);
      });
  }, []);

  // Compute Overall View metrics
  const totalOrdersCount = orders.length;
  const totalSpent = orders.reduce(
    (sum, o) => sum + Number(o.total || 0),
    0
  );
  const activeOrdersCount = orders.filter((o) => {
    const status = (o.status || "").toLowerCase();
    return status === "pending" || status === "processing" || status === "shipped";
  }).length;
  const deliveredCount = orders.filter(
    (o) => (o.status || "").toLowerCase() === "delivered"
  ).length;

  // New products (top 3 newest additions)
  const newProducts = products.slice(0, 3);
  const recentOrders = orders.slice(0, 4);

  const customerId =
    user?.user_id ||
    (user?.id ? `SW${String(user.id).padStart(6, "0")}` : "SW-MEMBER");

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Scrolling News Ticker at top of Overall View */}
      <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <NewsTicker theme="dark" />
      </div>

      {/* 2. New Products Alert Banner */}
      {newProducts.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-blue-500/30 p-5 sm:p-6 shadow-2xl">
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 grid place-items-center shrink-0">
                <BellRing size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    New Products Alert
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white shadow-sm">
                    {products.length} In Catalog
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Fresh items just arrived in store! Explore the latest additions to the catalog.
                </p>
              </div>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shrink-0 shadow-lg shadow-blue-900/40"
            >
              <span>Explore New Arrivals</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Quick Preview of New Products */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {newProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center gap-3 bg-[#0d1527]/80 border border-slate-800/80 rounded-2xl p-2.5 transition hover:border-blue-500/40"
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    {prod.name}
                  </p>
                  <p className="text-[10px] text-blue-400 font-semibold">
                    ${Number(prod.price || 0).toFixed(2)} · {prod.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Overall View Analytics & KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Dashboard Overview
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Welcome back, {user?.name || "Customer"}. Here is your account and purchase summary.
            </p>
          </div>
          <span className="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-xl hidden sm:inline-block">
            ID: {customerId}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Orders */}
          <div className="bg-[#131d33] border border-slate-800 rounded-3xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Total Orders
              </span>
              <Package size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {totalOrdersCount}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">All-time customer purchases</p>
          </div>

          {/* Card 2: Total Spent */}
          <div className="bg-[#131d33] border border-slate-800 rounded-3xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Total Spent
              </span>
              <DollarSign size={18} className="text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">
              ${totalSpent.toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Cumulative order value</p>
          </div>

          {/* Card 3: Active Orders */}
          <div className="bg-[#131d33] border border-slate-800 rounded-3xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Active / Transit
              </span>
              <Clock size={18} className="text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-400">
              {activeOrdersCount}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">In fulfillment or transit</p>
          </div>

          {/* Card 4: Delivered */}
          <div className="bg-[#131d33] border border-slate-800 rounded-3xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Delivered
              </span>
              <CheckCircle2 size={18} className="text-purple-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-purple-400">
              {deliveredCount}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Successfully completed</p>
          </div>
        </div>
      </div>

      {/* 4. Recent Orders with Quick Ticket & Invoice Access */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Recent Orders
            </h3>
            <p className="text-xs text-slate-400">
              Instant access to scannable barcode tickets and downloadable tax invoices
            </p>
          </div>
          <Link
            to="/dashboard/orders"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          >
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loadingOrders ? (
          <div className="py-12 text-center text-slate-400 bg-[#131d33] rounded-3xl border border-slate-800">
            <Clock className="mx-auto text-blue-500 animate-spin mb-2" size={24} />
            <p className="text-xs">Loading recent orders...</p>
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const statusColors = {
                Pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
                Processing: "bg-blue-500/15 text-blue-400 border-blue-500/30",
                Shipped: "bg-purple-500/15 text-purple-400 border-purple-500/30",
                Delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                Cancelled: "bg-rose-500/15 text-rose-400 border-rose-500/30",
              };
              const badgeClass =
                statusColors[order.status] ||
                "bg-slate-700/50 text-slate-300 border-slate-600/50";

              return (
                <div
                  key={order.id}
                  className="bg-[#131d33] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 grid place-items-center shrink-0 border border-blue-500/20">
                      <ShoppingBag size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">
                          Order #{order.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Placed on {order.created_at ? order.created_at.slice(0, 10) : "Recent"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <span className="text-base font-bold text-white mr-2">
                      ${Number(order.total || 0).toFixed(2)}
                    </span>

                    {/* Quick Ticket Action */}
                    <button
                      onClick={() => setSelectedTicketOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                      title="View scannable ticket & barcode"
                    >
                      <Ticket size={13} />
                      <span>Ticket</span>
                    </button>

                    {/* Quick Invoice Action */}
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
                      title="Download/print official tax invoice"
                    >
                      <FileText size={13} />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 bg-[#131d33] border border-dashed border-slate-800 rounded-3xl p-6">
            <Package className="mx-auto text-slate-600 mb-2" size={32} />
            <p className="font-bold text-white text-sm">No orders recorded yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Start shopping to populate your order history, delivery tracking, and barcode tickets.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-900/30"
            >
              <span>Explore Products</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* Ticket Modal popup */}
      {selectedTicketOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-md my-auto">
            <button
              onClick={() => setSelectedTicketOrder(null)}
              className="absolute -top-3 -right-3 z-30 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-600 border border-slate-700 flex items-center justify-center transition shadow-lg cursor-pointer"
              aria-label="Close"
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
              cutoutBg="bg-[#0b101c]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
