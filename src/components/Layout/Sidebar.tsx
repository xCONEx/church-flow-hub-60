
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  Music, 
  Mail, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'leader', 'collaborator', 'member'] },
  { name: 'Escalas', href: '/scales', icon: Calendar, roles: ['admin', 'leader', 'collaborator', 'member'] },
  { name: 'Membros', href: '/members', icon: Users, roles: ['admin', 'leader'] },
  { name: 'Repertório', href: '/repertoire', icon: Music, roles: ['admin', 'leader', 'collaborator', 'member'] },
  { name: 'Convites', href: '/invites', icon: Mail, roles: ['admin', 'leader'] },
  { name: 'Config. Igreja', href: '/church-settings', icon: Building, roles: ['admin'] },
  { name: 'Perfil', href: '/profile', icon: User, roles: ['admin', 'leader', 'collaborator', 'member'] },
  { name: 'Configurações', href: '/settings', icon: Settings, roles: ['admin', 'leader', 'collaborator', 'member'] },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, church, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const filteredNavigation = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Church Manager
              </h1>
              {church && (
                <p className="text-sm text-gray-600 truncate">{church.name}</p>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="hover:bg-gray-100"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed && user && (
          <div className="mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600",
            collapsed && "justify-center"
          )}
        >
          <LogOut className={cn("h-4 w-4", collapsed ? "mx-auto" : "mr-2")} />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </div>
  );
};
