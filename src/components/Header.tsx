import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ✅ Scroll direction detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShowHeader(false); // scrolling down
      } else {
        setShowHeader(true); // scrolling up
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isProvider = user?.role === 'provider';
  const isCustomer = user?.role === 'customer';

  return (
    <header
      className={`bg-white shadow-sm border-b sticky top-0 z-50 transform transition-transform duration-300 ${
        showHeader ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-30 h-10 flex items-center justify-center">
              <img src="/logo.svg" alt="ServiceConnect Logo" className="h-full w-auto" />
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-c transition-colors">Hjem</Link>
            <Link to="/services" className="text-gray-700 hover:text-[#ff00c8] transition-colors">Tjenester</Link>
            <Link to="/faq" className="text-gray-700 hover:text-[#ff00c8] transition-colors">FAQ</Link>

            {isProvider && (
              <Link to="/dashboard" className="text-gray-700 hover:text-[#ff00c8] flex items-center transition-colors">
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Provider Dashboard
              </Link>
            )}
            {isCustomer && (
              <Link to="/customerDashboard" className="text-gray-700 hover:text-[#ff00c8] flex items-center transition-colors">
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Customer Dashboard
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full capitalize">
                    {user.role}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link to="/signup">
                  <Button className="bg-[#ff00c8] hover:bg-pink-600 text-white" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-3 shadow-md">
          <nav className="flex flex-col space-y-2 text-sm">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 py-2 px-2 rounded hover:bg-gray-100">Hjem</Link>
            <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 py-2 px-2 rounded hover:bg-gray-100">Tjenester</Link>
            <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 py-2 px-2 rounded hover:bg-gray-100">FAQ</Link>

            {isProvider && (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 flex items-center py-2 px-2 rounded hover:bg-gray-100">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Provider Dashboard
              </Link>
            )}
            {isCustomer && (
              <Link to="/customerDashboard" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 flex items-center py-2 px-2 rounded hover:bg-gray-100">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Customer Dashboard
              </Link>
            )}
          </nav>

          <div className="border-t pt-4 space-y-2">
            {user ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-700 py-2 px-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full justify-start py-2 px-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-left justify-start py-2 px-2">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="bg-[#ff00c8] hover:bg-pink-600 text-white w-full py-2">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
