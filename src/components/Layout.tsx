import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  Activity,
  CreditCard,
  MessageSquare,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/${user?.role}-dashboard`, roles: ['admin', 'trainer', 'member'] },
    { icon: Users, label: 'Members', path: '/members', roles: ['admin', 'trainer'] },
    { icon: Dumbbell, label: 'Equipment', path: '/equipment', roles: ['admin', 'member'] },
    { icon: Calendar, label: 'Schedule', path: '/schedule', roles: ['admin', 'trainer', 'member'] },
    { icon: Activity, label: 'Progress', path: '/progress', roles: ['member', 'trainer'] },
    { icon: CreditCard, label: 'Payments', path: '/payments', roles: ['admin', 'member'] },
    { icon: MessageSquare, label: 'Feedback', path: '/feedback', roles: ['admin', 'member'] },
    { icon: ClipboardList, label: 'Attendance', path: '/attendance', roles: ['admin', 'trainer'] },
  ].filter(item => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed lg:static z-50 w-72 h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Dumbbell className="text-zinc-950 w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight">Iron Haven</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-zinc-400 hover:text-zinc-100">
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    location.pathname === item.path
                      ? 'bg-orange-500 text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-zinc-800">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 mb-4">
                <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden border border-zinc-600">
                  <UserIcon className="text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-zinc-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="text-zinc-400 hover:text-zinc-100">
                <Menu size={24} />
              </button>
            )}
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-zinc-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
              <Activity size={16} className="text-orange-500" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
