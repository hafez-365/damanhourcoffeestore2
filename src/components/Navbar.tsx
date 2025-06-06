import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Coffee, ShoppingCart, Package, Settings, 
  MessageSquare, User, LogOut, Shield, 
  Menu, X, Home, ShoppingBag, Star, HelpCircle
} from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith('/admin');
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // إغلاق القوائم المنبثقة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // إغلاق القوائم عند تغيير المسار
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // إغلاق القائمة عند الضغط على Escape
  useEffect(() => {
    const closeOnEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    
    document.body.addEventListener("keydown", closeOnEscapeKey);
    return () => document.body.removeEventListener("keydown", closeOnEscapeKey);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  
  const handleSignOut = () => {
    signOut();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const navItems = [
    { path: '/', label: 'الرئيسية', icon: Home, adminOnly: false },
    { path: '/cart', label: 'السلة', icon: ShoppingCart, adminOnly: false },
    { path: '/orders', label: 'طلباتي', icon: ShoppingBag, adminOnly: false },
    { path: '/settings', label: 'الإعدادات', icon: Settings, adminOnly: false },
    { path: '/feedback', label: 'التقييم', icon: Star, adminOnly: false },
    { path: '/admin', label: 'الإدارة', icon: Shield, adminOnly: true },
  ];

  const visibleNavItems = navItems.filter(item => {
    if (item.adminOnly) return user?.role === 'admin';
    return true;
  });

  const userMenuItems = [
    { label: 'ملفي الشخصي', path: '/settings', icon: User },
    { label: 'طلباتي', path: '/orders', icon: Package },
    { label: 'تقييم التطبيق', path: '/feedback', icon: Star },
    { label: 'المساعدة', path: '/help', icon: HelpCircle },
    { label: 'تسجيل الخروج', action: handleSignOut, icon: LogOut },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* زر القائمة للجوال - أقصى اليمين */}
          <button
            onClick={toggleMobileMenu}
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-amber-700 hover:text-amber-900 hover:bg-amber-50 focus:outline-none"
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="sr-only">افتح القائمة الرئيسية</span>
            {isMobileMenuOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>

          {/* الشعار - في الوسط */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 rtl:space-x-reverse hover:opacity-90 transition-opacity mx-auto md:mx-0"
            aria-label="الرئيسية"
          >
            <Coffee className="h-8 w-8 text-amber-600" />
            <span className="text-xl font-bold text-amber-900">قهوة دمنهور</span>
          </Link>

          {/* قسم المستخدم - أقصى اليسار */}
          <div className="flex items-center">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 rtl:space-x-reverse focus:outline-none"
                  aria-label="قائمة المستخدم"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center">
                    {user.full_name ? (
                      <span className="font-medium text-amber-800">
                        {user.full_name.charAt(0)}
                      </span>
                    ) : (
                      <User size={20} className="text-amber-600" />
                    )}
                  </div>
                </button>

                {/* قائمة المستخدم المنبثقة - معدلة لتكون داخل الشاشة */}
                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 max-w-[calc(100vw-2rem)]">
                    <div className="py-2 px-4 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.full_name || 'مستخدم'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email || 'بريد إلكتروني'}
                      </p>
                    </div>
                    
                    <div className="py-1">
                      {userMenuItems.map((item, index) => (
                        <React.Fragment key={item.label}>
                          {item.path ? (
                            <Link
                              to={item.path}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800 group"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <item.icon 
                                size={18} 
                                className="mr-2 text-gray-500 group-hover:text-amber-600" 
                              />
                              {item.label}
                            </Link>
                          ) : (
                            <button
                              onClick={item.action}
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800 group"
                            >
                              <item.icon 
                                size={18} 
                                className="mr-2 text-gray-500 group-hover:text-amber-600" 
                              />
                              {item.label}
                            </button>
                          )}
                          
                          {index === userMenuItems.length - 2 && (
                            <div className="border-t border-gray-100 my-1"></div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium flex items-center"
              >
                <User size={16} className="ml-1" />
                <span>تسجيل الدخول</span>
              </Link>
            )}
          </div>

          {/* روابط التنقل لسطح المكتب */}
          <div className="hidden md:flex items-center space-x-1 rtl:space-x-reverse absolute left-1/2 transform -translate-x-1/2">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                              (item.path === '/admin' && isAdminRoute);
                              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'text-amber-800 font-medium'
                      : 'text-gray-600 hover:text-amber-700'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon 
                    size={22} 
                    className={`transition-colors duration-200 ${
                      isActive 
                        ? 'text-amber-700' 
                        : 'text-gray-500 group-hover:text-amber-600'
                    }`} 
                  />
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* قائمة الجوال */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          className={`absolute top-0 right-0 bottom-0 w-4/5 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link 
              to="/" 
              className="flex items-center space-x-2 rtl:space-x-reverse"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Coffee className="h-8 w-8 text-amber-600" />
              <span className="text-xl font-bold text-amber-900">قهوة دمنهور</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="overflow-y-auto h-[calc(100vh-4rem)] pb-20">
            <div className="py-4">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                                (item.path === '/admin' && isAdminRoute);
                                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-6 py-3 text-lg ${
                      isActive
                        ? 'bg-amber-50 text-amber-800 font-medium border-r-4 border-amber-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon 
                      size={22} 
                      className={`mr-4 ${isActive ? 'text-amber-600' : 'text-gray-500'}`} 
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            
            <div className="mt-8 border-t border-gray-200 pt-4 px-6">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">الحساب</h3>
              
              {user ? (
                <>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mr-3">
                      {user.full_name ? (
                        <span className="font-medium text-amber-800 text-lg">
                          {user.full_name.charAt(0)}
                        </span>
                      ) : (
                        <User size={24} className="text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.full_name || 'مستخدم'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.email || 'بريد إلكتروني'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {userMenuItems.map((item) => (
                      item.path ? (
                        <Link
                          key={item.label}
                          to={item.path}
                          className="block py-3 px-4 rounded-lg hover:bg-gray-50 text-gray-700"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <item.icon size={18} className="ml-2 text-gray-500" />
                            {item.label}
                          </div>
                        </Link>
                      ) : (
                        <button
                          key={item.label}
                          onClick={item.action}
                          className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 text-gray-700"
                        >
                          <div className="flex items-center">
                            <item.icon size={18} className="ml-2 text-gray-500" />
                            {item.label}
                          </div>
                        </button>
                      )
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="bg-amber-600 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={18} className="ml-2" />
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;