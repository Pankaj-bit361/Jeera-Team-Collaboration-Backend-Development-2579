import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useOrg } from '../../context/OrgContext';
import { useAuth } from '../../context/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { cn } from '../../lib/utils';

const Sidebar = () => {
  const { currentOrg, organizations, switchOrg } = useOrg();
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: FiIcons.FiPieChart },
    { name: 'Tasks', path: '/tasks', icon: FiIcons.FiCheckSquare },
    { name: 'Team', path: '/team', icon: FiIcons.FiUsers },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0 border-r border-gray-800">
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <SafeIcon name="Layers" className="h-6 w-6 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight">Jeera</span>
      </div>

      <div className="p-4">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Organization</label>
        <select 
          className="w-full bg-gray-800 border-gray-700 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2.5"
          value={currentOrg?._id || ''}
          onChange={(e) => switchOrg(e.target.value)}
        >
          {organizations.map(org => (
            <option key={org._id} value={org._id}>{org.name}</option>
          ))}
        </select>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
              isActive 
                ? "bg-blue-600 text-white" 
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            )}
          >
            <SafeIcon icon={item.icon} className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
        >
          <SafeIcon name="LogOut" className="mr-3 h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;