import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";
import Orders from "./Orders";
import Products from "./Products";
import Users from "./Users";
import Support from "./Support";
import FlashDealsManager from "./FlashDealsManager";
import {
  fetchAdminOverview,
  fetchAdminOrders,
  fetchAdminUsers,
  fetchAdminSupportTickets,
  fetchProducts,
  updateAdminOrderStatus,
} from "./api";

export default function AdminApp({ user, token, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [overview, setOverview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("All");
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load all admin data
  const loadOverview = useCallback(async () => {
    try {
      const data = await fetchAdminOverview(token);
      setOverview(data);
    } catch (err) {
      console.error("Failed to load overview:", err);
    }
  }, [token]);

  const loadOrders = useCallback(
    async (status = orderFilter) => {
      try {
        const data = await fetchAdminOrders(token, status);
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders:", err);
      }
    },
    [token, orderFilter]
  );

  const loadProducts = useCallback(async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchAdminUsers(token);
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  }, [token]);

  const loadSupportTickets = useCallback(async () => {
    try {
      const data = await fetchAdminSupportTickets(token);
      setTickets(data);
    } catch (err) {
      console.error("Failed to load support tickets:", err);
    }
  }, [token]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([
      loadOverview(),
      loadOrders(),
      loadProducts(),
      loadUsers(),
      loadSupportTickets(),
    ]);
    setLoading(false);
  }, [loadOverview, loadOrders, loadProducts, loadUsers, loadSupportTickets]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Status changer for orders
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateAdminOrderStatus(token, orderId, newStatus);
      // Optimistically update orders in state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      loadOverview();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err.response?.data?.message || "Could not update order status.");
    }
  };

  const pendingCount = orders.filter(
    (o) => (o.status || "").toLowerCase() === "pending"
  ).length;
  const openTicketsCount = tickets.filter(
    (t) => (t.status || "").toLowerCase() === "open"
  ).length;

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      user={user}
      onLogout={onLogout}
      pendingOrdersCount={pendingCount}
      openTicketsCount={openTicketsCount}
    >
      {activeTab === "dashboard" && (
        <Dashboard
          overview={overview}
          orders={orders}
          productsCount={products.length}
          onNavigate={setActiveTab}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      )}

      {activeTab === "orders" && (
        <Orders
          orders={orders}
          orderFilter={orderFilter}
          onFilterChange={(val) => {
            setOrderFilter(val);
            loadOrders(val);
          }}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onRefresh={loadOrders}
          loading={loading}
        />
      )}

      {activeTab === "products" && (
        <Products
          products={products}
          token={token}
          onRefresh={loadProducts}
          loading={loading}
        />
      )}

      {activeTab === "flash-deals" && (
        <FlashDealsManager token={token} />
      )}

      {activeTab === "users" && (
        <Users users={users} onRefresh={loadUsers} loading={loading} />
      )}

      {activeTab === "support" && (
        <Support
          tickets={tickets}
          token={token}
          onRefresh={loadSupportTickets}
          loading={loading}
        />
      )}
    </AdminLayout>
  );
}
