import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useCurrency, CURRENCIES } from "../context/CurrencyContext";
import { Plus, X, Eye, MessageCircle, Download, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";

export default function Invoices() {
  const { currency: globalCurrency, fmtPDF } = useCurrency();
  const [invoices, setInvoices]   = useState([]);
  const [customers, setCustomers] = useState([]);
  const [businessName, setBusinessName] = useState("LedgerLite Business");
  const [businessPhone, setBusinessPhone] = useState("");
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [showCurrencyDrop, setShowCurrencyDrop] = useState(false);
  const [form, setForm] = useState({
    customer_id: "", due_date: "",
    currency: globalCurrency.code,
    items: [{ description: "", qty: 1, price: "" }],
  });

  // Update form currency when global currency changes
  useEffect(() => {
    setForm(f => ({ ...f, currency: globalCurrency.code }));
  }, [globalCurrency.code]);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("users_profiles")
      .select("business_name, full_name, phone").eq("id", user.id).single();
    if (profile) {
      setBusinessName(profile.business_name || profile.full_name || "LedgerLite Business");
      setBusinessPhone(profile.phone || "");
    }
    const [{ data: inv }, { data: cust }] = await Promise.all([
      supabase.from("invoices").select("*, customers(name, phone, email)")
        .eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("customers").select("id, name, phone, email").eq("user_id", user.id),
    ]);
    setInvoices(inv || []);
    setCustomers(cust || []);
    setLoading(false);
  }

  // Get currency object for a given code
  const getCurrency = (code) => CURRENCIES.find(c => c.code === code) || CURRENCIES[0];

  // Format amount using invoice's own currency
  const fmtInv = (n, code) => {
    const c = getCurrency(code || "NGN");
    try {
      return new Intl.NumberFormat(c.locale, {
        style: "currency", currency: c.code, maximumFractionDigits: 0
      }).format(n || 0);
    } catch {
      return `${c.symbol}${Number(n||0).toLocaleString()}`;
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const total = form.items.reduce((s, i) => s + Number(i.qty) * Number(i.price), 0);
    const count = invoices.length + 1;
    const invoice_number = `INV-${String(count).padStart(4, "0")}`;
    await supabase.from("invoices").insert({
      user_id: user.id, customer_id: form.customer_id,
      invoice_number, items: form.items,
      total_amount: total, due_date: form.due_date,
      status: "pending", currency: form.currency,
    });
    setShowModal(false);
    setForm({ customer_id: "", due_date: "", currency: globalCurrency.code, items: [{ description: "", qty: 1, price: "" }] });
    fetchAll();
  }

  async function updateStatus(id, status) {
    await supabase.from("invoices").update({ status }).eq("id", id);
    fetchAll();
  }

  const addItem    = () => setForm(f => ({ ...f, items: [...f.items, { description: "", qty: 1, price: "" }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, key, val) => setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [key]: val } : it) }));

  const formTotal = form.items.reduce((s, i) => s + Number(i.qty) * Number(i.price || 0), 0);
  const selectedCurrencyObj = getCurrency(form.currency);

  const statusBadge = (s) => {
    const map = { paid:"bg-green-100 text-green-700", pending:"bg-yellow-100 text-yellow-700", overdue:"bg-red-100 text-red-600" };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${map[s]||map.pending}`}>{s}</span>;
  };

  const shareWhatsApp = (inv) => {
    const msg = `Hi ${inv.customers?.name}, here is your invoice ${inv.invoice_number} for ${fmtInv(inv.total_amount, inv.currency)}. Due: ${inv.due_date || "N/A"}. Please make payment at your earliest convenience. - ${businessName}`;
    const phone = inv.customers?.phone?.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  function downloadPDF(inv) {
    const invCurrency = getCurrency(inv.currency || "NGN");
    const pdfFmt = (n) => `${invCurrency.code} ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n || 0)}`;

    const doc   = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = 210, margin = 20, contentW = pageW - margin * 2;

    doc.setFillColor(108, 63, 207);
    doc.rect(0, 0, pageW, 45, "F");
    doc.setTextColor(255,255,255);
    doc.setFontSize(22); doc.setFont("helvetica","bold");
    doc.text(businessName, margin, 20);
    doc.setFontSize(28);
    doc.text("INVOICE", pageW - margin, 22, { align:"right" });
    doc.setFontSize(10); doc.setFont("helvetica","normal");
    doc.text(inv.invoice_number, pageW - margin, 31, { align:"right" });
    doc.text(`Date: ${new Date().toLocaleDateString("en-NG")}`, pageW - margin, 38, { align:"right" });

    // Currency badge on invoice
    doc.setFillColor(255,255,255);
    doc.setTextColor(108, 63, 207);
    doc.setFontSize(9); doc.setFont("helvetica","bold");
    doc.text(`Currency: ${invCurrency.code} (${invCurrency.symbol})`, margin, 38);

    if (businessPhone) { doc.setTextColor(200,200,255); doc.text(`Tel: ${businessPhone}`, margin, 32); }
    doc.setTextColor(30,30,30);

    let y = 60;
    doc.setFillColor(245,245,250);
    doc.roundedRect(margin, y-5, contentW, 28, 3, 3, "F");
    doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(108,63,207);
    doc.text("BILL TO", margin+5, y+3);
    doc.setFont("helvetica","bold"); doc.setTextColor(30,30,30); doc.setFontSize(12);
    doc.text(inv.customers?.name || "Customer", margin+5, y+11);
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(100,100,100);
    if (inv.customers?.phone) doc.text(`Phone: ${inv.customers.phone}`, margin+5, y+18);
    if (inv.customers?.email) doc.text(`Email: ${inv.customers.email}`, margin+5, y+24);
    doc.setFont("helvetica","bold"); doc.setTextColor(108,63,207); doc.setFontSize(9);
    doc.text("DUE DATE", pageW-margin-5, y+3, { align:"right" });
    doc.setFont("helvetica","normal"); doc.setTextColor(30,30,30); doc.setFontSize(11);
    doc.text(inv.due_date || "On receipt", pageW-margin-5, y+11, { align:"right" });

    y += 38;
    doc.setFillColor(108,63,207);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
    doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(9);
    const col = { desc:margin+4, qty:margin+95, price:margin+122, total:pageW-margin-4 };
    doc.text("DESCRIPTION", col.desc, y+7);
    doc.text("QTY", col.qty, y+7);
    doc.text("UNIT PRICE", col.price, y+7);
    doc.text("AMOUNT", col.total, y+7, { align:"right" });

    y += 14;
    doc.setTextColor(30,30,30); doc.setFont("helvetica","normal"); doc.setFontSize(9);
    (inv.items||[]).forEach((item, idx) => {
      if (idx%2===0) { doc.setFillColor(249,250,251); doc.rect(margin, y-5, contentW, 10, "F"); }
      doc.setTextColor(30,30,30);
      doc.text(String(item.description||""), col.desc, y+2);
      doc.text(String(item.qty), col.qty, y+2);
      doc.text(pdfFmt(Number(item.price)), col.price, y+2);
      doc.text(pdfFmt(Number(item.qty)*Number(item.price)), col.total, y+2, { align:"right" });
      y += 11;
    });

    y += 4;
    doc.setDrawColor(220,220,230);
    doc.line(margin, y, pageW-margin, y);
    y += 10;

    const labelX = pageW - margin - 65, valueX = pageW - margin;
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(110,110,110);
    doc.text("Subtotal", labelX, y); doc.text(pdfFmt(inv.total_amount), valueX, y, { align:"right" }); y += 9;
    doc.text("VAT (0%)", labelX, y); doc.text(pdfFmt(0), valueX, y, { align:"right" }); y += 6;
    doc.setDrawColor(200,200,210); doc.line(labelX-2, y, pageW-margin, y); y += 8;
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(20,20,20);
    doc.text("TOTAL DUE", labelX, y);
    doc.setFontSize(12); doc.text(pdfFmt(inv.total_amount), valueX, y, { align:"right" });
    y += 14;

    const sc = { paid:[34,197,94], overdue:[239,68,68], pending:[245,158,11] };
    const c = sc[inv.status]||sc.pending;
    doc.setFillColor(...c); doc.roundedRect(margin, y, 30, 9, 2, 2, "F");
    doc.setTextColor(255,255,255); doc.setFontSize(8); doc.setFont("helvetica","bold");
    doc.text(inv.status.toUpperCase(), margin+15, y+6, { align:"center" });

    y += 20;
    doc.setDrawColor(220,220,230); doc.line(margin, y, pageW-margin, y); y += 7;
    doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(150,150,150);
    doc.text("Thank you for your business!", pageW/2, y, { align:"center" });
    doc.text("Generated by LedgerLite · ledgerlite.name.ng", pageW/2, y+6, { align:"center" });
    doc.save(`${inv.invoice_number}-${(inv.customers?.name||"invoice").replace(/\s+/g,"-")}.pdf`);
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus size={16}/> New Invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          : invoices.length === 0 ? <div className="p-12 text-center text-gray-400 text-sm">No invoices yet.</div>
          : (
          <table className="w-full min-w-[650px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["Invoice #","Customer","Amount","Currency","Due Date","Status","Actions"].map(h =>
                <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-purple-700">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{inv.customers?.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{fmtInv(inv.total_amount, inv.currency)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-semibold">
                      {getCurrency(inv.currency||"NGN").symbol} {inv.currency||"NGN"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{inv.due_date||"—"}</td>
                  <td className="px-4 py-3">{statusBadge(inv.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <button onClick={() => setViewInvoice(inv)} className="text-gray-400 hover:text-purple-600"><Eye size={15}/></button>
                      <button onClick={() => downloadPDF(inv)} className="text-gray-400 hover:text-blue-600"><Download size={15}/></button>
                      <button onClick={() => shareWhatsApp(inv)} className="text-gray-400 hover:text-green-600"><MessageCircle size={15}/></button>
                      {inv.status==="pending" && (
                        <button onClick={() => updateStatus(inv.id,"paid")}
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
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-900">New Invoice</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              {/* Currency selector for this invoice */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Currency</label>
                <div className="relative">
                  <button type="button" onClick={() => setShowCurrencyDrop(o => !o)}
                    className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-purple-600">{selectedCurrencyObj.symbol}</span>
                      <span>{selectedCurrencyObj.code} — {selectedCurrencyObj.name}</span>
                    </span>
                    <ChevronDown size={14} className="text-gray-400"/>
                  </button>
                  {showCurrencyDrop && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowCurrencyDrop(false)}/>
                      <div className="absolute left-0 right-0 top-11 z-20 bg-white border border-gray-100
                                      rounded-xl shadow-xl max-h-52 overflow-y-auto">
                        {CURRENCIES.map(c => (
                          <button key={c.code} type="button"
                            onClick={() => { setForm(f => ({ ...f, currency: c.code })); setShowCurrencyDrop(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-purple-50 text-left
                              ${form.currency===c.code ? "bg-purple-50 text-purple-700 font-semibold" : "text-gray-700"}`}>
                            <span className="w-7 font-bold text-purple-600">{c.symbol}</span>
                            <span>{c.code} — {c.name}</span>
                            {form.currency===c.code && <span className="ml-auto text-purple-600">✓</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items <span className="text-purple-600 font-semibold ml-1">({selectedCurrencyObj.symbol} {selectedCurrencyObj.code})</span>
                </label>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input value={item.description} onChange={e => updateItem(i,"description",e.target.value)} placeholder="Description" required
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                      <input type="number" value={item.qty} min="1" onChange={e => updateItem(i,"qty",e.target.value)} placeholder="Qty"
                        className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                      <input type="number" value={item.price} onChange={e => updateItem(i,"price",e.target.value)} placeholder="Price" required
                        className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addItem} className="mt-2 text-sm text-purple-600 hover:underline">+ Add item</button>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 text-right">
                <span className="text-sm text-gray-500">Total: </span>
                <span className="text-lg font-bold text-purple-700">
                  {fmtInv(formTotal, form.currency)}
                </span>
              </div>

              <button type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg text-sm">
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
              <div>
                <h3 className="font-semibold text-gray-900">{viewInvoice.invoice_number}</h3>
                <span className="text-xs text-purple-600 font-semibold">
                  {getCurrency(viewInvoice.currency||"NGN").symbol} {viewInvoice.currency||"NGN"}
                </span>
              </div>
              <button onClick={() => setViewInvoice(null)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium">{viewInvoice.customers?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                {statusBadge(viewInvoice.status)}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Due Date</span>
                <span className="font-medium">{viewInvoice.due_date||"N/A"}</span>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
                {(viewInvoice.items||[]).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-50">
                    <span className="text-gray-600">{item.description} × {item.qty}</span>
                    <span className="font-medium">{fmtInv(Number(item.qty)*Number(item.price), viewInvoice.currency)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Total</span>
                <span className="text-purple-700">{fmtInv(viewInvoice.total_amount, viewInvoice.currency)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => downloadPDF(viewInvoice)}
                  className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg text-sm">
                  <Download size={15}/> Download PDF
                </button>
                <button onClick={() => shareWhatsApp(viewInvoice)}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm">
                  <MessageCircle size={15}/> WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
