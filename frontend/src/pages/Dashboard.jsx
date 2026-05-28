import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ArrowUpRight, ArrowDownRight, Users, AlertCircle, Plus, TrendingUp, Package } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { fmt, currency } = useCurrency();
  const [stats, setStats]       = useState({ revenue: 0, expenses: 0, profit: 0, outstanding: 0 });
  const [recentTx, setRecentTx] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("users_profiles").select("full_name, business_name").eq("id", user.id).single();
    if (profile) setUserName(profile.business_name || profile.full_name || "");

    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
    const { data: txData } = await supabase.from("transactions").select("*")
      .eq("user_id", user.id).gte("date", startOfMonth.toISOString().split("T")[0]).order("date", { ascending: false });

    if (txData) {
      const revenue  = txData.filter(t => t.type === "income").reduce((s,t) => s + Number(t.amount), 0);
      const expenses = txData.filter(t => t.type === "expense").reduce((s,t) => s + Number(t.amount), 0);
      setStats(s => ({ ...s, revenue, expenses, profit: revenue - expenses }));
      setRecentTx(txData.slice(0, 6));
      const days = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        days[key] = { date: key.slice(5), income: 0, expense: 0 };
      }
      txData.forEach(t => { if (days[t.date]) { if (t.type==="income") days[t.date].income += Number(t.amount); else days[t.date].expense += Number(t.amount); }});
      setChartData(Object.values(days));
    }
    const { data: debts } = await supabase.from("debts").select("amount").eq("user_id", user.id).eq("status", "pending");
    if (debts) setStats(s => ({ ...s, outstanding: debts.reduce((s,d) => s + Number(d.amount), 0) }));
    const { data: products } = await supabase.from("products").select("*").eq("user_id", user.id);
    if (products) setLowStock(products.filter(p => p.stock_quantity <= p.low_stock_threshold));
    setLoading(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {userName ? `Welcome back, ${userName} 👋` : "Dashboard"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("en-NG", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-semibold">
            {currency.symbol} {currency.code} — {currency.name}
          </span>
          <Link to="/transactions"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={16} /><span className="hidden sm:inline">Add Transaction</span><span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Revenue (Month)",   value: fmt(stats.revenue),     icon:<ArrowUpRight size={20} className="text-green-600"/>,  bg:"bg-green-50",  vc:"text-green-700" },
          { label:"Expenses (Month)",  value: fmt(stats.expenses),    icon:<ArrowDownRight size={20} className="text-red-500"/>,  bg:"bg-red-50",    vc:"text-red-600" },
          { label:"Net Profit",        value: fmt(stats.profit),      icon:<TrendingUp size={20} className="text-purple-600"/>,   bg:"bg-purple-50", vc: stats.profit>=0?"text-purple-700":"text-red-600" },
          { label:"Outstanding Debts", value: fmt(stats.outstanding), icon:<Users size={20} className="text-orange-500"/>,        bg:"bg-orange-50", vc:"text-orange-600" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium leading-tight">{c.label}</p>
              <div className={`${c.bg} w-8 h-8 rounded-full flex items-center justify-center shrink-0`}>{c.icon}</div>
            </div>
            <p className={`text-lg font-bold ${c.vc} break-all`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Last 7 Days — Income vs Expenses ({currency.code})</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
            <XAxis dataKey="date" tick={{ fontSize:12 }}/>
            <YAxis tick={{ fontSize:11 }} tickFormatter={v => `${currency.symbol}${(v/1000).toFixed(0)}k`}/>
            <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius:"8px", fontSize:"12px" }}/>
            <Legend/>
            <Line type="monotone" dataKey="income"  stroke="#22c55e" strokeWidth={2} dot={false} name="Income"/>
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={false} name="Expenses"/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Recent Transactions</h2>
            <Link to="/transactions" className="text-xs text-purple-600 hover:underline">View all</Link>
          </div>
          {recentTx.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No transactions yet</div>
          ) : (
            <div className="space-y-3">
              {recentTx.map(tx => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                      ${tx.type==="income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {tx.type==="income" ? "+" : "-"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{tx.category || "Uncategorized"}</p>
                      <p className="text-xs text-gray-400">{tx.date} · {tx.payment_method}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ml-2 ${tx.type==="income" ? "text-green-600" : "text-red-500"}`}>
                    {tx.type==="income" ? "+" : "-"}{fmt(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label:"New Invoice",  to:"/invoices",  color:"bg-purple-50 text-purple-700 hover:bg-purple-100" },
                { label:"Add Customer", to:"/customers", color:"bg-blue-50 text-blue-700 hover:bg-blue-100" },
                { label:"Track Debt",   to:"/debts",     color:"bg-orange-50 text-orange-700 hover:bg-orange-100" },
                { label:"View Reports", to:"/reports",   color:"bg-green-50 text-green-700 hover:bg-green-100" },
              ].map(a => <Link key={a.label} to={a.to} className={`${a.color} text-xs font-medium px-3 py-2.5 rounded-xl transition-colors text-center`}>{a.label}</Link>)}
            </div>
          </div>
          {lowStock.length > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={16} className="text-amber-600"/>
                <h2 className="text-sm font-semibold text-amber-800">Low Stock Alert</h2>
              </div>
              {lowStock.slice(0,3).map(p => (
                <div key={p.id} className="flex items-center justify-between py-1">
                  <span className="text-xs text-amber-800 font-medium">{p.name}</span>
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">{p.stock_quantity} left</span>
                </div>
              ))}
              <Link to="/inventory" className="text-xs text-amber-700 font-medium mt-2 block hover:underline">Manage inventory →</Link>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Package size={16} className="text-green-600"/>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Stock levels are healthy</p>
                <Link to="/inventory" className="text-xs text-green-600 hover:underline">View inventory →</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
