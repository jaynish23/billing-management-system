import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Globe,
  Sun,
  Moon,
  ChevronDown,
  User,
  Layers,
  FileText,
  Building2,
  MapPin,
  Map,
  Store,
  Compass
} from 'lucide-react';

function DashboardLayout() {
  const { i18n, t } = useTranslation();
  const { showSuccess } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  
  const getInitials = (firstName, lastName) => {
    const f = firstName?.charAt(0) || '';
    const l = lastName?.charAt(0) || '';
    return (f + l).toUpperCase() || 'U';
  };
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMastersDropdownOpen, setIsMastersDropdownOpen] = useState(true);
  const [isLedgersDropdownOpen, setIsLedgersDropdownOpen] = useState(true);

  // Global Theme Engine State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('user');
    
    if (!token || !userDataStr) {
      navigate('/login');
      return;
    }

    try {
      setUser(JSON.parse(userDataStr));
    } catch (e) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showSuccess('Logged Out Successfully', 'See you again soon.');
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return t('dashboard') || 'Dashboard';
    if (path === '/profile') return t('profile.title') || 'My Profile';
    if (path === '/bill-configuration') return t('billConfiguration.title') || 'Bill Configuration';
    if (path === '/dukan') return t('dukan.title') || 'Dukan Master';
    if (path === '/marko') return t('marko.title') || 'Marko Master';
    if (path === '/district') return t('district.title') || 'District Master';
    if (path === '/state') return t('state.title') || 'State Master';
    if (path === '/mill') return t('mill.title') || 'Mill Master';
    if (path === '/mill-list') return t('millList') || 'Mill Ledger Selection';
    if (path.startsWith('/mill-ledger/')) return 'Mill Ledger Details';
    if (path === '/dukan-list') return t('dukanList') || 'Dukan Ledger Selection';
    if (path.startsWith('/dukan-ledger/')) return 'Dukan Ledger Details';
    return 'Broker Management';
  };

  const isLinkActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const masterMenuOpen = isMastersDropdownOpen && !isSidebarCollapsed;
  const ledgersMenuOpen = isLedgersDropdownOpen && !isSidebarCollapsed;

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-base text-text-muted">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-semibold">Loading App Session...</span>
        </div>
      </div>
    );
  }

  // Sidebar Links config
  const masterLinks = [
    { name: t('dukan.title') || 'Dukan Master', path: '/dukan', icon: Store },
    { name: t('marko.title') || 'Marko Master', path: '/marko', icon: Compass },
    { name: t('district.title') || 'District Master', path: '/district', icon: MapPin },
    { name: t('state.title') || 'State Master', path: '/state', icon: Map },
    { name: t('mill.title') || 'Mill Master', path: '/mill', icon: Building2 },
    { name: t('billConfiguration.title') || 'Bill Configuration', path: '/bill-configuration', icon: FileText },
  ];

  const ledgerLinks = [
    { name: t('millList') || 'Mill Ledger Selection', path: '/mill-list', icon: FileSpreadsheet },
    { name: t('dukanList') || 'Dukan Ledger Selection', path: '/dukan-list', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col font-sans transition-colors duration-300">
      
      {/* Top sticky header for desktop & mobile */}
      <header className="sticky top-0 z-40 h-[70px] bg-bg-lighter/80 backdrop-blur-md border-b border-border-base flex items-center justify-between px-4 lg:px-6 shadow-sm">
        
        {/* Left header group */}
        <div className="flex items-center gap-3">
          {/* Hamburger trigger for mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-darker transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo / Header Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-blue-500/20">
              S
            </div>
            <span className="font-semibold text-lg hidden sm:block bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
              Broker System
            </span>
          </div>

          <div className="h-4 w-px bg-border-base hidden md:block mx-2" />

          {/* Active title path */}
          <h1 className="text-sm font-medium text-text-muted hidden md:block">
            {getPageTitle()}
          </h1>
        </div>

        {/* Search Bar - hidden on small mobile */}
        <div className="hidden sm:flex items-center max-w-md w-full mx-4 relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search here..." 
            className="w-full bg-bg-base/60 border border-border-base rounded-xl py-2 pl-9 pr-4 text-sm text-text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-text-muted"
          />
          <kbd className="hidden md:inline-flex items-center gap-0.5 text-xs text-text-muted bg-bg-darker border border-border-base px-1.5 py-0.5 rounded absolute right-3 pointer-events-none font-mono font-medium shadow-sm">
            ⌘K
          </kbd>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Notification bell */}
          <button className="p-2 text-text-muted hover:text-text-primary rounded-xl hover:bg-bg-darker transition-colors relative group">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center border border-bg-base group-hover:scale-110 transition-transform">
              3
            </span>
          </button>

          {/* Global Theme Toggle Button */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-text-muted hover:text-text-primary rounded-xl hover:bg-bg-darker transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Language selector */}
          <div className="relative flex items-center bg-bg-base/50 border border-border-base rounded-xl p-1 shadow-sm">
            <Globe className="w-4 h-4 text-text-muted ml-2 pointer-events-none" />
            <select 
              id="language-select-header"
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="bg-transparent text-xs font-semibold text-text-secondary rounded-lg hover:bg-bg-darker focus:outline-none appearance-none cursor-pointer pl-2 pr-6 py-1.5 border-none outline-none"
            >
              <option value="en">English</option>
              <option value="gu">ગુજરાતી</option>
              <option value="hi">हिन्दी</option>
            </select>
            <ChevronDown className="w-3 h-3 text-text-muted pointer-events-none absolute right-2" />
          </div>

          {/* Vertical divider */}
          <div className="h-6 w-px bg-border-base hidden sm:block" />

          {/* User Profile dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-bg-darker rounded-xl transition-all border border-transparent hover:border-border-base/50"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                {user.userImagePath ? (
                  <img 
                    src={`${import.meta.env.VITE_API_BASE_URL}/profile/image/${user.userImagePath.split('/').pop()}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                    }}
                  />
                ) : (
                  getInitials(user.firstName, user.lastName)
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-text-primary leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] text-text-muted font-medium">
                  {user.role}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-text-muted hidden sm:block" />
            </button>

            {/* Profile Dropdown menu */}
            <AnimatePresence>
              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-bg-lighter border border-border-base p-2 shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-border-base/60 mb-1">
                      <p className="text-xs font-medium text-text-muted">Signed in as</p>
                      <p className="text-sm font-semibold text-text-primary truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-primary font-medium truncate">{user.role}</p>
                    </div>

                    <button 
                      onClick={() => { setIsProfileDropdownOpen(false); navigate('/profile'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-darker rounded-xl transition-all text-left cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      User Profile
                    </button>
                    
                    <button 
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-darker rounded-xl transition-all text-left cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>

                    <div className="h-px bg-border-base my-1" />

                    <button 
                      onClick={() => { setIsProfileDropdownOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Layout Body wrapper */}
      <div className="flex-1 flex relative">
        
        {/* Left Sidebar (Desktop Only) */}
        <aside 
          className={`hidden lg:flex flex-col border-r border-border-base bg-bg-lighter/50 backdrop-blur-lg transition-all duration-300 shrink-0 sticky top-[70px] h-[calc(100vh-70px)] z-30 ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Scrollable links body */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            
            {/* General Navigation Group */}
            <div>
              <p className={`text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 ${isSidebarCollapsed ? 'text-center' : 'px-3'}`}>
                {isSidebarCollapsed ? 'G' : 'General'}
              </p>
              <div className="space-y-1">
                <Link 
                  to="/dashboard"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                    isLinkActive('/dashboard') 
                      ? 'bg-primary/10 text-primary border border-primary/20 font-bold sidebar-active-indicator' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-darker border border-transparent'
                  }`}
                  title="Dashboard"
                >
                  <LayoutDashboard className={`w-5 h-5 shrink-0 ${isLinkActive('/dashboard') ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'}`} />
                  {!isSidebarCollapsed && <span>Dashboard</span>}
                </Link>
                <Link 
                  to="/profile"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                    isLinkActive('/profile') 
                      ? 'bg-primary/10 text-primary border border-primary/20 font-bold sidebar-active-indicator' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-darker border border-transparent'
                  }`}
                  title="User Profile"
                >
                  <User className={`w-5 h-5 shrink-0 ${isLinkActive('/profile') ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'}`} />
                  {!isSidebarCollapsed && <span>User Profile</span>}
                </Link>

              </div>
            </div>

            {/* System Master Group */}
            <div>
              <div 
                onClick={() => !isSidebarCollapsed && setIsMastersDropdownOpen(!isMastersDropdownOpen)}
                className={`flex items-center justify-between px-3 py-1 cursor-pointer mb-2 text-text-muted hover:text-text-secondary ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  {isSidebarCollapsed ? 'M' : 'System Master'}
                </p>
                {!isSidebarCollapsed && (
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMastersDropdownOpen ? '' : '-rotate-90'}`} />
                )}
              </div>
              
              <AnimatePresence initial={false}>
                {(masterMenuOpen || isSidebarCollapsed) && (
                  <motion.div 
                    initial={isSidebarCollapsed ? {} : { opacity: 0, height: 0 }}
                    animate={isSidebarCollapsed ? {} : { opacity: 1, height: 'auto' }}
                    exit={isSidebarCollapsed ? {} : { opacity: 0, height: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {masterLinks.map((link) => {
                      const Icon = link.icon;
                      const active = isLinkActive(link.path);
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                            active
                              ? 'bg-primary/10 text-primary border border-primary/20 font-bold sidebar-active-indicator'
                              : 'text-text-secondary hover:text-text-primary hover:bg-bg-darker border border-transparent'
                          }`}
                          title={link.name}
                        >
                          <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'}`} />
                          {!isSidebarCollapsed && <span className="truncate">{link.name}</span>}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Ledgers Group */}
            <div>
              <div 
                onClick={() => !isSidebarCollapsed && setIsLedgersDropdownOpen(!isLedgersDropdownOpen)}
                className={`flex items-center justify-between px-3 py-1 cursor-pointer mb-2 text-text-muted hover:text-text-secondary ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  {isSidebarCollapsed ? 'L' : 'Ledgers & Transactions'}
                </p>
                {!isSidebarCollapsed && (
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLedgersDropdownOpen ? '' : '-rotate-90'}`} />
                )}
              </div>

              <AnimatePresence initial={false}>
                {(ledgersMenuOpen || isSidebarCollapsed) && (
                  <motion.div
                    initial={isSidebarCollapsed ? {} : { opacity: 0, height: 0 }}
                    animate={isSidebarCollapsed ? {} : { opacity: 1, height: 'auto' }}
                    exit={isSidebarCollapsed ? {} : { opacity: 0, height: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {ledgerLinks.map((link) => {
                      const Icon = link.icon;
                      const active = isLinkActive(link.path);
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                            active
                              ? 'bg-primary/10 text-primary border border-primary/20 font-bold sidebar-active-indicator'
                              : 'text-text-secondary hover:text-text-primary hover:bg-bg-darker border border-transparent'
                          }`}
                          title={link.name}
                        >
                          <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'}`} />
                          {!isSidebarCollapsed && <span className="truncate">{link.name}</span>}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Collapse toggle at bottom of sidebar */}
          <div className="p-4 border-t border-border-base flex items-center justify-between gap-2">
            {!isSidebarCollapsed && (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all text-xs font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-darker border border-border-base rounded-xl transition-all mx-auto lg:mx-0 cursor-pointer"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* Mobile Off-Canvas Drawer (Slide in) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 z-50 bg-black lg:hidden"
              />
              
              {/* Drawer Container */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-bg-base border-r border-border-base flex flex-col p-5 shadow-2xl lg:hidden"
              >
                {/* Header of Drawer */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">S</div>
                    <span className="font-bold text-lg text-text-primary">Broker System</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-darker transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Links */}
                <div className="flex-1 overflow-y-auto space-y-6">
                  
                  {/* General */}
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 px-2">General</p>
                    <div className="space-y-1">
                      <Link 
                        to="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isLinkActive('/dashboard') ? 'bg-primary/10 text-primary border border-primary/20 font-bold' : 'text-text-secondary hover:text-text-primary hover:bg-bg-darker'
                        }`}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                      </Link>
                      <Link 
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isLinkActive('/profile') ? 'bg-primary/10 text-primary border border-primary/20 font-bold' : 'text-text-secondary hover:text-text-primary hover:bg-bg-darker'
                        }`}
                      >
                        <User className="w-5 h-5" />
                        User Profile
                      </Link>

                    </div>
                  </div>

                  {/* System Master */}
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 px-2">System Master</p>
                    <div className="space-y-1">
                      {masterLinks.map((link) => {
                        const Icon = link.icon;
                        const active = isLinkActive(link.path);
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                              active ? 'bg-primary/10 text-primary border border-primary/20 font-bold' : 'text-text-secondary hover:text-text-primary hover:bg-bg-darker'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            {link.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ledgers */}
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 px-2">Ledgers & Transactions</p>
                    <div className="space-y-1">
                      {ledgerLinks.map((link) => {
                        const Icon = link.icon;
                        const active = isLinkActive(link.path);
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                              active ? 'bg-primary/10 text-primary border border-primary/20 font-bold' : 'text-text-secondary hover:text-text-primary hover:bg-bg-darker'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            {link.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Footer of Drawer */}
                <div className="mt-auto pt-4 border-t border-border-base flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-2 py-1 mb-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                      {user.userImagePath ? (
                        <img 
                          src={`${import.meta.env.VITE_API_BASE_URL}/profile/image/${user.userImagePath.split('/').pop()}`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '';
                          }}
                        />
                      ) : (
                        getInitials(user.firstName, user.lastName)
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">{user.firstName} {user.lastName}</p>
                      <p className="text-[10px] text-text-muted font-medium">{user.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-left cursor-pointer"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                    Logout
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Content container - flex center by default, scrollable */}
        <main className="flex-1 min-w-0 bg-bg-base overflow-y-auto px-4 py-6 md:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
            <Outlet context={{ user, setUser }} />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (sticky, below tablet width <1024px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-lighter/90 backdrop-blur-md border-t border-border-base grid grid-cols-4 items-center justify-center z-40 px-2 shadow-2xl">
        <Link 
          to="/dashboard"
          className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl text-[10px] font-semibold transition-all ${
            isLinkActive('/dashboard') ? 'text-primary font-bold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>

        {/* Quick Masters selection tab link */}
        <Link 
          to="/district"
          className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl text-[10px] font-semibold transition-all ${
            location.pathname === '/district' || location.pathname === '/state' || location.pathname === '/dukan' || location.pathname === '/mill' || location.pathname === '/marko'
              ? 'text-primary font-bold' 
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Layers className="w-5 h-5" />
          Masters
        </Link>

        {/* Quick Ledgers selection tab link */}
        <Link 
          to="/mill-list"
          className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl text-[10px] font-semibold transition-all ${
            location.pathname === '/mill-list' || location.pathname === '/dukan-list'
              ? 'text-primary font-bold' 
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          Ledgers
        </Link>

        {/* Quick Profile display dropdown/modal switch */}
        <Link 
          to="/profile"
          className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl text-[10px] font-semibold transition-all ${
            isLinkActive('/profile') ? 'text-primary font-bold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <User className="w-5 h-5" />
          Profile
        </Link>
      </nav>

    </div>
  );
}

export default DashboardLayout;
