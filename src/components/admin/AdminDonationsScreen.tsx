import React, { useMemo, useState } from 'react';
import { Donation } from '../../types';
import { FullScreenHeader } from '../common/FullScreenHeader';
import { Heart, Search, CheckCircle2, XCircle, Wallet, Trash2, X } from 'lucide-react';

interface AdminDonationsScreenProps {
  donations: Donation[];
  updateDonationStatus: (id: string, status: string) => Promise<void>;
  deleteDonation: (id: string) => Promise<void>;
  isUrdu: boolean;
  onBack: () => void;
}

type FilterId = 'all' | 'pending' | 'verified' | 'rejected';

export const AdminDonationsScreen: React.FC<AdminDonationsScreenProps> = ({
  donations,
  updateDonationStatus,
  deleteDonation,
  isUrdu,
  onBack,
}) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getId = (d: Donation) => String(d._id || d.id || '');
  const receiptOf = (d: Donation) => d.receiptPhoto || d.photoData || d.receiptUrl || d.proofUrl || '';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return donations.filter((d) => {
      const status = d.status || 'pending';
      if (filter !== 'all' && status !== filter) return false;
      if (!q) return true;
      const hay = `${d.donorName || ''} ${d.phone || ''} ${d.txId || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [donations, query, filter]);

  const selected = donations.find((d) => getId(d) === selectedId) || null;

  const filters: { id: FilterId; label: string; labelUr: string }[] = [
    { id: 'all', label: 'All', labelUr: 'تمام' },
    { id: 'pending', label: 'Pending', labelUr: 'زیر التوا' },
    { id: 'verified', label: 'Verified', labelUr: 'تصدیق شدہ' },
    { id: 'rejected', label: 'Rejected', labelUr: 'مسترد' },
  ];

  const totalVerified = donations
    .filter((d) => d.status === 'verified')
    .reduce((acc, d) => acc + (Number(d.amount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#FBF9F4] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
      <FullScreenHeader
        title={isUrdu ? 'عطیات' : 'Donations'}
        subtitle={`${donations.length} ${isUrdu ? 'کل عطیات' : 'total records'} · PKR ${totalVerified.toLocaleString()} ${isUrdu ? 'وصول شدہ' : 'verified'}`}
        badge={isUrdu ? 'فنڈ' : 'Fundraising'}
        icon={<Heart className="w-4 h-4 text-amber-300" />}
        onBack={onBack}
      />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isUrdu ? 'عطیہ دہندہ کا نام یا فون تلاش کریں' : 'Search donor name or phone'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AD7A28]/30"
          />
        </div>

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

        <div className="space-y-2.5">
          {filtered.length === 0 && (
            <div className="text-center py-14 text-sm text-slate-400">
              {isUrdu ? 'کوئی عطیہ نہیں ملا' : 'No donations found.'}
            </div>
          )}
          {filtered.map((d) => {
            const id = getId(d);
            const status = d.status || 'pending';
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedId(id)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-[#AD7A28]/40 hover:shadow-sm transition-all text-left cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[#16232F] truncate">{d.donorName}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        status === 'verified' ? 'bg-emerald-50 text-emerald-700' : status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {status.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">{d.method}</span>
                  </div>
                </div>
                <div className="text-sm font-black text-[#16232F] shrink-0">
                  PKR {Number(d.amount || 0).toLocaleString()}
                </div>
                {status !== 'verified' && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      updateDonationStatus(id, 'verified');
                    }}
                    className="app-btn-success app-btn-sm shrink-0"
                    title={isUrdu ? 'منظور کریں' : 'Approve'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail overlay */}
      {selected && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#16232F]">{isUrdu ? 'عطیہ کی تفصیل' : 'Donation Detail'}</h3>
              <button type="button" onClick={() => setSelectedId(null)} className="app-btn-icon">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {receiptOf(selected) && (
                <img src={receiptOf(selected)} alt="Receipt" className="w-full rounded-2xl border border-slate-200 object-contain max-h-72" />
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">{isUrdu ? 'نام' : 'Donor'}</div>
                  <div className="font-semibold text-[#16232F]">{selected.donorName}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">{isUrdu ? 'رقم' : 'Amount'}</div>
                  <div className="font-semibold text-[#16232F]">PKR {Number(selected.amount || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">{isUrdu ? 'فون' : 'Phone'}</div>
                  <div className="font-semibold text-[#16232F]">{selected.phone}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">{isUrdu ? 'طریقہ' : 'Method'}</div>
                  <div className="font-semibold text-[#16232F]">{selected.method}</div>
                </div>
                {selected.txId && (
                  <div className="col-span-2">
                    <div className="text-[10px] font-bold uppercase text-slate-400">{isUrdu ? 'ٹرانزیکشن آئی ڈی' : 'Transaction ID'}</div>
                    <div className="font-semibold text-[#16232F] break-all">{selected.txId}</div>
                  </div>
                )}
                {selected.note && (
                  <div className="col-span-2">
                    <div className="text-[10px] font-bold uppercase text-slate-400">{isUrdu ? 'نوٹ' : 'Note'}</div>
                    <div className="text-[#16232F]">{selected.note}</div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {selected.status !== 'verified' && (
                  <button
                    type="button"
                    onClick={() => updateDonationStatus(getId(selected), 'verified')}
                    className="app-btn-success app-btn-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isUrdu ? 'منظور کریں' : 'Approve'}</span>
                  </button>
                )}
                {selected.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => updateDonationStatus(getId(selected), 'rejected')}
                    className="app-btn-danger-outline app-btn-sm flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{isUrdu ? 'مسترد کریں' : 'Reject'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    await deleteDonation(getId(selected));
                    setSelectedId(null);
                  }}
                  className="app-btn-icon ml-auto"
                  title={isUrdu ? 'حذف کریں' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
