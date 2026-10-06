import axios from "axios";

// Base URL points to the backend API (Render backend or local override via VITE_API_URL)
export const API_BASE_URL =
  import.meta.env?.VITE_API_URL || "https://swiftshopiy-backned.onrender.com/api";

export const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
});

// Admin Authentication Login
export async function loginAdmin(identifier, password) {
  const res = await axios.post(`${API_BASE_URL}/login`, {
    identifier,
    password,
  });

  const { user, token } = res.data;
  const userRole = (user?.role || "").toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "super admin";

  if (!isAdmin) {
    throw new Error("Access denied. This account does not have administrator privileges.");
  }

  return { user, token };
}

// Admin Overview Metrics
export async function fetchAdminOverview(token) {
  const res = await axios.get(`${API_BASE_URL}/admin/overview`, getAuthConfig(token));
  return res.data;
}

// Admin Orders
export async function fetchAdminOrders(token, status = "All") {
  const params = status && status !== "All" ? { status } : {};
  const res = await axios.get(`${API_BASE_URL}/admin/orders`, {
    ...getAuthConfig(token),
    params,
  });
  return res.data;
}

export async function updateAdminOrderStatus(token, orderId, status) {
  const res = await axios.patch(
    `${API_BASE_URL}/admin/orders/${orderId}/status`,
    { status },
    getAuthConfig(token)
  );
  return res.data;
}

// Admin Users
export async function fetchAdminUsers(token) {
  const res = await axios.get(`${API_BASE_URL}/admin/users`, getAuthConfig(token));
  return res.data;
}

// Admin Support Tickets
export async function fetchAdminSupportTickets(token) {
  const res = await axios.get(`${API_BASE_URL}/admin/support-tickets`, getAuthConfig(token));
  return res.data;
}

export async function updateAdminSupportTicket(token, ticketId, payload) {
  const res = await axios.patch(
    `${API_BASE_URL}/admin/support-tickets/${ticketId}`,
    payload,
    getAuthConfig(token)
  );
  return res.data;
}

// Products Catalog (Public/Admin Read)
export async function fetchProducts() {
  const res = await axios.get(`${API_BASE_URL}/products`);
  const data = res.data;
  return Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : data?.products || [];
}

// Admin Product Create (Supports both /admin/products and fallback to /products)
export async function createAdminProduct(token, productData) {
  const payload = {
    name: String(productData.name || "").trim(),
    category: String(productData.category || "Electronics").trim(),
    price: parseFloat(productData.price),
    rating: parseFloat(productData.rating || 5.0),
    reviews: parseInt(productData.reviews || 0, 10),
    image: String(productData.image || "").trim(),
    description: String(productData.description || "").trim(),
  };

  try {
    const res = await axios.post(
      `${API_BASE_URL}/admin/products`,
      payload,
      getAuthConfig(token)
    );
    return res.data;
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      const fallback = await axios.post(
        `${API_BASE_URL}/products`,
        payload,
        getAuthConfig(token)
      );
      return fallback.data;
    }
    throw err;
  }
}

// Admin Product Update (Supports both /admin/products/{id} and fallback to /products/{id})
export async function updateAdminProduct(token, productId, productData) {
  const payload = {
    name: String(productData.name || "").trim(),
    category: String(productData.category || "Electronics").trim(),
    price: parseFloat(productData.price),
    rating: parseFloat(productData.rating || 5.0),
    reviews: parseInt(productData.reviews || 0, 10),
    image: String(productData.image || "").trim(),
    description: String(productData.description || "").trim(),
  };

  try {
    const res = await axios.put(
      `${API_BASE_URL}/admin/products/${productId}`,
      payload,
      getAuthConfig(token)
    );
    return res.data;
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      const fallback = await axios.put(
        `${API_BASE_URL}/products/${productId}`,
        payload,
        getAuthConfig(token)
      );
      return fallback.data;
    }
    throw err;
  }
}

// Admin Product Delete (Supports both /admin/products/{id} and fallback to /products/{id})
export async function deleteAdminProduct(token, productId) {
  try {
    const res = await axios.delete(
      `${API_BASE_URL}/admin/products/${productId}`,
      getAuthConfig(token)
    );
    return res.data;
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      const fallback = await axios.delete(
        `${API_BASE_URL}/products/${productId}`,
        getAuthConfig(token)
      );
      return fallback.data;
    }
    throw err;
  }
}
