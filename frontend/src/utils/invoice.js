const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}[char]));

export function openInvoice(order, customer = {}) {
  const invoiceWindow = window.open("", "_blank", "width=900,height=800");
  if (!invoiceWindow) {
    window.alert("Allow pop-ups to open and print the invoice.");
    return;
  }

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

  const rows = items.map((item) => {
    const quantity = Number(item.quantity ?? item.qty ?? 1);
    const price = Number(item.price ?? 0);
    return `<tr><td>${escapeHtml(item.name || "Item")}</td><td>${quantity}</td><td>$${price.toFixed(2)}</td><td>$${(price * quantity).toFixed(2)}</td></tr>`;
  }).join("");

  invoiceWindow.document.write(`<!doctype html>
    <html><head><meta charset="utf-8"><title>SwiftShop invoice #${escapeHtml(order.id)}</title>
    <style>
      body{font:15px Arial,sans-serif;color:#0f172a;margin:0;padding:40px;background:#f8fafc}
      main{max-width:800px;margin:auto;background:white;padding:44px;border:1px solid #e2e8f0;border-radius:18px}
      header,.row{display:flex;justify-content:space-between;gap:24px}header{border-bottom:2px solid #4f46e5;padding-bottom:24px}
      h1{font-size:30px;margin:0 0 8px}h2{font-size:15px;margin:30px 0 8px;color:#475569}
      p{margin:5px 0;color:#475569}.brand{font-size:23px;font-weight:800;color:#4f46e5}
      table{width:100%;border-collapse:collapse;margin-top:24px}th,td{text-align:left;padding:13px 10px;border-bottom:1px solid #e2e8f0}th{background:#f8fafc;color:#475569}
      .total{text-align:right;font-size:22px;font-weight:800;margin-top:24px}.print{margin-bottom:22px;padding:10px 16px;border:0;border-radius:9px;background:#4f46e5;color:white;font-weight:700;cursor:pointer}
      @media print{body{padding:0;background:white}main{border:0;padding:20px;max-width:none}.print{display:none}}
    </style></head><body><main>
    <button class="print" onclick="window.print()">Print / Save as PDF</button>
    <header><div><div class="brand">SwiftShop</div><p>Purchase invoice</p></div><div><h1>INVOICE</h1><p>Invoice #${escapeHtml(order.id)}</p><p>Date: ${escapeHtml(order.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10))}</p><p>Status: ${escapeHtml(order.status || "Pending")}</p></div></header>
    <section><h2>Bill to</h2><p>${escapeHtml(customer.name || order.customer_name || "Customer")}</p><p>${escapeHtml(customer.email || order.customer_email || "")}</p>${customer.user_id ? `<p>Customer ID: ${escapeHtml(customer.user_id)}</p>` : ""}</section>
    <table><thead><tr><th>Item</th><th>Quantity</th><th>Unit price</th><th>Amount</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Order items unavailable</td></tr>'}</tbody></table>
    <div class="total">Total: $${Number(order.total || 0).toFixed(2)}</div>
    <p style="margin-top:36px">Thank you for shopping with SwiftShop.</p></main></body></html>`);
  invoiceWindow.document.close();
}
