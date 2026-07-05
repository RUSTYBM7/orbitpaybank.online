import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CreditCard, DollarSign, Settings,
  Shield, LogOut, ChevronLeft, Bell, Search, Menu, X,
  BarChart3, FileText, AlertTriangle
} from 'lucide-react';
import { BrandLogo } from '@/components/branding/BrandLogo';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

// Mock pages
const AdminUsers = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-white mb-6">Member Management</h1>
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
      <p className="text-slate-400">User management module - View, edit, and manage member accounts.</p>
    </div>
  </div>
);

const AdminTransactions = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-white mb-6">Transaction Management</h1>
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
      <p className="text-slate-400">Transaction monitoring and management module.</p>
    </div>
  </div>
);

const AdminCards = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-white mb-6">Card Management</h1>
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
      <p className="text-slate-400">Credit and debit card management module.</p>
    </div>
  </div>
);

const AdminReports = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-white mb-6">Reports & Analytics</h1>
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
      <p className="text-slate-400">Financial reports and analytics dashboard.</p>
    </div>
  </div>
);

const AdminSettings = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-white mb-6">System Settings</h1>
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
      <p className="text-slate-400">System configuration and settings.</p>
    </div>
  </div>
);

const AdminLoans = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-white mb-6">Loan Management</h1>
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
      <p className="text-slate-400">Loan applications and portfolio management.</p>
    </div>
  </div>
);

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Members', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: DollarSign },
  { id: 'cards', label: 'Cards', icon: CreditCard },
  { id: 'loans', label: 'Loans', icon: FileText },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check session
  useEffect(() => {
    const session = sessionStorage.getItem('admin_session');
    if (session) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem('admin_session', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session');
    setIsAuthenticated(false);
    setActivePage('dashboard');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <AdminDashboard />;
      case 'users': return <AdminUsers />;
      case 'transactions': return <AdminTransactions />;
      case 'cards': return <AdminCards />;
      case 'loans': return <AdminLoans />;
      case 'reports': return <AdminReports />;
      case 'settings': return <AdminSettings />;
      default: return <AdminDashboard />;
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar - Desktop */}
      <aside className={`
        hidden lg:flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800
        transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <div>
                <p className="text-white font-bold">OrbitPay</p>
                <p className="text-xs text-emerald-400">Admin Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${activePage === item.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${!isSidebarOpen && 'rotate-180'}`} />
            {isSidebarOpen && <span className="text-sm">Collapse</span>}
          </button>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <p className="text-white font-bold">Admin</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-white">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/80 pt-16"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-72 h-full bg-slate-900 border-r border-slate-800 pt-6"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="px-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                      ${activePage === item.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:overflow-y-auto pt-16 lg:pt-0">
        {/* Top Bar */}
        <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search members, transactions..."
                className="w-80 pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <span className="text-white font-medium">AD</span>
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-medium">Admin User</p>
                <p className="text-slate-400 text-xs">Super Admin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.div>
      </main>
    </div>
  );
}
