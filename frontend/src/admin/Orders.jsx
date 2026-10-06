import React, { useState } from "react";
import {
  Search,
  FileText,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";
import { StatusBadge } from "./Dashboard";
import { openInvoice } from "../utils/invoice";

export default function Orders({
  orders = [],
  orderFilter = "All",
  onFilterChange,
  onUpdateOrderStatus,
  onRefresh,
  loading = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const filters = [
    "All",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      orderFilter === "All" ||
      (order.status || "").toLowerCase() === orderFilter.toLowerCase();

    const matchesSearch =
      !searchTerm ||
      String(order.id).includes(searchTerm) ||
      (order.customer_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.customer_email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.user?.user_id || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const toggleExpand = (id) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag size={20} className="text-purple-400" />
              Customer Orders
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track customer purchases, update order stages, and print invoices
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 bg-[#1e293b] hover:bg-[#28354f] text-slate-200 text-xs font-semibold rounded-xl transition border border-[#2b3a56] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh Orders
          </button>
        </div>

        {/* Filter Pills and Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-[#1e293b]">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {filters.map((status) => {
              const count =
                status === "All"
                  ? orders.length
                  : orders.filter(
                      (o) =>
                        (o.status || "").toLowerCase() === status.toLowerCase()
                    ).length;

              const active = orderFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => onFilterChange(status)}
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

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search by ID, name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0e1424] text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0e1424] text-slate-400 border-b border-[#1e293b]">
                <th className="py-3.5 px-4 font-semibold">Order</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Items</th>
                <th className="py-3.5 px-4 font-semibold">Total</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Update Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const items = Array.isArray(order.items)
                    ? order.items
                    : typeof order.items === "string"
                    ? JSON.parse(order.items || "[]")
                    : [];
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-[#1a233a]/40 transition group">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <button
                            onClick={() => toggleExpand(order.id)}
                            className="inline-flex items-center gap-1.5 hover:text-blue-400 transition"
                          >
                            #{order.id}
                            {items.length > 0 &&
                              (isExpanded ? (
                                <ChevronUp size={14} className="text-slate-400" />
                              ) : (
                                <ChevronDown size={14} className="text-slate-400" />
                              ))}
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">
                            {order.customer_name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {order.customer_email}
                          </div>
                          {order.user?.user_id && (
                            <span className="text-[10px] text-blue-400/80">
                              UID: {order.user.user_id}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-400">
                          {order.created_at
                            ? order.created_at.slice(0, 10)
                            : "Recent"}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleExpand(order.id)}
                            className="inline-flex items-center gap-1 text-slate-300 hover:text-blue-400 transition"
                          >
                            <Package size={13} className="text-slate-400" />
                            <span>{items.length} {items.length === 1 ? "item" : "items"}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-white">
                          ${Number(order.total || 0).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusBadge status={order.status} />
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            aria-label={`Change status for order ${order.id}`}
                            value={order.status}
                            onChange={(e) =>
                              onUpdateOrderStatus(order.id, e.target.value)
                            }
                            className="bg-[#0e1424] text-slate-200 border border-[#1e293b] rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            {[
                              "Pending",
                              "Processing",
                              "Shipped",
                              "Delivered",
                              "Cancelled",
                            ].map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] hover:bg-[#28354f] text-slate-200 hover:text-white rounded-xl border border-[#2b3a56] font-semibold transition"
                            title="Print or view invoice"
                          >
                            <FileText size={13} />
                            <span>Invoice</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Order Details Row */}
                      {isExpanded && (
                        <tr className="bg-[#0b101c]/80 border-b border-[#1e293b]">
                          <td colSpan={8} className="p-4 sm:px-6">
                            <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-4 space-y-3">
                              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Order Items Breakdown (#{order.id})
                              </h4>
                              {items.length > 0 ? (
                                <div className="divide-y divide-[#1e293b]">
                                  {items.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="py-2.5 flex items-center justify-between text-xs"
                                    >
                                      <div className="flex items-center gap-3">
                                        {item.image && (
                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-9 h-9 rounded-lg object-cover bg-slate-900 border border-slate-700"
                                          />
                                        )}
                                        <div>
                                          <p className="font-semibold text-white">
                                            {item.name || `Product #${item.id || idx + 1}`}
                                          </p>
                                          <p className="text-[11px] text-slate-400">
                                            Qty: {item.qty || 1} × $
                                            {Number(item.price || 0).toFixed(2)}
                                          </p>
                                        </div>
                                      </div>
                                      <span className="font-bold text-white">
                                        $
                                        {(
                                          (item.qty || 1) *
                                          Number(item.price || 0)
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400">
                                  No specific line item metadata recorded for this order.
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ShoppingBag
                      className="mx-auto text-slate-600 mb-2"
                      size={32}
                    />
                    <p className="font-semibold text-slate-300 text-sm">
                      No orders found
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchTerm
                        ? `No matching orders for "${searchTerm}"`
                        : `No orders in "${orderFilter}" status.`}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
