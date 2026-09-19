import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { compressImage } from '../services/firebase';
import { Registration } from '../types';
import { MembershipCardModal } from './admin/MembershipCardModal';
import { processRegistrationTranslations } from '../utils/urduTransliterator';
import { checkRateLimit, sanitizeText } from '../utils/security';
import confetti from 'canvas-confetti';
import { 
  X, 
  User, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  MapPin
} from 'lucide-react';
import { FullScreenHeader } from './common/FullScreenHeader';
import {
  PAKISTAN_ADMIN_HIERARCHY,
  getDistrictsForProvince,
  getTehsilsForDistrict
} from '../data/pakistanHierarchy';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MembershipModal: React.FC<MembershipModalProps> = ({ isOpen, onClose }) => {
  const { t, isUrdu } = useLanguage();
  const { registerMember } = useData();

  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    caste: 'آرائیں',
    gender: 'Male',
    membershipType: 'General Member',
    cnic: '',
    dob: '',
    email: '',
    whatsapp: '',
    residentialStatus: 'Resident (Pakistan)',
    affiliated: '',
    education: "Bachelor's Degree",
    work: '',
    reason: '',
    province: 'Khyber Pakhtunkhwa',
    district: 'Bannu',
    tehsil: 'Bannu',
    village: '',
    street: '',
    city: 'Bannu',
    state: 'Khyber Pakhtunkhwa',
    country: 'Pakistan',
  });

  const [photoData, setPhotoData] = useState<string>('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);
  const [submittedRegistration, setSubmittedRegistration] = useState<Registration | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenCardModal = () => {
    setShowCardModal(true);
    window.history.pushState({ cardModal: true }, '', '#card');
  };

  const handleCloseCardModal = () => {
    setShowCardModal(false);
    if (window.location.hash.includes('#card')) {
      window.history.back();
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.hash.includes('#card')) {
        setShowCardModal(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCardModal) {
          handleCloseCardModal();
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showCardModal, onClose]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const availableDistricts = useMemo(() => {
    return getDistrictsForProvince(formData.province);
  }, [formData.province]);

  const availableTehsils = useMemo(() => {
    return getTehsilsForDistrict(formData.province, formData.district);
  }, [formData.province, formData.district]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provName = e.target.value;
    const districts = getDistrictsForProvince(provName);
    const firstDistrict = districts[0]?.name || '';
    const tehsils = firstDistrict ? getTehsilsForDistrict(provName, firstDistrict) : [];
    const firstTehsil = tehsils[0]?.name || '';

    setFormData(prev => ({
      ...prev,
      province: provName,
      district: firstDistrict,
      tehsil: firstTehsil,
      city: firstDistrict || 'Bannu',
      state: provName,
    }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distName = e.target.value;
    const tehsils = getTehsilsForDistrict(formData.province, distName);
    const firstTehsil = tehsils[0]?.name || '';

    setFormData(prev => ({
      ...prev,
      district: distName,
      tehsil: firstTehsil,
      city: distName,
    }));
  };

  const handleTehsilChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tehsilName = e.target.value;
    setFormData(prev => ({
      ...prev,
      tehsil: tehsilName,
    }));
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingPhoto(true);
      const base64 = await compressImage(file, 600, 0.75);
      setPhotoData(base64);
    } catch (err: any) {
      console.error('Photo compression error:', err);
      setErrorMessage(t('errScreenshot', 'Could not process selected image. Please choose another.'));
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Anti-Bot Honeypot Defense: Silently block automated spam bots
    if (honeypot.trim()) {
      console.warn('Bot submission intercepted');
      setSubmittedRefId('REG-' + Date.now().toString().slice(-6));
      return;
    }

    // 2. Submission Rate Limiter: Guard against DOS / flood attacks (max 3 per minute)
    const rateCheck = checkRateLimit('reg_submit', 3, 60000);
    if (!rateCheck.allowed) {
      setErrorMessage(
        isUrdu
          ? `بہت زیادہ درخواستیں بھیجی گئی ہیں۔ براہ کرم ${rateCheck.retryAfterSec} سیکنڈ بعد دوبارہ کوشش کریں۔`
          : `Too many submissions. Please wait ${rateCheck.retryAfterSec} seconds before retrying.`
      );
      return;
    }

    if (!formData.fullName.trim()) {
      setErrorMessage(t('errDonorName', 'Please enter full name.'));
      return;
    }
    if (!formData.whatsapp.trim()) {
      setErrorMessage(t('errPhone', 'Please enter phone / WhatsApp number.'));
      return;
    }
    if (!formData.village.trim() && !formData.street.trim()) {
      setErrorMessage(
        isUrdu 
          ? 'براہ کرم اپنے گاؤں یا بستی کا نام درج کریں۔' 
          : 'Please enter your village address.'
      );
      return;
    }
    if (!agreed) {
      setErrorMessage(t('errAcceptTerms', 'Please accept the declaration terms before submitting.'));
      return;
    }

    try {
      setIsSubmitting(true);
      const villageClean = sanitizeText(formData.village.trim() || formData.street.trim());
      const rawSubmission = {
        ...formData,
        village: villageClean,
        street: villageClean, // Keep backward compatible
        city: formData.district || formData.city || 'Bannu',
        state: formData.province || formData.state || 'Khyber Pakhtunkhwa',
        country: 'Pakistan',
        photoData,
      };
      const processedSubmission = processRegistrationTranslations(rawSubmission);
      const docId = await registerMember(processedSubmission);

      setSubmittedRefId(docId);
      setSubmittedRegistration({
        ...processedSubmission,
        _id: docId,
      });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrorMessage(err.message || 'Failed to submit registration. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSubmittedRefId(null);
    setSubmittedRegistration(null);
    setShowCardModal(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FBF9F4] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
      {/* Full-Screen Sticky Header with Back Navigation */}
      <FullScreenHeader
        title={t('memFormTitle', 'Membership Registration')}
        subtitle={t('memFormSubtitle', 'Complete this form to apply for official membership.')}
        badge={t('siteName', 'ARAAIN BANNU')}
        icon={<User className="w-4 h-4" />}
        onBack={resetAndClose}
      />

      {/* Complete Screen Body Content */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          
          {submittedRefId ? (
            /* Success View */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-bold text-[#16232F] mb-2">
                {t('submissionSuccessTitle', 'Registration Submitted Successfully!')}
              </h3>
              
              <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto mb-6 leading-relaxed">
                {t('submissionSuccessDesc')}
              </p>

              <div className="p-4 rounded-xl bg-[#F8F4E8] border border-[#AD7A28]/20 text-center max-w-md mx-auto mb-6">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                  {t('appRefId', 'Application Reference ID')}
                </div>
                <div className="text-lg font-mono font-bold text-[#16232F] select-all">
                  {submittedRefId}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenCardModal}
                  className="app-btn-primary app-btn-full"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isUrdu ? 'شناختی کارڈ دیکھیں / پرنٹ کریں' : 'View & Print ID Card'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="app-btn-dark app-btn-full"
                >
                  {t('closeModal', 'Close Window')}
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Anti-Bot Honeypot */}
              <input
                type="text"
                name="user_confirm_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
                style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
              />
              
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Personal Details */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold text-[#AD7A28] tracking-wider border-b border-[#AD7A28]/20 pb-1">
                  {t('memStep1', '1. Personal Details')}
                </h4>

                {/* Row 1: Full Name & Father Name */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fieldFullName', 'Full Name')} *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder={t('phFullName', 'e.g. Muhammad Tahir')}
                      className="app-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fieldFatherName', 'Father / Guardian Name')} *
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      required
                      placeholder={t('phFatherName', 'e.g. Haji Meer Muhammad')}
                      className="app-input w-full"
                    />
                  </div>
                </div>

                {/* Row 2: Caste & Gender */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fieldCaste', 'Caste / Tribe (قومیت)')}
                    </label>
                    <input
                      type="text"
                      name="caste"
                      value={formData.caste}
                      onChange={handleChange}
                      placeholder={t('phCaste', 'e.g. Araain, Mian, Malik, Chaudhry')}
                      className="app-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fieldGender', 'Gender')}
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="app-input w-full bg-white"
                    >
                      <option value="Male">{t('fieldMale', 'Male')}</option>
                      <option value="Female">{t('fieldFemale', 'Female')}</option>
                      <option value="Other">{t('fieldOther', 'Other')}</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: DOB & CNIC */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fieldDob', 'Date of Birth')}
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="app-input w-full bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fieldCnic', 'CNIC / B-Form')}
                    </label>
                    <input
                      type="text"
                      name="cnic"
                      value={formData.cnic}
                      onChange={handleChange}
                      placeholder="11101-XXXXXXX-X"
                      className="app-input w-full font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Contact & Identity - 2 Fields per Row */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-[#AD7A28] tracking-wider border-b border-[#AD7A28]/20 pb-1">
                  {t('memStep2', '2. Contact & Identity')}
                </h4>

                {/* Row 1: WhatsApp & Email */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fieldWhatsapp', 'WhatsApp Number')} *
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                      placeholder="+92 300 1234567"
                      className="app-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fieldEmail', 'Email Address')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('phEmail', 'you@domain.com')}
                      className="app-input w-full"
                    />
                  </div>
                </div>

                {/* Row 2: Residential Status & Membership Type */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fieldResidentialStatus', 'Residential Status')}
                    </label>
                    <select
                      name="residentialStatus"
                      value={formData.residentialStatus}
                      onChange={handleChange}
                      className="app-input w-full bg-white"
                    >
                      <option value="Resident (Pakistan)">{t('optResident', 'Resident (Pakistan)')}</option>
                      <option value="Overseas Pakistani">{t('optOverseas', 'Overseas Pakistani')}</option>
                      <option value="Foreign National">{t('optForeign', 'Foreign National')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fieldMembershipType', 'Membership Type')}
                    </label>
                    <select
                      name="membershipType"
                      value={formData.membershipType}
                      onChange={handleChange}
                      className="app-input w-full bg-white"
                    >
                      <option value="General Member">{t('optGeneralMember', 'General Member')}</option>
                      <option value="Life Member">{t('optLifeMember', 'Life Member')}</option>
                      <option value="Youth Member">{t('optYouthMember', 'Youth Member')}</option>
                      <option value="Associate Member">{t('optAssociateMember', 'Associate Member')}</option>
                      <option value="Senior Member">{t('optSeniorMember', 'Senior Member')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Professional & Membership - 2 Fields per Row */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-[#AD7A28] tracking-wider border-b border-[#AD7A28]/20 pb-1">
                  {t('memStep3', '3. Professional & Membership')}
                </h4>

                {/* Row 1: Education & Occupation */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fieldEducation', 'Education')}
                    </label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className="app-input w-full bg-white"
                    >
                      <option value="Matriculation / O-Level">{t('optMetric', 'Matriculation / O-Level')}</option>
                      <option value="Intermediate / A-Level">{t('optIntermediate', 'Intermediate / A-Level')}</option>
                      <option value="Bachelor's Degree">{t('optBachelors', "Bachelor's Degree")}</option>
                      <option value="Master's Degree">{t('optMasters', "Master's Degree")}</option>
                      <option value="Doctorate (PhD)">{t('optDoctorate', 'Doctorate (PhD)')}</option>
                      <option value="Other / Vocational">{t('optOther', 'Other / Vocational')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fieldWork', 'Occupation / Profession')}
                    </label>
                    <input
                      type="text"
                      name="work"
                      value={formData.work}
                      onChange={handleChange}
                      placeholder={t('phWork', 'e.g. Teacher, Engineer, Businessman')}
                      className="app-input w-full"
                    />
                  </div>
                </div>

                {/* Row 2: Affiliated Organisation & Reason for Joining */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fieldAffiliated', 'Affiliated Organisation')}
                    </label>
                    <input
                      type="text"
                      name="affiliated"
                      value={formData.affiliated}
                      onChange={handleChange}
                      placeholder={t('phAffiliated', 'e.g. Araain Youth Bannu / None')}
                      className="app-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fieldReason', 'Reason for Joining')}
                    </label>
                    <input
                      type="text"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder={t('phReason', 'How you would like to contribute...')}
                      className="app-input w-full"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Residential Address & Photograph */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#AD7A28]/20 pb-1">
                  <h4 className="text-xs uppercase font-bold text-[#AD7A28] tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{isUrdu ? '4. پتہ کا انتخاب اور تصویر' : '4. Address Selection & Photo'}</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-[#AD7A28] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {isUrdu ? 'صرف گاؤں کا نام لکھیں' : 'Enter only village name'}
                  </span>
                </div>

                {/* Cascading Administrative Dropdowns in strictly 2-fields-per-row format */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-3">
                  {/* Address Row 1: Province & District */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {/* Province Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isUrdu ? 'صوبہ منتخب کریں' : 'Select Province'}
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleProvinceChange}
                        className="app-input w-full font-medium"
                      >
                        {PAKISTAN_ADMIN_HIERARCHY.map(prov => (
                          <option key={prov.code} value={prov.name}>
                            {isUrdu ? `${prov.nameUr} (${prov.name})` : `${prov.name} (${prov.nameUr})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* District Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isUrdu ? 'ضلع منتخب کریں' : 'Select District'}
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleDistrictChange}
                        className="app-input w-full font-medium"
                      >
                        {availableDistricts.map(dist => (
                          <option key={dist.code} value={dist.name}>
                            {isUrdu ? `${dist.nameUr || dist.name} (${dist.name})` : `${dist.name} (${dist.nameUr || ''})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Address Row 2: Tehsil & Village Address */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1 border-t border-amber-200/40">
                    {/* Tehsil Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isUrdu ? 'تحصیل منتخب کریں' : 'Select Tehsil'}
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <select
                        name="tehsil"
                        value={formData.tehsil}
                        onChange={handleTehsilChange}
                        className="app-input w-full font-medium"
                      >
                        {availableTehsils.map(teh => (
                          <option key={teh.code} value={teh.name}>
                            {isUrdu ? `${teh.nameUr || teh.name} (${teh.name})` : `${teh.name} (${teh.nameUr || ''})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Village Address */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-800">
                          {isUrdu ? 'گاؤں کا پتہ (Village)' : 'Village Address'}
                          <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <span className="text-[10px] text-[#AD7A28] font-medium truncate max-w-[150px]">
                          {isUrdu ? 'صرف گاؤں کا نام لکھیں' : 'Only village name'}
                        </span>
                      </div>
                      <input
                        type="text"
                        name="village"
                        required
                        value={formData.village}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            village: val,
                            street: val,
                          }));
                        }}
                        placeholder={isUrdu 
                          ? 'صرف اپنے گاؤں یا محلے کا نام (مثلاً: کوٹکہ فتح خان)' 
                          : 'Village / mohallah name (e.g. Kotka Fateh Khan)'}
                        className="app-input w-full bg-white font-medium shadow-sm"
                      />
                    </div>
                  </div>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {isUrdu ? 'کارڈ پر پرنٹ ہونے والا مکمل پتہ:' : 'Full Address on ID Card:'}
                      </span>
                      <span className="text-[#AD7A28] font-medium">
                        {formData.village ? formData.village : (isUrdu ? '[گاؤں کا نام]' : '[Village]')}, {formData.tehsil ? `${formData.tehsil}, ` : ''}{formData.district}, {formData.province}
                      </span>
                    </div>
                  </div>

                {/* Photo Upload Container */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    {t('fieldPhoto', 'Profile Photograph')}
                  </label>
                  
                  <div className="flex items-center gap-4">
                    {photoData ? (
                      <div className="relative">
                        <img
                          src={photoData}
                          alt="Applicant"
                          className="w-16 h-20 rounded-xl object-cover border-2 border-[#AD7A28]"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotoData('')}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-20 rounded-xl bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                        <User className="w-8 h-8" />
                      </div>
                    )}

                    <div className="flex-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCompressingPhoto}
                        className="app-btn-secondary app-btn-sm"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#AD7A28]" />
                        <span>{photoData ? t('changePhoto', 'Change Photo') : t('uploadPhoto', 'Upload Photograph')}</span>
                      </button>
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                        {t('photoHint', 'Upload a clear passport-style photo (JPEG/PNG, auto-compressed).')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#AD7A28] focus:ring-[#AD7A28]"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    {t('agreeTerms')}
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="app-btn-success app-btn-lg app-btn-full"
              >
                {isSubmitting ? t('btnSubmitting', 'Submitting...') : t('btnSubmitApplication', 'Submit Application')}
              </button>

            </form>
          )}

        </div>
      </div>

      {/* Official Membership ID Card Modal */}
      {showCardModal && submittedRegistration && (
        <MembershipCardModal
          registration={submittedRegistration}
          onClose={handleCloseCardModal}
        />
      )}
    </div>
  );
};
