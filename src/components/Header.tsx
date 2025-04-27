// src/components/Header.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ClockIcon, LogOutIcon } from 'lucide-react';
import Button from './ui/Button';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-6 w-6 text-primary-600" />
            <h1 className="text-xl font-semibold text-gray-900">TimeFlow</h1>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-2">
              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-primary-100 text-primary-800' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                Projects
              </NavLink>
              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-primary-100 text-primary-800' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                Tasks
              </NavLink>
              <NavLink
                to="/timeline"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-primary-100 text-primary-800' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                Timeline
              </NavLink>
            </nav>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOutIcon className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;