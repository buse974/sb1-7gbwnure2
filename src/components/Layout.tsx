import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Home,
  Users,
  Map,
  BarChart2,
  CheckSquare,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = React.useMemo(() => {
    const items = [
      { name: 'Tableau de Bord', href: '/', icon: Home },
      { name: 'Tâches et Routines', href: '/tasks', icon: CheckSquare }
    ];

    if (user?.role === 'admin' || user?.canManageTasksAndRoutines) {
      items.push({ name: 'Statistiques', href: '/statistics', icon: BarChart2 });
    }

    if (user?.role === 'admin') {
      items.push(
        { name: 'Utilisateurs', href: '/users', icon: Users },
        { name: 'Zones', href: '/zones', icon: Map }
      );
    }

    return items;
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-700 lg:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <div className="flex-shrink-0 text-white text-xl font-semibold">
                Gestion du Jardin
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-white mr-4">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-white hover:bg-green-700 p-2 rounded-md"
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <div className={`
          ${isMobileMenuOpen ? 'block' : 'hidden'}
          lg:block lg:w-64 bg-white shadow-lg fixed lg:relative
          inset-y-0 left-0 z-50 lg:z-0 transform lg:transform-none
          transition duration-200 ease-in-out
        `}>
          <nav className="mt-5 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-base font-medium rounded-md
                    ${isActive
                      ? 'bg-green-100 text-green-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <item.icon
                    className={`mr-4 h-6 w-6 ${
                      isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 min-w-0 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;