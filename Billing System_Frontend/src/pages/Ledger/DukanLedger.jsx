import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building, User, Phone, MapPin, Search, ChevronRight, ArrowLeft, Plus, ClipboardList, Calculator, DollarSign, FileText
} from 'lucide-react';
import api from '../../services/api';
import { useLoader } from '../../context/LoaderContext';
import { useNotification } from '../../context/NotificationContext';
import { pdfService } from '../../services/pdfService';

function DukanLedger() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { showLoader, hideLoader } = useLoader();
  const { showSuccess, showError } = useNotification();
  
  const [dukanInfo, setDukanInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [mills, setMills] = useState([]);
  const [allMarkos, setAllMarkos] = useState([]);
  const [markosContext, setMarkosContext] = useState([]);
  
  const [taxResult, setTaxResult] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const [formData, setFormData] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
    millNo: '',
    markoNo: '',
    quantity: '',
    vigat: ''
  });

  // Client-side search and filters
  const [searchTerm, setSearchTerm] = useState('');

  const handleExportPdf = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      showLoader(t('billingPdf.exportingPdf') || 'Exporting PDF...');
      
      const blobData = await pdfService.exportLedger('dukan', id, i18n.language);
      
      const blob = new Blob([blobData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dukan_ledger_${id}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      hideLoader();
      showSuccess(
        t('billingPdf.successExport') || 'PDF Exported Successfully',
        'Your PDF ledger has been generated and downloaded.'
      );
    } catch (err) {
      console.error(err);
      hideLoader();
      showError(
        t('billingPdf.errorExport') || 'Failed to Export PDF',
        err.response?.data?.message || 'An error occurred while generating the PDF.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchDukanInfo();
    fetchTransactions();
    fetchMills();
    fetchAllMarkos();
  }, [id, i18n.language]);

  useEffect(() => {
    if (formData.millNo && allMarkos.length > 0) {
      setMarkosContext(allMarkos.filter(m => m.millNo === parseInt(formData.millNo)));
    } else {
      setMarkosContext([]);
    }
  }, [formData.millNo, allMarkos]);

  const fetchDukanInfo = async () => {
    try {
      const res = await api.get(`/dukan/${id}?lang=${i18n.language}`);
      setDukanInfo(res.data);
    } catch(err) { console.error(err); }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get(`/LedgerTransaction/dukan/${id}?lang=${i18n.language}`);
      setTransactions(res.data || []);
    } catch(err) { console.error(err); }
  };

  const fetchMills = async () => {
    try {
      const res = await api.get(`/mill?page=1&pageSize=1000&lang=${i18n.language}`);
      setMills(res.data.data || []);
    } catch(err) { console.error(err); }
  };

  const fetchAllMarkos = async () => {
    try {
      const res = await api.get(`/marko?page=1&pageSize=1000&lang=${i18n.language}`);
      setAllMarkos(res.data.data || []);
    } catch(err) { console.error(err); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'millNo') updated.markoNo = ''; // reset marko if mill changes
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      showLoader('Adding ledger entry...');
      await api.post('/LedgerTransaction', {
        transactionDate: formData.transactionDate,
        millNo: parseInt(formData.millNo),
        dukanNo: parseInt(id),
        markoNo: parseInt(formData.markoNo),
        quantity: parseFloat(formData.quantity),
        vigat: formData.vigat,
        inputLanguage: i18n.language === 'gu' ? 'guj' : i18n.language
      });

      hideLoader();
      showSuccess('Transaction Created Successfully', 'Ledger entry has been saved.');

      fetchTransactions();
      setFormData(prev => ({ ...prev, quantity: '', vigat: '', millNo: '', markoNo: '' }));
      setTaxResult(null); // reset calculated tax
    } catch(err) { 
      console.error(err);
      hideLoader();
      showError('Transaction Creation Failed', err.response?.data?.message || 'Unable to create ledger transaction.');
    }
  };

  const handleCalculateTax = () => {
    try {
      showLoader('Calculating total tax...');
      const totalQty = filteredTransactions.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      const taxInfo = Number(dukanInfo?.dukanTaxInfo) || 0;
      const calculated = totalQty * taxInfo;

      setTimeout(() => {
        setTaxResult(calculated);
        hideLoader();
        showSuccess('Tax Calculated', 'Total tax calculation is complete.');

        Swal.fire({
          icon: 'info',
          title: 'Tax Calculated',
          text: `Total tax for ${totalQty} units at rate of ${taxInfo} is ${calculated.toFixed(2)}`,
          confirmButtonColor: '#2563EB',
          background: 'var(--color-bg-lighter)',
          color: 'var(--color-text-primary)'
        });
      }, 600);
    } catch (err) {
      console.error(err);
      hideLoader();
      showError('Calculation Failed', 'Unable to compute tax rate.');
    }
  };

  // Client-side filtering logic
  const filteredTransactions = transactions.filter(item => {
    const matchesSearch = !searchTerm || 
      item.millName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.markoName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vigat?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalQuantity = filteredTransactions.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

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
            <span>🏪</span>
            <span>{dukanInfo ? `${dukanInfo.dukanName} - Ledger` : 'Loading Ledger...'}</span>
          </h2>
          <p className="text-text-muted text-xs sm:text-sm font-medium mt-1">
            Dukan Owner: {dukanInfo?.ownerName || 'N/A'} | Phone: {dukanInfo?.ownerPhoneNo || 'N/A'}
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start">
          <button 
            onClick={handleExportPdf}
            disabled={isExporting}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
          >
            <FileText className="w-4 h-4" />
            {isExporting ? t('billingPdf.exportingPdf') : t('billingPdf.exportPdf')}
          </button>
          <button 
            onClick={() => navigate('/dukan-list')}
            className="px-4 py-2.5 bg-bg-darker hover:bg-bg-base border border-border-base text-xs font-bold text-text-secondary hover:text-text-primary transition flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Entries Count</p>
            <p className="text-xl font-black text-text-primary">{filteredTransactions.length}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Filtered Qty</p>
            <p className="text-xl font-black text-text-primary">{totalQuantity}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Tax Rate (Per Qty)</p>
            <p className="text-xl font-black text-text-primary">{dukanInfo?.dukanTaxInfo || 0}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Location Info</p>
            <p className="text-xs font-bold text-text-primary truncate max-w-[130px]" title={dukanInfo?.location}>
              {dukanInfo?.location || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Modern Transaction Entry Form Card */}
      <div className="glass-card rounded-3xl p-6 border border-border-base">
        <h3 className="text-sm font-bold text-text-primary border-b border-border-base/60 pb-3 flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-blue-500" />
          Add New Ledger Entry
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div>
            <label className="text-xs font-semibold text-text-secondary">Date *</label>
            <input 
              required 
              type="date" 
              name="transactionDate" 
              value={formData.transactionDate} 
              onChange={handleInputChange} 
              className="w-full bg-bg-base border border-border-base rounded-xl p-2.5 text-xs text-text-primary mt-1 focus:outline-none focus:border-blue-500" 
            />
          </div>
          <div className="lg:col-span-2">
            <label className="text-xs font-semibold text-text-secondary">Party Name (Mill) *</label>
            <select 
              required 
              name="millNo" 
              value={formData.millNo} 
              onChange={handleInputChange} 
              className="w-full bg-bg-base border border-border-base rounded-xl p-2.5 text-xs text-text-secondary mt-1 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Select Mill --</option>
              {mills.map(m => <option key={m.millNo} value={m.millNo}>{m.millName}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary">Marko *</label>
            <select 
              required 
              name="markoNo" 
              value={formData.markoNo} 
              onChange={handleInputChange} 
              className="w-full bg-bg-base border border-border-base rounded-xl p-2.5 text-xs text-text-secondary mt-1 focus:outline-none focus:border-blue-500"
              disabled={!formData.millNo}
            >
              <option value="">-- Select Marko --</option>
              {markosContext.map(m => <option key={m.markoNo} value={m.markoNo}>{m.markoName}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary">Quantity *</label>
            <input 
              required 
              type="number" 
              step="any" 
              name="quantity" 
              value={formData.quantity} 
              onChange={handleInputChange} 
              className="w-full bg-bg-base border border-border-base rounded-xl p-2.5 text-xs text-text-primary mt-1 focus:outline-none focus:border-blue-500" 
              placeholder="Qty" 
            />
          </div>
          <div className="lg:col-span-2">
            <label className="text-xs font-semibold text-text-secondary">Vigat</label>
            <input 
              name="vigat" 
              value={formData.vigat} 
              onChange={handleInputChange} 
              className="w-full bg-bg-base border border-border-base rounded-xl p-2.5 text-xs text-text-primary mt-1 focus:outline-none focus:border-blue-500" 
              placeholder="Remarks/Details" 
            />
          </div>
          <div className="lg:col-span-1">
            <button 
              type="submit" 
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition cursor-pointer"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>

      {/* Filters and Search Panel for Transaction Ledger */}
      <div className="glass-card rounded-2xl p-4 border border-border-base flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search transactions by mill, marko, vigat..." 
            className="w-full bg-bg-base/60 border border-border-base rounded-xl py-2 pl-9 pr-4 text-xs text-text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-text-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Transaction Grid */}
      <div className="hidden md:block overflow-hidden bg-bg-lighter/30 border border-border-base rounded-3xl shadow-xl">
        <table className="min-w-full divide-y divide-border-base text-left">
          <thead className="bg-bg-base/40">
            <tr>
              <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Date</th>
              <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Party Name (Mill)</th>
              <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider">Marko</th>
              <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Quantity</th>
              <th className="px-6 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider w-1/3">Vigat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-base bg-transparent text-sm">
            {filteredTransactions.map(item => (
              <tr key={item.transactionId} className="hover:bg-bg-darker/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-text-primary font-medium">
                  {new Date(item.transactionDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-emerald-600 dark:text-emerald-400 font-semibold">{item.millName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-text-secondary">{item.markoName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-text-primary text-right font-bold">{item.quantity}</td>
                <td className="px-6 py-4 text-text-muted break-words max-w-xs">{item.vigat}</td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-sm text-text-muted font-medium">No transactions recorded.</td>
              </tr>
            )}
          </tbody>
          {filteredTransactions.length > 0 && (
            <tfoot className="bg-bg-base/40 font-semibold border-t border-border-base">
              <tr>
                <td colSpan="3" className="px-6 py-4 text-right text-xs font-bold text-text-muted uppercase tracking-wider">Total Quantity:</td>
                <td className="px-6 py-4 text-right text-sm font-black text-text-primary">{totalQuantity}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Mobile Transaction Card List */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredTransactions.map(item => (
          <div key={item.transactionId} className="glass-card rounded-2xl p-4 border border-border-base space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted font-medium">{new Date(item.transactionDate).toLocaleDateString()}</span>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold rounded-full">
                {item.millName}
              </span>
            </div>
            
            <div className="flex justify-between items-end pt-1">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Marko</p>
                <p className="text-xs font-semibold text-text-secondary mt-0.5">{item.markoName}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Quantity</p>
                <p className="text-sm font-black text-text-primary mt-0.5">{item.quantity}</p>
              </div>
            </div>

            {item.vigat && (
              <div className="pt-2 border-t border-border-base/60 text-xs">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Vigat</p>
                <p className="text-text-secondary leading-normal mt-0.5">{item.vigat}</p>
              </div>
            )}
          </div>
        ))}
        {filteredTransactions.length === 0 && (
          <div className="p-6 text-center text-text-muted font-medium bg-bg-darker/10 border border-border-base rounded-2xl">
            No transactions recorded.
          </div>
        )}
      </div>

      {/* Tax Calculation result panel */}
      {filteredTransactions.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-border-base mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="mb-2 sm:mb-0">
            <h4 className="text-sm font-bold text-text-primary">Tax Calculation</h4>
            <p className="text-xs text-text-muted mt-1">Total Qty: {totalQuantity} &times; Dukan Tax: {dukanInfo?.dukanTaxInfo || 0}</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <button onClick={handleCalculateTax} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition cursor-pointer">Calculate Result</button>
            {taxResult !== null && (
              <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl font-bold text-lg border border-emerald-500/20 flex items-center">
                Total: {taxResult.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default DukanLedger;
