import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Pencil, Trash2, X, Package, AlertTriangle } from "lucide-react";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", category: "", cost_price: "", selling_price: "", stock_quantity: "", low_stock_threshold: "5" });

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from("products").select("*").eq("user_id", user.id).order("name");
    setProducts(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...form, cost_price: Number(form.cost_price), selling_price: Number(form.selling_price), stock_quantity: Number(form.stock_quantity), low_stock_threshold: Number(form.low_stock_threshold) };
    if (editing) {
      await supabase.from("products").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("products").insert({ ...payload, user_id: user.id });
    }
    setShowModal(false); setEditing(null);
    setForm({ name: "", category: "", cost_price: "", selling_price: "", stock_quantity: "", low_stock_threshold: "5" });
    fetchProducts();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  }

  const fmt = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = products.filter(p => p.stock_quantity <= p.low_stock_threshold);

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
        <button onClick={() => { setEditing(null); setForm({ name: "", category: "", cost_price: "", selling_price: "", stock_quantity: "", low_stock_threshold: "5" }); setShowModal(true); }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            {lowStock.length} product{lowStock.length > 1 ? "s" : ""} running low on stock: {lowStock.map(p => p.name).join(", ")}
          </p>
        </div>
      )}

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
        className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />

      {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
            <Package size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => {
              const isLow = p.stock_quantity <= p.low_stock_threshold;
              const margin = p.selling_price > 0 ? (((p.selling_price - p.cost_price) / p.selling_price) * 100).toFixed(0) : 0;
              return (
                <div key={p.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${isLow ? "border-amber-200" : "border-gray-100"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{p.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{p.category || "Uncategorized"}</p>
                    </div>
                    {isLow && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">Low Stock</span>}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cost Price</span>
                      <span className="font-medium">{fmt(p.cost_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Selling Price</span>
                      <span className="font-medium text-purple-700">{fmt(p.selling_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Margin</span>
                      <span className={`font-medium ${Number(margin) > 20 ? "text-green-600" : "text-orange-500"}`}>{margin}%</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-500">In Stock</span>
                      <span className={`font-bold ${isLow ? "text-amber-600" : "text-gray-800"}`}>{p.stock_quantity} units</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => { setEditing(p); setForm({ name: p.name, category: p.category || "", cost_price: p.cost_price, selling_price: p.selling_price, stock_quantity: p.stock_quantity, low_stock_threshold: p.low_stock_threshold }); setShowModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 py-2 rounded-lg text-xs font-medium transition-colors">
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)}
                      className="flex items-center justify-center gap-1 border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 px-3 py-2 rounded-lg text-xs transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{editing ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {[["Product Name", "name", "text", true], ["Category", "category", "text", false]].map(([label, key, type, req]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={req}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[["Cost Price (₦)", "cost_price"], ["Selling Price (₦)", "selling_price"], ["Stock Qty", "stock_quantity"], ["Low Stock Alert", "low_stock_threshold"]].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input type="number" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                ))}
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg text-sm">
                {editing ? "Save Changes" : "Add Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
