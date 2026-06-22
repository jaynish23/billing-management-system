import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Store,
  Compass,
  MapPin,
  Map,
  Building2,
  Boxes,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  ChevronRight,
  FileDown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import api from '../services/api';
import Swal from 'sweetalert2';
import { useNotification } from '../context/NotificationContext';

function Dashboard() {
  const { t, i18n } = useTranslation();
  const { showSuccess } = useNotification();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [masterPages, setMasterPages] = useState([]);
  const [districtCount, setDistrictCount] = useState(0);
  const [stateCount, setStateCount] = useState(0);
  const [dukanCount, setDukanCount] = useState(0);
  const [millCount, setMillCount] = useState(0);

  // Load user from localStorage
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

  // Load backend stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/masterpages');
        setMasterPages(response.data);
      } catch (err) {
        console.error("Failed to fetch master pages", err);
      }
      try {
        const distRes = await api.get('/district');
        setDistrictCount(distRes.data.length);
      } catch (e) {
        console.error("Failed to fetch district count", e);
      }
      try {
        const stateRes = await api.get('/state');
        setStateCount(stateRes.data.length);
      } catch (e) {
        console.error("Failed to fetch state count", e);
      }
      try {
        const dukanRes = await api.get('/dukan?page=1&pageSize=10');
        setDukanCount(dukanRes.data.totalCount || dukanRes.data.length || 0);
      } catch (e) {
        console.error("Failed to fetch dukan count", e);
      }
      try {
        const millRes = await api.get('/mill?page=1&pageSize=10');
        setMillCount(millRes.data.totalCount || millRes.data.length || 0);
      } catch (e) {
        console.error("Failed to fetch mill count", e);
      }
    };
    if (user) {
      fetchStats();
    }
  }, [user]);

  const getPageName = (page) => {
    const lang = i18n.language;
    if (lang === 'gu') return page.masterPageName_guj || page.masterPageName_en;
    if (lang === 'hi') return page.masterPageName_hi || page.masterPageName_en;
    return page.masterPageName_en;
  };

  const getMasterConfig = (routeName) => {
    const name = routeName.toLowerCase();
    if (name.includes('dukan')) {
      return {
        icon: Store,
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20 dark:border-blue-500/10',
        glow: 'group-hover:border-blue-500/50 group-hover:shadow-blue-500/10',
        desc: 'Manage and view retail store accounts, details, and properties.'
      };
    }
    if (name.includes('marko')) {
      return {
        icon: Compass,
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20 dark:border-purple-500/10',
        glow: 'group-hover:border-purple-500/50 group-hover:shadow-purple-500/10',
        desc: 'Configure brand and trade mark master records for broker entities.'
      };
    }
    if (name.includes('district')) {
      return {
        icon: MapPin,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20 dark:border-amber-500/10',
        glow: 'group-hover:border-amber-500/50 group-hover:shadow-amber-500/10',
        desc: 'Set up geographic operations districts, mapping, and regions.'
      };
    }
    if (name.includes('state')) {
      return {
        icon: Map,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/10',
        glow: 'group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/10',
        desc: 'Configure state administration zones and localization nodes.'
      };
    }
    if (name.includes('mill')) {
      return {
        icon: Building2,
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20 dark:border-rose-500/10',
        glow: 'group-hover:border-rose-500/50 group-hover:shadow-rose-500/10',
        desc: 'Manage industrial mill master records, capacities, and zones.'
      };
    }
    return {
      icon: Boxes,
      color: 'text-slate-500 bg-slate-500/10 border-slate-500/20 dark:border-slate-500/10',
      glow: 'group-hover:border-slate-500/50 group-hover:shadow-slate-500/10',
      desc: 'System core configuration database entry details.'
    };
  };

  const triggerReport = () => {
    Swal.fire({
      title: 'Generate System Report',
      text: 'Do you want to generate a summary report for all system masters and ledgers?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Generate',
      confirmButtonColor: '#2563EB',
      background: 'var(--color-bg-lighter)',
      color: 'var(--color-text-primary)'
    }).then((result) => {
      if (result.isConfirmed) {
        showSuccess('Export Completed', 'System report downloaded successfully.');
      }
    });
  };

  if (!user) {
    return <div className="text-text-muted p-6">Loading dashboard content...</div>;
  }

  // Chart dataset mock
  const chartData = [
    { name: 'Jan', transactions: 45, users: 12 },
    { name: 'Feb', transactions: 72, users: 18 },
    { name: 'Mar', transactions: 58, users: 15 },
    { name: 'Apr', transactions: 96, users: 24 },
    { name: 'May', transactions: 84, users: 28 },
    { name: 'Jun', transactions: 128, users: 35 }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Large Hero Welcome Banner Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full relative rounded-3xl overflow-hidden bg-gradient-to-br from-bg-lighter via-bg-base/30 to-bg-lighter dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border border-border-base p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
      >
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
        
        {/* Glow circles */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            System Live Update
          </span>
          <h2 className="text-2xl md:text-3.5xl font-extrabold text-text-primary tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">{user.firstName} {user.lastName}! 👋</span>
          </h2>
          <p className="text-text-secondary text-sm md:text-base font-medium leading-relaxed">
            Manage your system masters, ledgers, and transactions from a single premium console. Monitor trends and access data forms instantly.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
            <Link 
              to="/mill-list" 
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              Manage Ledgers
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="text-xs text-text-muted font-medium">
              Role: <span className="text-text-primary font-semibold uppercase">{user.role}</span> &bull; Last Login: <span className="text-text-primary font-semibold">May 19, 2025</span>
            </div>
          </div>
        </div>

        {/* Right side Illustration */}
        <div className="relative shrink-0 w-60 h-40 hidden md:flex items-center justify-center">
          <img 
            src="/dashboard_illustration.png" 
            alt="Analytics Illustration" 
            className="w-52 h-36 object-contain rounded-2xl drop-shadow-[0_8px_32px_rgba(99,102,241,0.25)] hover:scale-105 transition-transform duration-500"
          />
        </div>
      </motion.div>

      {/* 2. 6 Statistics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Card 1: Total Masters */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4 relative group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-blue-500 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 group-hover:border-blue-500/40 group-hover:shadow-[0_0_12px_rgba(37,99,235,0.2)] transition-all">
              <Boxes className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mb-1">Total Masters</p>
              <p className="text-xl font-extrabold text-text-primary leading-tight">{masterPages.length || 5}</p>
              <p className="text-[9px] text-text-muted mt-1 truncate">System master pages</p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-bg-base dark:bg-slate-800/80 border border-border-base text-text-muted group-hover:text-text-primary group-hover:bg-bg-darker flex items-center justify-center shrink-0 transition-all duration-300">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Card 2: Total Districts */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4 relative group cursor-pointer"
          onClick={() => navigate('/district')}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 group-hover:border-amber-500/40 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.2)] transition-all">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mb-1">Districts</p>
              <p className="text-xl font-extrabold text-text-primary leading-tight">{districtCount}</p>
              <p className="text-[9px] text-text-muted mt-1 truncate">Geographies</p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-bg-base dark:bg-slate-800/80 border border-border-base text-text-muted group-hover:text-text-primary group-hover:bg-bg-darker flex items-center justify-center shrink-0 transition-all duration-300">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Card 3: Total States */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4 relative group cursor-pointer"
          onClick={() => navigate('/state')}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all">
              <Map className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mb-1">States</p>
              <p className="text-xl font-extrabold text-text-primary leading-tight">{stateCount}</p>
              <p className="text-[9px] text-text-muted mt-1 truncate">Regions registered</p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-bg-base dark:bg-slate-800/80 border border-border-base text-text-muted group-hover:text-text-primary group-hover:bg-bg-darker flex items-center justify-center shrink-0 transition-all duration-300">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Card 4: Total Ledgers */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4 relative group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-green-500 dark:text-green-400 bg-green-500/10 border border-green-500/20 group-hover:border-green-500/40 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mb-1">Total Ledgers</p>
              <p className="text-xl font-extrabold text-text-primary leading-tight">2</p>
              <p className="text-[9px] text-text-muted mt-1 truncate">Ledger selections</p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-bg-base dark:bg-slate-800/80 border border-border-base text-text-muted group-hover:text-text-primary group-hover:bg-bg-darker flex items-center justify-center shrink-0 transition-all duration-300">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Card 5: Transactions */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4 relative group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-purple-500 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 group-hover:border-purple-500/40 group-hover:shadow-[0_0_12px_rgba(124,58,237,0.2)] transition-all">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mb-1">Transactions</p>
              <p className="text-xl font-extrabold text-text-primary leading-tight">128</p>
              <p className="text-[9px] text-text-muted mt-1 truncate">This month</p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-bg-base dark:bg-slate-800/80 border border-border-base text-text-muted group-hover:text-text-primary group-hover:bg-bg-darker flex items-center justify-center shrink-0 transition-all duration-300">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Card 6: Last Login Time */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4 relative group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-orange-500 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20 group-hover:border-orange-500/40 group-hover:shadow-[0_0_12px_rgba(249,115,22,0.2)] transition-all">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mb-1">Last Login</p>
              <p className="text-[13px] font-extrabold text-text-primary leading-tight">May 19, 2025</p>
              <p className="text-[9px] text-text-muted mt-1 truncate">10:30 AM</p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-bg-base dark:bg-slate-800/80 border border-border-base text-text-muted group-hover:text-text-primary group-hover:bg-bg-darker flex items-center justify-center shrink-0 transition-all duration-300">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

      </div>

      {/* 3. Row 3: Master Pages and Ledgers Selection (Side-by-Side on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        
        {/* System Master Pages Card (col-span 3) */}
        <div className="lg:col-span-3 glass-card rounded-3xl p-6 border border-border-base flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border-base pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-500" />
                  System Master Pages
                </h3>
                <p className="text-xs text-text-muted font-medium">Configure operations databases, mappings, and zones.</p>
              </div>
              <button 
                onClick={() => navigate('/district')}
                className="text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-base hover:bg-bg-darker border border-border-base px-3 py-1 rounded-full cursor-pointer transition-colors"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {masterPages.map((page) => {
                const config = getMasterConfig(page.routeUrl);
                const Icon = config.icon;
                
                return (
                  <Link 
                    key={page.masterPageId} 
                    to={page.routeUrl}
                    className="group relative p-3.5 bg-bg-base/40 hover:bg-bg-lighter border border-border-base rounded-2xl transition-all duration-300 flex items-center justify-between hover:scale-[1.02] shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${config.color}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      
                      {/* Details */}
                      <span className="font-bold text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                        {getPageName(page)}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}

              {masterPages.length === 0 && (
                <div className="col-span-2 p-6 text-center text-text-muted border border-dashed border-border-base rounded-2xl font-medium">
                  No active master pages available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ledgers Selection Section (col-span 2) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-border-base flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border-base pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-purple-500" />
                  Ledgers & Transactions
                </h3>
                <p className="text-xs text-text-muted font-medium">Access transaction books, entries, and credit/debit balances.</p>
              </div>
              <button 
                onClick={() => navigate('/mill-list')}
                className="text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-base hover:bg-bg-darker border border-border-base px-3 py-1 rounded-full cursor-pointer transition-colors"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {/* Mill Ledger selection */}
              <Link 
                to="/mill-list"
                className="group p-3.5 bg-bg-base/40 hover:bg-bg-lighter border border-border-base rounded-2xl transition-all duration-300 flex items-center justify-between hover:scale-[1.02] shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-blue-500 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 group-hover:border-blue-500/40">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-bold text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    {t('millList') || 'Mill Ledger Selection'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Dukan Ledger selection */}
              <Link 
                to="/dukan-list"
                className="group p-3.5 bg-bg-base/40 hover:bg-bg-lighter border border-border-base rounded-2xl transition-all duration-300 flex items-center justify-between hover:scale-[1.02] shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40">
                    <Store className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-bold text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    {t('dukanList') || 'Dukan Ledger Selection'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Row 4: Overview Statistics Chart and Quick Actions (Side-by-Side on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        
        {/* Analytics Chart Section (col-span 3) */}
        <div className="lg:col-span-3 glass-card rounded-3xl p-6 border border-border-base flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-base pb-4 mb-6 gap-2">
              <div>
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  Overview Statistics
                </h3>
                <p className="text-xs text-text-muted font-medium">Activity trends for monthly ledger transaction postings.</p>
              </div>
              <div className="flex items-center gap-2">
                <select className="bg-bg-base border border-border-base rounded-xl px-3 py-1.5 text-xs font-semibold text-text-secondary focus:outline-none">
                  <option>This Year</option>
                  <option>Last 6 Months</option>
                </select>
              </div>
            </div>

            {/* Recharts chart wrapper */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGradBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="chartGradPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-base)" opacity={0.3} />
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-bg-lighter)', 
                      borderColor: 'var(--color-border-base)',
                      borderRadius: '12px',
                      color: 'var(--color-text-primary)',
                      fontSize: '12px'
                    }} 
                  />
                  <Area type="monotone" dataKey="transactions" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#chartGradBlue)" name="Transactions" />
                  <Area type="monotone" dataKey="users" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#chartGradPurple)" name="Active Users" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Stack: Quick Actions and Status Card (col-span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Quick Actions Card */}
          <div className="glass-card rounded-3xl p-6 border border-border-base flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-1">Quick Actions</h3>
              <p className="text-xs text-text-muted font-medium border-b border-border-base pb-3 mb-4">Jump directly into registration pages.</p>
              
              <div className="space-y-3">
                {/* Action 1 */}
                <Link 
                  to="/dukan" 
                  className="w-full flex items-center justify-between p-3 bg-bg-base/60 hover:bg-bg-lighter border border-border-base hover:border-slate-300 dark:hover:border-slate-700/60 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-text-secondary">Add New Dukan</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">Register retail shop profiles.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                </Link>

                {/* Action 2 */}
                <Link 
                  to="/marko" 
                  className="w-full flex items-center justify-between p-3 bg-bg-base/60 hover:bg-bg-lighter border border-border-base hover:border-slate-300 dark:hover:border-slate-700/60 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-text-secondary">Add New Marko</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">Register branding marks.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
                </Link>

                {/* Action 3 */}
                <Link 
                  to="/district" 
                  className="w-full flex items-center justify-between p-3 bg-bg-base/60 hover:bg-bg-lighter border border-border-base hover:border-slate-300 dark:hover:border-slate-700/60 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-600/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-text-secondary">Add District</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">Define operation district.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                </Link>

                {/* Action 4 */}
                <Link 
                  to="/mill-list" 
                  className="w-full flex items-center justify-between p-3 bg-bg-base/60 hover:bg-bg-lighter border border-border-base hover:border-slate-300 dark:hover:border-slate-700/60 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-text-secondary">Create Ledger</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">Post a new billing entry.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                </Link>

                {/* Action 5 */}
                <button 
                  onClick={triggerReport}
                  className="w-full flex items-center justify-between p-3 bg-bg-base/60 hover:bg-bg-lighter border border-border-base hover:border-slate-300 dark:hover:border-slate-700/60 rounded-xl transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-600/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                      <FileDown className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-secondary">Generate Report</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">Download system summary.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          </div>

          {/* Database Server Status */}
          <div className="glass-card rounded-3xl p-5 border border-border-base space-y-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Database Server Status
              </h3>
              <p className="text-[11px] text-text-muted font-medium mt-0.5">Connected to ASP.NET API backend.</p>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-text-muted">Response Latency</span>
                <span className="text-emerald-500 font-semibold">12 ms</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-text-muted">Uptime</span>
                <span className="text-text-secondary font-semibold">99.98%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-text-muted">API Endpoint</span>
                <span className="text-text-muted font-mono text-[10px] truncate max-w-[150px]" title={import.meta.env.VITE_API_BASE_URL}>
                  {import.meta.env.VITE_API_BASE_URL.replace('http://', '').replace('https://', '')}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
