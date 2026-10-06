import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import axios from "axios";

// Customer Components & Pages
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import UserDashboard from "./pages/UserDashboard";
import {
  ProfilePage,
  OrdersPage,
  AddressesPage,
  SupportPage,
} from "./pages/CustomerPages";
import DashboardOverview from "./pages/DashboardOverview";
import NewsTicker from "./components/NewsTicker";

// Dedicated Admin Portal
import AdminApp from "./admin";
import AdminLogin from "./admin/AdminLogin";
import { API_BASE_URL } from "./admin/api";

function StoreLayout({
  user,
  onLogout,
  cartCount,
  onOpenCart,
  isCartOpen,
  onCloseCart,
  cart,
  onUpdateQty,
  onRemoveItem,
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <NewsTicker theme="light" />
      <Navbar
        user={user}
        onLogout={onLogout}
        cartCount={cartCount}
        onOpenCart={onOpenCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={onCloseCart}
        cartItems={cart}
        onUpdateQty={onUpdateQty}
        onRemoveItem={onRemoveItem}
      />

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  // Separate Customer (User) Session
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("swiftshop_user") || localStorage.getItem("user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(
    () => localStorage.getItem("swiftshop_token") || localStorage.getItem("token") || ""
  );

  // Separate Admin Session
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem("swiftshop_admin_user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [adminToken, setAdminToken] = useState(
    () => localStorage.getItem("swiftshop_admin_token") || ""
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize cart from localStorage so it persists across refreshes
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("swiftshop_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save cart changes to localStorage
  useEffect(() => {
    localStorage.setItem("swiftshop_cart", JSON.stringify(cart));
  }, [cart]);

  // Synchronize Products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/products`);
      const data = res.data;
      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : data?.products || [];

      setProducts(productList);
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUserAuthSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("swiftshop_user", JSON.stringify(userData));
    localStorage.setItem("swiftshop_token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
  };

  const handleUserLogout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("swiftshop_user");
    localStorage.removeItem("swiftshop_token");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const handleAdminAuthSuccess = (adminData, adminTokenVal) => {
    setAdminUser(adminData);
    setAdminToken(adminTokenVal);
    localStorage.setItem("swiftshop_admin_user", JSON.stringify(adminData));
    localStorage.setItem("swiftshop_admin_token", adminTokenVal);
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setAdminToken("");
    localStorage.removeItem("swiftshop_admin_user");
    localStorage.removeItem("swiftshop_admin_token");
  };

  // Add item or increment qty
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: (item.qty || 1) + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  // Update item quantity directly (+ / -)
  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, qty: newQty } : item
      )
    );
  };

  // Remove single item
  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // Clear entire cart after successful order placement
  const clearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  // Normalize roles
  const userRole = (user?.role || "customer").toLowerCase();
  const adminRole = (adminUser?.role || "").toLowerCase();
  const isAdmin =
    Boolean(adminToken) &&
    Boolean(adminUser) &&
    ["admin", "super admin"].includes(adminRole);

  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Store Layout - Includes Customer Navbar and Cart Drawer */}
        <Route
          element={
            <StoreLayout
              user={user}
              onLogout={handleUserLogout}
              cartCount={totalCartCount}
              onOpenCart={() => setIsCartOpen(true)}
              isCartOpen={isCartOpen}
              onCloseCart={() => setIsCartOpen(false)}
              cart={cart}
              onUpdateQty={updateCartQty}
              onRemoveItem={removeFromCart}
            />
          }
        >
          <Route
            path="/"
            element={<Home products={products} onAddToCart={addToCart} />}
          />
          <Route
            path="/shop"
            element={
              <Shop
                products={products}
                loading={loading}
                onAddToCart={addToCart}
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/login"
            element={<Login onAuthSuccess={handleUserAuthSuccess} />}
          />
          <Route
            path="/register"
            element={<Register onAuthSuccess={handleUserAuthSuccess} />}
          />

          {/* Checkout Route */}
          <Route
            path="/checkout"
            element={
              <Checkout
                cart={cart}
                onClearCart={clearCart}
                user={user}
                token={token}
              />
            }
          />

          {/* Protected Customer Dashboard */}
          <Route
            path="/dashboard"
            element={
              user ? (
                <UserDashboard user={user} token={token} onLogout={handleUserLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="addresses" element={<AddressesPage />} />
            <Route path="support" element={<SupportPage />} />
          </Route>
        </Route>

        {/* Dedicated Admin Portal Routes - Direct URL access, No Customer Navbar */}
        <Route
          path="/admin/login"
          element={
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLogin onAuthSuccess={handleAdminAuthSuccess} />
            )
          }
        />

        <Route
          path="/admin"
          element={
            isAdmin ? (
              <AdminApp
                user={adminUser}
                token={adminToken}
                onLogout={handleAdminLogout}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/admin/*"
          element={
            isAdmin ? (
              <AdminApp
                user={adminUser}
                token={adminToken}
                onLogout={handleAdminLogout}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
