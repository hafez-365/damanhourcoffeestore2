import { type FC } from 'react';
import { useCart } from "@/context/useCart";
import { ExtendedUser } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { ShoppingBag, User as UserIcon, Settings, LogOut, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user: ExtendedUser | null;
  onSignOut: () => void;
}

export const UserMenu: FC<UserMenuProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const { cart } = useCart();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => navigate('/cart')}
      >
        <ShoppingBag className="h-5 w-5" />
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cartItemCount}
          </span>
        )}
      </Button>

      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <UserIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <MapPin className="ml-2 h-4 w-4" />
              <span>عناوين الشحن</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/orders')}>
              <ShoppingBag className="ml-2 h-4 w-4" />
              <span>طلباتي</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="ml-2 h-4 w-4" />
              <span>الإعدادات</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="ml-2 h-4 w-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="ghost" onClick={() => navigate('/auth')}>
          <UserIcon className="h-5 w-5 ml-2" />
          تسجيل الدخول
        </Button>
      )}
    </div>
  );
}; 