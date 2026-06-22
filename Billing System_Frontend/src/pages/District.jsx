import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Search, Plus, X, MoreVertical, Edit, Power, History, Download, Globe
} from 'lucide-react';
import api from '../services/api';
import ActionMenu from '../components/common/ActionMenu';
import { useLoader } from '../context/LoaderContext';
import { useNotification } from '../context/NotificationContext';

function District() {
  const { t, i18n } = useTranslation();
  const { showLoader, hideLoader } = useLoader();
  const { showSuccess, showError } = useNotification();
  const [districts, setDistricts] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    stateNo: '',
    isActive: true
  });

  const [showAudit, setShowAudit] = useState(false);
  const [auditData, setAuditData] = useState([]);

  // Client-side search & dropdown states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  useEffect(() => {
    fetchDistricts();
    fetchStates();
  }, []);

  const fetchDistricts = async () => {
    try {
      const res = await api.get('/district');
      setDistricts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStates = async () => {
    try {
      const res = await api.get('/state');
      setStatesList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getFieldValue = (item, fieldBase) => {
    const lang = i18n.language;
    if (lang === 'gu') return item[`${fieldBase}_guj`] || item[`${fieldBase}_en`];
    if (lang === 'hi') return item[`${fieldBase}_hi`] || item[`${fieldBase}_en`];
    return item[`${fieldBase}_en`];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const lang = i18n.language;
    
    if (lang === 'gu') {
      if ((formData.name && /[a-zA-Z]/.test(formData.name)) || (formData.description && /[a-zA-Z]/.test(formData.description))) {
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
      if ((formData.name && /[a-zA-Z]/.test(formData.name)) || (formData.description && /[a-zA-Z]/.test(formData.description))) {
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
      districtCode: formData.code,
      stateNo: parseInt(formData.stateNo)
    };
    
    if (lang === 'en') {
      payload.districtName_en = formData.name;
      payload.districtDescription_en = formData.description;
    } else if (lang === 'hi') {
      payload.districtName_hi = formData.name;
      payload.districtDescription_hi = formData.description;
    } else if (lang === 'gu') {
      payload.districtName_guj = formData.name;
      payload.districtDescription_guj = formData.description;
    }

    try {
      showLoader(editingId ? 'Updating district record...' : 'Creating new district record...');
      if (editingId) {
        await api.put(`/district/${editingId}`, payload);
      } else {
        await api.post('/district', payload);
      }
      hideLoader();
      if (editingId) {
        showSuccess('District Updated Successfully', `${formData.name} has been updated.`);
      } else {
        showSuccess('District Created Successfully', `${formData.name} has been added.`);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', code: '', description: '', stateNo: '', isActive: true });
      fetchDistricts();
    } catch (err) {
      console.error(err);
      hideLoader();
      const errMsg = err.response?.data?.message || 'District code already exists.';
      showError(editingId ? 'District Update Failed' : 'District Creation Failed', errMsg);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.districtNo);
    setFormData({
      name: getFieldValue(item, 'districtName'),
      code: item.districtCode || '',
      description: getFieldValue(item, 'districtDescription'),
      stateNo: item.stateNo || '',
      isActive: item.isActive
    });
    setShowForm(true);
  };

  const handleToggleActive = async (item) => {
    const districtName = getFieldValue(item, 'districtName');
    try {
      showLoader(item.isActive ? 'Deactivating district...' : 'Activating district...');
      await api.put(`/district/${item.districtNo}`, { isActive: !item.isActive });
      hideLoader();
      if (item.isActive) {
        showSuccess('District Deactivated', `${districtName} has been deactivated.`);
      } else {
        showSuccess('District Activated', `${districtName} is now active.`);
      }
      fetchDistricts();
    } catch (err) {
      console.error(err);
      hideLoader();
      showError('Status Update Failed', err.response?.data?.message || 'Unable to update district status.');
    }
  };

  const handleAudit = async (recordNo) => {
    try {
      showLoader('Fetching audit logs...');
      const res = await api.get(`/audit/${recordNo}`);
      setAuditData(res.data || []);
      hideLoader();
      setShowAudit(true);
    } catch (err) {
      console.error(err);
      hideLoader();
      showError('Audit Fetch Failed', err.response?.data?.message || 'Unable to retrieve audit logs.');
    }
  };

  const handleExport = () => {
    if (districts.length === 0) return;
    try {
      showLoader('Exporting district data...');
      const headers = ["No", "District Name", "State Name", "District Code", "Description", "Status"];
      const rows = districts.map((item, idx) => [
        idx + 1,
        `"${getFieldValue(item, 'districtName')}"`,
        `"${item.userState ? getFieldValue(item.userState, 'stateName') : 'N/A'}"`,
        item.districtCode,
        `"${getFieldValue(item, 'districtDescription') || ''}"`,
        item.isActive ? "Active" : "Inactive"
      ]);
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "districts_export.csv");
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

  // Client-side filtering logic
  const filteredDistricts = districts.filter(item => {
    const matchesSearch = !searchTerm || 
      getFieldValue(item, 'districtName')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.districtCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getFieldValue(item, 'districtDescription')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.userState && getFieldValue(item.userState, 'stateName')?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesState = !selectedState || item.stateNo === parseInt(selectedState);
    return matchesSearch && matchesState;
  });

  const totalCount = districts.length;
  const activeCount = districts.filter(d => d.isActive).length;
  const inactiveCount = totalCount - activeCount;
  const statesCovered = new Set(districts.map(d => d.stateNo)).size;

  return (
    <div className="space-y-6 relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3.5xl font-extrabold text-text-primary tracking-tight flex items-center gap-2.5">
            <span>📍</span>
            <span>{t('district.title')}</span>
          </h2>
          <p className="text-text-muted text-xs sm:text-sm font-medium mt-1">
            Configure administrative district mappings, state ownership, codes, and attributes.
          </p>
        </div>
        <button 
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: '', code: '', description: '', stateNo: '', isActive: true });
          }}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/15 transition-all flex items-center gap-1.5 self-start cursor-pointer hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          {t('district.addDistrict')}
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
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Total Districts</p>
              <p className="text-xl font-black text-text-primary">{totalCount}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Active</p>
              <p className="text-xl font-black text-text-primary">{activeCount}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Inactive</p>
              <p className="text-xl font-black text-text-primary">{inactiveCount}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">States Covered</p>
              <p className="text-xl font-black text-text-primary">{statesCovered}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 border border-border-base flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-3 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search district name, code, description or state..." 
              className="w-full bg-bg-base/60 border border-border-base rounded-xl py-2 pl-9 pr-4 text-xs text-text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-text-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select 
              className="bg-bg-base border border-border-base rounded-xl px-3 py-2 text-xs font-semibold text-text-secondary focus:outline-none focus:border-blue-500 min-w-[150px]"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">State: All</option>
              {statesList.map(s => (
                <option key={s.stateNo} value={s.stateNo}>{getFieldValue(s, 'stateName')}</option>
              ))}
            </select>

            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-bg-darker hover:bg-bg-base border border-border-base rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden bg-bg-lighter/30 border border-border-base rounded-3xl shadow-xl">
          <table className="min-w-full divide-y divide-border-base text-left">
            <thead className="bg-bg-base/40">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">{t('district.no')}</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">{t('district.name')}</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">{t('district.state')}</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">{t('district.code')}</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">{t('district.description')}</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">{t('district.status')}</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider w-20">{t('district.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base bg-transparent text-sm">
              {filteredDistricts.map((item, idx) => (
                <tr key={item.districtNo} className="hover:bg-bg-darker/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-text-muted">{idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-text-primary tracking-tight">{getFieldValue(item, 'districtName')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-secondary font-medium">{item.userState ? getFieldValue(item.userState, 'stateName') : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-muted font-semibold">{item.districtCode}</td>
                  <td className="px-6 py-4 text-text-muted max-w-xs truncate">{getFieldValue(item, 'districtDescription')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-[10px] leading-5 font-bold rounded-full border ${
                      item.isActive 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {item.isActive ? t('district.active') : t('district.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ActionMenu
                      isActive={item.isActive}
                      onEdit={() => handleEdit(item)}
                      onToggleActive={() => handleToggleActive(item)}
                      onAudit={() => handleAudit(item.districtNo)}
                      editLabel={t('district.edit')}
                      activateLabel={t('district.activate')}
                      deactivateLabel={t('district.deactivate')}
                      auditLabel={t('district.audit')}
                    />
                  </td>
                </tr>
              ))}
              {filteredDistricts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-sm text-text-muted font-medium">{t('district.noDistricts')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredDistricts.map((item, idx) => (
            <div key={item.districtNo} className="glass-card rounded-2xl p-4 border border-border-base relative space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-text-primary tracking-tight">{getFieldValue(item, 'districtName')}</h4>
                  <p className="text-xs text-text-muted font-semibold mt-0.5">
                    State: <span className="text-text-secondary">{item.userState ? getFieldValue(item.userState, 'stateName') : 'N/A'}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                    item.isActive 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                   <ActionMenu
                     isActive={item.isActive}
                     onEdit={() => handleEdit(item)}
                     onToggleActive={() => handleToggleActive(item)}
                     onAudit={() => handleAudit(item.districtNo)}
                     editLabel={t('district.edit') || 'Edit'}
                     activateLabel={t('district.activate') || 'Activate'}
                     deactivateLabel={t('district.deactivate') || 'Deactivate'}
                     auditLabel={t('district.audit') || 'Audit'}
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-base/60 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Code</p>
                  <p className="text-text-secondary font-semibold">{item.districtCode}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Index</p>
                  <p className="text-text-secondary font-semibold">{idx + 1}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Description</p>
                  <p className="text-text-muted leading-normal">{getFieldValue(item, 'districtDescription') || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredDistricts.length === 0 && (
            <div className="p-6 text-center text-text-muted">{t('district.noDistricts')}</div>
          )}
        </div>
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
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <span>{editingId ? t('district.editDistrict') : t('district.addNewDistrict')} ({i18n.language.toUpperCase()})</span>
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
                    {/* Basic Fields */}
                    <div>
                      <label className="text-xs font-semibold text-text-secondary">{t('district.state')} *</label>
                      <select 
                        required 
                        name="stateNo" 
                        value={formData.stateNo} 
                        onChange={handleInputChange} 
                        className="w-full bg-bg-base border border-border-base rounded-xl p-3 text-xs text-text-secondary mt-1 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- Select State --</option>
                        {statesList.map(s => (
                          <option key={s.stateNo} value={s.stateNo}>{getFieldValue(s, 'stateName')}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-secondary">{t('district.name')} *</label>
                      <input 
                        required 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        className="w-full bg-bg-base border border-border-base rounded-xl p-3 text-xs text-text-primary mt-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        placeholder="E.g. Rajkot" 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-secondary">{t('district.code')} *</label>
                      <input 
                        required 
                        name="code" 
                        value={formData.code} 
                        onChange={handleInputChange} 
                        className="w-full bg-bg-base border border-border-base rounded-xl p-3 text-xs text-text-primary mt-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        placeholder="E.g. RJ01" 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-secondary">{t('district.description')} *</label>
                      <input 
                        required 
                        name="description" 
                        value={formData.description} 
                        onChange={handleInputChange} 
                        className="w-full bg-bg-base border border-border-base rounded-xl p-3 text-xs text-text-primary mt-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        placeholder="Administrative description" 
                      />
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
                        <label htmlFor="isActive" className="text-xs font-semibold text-text-secondary ml-2 select-none">{t('district.isActive')}</label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="mt-8 pt-4 border-t border-border-base flex items-center justify-end gap-3 sticky bottom-0 bg-bg-lighter">
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 bg-bg-darker hover:bg-bg-base border border-border-base text-xs font-bold text-text-secondary hover:text-text-primary rounded-xl transition cursor-pointer"
                  >
                    {t('district.cancel')}
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition cursor-pointer"
                  >
                    {t('district.save')}
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
              className="fixed inset-0 bg-black z-50"
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
                    {t('district.auditHistory')}
                  </h3>
                  <button onClick={() => setShowAudit(false)} className="p-1 hover:bg-bg-darker rounded-lg text-text-muted hover:text-text-primary transition cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {auditData.length === 0 && <p className="text-sm text-text-muted">{t('district.noAudit')}</p>}
                  {auditData.map((audit) => (
                    <div key={audit.auditId} className="p-4 border border-border-base rounded-2xl bg-bg-lighter/30 space-y-3.5">
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-text-muted">
                        <span className="font-bold text-[10px] text-white px-2 py-0.5 bg-blue-600 rounded">
                          {audit.actionType}
                        </span>
                        <span>{new Date(audit.createdDate).toLocaleString()}</span>
                        <span>&bull;</span>
                        <span>{t('district.user')}: {audit.userName || audit.userNo || 'System'}</span>
                      </div>
                      
                      <div className={`grid ${audit.oldValue && audit.newValue ? 'grid-cols-2' : 'grid-cols-1'} gap-3 text-xs mt-3`}>
                        {audit.oldValue && (
                          <div className="p-3 bg-rose-950/10 text-rose-800 dark:text-rose-200 rounded-xl border border-rose-900/20">
                            <strong className="block mb-1 text-[10px] uppercase tracking-wider text-rose-500">{t('district.oldValue')}</strong>
                            {renderRowByRow(audit.oldValue)}
                          </div>
                        )}
                        {audit.newValue && (
                          <div className="p-3 bg-emerald-950/10 text-emerald-800 dark:text-emerald-200 rounded-xl border border-emerald-900/20">
                            <strong className="block mb-1 text-[10px] uppercase tracking-wider text-emerald-500">{t('district.newValue')}</strong>
                            {renderRowByRow(audit.newValue)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border-base/60">
                <button 
                  onClick={() => setShowAudit(false)} 
                  className="w-full py-2.5 bg-bg-darker border border-border-base hover:border-text-muted text-xs font-bold text-text-secondary hover:text-text-primary rounded-xl transition cursor-pointer"
                >
                  {t('district.close')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default District;
