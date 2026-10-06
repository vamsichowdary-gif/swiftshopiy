import React, { useState, useRef } from "react";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  RefreshCw,
  Star,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Upload,
  FileSpreadsheet,
  Download,
  Link as LinkIcon,
  FolderPlus,
  Layers,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import {
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  uploadProductImages,
  bulkImportProducts,
} from "./api";

const INITIAL_FORM = {
  name: "",
  category: "Electronics",
  price: "",
  rating: "5.0",
  reviews: "0",
  image: "",
  description: "",
};

export default function Products({
  products = [],
  token,
  onRefresh,
  loading = false,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Image upload state inside Product Modal
  const [imageMode, setImageMode] = useState("url"); // "url" | "upload"
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedGallery, setUploadedGallery] = useState([]);
  const fileInputRef = useRef(null);

  // Bulk Import state & modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkParsedProducts, setBulkParsedProducts] = useState([]);
  const [isDraggingBulk, setIsDraggingBulk] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const bulkFileInputRef = useRef(null);

  const categories = [
    "All",
    "Electronics",
    "Accessories",
    "Home",
    "Apparel",
    "Footwear",
    "Lifestyle",
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      categoryFilter === "All" ||
      (p.category || "").toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 4000);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(INITIAL_FORM);
    setFormError("");
    setImageMode("url");
    setUploadedGallery([]);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      category: product.category || "Electronics",
      price: product.price || "",
      rating: product.rating != null ? String(product.rating) : "5.0",
      reviews: product.reviews != null ? String(product.reviews) : "0",
      image: product.image || "",
      description: product.description || "",
    });
    setFormError("");
    setImageMode("url");
    setUploadedGallery(product.image ? [product.image] : []);
    setModalOpen(true);
  };

  // Multiple Image Upload Handler
  const handleUploadFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    setFormError("");

    try {
      const res = await uploadProductImages(token, Array.from(files));
      const urls = res.urls || (res.url ? [res.url] : []);
      if (urls.length > 0) {
        setUploadedGallery((prev) => [...new Set([...prev, ...urls])]);
        // Set first uploaded image as primary product image
        setFormData((prev) => ({
          ...prev,
          image: urls[0],
        }));
        showToast(`${urls.length} image(s) uploaded to backend/public/Products!`);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      setFormError(
        err.response?.data?.message ||
          "Image upload failed. Please verify server connectivity."
      );
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsDraggingImage(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  // Bulk File Selection & CSV/JSON Parsing
  const handleBulkFileSelected = (file) => {
    if (!file) return;
    setBulkFile(file);
    setBulkError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const ext = file.name.split(".").pop().toLowerCase();

        if (ext === "json") {
          const json = JSON.parse(content);
          const list = Array.isArray(json)
            ? json
            : Array.isArray(json.products)
            ? json.products
            : [];
          setBulkParsedProducts(list);
        } else {
          // Parse CSV
          const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length <= 1) {
            setBulkError("CSV file contains no product rows.");
            return;
          }
          const headers = lines[0].split(",").map((h) =>
            h.trim().replace(/^["']|["']$/g, "").toLowerCase().replace(/\s+/g, "_")
          );

          const parsed = [];
          for (let i = 1; i < lines.length; i++) {
            const rowValues = lines[i].split(",").map((v) =>
              v.trim().replace(/^["']|["']$/g, "")
            );
            if (rowValues.length >= headers.length) {
              const item = {};
              headers.forEach((h, idx) => {
                item[h] = rowValues[idx];
              });
              parsed.push(item);
            }
          }
          setBulkParsedProducts(parsed);
        }
      } catch (err) {
        console.error("Parse error:", err);
        setBulkError("Failed to parse file. Please verify CSV or JSON formatting.");
      }
    };
    reader.readAsText(file);
  };

  const handleBulkImportSubmit = async () => {
    if (!bulkFile && bulkParsedProducts.length === 0) {
      setBulkError("Please select or drop a valid CSV or JSON file first.");
      return;
    }

    setBulkImporting(true);
    setBulkError("");

    try {
      // Send either the file or the parsed products array
      const payload = bulkFile || { products: bulkParsedProducts };
      const res = await bulkImportProducts(token, payload);
      const count = res.imported_count ?? bulkParsedProducts.length;

      showToast(`Successfully imported ${count} products into catalog!`);
      setBulkModalOpen(false);
      setBulkFile(null);
      setBulkParsedProducts([]);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Bulk import failed:", err);
      setBulkError(
        err.response?.data?.message || "Failed to import products from file."
      );
    } finally {
      setBulkImporting(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent =
      "name,category,price,description,image,rating,reviews\n" +
      '"Wireless ANC Headphones",Electronics,149.99,"Studio grade active noise cancelling with 40-hour battery life",https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800,4.8,24\n' +
      '"Minimalist Desk Lamp",Home,69.99,"Warm LED ambient brass lamp with touch dimming control",https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800,4.9,18\n' +
      '"Matte Ceramic Mug Set",Home,34.50,"Set of 4 handcrafted ceramic mugs in earthy tones",https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800,5.0,12\n';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "swiftshop_products_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Add / Edit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    if (!formData.name.trim()) {
      setFormError("Product name is required.");
      setSubmitting(false);
      return;
    }
    const parsedPrice = parseFloat(formData.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError("Please enter a valid price (greater than or equal to 0).");
      setSubmitting(false);
      return;
    }
    if (!formData.image.trim()) {
      setFormError("Please provide an image URL or upload an image file.");
      setSubmitting(false);
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Description is required.");
      setSubmitting(false);
      return;
    }

    try {
      if (editingProduct) {
        await updateAdminProduct(token, editingProduct.id, formData);
        showToast(`Successfully updated "${formData.name}"`);
      } else {
        await createAdminProduct(token, formData);
        showToast(`Successfully created "${formData.name}"`);
      }

      setModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Product save error:", err);
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(" ")
          : null) ||
        err.message ||
        "Failed to save product. Please check required fields.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteAdminProduct(token, id);
      showToast(`Deleted "${name}" from inventory.`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Delete error:", err);
      alert(
        err.response?.data?.message || "Failed to delete product. Please retry."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Check size={16} />
          {successToast}
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package size={20} className="text-amber-400" />
              Product Catalog & Inventory
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add new products, upload images, import bulk products, update catalog details, or remove items
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1e293b] hover:bg-[#28354f] text-slate-200 text-xs font-semibold rounded-xl transition border border-[#2b3a56] cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => setBulkModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-indigo-900/30 cursor-pointer"
            >
              <FileSpreadsheet size={15} />
              <span>Bulk Import</span>
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-blue-900/40 cursor-pointer"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>
        </div>

        {/* Categories and Search Filter */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-[#1e293b]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                      : "bg-[#0e1424] text-slate-400 hover:text-slate-200 hover:bg-[#1a233a] border border-[#1e293b]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[240px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search products by title, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#0e1424] text-slate-200 text-xs rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e1424] text-slate-400 border-b border-[#1e293b]">
              <tr>
                <th className="py-3 px-4 font-semibold">Item</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold">Rating</th>
                <th className="py-3 px-4 font-semibold">Reviews</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] text-slate-300">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#18233a] transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg bg-slate-900 border border-[#1e293b] shrink-0"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800";
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-[200px] sm:max-w-[260px]">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-[#1e293b] text-slate-300 rounded-md font-medium text-[11px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      ${Number(p.price || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star size={13} fill="currentColor" />
                        <span>{Number(p.rating || 5.0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {p.reviews || 0} reviews
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 hover:bg-[#28354f] text-slate-300 hover:text-white rounded-lg transition"
                          title="Edit product"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition"
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#131b2e] border border-[#1e293b] rounded-3xl w-full max-w-xl p-6 shadow-2xl text-white my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package size={18} className="text-blue-400" />
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Office Chair"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-[#0e1424] text-slate-200 px-3 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Home">Home</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="99.99"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Initial Rating (0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5.0"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Reviews Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reviews}
                    onChange={(e) =>
                      setFormData({ ...formData, reviews: e.target.value })
                    }
                    className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Enhanced Product Image Section: Both URL & File Upload with Drag & Drop */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300">
                    Product Image *
                  </label>
                  {/* Mode switcher tabs */}
                  <div className="flex items-center gap-1 bg-[#0e1424] p-1 rounded-xl border border-[#1e293b]">
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        imageMode === "url"
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <LinkIcon size={12} /> URL
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("upload")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        imageMode === "upload"
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Upload size={12} /> Upload Files
                      </span>
                    </button>
                  </div>
                </div>

                {imageMode === "url" ? (
                  <div>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-600"
                    />
                  </div>
                ) : (
                  <div>
                    {/* Drag and Drop Zone for Images */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingImage(true);
                      }}
                      onDragLeave={() => setIsDraggingImage(false)}
                      onDrop={handleImageDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                        isDraggingImage
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-700/80 bg-[#0e1424] hover:border-slate-500"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleUploadFiles(e.target.files);
                          }
                        }}
                      />
                      <Upload
                        size={28}
                        className={`mx-auto mb-2 ${
                          uploadingImages ? "animate-bounce text-blue-400" : "text-slate-400"
                        }`}
                      />
                      {uploadingImages ? (
                        <p className="text-xs font-semibold text-blue-400">
                          Uploading to backend/public/Products...
                        </p>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-white">
                            Drag & drop multiple images here, or{" "}
                            <span className="text-blue-400 underline">browse</span>
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            PNG, JPG, WEBP, GIF · Automatically stored on backend in public/Products/
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Uploaded Thumbnails Strip */}
                    {uploadedGallery.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                          Uploaded Images ({uploadedGallery.length}) — Click to select primary:
                        </p>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {uploadedGallery.map((url, idx) => (
                            <div
                              key={idx}
                              onClick={() => setFormData({ ...formData, image: url })}
                              className={`relative w-14 h-14 rounded-xl overflow-hidden cursor-pointer shrink-0 border-2 transition ${
                                formData.image === url
                                  ? "border-blue-500 ring-2 ring-blue-500/30"
                                  : "border-slate-700 hover:border-slate-500"
                              }`}
                            >
                              <img
                                src={url}
                                alt="Uploaded"
                                className="w-full h-full object-cover"
                              />
                              {formData.image === url && (
                                <span className="absolute top-0 right-0 bg-blue-600 text-white p-0.5 rounded-bl-md">
                                  <Check size={10} />
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Image Preview Pill */}
                {formData.image && (
                  <div className="mt-2 flex items-center justify-between gap-2 p-2 bg-[#0e1424] rounded-xl border border-[#1e293b]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded-lg bg-slate-900 border border-slate-800 shrink-0"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <div className="min-w-0">
                        <span className="text-[11px] font-semibold text-white block truncate">
                          Active Product Image
                        </span>
                        <span className="text-[10px] text-blue-400 font-mono block truncate">
                          {formData.image}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                      Ready
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detailed product description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingProduct
                    ? "Save Changes"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#131b2e] border border-[#1e293b] rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl text-white my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet size={20} className="text-indigo-400" />
                  Bulk Import Products
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Import multiple products simultaneously via CSV or JSON file upload or drag & drop.
                </p>
              </div>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {bulkError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{bulkError}</span>
              </div>
            )}

            <div className="mt-5 space-y-5 text-xs">
              {/* Drag and Drop Box for CSV / JSON */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingBulk(true);
                }}
                onDragLeave={() => setIsDraggingBulk(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingBulk(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleBulkFileSelected(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => bulkFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition ${
                  isDraggingBulk
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-slate-700/80 bg-[#0e1424] hover:border-slate-500"
                }`}
              >
                <input
                  ref={bulkFileInputRef}
                  type="file"
                  accept=".csv,.json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleBulkFileSelected(e.target.files[0]);
                    }
                  }}
                />
                <FileSpreadsheet
                  size={36}
                  className="mx-auto mb-3 text-indigo-400 animate-pulse"
                />
                <p className="text-sm font-bold text-white">
                  Drag & drop your CSV or JSON file here, or{" "}
                  <span className="text-indigo-400 underline">browse files</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports columns: <code className="text-indigo-300">name, category, price, description, image, rating, reviews</code>
                </p>
              </div>

              {/* Sample Template Download */}
              <div className="flex items-center justify-between p-3.5 bg-[#0e1424] rounded-2xl border border-[#1e293b]">
                <div className="flex items-center gap-2.5">
                  <Download size={16} className="text-indigo-400" />
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Need a sample file to format your products?
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Download our pre-structured template CSV with example products.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="px-3 py-1.5 rounded-xl bg-[#1e293b] hover:bg-[#28354f] text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition cursor-pointer"
                >
                  Download CSV
                </button>
              </div>

              {/* Parsed Products Table Preview */}
              {bulkParsedProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-xs">
                      Parsed Products Ready to Import ({bulkParsedProducts.length}):
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      ✓ File validated
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto rounded-2xl border border-[#1e293b] bg-[#0e1424] divide-y divide-[#1e293b]">
                    {bulkParsedProducts.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {p.image && (
                            <img
                              src={p.image}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate text-xs">
                              {p.name || `Product #${idx + 1}`}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {p.category || "General"} · {p.description?.slice(0, 40)}...
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-400 shrink-0 font-mono">
                          ${Number(p.price || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => {
                    setBulkModalOpen(false);
                    setBulkParsedProducts([]);
                    setBulkFile(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={bulkImporting || bulkParsedProducts.length === 0}
                  onClick={handleBulkImportSubmit}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Upload size={14} />
                  <span>
                    {bulkImporting
                      ? "Importing Products..."
                      : `Import ${bulkParsedProducts.length || ""} Products`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
