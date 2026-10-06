import React, { useState, useEffect } from "react";
import {
  Zap,
  Plus,
  Play,
  Square,
  Trash2,
  Clock,
  Flame,
  Volume2,
  Check,
  AlertCircle,
  RefreshCw,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  fetchAdminFlashDeals,
  createAdminFlashDeal,
  toggleAdminFlashDeal,
  deleteAdminFlashDeal,
  createAdminNews,
  toggleAdminNews,
  deleteAdminNews,
} from "./api";

export default function FlashDealsManager({ token }) {
  const [deals, setDeals] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Deal Modal state
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [dealForm, setDealForm] = useState({
    title: "",
    discount: "35% OFF",
    description: "",
    hours: "24",
    is_active: true,
  });

  // News Modal state
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [newsForm, setNewsForm] = useState({
    badge: "FLASH DEAL",
    text: "",
    is_active: true,
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminFlashDeals(token);
      setDeals(Array.isArray(data?.deals) ? data.deals : []);
      setNews(Array.isArray(data?.news) ? data.news : []);
    } catch (err) {
      console.error("Failed to load flash deals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Flash Deal actions
  const handleToggleDeal = async (id, currentStatus) => {
    try {
      await toggleAdminFlashDeal(token, id);
      setDeals((prev) =>
        prev.map((d) =>
          String(d.id) === String(id) ? { ...d, is_active: !d.is_active } : d
        )
      );
      showToast(
        currentStatus ? "Flash deal stopped / paused" : "Flash deal activated on website!"
      );
    } catch (err) {
      alert("Failed to toggle deal status");
    }
  };

  const handleDeleteDeal = async (id) => {
    if (!window.confirm("Remove this flash deal?")) return;
    try {
      await deleteAdminFlashDeal(token, id);
      setDeals((prev) => prev.filter((d) => String(d.id) !== String(id)));
      showToast("Flash deal removed.");
    } catch (err) {
      alert("Failed to delete deal");
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    if (!dealForm.title.trim()) return;

    try {
      const hoursNum = parseInt(dealForm.hours || "24", 10);
      const endTime = new Date(Date.now() + hoursNum * 60 * 60 * 1000).toISOString();

      await createAdminFlashDeal(token, {
        title: dealForm.title,
        discount: dealForm.discount,
        description: dealForm.description,
        end_time: endTime,
        is_active: dealForm.is_active,
      });

      setDealModalOpen(false);
      setDealForm({
        title: "",
        discount: "35% OFF",
        description: "",
        hours: "24",
        is_active: true,
      });
      loadData();
      showToast("New flash deal created and published!");
    } catch (err) {
      alert("Failed to create flash deal.");
    }
  };

  // News actions
  const handleToggleNews = async (id) => {
    try {
      await toggleAdminNews(token, id);
      setNews((prev) =>
        prev.map((n) =>
          String(n.id) === String(id) ? { ...n, is_active: !n.is_active } : n
        )
      );
      showToast("News ticker item status updated.");
    } catch (err) {
      alert("Failed to toggle news item");
    }
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm("Delete this news announcement?")) return;
    try {
      await deleteAdminNews(token, id);
      setNews((prev) => prev.filter((n) => String(n.id) !== String(id)));
      showToast("News announcement deleted.");
    } catch (err) {
      alert("Failed to delete news");
    }
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    if (!newsForm.text.trim()) return;

    try {
      await createAdminNews(token, newsForm);
      setNewsModalOpen(false);
      setNewsForm({
        badge: "FLASH DEAL",
        text: "",
        is_active: true,
      });
      loadData();
      showToast("New announcement added to scrolling ticker!");
    } catch (err) {
      alert("Failed to save news item.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom-2">
          <Check size={16} />
          {toast}
        </div>
      )}

      {/* Header Controls */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap size={20} className="text-amber-400" />
            Flash Deals & Store Announcements
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create or stop flash sales, control live website countdowns, and manage the scrolling news ticker.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1e293b] hover:bg-[#28354f] text-slate-200 text-xs font-semibold rounded-xl transition border border-[#2b3a56] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setDealModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-md shadow-amber-900/30 cursor-pointer"
          >
            <Flame size={15} />
            Add Flash Deal
          </button>
          <button
            onClick={() => setNewsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-blue-900/30 cursor-pointer"
          >
            <Plus size={15} />
            Add Ticker News
          </button>
        </div>
      </div>

      {/* 1. Flash Deals Management Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame size={18} className="text-amber-400" />
            Active & Past Flash Deals
          </h3>
          <span className="text-xs text-slate-400">
            {deals.filter((d) => d.is_active).length} Active on Storefront
          </span>
        </div>

        {deals.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-[#131b2e] border border-dashed border-[#1e293b] rounded-2xl p-6">
            <Zap className="mx-auto text-slate-600 mb-2" size={32} />
            <p className="font-semibold text-white text-sm">No flash deals created yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Add a flash deal to feature an interactive countdown timer and discount cards on the website!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {deals.map((deal) => {
              const isActive = Boolean(deal.is_active);

              return (
                <div
                  key={deal.id}
                  className={`bg-[#131b2e] border rounded-2xl p-5 transition flex flex-col justify-between ${
                    isActive
                      ? "border-amber-500/40 shadow-lg shadow-amber-950/20"
                      : "border-[#1e293b] opacity-75"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {deal.discount || "SALE"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        }`}
                      >
                        {isActive ? "LIVE ON SITE" : "STOPPED / INACTIVE"}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base mt-2">
                      {deal.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {deal.description || "Limited-time customer discount event."}
                    </p>

                    {deal.end_time && (
                      <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5 font-mono">
                        <Clock size={13} className="text-amber-400" />
                        Ends: {new Date(deal.end_time).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#1e293b] flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleToggleDeal(deal.id, isActive)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30"
                          : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/30"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Square size={13} />
                          <span>Stop Flash Deal</span>
                        </>
                      ) : (
                        <>
                          <Play size={13} />
                          <span>Activate Deal</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteDeal(deal.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition border border-transparent hover:border-rose-900/40 cursor-pointer"
                      title="Delete deal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Scrolling News Ticker Management */}
      <div className="space-y-4 pt-4 border-t border-[#1e293b]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Volume2 size={18} className="text-blue-400" />
            Scrolling News Ticker Announcements
          </h3>
          <span className="text-xs text-slate-400">
            {news.filter((n) => n.is_active).length} Active Scrolling Items
          </span>
        </div>

        <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl divide-y divide-[#1e293b] overflow-hidden">
          {news.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-[#17223b] transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-600/20 text-blue-300 border border-blue-500/30 shrink-0">
                  {item.badge || "NEWS"}
                </span>
                <p className="text-xs text-slate-200 font-medium truncate">
                  {item.text}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleNews(item.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition ${
                    item.is_active
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {item.is_active ? "Enabled" : "Paused"}
                </button>
                <button
                  onClick={() => handleDeleteNews(item.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  title="Remove news"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Flash Deal */}
      {dealModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-[#1e293b] rounded-3xl w-full max-w-lg p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
              <Flame size={20} className="text-amber-400" />
              New Flash Deal Campaign
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Launch a countdown sale with special discount tags visible on the homepage and customer dashboard.
            </p>

            <form onSubmit={handleCreateDeal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Audio & Gadgets Flash Sale"
                  value={dealForm.title}
                  onChange={(e) =>
                    setDealForm({ ...dealForm, title: e.target.value })
                  }
                  className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Discount Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="35% OFF"
                    value={dealForm.discount}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, discount: e.target.value })
                    }
                    className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    placeholder="24"
                    value={dealForm.hours}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, hours: e.target.value })
                    }
                    className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Description / Offer Terms
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Exclusive limited-time discount on top trending tech & accessories."
                  value={dealForm.description}
                  onChange={(e) =>
                    setDealForm({ ...dealForm, description: e.target.value })
                  }
                  className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="dealActiveCheck"
                  checked={dealForm.is_active}
                  onChange={(e) =>
                    setDealForm({ ...dealForm, is_active: e.target.checked })
                  }
                  className="rounded bg-[#0e1424] border-slate-700 text-amber-500"
                />
                <label htmlFor="dealActiveCheck" className="text-slate-300 cursor-pointer">
                  Activate immediately on website storefront
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setDealModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Launch Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create News Item */}
      {newsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-[#1e293b] rounded-3xl w-full max-w-lg p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
              <Volume2 size={20} className="text-blue-400" />
              Add News Ticker Item
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              This message will continuously scroll in the website header and customer dashboard overview.
            </p>

            <form onSubmit={handleCreateNews} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Tag Badge
                </label>
                <input
                  type="text"
                  placeholder="e.g. FLASH DEAL, FREE SHIPPING, NEW ARRIVAL"
                  value={newsForm.badge}
                  onChange={(e) =>
                    setNewsForm({ ...newsForm, badge: e.target.value })
                  }
                  className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Announcement Message *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. ⚡ Limited Time: Free priority shipping on all orders over $100!"
                  value={newsForm.text}
                  onChange={(e) =>
                    setNewsForm({ ...newsForm, text: e.target.value })
                  }
                  className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newsActiveCheck"
                  checked={newsForm.is_active}
                  onChange={(e) =>
                    setNewsForm({ ...newsForm, is_active: e.target.checked })
                  }
                  className="rounded bg-[#0e1424] border-slate-700 text-blue-500"
                />
                <label htmlFor="newsActiveCheck" className="text-slate-300 cursor-pointer">
                  Activate in scrolling marquee immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setNewsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
