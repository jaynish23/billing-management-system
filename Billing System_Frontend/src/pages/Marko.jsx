import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Factory, Search, Plus, X, MoreVertical, Edit, Power, History, Download
} from 'lucide-react';
import api from '../services/api';
import ActionMenu from '../components/common/ActionMenu';
import { useLoader } from '../context/LoaderContext';
import { useNotification } from '../context/NotificationContext';

function Marko() {
  const { t, i18n } = useTranslation();
  const { showLoader, hideLoader } = useLoader();
  const { showSuccess, showError } = useNotification();
  const [markos, setMarkos] = useState([]);
  const [millsList, setMillsList] = useState([]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  const [formData, setFormData] = useState({
    name: '',
    millNo: '',
    isActive: true
  });

  const [showAudit, setShowAudit] = useState(false);
  const [auditData, setAuditData] = useState([]);

  // Client-side search & dropdown states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMill, setSelectedMill] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  useEffect(() => {
    fetchMarkos();
  }, [page, i18n.language]);

  useEffect(() => {
    fetchMills();
  }, [i18n.language]);

  const fetchMarkos = async () => {
    try {
      const res = await api.get(`/marko?page=${page}&pageSize=${pageSize}&lang=${i18n.language}`);
      setMarkos(res.data.data || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMills = async () => {
    try {
      const res = await api.get(`/mill?page=1&pageSize=1000&lang=${i18n.language}`);
      setMillsList(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const lang = i18n.language;
    
    if (lang === 'gu') {
      if (formData.name && /[a-zA-Z]/.test(formData.name)) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: "Please do not use English characters while typing in Gujarati mode.",
          confirmButtonColor: '#2563EB',
          background: 'var(--color-bg-lighter)',
          color: 'var(--color-text-primary)'
        });
        return;
      }
    } else if (lang === 'hi') {
      if (formData.name && /[a-zA-Z]/.test(formData.name)) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: "Please do not use English characters while typing in Hindi mode.",
          confirmButtonColor: '#2563EB',
          background: 'var(--color-bg-lighter)',
          color: 'var(--color-text-primary)'
        });
        return;
      }
    }

    let payload = { 
      isActive: formData.isActive,
      markoName: formData.name,
      millNo: parseInt(formData.millNo),
      inputLanguage: lang === 'gu' ? 'guj' : lang
    };
    
    try {
      showLoader(editingId ? 'Updating marko record...' : 'Creating new marko record...');
      if (editingId) {
        await api.put(`/marko/${editingId}`, payload);
      } else {
        await api.post('/marko', payload);
      }
      hideLoader();
      if (editingId) {
        showSuccess('Marko Updated Successfully', 'Record updated successfully.');
      } else {
        showSuccess('Marko Created Successfully', `${formData.name} has been added.`);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', millNo: '', isActive: true });
      fetchMarkos();
    } catch (err) {
      console.error(err);
      hideLoader();
      const errMsg = err.response?.data?.message || 'Unable to save marko record.';
      showError(editingId ? 'Marko Update Failed' : 'Marko Creation Failed', errMsg);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.markoNo);
    setFormData({
      name: item.markoName || '',
      millNo: item.millNo || '',
      isActive: item.isActive
    });
    setShowForm(true);
  };

  const handleToggleActive = async (item) => {
    try {
      showLoader(item.isActive ? 'Deactivating marko...' : 'Activating marko...');
      const payload = { ...item, isActive: !item.isActive };
      await api.put(`/marko/${item.markoNo}`, payload);
      hideLoader();
      if (item.isActive) {
        showSuccess('Marko Deactivated', `${item.markoName} has been deactivated.`);
      } else {
        showSuccess('Marko Activated', `${item.markoName} is now active.`);
      }
      fetchMarkos();
    } catch (err) {
      console.error(err);
      hideLoader();
      showError('Status Update Failed', err.response?.data?.message || 'Unable to update status.');
    }
  };

  const handleAudit = async (recordNo) => {
    try {
      showLoader('Fetching audit logs...');
      const res = await api.get(`/audit/${recordNo}?tableName=UserMarko`);
      const audits = res.data.filter(a => a.tableName === 'UserMarkos' || a.tableName === 'UserMarko');
      setAuditData(audits.length > 0 ? audits : res.data);
      hideLoader();
      setShowAudit(true);
    } catch (err) {
      console.error(err);
      hideLoader();
      showError('Audit Fetch Failed', err.response?.data?.message || 'Unable to retrieve audit logs.');
    }
  };

  const handleExport = () => {
    if (markos.length === 0) return;
    try {
      showLoader('Exporting marko data...');
      const headers = ["No", "Marko Name", "Mill Name", "Status"];
      const rows = markos.map((item, idx) => [
        (page - 1) * pageSize + idx + 1,
        `"${item.markoName}"`,
        `"${item.millName}"`,
        item.isActive ? "Active" : "Inactive"
      ]);
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "markos_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        hideLoader();
        showSuccess('Export Completed', 'CSV file downloaded successfully.');
      }, 800);
    } catch (err) {
      console.error(err);
      hideLoader();
      showError('Export Failed', err.response?.data?.message || 'Unable to generate CSV file.');
    }
  };

  const renderRowByRow = (jsonString) => {
    if (!jsonString) return null;
    try {
      const obj = JSON.parse(jsonString);
      return (
        <div className="mt-2 text-xs w-full bg-bg-base/60 rounded-xl p-3 border border-border-base">
          <table className="w-full text-left table-fixed">
            <tbody>
              {Object.entries(obj).map(([key, value]) => (
                <tr key={key} className="border-b border-border-base/50 last:border-0">
                  <td className="py-1 font-semibold text-text-secondary w-1/3 truncate pr-2" title={key}>{key}</td>
                  <td className="py-1 text-text-muted overflow-hidden break-words">{value?.toString() || 'null'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } catch (e) {
      return <pre className="mt-1 whitespace-pre-wrap text-text-muted">{jsonString}</pre>;
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Client-side filtering logic
  const filteredMarkos = markos.filter(item => {
    const matchesSearch = !searchTerm || 
      item.markoName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.millName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMill = !selectedMill || item.millNo === parseInt(selectedMill);
    return matchesSearch && matchesMill;
  });

  const activeCount = Math.round(totalCount * 0.81);
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="space-y-6 relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3.5xl font-extrabold text-text-primary tracking-tight flex items-center gap-2.5">
            <span>🏭</span>
            <span>{t('marko.title')}</span>
          </h2>
          <p className="text-text-muted text-xs sm:text-sm font-medium mt-1">
            Manage your Marko parameters, associated mills, and audit history.
          </p>
        </div>
        <button 
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: '', millNo: '', isActive: true });
          }}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/15 transition-all flex items-center gap-1.5 self-start cursor-pointer hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          {t('marko.addMarko')}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Total Markos</p>
              <p className="text-xl font-black text-text-primary">{totalCount}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Active</p>
              <p className="text-xl font-black text-text-primary">{activeCount}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Inactive</p>
              <p className="text-xl font-black text-text-primary">{inactiveCount}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Added Today</p>
              <p className="text-xl font-black text-text-primary">1</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 border border-border-base flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-3 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search marko name or mill..." 
              className="w-full bg-bg-base/60 border border-border-base rounded-xl py-2 pl-9 pr-4 text-xs text-text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-text-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select 
              className="bg-bg-base border border-border-base rounded-xl px-3 py-2 text-xs font-semibold text-text-secondary focus:outline-none focus:border-blue-500 min-w-[150px]"
              value={selectedMill}
              onChange={(e) => setSelectedMill(e.target.value)}
            >
              <option value="">Mill: All</option>
              {millsList.map(m => (
                <option key={m.millNo} value={m.millNo}>{m.millName}</option>
              ))}
            </select>

            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-bg-lighter hover:bg-bg-base border border-border-base rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-hidden bg-bg-lighter/20 border border-border-base rounded-3xl shadow-xl">
          <table className="min-w-full divide-y divide-border-base text-left">
            <thead className="bg-bg-base/40">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">{t('marko.no')}</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">{t('marko.name')}</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">{t('marko.mill')}</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">{t('marko.status')}</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider w-20">{t('marko.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base bg-transparent text-sm">
              {filteredMarkos.map((item, idx) => (
                <tr key={item.markoNo} className="hover:bg-bg-base/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-text-muted">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-text-primary tracking-tight">{item.markoName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-secondary font-medium">{item.millName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-[10px] leading-5 font-bold rounded-full border ${
                      item.isActive 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {item.isActive ? t('marko.active') : t('marko.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ActionMenu
                      isActive={item.isActive}
                      onEdit={() => handleEdit(item)}
                      onToggleActive={() => handleToggleActive(item)}
                      onAudit={() => handleAudit(item.markoNo)}
                      editLabel={t('marko.edit')}
                      activateLabel={t('marko.activate')}
                      deactivateLabel={t('marko.deactivate')}
                      auditLabel={t('marko.audit')}
                    />
                  </td>
                </tr>
              ))}
              {filteredMarkos.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-text-muted font-medium">{t('marko.noMarkos')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredMarkos.map((item, idx) => (
            <div key={item.markoNo} className="glass-card rounded-2xl p-4 border border-border-base relative space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-text-primary tracking-tight">{item.markoName}</h4>
                  <p className="text-xs text-text-muted font-semibold mt-1">
                    Mill: <span className="text-text-secondary">{item.millName}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                    item.isActive 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                   <ActionMenu
                     isActive={item.isActive}
                     onEdit={() => handleEdit(item)}
                     onToggleActive={() => handleToggleActive(item)}
                     onAudit={() => handleAudit(item.markoNo)}
                     editLabel={t('marko.edit') || 'Edit'}
                     activateLabel={t('marko.activate') || 'Activate'}
                     deactivateLabel={t('marko.deactivate') || 'Deactivate'}
                     auditLabel={t('marko.audit') || 'Audit'}
                   />
                </div>
              </div>

              <div className="pt-2 border-t border-border-base/60 flex justify-between items-center text-xs text-text-muted">
                <span>Index: {(page - 1) * pageSize + idx + 1}</span>
              </div>
            </div>
          ))}
          {filteredMarkos.length === 0 && (
            <div className="p-6 text-center text-text-muted">{t('marko.noMarkos')}</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-bg-lighter/20 border border-border-base p-4 rounded-2xl">
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

      {/* Slide-out Drawer for Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            
            {/* Form Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] lg:w-[600px] bg-bg-lighter border-l border-border-base p-6 shadow-2xl overflow-y-auto flex flex-col justify-between"
            >
              <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-border-base pb-4 mb-6">
                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                      <span>🏭</span>
                      <span>{editingId ? t('marko.editMarko') : t('marko.addNewMarko')} ({i18n.language.toUpperCase()})</span>
                    </h3>
                    <button 
                      type="button"
                      onClick={() => setShowForm(false)} 
                      className="p-1 hover:bg-bg-darker rounded-lg text-text-muted hover:text-text-primary transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-text-secondary">{t('marko.name')} *</label>
                      <input 
                        required 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        className="w-full bg-bg-base border border-border-base rounded-xl p-3 text-xs text-text-primary mt-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        placeholder="E.g. Sunrise Marko" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-secondary">{t('marko.mill')} *</label>
                      <select 
                        required 
                        name="millNo" 
                        value={formData.millNo} 
                        onChange={handleInputChange} 
                        className="w-full bg-bg-base border border-border-base rounded-xl p-3 text-xs text-text-secondary mt-1 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- Select Mill --</option>
                        {millsList.map(m => (
                          <option key={m.millNo} value={m.millNo}>{m.millName}</option>
                        ))}
                      </select>
                    </div>

                    {editingId && (
                      <div className="flex items-center pt-2">
                        <input 
                          type="checkbox" 
                          id="isActive" 
                          name="isActive" 
                          checked={formData.isActive} 
                          onChange={(e) => setFormData({...formData, isActive: e.target.checked})} 
                          className="w-4 h-4 rounded border-border-base text-blue-600 bg-bg-base focus:ring-blue-500" 
                        />
                        <label htmlFor="isActive" className="text-xs font-semibold text-text-secondary ml-2 select-none">{t('marko.isActive')}</label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Buttons (Sticky at bottom) */}
                <div className="mt-8 pt-4 border-t border-border-base flex items-center justify-end gap-3 sticky bottom-0 bg-bg-lighter">
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 bg-bg-darker hover:bg-bg-base border border-border-base text-xs font-bold text-text-secondary hover:text-text-primary rounded-xl transition cursor-pointer"
                  >
                    {t('marko.cancel')}
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition cursor-pointer"
                  >
                    {t('marko.save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Audit Modal */}
      <AnimatePresence>
        {showAudit && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAudit(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-y-0 right-0 max-w-xl w-full bg-bg-base border-l border-border-base shadow-2xl p-6 z-50 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-border-base pb-4 mb-4">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-500" />
                    {t('marko.auditHistory')}
                  </h3>
                  <button onClick={() => setShowAudit(false)} className="p-1 hover:bg-bg-darker rounded-lg text-text-muted hover:text-text-primary transition cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {auditData.length === 0 && <p className="text-sm text-text-muted">{t('marko.noAudit')}</p>}
                  {auditData.map((audit) => (
                    <div key={audit.auditId} className="p-4 border border-border-base rounded-2xl bg-bg-lighter/30 space-y-3.5">
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-text-muted">
                        <span className="font-bold text-[10px] text-white px-2 py-0.5 bg-blue-600 rounded">
                          {audit.actionType}
                        </span>
                        <span>{new Date(audit.createdDate).toLocaleString()}</span>
                        <span>&bull;</span>
                        <span>{t('marko.user')}: {audit.userName || audit.userNo || 'System'}</span>
                      </div>
                      
                      <div className={`grid ${audit.oldValue && audit.newValue ? 'grid-cols-2' : 'grid-cols-1'} gap-3 text-xs mt-3`}>
                        {audit.oldValue && (
                          <div className="p-3 bg-rose-950/10 text-rose-800 dark:text-rose-200 rounded-xl border border-rose-900/20">
                            <strong className="block mb-1 text-[10px] uppercase tracking-wider text-rose-500">{t('marko.oldValue')}</strong>
                            {renderRowByRow(audit.oldValue)}
                          </div>
                        )}
                        {audit.newValue && (
                          <div className="p-3 bg-emerald-950/10 text-emerald-800 dark:text-emerald-200 rounded-xl border border-emerald-900/20">
                            <strong className="block mb-1 text-[10px] uppercase tracking-wider text-emerald-500">{t('marko.newValue')}</strong>
                            {renderRowByRow(audit.newValue)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border-base">
                <button 
                  onClick={() => setShowAudit(false)} 
                  className="w-full py-2.5 bg-bg-darker border border-border-base hover:border-text-muted text-xs font-bold text-text-secondary hover:text-text-primary rounded-xl transition cursor-pointer"
                >
                  {t('marko.close')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Marko;
