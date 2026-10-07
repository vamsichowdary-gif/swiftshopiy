// Live Production API URL on Render
export const LIVE_API_URL = "https://swiftshopiy-backned.onrender.com/api";

// Always use the live URL by default, or respect explicit VITE_API_URL environment override
export const API_URL = import.meta.env?.VITE_API_URL || LIVE_API_URL;

export default API_URL;
