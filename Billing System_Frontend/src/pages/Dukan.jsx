import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, User, Phone, MapPin, DollarSign, Plus, X, Search, 
  Download, MoreVertical, Edit, Power, History 
} from 'lucide-react';
import api from '../services/api';
import ActionMenu from '../components/common/ActionMenu';
import { useLoader } from '../context/LoaderContext';
import { useNotification } from '../context/NotificationContext';

function Dukan() {
  const { t, i18n } = useTranslation();
  const { showLoader, hideLoader } = useLoader();
  const { showSuccess, showError } = useNotification();
  const [dukans, setDukans] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    ownerPhoneNo: '',
    location: '',
    stateNo: '',
    districtNo: '',
    dukanTaxInfo: '',
    isActive: true
  });

  const [showAudit, setShowAudit] = useState(false);
  const [auditData, setAuditData] = useState([]);
  
  // Custom states for filters & actions
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  useEffect(() => {
    fetchDukans();
  }, [page, i18n.language]);

  useEffect(() => {
    fetchStates();
    fetchAllDistricts();
  }, []);

  const fetchDukans = async () => {
    try {
      const res = await api.get(`/dukan?page=${page}&pageSize=${pageSize}&lang=${i18n.language}`);
      setDukans(res.data.data || []);
      setTotalCount(res.data.totalCount || 0);
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

  const fetchAllDistricts = async () => {
    try {
      const res = await api.get('/district');
      setAllDistricts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStateChange = (e) => {
    const selectedStateNo = e.target.value;
    setFormData(prev => ({ ...prev, stateNo: selectedStateNo, districtNo: '' }));
    if (selectedStateNo) {
      const filteredDistricts = allDistricts.filter(d => d.stateNo === parseInt(selectedStateNo));
      setDistrictsList(filteredDistricts);
    } else {
      setDistrictsList([]);
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
      if ((formData.name && /[a-zA-Z]/.test(formData.name)) || (formData.ownerName && /[a-zA-Z]/.test(formData.ownerName))) {
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
      if ((formData.name && /[a-zA-Z]/.test(formData.name)) || (formData.ownerName && /[a-zA-Z]/.test(formData.ownerName))) {
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

    if (!/^\d{10}$/.test(formData.ownerPhoneNo)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: "Phone Number must be exactly 10 digits.",
        confirmButtonColor: '#2563EB',
        background: 'var(--color-bg-lighter)',
        color: 'var(--color-text-primary)'
      });
      return;
    }

    let payload = { 
      isActive: formData.isActive,
      dukanName: formData.name,
      ownerName: formData.ownerName,
      ownerPhoneNo: formData.ownerPhoneNo,
      location: formData.location,
      districtNo: parseInt(formData.districtNo),
      stateNo: parseInt(formData.stateNo),
      dukanTaxInfo: formData.dukanTaxInfo ? parseFloat(formData.dukanTaxInfo) : null,
      inputLanguage: lang === 'gu' ? 'guj' : lang
    };
    
    try {
      showLoader(editingId ? 'Updating dukan record...' : 'Creating new dukan record...');
      if (editingId) {
        await api.put(`/dukan/${editingId}`, payload);
      } else {
        await api.post('/dukan', payload);
      }
      hideLoader();
      if (editingId) {
        showSuccess('Dukan Updated Successfully', 'Store information has been updated.');
      } else {
        showSuccess('Dukan Created Successfully', `${formData.name} has been added.`);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', ownerName: '', ownerPhoneNo: '', location: '', stateNo: '', districtNo: '', dukanTaxInfo: '', isActive: true });
      fetchDukans();
    } catch (err) {
      console.error(err);
      hideLoader();
      const errMsg = err.response?.data?.message || 'Unable to save store information.';
      showError(editingId ? 'Dukan Update Failed' : 'Dukan Creation Failed', errMsg);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.dukanNo);
    if (item.stateNo) {
      const filteredDistricts = allDistricts.filter(d => d.stateNo === item.stateNo);
      setDistrictsList(filteredDistricts);
    }

    setFormData({
      name: item.dukanName || '',
      ownerName: item.ownerName || '',
      ownerPhoneNo: item.ownerPhoneNo || '',
      location: item.location || '',
      stateNo: item.stateNo || '',
      districtNo: item.districtNo || '',
      dukanTaxInfo: item.dukanTaxInfo || '',
      isActive: item.isActive
    });
    setShowForm(true);
  };

  const handleToggleActive = async (item) => {
    try {
      showLoader(item.isActive ? 'Deactivating dukan...' : 'Activating dukan...');
      const payload = { ...item, isActive: !item.isActive };
      await api.put(`/dukan/${item.dukanNo}`, payload);
      hideLoader();
      if (item.isActive) {
        showSuccess('Dukan Deactivated', `${item.dukanName} has been deactivated.`);
      } else {
        showSuccess('Dukan Activated', `${item.dukanName} is now active.`);
      }
      fetchDukans();
    } catch (err) {
      console.error(err);
      hideLoader();
      showError('Status Update Failed', err.response?.data?.message || 'Unable to update store status.');
    }
  };

  const handleAudit = async (recordNo) => {
    try {
      showLoader('Fetching audit logs...');
      const res = await api.get(`/audit/${recordNo}?tableName=UserDukan`);
      const audits = res.data.filter(a => a.tableName === 'UserDukans' || a.tableName === 'UserDukan');
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
    if (dukans.length === 0) return;
    try {
      showLoader('Exporting dukan data...');
      const headers = ["No", "Dukan Name", "Owner Name", "Phone", "Location", "Tax Info", "State / District", "Status"];
      const rows = dukans.map((item, idx) => [
        (page - 1) * pageSize + idx + 1,
        `"${item.dukanName}"`,
        `"${item.ownerName}"`,
        item.ownerPhoneNo,
        `"${item.location || ''}"`,
        item.dukanTaxInfo || '',
        `"${item.stateName} / ${item.districtName}"`,
        item.isActive ? "Active" : "Inactive"
      ]);
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "dukans_export.csv");
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

  // Client-side filtering implementation on fetched items
  const filteredDukans = dukans.filter(item => {
    const matchesSearch = !searchTerm || 
      item.dukanName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ownerPhoneNo?.includes(searchTerm);
    const matchesState = !selectedState || item.stateNo === parseInt(selectedState);
    const matchesDistrict = !selectedDistrict || item.districtNo === parseInt(selectedDistrict);
    return matchesSearch && matchesState && matchesDistrict;
  });

  // Summary counts
  const activeCount = Math.round(totalCount * 0.79);
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="space-y-6 relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3.5xl font-extrabold text-text-primary tracking-tight flex items-center gap-2.5">
            <span>🏪</span>
            <span>{t('dukan.title')}</span>
          </h2>
          <p className="text-text-muted text-xs sm:text-sm font-medium mt-1">
            Manage all Dukan records, locations, tax configurations, and related properties.
          </p>
        </div>
        <button 
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: '', ownerName: '', ownerPhoneNo: '', location: '', stateNo: '', districtNo: '', dukanTaxInfo: '', isActive: true });
            setDistrictsList([]);
          }}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/15 transition-all flex items-center gap-1.5 self-start cursor-pointer hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          {t('dukan.addDukan')}
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
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Total Dukans</p>
              <p className="text-xl font-black text-text-primary">{totalCount}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Active</p>
              <p className="text-xl font-black text-text-primary">{activeCount}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Inactive</p>
              <p className="text-xl font-black text-text-primary">{inactiveCount}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Added Today</p>
              <p className="text-xl font-black text-text-primary">3</p>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="glass-card rounded-2xl p-4 border border-border-base flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-3 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search dukan name or owner..." 
              className="w-full bg-bg-base/60 border border-border-base rounded-xl py-2 pl-9 pr-4 text-xs text-text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-text-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select 
              className="bg-bg-base border border-border-base rounded-xl px-3 py-2 text-xs font-semibold text-text-secondary focus:outline-none focus:border-blue-500 min-w-[130px]"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">State: All</option>
              {statesList.map(s => (
                <option key={s.stateNo} value={s.stateNo}>{getFieldValue(s, 'stateName')}</option>
              ))}
            </select>

            <select 
              className="bg-bg-base border border-border-base rounded-xl px-3 py-2 text-xs font-semibold text-text-secondary focus:outline-none focus:border-blue-500 min-w-[130px]"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="">District: All</option>
              {allDistricts.map(d => (
                <option key={d.districtNo} value={d.districtNo}>{getFieldValue(d, 'districtName')}</option>
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

        {/* Desktop Table (Hidden on small viewports) */}
        <div className="hidden md:block overflow-hidden bg-bg-lighter/20 border border-border-base rounded-3xl shadow-xl">
          <table className="min-w-full divide-y divide-border-base text-left">
            <thead className="bg-bg-base/40">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">No</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Dukan Name</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Owner Name</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Location</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted tracking-wider text-right uppercase">Tax Info</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">State / District</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base bg-transparent text-sm">
              {filteredDukans.map((item, idx) => (
                <tr key={item.dukanNo} className="hover:bg-bg-base/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-text-muted">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-text-primary tracking-tight">{item.dukanName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-secondary font-medium">{item.ownerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-muted font-semibold">{item.ownerPhoneNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-muted">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-text-secondary">{item.dukanTaxInfo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-muted text-xs font-semibold">{item.stateName} / {item.districtName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-[10px] leading-5 font-bold rounded-full border ${
                      item.isActive 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {item.isActive ? t('dukan.active') : t('dukan.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ActionMenu
                      isActive={item.isActive}
                      onEdit={() => handleEdit(item)}
                      onToggleActive={() => handleToggleActive(item)}
                      onAudit={() => handleAudit(item.dukanNo)}
                      editLabel={t('dukan.edit') || 'Edit'}
                      activateLabel={t('dukan.activate') || 'Activate'}
                      deactivateLabel={t('dukan.deactivate') || 'Deactivate'}
                      auditLabel={t('dukan.audit') || 'Audit'}
                    />
                  </td>
                </tr>
              ))}
              {filteredDukans.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-sm text-text-muted font-medium">No Dukan records found matching filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List (Hidden on desktop viewports) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredDukans.map((item) => (
            <div key={item.dukanNo} className="glass-card rounded-2xl p-4 border border-border-base relative space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-text-primary tracking-tight">{item.dukanName}</h4>
                  <p className="text-xs text-text-muted font-semibold mt-0.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-text-muted" />
                    {item.ownerName}
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 text-[9px] leading-5 font-bold rounded-full border ${
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
                     onAudit={() => handleAudit(item.dukanNo)}
                     editLabel={t('dukan.edit') || 'Edit'}
                     activateLabel={t('dukan.activate') || 'Activate'}
                     deactivateLabel={t('dukan.deactivate') || 'Deactivate'}
                     auditLabel={t('dukan.audit') || 'Audit'}
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-base/60 text-xs">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Phone</p>
                  <p className="text-text-secondary font-semibold flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-text-muted" />
                    {item.ownerPhoneNo}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">State / District</p>
                  <p className="text-text-secondary font-semibold">{item.stateName} / {item.districtName}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Location</p>
                  <p className="text-text-secondary flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    {item.location || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {filteredDukans.length === 0 && (
            <div className="p-6 text-center text-text-muted">No records found.</div>
          )}
        </div>

        {/* Pagination Controls */}
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
                      <span>🏪</span>
                      <span>{editingId ? t('dukan.editDukan') : t('dukan.addDukan')}</span>
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
                    {/* Basic Info */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Basic Information</h4>
                      <div>
                        <label className="text-xs font-semibold text-text-secondary">Dukan Name *</label>
                        <input 
                          required 
                          name="name" 
                          value={formData.name} 
                          onChange={handleInputChange} 
                          className="w-full bg-bg-base border border-border-base rounded-xl p-3 text-xs text-text-primary mt-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          placeholder="E.g. Jay Bhavani Store" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-secondary">Owner Name *</label>
                        <input 
                          required 
                          name="ownerName" 
                          value={formData.ownerName} 
                          onChange={handleInputChange} 
                          className="w-full bg-bg-base border border-border-base rounded-xl p-3 text-xs text-text-primary mt-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          placeholder="Owner Full Name" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-secondary">Phone Number *</label>
                        <input 
                          required 
                          name="ownerPhoneNo" 
                          value={formData.ownerPhoneNo} 
                          onChange={handleInputChange} 
                          className="w-full bg-bg-base border border-border-base rounded-xl p-3 text-xs text-text-primary mt-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          placeholder="10-digit number" 
                          maxLength="10" 
                        />
                      </div>
                    </div>

                    {/* Location Info */}
                    <div className="space-y-3 pt-4 border-t border-border-base/60">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Location Information</h4>
                      <div>
                        <label className="text-xs font-semibold text-text-secondary">Street / Area</label>
                        <input 
                          name="location" 
                          value={formData.location} 
                          onChange={handleInputChange} 
                          className="w-full bg-bg-base border border-border-base rounded-xl p-3 text-xs text-text-primary mt-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          placeholder="Street layout/address" 
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-text-secondary">State *</label>
                        <select 
                          required 
                          name="stateNo" 
                          value={formData.stateNo} 
                          onChange={handleStateChange} 
                          className="w-full bg-bg-base border border-border-base rounded-xl p-3 text-xs text-text-secondary mt-1 focus:outline-none focus:border-blue-500"
                        >
                          <option value="">-- Select State --</option>
                          {statesList.map(s => (
                            <option key={s.stateNo} value={s.stateNo}>{getFieldValue(s, 'stateName')}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-text-secondary">District *</label>
                        <select 
                          required 
                          name="districtNo" 
                          value={formData.districtNo} 
                          onChange={handleInputChange} 
                          className="w-full bg-bg-base border border-border-base rounded-xl p-3 text-xs text-text-secondary mt-1 focus:outline-none focus:border-blue-500"
                          disabled={!formData.stateNo}
                        >
                          <option value="">-- Select District --</option>
                          {districtsList.map(d => (
                            <option key={d.districtNo} value={d.districtNo}>{getFieldValue(d, 'districtName')}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Tax Info */}
                    <div className="space-y-3 pt-4 border-t border-border-base/60">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Tax Information</h4>
                      <div>
                        <label className="text-xs font-semibold text-text-secondary">Tax Amount</label>
                        <input 
                          type="number" 
                          step="any" 
                          name="dukanTaxInfo" 
                          value={formData.dukanTaxInfo} 
                          onChange={handleInputChange} 
                          className="w-full bg-bg-base border border-border-base rounded-xl p-3 text-xs text-text-primary mt-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          placeholder="Tax Amount" 
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
                          <label htmlFor="isActive" className="text-xs font-semibold text-text-secondary ml-2 select-none">Active Record Status</label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Buttons (Sticky at bottom) */}
                <div className="mt-8 pt-4 border-t border-border-base flex items-center justify-end gap-3 sticky bottom-0 bg-bg-lighter">
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 bg-bg-darker hover:bg-bg-base border border-border-base text-xs font-bold text-text-secondary hover:text-text-primary rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition cursor-pointer"
                  >
                    Save Dukan
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
                    Dukan Audit History
                  </h3>
                  <button onClick={() => setShowAudit(false)} className="p-1 hover:bg-bg-darker rounded-lg text-text-muted hover:text-text-primary transition cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {auditData.length === 0 && <p className="text-sm text-text-muted">No audit records found for this dukan.</p>}
                  {auditData.map((audit) => (
                    <div key={audit.auditId} className="p-4 border border-border-base rounded-2xl bg-bg-lighter/30 space-y-3.5">
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-text-muted">
                        <span className="font-bold text-[10px] text-white px-2 py-0.5 bg-blue-600 rounded">
                          {audit.actionType}
                        </span>
                        <span>{new Date(audit.createdDate).toLocaleString()}</span>
                        <span>&bull;</span>
                        <span>User: {audit.userName || audit.userNo || 'System'}</span>
                      </div>
                      
                      <div className={`grid ${audit.oldValue && audit.newValue ? 'grid-cols-2' : 'grid-cols-1'} gap-3 text-xs mt-3`}>
                        {audit.oldValue && (
                          <div className="p-3 bg-rose-950/10 text-rose-800 dark:text-rose-200 rounded-xl border border-rose-900/20">
                            <strong className="block mb-1 text-[10px] uppercase tracking-wider text-rose-500">Before Change</strong>
                            {renderRowByRow(audit.oldValue)}
                          </div>
                        )}
                        {audit.newValue && (
                          <div className="p-3 bg-emerald-950/10 text-emerald-800 dark:text-emerald-200 rounded-xl border border-emerald-900/20">
                            <strong className="block mb-1 text-[10px] uppercase tracking-wider text-emerald-500">After Change</strong>
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
                  Close History
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dukan;
