import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, ShieldCheck, ShoppingBag, FileText, ArrowRight } from "lucide-react";
import { openInvoice } from "../utils/invoice";

import OrderSuccessTicket from "../components/OrderSuccessTicket";

export default function Checkout({ cart = [], onClearCart, user, token }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderComplete, setOrderComplete] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const subtotal = cart.reduce((sum, item) => {
    const qty = item.qty ?? item.quantity ?? 1;
    return sum + parseFloat(item.price || 0) * qty;
  }, 0);

  const shipping = subtotal > 0 ? (subtotal > 100 ? 0 : 9.99) : 0;
  const total = subtotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        customer_name: formData.name,
        customer_email: formData.email,
        total: parseFloat(total.toFixed(2)),
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.qty ?? item.quantity ?? 1,
          image: item.image || "",
        })),
      };

      const authToken = token || localStorage.getItem("token") || localStorage.getItem("swiftshop_token");
      const config = {
        headers: {
          Accept: "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      };

      const res = await axios.post("https://swiftshopiy-backned.onrender.com/api/checkout", payload, config);
      const createdOrder = res.data?.order || {
        ...payload,
        id: res.data?.id || Date.now(),
        created_at: new Date().toISOString(),
      };

      setPlacedOrder(createdOrder);
      onClearCart();
      setOrderComplete(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to process order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete && placedOrder) {
    return (
      <main className="min-h-[90vh] bg-[#faf9f6] text-slate-950 py-12 px-4 relative overflow-hidden flex flex-col justify-center">
        {/* Subtle Luxury Ambient Mesh Glow matching Store Palette */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#e3eae1]/70 via-[#f0f4ee]/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-xl mx-auto w-full">
          <OrderSuccessTicket
            order={placedOrder}
            customer={user || { name: formData.name, email: formData.email }}
            onViewOrders={() => navigate("/dashboard/orders")}
            onContinueShopping={() => navigate("/shop")}
            cutoutBg="bg-[#faf9f6]"
          />
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
        <ShoppingBag className="w-14 h-14 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
        <p className="text-xs text-slate-500 mt-1">Add items before checking out.</p>
        <button
          onClick={() => navigate("/shop")}
          className="mt-5 px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
        >
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Checkout</h1>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-base">Contact & Shipping Details</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5" />
            {loading ? "Placing Order..." : `Pay $${total.toFixed(2)} & Place Order`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit space-y-4">
          <h2 className="font-bold text-slate-900 text-base">Order Summary</h2>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {cart.map((item) => {
              const qty = item.qty ?? item.quantity ?? 1;
              return (
                <div key={item.id} className="py-3 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">Qty: {qty}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    ${(parseFloat(item.price) * qty).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-100 pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}