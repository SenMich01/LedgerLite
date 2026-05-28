import { createContext, useContext, useState, useEffect } from "react";

export const CURRENCIES = [
  { code: "NGN", symbol: "₦",   name: "Nigerian Naira",     locale: "en-NG" },
  { code: "USD", symbol: "$",   name: "US Dollar",          locale: "en-US" },
  { code: "GBP", symbol: "£",   name: "British Pound",      locale: "en-GB" },
  { code: "EUR", symbol: "€",   name: "Euro",               locale: "de-DE" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi",      locale: "en-GH" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling",    locale: "en-KE" },
  { code: "ZAR", symbol: "R",   name: "South African Rand", locale: "en-ZA" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", locale: "en-TZ" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling",   locale: "en-UG" },
  { code: "XOF", symbol: "CFA", name: "West African CFA",   locale: "fr-SN" },
];

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    const saved = localStorage.getItem("ll_currency");
    return CURRENCIES.find(c => c.code === saved) || CURRENCIES[0];
  });

  const setCurrency = (c) => {
    localStorage.setItem("ll_currency", c.code);
    setCurrencyState(c);
  };

  const fmt = (n) => {
    try {
      return new Intl.NumberFormat(currency.locale, {
        style: "currency",
        currency: currency.code,
        maximumFractionDigits: 0,
      }).format(n || 0);
    } catch {
      return `${currency.symbol}${Number(n || 0).toLocaleString()}`;
    }
  };

  // PDF formatter (avoids special glyphs jsPDF can't render)
  const fmtPDF = (n) =>
    `${currency.code} ${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0
    }).format(n || 0)}`;

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, fmt, fmtPDF, CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
