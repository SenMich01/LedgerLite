import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Download } from "lucide-react";

const COLORS = ["#6C3FCF", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6", "#f97316"];

export default function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => { fetchData(); }, [period]);

  async function fetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    let from = new Date();
    if (period === "week") from.setDate(from.getDate() - 7);
    else if (period === "month") from.setMonth(from.getMonth() - 1);
    else if (period === "quarter") from.setMonth(from.getMonth() - 3);
    else from.setFullYear(from.getFullYear() - 1);

    const { data } = await supabase.from("transactions").select("*")
      .eq("user_id", user.id).gte("date", from.toISOString().split("T")[0]).order("date");
    setTransactions(data || []);
    setLoading(false);
  }

  const fmt = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
  const income = transactions.filter(t => t.type === "income");
  const expenses = transactions.filter(t => t.type === "expense");
  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const profit = totalIncome - totalExpenses;

  // Category breakdown
  const incomeByCategory = Object.entries(income.reduce((acc, t) => {
    acc[t.category || "Other"] = (acc[t.category || "Other"] || 0) + Number(t.amount); return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const expenseByCategory = Object.entries(expenses.reduce((acc, t) => {
    acc[t.category || "Other"] = (acc[t.category || "Other"] || 0) + Number(t.amount); return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  // Daily chart
  const dailyMap = {};
  transactions.forEach(t => {
    if (!dailyMap[t.date]) dailyMap[t.date] = { date: t.date.slice(5), income: 0, expense: 0 };
    if (t.type === "income") dailyMap[t.date].income += Number(t.amount);
    else dailyMap[t.date].expense += Number(t.amount);
  });
  const dailyChart = Object.values(dailyMap).slice(-14);

  function exportCSV() {
    const rows = [["Date", "Type", "Category", "Amount", "Payment Method", "Description"],
      ...transactions.map(t => [t.date, t.type, t.category, t.amount, t.payment_method, t.description || ""])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ledgerlite-report.csv"; a.click();
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex gap-2">
          {[["week", "7 Days"], ["month", "30 Days"], ["quarter", "3 Months"], ["year", "1 Year"]].map(([val, label]) => (
            <button key={val} onClick={() => setPeriod(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${period === val ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {label}
            </button>
          ))}
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded-full text-xs font-medium hover:bg-gray-700">
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: fmt(totalIncome), color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Expenses", value: fmt(totalExpenses), color: "text-red-500", bg: "bg-red-50" },
          { label: "Net Profit", value: fmt(profit), color: profit >= 0 ? "text-purple-700" : "text-red-600", bg: "bg-purple-50" },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {loading ? <div className="p-8 text-center text-gray-400">Loading reports...</div> : (
        <>
          {/* Cash Flow Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Cash Flow</h2>
            {dailyChart.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No data for this period</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  <Legend />
                  <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Income by Category */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Income by Category</h2>
              {incomeByCategory.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No income data</p> : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={incomeByCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {incomeByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Expense by Category */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Expenses by Category</h2>
              {expenseByCategory.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No expense data</p> : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={expenseByCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
