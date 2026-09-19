import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types';
import { ImageUploadField } from './ImageUploadField';
import { SaveBar } from './SaveBar';
import { pushSettingsDocToCloud } from '../../services/firebase';
import { 
  Building2, 
  Smartphone, 
  Globe2, 
  QrCode, 
  CreditCard,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface BankCmsProps {
  settings: SiteSettings;
  onSaved: (patch: Partial<SiteSettings>) => void;
  isUrdu: boolean;
}

export const BankCms: React.FC<BankCmsProps> = ({
  settings,
  onSaved,
  isUrdu,
}) => {
  const [formData, setFormData] = useState({
    bankName: settings.bankName || '',
    bankTitle: settings.bankTitle || '',
    bankAccount: settings.bankAccount || '',
    bankIBAN: settings.bankIBAN || '',
    bankBranch: settings.bankBranch || '',
    bankSwift: settings.bankSwift || '',
    bankQrCode: settings.bankQrCode || '',
    epTitle: settings.epTitle || '',
    epNumber: settings.epNumber || '',
    epQrCode: settings.epQrCode || '',
    jcTitle: settings.jcTitle || '',
    jcNumber: settings.jcNumber || '',
    jcQrCode: settings.jcQrCode || '',
    intBank: settings.intBank || '',
    intSwift: settings.intSwift || '',
    intIBAN: settings.intIBAN || '',
    raastId: settings.raastId || '',
    raastTitle: settings.raastTitle || '',
    raastQrCode: settings.raastQrCode || '',
  });

  const [activeSubTab, setActiveSubTab] = useState<'bank' | 'wallets' | 'raast' | 'intl'>('bank');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      bankName: settings.bankName || '',
      bankTitle: settings.bankTitle || '',
      bankAccount: settings.bankAccount || '',
      bankIBAN: settings.bankIBAN || '',
      bankBranch: settings.bankBranch || '',
      bankSwift: settings.bankSwift || '',
      bankQrCode: settings.bankQrCode || '',
      epTitle: settings.epTitle || '',
      epNumber: settings.epNumber || '',
      epQrCode: settings.epQrCode || '',
      jcTitle: settings.jcTitle || '',
      jcNumber: settings.jcNumber || '',
      jcQrCode: settings.jcQrCode || '',
      intBank: settings.intBank || '',
      intSwift: settings.intSwift || '',
      intIBAN: settings.intIBAN || '',
      raastId: settings.raastId || '',
      raastTitle: settings.raastTitle || '',
      raastQrCode: settings.raastQrCode || '',
    });
    setIsDirty(false);
  }, [settings]);

  const updateField = (key: string, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg(isUrdu ? 'محفوظ کیا جا رہا ہے...' : 'Saving to Firestore...');
    try {
      await pushSettingsDocToCloud('donation', formData);
      onSaved(formData);
      setLastSaved(new Date().toISOString());
      setIsDirty(false);
      setStatusMsg(isUrdu ? 'کامیابی سے محفوظ ہو گیا' : 'Saved successfully');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setStatusMsg((isUrdu ? 'خرابی: ' : 'Error: ') + (err.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-[#AD7A28]">
            <Building2 className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
              Firestore: siteConfig/donation
            </span>
            <h3 className="text-lg font-bold text-[#16232F] mt-0.5">
              {isUrdu ? 'بینک اکاؤنٹس، ایزی پیسہ، جاز کیش و راست' : 'Bank, JazzCash, EasyPaisa & Raast'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'عطیات کی وصولی کے تمام سرکاری اکاؤنٹس اور ادائیگی کے کیو آر کوڈز'
                : 'Configure official donation receiving bank accounts, mobile wallets, and scan QR codes.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab('bank')}
          className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'bank' ? 'bg-white text-[#AD7A28] shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{isUrdu ? 'کمرشل بینک' : 'Meezan Bank'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('wallets')}
          className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'wallets' ? 'bg-white text-emerald-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>{isUrdu ? 'ایزی پیسہ / جاز کیش' : 'Mobile Wallets'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('raast')}
          className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'raast' ? 'bg-white text-amber-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>{isUrdu ? 'راست آئی ڈی' : 'SBP Raast'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('intl')}
          className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'intl' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>{isUrdu ? 'بین الاقوامی وائر' : 'SWIFT / Overseas'}</span>
        </button>
      </div>

      {/* Tab 1: Commercial Bank */}
      {activeSubTab === 'bank' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isUrdu ? 'بینک کا نام (Bank Name)' : 'Bank Name'}
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => updateField('bankName', e.target.value)}
                placeholder="e.g. Meezan Bank Limited"
                className="app-input font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isUrdu ? 'اکاؤنٹ ٹائٹل (Account Title)' : 'Account Title'}
              </label>
              <input
                type="text"
                value={formData.bankTitle}
                onChange={(e) => updateField('bankTitle', e.target.value)}
                placeholder="e.g. ARAAIN WELFARE ASSOCIATION BANNU"
                className="app-input font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isUrdu ? 'اکاؤنٹ نمبر (Account Number)' : 'Account Number'}
              </label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => updateField('bankAccount', e.target.value)}
                placeholder="e.g. 01010102558899"
                className="app-input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isUrdu ? 'آئی بی اے این (IBAN)' : 'IBAN'}
              </label>
              <input
                type="text"
                value={formData.bankIBAN}
                onChange={(e) => updateField('bankIBAN', e.target.value)}
                placeholder="e.g. PK89MEZN0001010102558899"
                className="app-input font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isUrdu ? 'برانچ کا نام و کوڈ (Branch)' : 'Branch & Code'}
              </label>
              <input
                type="text"
                value={formData.bankBranch}
                onChange={(e) => updateField('bankBranch', e.target.value)}
                placeholder="e.g. Bannu City Branch (Code: 0101)"
                className="app-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isUrdu ? 'سوئفٹ کوڈ (SWIFT/BIC)' : 'SWIFT / BIC Code'}
              </label>
              <input
                type="text"
                value={formData.bankSwift}
                onChange={(e) => updateField('bankSwift', e.target.value)}
                placeholder="e.g. MEZNPKKA"
                className="app-input font-mono uppercase"
              />
            </div>
          </div>

          <ImageUploadField
            label={isUrdu ? 'بینک اکاؤنٹ اسکین کیو آر کوڈ (Bank QR Code)' : 'Bank Scan-to-Pay QR Code'}
            value={formData.bankQrCode}
            onChange={(val) => updateField('bankQrCode', val)}
            aspectRatio="square"
            maxWidth={500}
            quality={0.9}
            isUrdu={isUrdu}
          />
        </div>
      )}

      {/* Tab 2: Wallets (EasyPaisa & JazzCash) */}
      {activeSubTab === 'wallets' && (
        <div className="space-y-6 animate-fadeIn">
          {/* EasyPaisa Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase pb-2 border-b border-slate-100">
              <Smartphone className="w-4 h-4" />
              <span>EasyPaisa Wallet</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isUrdu ? 'ایزی پیسہ اکاؤنٹ ٹائٹل' : 'EasyPaisa Account Title'}
                </label>
                <input
                  type="text"
                  value={formData.epTitle}
                  onChange={(e) => updateField('epTitle', e.target.value)}
                  placeholder="e.g. Muhammad Tahir"
                  className="app-input font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isUrdu ? 'ایزی پیسہ موبائل نمبر' : 'EasyPaisa Mobile Number'}
                </label>
                <input
                  type="text"
                  value={formData.epNumber}
                  onChange={(e) => updateField('epNumber', e.target.value)}
                  placeholder="e.g. 0331-9051410"
                  className="app-input font-mono"
                />
              </div>
            </div>

            <ImageUploadField
              label={isUrdu ? 'ایزی پیسہ کیو آر کوڈ' : 'EasyPaisa Scan QR Code'}
              value={formData.epQrCode}
              onChange={(val) => updateField('epQrCode', val)}
              aspectRatio="square"
              maxWidth={500}
              quality={0.9}
              isUrdu={isUrdu}
            />
          </div>

          {/* JazzCash Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase pb-2 border-b border-slate-100">
              <Smartphone className="w-4 h-4" />
              <span>JazzCash Wallet</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isUrdu ? 'جاز کیش اکاؤنٹ ٹائٹل' : 'JazzCash Account Title'}
                </label>
                <input
                  type="text"
                  value={formData.jcTitle}
                  onChange={(e) => updateField('jcTitle', e.target.value)}
                  placeholder="e.g. Muhammad Tahir"
                  className="app-input font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isUrdu ? 'جاز کیش موبائل نمبر' : 'JazzCash Mobile Number'}
                </label>
                <input
                  type="text"
                  value={formData.jcNumber}
                  onChange={(e) => updateField('jcNumber', e.target.value)}
                  placeholder="e.g. 0300-1234567"
                  className="app-input font-mono"
                />
              </div>
            </div>

            <ImageUploadField
              label={isUrdu ? 'جاز کیش کیو آر کوڈ' : 'JazzCash Scan QR Code'}
              value={formData.jcQrCode}
              onChange={(val) => updateField('jcQrCode', val)}
              aspectRatio="square"
              maxWidth={500}
              quality={0.9}
              isUrdu={isUrdu}
            />
          </div>
        </div>
      )}

      {/* Tab 3: Raast */}
      {activeSubTab === 'raast' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isUrdu ? 'راست آئی ڈی (Raast ID / Mobile)' : 'State Bank Raast ID'}
              </label>
              <input
                type="text"
                value={formData.raastId}
                onChange={(e) => updateField('raastId', e.target.value)}
                placeholder="e.g. 03319051410"
                className="app-input font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isUrdu ? 'راست اکاؤنٹ ٹائٹل' : 'Raast Account Title'}
              </label>
              <input
                type="text"
                value={formData.raastTitle}
                onChange={(e) => updateField('raastTitle', e.target.value)}
                placeholder="e.g. Araain Bannu Welfare"
                className="app-input font-bold"
              />
            </div>
          </div>

          <ImageUploadField
            label={isUrdu ? 'راست ادائیگی کیو آر کوڈ' : 'State Bank Raast Scan QR Code'}
            value={formData.raastQrCode}
            onChange={(val) => updateField('raastQrCode', val)}
            aspectRatio="square"
            maxWidth={500}
            quality={0.9}
            isUrdu={isUrdu}
          />
        </div>
      )}

      {/* Tab 4: International */}
      {activeSubTab === 'intl' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5 animate-fadeIn">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isUrdu ? 'بین الاقوامی بینک کا نام' : 'International Bank Name'}
            </label>
            <input
              type="text"
              value={formData.intBank}
              onChange={(e) => updateField('intBank', e.target.value)}
              placeholder="e.g. Meezan Bank Ltd, Head Office, Karachi, Pakistan"
              className="app-input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isUrdu ? 'بین الاقوامی IBAN' : 'International IBAN'}
              </label>
              <input
                type="text"
                value={formData.intIBAN}
                onChange={(e) => updateField('intIBAN', e.target.value)}
                placeholder="e.g. PK89MEZN0001010102558899"
                className="app-input font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isUrdu ? 'بین الاقوامی SWIFT کوڈ' : 'International SWIFT Code'}
              </label>
              <input
                type="text"
                value={formData.intSwift}
                onChange={(e) => updateField('intSwift', e.target.value)}
                placeholder="e.g. MEZNPKKA"
                className="app-input font-mono uppercase"
              />
            </div>
          </div>
        </div>
      )}

      <SaveBar
        onSave={handleSave}
        isDirty={isDirty}
        isSaving={isSaving}
        lastSaved={lastSaved}
        statusMessage={statusMsg}
        isUrdu={isUrdu}
        onReset={() => {
          setFormData({
            bankName: settings.bankName || '',
            bankTitle: settings.bankTitle || '',
            bankAccount: settings.bankAccount || '',
            bankIBAN: settings.bankIBAN || '',
            bankBranch: settings.bankBranch || '',
            bankSwift: settings.bankSwift || '',
            bankQrCode: settings.bankQrCode || '',
            epTitle: settings.epTitle || '',
            epNumber: settings.epNumber || '',
            epQrCode: settings.epQrCode || '',
            jcTitle: settings.jcTitle || '',
            jcNumber: settings.jcNumber || '',
            jcQrCode: settings.jcQrCode || '',
            intBank: settings.intBank || '',
            intSwift: settings.intSwift || '',
            intIBAN: settings.intIBAN || '',
            raastId: settings.raastId || '',
            raastTitle: settings.raastTitle || '',
            raastQrCode: settings.raastQrCode || '',
          });
          setIsDirty(false);
        }}
      />
    </div>
  );
};
