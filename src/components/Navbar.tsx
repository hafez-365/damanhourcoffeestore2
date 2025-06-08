import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Package, Heart, LogOut } from 'lucide-react';
import { Coffee } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Coffee className="h-8 w-8 text-amber-600" />
            <span className="text-xl font-bold text-amber-900 mr-2">قهوة دمنهور</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <Link to="/" className="text-gray-700 hover:text-amber-600">
              الرئيسية
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-amber-600">
              عن المتجر
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-amber-600">
              اتصل بنا
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="ml-2 h-4 w-4" />
                      الملف الشخصي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center">
                      <Package className="ml-2 h-4 w-4" />
                      طلباتي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="flex items-center">
                      <Heart className="ml-2 h-4 w-4" />
                      المفضلة
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default">تسجيل الدخول</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;