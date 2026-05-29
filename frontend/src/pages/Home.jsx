import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  ArrowRight, BarChart2, FileText, Users, Package,
  TrendingUp, Shield, CheckCircle, Menu, X,
  Globe, Zap, Bell
} from "lucide-react";

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

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-3xl" />
      <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/60 text-xs">This Month</p>
            <p className="text-white font-bold text-lg">Financial Overview</p>
          </div>
          <div className="bg-green-500/20 border border-green-400/30 rounded-full px-3 py-1">
            <span className="text-green-400 text-xs font-semibold">● Live</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "Revenue",  value: "₦485,000", color: "text-green-400",  bg: "bg-green-500/10"  },
            { label: "Expenses", value: "₦142,000", color: "text-red-400",    bg: "bg-red-500/10"    },
            { label: "Profit",   value: "₦343,000", color: "text-purple-300", bg: "bg-purple-500/10" },
            { label: "Debts",    value: "₦58,000",  color: "text-orange-400", bg: "bg-orange-500/10" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
              <p className="text-white/50 text-xs mb-1">{s.label}</p>
              <p className={`${s.color} font-bold text-sm`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/40 text-xs mb-3">Last 7 days</p>
          <div className="flex items-end gap-1.5 h-14">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
                <div className="w-full bg-purple-400/60 rounded-t-sm" style={{ height: `${h}%` }} />
                <div className="w-full bg-green-400/40 rounded-t-sm" style={{ height: `${h * 0.4}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {[
            { name: "Sales Income",    amt: "+₦85,000", type: "income"  },
            { name: "Transport",       amt: "-₦12,000", type: "expense" },
            { name: "Invoice #INV-12", amt: "+₦45,000", type: "income"  },
          ].map(t => (
            <div key={t.name}
              className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${t.type === "income"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"}`}>
                  {t.type === "income" ? "+" : "-"}
                </div>
                <span className="text-white/70 text-xs">{t.name}</span>
              </div>
              <span className={`text-xs font-semibold
                ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                {t.amt}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }) {
  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-6
                    hover:shadow-lg hover:border-purple-200 transition-all duration-300">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4
                       group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={22} className="text-white" />
      </div>
      <h3 className="font-bold text-gray-900 mb-2 text-base">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingCard({ plan, price, desc, features, highlight, cta, to }) {
  return (
    <div className={`relative rounded-2xl p-7 flex flex-col
      ${highlight
        ? "bg-[#1E1B4B] text-white shadow-2xl shadow-purple-900/30 scale-105"
        : "bg-white border border-gray-100 text-gray-900"}`}>
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500
                        text-white text-xs font-bold px-4 py-1 rounded-full">
          MOST POPULAR
        </div>
      )}
      <div className="mb-5">
        <p className={`text-sm font-semibold mb-1
          ${highlight ? "text-purple-300" : "text-purple-600"}`}>
          {plan}
        </p>
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-black
            ${highlight ? "text-white" : "text-gray-900"}`}>
            {price}
          </span>
          {price !== "Free" && (
            <span className={`text-sm ${highlight ? "text-white/50" : "text-gray-400"}`}>
              /month
            </span>
          )}
        </div>
        <p className={`text-sm mt-2 ${highlight ? "text-white/60" : "text-gray-500"}`}>
          {desc}
        </p>
      </div>
      <ul className="space-y-3 flex-1 mb-6">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2.5">
            <CheckCircle size={16}
              className={`shrink-0 mt-0.5
                ${highlight ? "text-green-400" : "text-green-500"}`} />
            <span className={`text-sm
              ${highlight ? "text-white/80" : "text-gray-600"}`}>
              {f}
            </span>
          </li>
        ))}
      </ul>
      <Link to={to}
        className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all
          ${highlight
            ? "bg-purple-500 hover:bg-purple-400 text-white"
            : "bg-gray-100 hover:bg-purple-600 hover:text-white text-gray-700"}`}>
        {cta}
      </Link>
    </div>
  );
}

export default function Home() {
  const [session, setSession]     = useState(null);
  const [scrolled, setScrolled]   = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: TrendingUp, color: "bg-green-500",
      title: "Income & Expense Tracking",
      desc:  "Record any transaction in under 5 seconds. Categorise by type, payment method and date automatically.",
    },
    {
      icon: FileText, color: "bg-purple-600",
      title: "Professional Invoices",
      desc:  "Create beautiful PDF invoices and send them directly to customers via WhatsApp or email.",
    },
    {
      icon: Users, color: "bg-orange-500",
      title: "Debt & Credit Tracking",
      desc:  "Track every customer who owes you money. Get automatic reminders and see overdue balances instantly.",
    },
    {
      icon: Package, color: "bg-blue-500",
      title: "Inventory Management",
      desc:  "Monitor stock levels in real time. Get low-stock alerts before you run out of best-selling products.",
    },
    {
      icon: BarChart2, color: "bg-rose-500",
      title: "Financial Reports",
      desc:  "Automatic profit and loss, cash flow and expense reports. Understand exactly where your money goes.",
    },
    {
      icon: Globe, color: "bg-teal-500",
      title: "Multi-Currency Support",
      desc:  "Switch between NGN, USD, GBP, GHS, KES and more. Perfect for businesses with international clients.",
    },
  ];

  const steps = [
    {
      n: "01",
      title: "Create your free account",
      desc:  "Sign up in 30 seconds with just your email. No credit card required. No hidden fees.",
    },
    {
      n: "02",
      title: "Add your business details",
      desc:  "Set your business name, currency and start adding income and expenses immediately.",
    },
    {
      n: "03",
      title: "Get instant insights",
      desc:  "Your dashboard updates in real time. Know your profit, track debts and send invoices from day one.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* SEO Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "LedgerLite",
        "description": "Free bookkeeping and accounting app for Nigerian and African small businesses.",
        "url": "https://ledgerlite.name.ng",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "NGN" },
      })}} />

      {/* ── NAVIGATION ─────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center p-1
              ${scrolled ? "bg-[#1E1B4B]" : "bg-white/20 border border-white/30"}`}>
              <Logo size={24} />
            </div>
            <span className={`font-black text-xl tracking-tight
              ${scrolled ? "text-gray-900" : "text-white"}`}>
              LedgerLite
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[["#features","Features"],["#how-it-works","How It Works"],["#pricing","Pricing"]].map(([href, label]) => (
              <a key={href} href={href}
                className={`text-sm font-medium transition-colors hover:text-purple-500
                  ${scrolled ? "text-gray-600" : "text-white/80"}`}>
                {label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <Link to="/dashboard"
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700
                           text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Go to Dashboard <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link to="/login"
                  className={`text-sm font-medium px-4 py-2.5 rounded-xl transition-colors
                    ${scrolled
                      ? "text-gray-700 hover:text-purple-600"
                      : "text-white/90 border border-white/30 hover:bg-white/10"}`}>
                  Login
                </Link>
                <Link to="/signup"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm
                             font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileNav(o => !o)} className="md:hidden p-1.5">
            {mobileNav
              ? <X   size={22} className={scrolled ? "text-gray-700" : "text-white"} />
              : <Menu size={22} className={scrolled ? "text-gray-700" : "text-white"} />}
          </button>
        </div>

        {mobileNav && (
          <div className="md:hidden bg-white border-t border-gray-100 px-5 py-5 space-y-4 shadow-lg">
            {[["#features","Features"],["#how-it-works","How It Works"],["#pricing","Pricing"]].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileNav(false)}
                className="block text-gray-700 font-medium py-1">{label}</a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              {session ? (
                <Link to="/dashboard" onClick={() => setMobileNav(false)}
                  className="flex items-center justify-center gap-2 bg-purple-600
                             text-white font-semibold py-3 rounded-xl text-sm">
                  Go to Dashboard <ArrowRight size={15} />
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileNav(false)}
                    className="text-center text-gray-700 font-medium py-3
                               border border-gray-200 rounded-xl text-sm">
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setMobileNav(false)}
                    className="text-center bg-purple-600 text-white
                               font-semibold py-3 rounded-xl text-sm">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <header className="bg-[#1E1B4B] pt-32 pb-20 px-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full
                        blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-600/10 rounded-full
                        blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20
                              text-green-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
                <Zap size={12} /> Free bookkeeping app for Nigerian SMEs
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
                The Financial OS for{" "}
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(135deg, #4ADE80, #22D3EE)" }}>
                  African Small Businesses
                </span>
              </h1>

              <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
                Track income and expenses, send professional invoices, manage debts
                and understand your profit — all from your phone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={session ? "/dashboard" : "/signup"}
                  className="flex items-center justify-center gap-2 bg-purple-600
                             hover:bg-purple-500 text-white font-bold px-7 py-4
                             rounded-xl text-base transition-all hover:scale-105
                             shadow-lg shadow-purple-900/40">
                  {session ? "Go to Dashboard" : "Start For Free"}
                  <ArrowRight size={18} />
                </Link>
                {!session && (
                  <Link to="/login"
                    className="flex items-center justify-center gap-2 border border-white/30
                               hover:bg-white/10 text-white font-medium px-7 py-4
                               rounded-xl text-base transition-colors">
                    Login to Account
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-5 mt-8">
                <div className="flex -space-x-2">
                  {["#6C3FCF","#1B6B3A","#F59E0B","#EF4444"].map((c, i) => (
                    <div key={i}
                      className="w-8 h-8 rounded-full border-2 border-[#1E1B4B]
                                 flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: c }}>
                      {["A","B","C","D"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-white/60 text-sm">
                  Join <span className="text-white font-semibold">business owners</span> managing finances smarter
                </p>
              </div>
            </div>

            <div className="hidden md:block">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </header>

      {/* ── STATS STRIP ────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 py-6 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "39M+",  label: "Nigerian SMEs"        },
            { value: "Free",  label: "To Start"             },
            { value: "10+",   label: "Currencies Supported" },
            { value: "100%",  label: "Mobile Friendly"      },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-black text-purple-700">{s.value}</p>
              <p className="text-gray-500 text-sm mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section id="features" className="py-20 px-5 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-4">
              Everything your business needs
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Built specifically for Nigerian and African small business owners —
              market traders, POS operators, shop owners, freelancers and more.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-4">
              Up and running in minutes
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              No complicated setup. No accounting degree required.
              LedgerLite is designed to work the first time you open it.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map(s => (
              <div key={s.n} className="bg-gray-50 rounded-2xl p-7">
                <div className="w-14 h-14 bg-[#1E1B4B] rounded-2xl flex items-center justify-center mb-5">
                  <span className="text-green-400 font-black text-lg">{s.n}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-5 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider">
              Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-4">
              Start free. Upgrade when you grow.
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              No credit card required to start. Affordable plans designed for
              Nigerian and African business owners.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            <PricingCard
              plan="Free" price="Free"
              desc="Perfect for getting started"
              features={[
                "Up to 50 transactions/month",
                "Basic income & expense tracking",
                "1 invoice per month",
                "Dashboard overview",
                "Mobile app access",
              ]}
              highlight={false} cta="Get Started Free" to="/signup"
            />
            <PricingCard
              plan="Pro" price="₦2,000"
              desc="For growing businesses"
              features={[
                "Unlimited transactions",
                "Unlimited invoices & PDFs",
                "Debt tracking & reminders",
                "Inventory management",
                "Full financial reports",
                "Multi-currency support",
                "WhatsApp invoice sharing",
              ]}
              highlight={true} cta="Start Pro Plan" to="/signup"
            />
            <PricingCard
              plan="Premium" price="₦5,000"
              desc="For established businesses"
              features={[
                "Everything in Pro",
                "Multi-user staff access",
                "Role-based permissions",
                "AI financial insights",
                "Priority support",
                "Advanced analytics",
              ]}
              highlight={false} cta="Start Premium" to="/signup"
            />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────── */}
      <section className="py-20 px-5 bg-[#1E1B4B] relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-green-600/10 rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-5">
            Start tracking your business finances today
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Join business owners across Nigeria who are managing their money smarter
            with LedgerLite. Free forever on the basic plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={session ? "/dashboard" : "/signup"}
              className="flex items-center justify-center gap-2 bg-purple-600
                         hover:bg-purple-500 text-white font-bold px-8 py-4
                         rounded-xl text-base transition-all hover:scale-105">
              {session ? "Go to Dashboard" : "Create Free Account"}
              <ArrowRight size={18} />
            </Link>
            {!session && (
              <Link to="/login"
                className="flex items-center justify-center border border-white/30
                           hover:bg-white/10 text-white font-medium px-8 py-4
                           rounded-xl text-base transition-colors">
                I already have an account
              </Link>
            )}
          </div>
          <p className="text-white/30 text-sm mt-5">
            No credit card required · Free forever on basic plan · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-gray-950 py-12 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-[#1E1B4B] rounded-xl flex items-center justify-center p-1">
                  <Logo size={24} />
                </div>
                <span className="text-white font-black text-xl">LedgerLite</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                The financial operating system for African small businesses.
                Track money, send invoices, manage debts — all from your phone.
              </p>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-4">Product</p>
              <ul className="space-y-2.5">
                {[["#features","Features"],["#pricing","Pricing"],["#how-it-works","How It Works"]].map(([href, label]) => (
                  <li key={label}>
                    <a href={href}
                      className="text-gray-400 hover:text-white text-sm transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-4">Account</p>
              <ul className="space-y-2.5">
                {[["/signup","Create Account"],["/login","Login"],["/dashboard","Dashboard"]].map(([to, label]) => (
                  <li key={label}>
                    <Link to={to}
                      className="text-gray-400 hover:text-white text-sm transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row
                          items-center justify-between gap-3">
            <p className="text-gray-500 text-sm">© 2026 LedgerLite. All rights reserved.</p>
            <p className="text-gray-500 text-sm">Built for Nigerian & African SMEs 🇳🇬</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
