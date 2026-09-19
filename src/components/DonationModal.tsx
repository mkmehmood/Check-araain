import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { compressImage } from '../services/firebase';
import { checkRateLimit } from '../utils/security';
import confetti from 'canvas-confetti';
import { 
  X, 
  Heart, 
  Building2, 
  Smartphone, 
  Globe2, 
  Copy, 
  Check, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { FullScreenHeader } from './common/FullScreenHeader';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const { t, isUrdu } = useLanguage();
  const { settings, recordDonation } = useData();

  const [activeTab, setActiveTab] = useState<'details' | 'confirm'>('details');
  const [detailsSubTab, setDetailsSubTab] = useState<'bank' | 'mobile' | 'int'>('bank');
  
  const [selectedAmount, setSelectedAmount] = useState<string>('2500');
  const [customAmount, setCustomAmount] = useState<string>('');

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Confirmation form fields
  const [donorName, setDonorName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState('Bank Transfer (Meezan Bank)');
  const [txId, setTxId] = useState('');
  const [note, setNote] = useState('');
  const [photoData, setPhotoData] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressing(true);
      const base64 = await compressImage(file, 800, 0.75);
      setPhotoData(base64);
    } catch (err: any) {
      console.error('Receipt compression error:', err);
      setErrorMessage(t('errScreenshot', 'Could not load screenshot. Please retry.'));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmitConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Anti-Bot Honeypot
    if (honeypot.trim()) {
      console.warn('Bot donation submission intercepted');
      setSubmittedRefId('DON-' + Date.now().toString().slice(-6));
      return;
    }

    // 2. Submission Rate Limiter (max 3 per minute)
    const rateCheck = checkRateLimit('don_submit', 3, 60000);
    if (!rateCheck.allowed) {
      setErrorMessage(
        isUrdu
          ? `بہت زیادہ کوششیں کی گئی ہیں۔ براہ کرم ${rateCheck.retryAfterSec} سیکنڈ بعد کوشش کریں۔`
          : `Too many submissions. Please wait ${rateCheck.retryAfterSec} seconds.`
      );
      return;
    }

    const finalAmount = customAmount.trim() ? customAmount : selectedAmount;
    if (!donorName.trim()) {
      setErrorMessage(t('errDonorName', 'Please enter donor name.'));
      return;
    }
    if (!phone.trim()) {
      setErrorMessage(t('errPhone', 'Please enter phone / WhatsApp number.'));
      return;
    }

    try {
      setIsSubmitting(true);
      const docId = await recordDonation({
        donorName,
        phone,
        email,
        amount: finalAmount,
        method,
        txId,
        note,
        photoData,
      });

      setSubmittedRefId(docId);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error('Donation confirmation error:', err);
      setErrorMessage(err.message || t('errSubmitDonation', 'Failed to submit payment verification.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSubmittedRefId(null);
    setErrorMessage(null);
    onClose();
  };

  const currentAmountDisplay = customAmount.trim() ? customAmount : selectedAmount;

  return (
    <div className="fixed inset-0 z-50 bg-[#FBF9F4] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
      {/* Complete Screen Sticky Header with Back Navigation */}
      <FullScreenHeader
        title={t('donModalTitle', 'Make a Donation')}
        subtitle={t('donModalSubtitle', 'Support education, welfare, and community initiatives.')}
        badge={t('welfareFundTitle', 'ARAAIN BANNU Welfare Fund')}
        icon={<Heart className="w-4 h-4 fill-current text-amber-300" />}
        onBack={resetAndClose}
      />

      {/* Complete Screen Body Content */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* View Selection Tabs */}
          {!submittedRefId && (
            <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/80 p-2 gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('details')}
                className={`h-11 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'details'
                    ? 'bg-white text-[#AD7A28] shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {t('tabTransferDetails', '1. Transfer Details')}
              </button>
              <button
                onClick={() => setActiveTab('confirm')}
                className={`h-11 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'confirm'
                    ? 'bg-white text-[#AD7A28] shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {t('tabConfirmPaymentStep', '2. Confirm Payment & Receipt')}
              </button>
            </div>
          )}

          {/* Screen Content Body */}
          <div className="p-6 sm:p-8">
          
          {submittedRefId ? (
            /* Success Receipt */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-[#AD7A28] flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-bold text-[#16232F] mb-2">
                {t('donationSuccessTitle', 'Donation Recorded!')}
              </h3>

              <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto mb-6 leading-relaxed">
                {t('donationSuccessDesc')}
              </p>

              <div className="p-4 rounded-xl bg-[#F8F4E8] border border-[#AD7A28]/20 text-center max-w-md mx-auto mb-6">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                  {t('trackingIdLabel', 'Confirmation Tracking ID')}
                </div>
                <div className="text-lg font-mono font-bold text-[#16232F] select-all">
                  {submittedRefId}
                </div>
              </div>

              <button
                onClick={resetAndClose}
                className="app-btn-primary"
              >
                {t('closeModal', 'Close')}
              </button>
            </div>
          ) : activeTab === 'details' ? (
            /* Tab 1: Account details and amounts */
            <div className="space-y-6">
              
              {/* Suggested Amount Pills */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  {t('selectAmount', 'Select or Enter Amount (PKR)')}
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {['1000', '2500', '5000', '10000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                      className={`h-11 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                        selectedAmount === amt && !customAmount
                          ? 'bg-[#AD7A28] text-white border-[#AD7A28] shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#AD7A28]/40 hover:bg-slate-50'
                      }`}
                    >
                      {isUrdu ? `${parseInt(amt).toLocaleString()} روپے` : `PKR ${parseInt(amt).toLocaleString()}`}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  placeholder={t('phEnterCustomAmt', 'Or enter custom amount in PKR...')}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="app-input w-full"
                />
              </div>

              {/* Payment Methods Sub-tabs */}
              <div>
                <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-xl bg-slate-100 mb-4">
                  <button
                    type="button"
                    onClick={() => setDetailsSubTab('bank')}
                    className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      detailsSubTab === 'bank' ? 'bg-white text-[#16232F] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#AD7A28]" />
                    <span>{t('meezanBankTab', 'Meezan Bank')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailsSubTab('mobile')}
                    className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      detailsSubTab === 'mobile' ? 'bg-white text-[#16232F] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#AD7A28]" />
                    <span className="truncate">{t('mobileWalletsTab', 'Wallets')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailsSubTab('int')}
                    className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      detailsSubTab === 'int' ? 'bg-white text-[#16232F] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Globe2 className="w-3.5 h-3.5 text-[#AD7A28]" />
                    <span>{t('swiftWireTab', 'SWIFT Wire')}</span>
                  </button>
                </div>

                {/* Account Details Box */}
                {detailsSubTab === 'bank' && (
                  <div className="p-4 rounded-2xl bg-[#F8F4E8] border border-[#AD7A28]/20 space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-[#AD7A28]/15">
                      <span className="text-slate-600">{t('fieldBankName')}:</span>
                      <span className="font-bold text-[#16232F]">{settings.bankName}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#AD7A28]/15">
                      <span className="text-slate-600">{t('fieldAccountTitle')}:</span>
                      <span className="font-bold text-[#16232F]">{settings.bankTitle}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#AD7A28]/15">
                      <span className="text-slate-600">{t('fieldAccountNumber')}:</span>
                      {settings.bankAccount ? (
                        <div className="flex items-center gap-2 font-mono font-bold text-[#16232F]">
                          <span>{settings.bankAccount}</span>
                          <button
                            onClick={() => copyToClipboard(settings.bankAccount, 'bankAcc')}
                            className="p-1 rounded hover:bg-[#AD7A28]/20 text-[#AD7A28] cursor-pointer"
                            title="Copy Account Number"
                          >
                            {copiedField === 'bankAcc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-800/80 italic font-medium">
                          {isUrdu ? 'کونسل آفس سے رابطہ فرمائیں' : 'Contact office for account #'}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#AD7A28]/15">
                      <span className="text-slate-600">{t('fieldIBAN')}:</span>
                      {settings.bankIBAN ? (
                        <div className="flex items-center gap-2 font-mono font-bold text-[#16232F]">
                          <span className="text-xs break-all">{settings.bankIBAN}</span>
                          <button
                            onClick={() => copyToClipboard(settings.bankIBAN, 'iban')}
                            className="p-1 rounded hover:bg-[#AD7A28]/20 text-[#AD7A28] cursor-pointer"
                            title="Copy IBAN"
                          >
                            {copiedField === 'iban' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-800/80 italic font-medium">
                          {isUrdu ? 'کونسل آفس سے رابطہ فرمائیں' : 'Available upon request'}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600">{t('fieldBranchCode')}:</span>
                      <span className="font-medium text-[#16232F]">{settings.bankBranch}</span>
                    </div>

                    {settings.bankQrCode && (
                      <div className="pt-3 border-t border-[#AD7A28]/20 flex flex-col items-center justify-center text-center">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                          {isUrdu ? 'براہ راست اسکین کیو آر کوڈ' : 'Scan to Pay Direct QR Code'}
                        </span>
                        <div className="p-2 bg-white rounded-xl border border-[#AD7A28]/30 shadow-xs inline-block">
                          <img
                            src={settings.bankQrCode}
                            alt="Bank Scan QR"
                            className="w-36 h-36 sm:w-44 sm:h-44 object-contain rounded-lg"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1.5">
                          {isUrdu ? 'کسی بھی بینکنگ ایپ سے اسکین کر کے رقم منتقل کریں' : 'Scan via your banking app to transfer directly'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {detailsSubTab === 'mobile' && (
                  <div className="space-y-3 text-xs sm:text-sm">
                    {/* Easypaisa */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                      <div className="font-bold text-emerald-800 text-sm flex items-center justify-between">
                        <span>{t('fieldEasypaisa', 'Easypaisa Mobile Account')}</span>
                        <button
                          onClick={() => copyToClipboard(settings.epNumber, 'epNum')}
                          className="px-2 py-1 rounded bg-white text-emerald-700 font-mono text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          {copiedField === 'epNum' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'epNum' ? t('copiedBtn', 'Copied') : t('copyBtn', 'Copy')}</span>
                        </button>
                      </div>
                      <div className="text-slate-600">{t('titleLabel', 'Title')}: <strong>{settings.epTitle}</strong></div>
                      <div className="text-slate-900 font-mono font-bold text-base">{settings.epNumber}</div>

                      {settings.epQrCode && (
                        <div className="pt-2 border-t border-emerald-200/80 flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
                            {isUrdu ? 'ایزی پیسہ کیو آر کوڈ' : 'Easypaisa QR Code'}
                          </span>
                          <div className="p-1.5 bg-white rounded-xl border border-emerald-300 shadow-xs inline-block">
                            <img
                              src={settings.epQrCode}
                              alt="Easypaisa QR"
                              className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* JazzCash */}
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                      <div className="font-bold text-amber-900 text-sm flex items-center justify-between">
                        <span>{t('fieldJazzcash', 'JazzCash Mobile Account')}</span>
                        <button
                          onClick={() => copyToClipboard(settings.jcNumber, 'jcNum')}
                          className="px-2 py-1 rounded bg-white text-amber-800 font-mono text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          {copiedField === 'jcNum' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'jcNum' ? t('copiedBtn', 'Copied') : t('copyBtn', 'Copy')}</span>
                        </button>
                      </div>
                      <div className="text-slate-600">{t('titleLabel', 'Title')}: <strong>{settings.jcTitle}</strong></div>
                      <div className="text-slate-900 font-mono font-bold text-base">{settings.jcNumber}</div>

                      {settings.jcQrCode && (
                        <div className="pt-2 border-t border-amber-200/80 flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1.5">
                            {isUrdu ? 'جاز کیش کیو آر کوڈ' : 'JazzCash QR Code'}
                          </span>
                          <div className="p-1.5 bg-white rounded-xl border border-amber-300 shadow-xs inline-block">
                            <img
                              src={settings.jcQrCode}
                              alt="JazzCash QR"
                              className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {detailsSubTab === 'int' && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-blue-200">
                      <span className="text-slate-600">{t('beneficiaryBank', 'Beneficiary Bank')}:</span>
                      <span className="font-bold text-[#16232F]">{settings.intBank}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-blue-200">
                      <span className="text-slate-600">{t('swiftBic', 'SWIFT / BIC')}:</span>
                      <span className="font-mono font-bold text-[#16232F]">{settings.intSwift}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600">{t('fieldIBAN', 'IBAN')}:</span>
                      <span className="font-mono font-bold text-[#16232F] text-xs">{settings.intIBAN}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Next Step CTA */}
              <button
                type="button"
                onClick={() => setActiveTab('confirm')}
                className="app-btn-primary app-btn-lg app-btn-full"
              >
                {t('fundsSentSubmitProof', 'I Have Sent Funds — Submit Proof')}
              </button>

            </div>
          ) : (
            /* Tab 2: Confirm donation transaction proof */
            <form onSubmit={handleSubmitConfirmation} className="space-y-4">
              {/* Anti-Bot Honeypot */}
              <input
                type="text"
                name="user_confirm_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
                style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
              />
              
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-[#F8F4E8] border border-[#AD7A28]/20 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-600">{t('recordedAmount', 'Recorded Amount')}:</span>
                <span className="font-bold text-[#AD7A28] text-base">
                  {isUrdu ? `${(currentAmountDisplay || '2,500')} روپے` : `PKR ${currentAmountDisplay || '2,500'}`}
                </span>
              </div>

              {/* Row 1: Donor Name & Phone - 2 fields per row */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('fieldDonorName', 'Donor Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder={t('phDonorName', 'e.g. Asad Chaudhary')}
                    className="app-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('fieldDonorPhone', 'Phone / WhatsApp')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('phDonorPhone', '+92 300 0000000')}
                    className="app-input w-full"
                  />
                </div>
              </div>

              {/* Row 2: Email & Payment Method - 2 fields per row */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('fieldEmail', 'Email Address')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('phEmail', 'you@domain.com')}
                    className="app-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('fieldPaymentMethod', 'Payment Method')}
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="app-input w-full bg-white"
                  >
                    <option value="Bank Transfer (Meezan Bank)">{t('optMeezanBank', 'Bank Transfer (Meezan Bank)')}</option>
                    <option value="Easypaisa">{t('optEasypaisa', 'Easypaisa')}</option>
                    <option value="JazzCash">{t('optJazzcash', 'JazzCash')}</option>
                    <option value="International Wire / SWIFT">{t('optInternationalTransfer', 'International Wire / SWIFT')}</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Transaction ID & Purpose Note - 2 fields per row */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('fieldTxId', 'Transaction ID / Reference')}
                  </label>
                  <input
                    type="text"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder={t('phTxnRef', 'e.g. TXN-98765432')}
                    className="app-input w-full font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('fieldDonationNote', 'Donation Purpose / Note (Optional)')}
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t('phDonationNote', 'e.g. Education scholarship, medical camp')}
                    className="app-input w-full"
                  />
                </div>
              </div>

              {/* Upload Payment Screenshot */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  {t('fieldProofPhoto', 'Upload Payment Screenshot / Slip')}
                </label>

                <div className="flex items-center gap-4">
                  {photoData ? (
                    <div className="relative">
                      <img
                        src={photoData}
                        alt="Receipt"
                        className="w-20 h-20 rounded-xl object-cover border-2 border-[#AD7A28]"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoData('')}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <FileCheck className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isCompressing}
                      className="app-btn-secondary app-btn-sm"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#AD7A28]" />
                      <span>{photoData ? t('changeScreenshot', 'Change Screenshot') : t('uploadScreenshot', 'Upload Screenshot')}</span>
                    </button>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {t('screenshotHelp', 'Helps our accounts department verify and acknowledge immediately.')}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="app-btn-primary app-btn-lg app-btn-full"
              >
                {isSubmitting ? t('btnSubmitting', 'Submitting...') : t('btnSubmitDonation', 'Submit Confirmation')}
              </button>

            </form>
          )}

          </div>
        </div>
      </div>
    </div>
  );
};
