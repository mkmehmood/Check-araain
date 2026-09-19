import React, { useState } from 'react';
import { Donation } from '../../types';
import { 
  Heart, 
  Search, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2, 
  ExternalLink,
  HandCoins,
  X,
  CreditCard,
  FileText,
  UserCheck
} from 'lucide-react';

interface AdminDonationsProps {
  donations: Donation[];
  updateDonationStatus: (id: string, status: string) => Promise<void>;
  deleteDonation: (id: string) => Promise<void>;
  isUrdu: boolean;
}

export const AdminDonations: React.FC<AdminDonationsProps> = ({
  donations,
  updateDonationStatus,
  deleteDonation,
  isUrdu,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  const filteredDonations = donations.filter((d) => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      (d.donorName && d.donorName.toLowerCase().includes(s)) ||
      (d.phone && d.phone.includes(s)) ||
      (d.txId && d.txId.toLowerCase().includes(s)) ||
      (d.method && d.method.toLowerCase().includes(s)) ||
      (d.amount && String(d.amount).includes(s)) ||
      (d.note && d.note.toLowerCase().includes(s));

    const matchStatus =
      statusFilter === 'all' ? true : (d.status || 'pending') === statusFilter;

    return matchSearch && matchStatus;
  });

  const exportDonationsCsv = () => {
    const headers = ['Donor Name', 'Amount (PKR)', 'Phone', 'Method', 'Transaction ID', 'Status', 'Note', 'Date'];
    const rows = donations.map(d => [
      `"${d.donorName || ''}"`,
      `"${d.amount || ''}"`,
      `"${d.phone || ''}"`,
      `"${d.method || ''}"`,
      `"${d.txId || ''}"`,
      `"${d.status || ''}"`,
      `"${d.note || ''}"`,
      `"${d.submittedAt || ''}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Araain_Bannu_Donations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalVerifiedAmount = donations
    .filter(d => d.status === 'verified')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalPendingAmount = donations
    .filter(d => (d.status || 'pending') === 'pending')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const pendingCount = donations.filter(d => (d.status || 'pending') === 'pending').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#16232F]">
            {isUrdu ? 'عطیات و مالی معاونت کا انتظام' : 'Donations & Financial Ledger'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isUrdu
              ? 'موصولہ بینک رسیدیں، موبائل والیٹ ٹرانزیکشنز، اور منظوری'
              : 'Review bank receipts, mobile wallet deposits, details, and approve transactions.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportDonationsCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'سی ایس وی ایکسپورٹ' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all' 
              ? 'bg-[#16232F] text-white shadow-sm' 
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <div className="text-xs font-semibold flex items-center gap-1.5">
            <HandCoins className={`w-3.5 h-3.5 ${statusFilter === 'all' ? 'text-amber-400' : 'text-[#AD7A28]'}`} />
            <span>{isUrdu ? 'کل موصولہ عطیات' : 'Total Entries'}</span>
          </div>
          <div className="text-2xl font-black mt-1">
            {donations.length}
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('verified')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'verified' 
              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' 
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <div className="text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isUrdu ? 'تصدیق شدہ فنڈز' : 'Verified Funds'}</span>
          </div>
          <div className="text-xl font-black mt-1 text-emerald-700">
            PKR {totalVerifiedAmount.toLocaleString()}
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'pending' 
              ? 'bg-amber-500/15 border-amber-500 text-amber-900 font-bold' 
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <div className="text-xs font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{isUrdu ? 'زیر توثیق رقم' : 'Pending Verification'}</span>
          </div>
          <div className="text-xl font-black mt-1 text-amber-700 flex items-center justify-between">
            <span>PKR {totalPendingAmount.toLocaleString()}</span>
            {pendingCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                {pendingCount}
              </span>
            )}
          </div>
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
            <span>{isUrdu ? 'مسترد شدہ رسیدیں' : 'Rejected Slips'}</span>
          </div>
          <div className="text-2xl font-black mt-1 text-red-600">
            {donations.filter(d => d.status === 'rejected').length}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-lg">
          <Search className={`w-4 h-4 text-slate-400 absolute ${isUrdu ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
          <input
            type="text"
            placeholder={isUrdu ? 'عطیہ دہندہ، فون نمبر، رقم یا ٹرانزیکشن آئی ڈی سے تلاش کریں...' : 'Search by donor, amount, phone, or transaction ID...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isUrdu ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#AD7A28]`}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#AD7A28] w-full sm:w-auto font-medium"
        >
          <option value="all">{isUrdu ? 'تمام حالتیں' : 'All Statuses'}</option>
          <option value="pending">{isUrdu ? 'زیر توثیق (Pending)' : 'Pending'}</option>
          <option value="verified">{isUrdu ? 'تصدیق شدہ (Verified)' : 'Verified'}</option>
          <option value="rejected">{isUrdu ? 'مسترد (Rejected)' : 'Rejected'}</option>
        </select>
      </div>

      {/* Donations List Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredDonations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {isUrdu ? 'کوئی عطیہ ریکارڈ نہیں ملا۔' : 'No donation entries found.'}
            </div>
          ) : (
            filteredDonations.map((d) => {
              const isPending = (d.status || 'pending') === 'pending';
              const receipt = d.receiptUrl || (d as any).receiptPhoto || (d as any).proofUrl;

              return (
                <div key={d._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-[#16232F] text-sm">{d.donorName || 'Anonymous Donor'}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{d.phone || 'No phone'}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase">
                          {d.method || 'Bank'}
                        </span>
                        {d.txId && (
                          <span className="text-[10px] font-mono text-slate-500">ID: {d.txId}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-[#AD7A28] text-base">
                        PKR {Number(d.amount || 0).toLocaleString()}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                        d.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                        d.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {d.status === 'verified' ? 'Verified' : d.status === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Details button, Approve button, Delete */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedDonation(d)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#AD7A28]" />
                      <span>{isUrdu ? 'تفصیلات و رسید' : 'Details'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {isPending && d._id && (
                        <button
                          onClick={() => updateDonationStatus(d._id!, 'verified')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{isUrdu ? 'منظور کریں' : 'Approve'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => d._id && confirm('Delete this donation record?') && deleteDonation(d._id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className={`w-full ${isUrdu ? 'text-right' : 'text-left'} text-xs sm:text-sm`}>
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">{isUrdu ? 'عطیہ دہندہ' : 'Donor'}</th>
                <th className="px-4 py-3.5">{isUrdu ? 'رقم (روپے)' : 'Amount'}</th>
                <th className="px-4 py-3.5">{isUrdu ? 'طریقہ کار' : 'Method'}</th>
                <th className="px-4 py-3.5">{isUrdu ? 'ٹرانزیکشن آئی ڈی' : 'Transaction ID'}</th>
                <th className="px-4 py-3.5">{isUrdu ? 'تفصیلات' : 'Details'}</th>
                <th className="px-4 py-3.5">{isUrdu ? 'حیثیت / منظوری' : 'Status & Approve'}</th>
                <th className={`px-4 py-3.5 ${isUrdu ? 'text-left' : 'text-right'}`}>{isUrdu ? 'حذف' : 'Delete'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    {isUrdu ? 'کوئی عطیہ ریکارڈ نہیں ملا۔' : 'No donation entries found.'}
                  </td>
                </tr>
              ) : (
                filteredDonations.map((d) => {
                  const isPending = (d.status || 'pending') === 'pending';

                  return (
                    <tr key={d._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#16232F]">{d.donorName || 'Anonymous'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{d.phone || '—'}</div>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-[#AD7A28]">
                        PKR {Number(d.amount || 0).toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold uppercase">
                          {d.method || 'Bank'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs text-slate-600">
                        {d.txId || '—'}
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setSelectedDonation(d)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#AD7A28]" />
                          <span>{isUrdu ? 'تفصیلات دیکھیں' : 'Details'}</span>
                        </button>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {isPending && d._id ? (
                            <button
                              onClick={() => updateDonationStatus(d._id!, 'verified')}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{isUrdu ? 'منظور کریں' : 'Approve'}</span>
                            </button>
                          ) : null}

                          <select
                            value={d.status || 'pending'}
                            onChange={(e) => d._id && updateDonationStatus(d._id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                              d.status === 'verified' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                              d.status === 'rejected' ? 'bg-red-50 text-red-800 border-red-300' :
                              'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </td>

                      <td className={`px-4 py-3.5 ${isUrdu ? 'text-left' : 'text-right'}`}>
                        <button
                          onClick={() => d._id && confirm('Delete this donation record?') && deleteDonation(d._id)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Donation Details & Slip Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-[#AD7A28]">
                  <Heart className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#16232F]">
                    {isUrdu ? 'عطیہ کی تفصیلی معلومات' : 'Donation Details & Receipt'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedDonation.submittedAt ? new Date(selectedDonation.submittedAt).toLocaleString() : 'Record Details'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDonation(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Data Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {isUrdu ? 'عطیہ دہندہ کا نام' : 'Donor Name'}
                </span>
                <span className="text-sm font-bold text-[#16232F] block">
                  {selectedDonation.donorName || 'Anonymous'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {isUrdu ? 'رقم' : 'Donation Amount'}
                </span>
                <span className="text-base font-black text-[#AD7A28] block">
                  PKR {Number(selectedDonation.amount || 0).toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {isUrdu ? 'فون / واٹس ایپ' : 'Phone Contact'}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-800 block">
                  {selectedDonation.phone || '—'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {isUrdu ? 'طریقہ ادائیگی' : 'Payment Method'}
                </span>
                <span className="text-xs font-bold text-slate-800 uppercase block">
                  {selectedDonation.method || 'Bank Transfer'}
                </span>
              </div>

              {selectedDonation.txId && (
                <div className="col-span-2">
                  <span className="text-[11px] text-slate-400 font-medium block">
                    {isUrdu ? 'ٹرانزیکشن ریفرنس آئی ڈی' : 'Transaction Reference ID'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200 block mt-0.5">
                    {selectedDonation.txId}
                  </span>
                </div>
              )}

              {selectedDonation.note && (
                <div className="col-span-2">
                  <span className="text-[11px] text-slate-400 font-medium block">
                    {isUrdu ? 'عطیہ کا مقصد / پیغام' : 'Donor Purpose / Note'}
                  </span>
                  <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200 mt-0.5">
                    "{selectedDonation.note}"
                  </p>
                </div>
              )}
            </div>

            {/* Receipt Proof Photo */}
            {(selectedDonation.receiptUrl || (selectedDonation as any).receiptPhoto || (selectedDonation as any).proofUrl) ? (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">
                  {isUrdu ? 'بینک سلپ / ٹرانزیکشن اسکرین شاٹ' : 'Transaction Proof / Receipt Slip'}
                </span>
                <div className="rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-72 border border-slate-300">
                  <img
                    src={selectedDonation.receiptUrl || (selectedDonation as any).receiptPhoto || (selectedDonation as any).proofUrl}
                    alt="Donation Receipt"
                    className="max-h-72 w-auto object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 text-center rounded-xl bg-slate-100 text-xs text-slate-500 italic">
                {isUrdu ? 'کوئی رسید تصویر منسلک نہیں کی گئی' : 'No receipt image uploaded with this submission.'}
              </div>
            )}

            {/* Approval & Status Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedDonation.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                  selectedDonation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {selectedDonation.status === 'verified' ? 'Verified' : selectedDonation.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedDonation.status !== 'verified' && selectedDonation._id && (
                  <button
                    onClick={async () => {
                      await updateDonationStatus(selectedDonation._id!, 'verified');
                      setSelectedDonation({ ...selectedDonation, status: 'verified' });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isUrdu ? 'منظور کریں' : 'Approve'}</span>
                  </button>
                )}

                {selectedDonation.status !== 'rejected' && selectedDonation._id && (
                  <button
                    onClick={async () => {
                      await updateDonationStatus(selectedDonation._id!, 'rejected');
                      setSelectedDonation({ ...selectedDonation, status: 'rejected' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{isUrdu ? 'مسترد کریں' : 'Reject'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
