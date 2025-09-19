import React from 'react';
import { 
  Sprout, 
  TestTube, 
  Cpu, 
  Package, 
  BarChart3, 
  Search,
  Shield,
  FileText
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, onTabChange }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const commonItems = [
      { id: 'tracking', label: 'Track Batch', icon: Search },
      { id: 'audit', label: 'Audit Log', icon: FileText }
    ];

    if (user?.role === 1) { // Collector
      return [
        { id: 'collection', label: 'Collector Group', icon: Sprout },
        ...commonItems
      ];
    }

    if (user?.role === 2) { // Tester
      return [
        { id: 'quality', label: 'Testing Labs', icon: TestTube },
        ...commonItems
      ];
    }

    if (user?.role === 3) { // Processor
      return [
        { id: 'processing', label: 'Processing Unit', icon: Cpu },
        ...commonItems
      ];
    }

    if (user?.role === 4) { // Manufacturer
      return [
        { id: 'manufacturing', label: 'Manufacturing Plant', icon: Package },
        ...commonItems
      ];
    }

    // Consumer role (role 6)
    return [
      { id: 'consumer', label: 'Verify Product', icon: Shield },
      { id: 'tracking', label: 'Track Batch', icon: Search },
      { id: 'rating', label: 'Rate Platform', icon: BarChart3 }
    ];
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`
      fixed top-[73px] left-0 z-40 h-[calc(100vh-73px)] w-64 
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0 lg:static lg:h-[calc(100vh-73px)]
      bg-black/20 backdrop-blur-xl border-r border-green-500/20
    `}>
      <nav className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`
                    flex items-center space-x-3 w-full px-4 py-3 rounded-lg
                    text-sm font-medium transition-all duration-200
                    ${activeTab === item.id 
                      ? getActiveButtonStyle(user?.role) 
                      : 'text-green-300 hover:bg-green-500/10 hover:text-white'
                    }
                  `}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Role Indicator */}
        <div className={`mt-8 p-4 backdrop-blur-xl rounded-lg border ${getRoleIndicatorStyle(user?.role)}`}>
          <div className="text-center">
            <p className="text-xs text-green-300 font-medium mb-1">Your Role</p>
            <p className="text-sm font-bold text-white capitalize">
              {user?.role === 1 ? 'Collector' : 
               user?.role === 2 ? 'Tester' : 
               user?.role === 3 ? 'Processor' : 
               user?.role === 4 ? 'Manufacturer' : 
               'Consumer'}
            </p>
            <p className="text-xs text-green-300 mt-1">{user?.organization}</p>
          </div>
        </div>
      </nav>
    </aside>
  );
};

const getActiveButtonStyle = (role?: number) => {
  switch (role) {
    case 1: return 'bg-gradient-to-r from-green-500/80 to-emerald-600/80 text-white shadow-lg backdrop-blur-md border border-green-400/30';
    case 2: return 'bg-gradient-to-r from-blue-500/80 to-indigo-600/80 text-white shadow-lg backdrop-blur-md border border-blue-400/30';
    case 3: return 'bg-gradient-to-r from-purple-500/80 to-indigo-600/80 text-white shadow-lg backdrop-blur-md border border-purple-400/30';
    case 4: return 'bg-gradient-to-r from-orange-500/80 to-red-600/80 text-white shadow-lg backdrop-blur-md border border-orange-400/30';
    default: return 'bg-gradient-to-r from-emerald-500/80 to-teal-600/80 text-white shadow-lg backdrop-blur-md border border-emerald-400/30';
  }
};

const getRoleIndicatorStyle = (role?: number) => {
  switch (role) {
    case 1: return 'bg-green-500/10 border-green-500/30';
    case 2: return 'bg-blue-500/10 border-blue-500/30';
    case 3: return 'bg-purple-500/10 border-purple-500/30';
    case 4: return 'bg-orange-500/10 border-orange-500/30';
    default: return 'bg-emerald-500/10 border-emerald-500/30';
  }
};
export default Sidebar;