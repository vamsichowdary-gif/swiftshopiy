import React from "react";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQty,
  onRemoveItem,
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Calculate subtotal supporting both qty and quantity
  const total = cartItems.reduce((sum, item) => {
    const quantity = item.qty ?? item.quantity ?? 1;
    const price = parseFloat(item.price || 0);
    return sum + price * quantity;
  }, 0);

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-lg">Your Cart</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <ShoppingBag className="w-12 h-12 stroke-1 mb-2" />
                <p className="font-semibold text-slate-600">Your cart is empty</p>
                <p className="text-xs text-slate-400 mt-1">Add items to get started.</p>
              </div>
            ) : (
              cartItems.map((item) => {
                const currentQty = item.qty ?? item.quantity ?? 1;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl bg-white border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-slate-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-indigo-600 font-bold mt-0.5">
                        ${parseFloat(item.price).toFixed(2)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="inline-flex items-center border border-slate-200 bg-white rounded-lg">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, currentQty - 1)}
                            className="p-1 text-slate-500 hover:text-slate-900"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-slate-800">
                            {currentQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, currentQty + 1)}
                            className="p-1 text-slate-500 hover:text-slate-900"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 ml-auto"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer / Summary */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-slate-100 space-y-3 bg-slate-50/50">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-900">${total.toFixed(2)}</span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white font-semibold py-3 rounded-xl shadow-md transition text-sm cursor-pointer"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}