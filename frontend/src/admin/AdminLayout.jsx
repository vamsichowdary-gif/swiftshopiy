import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  DollarSign,
  Package,
  Users,
  MessageSquare,
  Monitor,
  ChevronsLeft,
  ChevronsRight,
  Bell,
  Moon,
  Sun,
  User,
  Zap,
  ChevronDown,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout({
  activeTab = "dashboard",
  onTabChange,
  user,
  onLogout,
  pendingOrdersCount = 0,
  openTicketsCount = 0,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "orders",
      label: "Sales",
      icon: DollarSign,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : 3,
      badgeColor: "bg-blue-600",
    },
    {
      id: "view-site",
      label: "View Site",
      icon: Monitor,
      isExternal: true,
      href: "/",
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
    },
    {
      id: "support",
      label: "Support",
      icon: MessageSquare,
      badge: openTicketsCount > 0 ? openTicketsCount : null,
      badgeColor: "bg-purple-600",
    },
  ];

  const handleNavClick = (item) => {
    if (item.isExternal) {
      window.open(item.href, "_blank");
      return;
    }
    if (onTabChange) {
      onTabChange(item.id);
    }
    setMobileSidebarOpen(false);
  };

  const getHeaderInfo = () => {
    switch (activeTab) {
      case "dashboard":
        return {
          title: "Dashboard",
          subtitle: "Welcome back to your dashboard",
        };
      case "orders":
        return {
          title: "Sales & Orders",
          subtitle: "Monitor revenue stream and process customer fulfillment",
        };
      case "products":
        return {
          title: "Products Inventory",
          subtitle: "Manage product listings, pricing, and stock details",
        };
      case "users":
        return {
          title: "User Accounts",
          subtitle: "View customer profiles, registrations, and account roles",
        };
      case "support":
        return {
          title: "Support Desk",
          subtitle: "Review incoming customer inquiries and send responses",
        };
      default:
        return {
          title: "Admin Panel",
          subtitle: "SwiftShop control console",
        };
    }
  };

  const headerInfo = getHeaderInfo();
  const adminDisplayName = user?.name || user?.username || "TomIsLoading";

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar matching the uploaded image */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:static bg-[#0e1424] border-r border-[#1a233a] flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
          collapsed ? "lg:w-[72px]" : "lg:w-[240px]"
        } ${
          mobileSidebarOpen
            ? "translate-x-0 w-[240px]"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand / Profile Card at Top */}
        <div className="p-4 border-b border-[#1a233a]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-900/40 shrink-0">
                <Zap size={18} fill="currentColor" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="font-bold text-white text-xs truncate leading-tight">
                    {adminDisplayName}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                    Pro Plan
                  </p>
                </div>
              )}
            </div>

            {!collapsed && (
              <ChevronDown size={14} className="text-slate-500 shrink-0" />
            )}

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-xl text-xs font-semibold transition group cursor-pointer ${
                  collapsed
                    ? "justify-center p-3"
                    : "justify-between px-3.5 py-2.5"
                } ${
                  isActive
                    ? "bg-[#1d4ed8] text-white shadow-md shadow-blue-900/30"
                    : "text-slate-400 hover:text-white hover:bg-[#151e36]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    size={17}
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-white transition"
                    }
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && item.badge != null && (
                  <span
                    className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor || "bg-blue-600"}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Collapse Toggle & Sign Out */}
        <div className="p-3 border-t border-[#1a233a]/60 space-y-1">
          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full hidden lg:flex items-center rounded-xl text-xs text-slate-400 hover:text-white hover:bg-[#151e36] p-2.5 transition cursor-pointer ${
              collapsed ? "justify-center" : "gap-2.5"
            }`}
            title={collapsed ? "Expand sidebar" : "Hide sidebar"}
          >
            {collapsed ? (
              <ChevronsRight size={16} />
            ) : (
              <>
                <ChevronsLeft size={16} />
                <span className="font-semibold text-xs">&lt;&lt; Hide</span>
              </>
            )}
          </button>

          {/* Quick Logout */}
          <button
            onClick={onLogout}
            className={`w-full flex items-center rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-[#151e36] p-2.5 transition cursor-pointer ${
              collapsed ? "justify-center" : "gap-2.5"
            }`}
            title="Sign out of Admin"
          >
            <LogOut size={16} />
            {!collapsed && <span className="font-semibold">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar matching the screenshot */}
        <header className="h-20 px-6 sm:px-8 border-b border-[#1a233a]/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#131b2e] border border-[#1e293b] text-slate-300"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                {headerInfo.title}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {headerInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Header Action Buttons on Right */}
          <div className="flex items-center gap-2.5">
            {/* Notification Bell with red dot indicator */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-10 h-10 rounded-xl bg-[#131b2e] border border-[#1e293b] flex items-center justify-center text-slate-300 hover:border-slate-600 transition cursor-pointer relative"
                title="Notifications"
              >
                <Bell size={17} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#131b2e]" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#131b2e] border border-[#1e293b] rounded-2xl p-4 shadow-2xl z-50 text-xs space-y-2 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
                    <span className="font-bold text-white">Notifications</span>
                    <span className="text-[10px] text-blue-400 font-medium">3 unread</span>
                  </div>
                  <div className="space-y-2 text-slate-300">
                    <div className="p-2 bg-[#0e1424] rounded-lg border border-[#1e293b]">
                      <p className="font-semibold text-white">New order received</p>
                      <p className="text-[11px] text-slate-400">Order #124 was placed</p>
                    </div>
                    <div className="p-2 bg-[#0e1424] rounded-lg border border-[#1e293b]">
                      <p className="font-semibold text-white">Support ticket filed</p>
                      <p className="text-[11px] text-slate-400">Customer requested shipping update</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Moon / Theme Toggle Icon */}
            <button
              className="w-10 h-10 rounded-xl bg-[#131b2e] border border-[#1e293b] flex items-center justify-center text-slate-300 hover:border-slate-600 transition cursor-pointer"
              title="Dark Mode Activated"
            >
              <Moon size={17} />
            </button>

            {/* User Profile Avatar with dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-10 h-10 rounded-xl bg-[#131b2e] border border-[#1e293b] flex items-center justify-center text-slate-300 hover:border-slate-600 transition cursor-pointer"
                title="Account profile"
              >
                <User size={17} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#131b2e] border border-[#1e293b] rounded-2xl p-2 shadow-2xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#1e293b]">
                    <p className="font-bold text-white truncate">
                      {user?.name || "Administrator"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {user?.email || "admin@swiftshop.com"}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      {user?.role || "Admin"}
                    </span>
                  </div>
                  <Link
                    to="/"
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-[#1e293b] rounded-xl transition"
                  >
                    <ExternalLink size={14} />
                    <span>View Customer Store</span>
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-[#1e293b] rounded-xl transition text-left cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
