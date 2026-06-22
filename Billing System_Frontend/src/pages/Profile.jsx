import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Calendar, Globe, Shield, Camera, Save, ArrowRight, Upload
} from 'lucide-react';
import { profileService } from '../services/profileService';
import { useLoader } from '../context/LoaderContext';
import { useNotification } from '../context/NotificationContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Profile() {
  const { t, i18n } = useTranslation();
  const { showLoader, hideLoader } = useLoader();
  const { showSuccess, showError, showWarning } = useNotification();
  const { user: layoutUser, setUser: setLayoutUser } = useOutletContext();
  
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    mobileNumber: '',
    preferredLanguage: 'en',
    roleName: '',
    createdDate: '',
    userImagePath: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      showLoader(t('Loading Profile...'));
      const data = await profileService.getProfile();
      setProfile({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        username: data.username || '',
        email: data.email || '',
        mobileNumber: data.mobileNumber || '',
        preferredLanguage: data.preferredLanguage || 'en',
        roleName: data.roleName || 'User',
        createdDate: data.createdDate || '',
        userImagePath: data.userImagePath || ''
      });
      
      // Keep state in sync in localStorage/layoutUser
      const updatedUser = {
        ...layoutUser,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        role: data.roleName || 'User',
        userImagePath: data.userImagePath || ''
      };
      setLayoutUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update i18n language context if necessary
      if (data.preferredLanguage && i18n.language !== data.preferredLanguage) {
        i18n.changeLanguage(data.preferredLanguage);
      }
    } catch (err) {
      console.error(err);
      showError('Error', 'Failed to load profile details.');
    } finally {
      hideLoader();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const getInitials = () => {
    const f = profile.firstName?.charAt(0) || '';
    const l = profile.lastName?.charAt(0) || '';
    return (f + l).toUpperCase() || 'U';
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate Format
    const allowedExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedExtensions.includes(file.type)) {
      showError(
        t('profile.errorFormat') || 'Invalid image format. Only JPG, JPEG, PNG, and WEBP are accepted.'
      );
      return;
    }

    const fileSizeInBytes = file.size;
    const maxSizeInBytes = 1048576; // 1 MB
    const warningSizeInBytes = 512000; // 500 KB

    // Hard Limit (1 MB)
    if (fileSizeInBytes > maxSizeInBytes) {
      showError(
        t('profile.errorSizeLimit') || 'Image size exceeds the maximum limit of 1 MB.'
      );
      return;
    }

    // Warning Limit (500 KB to 1 MB)
    if (fileSizeInBytes > warningSizeInBytes) {
      showWarning(
        t('profile.errorSizeWarning') || 'Warning: Image size is between 500 KB and 1 MB.'
      );
    }

    try {
      setIsUploading(true);
      showLoader(t('profile.uploading') || 'Uploading photo...');
      
      const response = await profileService.uploadImage(file);
      
      if (response.status === 'success' || response.userImagePath) {
        const relativePath = response.userImagePath;
        setProfile(prev => ({ ...prev, userImagePath: relativePath }));
        
        // Sync layout context immediately
        const updatedUser = {
          ...layoutUser,
          userImagePath: relativePath
        };
        setLayoutUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        showSuccess(
          t('profile.successUpload') || 'Photo Uploaded Successfully',
          t('profile.successUploadDetail') || 'Your profile picture has been updated.'
        );
      }
    } catch (err) {
      console.error(err);
      showError('Upload Failed', err.response?.data || 'Failed to upload profile picture.');
    } finally {
      setIsUploading(false);
      hideLoader();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Field Validations
    if (!profile.firstName.trim()) {
      showError('Validation Error', 'First Name is required.');
      return;
    }
    if (!profile.lastName.trim()) {
      showError('Validation Error', 'Last Name is required.');
      return;
    }
    if (!profile.mobileNumber.trim()) {
      showError('Validation Error', 'Mobile Number is required.');
      return;
    }
    if (profile.mobileNumber.length !== 10 || !/^\d+$/.test(profile.mobileNumber)) {
      showError('Validation Error', 'Mobile number must be exactly 10 digits.');
      return;
    }

    try {
      setIsSaving(true);
      showLoader(t('profile.saving') || 'Saving changes...');
      
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        mobileNumber: profile.mobileNumber,
        preferredLanguage: profile.preferredLanguage
      };
      
      const response = await profileService.updateProfile(updateData);
      
      if (response.status === 'success') {
        // Sync context
        const updatedUser = {
          ...layoutUser,
          firstName: profile.firstName,
          lastName: profile.lastName,
          preferredLanguage: profile.preferredLanguage
        };
        setLayoutUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dynamic i18n update
        if (i18n.language !== profile.preferredLanguage) {
          i18n.changeLanguage(profile.preferredLanguage);
        }

        showSuccess(
          t('profile.successUpdate') || 'Profile Updated Successfully',
          t('profile.successUpdateDetail') || 'Your profile information has been saved.'
        );
      }
    } catch (err) {
      console.error(err);
      showError('Save Failed', err.response?.data || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
      hideLoader();
    }
  };

  // Avatar serving logic
  const getAvatarUrl = () => {
    if (!profile.userImagePath) return null;
    return `${API_BASE_URL}/profile/image/${profile.userImagePath.split('/').pop()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8 relative max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3.5xl font-black text-text-primary tracking-tight flex items-center gap-2.5">
          <span>👤</span>
          <span>{t('profile.title')}</span>
        </h2>
        <p className="text-text-muted text-xs sm:text-sm font-medium mt-1">
          {t('profile.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Photo & Read-only Meta */}
        <div className="glass-card rounded-3xl p-6 flex flex-col items-center gap-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-primary/20 hover:border-primary/50 transition-all duration-300 shadow-xl flex items-center justify-center bg-gradient-to-tr from-blue-600 to-purple-600">
              {getAvatarUrl() ? (
                <img 
                  src={getAvatarUrl()} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                  }}
                />
              ) : (
                <span className="text-4xl font-black text-white tracking-wide">
                  {getInitials()}
                </span>
              )}
            </div>
            
            {/* Camera Overlay */}
            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-all duration-300 gap-1 select-none">
              <Camera className="w-5 h-5" />
              <span>{t('profile.uploadPhoto')}</span>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
            />
          </div>

          <div className="w-full text-center space-y-1">
            <h3 className="text-lg font-bold text-text-primary">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-xs text-primary font-bold px-3 py-1 bg-primary/10 rounded-full inline-block">
              {profile.roleName}
            </p>
          </div>

          {/* Quick Info Box */}
          <div className="w-full border-t border-border-base/50 pt-5 space-y-4">
            <div className="flex items-center gap-3 text-xs font-semibold text-text-secondary">
              <User className="w-4 h-4 text-text-muted shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-0.5">{t('profile.username')}</p>
                <p className="truncate text-text-primary">{profile.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-text-secondary">
              <Mail className="w-4 h-4 text-text-muted shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-0.5">{t('profile.email')}</p>
                <p className="truncate text-text-primary">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-text-secondary">
              <Shield className="w-4 h-4 text-text-muted shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-0.5">{t('profile.roleName')}</p>
                <p className="truncate text-text-primary">{profile.roleName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-text-secondary">
              <Calendar className="w-4 h-4 text-text-muted shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-0.5">{t('profile.createdDate')}</p>
                <p className="truncate text-text-primary">{formatDate(profile.createdDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="glass-card rounded-3xl p-6 lg:col-span-2 space-y-6">
          <h3 className="text-md font-bold text-text-primary border-b border-border-base/50 pb-3 flex items-center gap-2">
            <span>⚙️</span>
            <span>Profile Settings</span>
          </h3>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="firstName">
                {t('profile.firstName')}
              </label>
              <input 
                type="text" 
                id="firstName"
                name="firstName"
                required
                className="input-field"
                value={profile.firstName}
                onChange={handleInputChange}
                placeholder="First name"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="lastName">
                {t('profile.lastName')}
              </label>
              <input 
                type="text" 
                id="lastName"
                name="lastName"
                required
                className="input-field"
                value={profile.lastName}
                onChange={handleInputChange}
                placeholder="Last name"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="mobileNumber">
                {t('profile.mobileNumber')}
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  id="mobileNumber"
                  name="mobileNumber"
                  required
                  maxLength={10}
                  className="input-field pl-12"
                  value={profile.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                />
                <span className="absolute left-4 top-[22px] text-xs font-bold text-text-muted select-none">+91</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block" htmlFor="preferredLanguage">
                {t('profile.preferredLanguage')}
              </label>
              <div className="relative mt-2">
                <select 
                  id="preferredLanguage"
                  name="preferredLanguage"
                  className="input-field appearance-none pr-10 cursor-pointer"
                  value={profile.preferredLanguage}
                  onChange={handleInputChange}
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="gu">ગુજરાતી</option>
                </select>
                <Globe className="w-4 h-4 text-text-muted absolute right-3 top-[17px] pointer-events-none" />
              </div>
            </div>

            {/* Read Only inputs in form as reference */}
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                {t('profile.username')} (Read-Only)
              </label>
              <input 
                type="text" 
                className="input-field bg-bg-darker/30 text-text-muted border-border-base/40 cursor-not-allowed select-none"
                value={profile.username}
                disabled
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                {t('profile.email')} (Read-Only)
              </label>
              <input 
                type="text" 
                className="input-field bg-bg-darker/30 text-text-muted border-border-base/40 cursor-not-allowed select-none"
                value={profile.email}
                disabled
              />
            </div>

            <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t border-border-base/50">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/15 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? t('profile.saving') : t('profile.saveChanges')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
