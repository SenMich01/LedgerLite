const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/summary', async (req, res) => {
  const { period } = req.query;
  const userId = req.user.id;
  
  try {
    let dateFilter = new Date();
    if (period === 'week') dateFilter.setDate(dateFilter.getDate() - 7);
    else if (period === 'month') dateFilter.setMonth(dateFilter.getMonth() - 1);
    else dateFilter.setHours(0, 0, 0, 0);

    const { data: transactions, error: tError } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('date', dateFilter.toISOString().split('T')[0]);

    if (tError) throw tError;

    const { data: debts, error: dError } = await supabase
      .from('debts')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (dError) throw dError;

    const total_revenue = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const total_expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const outstanding_debts = debts.reduce((sum, d) => sum + Number(d.amount), 0);

    res.json({
      total_revenue,
      total_expenses,
      profit: total_revenue - total_expenses,
      outstanding_debts
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/cashflow', async (req, res) => {
  const userId = req.user.id;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type, date')
      .eq('user_id', userId)
      .order('date');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/profit-loss', async (req, res) => {
  const { month } = req.query; // YYYY-MM
  const userId = req.user.id;
  try {
    const start = `${month}-01`;
    const end = `${month}-31`; // Simplified

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type, category')
      .eq('user_id', userId)
      .gte('date', start)
      .lte('date', end);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
