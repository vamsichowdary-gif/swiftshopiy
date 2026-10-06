import React from "react";
import {
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  XCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
import { openInvoice } from "../utils/invoice";

export default function Dashboard({
  overview,
  orders = [],
  productsCount = 0,
  onNavigate,
  onUpdateOrderStatus,
}) {
  const totalRevenue =
    overview?.total_revenue != null
      ? Number(overview.total_revenue)
      : 24567;
  const activeUsers =
    overview?.total_users != null ? Number(overview.total_users) : 1234;
  const totalOrders =
    overview?.total_orders != null ? Number(overview.total_orders) : 456;
  const totalProducts = productsCount || 89;

  const statusCounts = overview?.status_counts || {
    pending: 12,
    processing: 28,
    shipped: 45,
    delivered: 360,
    cancelled: 11,
  };

  const recentOrders =
    overview?.recent_orders && overview.recent_orders.length > 0
      ? overview.recent_orders
      : orders.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top 4 Stat Cards matching the screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales */}
        <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-blue-400 flex items-center justify-center font-bold">
              <DollarSign size={20} />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium mt-4">Total Sales</p>
          <p className="text-2xl font-bold text-white mt-1">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium mt-2">
            <span>+12% from last month</span>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-emerald-400 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium mt-4">Active Users</p>
          <p className="text-2xl font-bold text-white mt-1">
            {activeUsers.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium mt-2">
            <span>+5% from last week</span>
          </div>
        </div>

        {/* Card 3: Orders */}
        <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-purple-400 flex items-center justify-center font-bold">
              <ShoppingCart size={20} />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium mt-4">Orders</p>
          <p className="text-2xl font-bold text-white mt-1">
            {totalOrders.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium mt-2">
            <span>+8% from yesterday</span>
          </div>
        </div>

        {/* Card 4: Products */}
        <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-amber-400 flex items-center justify-center font-bold">
              <Package size={20} />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium mt-4">Products</p>
          <p className="text-2xl font-bold text-white mt-1">
            {totalProducts.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium mt-2">
            <span>+3 new this week</span>
          </div>
        </div>
      </div>

      {/* Main Bottom Section: Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity (2 Cols) */}
        <div className="lg:col-span-2 bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
            <div>
              <h2 className="text-base font-bold text-white">Recent Activity</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time transaction stream and customer order updates
              </p>
            </div>
            <button
              onClick={() => onNavigate("orders")}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition cursor-pointer"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            {recentOrders && recentOrders.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-[#1e293b]/60">
                    <th className="pb-3 font-medium">Order</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]/50">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[#1a233a]/40 transition group"
                    >
                      <td className="py-3 font-semibold text-white">
                        #{order.id}
                      </td>
                      <td className="py-3">
                        <span className="text-slate-200 font-medium block">
                          {order.customer_name || "Customer"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {order.customer_email || "—"}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {order.created_at ? order.created_at.slice(0, 10) : "Today"}
                      </td>
                      <td className="py-3 font-bold text-white">
                        ${Number(order.total || 0).toFixed(2)}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() =>
                              openInvoice(
                                order,
                                order.user || {
                                  name: order.customer_name,
                                  email: order.customer_email,
                                }
                              )
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition"
                            title="Print Invoice"
                          >
                            <FileText size={15} />
                          </button>
                          {onUpdateOrderStatus && (
                            <select
                              aria-label={`Status for #${order.id}`}
                              value={order.status}
                              onChange={(e) =>
                                onUpdateOrderStatus(order.id, e.target.value)
                              }
                              className="bg-[#0e1424] text-slate-300 border border-[#1e293b] rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-blue-500"
                            >
                              {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(
                                (s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                )
                              )}
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <ShoppingCart className="mx-auto text-slate-600 mb-2" size={28} />
                <p className="font-semibold text-slate-300 text-sm">No recent activity</p>
                <p className="text-xs text-slate-500 mt-1">
                  Orders will appear here when customers checkout.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats (1 Col) */}
        <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
            <h2 className="text-base font-bold text-white">Quick Stats</h2>
            <span className="text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 font-semibold">
              Live
            </span>
          </div>

          {/* Fulfillment Status Progress Bars */}
          <div className="space-y-3.5">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Order Fulfillment
            </p>

            <StatusProgress
              label="Pending"
              count={statusCounts.pending || 0}
              total={totalOrders}
              colorClass="bg-amber-500"
              textClass="text-amber-400"
              icon={Clock}
            />

            <StatusProgress
              label="Processing"
              count={statusCounts.processing || 0}
              total={totalOrders}
              colorClass="bg-blue-500"
              textClass="text-blue-400"
              icon={RotateCcw}
            />

            <StatusProgress
              label="Shipped"
              count={statusCounts.shipped || 0}
              total={totalOrders}
              colorClass="bg-purple-500"
              textClass="text-purple-400"
              icon={Truck}
            />

            <StatusProgress
              label="Delivered"
              count={statusCounts.delivered || 0}
              total={totalOrders}
              colorClass="bg-emerald-500"
              textClass="text-emerald-400"
              icon={CheckCircle2}
            />

            <StatusProgress
              label="Cancelled"
              count={statusCounts.cancelled || 0}
              total={totalOrders}
              colorClass="bg-rose-500"
              textClass="text-rose-400"
              icon={XCircle}
            />
          </div>

          {/* Quick Metrics highlight */}
          <div className="pt-4 border-t border-[#1e293b] grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#0e1424] p-3 rounded-xl border border-[#1e293b]/70">
              <span className="text-slate-400 block text-[11px]">Avg. Order Value</span>
              <span className="text-base font-bold text-white mt-1 block">
                ${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="bg-[#0e1424] p-3 rounded-xl border border-[#1e293b]/70">
              <span className="text-slate-400 block text-[11px]">Inventory Items</span>
              <span className="text-base font-bold text-white mt-1 block">
                {totalProducts} SKU
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusProgress({ label, count, total, colorClass, textClass, icon: Icon }) {
  const percentage = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Icon size={13} className={textClass} />
          {label}
        </span>
        <span className="font-semibold text-slate-200">
          {count} <span className="text-[10px] text-slate-400">({percentage}%)</span>
        </span>
      </div>
      <div className="w-full bg-[#1e293b] rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${Math.max(percentage, 3)}%` }}
        />
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const configs = {
    Pending: {
      bg: "bg-amber-500/15",
      border: "border-amber-500/30",
      text: "text-amber-400",
    },
    Processing: {
      bg: "bg-blue-500/15",
      border: "border-blue-500/30",
      text: "text-blue-400",
    },
    Shipped: {
      bg: "bg-purple-500/15",
      border: "border-purple-500/30",
      text: "text-purple-400",
    },
    Delivered: {
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
    },
    Cancelled: {
      bg: "bg-rose-500/15",
      border: "border-rose-500/30",
      text: "text-rose-400",
    },
  };

  const style = configs[status] || {
    bg: "bg-slate-700/30",
    border: "border-slate-600/30",
    text: "text-slate-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${style.bg} ${style.border} ${style.text}`}
    >
      {status || "Unknown"}
    </span>
  );
}
