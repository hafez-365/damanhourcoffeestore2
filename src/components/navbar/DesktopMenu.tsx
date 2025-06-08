import { type FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ExtendedUser } from '@/hooks/useAuth';

interface DesktopMenuProps {
  user: ExtendedUser | null;
}

export const DesktopMenu: FC<DesktopMenuProps> = ({ user }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const scrollToSection = (sectionId: string) => {
    if (!isHomePage) {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse">
      <Link to="/" className="text-gray-700 hover:text-amber-600">الرئيسية</Link>
      <button 
        onClick={() => scrollToSection('products')} 
        className="text-gray-700 hover:text-amber-600"
      >
        المنتجات
      </button>
      <button 
        onClick={() => scrollToSection('about')} 
        className="text-gray-700 hover:text-amber-600"
      >
        عن المتجر
      </button>
      <button 
        onClick={() => scrollToSection('contact')} 
        className="text-gray-700 hover:text-amber-600"
      >
        اتصل بنا
      </button>
      {user?.role === 'admin' && (
        <Link to="/admin" className="text-gray-700 hover:text-amber-600">لوحة التحكم</Link>
      )}
    </div>
  );
}; 