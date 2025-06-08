import React from 'react';
import { MobileMenu } from './MobileMenu';
import { DesktopMenu } from './DesktopMenu';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Coffee, Menu, X, User, Package, Heart, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export const NavbarRoot: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSignOut = () => {
    signOut();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <Coffee className="h-8 w-8 text-amber-600" />
              <span className="text-xl font-bold text-amber-900">قهوة دمنهور</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <DesktopMenu user={user} />

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-amber-600"
              aria-label="فتح القائمة"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* User Menu */}
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
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <UserMenu user={user} onSignOut={signOut} />
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && <MobileMenu user={user} onClose={() => setIsMobileMenuOpen(false)} />}
    </nav>
  );
}; 