import React from 'react';
import { Registration } from '../../types';
import { FullScreenHeader } from '../common/FullScreenHeader';
import {
  UserRound,
  CheckCircle2,
  XCircle,
  IdCard,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  Calendar,
  Trash2,
} from 'lucide-react';

interface AdminMemberDetailProps {
  registration: Registration;
  isUrdu: boolean;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onOpenCard: () => void;
}

const Field: React.FC<{ label: string; value?: string | null; icon?: any }> = ({ label, value, icon: Icon }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-slate-100 last:border-0">
      {Icon && <Icon className="w-4 h-4 text-[#AD7A28] mt-0.5 shrink-0" />}
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
        <div className="text-sm text-[#16232F] font-medium break-words">{value}</div>
      </div>
    </div>
  );
};

export const AdminMemberDetail: React.FC<AdminMemberDetailProps> = ({
  registration: r,
  isUrdu,
  onBack,
  onApprove,
  onReject,
  onDelete,
  onOpenCard,
}) => {
  const status = r.status || 'new';
  const name = r.fullName || r.fullNameEn || '';
  const address = [r.village, r.tehsil, r.district, r.province || r.city, r.country].filter(Boolean).join(', ');

  return (
    <div className="fixed inset-0 z-[60] bg-[#FBF9F4] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
      <FullScreenHeader
        title={name || (isUrdu ? 'رکن کی تفصیل' : 'Member Detail')}
        subtitle={r.membershipType || ''}
        badge={isUrdu ? 'رجسٹریشن' : 'Registration'}
        icon={<UserRound className="w-4 h-4 text-amber-300" />}
        onBack={onBack}
      />

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Profile summary card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 flex items-center gap-4">
          {r.photoData ? (
            <img src={r.photoData} alt={name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              <UserRound className="w-7 h-7" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-[#16232F] truncate">{name}</h2>
            <p className="text-xs text-slate-500 truncate">{r.fatherName ? `S/D/O ${r.fatherName}` : ''}</p>
            <span
              className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                status === 'approved'
                  ? 'bg-emerald-50 text-emerald-700'
                  : status === 'rejected'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap gap-2">
          {status !== 'approved' && (
            <button type="button" onClick={onApprove} className="app-btn-success app-btn-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isUrdu ? 'منظور کریں' : 'Approve'}</span>
            </button>
          )}
          {status !== 'rejected' && (
            <button type="button" onClick={onReject} className="app-btn-danger-outline app-btn-sm flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              <span>{isUrdu ? 'مسترد کریں' : 'Reject'}</span>
            </button>
          )}
          <button type="button" onClick={onOpenCard} className="app-btn-primary app-btn-sm flex items-center gap-1.5">
            <IdCard className="w-4 h-4" />
            <span>{isUrdu ? 'رکنیت کارڈ' : 'Membership Card'}</span>
          </button>
          <button type="button" onClick={onDelete} className="app-btn-icon ml-auto" title={isUrdu ? 'حذف کریں' : 'Delete'}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Details */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#AD7A28] mb-1">
            {isUrdu ? 'ذاتی معلومات' : 'Personal Information'}
          </h3>
          <Field label={isUrdu ? 'ای میل' : 'Email'} value={r.email} icon={Mail} />
          <Field label={isUrdu ? 'واٹس ایپ' : 'WhatsApp'} value={r.whatsapp} icon={Phone} />
          <Field label={isUrdu ? 'تاریخ پیدائش' : 'Date of Birth'} value={r.dob} icon={Calendar} />
          <Field label={isUrdu ? 'صنف' : 'Gender'} value={r.gender} />
          <Field label={isUrdu ? 'قومیت/ذات' : 'Caste'} value={r.caste} />
          <Field label={isUrdu ? 'شناختی کارڈ' : 'CNIC'} value={r.cnic} />
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#AD7A28] mb-1">
            {isUrdu ? 'پتہ' : 'Address'}
          </h3>
          <Field label={isUrdu ? 'مکمل پتہ' : 'Full Address'} value={address} icon={MapPin} />
          <Field label={isUrdu ? 'رہائشی حیثیت' : 'Residential Status'} value={r.residentialStatus} />
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#AD7A28] mb-1">
            {isUrdu ? 'رکنیت' : 'Membership'}
          </h3>
          <Field label={isUrdu ? 'رکنیت کی قسم' : 'Membership Type'} value={r.membershipType} />
          <Field label={isUrdu ? 'تعلیم' : 'Education'} value={r.education} icon={GraduationCap} />
          <Field label={isUrdu ? 'پیشہ' : 'Occupation'} value={r.work} icon={Briefcase} />
          <Field label={isUrdu ? 'وجہ' : 'Reason for Joining'} value={r.reason} />
        </div>
      </div>
    </div>
  );
};
