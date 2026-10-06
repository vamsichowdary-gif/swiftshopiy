import React, { useState } from "react";
import {
  Users as UsersIcon,
  Search,
  RefreshCw,
  Shield,
  UserCheck,
  ShoppingBag,
} from "lucide-react";

export default function Users({
  users = [],
  onRefresh,
  loading = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const totalUsers = users.length;
  const adminCount = users.filter((u) =>
    ["admin", "super admin"].includes((u.role || "").toLowerCase())
  ).length;
  const customerCount = totalUsers - adminCount;

  const filteredUsers = users.filter((u) => {
    const roleMatch =
      roleFilter === "All" ||
      (roleFilter === "Admin"
        ? ["admin", "super admin"].includes((u.role || "").toLowerCase())
        : (u.role || "").toLowerCase() === "customer");

    const searchMatch =
      !searchTerm ||
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.user_id || "").toLowerCase().includes(searchTerm.toLowerCase());

    return roleMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Metric Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">Total Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 grid place-items-center">
              <UsersIcon size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{totalUsers}</p>
          <p className="text-[11px] text-slate-400 mt-1">Platform user registry</p>
        </div>

        <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">Customers</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 grid place-items-center">
              <UserCheck size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{customerCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Shoppers with cart & order history</p>
        </div>

        <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">Administrators</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 grid place-items-center">
              <Shield size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{adminCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Staff with dashboard management access</p>
        </div>
      </div>

      {/* Header and Controls */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UsersIcon size={20} className="text-emerald-400" />
              User Accounts Directory
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review customer profiles, roles, order histories, and membership dates
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 bg-[#1e293b] hover:bg-[#28354f] text-slate-200 text-xs font-semibold rounded-xl transition border border-[#2b3a56] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#1e293b]">
          <div className="flex items-center gap-1.5">
            {["All", "Customer", "Admin"].map((r) => {
              const active = roleFilter === r;
              return (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                      : "bg-[#0e1424] text-slate-400 hover:text-slate-200 border border-[#1e293b]"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[240px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search user ID, username, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0e1424] text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0e1424] text-slate-400 border-b border-[#1e293b]">
                <th className="py-3.5 px-4 font-semibold">User ID</th>
                <th className="py-3.5 px-4 font-semibold">Username</th>
                <th className="py-3.5 px-4 font-semibold">Full Name</th>
                <th className="py-3.5 px-4 font-semibold">Email</th>
                <th className="py-3.5 px-4 font-semibold">Role</th>
                <th className="py-3.5 px-4 font-semibold">Orders</th>
                <th className="py-3.5 px-4 font-semibold text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isAdminRole = ["admin", "super admin"].includes(
                    (u.role || "").toLowerCase()
                  );
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-[#1a233a]/40 transition group"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-blue-400">
                        {u.user_id || `#${u.id}`}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {u.username ? `@${u.username}` : "—"}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-white">
                        {u.name}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">{u.email}</td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                            isAdminRole
                              ? "bg-purple-500/15 border-purple-500/30 text-purple-400"
                              : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                          }`}
                        >
                          {isAdminRole && <Shield size={11} />}
                          {u.role || "Customer"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <ShoppingBag size={12} className="text-slate-500" />
                          {u.orders_count ?? 0}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-right">
                        {u.created_at ? u.created_at.slice(0, 10) : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <UsersIcon className="mx-auto text-slate-600 mb-2" size={32} />
                    <p className="font-semibold text-slate-300 text-sm">
                      No accounts matched
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchTerm
                        ? `No users matching "${searchTerm}"`
                        : "No user records found in database."}
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
