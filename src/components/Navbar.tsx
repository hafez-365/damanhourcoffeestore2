
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Coffee, ShoppingCart, Package, Settings, MessageSquare, User, LogOut, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'الرئيسية', icon: Coffee },
    { path: '/cart', label: 'السلة', icon: ShoppingCart },
    { path: '/orders', label: 'طلباتي', icon: Package },
    { path: '/settings', label: 'الإعدادات', icon: Settings },
    { path: '/feedback', label: 'التقييم', icon: MessageSquare },
    { path: '/admin', label: 'الإدارة', icon: Shield },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <Coffee className="h-8 w-8 text-amber-600" />
            <span className="text-xl font-bold text-amber-900">قهوة دمنهور</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            {user ? (
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <User size={20} className="text-amber-600" />
                  <span className="text-amber-800">مرحباً</span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 space-x-reverse text-red-600 hover:text-red-800"
                >
                  <LogOut size={20} />
                  <span>تسجيل خروج</span>
                </button>
              </div>
            ) : (
              <Link
                to="/"
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
              >
                تسجيل دخول
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-4">
          <div className="grid grid-cols-3 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
