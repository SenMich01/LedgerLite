import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/UI/StatCard';
import { TrendingUp, TrendingDown, Wallet, BarChart3, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { session } = useAuth();
  const [summary, setSummary] = useState({
    total_revenue: 0,
    total_expenses: 0,
    profit: 0,
    outstanding_debts: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [cashflow, setCashflow] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${session.access_token}` }
        };
        const apiUrl = import.meta.env.VITE_API_URL;
        
        const [summaryRes, transactionsRes, cashflowRes] = await Promise.all([
          axios.get(`${apiUrl}/api/reports/summary`, config),
          axios.get(`${apiUrl}/api/transactions?limit=5`, config),
          axios.get(`${apiUrl}/api/reports/cashflow`, config)
        ]);

        setSummary(summaryRes.data);
        setRecentTransactions(transactionsRes.data.slice(0, 5));
        setCashflow(cashflowRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchData();
  }, [session]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90">
            <Plus size={18} /> Quick Action
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₦${summary.total_revenue.toLocaleString()}`} icon={TrendingUp} colorClass="text-success" />
        <StatCard label="Total Expenses" value={`₦${summary.total_expenses.toLocaleString()}`} icon={TrendingDown} colorClass="text-danger" />
        <StatCard label="Net Profit" value={`₦${summary.profit.toLocaleString()}`} icon={BarChart3} colorClass="text-primary" />
        <StatCard label="Outstanding Debts" value={`₦${summary.outstanding_debts.toLocaleString()}`} icon={Wallet} colorClass="text-warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Revenue vs Expenses (Last 30 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashflow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#6C3FCF" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-3 text-sm">{t.date}</td>
                    <td className="py-3 text-sm">{t.description}</td>
                    <td className="py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-right font-medium">₦{t.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
