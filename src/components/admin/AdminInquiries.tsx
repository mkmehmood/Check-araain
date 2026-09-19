import React, { useState } from 'react';
import { ContactMessage } from '../../types';
import { 
  Mail, 
  Search, 
  Trash2, 
  CheckCircle, 
  MessageCircle, 
  Clock, 
  Phone, 
  Calendar, 
  Eye, 
  X,
  User,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

interface AdminInquiriesProps {
  messages: ContactMessage[];
  updateContactMessageStatus: (id: string, status: string) => Promise<void>;
  deleteContactMessage: (id: string) => Promise<void>;
  isUrdu: boolean;
}

export const AdminInquiries: React.FC<AdminInquiriesProps> = ({
  messages,
  updateContactMessageStatus,
  deleteContactMessage,
  isUrdu,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null);

  const filtered = messages.filter((m) => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      (m.name && m.name.toLowerCase().includes(s)) ||
      (m.email && m.email.toLowerCase().includes(s)) ||
      (m.phone && m.phone.includes(s)) ||
      (m.subject && m.subject.toLowerCase().includes(s)) ||
      (m.message && m.message.toLowerCase().includes(s));

    const matchStatus =
      statusFilter === 'all' ? true : (m.status || 'new') === statusFilter;

    return matchSearch && matchStatus;
  });

  const unreadCount = messages.filter(m => (m.status || 'new') === 'new').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#16232F]">
            {isUrdu ? 'عوامی پیغامات اور رابطے' : 'Public Messages & Inquiries'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isUrdu
              ? 'ویب سائٹ کے رابطہ فارم سے موصولہ پیغامات، تجاویز اور استفسارات'
              : 'Messages, inquiries, and welfare requests submitted through the official portal.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            {unreadCount} {isUrdu ? 'نئے غیر پڑھے پیغامات' : 'Unread Messages'}
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-lg">
          <Search className={`w-4 h-4 text-slate-400 absolute ${isUrdu ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
          <input
            type="text"
            placeholder={isUrdu ? 'نام، فون، ای میل یا پیغام سے تلاش کریں...' : 'Search inquiries by name, phone, email, subject...'}
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
          <option value="all">{isUrdu ? 'تمام پیغامات' : 'All Messages'}</option>
          <option value="new">{isUrdu ? 'نئے (Unread)' : 'Unread'}</option>
          <option value="replied">{isUrdu ? 'جواب دیا گیا (Replied)' : 'Replied'}</option>
        </select>
      </div>

      {/* Messages List & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {isUrdu ? 'کوئی پیغام موجود نہیں۔' : 'No inquiries found.'}
            </div>
          ) : (
            filtered.map((msg) => {
              const isUnread = (msg.status || 'new') === 'new';

              return (
                <div key={msg._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isUnread ? 'bg-[#AD7A28] ring-4 ring-[#AD7A28]/20' : 'bg-slate-300'
                      }`} />
                      <div>
                        <div className="font-bold text-[#16232F] text-sm">{msg.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{msg.phone || msg.email || 'No contact info'}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      msg.status === 'replied' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {msg.status === 'replied' ? 'Replied' : 'Unread'}
                    </span>
                  </div>

                  {msg.subject && (
                    <div className="text-xs font-semibold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg">
                      {msg.subject}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {msg.submittedAt ? new Date(msg.submittedAt).toLocaleDateString() : 'Recent'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingMessage(msg)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#16232F] hover:bg-[#223546] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isUrdu ? 'پیغام دیکھیں' : 'View'}</span>
                      </button>

                      <button
                        onClick={() => msg._id && confirm('Delete this inquiry?') && deleteContactMessage(msg._id)}
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
                <th className="px-4 py-3.5">{isUrdu ? 'بھیجنے والا' : 'Sender'}</th>
                <th className="px-4 py-3.5">{isUrdu ? 'عنوان / موضوع' : 'Subject'}</th>
                <th className="px-4 py-3.5">{isUrdu ? 'پیغام کی جھلک' : 'Message Preview'}</th>
                <th className="px-4 py-3.5">{isUrdu ? 'تاریخ' : 'Date'}</th>
                <th className="px-4 py-3.5">{isUrdu ? 'حیثیت' : 'Status'}</th>
                <th className="px-4 py-3.5">{isUrdu ? 'پیغام کھولیں' : 'View Message'}</th>
                <th className={`px-4 py-3.5 ${isUrdu ? 'text-left' : 'text-right'}`}>{isUrdu ? 'حذف' : 'Delete'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    {isUrdu ? 'کوئی پیغام موجود نہیں۔' : 'No inquiries found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((msg) => {
                  const isUnread = (msg.status || 'new') === 'new';

                  return (
                    <tr key={msg._id} className={`hover:bg-slate-50/70 transition-colors ${isUnread ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            isUnread ? 'bg-[#AD7A28] ring-2 ring-[#AD7A28]/30' : 'bg-slate-300'
                          }`} />
                          <div>
                            <div className="font-bold text-[#16232F]">{msg.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{msg.phone || msg.email || '—'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800 line-clamp-1 max-w-xs">
                          {msg.subject || 'General Inquiry'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-500">
                        <span className="line-clamp-1 max-w-md text-xs">
                          {msg.message}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500">
                        {msg.submittedAt ? new Date(msg.submittedAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="px-4 py-3.5">
                        <select
                          value={msg.status || 'new'}
                          onChange={(e) => msg._id && updateContactMessageStatus(msg._id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                            msg.status === 'replied' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="new">Unread</option>
                          <option value="replied">Replied</option>
                        </select>
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setViewingMessage(msg)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16232F] hover:bg-[#223546] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-300" />
                          <span>{isUrdu ? 'دیکھیں' : 'View'}</span>
                        </button>
                      </td>

                      <td className={`px-4 py-3.5 ${isUrdu ? 'text-left' : 'text-right'}`}>
                        <button
                          onClick={() => msg._id && confirm('Delete this inquiry message?') && deleteContactMessage(msg._id)}
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

      {/* Dedicated Message Details Modal */}
      {viewingMessage && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-fadeIn">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                  <Mail className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#16232F]">
                    {isUrdu ? 'پیغام کی تفصیلات' : 'Inquiry Message Details'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {viewingMessage.submittedAt ? new Date(viewingMessage.submittedAt).toLocaleString() : 'Received Message'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingMessage(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Details Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {isUrdu ? 'ارسال کنندہ' : 'Sender Name'}
                </span>
                <span className="text-sm font-bold text-[#16232F] block">
                  {viewingMessage.name}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {isUrdu ? 'حیثیت' : 'Message Status'}
                </span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-0.5 ${
                  viewingMessage.status === 'replied' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {viewingMessage.status === 'replied' ? 'Replied' : 'Unread'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {isUrdu ? 'فون نمبر' : 'Phone Number'}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-800 block">
                  {viewingMessage.phone || '—'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {isUrdu ? 'ای میل' : 'Email Address'}
                </span>
                <span className="text-xs text-slate-800 truncate block">
                  {viewingMessage.email || '—'}
                </span>
              </div>

              {viewingMessage.subject && (
                <div className="col-span-2">
                  <span className="text-[11px] text-slate-400 font-medium block">
                    {isUrdu ? 'موضوع' : 'Subject'}
                  </span>
                  <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 block mt-0.5">
                    {viewingMessage.subject}
                  </span>
                </div>
              )}
            </div>

            {/* Complete Message Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {isUrdu ? 'پیغام کا مکمل متن' : 'Full Message Body'}
              </label>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {viewingMessage.message}
              </div>
            </div>

            {/* Communication & Status Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                {viewingMessage.phone && (
                  <a
                    href={`https://wa.me/${viewingMessage.phone.replace(/[^0-9]/g, '').startsWith('0') ? '92' + viewingMessage.phone.replace(/[^0-9]/g, '').slice(1) : viewingMessage.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Dear ${viewingMessage.name}, Regarding your inquiry on ARAAIN BANNU website...`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {viewingMessage.email && (
                  <a
                    href={`mailto:${viewingMessage.email}?subject=${encodeURIComponent(`Re: ${viewingMessage.subject || 'Inquiry - Araain Bannu'}`)}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#AD7A28]" />
                    <span>Email</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const newStatus = viewingMessage.status === 'replied' ? 'new' : 'replied';
                    if (viewingMessage._id) {
                      await updateContactMessageStatus(viewingMessage._id, newStatus);
                      setViewingMessage({ ...viewingMessage, status: newStatus });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{viewingMessage.status === 'replied' ? 'Mark Unread' : 'Mark Replied'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
