import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Users, 
  FileText, 
  Package, 
  BarChart3, 
  Settings,
  Wallet
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/debts', icon: Wallet, label: 'Debts' },
    { to: '/invoices', icon: FileText, label: 'Invoices' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="bg-dark text-white w-64 min-h-screen flex flex-col fixed md:relative bottom-0 md:top-0 w-full md:w-64 z-50">
      <div className="p-6 text-2xl font-bold border-b border-white/10 hidden md:block">
        LedgerLite
      </div>
      <nav className="flex-1 flex md:flex-col justify-around md:justify-start p-2 md:p-4 overflow-x-auto md:overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex items-center gap-3 p-3 rounded-lg transition-colors mb-1 whitespace-nowrap ${
                isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/5'
              }`
            }
          >
            <item.icon size={20} />
            <span className="hidden md:inline">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
