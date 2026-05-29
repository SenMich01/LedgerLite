import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="5" y="4" width="7" height="24" rx="2" fill="#1B6B3A"/>
      <rect x="5" y="27" width="22" height="7" rx="2" fill="#1B6B3A"/>
      <rect x="8" y="8"  width="2" height="3" rx="0.5" fill="#fff" opacity="0.5"/>
      <rect x="8" y="14" width="2" height="3" rx="0.5" fill="#fff" opacity="0.5"/>
      <rect x="8" y="20" width="2" height="3" rx="0.5" fill="#fff" opacity="0.5"/>
      <polyline points="7,23 13,16 19,19 27,8"
        stroke="#4ADE80" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <polyline points="22,6 28,6 28,12"
        stroke="#4ADE80" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    full_name:     "",
    business_name: "",
    phone:         "",
    email:         "",
    password:      "",
    confirm:       "",
  });

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match."); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }

    setLoading(true);

    try {
      // ── Step 1: Create auth account ──────────────────────
      const { data, error: signUpError } = await supabase.auth.signUp({
        email:    form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name:     form.full_name.trim(),
            business_name: form.business_name.trim(),
            phone:         form.phone.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // ── Step 2: Create profile row in users_profiles ─────
      if (data?.user) {
        await supabase.from("users_profiles").upsert({
          id:            data.user.id,
          full_name:     form.full_name.trim(),
          business_name: form.business_name.trim(),
          phone:         form.phone.trim(),
          plan:          "free",
        });
      }

      // ── Step 3: Show confirmation message ─────────────────
      setSuccess(true);

    } catch (err) {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  // ── Success state ────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm
                        border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center
                          justify-center mx-auto mb-5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#16a34a"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Check your email
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            We sent a confirmation link to{" "}
            <span className="font-semibold text-gray-700">{form.email}</span>.
            Click the link to activate your account and access your dashboard.
          </p>
          <p className="text-xs text-gray-400">
            Didn't get it? Check your spam folder or{" "}
            <button
              onClick={() => setSuccess(false)}
              className="text-purple-600 hover:underline">
              try again
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  // ── Signup form ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1E1B4B] rounded-2xl flex items-center
                          justify-center mx-auto mb-4 p-2">
            <Logo size={44} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">LedgerLite</h1>
          <p className="text-gray-500 text-sm mt-1">
            Smart bookkeeping for African SMEs
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Create your account
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Free forever. No credit card required.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600
                            text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => update("full_name", e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => update("phone", e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={form.business_name}
                onChange={e => update("business_name", e.target.value)}
                placeholder="My Business Ltd"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                           text-sm focus:outline-none focus:ring-2
                           focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => update("email", e.target.value)}
                required
                placeholder="you@business.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                           text-sm focus:outline-none focus:ring-2
                           focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => update("password", e.target.value)}
                required
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                           text-sm focus:outline-none focus:ring-2
                           focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={form.confirm}
                onChange={e => update("confirm", e.target.value)}
                required
                placeholder="Repeat your password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                           text-sm focus:outline-none focus:ring-2
                           focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white
                         font-semibold py-3 rounded-lg text-sm transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? "Creating account..." : "Create Free Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login"
              className="text-purple-600 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
