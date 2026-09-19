import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { Registration } from '../../types';
import QRCode from 'qrcode';
import { Printer, ShieldCheck, Download, Check, Eye, Sliders, Palette, Calendar, RefreshCw, CheckCircle2, ScanLine, X } from 'lucide-react';
import { testDecodeQrDataUrl, ExtractedMemberData } from '../../utils/qrScanner';
import { formatIssueDate } from '../../services/firebase';
import { 
  translateNameToEnglish, 
  translateAddressToEnglish, 
  translateOccupationToEnglish, 
  translateCityToEnglish, 
  translateStateToEnglish, 
  translateCountryToEnglish, 
  translateGenderToEnglish, 
  translateMembershipTypeToEnglish,
  translateResidentialStatusToEnglish,
  translateEducationToEnglish,
  translateNameToUrdu, 
  translateAddressToUrdu, 
  translateOccupationToUrdu, 
  translateCityToUrdu, 
  translateStateToUrdu, 
  translateCountryToUrdu, 
  translateGenderToUrdu, 
  translateMembershipTypeToUrdu,
  translateResidentialStatusToUrdu,
  translateEducationToUrdu
} from '../../utils/urduTransliterator';

interface MembershipCardModalProps {
  registration: Registration | null;
  onClose: () => void;
}

