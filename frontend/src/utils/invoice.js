import { generateBarcodeSvg, generateOrderIdentifiers } from "./barcode";

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));

export function openInvoice(order, customer = {}) {
  const invoiceWindow = window.open("", "_blank", "width=920,height=980");
  if (!invoiceWindow) {
    window.alert("Please allow pop-ups to open and print the invoice.");
    return;
  }

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

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity ?? item.qty ?? 1),
    0
  );
  const total = Number(order?.total || subtotal);
  const shipping = total > subtotal ? total - subtotal : 0;

  const rows = items
    .map((item) => {
      const quantity = Number(item.quantity ?? item.qty ?? 1);
      const price = Number(item.price ?? 0);
      const amount = price * quantity;
      return `
        <tr>
          <td>
            <div style="font-weight: 600; color: #0f172a;">${escapeHtml(item.name || "Item")}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">SKU: PROD-${escapeHtml(item.id || "001")}</div>
          </td>
          <td style="text-align: center; color: #334155;">${quantity}</td>
          <td style="text-align: right; color: #334155;">$${price.toFixed(2)}</td>
          <td style="text-align: right; font-weight: 600; color: #0f172a;">$${amount.toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  const barcodeSvg = generateBarcodeSvg(barcodeCode, {
    height: 48,
    barWidth: 2,
    color: "#0f172a",
    showText: true,
  });

  const issueDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

  const customerName = customer?.name || order?.customer_name || "Valued Customer";
  const customerEmail = customer?.email || order?.customer_email || "customer@example.com";
  const customerId = customer?.user_id || (customer?.id ? `SW${String(customer.id).padStart(6, "0")}` : "");

  invoiceWindow.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>SwiftShop - ${escapeHtml(invoiceId)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 40px 20px;
      background: #f1f5f9;
      -webkit-font-smoothing: antialiased;
    }
    .print-bar {
      max-width: 840px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #2563eb;
      color: #ffffff;
      padding: 10px 20px;
      border: 0;
      border-radius: 10px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37,99,235,0.25);
      transition: background 0.15s;
    }
    .btn:hover { background: #1d4ed8; }
    .sheet {
      max-width: 840px;
      margin: 0 auto;
      background: #ffffff;
      padding: 56px 64px;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 30px -10px rgba(15,23,42,0.08);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
    }
    .brand-mark {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #2563eb;
      color: #ffffff;
      display: grid;
      place-items: center;
      font-size: 19px;
      font-weight: 900;
      letter-spacing: -1px;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .title {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 18px;
      letter-spacing: -0.8px;
    }
    .badge-paid {
      display: inline-block;
      padding: 4px 12px;
      background: #dcfce7;
      color: #15803d;
      font-size: 11px;
      font-weight: 700;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding: 20px 0;
      border-top: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 32px;
    }
    .meta-col .label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.6px;
      margin-bottom: 4px;
    }
    .meta-col .val {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .addresses {
      display: flex;
      justify-content: space-between;
      gap: 32px;
      margin-bottom: 36px;
    }
    .addr-box { flex: 1; }
    .addr-box .label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 800;
      color: #2563eb;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
    }
    .addr-box p {
      margin: 3px 0;
      font-size: 13px;
      color: #475569;
      line-height: 1.5;
    }
    .addr-box .name {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    .barcode-container {
      width: 220px;
      text-align: center;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #f8fafc;
    }
    .barcode-title {
      font-size: 9px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    thead th {
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.8px;
      padding: 12px 14px;
      border-bottom: 1.5px solid #e2e8f0;
      background: #f8fafc;
    }
    tbody td {
      padding: 14px;
      font-size: 13px;
      border-bottom: 1px solid #f1f5f9;
    }
    .bottom-layout {
      display: flex;
      justify-content: space-between;
      gap: 32px;
      padding-top: 12px;
    }
    .payment-info {
      flex: 1;
      background: #f8fafc;
      padding: 18px 20px;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
    }
    .payment-info .h {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }
    .payment-info p {
      font-size: 12px;
      color: #64748b;
      margin: 4px 0;
    }
    .payment-info strong { color: #0f172a; }
    .totals {
      width: 320px;
      margin-left: auto;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #64748b;
      padding: 5px 0;
    }
    .total-box {
      margin-top: 14px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-box .ttl-label {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      color: #1e40af;
      letter-spacing: 0.5px;
    }
    .total-box .ttl-val {
      font-size: 26px;
      font-weight: 900;
      color: #1e3a8a;
      letter-spacing: -0.5px;
    }
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #f1f5f9;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .sheet { box-shadow: none; border: 0; padding: 24px 32px; max-width: 100%; }
      .print-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <div style="font-size: 13px; color: #64748b; font-weight: 500;">
      Official Customer Invoice · Generated by SwiftShop
    </div>
    <button class="btn" onclick="window.print()">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="sheet">
    <div class="header">
      <div>
        <div class="brand-mark">
          <div class="brand-logo">S</div>
          <div class="brand-name">SwiftShop</div>
        </div>
        <div class="title">Invoice</div>
      </div>
      <div style="text-align: right;">
        <span class="badge-paid">Paid & Fulfilled</span>
        <div style="font-size: 11px; color: #64748b; margin-top: 8px;">All amounts in USD $</div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-col">
        <div class="label">Invoice Number</div>
        <div class="val" style="color: #2563eb;">${escapeHtml(invoiceId)}</div>
      </div>
      <div class="meta-col">
        <div class="label">Order ID</div>
        <div class="val">${escapeHtml(orderIdFormatted)}</div>
      </div>
      <div class="meta-col">
        <div class="label">Issued On</div>
        <div class="val">${escapeHtml(issueDate)}</div>
      </div>
      <div class="meta-col">
        <div class="label">Payment Status</div>
        <div class="val" style="color: #16a34a;">Paid in Full</div>
      </div>
    </div>

    <div class="addresses">
      <div class="addr-box">
        <div class="label">From</div>
        <p class="name">SwiftShop Global Retail LLC</p>
        <p>10 Commerce Way, Suite 400</p>
        <p>Seattle, WA 98101, USA</p>
        <p>support@swiftshop.com</p>
      </div>

      <div class="addr-box">
        <div class="label">Bill To</div>
        <p class="name">${escapeHtml(customerName)}</p>
        <p>${escapeHtml(customerEmail)}</p>
        ${customerId ? `<p style="font-size: 11px; color: #2563eb; font-weight: 600;">Customer ID: ${escapeHtml(customerId)}</p>` : ""}
        ${order?.shipping_address ? `<p>${escapeHtml(order.shipping_address)}</p>` : ""}
      </div>

      <div class="barcode-container">
        <div class="barcode-title">Order Scannable Barcode</div>
        ${barcodeSvg}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="4" style="text-align:center; padding: 20px; color:#94a3b8;">Order products list unavailable</td></tr>'}
      </tbody>
    </table>

    <div class="bottom-layout">
      <div class="payment-info">
        <div class="h">Payment Confirmation</div>
        <p>Method: <strong>Online Checkout (Credit/Debit Card)</strong></p>
        <p>Status: <strong style="color: #16a34a;">Authorized & Cleared</strong></p>
        <p>Reference: <strong>REF-${escapeHtml(String(order?.id || "001"))}-${escapeHtml(issueDate.replace(/[^0-9]/g, ""))}</strong></p>
      </div>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="totals-row">
          <span>Shipping & Handling</span>
          <span>${shipping > 0 ? `$${shipping.toFixed(2)}` : "Free"}</span>
        </div>
        <div class="totals-row">
          <span>Estimated Tax</span>
          <span>$0.00</span>
        </div>
        <div class="total-box">
          <div class="ttl-label">Total Amount</div>
          <div class="ttl-val">$${total.toFixed(2)}</div>
        </div>
      </div>
    </div>

    <div class="footer">
      Thank you for your order! If you have any inquiries, visit <strong>swiftshop.com/contact</strong> or reference invoice #${escapeHtml(invoiceId)}.
    </div>
  </div>
</body>
</html>`);
  invoiceWindow.document.close();
}

export const downloadInvoice = openInvoice;
