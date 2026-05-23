import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const TopBar = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="bg-white h-16 border-b flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="font-semibold text-gray-700 md:hidden">LedgerLite</div>
      <div className="flex-1"></div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={18} />
          <span>{user?.email}</span>
        </div>
        <button 
          onClick={signOut}
          className="text-gray-500 hover:text-danger flex items-center gap-1 text-sm"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
