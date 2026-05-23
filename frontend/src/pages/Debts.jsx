import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Plus, CheckCircle, X, AlertCircle } from "lucide-react";

export default function Debts() {
  const [debts, setDebts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ customer_id: "", amount: "", due_date: "", description: "" });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const [{ data: d }, { data: c }] = await Promise.all([
      supabase.from("debts").select("*, customers(name)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("customers").select("id, name").eq("user_id", user.id)
    ]);
    setDebts(d || []); setCustomers(c || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("debts").insert({ ...form, user_id: user.id, amount: Number(form.amount) });
    // Update customer outstanding balance
    const { data: cust } = await supabase.from("customers").select("outstanding_balance").eq("id", form.customer_id).single();
    await supabase.from("customers").update({ outstanding_balance: (Number(cust?.outstanding_balance) || 0) + Number(form.amount) }).eq("id", form.customer_id);
    setShowModal(false);
    setForm({ customer_id: "", amount: "", due_date: "", description: "" });
    fetchAll();
  }

  async function markPaid(debt) {
    await supabase.from("debts").update({ status: "paid" }).eq("id", debt.id);
    const { data: cust } = await supabase.from("customers").select("outstanding_balance").eq("id", debt.customer_id).single();
    await supabase.from("customers").update({ outstanding_balance: Math.max(0, (Number(cust?.outstanding_balance) || 0) - Number(debt.amount)) }).eq("id", debt.customer_id);
    fetchAll();
  }

  const fmt = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
  const today = new Date().toISOString().split("T")[0];
  const daysOverdue = (dueDate) => {
    const diff = new Date(today) - new Date(dueDate);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const enriched = debts.map(d => ({
    ...d,
    isOverdue: d.status === "pending" && d.due_date && d.due_date < today,
    overdueDays: d.due_date ? daysOverdue(d.due_date) : 0
  }));
  const filtered = filter === "all" ? enriched : enriched.filter(d => d.status === filter);
  const totalOwed = debts.filter(d => d.status === "pending").reduce((s, d) => s + Number(d.amount), 0);

  const statusBadge = (debt) => {
    if (debt.status === "paid") return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Paid</span>;
    if (debt.isOverdue) return <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">Overdue {debt.overdueDays}d</span>;
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>;
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Debt Tracker</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus size={16} /> Add Debt
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total Outstanding</p>
          <p className="text-lg font-bold text-red-600">{fmt(totalOwed)}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Pending</p>
          <p className="text-lg font-bold text-yellow-700">{enriched.filter(d => d.status === "pending" && !d.isOverdue).length}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Overdue</p>
          <p className="text-lg font-bold text-orange-600">{enriched.filter(d => d.isOverdue).length}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {["all", "pending", "paid"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors
              ${filter === f ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <AlertCircle size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No debts found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(d => (
                <div key={d.id} className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 ${d.isOverdue ? "bg-red-50/30" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold">
                      {d.customers?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{d.customers?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-400">{d.description || "No description"} · Due: {d.due_date || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(d)}
                    <span className="text-sm font-bold text-gray-800">{fmt(d.amount)}</span>
                    {d.status === "pending" && (
                      <button onClick={() => markPaid(d)} title="Mark as paid"
                        className="text-gray-400 hover:text-green-600 transition-colors">
                        <CheckCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Add Debt</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Select customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {[["Amount (₦)", "amount", "number"], ["Due Date", "due_date", "date"], ["Description", "description", "text"]].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={key !== "description"}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              ))}
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg text-sm">
                Add Debt
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
