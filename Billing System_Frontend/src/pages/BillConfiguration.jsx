import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, Image, QrCode, FileText, Camera, Save, HelpCircle, Upload
} from 'lucide-react';
import { billConfigurationService } from '../services/billConfigurationService';
import { useLoader } from '../context/LoaderContext';
import { useNotification } from '../context/NotificationContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function BillConfiguration() {
  const { t } = useTranslation();
  const { showLoader, hideLoader } = useLoader();
  const { showSuccess, showError } = useNotification();
  const { user: layoutUser } = useOutletContext();

  const leftFileInputRef = useRef(null);
  const rightFileInputRef = useRef(null);
  const qrFileInputRef = useRef(null);

  const [config, setConfig] = useState({
    billConfigurationId: '',
    gstNumber: '',
    bankAccountNumber: '',
    panNumber: '',
    leftImagePath: '',
    rightImagePath: '',
    qrcodeImagePath: ''
  });

  const [errors, setErrors] = useState({
    gstNumber: '',
    bankAccountNumber: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      showLoader(t('Loading settings...'));
      const data = await billConfigurationService.getConfiguration();
      if (data) {
        setConfig({
          billConfigurationId: data.billConfigurationId || '',
          gstNumber: data.gstNumber || '',
          bankAccountNumber: data.bankAccountNumber || '',
          panNumber: data.panNumber || '',
          leftImagePath: data.leftImagePath || '',
          rightImagePath: data.rightImagePath || '',
          qrcodeImagePath: data.qrcodeImagePath || ''
        });
      }
    } catch (err) {
      console.error(err);
      showError('Error', 'Failed to load bill configuration.');
    } finally {
      hideLoader();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateFile = (file) => {
    const allowedExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedExtensions.includes(file.type)) {
      showError(
        t('billConfiguration.errorFormat') || 'Please upload JPG, PNG or WEBP image.'
      );
      return false;
    }

    if (file.size > 1048576) { // 1 MB limit
      showError(
        t('billConfiguration.errorSizeLimit') || 'Maximum file size is 1 MB.'
      );
      return false;
    }

    return true;
  };

  const handleImageUpload = async (e, position) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    try {
      showLoader(t('Uploading image...'));
      const response = await billConfigurationService.uploadImage(file, position);
      if (response.status === 'success' && response.imagePath) {
        setConfig(prev => ({
          ...prev,
          [position === 'left' ? 'leftImagePath' : 'rightImagePath']: response.imagePath
        }));
        showSuccess(
          t('Image Uploaded'),
          t('Header image has been updated.')
        );
      }
    } catch (err) {
      console.error(err);
      showError('Upload Failed', err.response?.data || 'Failed to upload image.');
    } finally {
      hideLoader();
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    try {
      showLoader(t('Uploading QR Code...'));
      const response = await billConfigurationService.uploadQrCode(file);
      if (response.status === 'success' && response.imagePath) {
        setConfig(prev => ({ ...prev, qrcodeImagePath: response.imagePath }));
        showSuccess(
          t('QR Code Uploaded'),
          t('Payment QR Code has been updated.')
        );
      }
    } catch (err) {
      console.error(err);
      showError('Upload Failed', err.response?.data || 'Failed to upload QR Code.');
    } finally {
      hideLoader();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    let valid = true;
    const newErrors = { gstNumber: '', bankAccountNumber: '' };

    if (!config.gstNumber.trim()) {
      newErrors.gstNumber = t('billConfiguration.errorGstRequired') || 'Please enter GST Number.';
      valid = false;
    }
    if (!config.bankAccountNumber.trim()) {
      newErrors.bankAccountNumber = t('billConfiguration.errorBankAccountRequired') || 'Please enter Bank Account Number.';
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    try {
      setIsSaving(true);
      showLoader(t('Saving config...'));
      const response = await billConfigurationService.saveConfiguration(config);
      if (response.status === 'success') {
        showSuccess(
          t('billConfiguration.successSave') || 'Bill Configuration Saved',
          t('billConfiguration.successSaveDetail') || 'Your bill settings have been updated successfully.'
        );
      }
    } catch (err) {
      console.error(err);
      showError('Save Failed', err.response?.data || 'Failed to save configuration.');
    } finally {
      setIsSaving(false);
      hideLoader();
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${API_BASE_URL}/billconfiguration/image/${path.split('/').slice(-2).join('/')}`;
  };

  const brokerName = layoutUser ? `${layoutUser.firstName || ''} ${layoutUser.lastName || ''}`.trim() : 'Broker System';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24 md:pb-12 relative">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3.5xl font-black text-text-primary tracking-tight flex items-center gap-2.5">
          <span>🧾</span>
          <span>{t('billConfiguration.title')}</span>
        </h2>
        <p className="text-text-muted text-xs sm:text-sm font-medium mt-1">
          {t('billConfiguration.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns - Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1 - Business Information */}
          <div className="glass-card rounded-3xl p-6 space-y-5">
            <h3 className="text-md font-bold text-text-primary border-b border-border-base/50 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary shrink-0" />
              <span>{t('billConfiguration.businessInfo')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="gstNumber">
                  {t('billConfiguration.gstNumber')} *
                </label>
                <input 
                  type="text" 
                  id="gstNumber"
                  name="gstNumber"
                  className={`input-field ${errors.gstNumber ? 'border-red-500' : ''}`}
                  value={config.gstNumber}
                  onChange={handleInputChange}
                  placeholder="Enter GST Number"
                />
                {errors.gstNumber && <p className="error-text text-red-500 text-xs mt-1 font-bold">{errors.gstNumber}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="bankAccountNumber">
                  {t('billConfiguration.bankAccountNumber')} *
                </label>
                <input 
                  type="text" 
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  className={`input-field ${errors.bankAccountNumber ? 'border-red-500' : ''}`}
                  value={config.bankAccountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Bank Account Number"
                />
                {errors.bankAccountNumber && <p className="error-text text-red-500 text-xs mt-1 font-bold">{errors.bankAccountNumber}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="panNumber">
                  {t('billConfiguration.panNumber')}
                </label>
                <input 
                  type="text" 
                  id="panNumber"
                  name="panNumber"
                  className="input-field"
                  value={config.panNumber}
                  onChange={handleInputChange}
                  placeholder="Enter PAN Number (Optional)"
                />
              </div>
            </div>
          </div>

          {/* Section 2 - Bill Header Images */}
          <div className="glass-card rounded-3xl p-6 space-y-5">
            <h3 className="text-md font-bold text-text-primary border-b border-border-base/50 pb-3 flex items-center gap-2">
              <Image className="w-5 h-5 text-primary shrink-0" />
              <span>{t('billConfiguration.billHeaderImages')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Religious Image */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                  {t('billConfiguration.leftReligiousImage')}
                </label>
                <div 
                  onClick={() => leftFileInputRef.current?.click()}
                  className="h-32 border-2 border-dashed border-border-base rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-bg-base/30 relative overflow-hidden"
                >
                  {config.leftImagePath ? (
                    <img 
                      src={getImageUrl(config.leftImagePath)} 
                      alt="Left Religious Preview" 
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="w-6 h-6 text-text-muted mx-auto mb-1.5" />
                      <span className="text-xs font-bold text-text-muted">{t('billConfiguration.uploadImage')}</span>
                    </div>
                  )}
                  {config.leftImagePath && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      <Camera className="w-4 h-4 mr-1.5" />
                      Change Image
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={leftFileInputRef} 
                  className="hidden" 
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) => handleImageUpload(e, 'left')}
                />
              </div>

              {/* Right Religious Image */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                  {t('billConfiguration.rightReligiousImage')}
                </label>
                <div 
                  onClick={() => rightFileInputRef.current?.click()}
                  className="h-32 border-2 border-dashed border-border-base rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-bg-base/30 relative overflow-hidden"
                >
                  {config.rightImagePath ? (
                    <img 
                      src={getImageUrl(config.rightImagePath)} 
                      alt="Right Religious Preview" 
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="w-6 h-6 text-text-muted mx-auto mb-1.5" />
                      <span className="text-xs font-bold text-text-muted">{t('billConfiguration.uploadImage')}</span>
                    </div>
                  )}
                  {config.rightImagePath && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      <Camera className="w-4 h-4 mr-1.5" />
                      Change Image
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={rightFileInputRef} 
                  className="hidden" 
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) => handleImageUpload(e, 'right')}
                />
              </div>
            </div>
          </div>

          {/* Section 3 - Payment QR Code */}
          <div className="glass-card rounded-3xl p-6 space-y-5">
            <h3 className="text-md font-bold text-text-primary border-b border-border-base/50 pb-3 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary shrink-0" />
              <span>{t('billConfiguration.paymentQrCode')}</span>
            </h3>

            <div className="max-w-xs space-y-3">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                UPI QR Code (Paytm/GPay/PhonePe)
              </label>
              <div 
                onClick={() => qrFileInputRef.current?.click()}
                className="h-44 border-2 border-dashed border-border-base rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-bg-base/30 relative overflow-hidden"
              >
                {config.qrcodeImagePath ? (
                  <img 
                    src={getImageUrl(config.qrcodeImagePath)} 
                    alt="Payment QR Code Preview" 
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
                    <span className="text-xs font-bold text-text-muted">{t('billConfiguration.uploadQrCode')}</span>
                  </div>
                )}
                {config.qrcodeImagePath && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                    <Camera className="w-4 h-4 mr-1.5" />
                    Change QR Code
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={qrFileInputRef} 
                className="hidden" 
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleQrUpload}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Live Preview & Save Buttons */}
        <div className="space-y-6">
          {/* Live Preview Card */}
          <div className="glass-card rounded-3xl p-6 space-y-5">
            <h3 className="text-md font-bold text-text-primary border-b border-border-base/50 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <span>{t('billConfiguration.billPreview')}</span>
            </h3>

            <div className="border border-border-base/70 rounded-2xl p-4 bg-white dark:bg-bg-darker/60 backdrop-blur-md text-slate-800 dark:text-slate-200 text-xs shadow-md">
              {/* Religious Header Row */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-border-base/50 mb-3 min-h-[50px]">
                <div className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-bg-base/30 rounded-lg overflow-hidden border border-border-base">
                  {config.leftImagePath ? (
                    <img src={getImageUrl(config.leftImagePath)} alt="Left Religious" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-slate-400 font-bold">🔱</span>
                  )}
                </div>
                <div className="text-center flex-1">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-primary select-none">{brokerName}</h4>
                  <p className="text-[10px] text-text-muted">Registered Broker Agent</p>
                </div>
                <div className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-bg-base/30 rounded-lg overflow-hidden border border-border-base">
                  {config.rightImagePath ? (
                    <img src={getImageUrl(config.rightImagePath)} alt="Right Religious" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-slate-400 font-bold">🔱</span>
                  )}
                </div>
              </div>

              {/* Business Info Grid */}
              <div className="space-y-1.5 font-medium">
                <div className="flex justify-between">
                  <span className="text-text-muted font-semibold">{t('billConfiguration.gstNoLabel')}:</span>
                  <span className="font-bold font-mono">{config.gstNumber || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-semibold">{t('billConfiguration.bankAcLabel')}:</span>
                  <span className="font-bold font-mono">{config.bankAccountNumber || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-semibold">{t('billConfiguration.panLabel')}:</span>
                  <span className="font-bold font-mono uppercase">{config.panNumber || '---'}</span>
                </div>
              </div>

              {/* QR Code Section */}
              {config.qrcodeImagePath && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-border-base/50 flex flex-col items-center gap-1.5 bg-bg-base/30 rounded-xl p-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Scan to Pay UPI</span>
                  <img src={getImageUrl(config.qrcodeImagePath)} alt="UPI QR Preview" className="w-16 h-16 object-contain" />
                </div>
              )}
            </div>
          </div>

          {/* Save Button Container (Desktop Only - hidden on mobile) */}
          <div className="hidden md:block">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4.5 h-4.5" />
              {isSaving ? t('billConfiguration.saving') : t('billConfiguration.saveConfiguration')}
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Save Button (Mobile viewports only - hidden on desktop <768px) */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-bg-base/80 backdrop-blur-md border-t border-border-base/60 z-30">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]"
        >
          <Save className="w-4.5 h-4.5" />
          {isSaving ? t('billConfiguration.saving') : t('billConfiguration.saveConfiguration')}
        </button>
      </div>
    </div>
  );
}

export default BillConfiguration;
