import React, { useState } from 'react';
import { Registration } from '../../types';
import { 
  Users, 
  Search, 
  Download, 
  Eye, 
  CreditCard, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Phone, 
  MapPin, 
  Filter,
  X,
  Maximize2
} from 'lucide-react';
import { MembershipCardModal } from './MembershipCardModal';
import { AdminMemberDetailScreen } from './AdminMemberDetailScreen';

interface AdminMembersProps {
  registrations: Registration[];
  updateRegistrationStatus: (id: string, status: string) => Promise<void>;
  deleteRegistration: (id: string) => Promise<void>;
  isUrdu: boolean;
  onOpenFullScreen?: () => void;
}

export const AdminMembers: React.FC<AdminMembersProps> = ({
  registrations,
  updateRegistrationStatus,
  deleteRegistration,
  isUrdu,
  onOpenFullScreen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRegForCard, setSelectedRegForCard] = useState<Registration | null>(null);
  const [viewingRegDetails, setViewingRegDetails] = useState<Registration | null>(null);

  // Filter registrations
  const filteredMembers = registrations.filter((reg) => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      (reg.fullName && reg.fullName.toLowerCase().includes(s)) ||
      (reg.fullNameEn && reg.fullNameEn.toLowerCase().includes(s)) ||
      (reg.fullNameUr && reg.fullNameUr.toLowerCase().includes(s)) ||
      (reg.cnic && reg.cnic.includes(s)) ||
      (reg.whatsapp && reg.whatsapp.includes(s)) ||
      (reg.cardId && reg.cardId.toLowerCase().includes(s)) ||
      (reg.city && reg.city.toLowerCase().includes(s)) ||
      (reg.village && reg.village.toLowerCase().includes(s));

    const matchStatus =
      statusFilter === 'all' ? true : (reg.status || 'new') === statusFilter;

    return matchSearch && matchStatus;
  });

  // Export to CSV
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

  const counts = {
    total: registrations.length,
    new: registrations.filter(r => (r.status || 'new') === 'new').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Stats Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#16232F]">
            {isUrdu ? 'اراکین اور ممبرشپ درخواستیں' : 'Membership Directory & Applications'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isUrdu
              ? 'آن لائن درخواستوں کی جانچ پڑتال، منظوری، مسترد اور آفیشل کارڈ کا اجراء'
              : 'Review member applications, assign Official Card IDs, approve, print, and export records.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenFullScreen && (
            <button
              type="button"
              onClick={onOpenFullScreen}
              className="app-btn-primary app-btn-sm"
              title="Open Full Screen Directory"
            >
              <Maximize2 className="w-4 h-4" />
              <span>{isUrdu ? 'مکمل اسکرین لسٹ' : 'Full Screen'}</span>
            </button>
          )}
          <button
            onClick={exportMembersCsv}
            className="app-btn-neutral app-btn-sm"
          >
            <Download className="w-4 h-4 text-[#AD7A28]" />
            <span>{isUrdu ? 'سی ایس وی ایکسپورٹ' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all' 
              ? 'bg-amber-500/10 border-[#AD7A28] text-[#16232F]' 
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <div className="text-xs font-semibold">{isUrdu ? 'کل رجسٹرڈ' : 'Total Applications'}</div>
          <div className="text-2xl font-black mt-1 text-[#16232F]">{counts.total}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('new')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'new' 
              ? 'bg-amber-500/15 border-amber-500 text-amber-900 font-bold' 
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <div className="text-xs font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{isUrdu ? 'زیر التواء / نئی' : 'Pending Review'}</span>
          </div>
          <div className="text-2xl font-black mt-1 text-amber-700">{counts.new}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'approved' 
              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' 
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <div className="text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isUrdu ? 'منظور شدہ اراکین' : 'Approved Members'}</span>
          </div>
          <div className="text-2xl font-black mt-1 text-emerald-700">{counts.approved}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'rejected' 
              ? 'bg-red-50 border-red-500 text-red-900 font-bold' 
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <div className="text-xs font-semibold flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>{isUrdu ? 'مسترد شدہ' : 'Rejected'}</span>
          </div>
          <div className="text-2xl font-black mt-1 text-red-600">{counts.rejected}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-lg">
          <Search className={`w-4 h-4 text-slate-400 absolute ${isUrdu ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
          <input
            type="text"
            placeholder={isUrdu ? 'نام، کارڈ آئی ڈی، شناختی کارڈ، فون، شہر سے تلاش کریں...' : 'Search by name, Card ID, CNIC, WhatsApp, city...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isUrdu ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#AD7A28]`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#AD7A28]"
          >
            <option value="all">{isUrdu ? 'تمام حالتیں' : 'All Statuses'}</option>
            <option value="new">{isUrdu ? 'نئی درخواستیں' : 'New'}</option>
            <option value="approved">{isUrdu ? 'منظور شدہ' : 'Approved'}</option>
            <option value="rejected">{isUrdu ? 'مسترد' : 'Rejected'}</option>
          </select>
        </div>
      </div>

      {/* Members Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Mobile View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredMembers.length === 0 ? (
            <div className="px-4 py-12 text-center text-slate-400 text-xs">
              {isUrdu ? 'کوئی ممبر ریکارڈ نہیں ملا۔' : 'No matching member records found.'}
            </div>
          ) : (
            filteredMembers.map((reg) => (
              <div key={reg._id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {reg.photoData ? (
                    <img
                      src={reg.photoData}
                      alt={reg.fullName}
                      className="w-12 h-14 rounded-xl object-cover border border-[#AD7A28]/40 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-14 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-500 shrink-0">
                      {reg.fullName?.[0]?.toUpperCase() || 'M'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-[#16232F] text-sm truncate">
                      {isUrdu ? (reg.fullNameUr || reg.fullName) : (reg.fullNameEn || reg.fullName)}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {isUrdu ? `ولدیت: ${reg.fatherNameUr || reg.fatherName}` : `S/O: ${reg.fatherNameEn || reg.fatherName}`}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {reg.cardId && (
                        <span className="px-2 py-0.5 rounded-md bg-[#16232F] text-amber-300 text-[10px] font-mono font-bold">
                          {reg.cardId}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-600 font-semibold">{reg.cnic || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <span>{reg.whatsapp}</span>
                  <select
                    value={reg.status || 'new'}
                    onChange={(e) => reg._id && updateRegistrationStatus(reg._id, e.target.value)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                      reg.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      reg.status === 'rejected' ? 'bg-red-50 text-red-800 border-red-300' :
                      'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    <option value="new">New</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setViewingRegDetails(reg)}
                    className="app-btn-secondary app-btn-sm !h-7 !text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'دیکھیں' : 'View'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedRegForCard(reg)}
                    className="app-btn-primary app-btn-sm !h-7 !text-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'کارڈ' : 'Card'}</span>
                  </button>
                  <button
                    onClick={() => reg._id && confirm('Delete this application record?') && deleteRegistration(reg._id)}
                    className="app-btn-icon-light text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className={`w-full ${isUrdu ? 'text-right' : 'text-left'} text-xs sm:text-sm`}>
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">{isUrdu ? 'امیدوار' : 'Applicant'}</th>
                <th className="px-4 py-3.5">{isUrdu ? 'کارڈ آئی ڈی' : 'Card ID'}</th>
                <th className="px-4 py-3.5">{isUrdu ? 'شناختی کارڈ' : 'CNIC'}</th>
                <th className="px-4 py-3.5">{isUrdu ? 'واٹس ایپ / شہر' : 'WhatsApp / City'}</th>
                <th className="px-4 py-3.5">{isUrdu ? 'حیثیت' : 'Status'}</th>
                <th className={`px-4 py-3.5 ${isUrdu ? 'text-left' : 'text-right'}`}>{isUrdu ? 'کارروائی' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    {isUrdu ? 'کوئی درخواست نہیں ملی۔' : 'No matching member applications found.'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((reg) => (
                  <tr 
                    key={reg._id || reg.id} 
                    onClick={() => setViewingRegDetails(reg)}
                    className="hover:bg-amber-50/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {reg.photoData ? (
                          <img
                            src={reg.photoData}
                            alt=""
                            className="w-9 h-11 rounded-lg object-cover border border-[#AD7A28]/30 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-11 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-slate-500 shrink-0 text-xs">
                            {reg.fullName?.[0]?.toUpperCase() || 'M'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-[#16232F] hover:text-[#AD7A28] transition-colors">
                            {isUrdu ? (reg.fullNameUr || reg.fullName) : (reg.fullNameEn || reg.fullName)}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {isUrdu ? `ولدیت: ${reg.fatherNameUr || reg.fatherName}` : `S/O: ${reg.fatherNameEn || reg.fatherName}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {reg.cardId ? (
                        <span className="px-2 py-0.5 rounded-md bg-[#16232F] text-amber-300 font-mono text-xs font-bold">
                          {reg.cardId}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unassigned</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs text-slate-700">
                      {reg.cnic || '—'}
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      <div className="font-mono">{reg.whatsapp || '—'}</div>
                      <div className="text-[11px] text-slate-400">
                        {reg.districtEn || reg.district || reg.cityEn || reg.city || 'Bannu'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={reg.status || 'new'}
                        onChange={(e) => (reg._id || reg.id) && updateRegistrationStatus((reg._id || reg.id)!, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                          reg.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          reg.status === 'rejected' ? 'bg-red-50 text-red-800 border-red-300' :
                          'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>

                    <td className={`px-4 py-3.5 ${isUrdu ? 'text-left' : 'text-right'}`}>
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setViewingRegDetails(reg)}
                          title="View Full Profile Dossier"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRegForCard(reg)}
                          title="Issue / Print Membership Card"
                          className="p-1.5 rounded-lg text-[#AD7A28] hover:text-[#8C601A] hover:bg-amber-50 transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => (reg._id || reg.id) && confirm('Delete this member record?') && deleteRegistration((reg._id || reg.id)!)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Card Modal */}
      {selectedRegForCard && (
        <MembershipCardModal
          registration={selectedRegForCard}
          onClose={() => setSelectedRegForCard(null)}
        />
      )}

      {/* Full Screen Member Details Dossier */}
      {viewingRegDetails && (
        <AdminMemberDetailScreen
          registration={viewingRegDetails}
          onBack={() => setViewingRegDetails(null)}
          onUpdateStatus={updateRegistrationStatus}
          onDelete={deleteRegistration}
          isUrdu={isUrdu}
        />
      )}
    </div>
  );
};
