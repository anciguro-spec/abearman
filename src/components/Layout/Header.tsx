import React, { useState } from 'react';
import { Menu, X, Leaf, User, LogOut, QrCode } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-black/20 backdrop-blur-xl border-b border-green-500/20 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo and Menu */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors lg:hidden"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-500/80 to-emerald-600/80 backdrop-blur-md rounded-lg border border-green-400/30">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">HerbionYX</h1>
              <p className="text-xs text-green-300">Ayurvedic Traceability</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          <button className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors">
            <QrCode className="h-5 w-5" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-green-400/80 to-emerald-500/80 backdrop-blur-md rounded-full flex items-center justify-center border border-green-400/30">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-green-300 capitalize">
                  {user?.role === 1 ? 'Collector' : 
                   user?.role === 2 ? 'Tester' : 
                   user?.role === 3 ? 'Processor' : 
                   user?.role === 4 ? 'Manufacturer' : 
                   user?.role === 5 ? 'Admin' : 'Consumer'}
                </p>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-black/40 backdrop-blur-xl rounded-lg shadow-lg border border-green-500/30 py-1 z-50">
                <div className="px-4 py-2 border-b border-green-500/20">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-green-300">{user?.organization}</p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;