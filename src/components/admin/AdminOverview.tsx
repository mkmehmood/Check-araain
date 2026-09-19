import React from 'react';
import { 
  Registration, 
  Donation, 
  ContactMessage, 
  SiteSettings 
} from '../../types';
import { 
  Users, 
  Heart, 
  Mail, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  CreditCard, 
  Sliders, 
  Download, 
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface AdminOverviewProps {
  registrations: Registration[];
  donations: Donation[];
  messages: ContactMessage[];
  settings: SiteSettings;
  onNavigate: (tab: 'members' | 'donations' | 'inquiries' | 'site-content') => void;
  onOpenCardModal: (reg: Registration) => void;
  onUpdateDonationStatus: (id: string, status: string) => Promise<void>;
  isUrdu: boolean;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  registrations,
  donations,
  messages,
  settings,
  onNavigate,
  onOpenCardModal,
  onUpdateDonationStatus,
  isUrdu,
}) => {
  const pendingMembers = registrations.filter(r => (r.status || 'new') === 'new');
  const approvedMembers = registrations.filter(r => r.status === 'approved');

  const pendingDonations = donations.filter(d => (d.status || 'pending') === 'pending');
  const totalVerifiedAmount = donations
    .filter(d => d.status === 'verified')
    .reduce((sum, d) => sum + (parseInt(String(d.amount || '').replace(/[^0-9]/g, '')) || 0), 0);

  const unreadMessages = messages.filter(m => (m.status || 'new') === 'new');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-[#16232F] text-white relative overflow-hidden shadow-lg border border-amber-500/20">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <ShieldCheck className="w-4 h-4 text-[#AD7A28]" />
            <span>{isUrdu ? 'سینٹرل ایڈمن پورٹل — محفوظ پینل' : 'Central Admin CRM — Active Session'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {isUrdu ? 'آرائیں ویلفیئر ایسوسی ایشن بنوں' : 'Araain Welfare Association Bannu'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isUrdu
              ? 'اراکین کی تصدیق، ڈیجیٹل ممبرشپ کارڈز کا اجراء، عطیات کا آڈٹ اور ویب سائٹ کے تمام 14 سیکشنز کا مکمل کنٹرول'
              : 'Complete organizational command center: manage membership registrations, issue verifiable QR identity cards, monitor donations, and update website content in real time.'}
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Members Card */}
        <div 
          onClick={() => onNavigate('members')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#AD7A28]/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">
              {pendingMembers.length} {isUrdu ? 'نئی' : 'Pending'}
            </span>
          </div>
          <div className="text-2xl font-black text-[#16232F] mt-3">{registrations.length}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center justify-between">
            <span>{isUrdu ? 'کل اراکین درخواستیں' : 'Total Member Applications'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Verified Funds Card */}
        <div 
          onClick={() => onNavigate('donations')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#AD7A28]/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
              {donations.filter(d => d.status === 'verified').length} {isUrdu ? 'تصدیق شدہ' : 'Verified'}
            </span>
          </div>
          <div className="text-xl font-black text-emerald-700 mt-3">PKR {totalVerifiedAmount.toLocaleString()}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center justify-between">
            <span>{isUrdu ? 'کل تصدیق شدہ فنڈز' : 'Verified Donations'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pending Donations Card */}
        <div 
          onClick={() => onNavigate('donations')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#AD7A28]/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              {pendingDonations.length} {isUrdu ? 'زیر التواء' : 'Awaiting Review'}
            </span>
          </div>
          <div className="text-2xl font-black text-[#16232F] mt-3">{pendingDonations.length}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center justify-between">
            <span>{isUrdu ? 'غیر تصدیق شدہ رسیدیں' : 'Pending Donation Slips'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Inquiries Card */}
        <div 
          onClick={() => onNavigate('inquiries')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#AD7A28]/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800">
              {unreadMessages.length} {isUrdu ? 'نئے' : 'Unread'}
            </span>
          </div>
          <div className="text-2xl font-black text-[#16232F] mt-3">{messages.length}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center justify-between">
            <span>{isUrdu ? 'عوامی پیغامات اور رابطے' : 'Public Inquiries'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Applications & Recent Donations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#AD7A28]" />
              <h3 className="text-sm font-bold text-[#16232F]">
                {isUrdu ? 'حالیہ ممبرشپ درخواستیں' : 'Recent Member Applications'}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('members')}
              className="text-xs text-[#AD7A28] font-bold hover:underline"
            >
              {isUrdu ? 'سب دیکھیں' : 'View All'} →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {registrations.slice(0, 5).map((reg) => (
              <div key={reg._id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {reg.photoData ? (
                    <img
                      src={reg.photoData}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                      {reg.fullName?.[0] || 'M'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#16232F] truncate">
                      {reg.fullNameEn || reg.fullName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {reg.cnic || reg.whatsapp || '—'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    reg.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                    reg.status === 'rejected' ? 'bg-red-50 text-red-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {reg.status || 'new'}
                  </span>
                  <button
                    onClick={() => onOpenCardModal(reg)}
                    className="p-1.5 rounded-lg text-[#AD7A28] hover:bg-amber-50"
                    title="Card"
                  >
                    <CreditCard className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Donations */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#AD7A28]" />
              <h3 className="text-sm font-bold text-[#16232F]">
                {isUrdu ? 'حالیہ عطیات و رسیدیں' : 'Recent Donations'}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('donations')}
              className="text-xs text-[#AD7A28] font-bold hover:underline"
            >
              {isUrdu ? 'سب دیکھیں' : 'View All'} →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {donations.slice(0, 5).map((d) => (
              <div key={d._id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#16232F] truncate">
                    {d.donorName || 'Anonymous Donor'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {d.method || 'Bank'} • <span className="font-mono">{d.txId || 'No TxID'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-xs text-[#AD7A28]">
                    PKR {d.amount || 0}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    d.status === 'verified' ? 'bg-emerald-50 text-emerald-700' :
                    d.status === 'rejected' ? 'bg-red-50 text-red-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {d.status || 'pending'}
                  </span>
                  {d._id && d.status !== 'verified' && (
                    <button
                      onClick={() => onUpdateDonationStatus(d._id!, 'verified')}
                      className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50"
                      title="Verify"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Launchpad to Site Content */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="p-3 rounded-2xl bg-amber-500/10 text-[#AD7A28]">
            <Sliders className="w-6 h-6" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-[#16232F]">
              {isUrdu ? 'ویب سائٹ مواد مینیجر (14 سیکشنز)' : 'Website Content Manager (14 Modules)'}
            </h4>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'اعلانات، ہیرو بینر، تعارف، فلاحی پروگرامز، قیادت، تقریبات، فوٹو گیلری، بینک اکاؤنٹس'
                : 'Directly edit announcements, identity, hero slides, leaders, welfare programs, events, and bank accounts.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('site-content')}
          className="app-btn-primary self-stretch sm:self-auto shrink-0"
        >
          <span>{isUrdu ? 'مواد مینیجر کھولیں' : 'Open Site Content'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
