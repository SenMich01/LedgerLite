import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Plus, X, Eye, MessageCircle } from "lucide-react";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [form, setForm] = useState({ customer_id: "", due_date: "", items: [{ description: "", qty: 1, price: "" }] });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const [{ data: inv }, { data: cust }] = await Promise.all([
      supabase.from("invoices").select("*, customers(name, phone, email)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("customers").select("id, name, phone").eq("user_id", user.id)
    ]);
    setInvoices(inv || []); setCustomers(cust || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const total = form.items.reduce((s, i) => s + (Number(i.qty) * Number(i.price)), 0);
    const count = invoices.length + 1;
    const invoice_number = `INV-${String(count).padStart(4, "0")}`;
    await supabase.from("invoices").insert({
      user_id: user.id, customer_id: form.customer_id, invoice_number,
      items: form.items, total_amount: total, due_date: form.due_date, status: "pending"
    });
    setShowModal(false);
    setForm({ customer_id: "", due_date: "", items: [{ description: "", qty: 1, price: "" }] });
    fetchAll();
  }

  async function updateStatus(id, status) {
    await supabase.from("invoices").update({ status }).eq("id", id);
    fetchAll();
  }

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: "", qty: 1, price: "" }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, key, val) => setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [key]: val } : it) }));
  const total = form.items.reduce((s, i) => s + (Number(i.qty) * Number(i.price || 0)), 0);
  const fmt = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

  const statusBadge = (s) => {
    const map = { paid: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700", overdue: "bg-red-100 text-red-600" };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${map[s]}`}>{s}</span>;
  };

  const shareWhatsApp = (inv) => {
    const msg = `Hi ${inv.customers?.name}, here is your invoice ${inv.invoice_number} for ${fmt(inv.total_amount)}. Due: ${inv.due_date || "N/A"}. Please make payment at your earliest convenience. - LedgerLite`;
    const phone = inv.customers?.phone?.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus size={16} /> New Invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          : invoices.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-sm">No invoices yet. Create your first one!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{["Invoice #", "Customer", "Amount", "Due Date", "Status", "Actions"].map(h =>
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-5 py-3">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-medium text-purple-700">{inv.invoice_number}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{inv.customers?.name}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">{fmt(inv.total_amount)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{inv.due_date || "—"}</td>
                    <td className="px-5 py-4">{statusBadge(inv.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 items-center">
                        <button onClick={() => setViewInvoice(inv)} className="text-gray-400 hover:text-purple-600" title="View"><Eye size={15} /></button>
                        <button onClick={() => shareWhatsApp(inv)} className="text-gray-400 hover:text-green-600" title="Share on WhatsApp"><MessageCircle size={15} /></button>
                        {inv.status === "pending" && (
                          <button onClick={() => updateStatus(inv.id, "paid")}
                            className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded-full font-medium">
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">New Invoice</h3>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input value={item.description} onChange={e => updateItem(i, "description", e.target.value)} placeholder="Description" required
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      <input type="number" value={item.qty} onChange={e => updateItem(i, "qty", e.target.value)} placeholder="Qty" min="1"
                        className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      <input type="number" value={item.price} onChange={e => updateItem(i, "price", e.target.value)} placeholder="Price" required
                        className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addItem} className="mt-2 text-sm text-purple-600 hover:underline">+ Add item</button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-right">
                <span className="text-sm text-gray-500">Total: </span>
                <span className="text-lg font-bold text-gray-900">{fmt(total)}</span>
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg text-sm">
                Create Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{viewInvoice.invoice_number}</h3>
              <button onClick={() => setViewInvoice(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium">{viewInvoice.customers?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Due Date</span>
                <span className="font-medium">{viewInvoice.due_date || "N/A"}</span>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
                {(viewInvoice.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-gray-600">{item.description} × {item.qty}</span>
                    <span className="font-medium">{fmt(Number(item.qty) * Number(item.price))}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-purple-700">{fmt(viewInvoice.total_amount)}</span>
              </div>
              <button onClick={() => shareWhatsApp(viewInvoice)}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm">
                <MessageCircle size={16} /> Share on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
