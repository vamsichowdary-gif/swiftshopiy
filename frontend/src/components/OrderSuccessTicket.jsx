import React from "react";
import { CheckCircle2, FileText, ArrowRight, ShoppingBag, CreditCard } from "lucide-react";
import { openInvoice } from "../utils/invoice";
import { generateBarcodeSvg, generateOrderIdentifiers } from "../utils/barcode";

export default function OrderSuccessTicket({
  order,
  customer = {},
  onContinueShopping,
  onViewOrders,
  cutoutBg = "bg-[#faf9f6]",
}) {
  const { orderIdFormatted, invoiceId, barcodeCode } = generateOrderIdentifiers(order?.id);

  let items = [];
  if (Array.isArray(order?.items)) {
    items = order.items;
  } else if (typeof order?.items === "string") {
    try {
      items = JSON.parse(order.items);
    } catch (e) {
      items = [];
    }
  }

  const dateStr = order?.created_at
    ? new Date(order.created_at).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  const barcodeSvgHtml = generateBarcodeSvg(barcodeCode, {
    height: 44,
    barWidth: 2,
    color: "#f8fafc",
    bg: "transparent",
    showText: true,
  });

  return (
    <div className="max-w-md mx-auto my-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Ticket Card with Notches */}
      <div className="relative bg-[#111827] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 overflow-hidden">
        {/* Left and Right Ticket Cutout Notches */}
        <div className={`absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full ${cutoutBg} border border-slate-300/40 z-20 pointer-events-none shadow-inner`} />
        <div className={`absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-full ${cutoutBg} border border-slate-300/40 z-20 pointer-events-none shadow-inner`} />

        {/* Top Header with glowing checkmark */}
        <div className="text-center pt-2 pb-6 border-b border-dashed border-slate-800">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 grid place-items-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Thank you!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Your order has been placed and confirmed successfully
          </p>
        </div>

        {/* Order Details Grid */}
        <div className="py-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#1a2234] p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Order ID
              </span>
              <span className="font-mono font-bold text-white mt-0.5 block truncate">
                {orderIdFormatted}
              </span>
            </div>

            <div className="bg-[#1a2234] p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Invoice ID
              </span>
              <span className="font-mono font-bold text-blue-400 mt-0.5 block truncate">
                {invoiceId}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#1a2234] p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Amount Paid
              </span>
              <span className="text-lg font-black text-emerald-400 mt-0.5 block">
                ${Number(order?.total || 0).toFixed(2)}
              </span>
            </div>

            <div className="bg-[#1a2234] p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Date & Time
              </span>
              <span className="font-medium text-slate-300 mt-0.5 block text-[11px] leading-tight">
                {dateStr}
              </span>
            </div>
          </div>

          {/* Payment Method Pill */}
          <div className="bg-[#1a2234] p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 grid place-items-center">
                <CreditCard size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {customer.name || order?.customer_name || "Online Checkout"}
                </p>
                <p className="text-[10px] text-slate-400">
                  Paid securely via Card · Confirmed
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              PAID
            </span>
          </div>

          {/* Scannable Barcode */}
          <div className="bg-[#1a2234] p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block mb-2">
              Official Scannable Barcode
            </span>
            <div
              className="barcode-svg-wrapper flex justify-center"
              dangerouslySetInnerHTML={{ __html: barcodeSvgHtml }}
            />
          </div>

          {/* Products Summary Down Below */}
          {items.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-2">
                Order Items ({items.length})
              </span>
              <div className="bg-[#1a2234] rounded-2xl border border-slate-800 divide-y divide-slate-800/80 max-h-44 overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate text-xs">
                          {item.name || `Product #${item.id || idx + 1}`}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Qty: {item.quantity || item.qty || 1} × ${Number(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-white shrink-0 ml-2">
                      ${(Number(item.price || 0) * Number(item.quantity || item.qty || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2 border-t border-dashed border-slate-800">
          <button
            onClick={() => openInvoice(order, customer)}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-900/40 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText size={15} />
            <span>Download / Print Official Invoice</span>
          </button>

          {onViewOrders && (
            <button
              onClick={onViewOrders}
              className="w-full py-2.5 px-4 bg-[#1a2234] hover:bg-[#222d45] text-slate-200 rounded-xl font-semibold text-xs border border-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View in Order History</span>
              <ArrowRight size={14} />
            </button>
          )}

          {onContinueShopping && (
            <button
              onClick={onContinueShopping}
              className="w-full py-2 text-slate-400 hover:text-white text-xs font-medium transition cursor-pointer"
            >
              Continue Shopping
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
