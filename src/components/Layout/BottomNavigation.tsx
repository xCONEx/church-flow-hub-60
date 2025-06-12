
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Music, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';

const bottomNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Escalas', href: '/scales', icon: Calendar },
  { name: 'Repertório', href: '/repertoire', icon: Music },
  { name: 'Perfil', href: '/profile', icon: User },
];

export const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {bottomNavItems.map((item, index) => {
          const isActive = location.pathname === item.href;
          
          // Show menu button instead of last item
          if (index === bottomNavItems.length - 1) {
            return (
              <Sheet key="menu">
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 px-2 py-1">
                    <Menu className="h-5 w-5 text-gray-600" />
                    <span className="text-xs text-gray-600">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <Sidebar />
                </SheetContent>
              </Sheet>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-colors",
                isActive
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
