import { type FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ExtendedUser } from '@/hooks/useAuth';
import { ShoppingCart, Settings, LogOut, User as UserIcon, MapPin, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  user: ExtendedUser | null;
  onClose: () => void;
}

export const MobileMenu: FC<MobileMenuProps> = ({ user, onClose }) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const scrollToSection = (sectionId: string) => {
    onClose();
    if (!isHomePage) {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const menuItems = [
    { label: 'الرئيسية', href: '/', isLink: true },
    { label: 'المنتجات', sectionId: 'products', isLink: false },
    { label: 'عن المتجر', sectionId: 'about', isLink: false },
    { label: 'تواصل معنا', sectionId: 'contact', isLink: false },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ label: 'لوحة التحكم', href: '/admin', isLink: true });
  }

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="lg:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-4">
          {user ? (
            <div className="mb-6 pb-4 border-b">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user.full_name || user.email}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 pb-4 border-b">
              <Link
                to="/auth"
                onClick={onClose}
                className="block w-full py-2 px-4 text-center bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
              >
                تسجيل الدخول
              </Link>
            </div>
          )}

          <nav className="space-y-1">
            {menuItems.map((item) => (
              item.isLink ? (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "block py-2 px-4 rounded-md text-gray-600 hover:text-amber-600 hover:bg-amber-50",
                    "transition-colors"
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.sectionId}
                  onClick={() => scrollToSection(item.sectionId)}
                  className={cn(
                    "block w-full text-right py-2 px-4 rounded-md text-gray-600 hover:text-amber-600 hover:bg-amber-50",
                    "transition-colors"
                  )}
                >
                  {item.label}
                </button>
              )
            ))}
          </nav>

          {user && (
            <div className="mt-6 pt-4 border-t space-y-1">
              <Link
                to="/cart"
                onClick={onClose}
                className="flex items-center py-2 px-4 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-md"
              >
                <ShoppingCart className="h-5 w-5 ml-3" />
                السلة
              </Link>

              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center py-2 px-4 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-md"
              >
                <MapPin className="h-5 w-5 ml-3" />
                عناوين الشحن
              </Link>

              <Link
                to="/orders"
                onClick={onClose}
                className="flex items-center py-2 px-4 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-md"
              >
                <ShoppingBag className="h-5 w-5 ml-3" />
                طلباتي
              </Link>
              
              <Link
                to="/settings"
                onClick={onClose}
                className="flex items-center py-2 px-4 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-md"
              >
                <Settings className="h-5 w-5 ml-3" />
                الإعدادات
              </Link>
              
              <button
                onClick={handleSignOut}
                className="flex items-center w-full py-2 px-4 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-md"
              >
                <LogOut className="h-5 w-5 ml-3" />
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 