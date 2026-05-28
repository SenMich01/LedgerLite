import { useCurrency } from "../context/CurrencyContext";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Pencil, Trash2, X, User } from "lucide-react";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => { fetchCustomers(); }, []);

  async function fetchCustomers() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from("customers").select("*")
      .eq("user_id", user.id).order("created_at", { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (editing) {
      await supabase.from("customers").update(form).eq("id", editing.id);
    } else {
      await supabase.from("customers").insert({ ...form, user_id: user.id });
    }
    setShowModal(false); setEditing(null);
    setForm({ name: "", email: "", phone: "" });
    fetchCustomers();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this customer?")) return;
    await supabase.from("customers").delete().eq("id", id);
    fetchCustomers();
  }

  const { fmt } = useCurrency();
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Customers</h1>
        <button onClick={() => { setForm({ name: "", email: "", phone: "" }); setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
        className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <User size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No customers yet</p>
            </div>
          ) : (
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Name", "Phone", "Email", "Outstanding", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-sm font-bold">
                          {c.name[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{c.phone || "—"}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{c.email || "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-semibold ${Number(c.outstanding_balance) > 0 ? "text-red-500" : "text-green-600"}`}>
                        {fmt(c.outstanding_balance || 0)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing(c); setForm({ name: c.name, email: c.email || "", phone: c.phone || "" }); setShowModal(true); }}
                          className="text-gray-400 hover:text-purple-600"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Customer" : "New Customer"} onClose={() => { setShowModal(false); setEditing(null); }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[["Full Name", "name", "text", true], ["Phone", "phone", "tel", false], ["Email", "email", "email", false]].map(([label, key, type, req]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={req}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            ))}
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg text-sm">
              {editing ? "Save Changes" : "Add Customer"}
            </button>
          </form>
        </Modal>
      )}
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
