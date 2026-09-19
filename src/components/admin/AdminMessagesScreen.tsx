import React, { useMemo, useState } from 'react';
import { ContactMessage } from '../../types';
import { FullScreenHeader } from '../common/FullScreenHeader';
import { Mail, Search, Eye, Trash2, Reply, X } from 'lucide-react';

interface AdminMessagesScreenProps {
  messages: ContactMessage[];
  updateContactMessageStatus: (id: string, status: 'unread' | 'read' | 'replied') => Promise<void>;
  deleteContactMessage: (id: string) => Promise<void>;
  isUrdu: boolean;
  onBack: () => void;
}

export const AdminMessagesScreen: React.FC<AdminMessagesScreenProps> = ({
  messages,
  updateContactMessageStatus,
  deleteContactMessage,
  isUrdu,
  onBack,
}) => {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getId = (m: ContactMessage) => String(m._id || m.id || '');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) => `${m.name || ''} ${m.subject || ''} ${m.email || ''}`.toLowerCase().includes(q));
  }, [messages, query]);

  const selected = messages.find((m) => getId(m) === selectedId) || null;

  const openMessage = async (m: ContactMessage) => {
    setSelectedId(getId(m));
    if ((m.status || 'unread') === 'unread') {
      await updateContactMessageStatus(getId(m), 'read');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FBF9F4] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
      <FullScreenHeader
        title={isUrdu ? 'پیغامات' : 'Messages'}
        subtitle={`${messages.length} ${isUrdu ? 'کل پیغامات' : 'total messages'}`}
        badge={isUrdu ? 'رابطہ' : 'Contact'}
        icon={<Mail className="w-4 h-4 text-amber-300" />}
        onBack={onBack}
      />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isUrdu ? 'نام، موضوع یا ای میل تلاش کریں' : 'Search name, subject or email'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AD7A28]/30"
          />
        </div>

        <div className="space-y-2.5">
          {filtered.length === 0 && (
            <div className="text-center py-14 text-sm text-slate-400">
              {isUrdu ? 'کوئی پیغام نہیں ملا' : 'No messages found.'}
            </div>
          )}
          {filtered.map((m) => {
            const status = m.status || 'unread';
            return (
              <div
                key={getId(m)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                  status === 'unread' ? 'bg-white border-[#AD7A28]/30 shadow-xs' : 'bg-white border-slate-200/90'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#16232F] truncate">{m.name}</span>
                    {status === 'unread' && <span className="w-2 h-2 rounded-full bg-[#AD7A28] shrink-0" />}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{m.subject}</div>
                </div>
                <button type="button" onClick={() => openMessage(m)} className="app-btn-icon shrink-0" title={isUrdu ? 'دیکھیں' : 'View'}>
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#16232F] truncate">{selected.subject}</h3>
              <button type="button" onClick={() => setSelectedId(null)} className="app-btn-icon shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">{isUrdu ? 'نام' : 'From'}</div>
                  <div className="font-semibold text-[#16232F]">{selected.name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">{isUrdu ? 'ای میل' : 'Email'}</div>
                  <div className="font-semibold text-[#16232F] break-all">{selected.email}</div>
                </div>
                {selected.phone && (
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">{isUrdu ? 'فون' : 'Phone'}</div>
                    <div className="font-semibold text-[#16232F]">{selected.phone}</div>
                  </div>
                )}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">{isUrdu ? 'پیغام' : 'Message'}</div>
                <p className="text-sm text-[#16232F] whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent('Re: ' + (selected.subject || ''))}`}
                  onClick={() => updateContactMessageStatus(getId(selected), 'replied')}
                  className="app-btn-primary app-btn-sm flex items-center gap-1.5"
                >
                  <Reply className="w-4 h-4" />
                  <span>{isUrdu ? 'جواب دیں' : 'Reply'}</span>
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteContactMessage(getId(selected));
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
