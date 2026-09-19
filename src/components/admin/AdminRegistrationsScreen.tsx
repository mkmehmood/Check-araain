import React, { useMemo, useState, useEffect } from 'react';
import { Registration } from '../../types';
import { FullScreenHeader } from '../common/FullScreenHeader';
import { AdminMemberDetail } from './AdminMemberDetail';
import { MembershipCardModal } from './MembershipCardModal';
import { Users, Search, UserRound, Eye, IdCard } from 'lucide-react';

interface AdminRegistrationsScreenProps {
  registrations: Registration[];
  updateRegistrationStatus: (id: string, status: string) => Promise<void>;
  deleteRegistration: (id: string) => Promise<void>;
  isUrdu: boolean;
  onBack: () => void;
  initialMemberId?: string | null;
}

type FilterId = 'all' | 'new' | 'approved' | 'rejected';

export const AdminRegistrationsScreen: React.FC<AdminRegistrationsScreenProps> = ({
  registrations,
  updateRegistrationStatus,
  deleteRegistration,
  isUrdu,
  onBack,
  initialMemberId = null,
}) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');
  const [selectedId, setSelectedId] = useState<string | null>(initialMemberId);
  const [cardFor, setCardFor] = useState<Registration | null>(null);

  useEffect(() => {
    if (initialMemberId) setSelectedId(initialMemberId);
  }, [initialMemberId]);

  const getId = (r: Registration) => String(r._id || r.id || '');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return registrations.filter((r) => {
      const status = r.status || 'new';
      if (filter !== 'all' && status !== filter) return false;
      if (!q) return true;
      const hay = `${r.fullName || ''} ${r.fullNameEn || ''} ${r.fullNameUr || ''} ${r.cnic || ''} ${r.whatsapp || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [registrations, query, filter]);

  const selected = registrations.find((r) => getId(r) === selectedId) || null;

  const filters: { id: FilterId; label: string; labelUr: string }[] = [
    { id: 'all', label: 'All', labelUr: 'تمام' },
    { id: 'new', label: 'New', labelUr: 'نئے' },
    { id: 'approved', label: 'Approved', labelUr: 'منظور شدہ' },
    { id: 'rejected', label: 'Rejected', labelUr: 'مسترد' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#FBF9F4] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
      <FullScreenHeader
        title={isUrdu ? 'رجسٹریشنز' : 'Registrations'}
        subtitle={`${registrations.length} ${isUrdu ? 'کل درخواستیں' : 'total applications'}`}
        badge={isUrdu ? 'رکنیت' : 'Membership'}
        icon={<Users className="w-4 h-4 text-amber-300" />}
        onBack={onBack}
      />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isUrdu ? 'نام، سی این آئی سی یا واٹس ایپ تلاش کریں' : 'Search by name, CNIC or WhatsApp'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AD7A28]/30"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f.id ? 'bg-[#16232F] text-amber-300' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isUrdu ? f.labelUr : f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2.5">
          {filtered.length === 0 && (
            <div className="text-center py-14 text-sm text-slate-400">
              {isUrdu ? 'کوئی رجسٹریشن نہیں ملی' : 'No registrations found.'}
            </div>
          )}
          {filtered.map((r) => {
            const id = getId(r);
            const status = r.status || 'new';
            const name = r.fullName || r.fullNameEn || '';
            return (
              <div
                key={id}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-[#AD7A28]/40 hover:shadow-sm transition-all"
              >
                {r.photoData ? (
                  <img src={r.photoData} alt={name} className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                    <UserRound className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[#16232F] truncate">{name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : status === 'rejected'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {status.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">{r.membershipType}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(id)}
                  className="app-btn-icon shrink-0"
                  title={isUrdu ? 'دیکھیں' : 'View'}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCardFor(r)}
                  className="app-btn-icon shrink-0"
                  title={isUrdu ? 'کارڈ' : 'Card'}
                >
                  <IdCard className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <AdminMemberDetail
          registration={selected}
          isUrdu={isUrdu}
          onBack={() => {
            setSelectedId(null);
            window.history.replaceState(null, '', '#registrations');
          }}
          onApprove={() => updateRegistrationStatus(getId(selected), 'approved')}
          onReject={() => updateRegistrationStatus(getId(selected), 'rejected')}
          onDelete={async () => {
            await deleteRegistration(getId(selected));
            setSelectedId(null);
          }}
          onOpenCard={() => setCardFor(selected)}
        />
      )}

      {cardFor && <MembershipCardModal registration={cardFor} onClose={() => setCardFor(null)} />}
    </div>
  );
};
