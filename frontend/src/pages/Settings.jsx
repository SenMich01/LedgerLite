import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User, Lock, LogOut, CheckCircle } from "lucide-react";

export default function Settings() {
  const [profile, setProfile] = useState({ full_name: "", business_name: "", phone: "" });
  const [passwords, setPasswords] = useState({ new_password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    const { data } = await supabase.from("users_profiles").select("*").eq("id", user.id).single();
    if (data) setProfile({ full_name: data.full_name || "", business_name: data.business_name || "", phone: data.phone || "" });
  }

  async function saveProfile(e) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("users_profiles").upsert({ id: user.id, ...profile });
    setLoading(false);
    setProfileMsg(error ? "Error saving profile" : "Profile saved successfully!");
    setTimeout(() => setProfileMsg(""), 3000);
  }

  async function changePassword(e) {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      setPasswordMsg("Passwords do not match"); return;
    }
    if (passwords.new_password.length < 6) {
      setPasswordMsg("Password must be at least 6 characters"); return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new_password });
    setLoading(false);
    setPasswordMsg(error ? error.message : "Password updated successfully!");
    setPasswords({ new_password: "", confirm_password: "" });
    setTimeout(() => setPasswordMsg(""), 3000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Business Profile</h2>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          {[["Full Name", "full_name"], ["Business Name", "business_name"], ["Phone Number", "phone"]].map(([label, key]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input value={profile[key]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          ))}
          {profileMsg && (
            <div className={`flex items-center gap-2 text-sm rounded-lg px-4 py-2.5 ${profileMsg.includes("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
              <CheckCircle size={14} /> {profileMsg}
            </div>
          )}
          <button type="submit" disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50">
            Save Profile
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Lock size={20} className="text-blue-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Change Password</h2>
        </div>
        <form onSubmit={changePassword} className="space-y-4">
          {[["New Password", "new_password"], ["Confirm Password", "confirm_password"]].map(([label, key]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type="password" value={passwords[key]} onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          ))}
          {passwordMsg && (
            <div className={`flex items-center gap-2 text-sm rounded-lg px-4 py-2.5 ${passwordMsg.includes("Error") || passwordMsg.includes("match") || passwordMsg.includes("least") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
              <CheckCircle size={14} /> {passwordMsg}
            </div>
          )}
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50">
            Update Password
          </button>
        </form>
      </div>

      {/* Plan */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
        <h2 className="font-semibold mb-1">Current Plan: Free</h2>
        <p className="text-sm text-purple-200 mb-4">Upgrade to Pro for unlimited transactions, advanced reports, and staff access.</p>
        <button className="bg-white text-purple-700 font-semibold px-5 py-2 rounded-lg text-sm hover:bg-purple-50 transition-colors">
          Upgrade to Pro — ₦2,000/month
        </button>
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="flex items-center gap-2 text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}
