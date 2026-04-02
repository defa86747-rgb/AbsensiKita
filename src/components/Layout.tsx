import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  FileText, 
  GraduationCap, 
  LogOut, 
  Menu,
  X,
  ChevronRight,
  Bell
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/', 
      roles: ['admin', 'guru'] 
    },
    { 
      label: 'Absensi Guru', 
      icon: UserCheck, 
      path: '/absensi-guru', 
      roles: ['admin', 'guru'] 
    },
    { 
      label: 'Absensi Siswa', 
      icon: Users, 
      path: '/absensi-siswa', 
      roles: ['admin', 'guru'] 
    },
    { 
      label: 'Rekap Absensi', 
      icon: FileText, 
      path: '/rekap', 
      roles: ['admin', 'guru'] 
    },
    { 
      label: 'Data Siswa', 
      icon: GraduationCap, 
      path: '/siswa', 
      roles: ['admin'] 
    },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(profile?.role || ''));

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen z-30">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
                Absensi<span className="text-indigo-600">Kita</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  {profile?.role === 'admin' ? 'Administrator' : 'Guru Panel'}
                </p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-1"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
                  {item.label}
                </div>
                {isActive && (
                  <motion.div layoutId="active-pill">
                    <ChevronRight className="w-4 h-4 text-white/70" />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 font-bold border border-slate-100">
                  {profile?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{profile?.full_name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{profile?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-red-600 bg-white border border-red-50 hover:bg-red-50 hover:border-red-100 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-slate-200 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <UserCheck className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight font-display">AbsensiKita</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-900">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-80 bg-white z-[60] md:hidden flex flex-col"
            >
              <div className="p-8 flex items-center justify-between">
                <h1 className="text-xl font-extrabold text-slate-900 font-display">AbsensiKita</h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 px-6 space-y-2">
                {filteredMenu.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all",
                      location.pathname === item.path
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                        : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="p-8 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <div className="p-6 md:p-10 pt-24 md:pt-10 max-w-7xl mx-auto w-full">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
