import React, { useState, useMemo } from 'react';
import { Registration } from '../../types';
import { FullScreenHeader } from '../common/FullScreenHeader';
import { AdminMemberDetailScreen } from './AdminMemberDetailScreen';
import { MembershipCardModal } from './MembershipCardModal';
import { 
  Users, 
  Search, 
  Download, 
  Eye, 
  CreditCard, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Phone, 
  MapPin, 
  ArrowRight,
  Filter,
  UserCheck
} from 'lucide-react';

interface AdminRegistrationsScreenProps {
  registrations: Registration[];
  onBack: () => void;
  updateRegistrationStatus: (id: string, status: string) => Promise<void>;
  deleteRegistration: (id: string) => Promise<void>;
  isUrdu: boolean;
  initialMemberId?: string | null;
}

export const AdminRegistrationsScreen: React.FC<AdminRegistrationsScreenProps> = ({
  registrations,
  onBack,
  updateRegistrationStatus,
  deleteRegistration,
  isUrdu,
  initialMemberId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'approved' | 'rejected'>('all');
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<Registration | null>(() => {
    if (initialMemberId) {
      return registrations.find(r => (r.id || (r as any)._id) === initialMemberId) || null;
    }
    return null;
  });
  const [selectedRegForCard, setSelectedRegForCard] = useState<Registration | null>(null);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return registrations.filter((reg) => {
      const s = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (reg.fullName && reg.fullName.toLowerCase().includes(s)) ||
        (reg.fullNameEn && reg.fullNameEn.toLowerCase().includes(s)) ||
        (reg.fullNameUr && reg.fullNameUr.toLowerCase().includes(s)) ||
        (reg.fatherName && reg.fatherName.toLowerCase().includes(s)) ||
        (reg.fatherNameEn && reg.fatherNameEn.toLowerCase().includes(s)) ||
        (reg.cnic && reg.cnic.includes(s)) ||
        (reg.whatsapp && reg.whatsapp.includes(s)) ||
        (reg.cardId && reg.cardId.toLowerCase().includes(s)) ||
        (reg.city && reg.city.toLowerCase().includes(s)) ||
        (reg.village && reg.village.toLowerCase().includes(s));

      const regStatus = reg.status || 'new';
      const matchStatus = statusFilter === 'all' ? true : regStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [registrations, searchTerm, statusFilter]);

  // Metric counts
  const counts = {
    total: registrations.length,
    new: registrations.filter(r => (r.status || 'new') === 'new').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

  // CSV Export
  const exportMembersCsv = () => {
    const headers = [
      'Card ID', 'Full Name (En)', 'Full Name (Ur)', 'Father Name (En)', 'Father Name (Ur)', 
      'CNIC', 'Gender', 'Type', 'WhatsApp', 'Email', 
      'Village', 'Tehsil', 'District', 'Province',
      'Status', 'Submitted At'
    ];
    const rows = registrations.map(r => [
      `"${r.cardId || ''}"`,
      `"${r.fullNameEn || r.fullName || ''}"`,
      `"${r.fullNameUr || r.fullName || ''}"`,
      `"${r.fatherNameEn || r.fatherName || ''}"`,
      `"${r.fatherNameUr || r.fatherName || ''}"`,
      `"${r.cnic || ''}"`,
      `"${r.genderEn || r.gender || ''}"`,
      `"${r.membershipTypeEn || r.membershipType || ''}"`,
      `"${r.whatsapp || ''}"`,
      `"${r.email || ''}"`,
      `"${r.villageEn || r.village || r.streetEn || r.street || ''}"`,
      `"${r.tehsilEn || r.tehsil || ''}"`,
      `"${r.districtEn || r.district || r.cityEn || r.city || 'Bannu'}"`,
      `"${r.provinceEn || r.province || r.stateEn || r.state || 'KPK'}"`,
      `"${r.status || ''}"`,
      `"${r.submittedAt || ''}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Araain_Bannu_Members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If a specific member is selected for detail, open the complete member detail screen!
  if (selectedMemberForDetail) {
    // Keep reference updated with fresh list item
    const freshReg = registrations.find(
      r => (r.id || (r as any)._id) === (selectedMemberForDetail.id || (selectedMemberForDetail as any)._id)
    ) || selectedMemberForDetail;

    return (
      <AdminMemberDetailScreen
        registration={freshReg}
        onBack={() => setSelectedMemberForDetail(null)}
        onUpdateStatus={updateRegistrationStatus}
        onDelete={deleteRegistration}
        isUrdu={isUrdu}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#FBF9F4] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
      {/* Full Screen Header */}
      <FullScreenHeader
        title={isUrdu ? 'اراکین اور ممبرشپ رجسٹریشنز' : 'Membership Directory & Applications'}
        subtitle={
          isUrdu
            ? 'تمام آن لائن ممبرشپ رجسٹریشنز کی جانچ پڑتال، منظوری اور آفیشل کارڈز'
            : 'Enlist all member registrations, filter records, and inspect full applicant profiles'
        }
        badge={isUrdu ? `${counts.total} کل اراکین` : `${counts.total} Registered`}
        icon={<Users className="w-4 h-4 text-amber-300" />}
        onBack={onBack}
        rightActions={
          <button
            type="button"
            onClick={exportMembersCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#F5CA7B]" />
            <span className="hidden sm:inline">{isUrdu ? 'ایکسپورٹ CSV' : 'Export CSV'}</span>
          </button>
        }
      />

      {/* Screen Body */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* KPI Strip & Status Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white border-[#AD7A28] shadow-sm ring-2 ring-[#AD7A28]/20'
                : 'bg-white/80 border-slate-200 hover:bg-white'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isUrdu ? 'تمام اراکین' : 'All Members'}
            </span>
            <span className="text-2xl font-black text-[#16232F] mt-1 block font-mono">
              {counts.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('new')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === 'new'
                ? 'bg-white border-amber-500 shadow-sm ring-2 ring-amber-500/20'
                : 'bg-white/80 border-slate-200 hover:bg-white'
            }`}
          >
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              {isUrdu ? 'زیر جائزہ' : 'Under Review'}
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block font-mono">
              {counts.new}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('approved')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === 'approved'
                ? 'bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-white/80 border-slate-200 hover:bg-white'
            }`}
          >
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              {isUrdu ? 'منظور شدہ' : 'Approved'}
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">
              {counts.approved}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('rejected')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === 'rejected'
                ? 'bg-white border-red-500 shadow-sm ring-2 ring-red-500/20'
                : 'bg-white/80 border-slate-200 hover:bg-white'
            }`}
          >
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">
              {isUrdu ? 'مسترد شدہ' : 'Rejected'}
            </span>
            <span className="text-2xl font-black text-red-600 mt-1 block font-mono">
              {counts.rejected}
            </span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isUrdu
                  ? 'نام، والد کا نام، شناختی کارڈ، فون، یا کارڈ نمبر سے تلاش کریں...'
                  : 'Search by name, father name, CNIC, phone, village, or card ID...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#AD7A28] focus:bg-white transition-all"
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold px-2 shrink-0">
            {isUrdu ? `${filteredMembers.length} نتائج` : `Showing ${filteredMembers.length} of ${registrations.length}`}
          </div>
        </div>

        {/* Complete List of Registrations */}
        {filteredMembers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">
              {isUrdu ? 'کوئی ممبرشپ ریکارڈ نہیں ملا' : 'No Member Registrations Found'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm
                ? (isUrdu ? 'اپنے تلاش کے الفاظ تبدیل کر کے دوبارہ کوشش کریں۔' : 'Try clearing or changing your search filters.')
                : (isUrdu ? 'ابھی تک کوئی نئی رجسٹریشن موصول نہیں ہوئی۔' : 'No registrations have been submitted in this status category.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMembers.map((reg) => {
              const regId = reg.id || (reg as any)._id || '';
              const status = reg.status || 'new';

              return (
                <div
                  key={regId}
                  onClick={() => setSelectedMemberForDetail(reg)}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#AD7A28]/50 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-4">
                    {/* Member Thumbnail */}
                    <div className="relative shrink-0">
                      {reg.photoData ? (
                        <img
                          src={reg.photoData}
                          alt={reg.fullName}
                          className="w-16 h-20 sm:w-18 sm:h-22 object-cover rounded-2xl border border-slate-200 bg-slate-50 shadow-xs group-hover:scale-102 transition-transform"
                        />
                      ) : (
                        <div className="w-16 h-20 sm:w-18 sm:h-22 rounded-2xl bg-[#16232F] text-amber-300 flex flex-col items-center justify-center font-bold border border-[#AD7A28]/30">
                          <span className="text-2xl font-black">
                            {(reg.fullName || 'M')[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold text-white shadow-xs ${
                        status === 'approved' ? 'bg-emerald-500' :
                        status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                      }`}>
                        {status === 'approved' ? '✓' : status === 'rejected' ? '✕' : '⏳'}
                      </span>
                    </div>

                    {/* Member Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {reg.cardId && (
                          <span className="px-2 py-0.5 rounded-md bg-[#16232F] text-amber-300 font-mono text-[10px] font-bold">
                            {reg.cardId}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                          status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {status === 'approved' ? (isUrdu ? 'منظور شدہ' : 'Approved') :
                           status === 'rejected' ? (isUrdu ? 'مسترد' : 'Rejected') :
                           (isUrdu ? 'زیر جائزہ' : 'Under Review')}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-[#16232F] group-hover:text-[#AD7A28] transition-colors truncate">
                        {reg.fullNameEn || reg.fullName}
                      </h4>
                      {reg.fullNameUr && (
                        <p className="text-xs font-bold text-[#AD7A28] font-urdu truncate">
                          {reg.fullNameUr}
                        </p>
                      )}

                      <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                        <p className="truncate">
                          <span className="text-slate-400">{isUrdu ? 'ولد: ' : 'S/O: '}</span>
                          {reg.fatherNameEn || reg.fatherName || '—'}
                        </p>
                        <p className="font-mono text-slate-600 truncate">
                          <span className="text-slate-400 font-sans">CNIC: </span>
                          {reg.cnic || '—'}
                        </p>
                        <p className="truncate text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#AD7A28] shrink-0" />
                          <span>
                            {[reg.villageEn || reg.village, reg.tehsilEn || reg.tehsil, reg.districtEn || reg.district || reg.city].filter(Boolean).join(', ') || 'Bannu'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 mt-3">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#AD7A28] group-hover:translate-x-0.5 transition-transform">
                      <span>{isUrdu ? 'مکمل پروفائل کھولیں' : 'View Full Dossier'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedRegForCard(reg)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#AD7A28] hover:text-white text-slate-700 text-xs font-bold transition-all"
                        title={isUrdu ? 'کارڈ دیکھیں' : 'Issue Card'}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isUrdu ? 'کارڈ' : 'Card'}</span>
                      </button>

                      {status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => updateRegistrationStatus(regId, 'approved')}
                          className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs transition-all"
                          title="Approve Member"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={async () => {
                          const confirmMsg = isUrdu ? 'کیا آپ اس رجسٹریشن کو حذف کرنا چاہتے ہیں؟' : 'Delete this registration?';
                          if (window.confirm(confirmMsg)) {
                            await deleteRegistration(regId);
                          }
                        }}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-400 text-xs transition-all"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Official Membership Card Modal */}
      {selectedRegForCard && (
        <MembershipCardModal
          registration={selectedRegForCard}
          onClose={() => setSelectedRegForCard(null)}
        />
      )}
    </div>
  );
};
