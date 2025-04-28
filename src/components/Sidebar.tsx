// src/components/Sidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FolderIcon, ListIcon, CalendarIcon, UsersIcon, UserIcon, LogOutIcon } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Sidebar: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="bg-white border-r border-gray-200 w-64 h-full overflow-y-auto">
      <div className="p-4">
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Navigation</h3>
          <nav className="space-y-1">
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm rounded-md ${isActive ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              Projects
            </NavLink>
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm rounded-md ${isActive ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <ListIcon className="h-4 w-4 mr-2" />
              Tasks
            </NavLink>
            <NavLink
              to="/timeline"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm rounded-md ${isActive ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Timeline
            </NavLink>
            <NavLink
              to="/teams"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm rounded-md ${isActive ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              Teams
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm rounded-md ${isActive ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Profile
            </NavLink>
          </nav>
        </div>
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-sm text-red-600 rounded-md w-full text-left hover:bg-red-50 transition-colors"
          >
            <LogOutIcon className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;