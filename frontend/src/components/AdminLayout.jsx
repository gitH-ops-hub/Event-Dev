import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/App';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  QrCode, 
  UserPlus, 
  Palette,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const AdminLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/events', icon: Calendar, label: 'Events' },
    { path: '/admin/registrations', icon: Users, label: 'Registrations' },
    { path: '/admin/scanner', icon: QrCode, label: 'Scanner' },
    { path: '/admin/walk-in', icon: UserPlus, label: 'Walk-in' },
    { path: '/admin/branding', icon: Palette, label: 'Branding' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top Navigation */}
      <nav className="nav-sticky h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/admin" className="text-xl font-black tracking-tighter text-zinc-900">
            EventManager
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-[#0055FF] bg-blue-50'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-zinc-500">
            {user?.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-zinc-600 hover:text-zinc-900"
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 px-4 py-2 animate-slideUp">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 text-sm font-medium ${
                isActive(item.path)
                  ? 'text-[#0055FF] bg-blue-50'
                  : 'text-zinc-600'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="p-6 md:p-8 lg:p-12">
        {title && (
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-8">
            {title}
          </h1>
        )}
        <div className="animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
