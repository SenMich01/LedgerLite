const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.post('/signup', async (req, res) => {
  const { email, password, full_name, business_name, phone } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          business_name,
          phone
        }
      }
    });
    if (error) throw error;
    
    // Create profile in users_profiles table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users_profiles')
        .insert([{
          id: data.user.id,
          full_name,
          business_name,
          phone
        }]);
      if (profileError) console.error('Profile creation error:', profileError);
    }

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
