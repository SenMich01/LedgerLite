import { useCurrency } from "../context/CurrencyContext";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const CATEGORIES_INCOME = ["Sales", "Freelance", "Investment", "Loan", "Gift", "Other"];
const CATEGORIES_EXPENSE = ["Rent", "Transport", "Salaries", "Utilities", "Supplies", "Food", "Marketing", "Other"];
const PAYMENT_METHODS = ["Cash", "Bank", "POS"];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    type: "income", amount: "", category: "", payment_method: "Cash", description: "", date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => { fetchTransactions(); }, []);

  async function fetchTransactions() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from("transactions").select("*")
      .eq("user_id", user.id).order("date", { ascending: false });
    setTransactions(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (editing) {
      await supabase.from("transactions").update(form).eq("id", editing.id);
    } else {
      await supabase.from("transactions").insert({ ...form, user_id: user.id, amount: Number(form.amount) });
    }
    setShowModal(false);
    setEditing(null);
    resetForm();
    fetchTransactions();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this transaction?")) return;
    await supabase.from("transactions").delete().eq("id", id);
    fetchTransactions();
  }

  function resetForm() {
    setForm({ type: "income", amount: "", category: "", payment_method: "Cash", description: "", date: new Date().toISOString().split("T")[0] });
  }

  function openEdit(tx) {
    setEditing(tx);
    setForm({ type: tx.type, amount: tx.amount, category: tx.category, payment_method: tx.payment_method, description: tx.description || "", date: tx.date });
    setShowModal(true);
  }

  const { fmt } = useCurrency();
  const filtered = filter === "all" ? transactions : transactions.filter(t => t.type === filter);
  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
        <button onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Income", value: fmt(totalIncome), color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Expenses", value: fmt(totalExpense), color: "text-red-500", bg: "bg-red-50" },
          { label: "Net", value: fmt(totalIncome - totalExpense), color: totalIncome - totalExpense >= 0 ? "text-purple-700" : "text-red-600", bg: "bg-purple-50" },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {["all", "income", "expense"].map(f => (
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
              <p className="text-sm">No transactions found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(tx => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                      ${tx.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {tx.type === "income" ? "+" : "-"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{tx.category || "Uncategorized"}</p>
                      <p className="text-xs text-gray-400">{tx.date} · {tx.payment_method} {tx.description && `· ${tx.description}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${tx.type === "income" ? "text-green-600" : "text-red-500"}`}>
                      {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                    </span>
                    <button onClick={() => openEdit(tx)} className="text-gray-400 hover:text-purple-600"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(tx.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Transaction" : "New Transaction"} onClose={() => { setShowModal(false); setEditing(null); }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              {["income", "expense"].map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                    ${form.type === t ? (t === "income" ? "bg-green-600 text-white" : "bg-red-500 text-white") : "bg-gray-100 text-gray-600"}`}>
                  {t}
                </button>
              ))}
            </div>
            <FormField label="Amount (₦)" type="number" value={form.amount} onChange={v => setForm(f => ({ ...f, amount: v }))} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select category</option>
                {(form.type === "income" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <FormField label="Date" type="date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} required />
            <FormField label="Description (optional)" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
              {editing ? "Save Changes" : "Add Transaction"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function FormField({ label, type = "text", value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