export const MembershipCardModal: React.FC<MembershipCardModalProps> = ({
  registration,
  onClose,
}) => {
  const { t, isUrdu } = useLanguage();
  const { settings, getOrCreateMemberCardId } = useData();

  const [cardId, setCardId] = useState<string>('');
  const [issueDateIso, setIssueDateIso] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrPayloadText, setQrPayloadText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [showPayloadModal, setShowPayloadModal] = useState(false);

  // Custom Website & Card Generator Branding Controls
  const [customTitle, setCustomTitle] = useState(settings.siteNameEn || 'ARAAIN BANNU WELFARE ASSOCIATION');
  const [customSubtitle, setCustomSubtitle] = useState('Khyber Pakhtunkhwa, Pakistan');
  const [customSignatory, setCustomSignatory] = useState('Authorized Signatory / President');
  const [customExpiry, setCustomExpiry] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [customWebsite, setCustomWebsite] = useState('www.araainbannu.org');
  const [cardTheme, setCardTheme] = useState<'gold' | 'emerald' | 'navy' | 'crimson'>('gold');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [mobileFace, setMobileFace] = useState<'both' | 'front' | 'back'>('both');
  const [qrTestResult, setQrTestResult] = useState<{
    tested: boolean;
    success: boolean;
    extracted?: ExtractedMemberData;
  } | null>(null);
  const [testingQr, setTestingQr] = useState(false);

  // Resolved English values for the card (English-only card)
  const englishFullName = registration ? (registration.fullNameEn || translateNameToEnglish(registration.fullName)) : '';
  const englishFatherName = registration ? (registration.fatherNameEn || translateNameToEnglish(registration.fatherName)) : '';
  const englishCaste = registration ? (registration.casteEn || registration.caste || 'Araain') : 'Araain';
  const urduCaste = registration ? (registration.casteUr || registration.caste || 'آرائیں') : 'آرائیں';
  const englishWork = registration ? (registration.workEn || translateOccupationToEnglish(registration.work || '')) : '';
  const englishVillage = registration ? (registration.villageEn || registration.village || registration.streetEn || (registration.street ? translateAddressToEnglish(registration.street) : '')) : '';
  const englishTehsil = registration ? (registration.tehsilEn || registration.tehsil || '') : '';
  const englishDistrict = registration ? (registration.districtEn || registration.district || registration.cityEn || translateCityToEnglish(registration.city)) : 'Bannu';
  const englishProvince = registration ? (registration.provinceEn || registration.province || registration.stateEn || translateStateToEnglish(registration.state || 'KPK')) : 'KPK';
  const englishCountry = registration ? (registration.countryEn || translateCountryToEnglish(registration.country || 'Pakistan')) : 'Pakistan';
  const englishGender = registration ? (registration.genderEn || translateGenderToEnglish(registration.gender)) : 'Male';
  const englishType = registration ? (registration.membershipTypeEn || translateMembershipTypeToEnglish(registration.membershipType)) : 'General Member';
  const englishEducation = registration ? (registration.educationEn || translateEducationToEnglish(registration.education || '')) : '';
  const englishResidentialStatus = registration ? (registration.residentialStatusEn || translateResidentialStatusToEnglish(registration.residentialStatus)) : 'Resident (Pakistan)';

  const fullEnglishAddress = [
    englishVillage,
    englishTehsil && englishTehsil.toLowerCase() !== englishDistrict.toLowerCase() ? `Tehsil ${englishTehsil}` : (englishTehsil ? englishTehsil : ''),
    englishDistrict,
    englishProvince,
  ].filter(Boolean).join(', ');

  const themeMap = {
    gold: {
      headerGrad: 'from-[#16232F] via-[#1E3040] to-[#16232F]',
      borderAccent: '#AD7A28',
      textAccent: '#F5CA7B',
      badgeBg: 'bg-[#AD7A28]',
      badgeText: 'text-white',
      footerBg: 'bg-[#F8F5EE]',
      footerAccent: 'text-[#AD7A28]',
    },
    emerald: {
      headerGrad: 'from-[#064E3B] via-[#047857] to-[#064E3B]',
      borderAccent: '#10B981',
      textAccent: '#6EE7B7',
      badgeBg: 'bg-[#059669]',
      badgeText: 'text-white',
      footerBg: 'bg-[#ECFDF5]',
      footerAccent: 'text-[#059669]',
    },
    navy: {
      headerGrad: 'from-[#0F172A] via-[#1E293B] to-[#0F172A]',
      borderAccent: '#38BDF8',
      textAccent: '#7DD3FC',
      badgeBg: 'bg-[#0284C7]',
      badgeText: 'text-white',
      footerBg: 'bg-[#F0F9FF]',
      footerAccent: 'text-[#0284C7]',
    },
    crimson: {
      headerGrad: 'from-[#4C0519] via-[#881337] to-[#4C0519]',
      borderAccent: '#FB7185',
      textAccent: '#FECDD3',
      badgeBg: 'bg-[#E11D48]',
      badgeText: 'text-white',
      footerBg: 'bg-[#FFF1F2]',
      footerAccent: 'text-[#E11D48]',
    },
  };
  const activeTheme = themeMap[cardTheme] || themeMap.gold;

  useEffect(() => {
    if (!registration) return;

    let isMounted = true;
    const initCard = async () => {
      setIsLoading(true);
      try {
        const { cardId: id, approvedAt } = await getOrCreateMemberCardId(registration);
        if (!isMounted) return;
        setCardId(id);
        setIssueDateIso(approvedAt);

        // Translated Urdu values for bidirectional record
        const urduFullName = registration.fullNameUr || translateNameToUrdu(registration.fullName);
        const urduFatherName = registration.fatherNameUr || translateNameToUrdu(registration.fatherName);
        const urduWork = registration.workUr || translateOccupationToUrdu(registration.work || '');
        const urduVillage = registration.villageUr || registration.village || registration.streetUr || (registration.street ? translateAddressToUrdu(registration.street) : '');
        const urduTehsil = registration.tehsilUr || registration.tehsil || '';
        const urduDistrict = registration.districtUr || registration.district || registration.cityUr || translateCityToUrdu(registration.city);
        const urduProvince = registration.provinceUr || registration.province || registration.stateUr || translateStateToUrdu(registration.state || 'KPK');
        const urduCountry = registration.countryUr || translateCountryToUrdu(registration.country || 'Pakistan');
        const urduGender = registration.genderUr || translateGenderToUrdu(registration.gender);
        const urduMemberType = registration.membershipTypeUr || translateMembershipTypeToUrdu(registration.membershipType);
        const urduResidentStatus = registration.residentialStatusUr || translateResidentialStatusToUrdu(registration.residentialStatus);
        const urduEducation = registration.educationUr || translateEducationToUrdu(registration.education || '');
        const urduAddress = [
          urduVillage,
          urduTehsil && urduTehsil !== urduDistrict ? `تحصیل ${urduTehsil}` : (urduTehsil ? urduTehsil : ''),
          urduDistrict ? `ضلع ${urduDistrict}` : '',
          urduProvince,
        ].filter(Boolean).join('، ');

        // Construct COMPLETE QR CODE PAYLOAD with web verification link at the top:
        const verifyUrl = typeof window !== 'undefined' ? `${window.location.origin}/?verify=${id}` : `https://araainbannu.org/?verify=${id}`;
        const comprehensiveQrPayload = [
          verifyUrl,
          `═══ ARAAIN BANNU KPK OFFICIAL MEMBER ═══`,
          `Card ID: ${id}`,
          // The real, one-time-stamped approval/issue date - embedding it
          // here is what lets a scan later read the true issue date back
          // out, instead of falling back to "today" (the scan date).
          `Issued Date: ${formatIssueDate(approvedAt)}`,
          `Full Name (English): ${englishFullName}`,
          `نام (Urdu): ${urduFullName}`,
          `Father / Guardian (English): ${englishFatherName}`,
          `ولدیت (Urdu): ${urduFatherName}`,
          `Caste / قومیت: ${englishCaste} (${urduCaste})`,
          `CNIC: ${registration.cnic || '—'}`,
          `DOB: ${registration.dob || '—'}`,
          `Gender: ${englishGender} (${urduGender})`,
          `Membership Type: ${englishType} (${urduMemberType})`,
          `WhatsApp / Phone: ${registration.whatsapp}`,
          `Email: ${registration.email || '—'}`,
          `Residential Status: ${englishResidentialStatus} (${urduResidentStatus})`,
          `Affiliated Org: ${registration.affiliated || 'None'}`,
          `Education: ${englishEducation || '—'} (${urduEducation})`,
          `Occupation / Work: ${englishWork || '—'} (${urduWork})`,
          `Reason / Interest: ${registration.reason || 'Community Welfare'}`,
          `Address (English): ${fullEnglishAddress}`,
          `پتہ (Urdu): ${urduAddress}`,
          `Submitted Date: ${registration.submittedAt ? (typeof registration.submittedAt === 'string' ? registration.submittedAt : new Date(registration.submittedAt.seconds * 1000).toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10)}`,
          `Verification: Official Verified Member`,
          `Authority: Executive Council Araain Bannu`,
          `Portal: ${verifyUrl}`,
        ].join('\n');

        setQrPayloadText(comprehensiveQrPayload);

        // Generate High-Density QR code containing ALL registration data
        const qrData = await QRCode.toDataURL(comprehensiveQrPayload, {
          width: 320,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#16232F',
            light: '#FFFFFF',
          },
        });

        if (isMounted) setQrCodeUrl(qrData);
      } catch (err) {
        console.error('Error generating card and QR:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initCard();
    return () => { isMounted = false; };
  }, [registration, englishFullName, englishFatherName, englishWork, fullEnglishAddress, englishGender, englishType, englishEducation, englishResidentialStatus]);

  if (!registration) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleTestQrCodeScan = async () => {
    if (!qrCodeUrl) return;
    setTestingQr(true);
    try {
      const res = await testDecodeQrDataUrl(qrCodeUrl);
      setQrTestResult({
        tested: true,
        success: res.success,
        extracted: res.extracted,
      });
    } catch {
      setQrTestResult({
        tested: true,
        success: false,
      });
    } finally {
      setTestingQr(false);
    }
  };

  const copyQrData = () => {
    if (!qrPayloadText) return;
    navigator.clipboard.writeText(qrPayloadText);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // The card's real issue date - the moment the admin approved this member /
  // the card was first ever generated. Resolved once via getOrCreateMemberCardId
  // above and never recomputed here; do NOT replace this with `new Date()`.
  const issueDate = issueDateIso ? issueDateIso.slice(0, 10) : '';

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1922] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
      {/* Print stylesheet for ISO/IEC 7810 ID-1 standard physical card printing (85.60 mm x 53.98 mm) */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 6mm;
          }
          body * {
            visibility: hidden;
          }
          #printable-card-area, #printable-card-area * {
            visibility: visible;
          }
          #printable-card-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 8mm !important;
            justify-content: center !important;
            align-items: center !important;
            background: transparent !important;
            padding: 0 !important;
          }
          .cr80-standard-card {
            width: 85.6mm !important;
            height: 53.98mm !important;
            min-width: 85.6mm !important;
            min-height: 53.98mm !important;
            max-width: 85.6mm !important;
            max-height: 53.98mm !important;
            box-shadow: none !important;
            border: 0.5pt solid #999 !important;
            border-radius: 3.18mm !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Full-Screen Top Navigation Control Bar */}
      <div className="no-print sticky top-0 z-30 bg-[#16232F] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-[#AD7A28]/30 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="app-btn-icon"
            aria-label="Close"
            title={isUrdu ? 'بند کریں' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#AD7A28]/20 flex items-center justify-center text-[#F5CA7B]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">
                Official Membership ID Card (Standard CR80 Size)
              </div>
              <div className="text-[11px] text-slate-400">
                {englishFullName} ({cardId || 'ID Pending'}) • English ID Card & Full QR Payload
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestQrCodeScan}
            disabled={testingQr || !qrCodeUrl}
            className="app-btn-success app-btn-sm !bg-emerald-600/30 hover:!bg-emerald-600/50 !text-emerald-300 border border-emerald-500/40 !shadow-none"
            title="Test QR Code scanner and verify accurate data extraction with jsQR"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{testingQr ? 'Scanning QR...' : 'Verify QR Scan'}</span>
          </button>

          <button
            onClick={() => setShowCustomizer(!showCustomizer)}
            className={`app-btn-sm !rounded-lg inline-flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
              showCustomizer ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-white/10 hover:bg-white/15 text-slate-200'
            }`}
            title="Customize Card Template & Council Branding"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>

          <button
            onClick={handlePrint}
            className="app-btn-primary app-btn-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Screen Body Content */}
      <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 flex flex-col items-center">
        <div className="bg-white rounded-3xl w-full shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Card Customizer Drawer */}
        {showCustomizer && (
          <div className="no-print bg-slate-900 text-slate-200 px-4 sm:px-6 py-4 border-b border-slate-700 text-xs animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Sliders className="w-4 h-4" />
                <span>Card Template & Council Branding Customizer</span>
              </div>
              <button
                onClick={() => {
                  setCustomTitle(settings.siteNameEn || 'ARAAIN BANNU WELFARE ASSOCIATION');
                  setCustomSubtitle('Khyber Pakhtunkhwa, Pakistan');
                  setCustomSignatory('Authorized Signatory / President');
                  setCustomWebsite('www.araainbannu.org');
                  setCardTheme('gold');
                }}
                className="app-btn-link text-[11px] text-slate-400 hover:text-white"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Association Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Council / Chapter Subtitle</label>
                <input
                  type="text"
                  value={customSubtitle}
                  onChange={(e) => setCustomSubtitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Signatory Title</label>
                <input
                  type="text"
                  value={customSignatory}
                  onChange={(e) => setCustomSignatory(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Valid Thru / Expiry Date</label>
                <input
                  type="text"
                  value={customExpiry}
                  onChange={(e) => setCustomExpiry(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Card Color Scheme:</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'gold', name: 'Gold & Navy', hex: '#AD7A28' },
                    { id: 'emerald', name: 'Emerald KP', hex: '#10B981' },
                    { id: 'navy', name: 'Royal Navy', hex: '#0284C7' },
                    { id: 'crimson', name: 'Crimson', hex: '#E11D48' },
                  ].map((th) => (
                    <button
                      key={th.id}
                      onClick={() => setCardTheme(th.id as any)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        cardTheme === th.id ? 'ring-2 ring-white text-white' : 'opacity-70 hover:opacity-100 text-slate-300'
                      }`}
                      style={{ backgroundColor: th.hex }}
                    >
                      <span>{th.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Website URL:</span>
                <input
                  type="text"
                  value={customWebsite}
                  onChange={(e) => setCustomWebsite(e.target.value)}
                  className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-amber-300 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* View QR Payload Details Drawer/Modal (if opened) */}
        {showPayloadModal && (
          <div className="no-print bg-slate-900 text-slate-200 px-6 py-4 border-b border-slate-700 text-xs animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-300">
                All User Registration Data Encoded in QR Code:
              </span>
              <button
                onClick={copyQrData}
                className="app-btn-primary app-btn-sm !text-[11px]"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                <span>{copiedPayload ? 'Copied!' : 'Copy Payload'}</span>
              </button>
            </div>
            <pre className="bg-black/50 p-3 rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed text-emerald-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {qrPayloadText}
            </pre>
          </div>
        )}

        {/* Card Stage Container */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-200/70 flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6">
          
          {/* QR Verification Test Banner (when tested) */}
          {qrTestResult && (
            <div className={`no-print w-full max-w-4xl p-3.5 rounded-2xl border text-xs shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn ${
              qrTestResult.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}>
              <div className="flex items-start gap-2.5">
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  qrTestResult.success ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'
                }`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    <span>{qrTestResult.success ? 'QR Code Scanned & Verified with 100% Accuracy!' : 'QR Code Scan Failed'}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-200 text-emerald-800">
                      jsQR Engine
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Extracted Card ID: <strong className="font-mono">{qrTestResult.extracted?.cardId || '—'}</strong> | Name: <strong>{qrTestResult.extracted?.fullName || '—'}</strong> | Caste: <strong className="text-amber-800">{qrTestResult.extracted?.caste || '—'}</strong> | CNIC: <strong className="font-mono">{qrTestResult.extracted?.cnic || '—'}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQrTestResult(null)}
                className="app-btn-link text-xs text-slate-500 hover:text-slate-800 self-end sm:self-center"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Mobile Face Switcher (Only visible on mobile screens) */}
          <div className="no-print sm:hidden flex items-center justify-center gap-1 bg-slate-300/80 p-1 rounded-xl w-full max-w-[340px] shadow-inner">
            <button
              onClick={() => setMobileFace('both')}
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mobileFace === 'both' ? 'bg-[#16232F] text-white shadow-xs' : 'text-slate-700'
              }`}
            >
              Both Faces
            </button>
            <button
              onClick={() => setMobileFace('front')}
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mobileFace === 'front' ? 'bg-[#16232F] text-white shadow-xs' : 'text-slate-700'
              }`}
            >
              Front Only
            </button>
            <button
              onClick={() => setMobileFace('back')}
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mobileFace === 'back' ? 'bg-[#16232F] text-white shadow-xs' : 'text-slate-700'
              }`}
            >
              Back (QR)
            </button>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-slate-500 font-medium">
              <div className="w-8 h-8 border-3 border-[#AD7A28] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Generating standard English ID card and complete QR dataset...
            </div>
          ) : (
            <div 
              id="printable-card-area" 
              className="flex flex-col xl:flex-row gap-6 sm:gap-8 items-center justify-center w-full max-w-5xl"
            >
              
              {/* ════════════════════════════════════════════════════════════════
                  FRONT FACE: Standard ISO CR80 Landscape ID Card (85.6mm x 53.98mm)
                  All Data and Labels in English
                  Standard English/Latin typography & formatting
                 ════════════════════════════════════════════════════════════════ */}
              <div 
                className={`cr80-standard-card w-full max-w-[340px] sm:max-w-[430px] aspect-[85.6/53.98] rounded-xl sm:rounded-2xl bg-white shadow-xl border border-slate-300 overflow-hidden flex-col justify-between relative select-none ${
                  mobileFace === 'back' ? 'hidden sm:flex' : 'flex'
                }`}
                style={{ direction: 'ltr' }}
              >
                {/* Micro Security Pattern Watermark */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.035]"
                  style={{
                    backgroundImage: 'radial-gradient(#16232F 1.5px, transparent 1.5px)',
                    backgroundSize: '12px 12px'
                  }}
                />

                {/* Top Header Bar */}
                <div 
                  className={`bg-gradient-to-r ${activeTheme.headerGrad} text-white px-3 py-2 border-b-2 flex items-center justify-between relative z-10 shrink-0`}
                  style={{ borderBottomColor: activeTheme.borderAccent }}
                >
                  <div className="flex items-center gap-2">
                    {/* Official Association Seal */}
                    <div 
                      className="w-8 h-8 rounded-full p-0.5 shadow shrink-0 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${activeTheme.borderAccent}, #FFFFFF)` }}
                    >
                      {settings.logoData ? (
                        <img 
                          src={settings.logoData} 
                          alt="Logo" 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#16232F] flex items-center justify-center text-[#F5CA7B] text-[10px] font-black font-sans">
                          AB
                        </div>
                      )}
                    </div>
                    <div>
                      <div 
                        className="font-extrabold text-[10px] sm:text-[12px] tracking-tight leading-none uppercase truncate max-w-[210px] sm:max-w-[280px] font-display"
                        style={{ color: activeTheme.textAccent }}
                      >
                        {customTitle}
                      </div>
                      <div className="text-[8px] sm:text-[9px] text-slate-300 tracking-wide mt-0.5 truncate max-w-[210px] sm:max-w-[280px] font-sans">
                        {customSubtitle}
                      </div>
                    </div>
                  </div>

                  {/* Card ID Badge */}
                  <div className="text-right shrink-0">
                    <span 
                      className="inline-block px-2 py-0.5 rounded text-white text-[8px] sm:text-[9px] font-bold font-mono tracking-wider"
                      style={{ backgroundColor: activeTheme.borderAccent }}
                    >
                      {cardId}
                    </span>
                  </div>
                </div>

                {/* Front Card Body: Photo & English Details */}
                <div className="px-3 sm:px-4 py-2 flex-1 flex items-center gap-2.5 sm:gap-3 relative z-10">
                  
                  {/* Member Photo */}
                  <div className="shrink-0 flex flex-col items-center">
                    <div 
                      className="w-[68px] h-[85px] sm:w-[82px] sm:h-[102px] rounded-lg border-2 bg-slate-100 overflow-hidden shadow-sm flex items-center justify-center"
                      style={{ borderColor: activeTheme.borderAccent }}
                    >
                      {registration.photoData ? (
                        <img 
                          src={registration.photoData} 
                          alt={englishFullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 text-slate-400 font-bold text-2xl font-sans">
                          {englishFullName?.[0]?.toUpperCase() || 'M'}
                        </div>
                      )}
                    </div>
                    <div className="mt-1 px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wider text-center max-w-[75px] sm:max-w-[85px] truncate">
                      {englishType}
                    </div>
                  </div>

                  {/* Personal Particulars in English */}
                  <div className="flex-1 min-w-0 text-left space-y-0.5 sm:space-y-1">
                    {/* Full Name */}
                    <div>
                      <div className="text-[8px] sm:text-[9px] text-slate-500 font-medium leading-none uppercase tracking-wider">Member Name:</div>
                      <div className="text-[13px] sm:text-[15px] font-extrabold text-[#16232F] truncate leading-tight mt-0.5">
                        {englishFullName}
                      </div>
                    </div>

                    {/* Father / Guardian Name */}
                    <div>
                      <div className="text-[8px] sm:text-[9px] text-slate-500 font-medium leading-none uppercase tracking-wider">Father / Guardian:</div>
                      <div className="text-[10px] sm:text-[12px] font-bold text-slate-800 truncate mt-0.5">
                        {englishFatherName}
                      </div>
                    </div>

                    {/* Caste & CNIC */}
                    <div className="flex items-center justify-between text-[8px] sm:text-[9px] pt-0.5">
                      <div className="flex items-center gap-1 truncate max-w-[120px]">
                        <span className="text-slate-500 font-medium uppercase tracking-wider shrink-0">Caste:</span>
                        <span className="font-bold text-[#AD7A28] truncate">{englishCaste}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-slate-500 font-medium uppercase tracking-wider shrink-0">CNIC:</span>
                        <span className="font-mono font-bold text-[#16232F] tracking-wider">
                          {registration.cnic || '—'}
                        </span>
                      </div>
                    </div>

                    {/* DOB & Gender */}
                    <div className="flex items-center justify-between text-[8px] sm:text-[9px] pt-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 uppercase tracking-wider">DOB:</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {registration.dob || '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 uppercase tracking-wider">Gender:</span>
                        <span className="font-bold text-slate-800">{englishGender}</span>
                      </div>
                    </div>

                    {/* Issue Date & Expiry */}
                    <div className="flex items-center justify-between text-[7.5px] sm:text-[8px] text-slate-500 pt-0.5">
                      <div className="flex items-center gap-1">
                        <span className="uppercase tracking-wider">Issued:</span>
                        <span className="font-mono font-semibold text-slate-700">
                          {issueDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="uppercase tracking-wider">Valid Thru:</span>
                        <span className="font-mono font-semibold text-slate-700">
                          {customExpiry}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Front Footer Bar */}
                <div className={`${activeTheme.footerBg} px-3 py-1.5 border-t border-slate-200 flex items-center justify-between relative z-10 shrink-0`}>
                  <div className={`text-[7.5px] sm:text-[8px] ${activeTheme.footerAccent} font-bold flex items-center gap-1 uppercase tracking-wider`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Verified Official Member • Bannu KPK</span>
                  </div>
                  <div className="text-[7.5px] sm:text-[8px] text-slate-600 font-medium truncate max-w-[150px]">
                    {customSignatory}
                  </div>
                </div>

              </div>


              {/* ════════════════════════════════════════════════════════════════
                  BACK FACE: Standard ISO CR80 Landscape ID Card (85.6mm x 53.98mm)
                  All Data and Labels in English
                  Complete QR Code Containing ALL Registration Information
                 ════════════════════════════════════════════════════════════════ */}
              <div 
                className={`cr80-standard-card w-full max-w-[340px] sm:max-w-[430px] aspect-[85.6/53.98] rounded-xl sm:rounded-2xl bg-white shadow-xl border border-slate-300 overflow-hidden flex-col justify-between relative select-none ${
                  mobileFace === 'front' ? 'hidden sm:flex' : 'flex'
                }`}
                style={{ direction: 'ltr' }}
              >
                {/* Micro Security Pattern Watermark */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.035]"
                  style={{
                    backgroundImage: 'radial-gradient(#16232F 1.5px, transparent 1.5px)',
                    backgroundSize: '12px 12px'
                  }}
                />

                {/* Back Top Header */}
                <div 
                  className={`bg-gradient-to-r ${activeTheme.headerGrad} text-white px-3 py-1.5 border-b-2 flex items-center justify-between relative z-10 shrink-0`}
                  style={{ borderBottomColor: activeTheme.borderAccent }}
                >
                  <div 
                    className="font-bold text-[9px] sm:text-[11px] uppercase tracking-wider font-display"
                    style={{ color: activeTheme.textAccent }}
                  >
                    Official Identification & Verification
                  </div>
                  <div className="text-[7.5px] sm:text-[9px] text-amber-200 font-mono tracking-wider">
                    VERIFIED • {cardId}
                  </div>
                </div>

                {/* Back Card Body: Address, Profession, Contact & COMPLETE REGISTRATION QR CODE */}
                <div className="px-3 sm:px-4 py-2 flex-1 flex items-center justify-between gap-2 sm:gap-2.5 relative z-10">
                  
                  {/* Left Column: English Particulars */}
                  <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1 text-[8.5px] sm:text-[9px] text-left">
                    
                    {/* Address in English */}
                    <div>
                      <span className="text-slate-500 font-medium uppercase tracking-wider">Address: </span>
                      <span className="font-semibold text-slate-800 leading-snug break-words">
                        {fullEnglishAddress}
                      </span>
                    </div>

                    {/* Profession / Work in English */}
                    <div>
                      <span className="text-slate-500 font-medium uppercase tracking-wider">Profession: </span>
                      <span className="font-bold text-slate-800">
                        {englishWork || 'Member'}
                      </span>
                    </div>

                    {/* WhatsApp / Phone in English */}
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-medium uppercase tracking-wider shrink-0">Contact:</span>
                      <span className="font-mono font-bold text-[#16232F]">
                        {registration.whatsapp}
                      </span>
                    </div>

                    {/* Email in English Format */}
                    {registration.email && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 font-medium uppercase tracking-wider shrink-0">Email:</span>
                        <span className="font-mono text-[8px] text-slate-700 truncate">
                          {registration.email}
                        </span>
                      </div>
                    )}

                    {/* Official Website */}
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-medium uppercase tracking-wider shrink-0">Website:</span>
                      <span 
                        className="font-mono text-[8px] font-bold"
                        style={{ color: activeTheme.borderAccent }}
                      >
                        {customWebsite}
                      </span>
                    </div>

                    {/* Terms Notice */}
                    <div className="text-[7px] sm:text-[7.5px] text-slate-500 leading-tight pt-0.5 border-t border-slate-100">
                      Property of Araain Bannu Welfare Association. If found, please return to central office.
                    </div>
                  </div>

                  {/* Right Column: COMPLETE DATA QR CODE */}
                  <div className="shrink-0 flex flex-col items-center justify-center">
                    <div className="p-1 rounded-lg bg-white border border-slate-300 shadow-sm flex items-center justify-center">
                      {qrCodeUrl ? (
                        <img 
                          src={qrCodeUrl} 
                          alt="Registration QR Code" 
                          className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] object-contain"
                        />
                      ) : (
                        <div className="w-[72px] h-[72px] flex items-center justify-center text-[9px] text-slate-400">
                          QR Code
                        </div>
                      )}
                    </div>
                    <div 
                      className="text-[7px] sm:text-[7.5px] font-bold mt-1 text-center leading-none uppercase tracking-wider"
                      style={{ color: activeTheme.borderAccent }}
                    >
                      SCAN FULL DOSSIER
                    </div>
                    <div className="text-[6px] sm:text-[6.5px] text-slate-400 text-center font-mono mt-0.5">
                      ALL REGISTERED DATA
                    </div>
                  </div>

                </div>

                {/* Back Footer */}
                <div className={`${activeTheme.footerBg} px-3 py-1 border-t border-slate-200 flex items-center justify-between text-[7px] sm:text-[7.5px] text-slate-600 relative z-10 shrink-0`}>
                  <div className="truncate max-w-[200px]">
                    Central Office: Bannu City, Khyber Pakhtunkhwa
                  </div>
                  <div className="font-mono shrink-0">
                    ISO 7810 CR80
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="no-print bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            <span className="font-semibold text-slate-800">
              Standard Card Printing Size:
            </span>{' '}
            <span className="font-mono text-[#AD7A28] font-bold">85.60 mm × 53.98 mm (CR80)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyQrData}
              className="app-btn-secondary app-btn-sm"
            >
              {copiedPayload ? 'Copied!' : 'Copy All QR Data'}
            </button>

            <button
              onClick={handlePrint}
              className="app-btn-primary app-btn-sm"
            >
              Print / Save as PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
  );
};
