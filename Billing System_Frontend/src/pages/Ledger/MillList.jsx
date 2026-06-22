import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building, User, Phone, MapPin, Search, ChevronRight, ArrowLeft 
} from 'lucide-react';
import api from '../../services/api';

function MillList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mills, setMills] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchMills();
  }, [page, i18n.language]);

  const fetchMills = async () => {
    try {
      const res = await api.get(`/mill?page=${page}&pageSize=${pageSize}&lang=${i18n.language}`);
      setMills(res.data.data || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Client-side local filtering for search query
  const filteredMills = mills.filter(item => {
    const matchesSearch = !searchTerm || 
      item.millName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ownerPhoneNo?.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3.5xl font-extrabold text-text-primary tracking-tight flex items-center gap-2.5">
            <span>📒</span>
            <span>{t('millList') || 'Select Mill Ledger'}</span>
          </h2>
          <p className="text-text-muted text-xs sm:text-sm font-medium mt-1">
            Choose a Mill from the listings below to view transactions, calculate taxes, and manage ledger entries.
          </p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2.5 bg-bg-darker hover:bg-bg-base border border-border-base text-xs font-bold text-text-secondary hover:text-text-primary transition flex items-center gap-1.5 self-start cursor-pointer hover:scale-[1.02]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Search Filter Panel */}
      <div className="glass-card rounded-2xl p-4 border border-border-base flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search mill by name, owner, or contact..." 
            className="w-full bg-bg-base/60 border border-border-base rounded-xl py-2 pl-9 pr-4 text-xs text-text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-text-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Glassmorphic Card Grid (3 columns on desktop, 2 on tablet, 1 on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMills.map((item) => (
          <div 
            key={item.millNo} 
            className="glass-card rounded-3xl p-5 border border-border-base hover:border-border-base/80 transition-all flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-blue-500/5 group"
          >
            <div className="space-y-3">
              {/* Card Header: Mill Name & Icon */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary tracking-tight leading-snug group-hover:text-blue-500 transition-colors">
                      {item.millName}
                    </h4>
                    <span className={`px-2 py-0.5 mt-1 inline-flex text-[9px] font-bold rounded-full border ${
                      item.isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner and Phone Details */}
              <div className="space-y-2 pt-2 text-xs border-t border-border-base/60">
                <div className="flex items-center gap-2 text-text-muted">
                  <User className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span className="font-medium">Owner:</span>
                  <span className="text-text-secondary font-semibold">{item.ownerName}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span className="font-medium">Phone:</span>
                  <span className="text-text-secondary font-semibold">{item.ownerPhoneNo}</span>
                </div>
                {item.stateName && (
                  <div className="flex items-center gap-2 text-text-muted">
                    <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span className="font-medium">Location:</span>
                    <span className="text-text-secondary font-semibold truncate">
                      {item.stateName} {item.districtName ? `/ ${item.districtName}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* View Ledger Action Button */}
            <button 
              onClick={() => navigate(`/mill-ledger/${item.millNo}`)}
              className="w-full py-2.5 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer hover:scale-[1.01]"
            >
              <span>View Ledger</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}

        {filteredMills.length === 0 && (
          <div className="col-span-full py-12 text-center text-text-muted font-medium bg-bg-darker/10 border border-border-base rounded-3xl">
            No Mill records found matching filters.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-bg-darker/20 border border-border-base p-4 rounded-2xl">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-bg-darker border border-border-base text-xs font-bold text-text-secondary disabled:opacity-50 rounded-xl hover:bg-bg-base transition cursor-pointer select-none">
            Previous
          </button>
          <span className="text-xs font-semibold text-text-muted">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-bg-darker border border-border-base text-xs font-bold text-text-secondary disabled:opacity-50 rounded-xl hover:bg-bg-base transition cursor-pointer select-none">
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default MillList;
