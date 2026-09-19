import React, { useState } from 'react';
import { Registration } from '../../types';
import { FullScreenHeader } from '../common/FullScreenHeader';
import { MembershipCardModal } from './MembershipCardModal';
import { 
  UserCheck, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Trash2, 
  Printer, 
  MessageCircle, 
  Share2,
  ExternalLink,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

interface AdminMemberDetailScreenProps {
  registration: Registration;
  onBack: () => void;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isUrdu: boolean;
}

export const AdminMemberDetailScreen: React.FC<AdminMemberDetailScreenProps> = ({
  registration,
  onBack,
  onUpdateStatus,
  onDelete,
  isUrdu,
}) => {
  const [showCardModal, setShowCardModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const regId = registration.id || (registration as any)._id || '';
  const currentStatus = registration.status || 'new';

  const handleStatusChange = async (newStatus: string) => {
    if (!regId) return;
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(regId, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!regId) return;
    const confirmMsg = isUrdu
      ? 'کیا آپ واقعی اس ممبرشپ رجسٹریشن کو مستقل طور پر حذف کرنا چاہتے ہیں؟'
      : 'Are you sure you want to permanently delete this member registration?';
    if (window.confirm(confirmMsg)) {
      setIsDeleting(true);
      try {
        await onDelete(regId);
        onBack();
      } catch (err) {
        console.error('Failed to delete registration:', err);
        setIsDeleting(false);
      }
    }
  };

  const cleanPhone = (registration.whatsapp || '').replace(/[^0-9]/g, '');
  const whatsAppUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone}` : null;

  return (
    <div className="fixed inset-0 z-50 bg-[#FBF9F4] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
      {/* Full Screen Header */}
      <FullScreenHeader
        title={registration.fullNameEn || registration.fullName || 'Member Profile'}
        subtitle={
          registration.fatherNameEn || registration.fatherName
            ? `${isUrdu ? 'ولدیت: ' : 'S/O: '}${registration.fatherNameEn || registration.fatherName}`
            : (isUrdu ? 'مکمل ممبر پروفائل و کوائف' : 'Official Member Application Dossier')
        }
        badge={registration.cardId || (isUrdu ? 'درخواست گزار' : 'Applicant')}
        icon={<UserCheck className="w-4 h-4 text-amber-300" />}
        onBack={onBack}
        rightActions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCardModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#AD7A28] hover:bg-[#8A5F19] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isUrdu ? 'آفیشل کارڈ' : 'Member Card'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all border border-white/10 cursor-pointer hidden md:flex items-center gap-1"
              title="Print Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Main Full-Screen Body Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Back Link Breadcrumb */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#AD7A28]" />
          <span>{isUrdu ? 'تمام رجسٹریشنز پر واپس جائیں' : 'Back to All Registrations'}</span>
        </button>

        {/* 1. Hero Dossier Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Photo & Names */}
            <div className="flex items-start sm:items-center gap-5">
              <div className="relative shrink-0">
                {registration.photoData ? (
                  <img
                    src={registration.photoData}
                    alt={registration.fullName}
                    className="w-24 h-28 sm:w-28 sm:h-32 object-cover rounded-2xl border-2 border-[#AD7A28]/40 shadow-sm bg-slate-100"
                  />
                ) : (
                  <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-[#16232F] text-amber-300 flex flex-col items-center justify-center font-bold border-2 border-[#AD7A28]/30">
                    <span className="text-3xl font-black">
                      {(registration.fullName || 'M')[0]?.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono">
                      No Photo
                    </span>
                  </div>
                )}
                <span className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs border ${
                  currentStatus === 'approved'
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : currentStatus === 'rejected'
                    ? 'bg-red-500 text-white border-red-400'
                    : 'bg-amber-500 text-white border-amber-400'
                }`}>
                  {currentStatus === 'approved' ? (isUrdu ? 'منظور شدہ' : 'Approved') :
                   currentStatus === 'rejected' ? (isUrdu ? 'مسترد' : 'Rejected') :
                   (isUrdu ? 'زیر جائزہ' : 'Pending')}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {registration.cardId && (
                    <span className="px-2.5 py-0.5 rounded-md bg-[#16232F] text-amber-300 font-mono text-xs font-bold">
                      {registration.cardId}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold">
                    {registration.membershipTypeEn || registration.membershipType || 'General Member'}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-[#16232F] tracking-tight">
                  {registration.fullNameEn || registration.fullName}
                </h1>
                {registration.fullNameUr && (
                  <p className="text-base font-bold text-[#AD7A28] font-urdu mt-0.5">
                    {registration.fullNameUr}
                  </p>
                )}

                <div className="text-xs text-slate-500 mt-1.5 space-y-0.5">
                  <p>
                    <span className="font-semibold text-slate-700">{isUrdu ? 'ولدیت: ' : 'Father Name: '}</span>
                    {registration.fatherNameEn || registration.fatherName || '—'}
                    {registration.fatherNameUr ? ` (${registration.fatherNameUr})` : ''}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">{isUrdu ? 'شناختی کارڈ: ' : 'CNIC: '}</span>
                    <span className="font-mono font-bold text-slate-800">{registration.cnic || '—'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Status Updates */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-2.5 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isUrdu ? 'درخواست کی حیثیت تبدیل کریں' : 'Update Status'}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUpdatingStatus || currentStatus === 'approved'}
                  onClick={() => handleStatusChange('approved')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentStatus === 'approved'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'منظور کریں' : 'Approve'}</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdatingStatus || currentStatus === 'new'}
                  onClick={() => handleStatusChange('new')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentStatus === 'new'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'پینڈنگ' : 'Pending'}</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdatingStatus || currentStatus === 'rejected'}
                  onClick={() => handleStatusChange('rejected')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentStatus === 'rejected'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'مسترد' : 'Reject'}</span>
                </button>
              </div>

              {/* Direct Communication Buttons */}
              <div className="flex items-center gap-2 mt-1">
                {whatsAppUrl && (
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {registration.whatsapp && (
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'کال' : 'Call'}</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 2. Structured Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Identification & Personal Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#16232F] flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <UserCheck className="w-4 h-4 text-[#AD7A28]" />
              <span>{isUrdu ? 'ذاتی و شناختی کوائف' : 'Personal & Demographic Info'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">{isUrdu ? 'برادری / ذات' : 'Caste'}</span>
                <span className="font-bold text-slate-800 font-urdu text-sm">
                  {registration.caste || 'آرائیں'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">{isUrdu ? 'جنس' : 'Gender'}</span>
                <span className="font-semibold text-slate-800">
                  {registration.genderEn || registration.gender || '—'}
                  {registration.genderUr ? ` (${registration.genderUr})` : ''}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">{isUrdu ? 'تاریخ پیدائش' : 'Date of Birth'}</span>
                <span className="font-mono font-semibold text-slate-800">
                  {registration.dob || '—'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">{isUrdu ? 'ممبرشپ کی قسم' : 'Membership Category'}</span>
                <span className="font-semibold text-slate-800">
                  {registration.membershipTypeEn || registration.membershipType || 'General Member'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">{isUrdu ? 'شناختی کارڈ (CNIC)' : 'CNIC Number'}</span>
                <span className="font-mono font-bold text-slate-800">
                  {registration.cnic || '—'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">{isUrdu ? 'آفیشل کارڈ نمبر' : 'Card ID'}</span>
                <span className="font-mono font-bold text-[#AD7A28]">
                  {registration.cardId || (isUrdu ? 'جاری نہیں ہوا' : 'Not Issued Yet')}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Residential Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#16232F] flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Phone className="w-4 h-4 text-[#AD7A28]" />
              <span>{isUrdu ? 'رابطہ اور رہائش' : 'Contact & Residence'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">{isUrdu ? 'واٹس ایپ نمبر' : 'WhatsApp'}</span>
                <span className="font-mono font-bold text-slate-800">
                  {registration.whatsapp || '—'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">{isUrdu ? 'ای میل ایڈریس' : 'Email Address'}</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {registration.email || '—'}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">{isUrdu ? 'رہائشی حیثیت' : 'Residential Status'}</span>
                <span className="font-semibold text-slate-800">
                  {registration.residentialStatusEn || registration.residentialStatus || 'Resident (Pakistan)'}
                </span>
              </div>
            </div>
          </div>

          {/* Geographic Location & Address */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-[#16232F] flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <MapPin className="w-4 h-4 text-[#AD7A28]" />
              <span>{isUrdu ? 'علاقائی اور جغرافیائی پتہ' : 'Geographic & Residential Address'}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">{isUrdu ? 'صوبہ' : 'Province'}</span>
                <span className="font-semibold text-slate-800">
                  {registration.provinceEn || registration.province || registration.state || 'Khyber Pakhtunkhwa'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">{isUrdu ? 'ضلع' : 'District'}</span>
                <span className="font-semibold text-slate-800">
                  {registration.districtEn || registration.district || registration.city || 'Bannu'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">{isUrdu ? 'تحصیل' : 'Tehsil'}</span>
                <span className="font-semibold text-slate-800">
                  {registration.tehsilEn || registration.tehsil || 'Bannu'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">{isUrdu ? 'ملک' : 'Country'}</span>
                <span className="font-semibold text-slate-800">
                  {registration.countryEn || registration.country || 'Pakistan'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
              <span className="text-slate-400 block text-[11px] mb-1">{isUrdu ? 'مکمل پتہ / محلہ' : 'Full Village / Mohallah / Street Address'}</span>
              <p className="font-medium text-slate-800">
                {[
                  registration.villageEn || registration.village,
                  registration.streetEn || registration.street,
                  registration.tehsilEn || registration.tehsil,
                  registration.districtEn || registration.district || registration.city,
                  registration.provinceEn || registration.province
                ].filter(Boolean).join(', ') || (isUrdu ? 'کوئی پتہ درج نہیں کیا گیا' : 'No address provided')}
              </p>
            </div>
          </div>

          {/* Education & Occupation */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-[#16232F] flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <GraduationCap className="w-4 h-4 text-[#AD7A28]" />
              <span>{isUrdu ? 'تعلیم اور پیشہ ورانہ تفصیلات' : 'Education, Profession & Motivation'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">{isUrdu ? 'تعلیمی قابلیت' : 'Educational Qualification'}</span>
                <span className="font-semibold text-slate-800">
                  {registration.educationEn || registration.education || '—'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">{isUrdu ? 'پیشہ / کاروبار / ملازمت' : 'Profession / Work'}</span>
                <span className="font-semibold text-slate-800">
                  {registration.workEn || registration.work || '—'}
                </span>
              </div>

              {registration.reason && (
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">{isUrdu ? 'شمولیت کا مقصد' : 'Reason for Joining'}</span>
                  <p className="bg-slate-50 p-3 rounded-xl text-slate-700 font-normal mt-0.5">
                    {registration.reason}
                  </p>
                </div>
              )}

              {registration.affiliated && (
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">{isUrdu ? 'دیگر وابستگیاں' : 'Affiliations'}</span>
                  <p className="bg-slate-50 p-3 rounded-xl text-slate-700 font-normal mt-0.5">
                    {registration.affiliated}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* 3. Bottom Toolbar & Danger Zone */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            <span>{isUrdu ? 'درخواست جمع کرنے کی تاریخ: ' : 'Application Date: '}</span>
            <span className="font-mono font-semibold text-slate-700">
              {registration.submittedAt ? new Date(registration.submittedAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowCardModal(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#AD7A28] hover:bg-[#8A5F19] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isUrdu ? 'آفیشل ممبرشپ کارڈ جاری کریں' : 'Issue Official Digital Card'}</span>
            </button>

            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-all cursor-pointer"
              title="Delete Registration"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isUrdu ? 'حذف کریں' : 'Delete'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Official Membership Card Modal */}
      {showCardModal && (
        <MembershipCardModal
          registration={registration}
          onClose={() => setShowCardModal(false)}
        />
      )}
    </div>
  );
};
