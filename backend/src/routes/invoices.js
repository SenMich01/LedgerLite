const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customers(name)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .insert([{ ...req.body, user_id: req.user.id }])
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id/pdf', async (req, res) => {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, customers(*)')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
    
    if (error || !invoice) throw new Error('Invoice not found');

    const doc = new jsPDF();
    doc.text(`Invoice: ${invoice.invoice_number}`, 10, 10);
    doc.text(`Customer: ${invoice.customers.name}`, 10, 20);
    doc.text(`Date: ${invoice.created_at.split('T')[0]}`, 10, 30);
    doc.text(`Total: ${invoice.total_amount}`, 10, 40);

    const items = invoice.items.map(item => [item.name, item.qty, item.price, item.qty * item.price]);
    doc.autoTable({
      head: [['Item', 'Qty', 'Price', 'Total']],
      body: items,
      startY: 50
    });

    const pdfBuffer = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_number}.pdf`);
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
