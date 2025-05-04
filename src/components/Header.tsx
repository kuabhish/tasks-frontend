import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ClockIcon, UserIcon, LogOutIcon, MenuIcon } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Button from './ui/Button';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="mx-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <NavLink to="/timeline" className="flex items-center space-x-2">
            <ClockIcon className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">EaseLake</h1>
          </NavLink>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <MenuIcon className="h-6 w-6" />
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-6">

            {/* User Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2"
              >
                <UserIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">
                  {user?.email.split('@')[0]}
                </span>
              </Button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                  <NavLink
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOutIcon className="h-4 w-4 inline mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-200">
            <nav className="flex flex-col p-4 space-y-2">

              <NavLink
                to="/profile"
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </NavLink>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
              >
                <LogOutIcon className="h-4 w-4 inline mr-2" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;