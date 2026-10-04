import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

// Components & Pages
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
import AdminDashboard from "./AdminPanel";
import { ProfilePage, OrdersPage, AddressesPage, SupportPage } from "./pages/CustomerPages";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
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
      const res = await axios.get("https://swiftshopiy-backned.onrender.com/api/products");
      const formatted = res.data.map((item) => ({
        ...item,
        price: parseFloat(item.price),
        rating: parseFloat(item.rating || 5.0),
      }));
      setProducts(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
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
    setIsCartOpen(true); // Automatically open the cart drawer when an item is added
  };

  // Update item quantity directly (+ / -)
  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, qty: newQty } : item))
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

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar
          user={user}
          onLogout={handleLogout}
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
        />

        {/* Render CartDrawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cart}
          onUpdateQty={updateCartQty}
          onRemoveItem={removeFromCart}
        />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home products={products} onAddToCart={addToCart} />} />
            <Route path="/shop" element={<Shop products={products} loading={loading} onAddToCart={addToCart} />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/admin/login" element={<Login onAuthSuccess={handleAuthSuccess} adminMode />} />
            <Route path="/register" element={<Register onAuthSuccess={handleAuthSuccess} />} />

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
              element={user && user.role === "Customer" ? <UserDashboard user={user} /> : <Navigate to="/login" replace />}
            >
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="support" element={<SupportPage />} />
            </Route>

            {/* Admin Dashboard */}
            <Route
              path="/admin"
              element={
                user && ["Admin", "Super Admin"].includes(user.role) ? (
                  <AdminDashboard token={token} onLogout={handleLogout} onBackToStore={() => { window.location.href = "/"; }} />
                ) : (
                  <Navigate to="/admin/login" replace />
                )
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}