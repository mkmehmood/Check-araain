import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { lookupVerifiedCard, registerVerifiedCard, PublicVerifiedCard } from '../services/firebase';
import { sanitizeCardId } from '../utils/security';
import { 
  scanQrFromCanvas, 
  scanQrFromImageFile, 
  parseQrPayload, 
  ExtractedMemberData 
} from '../utils/qrScanner';
import { 
  X, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Award, 
  Calendar,
  Building2,
  Copy,
  Check,
  Camera,
  CameraOff,
  Upload,
  RefreshCw,
  Eye,
  UserCheck,
  ExternalLink,
  FileUp
} from 'lucide-react';
import { FullScreenHeader } from './common/FullScreenHeader';

interface CardVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCardId?: string;
}

export const CardVerificationModal: React.FC<CardVerificationModalProps> = ({
  isOpen,
  onClose,
  initialCardId = '',
}) => {
  const { t, isUrdu } = useLanguage();
  const { registrations, settings } = useData();
  const [activeTab, setActiveTab] = useState<'id' | 'scan'>('id');
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState<PublicVerifiedCard | null>(null);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // QR Camera & Scan State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedMemberData | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [showRawPayload, setShowRawPayload] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const performLookup = useCallback(async (idToSearch: string) => {
    const clean = sanitizeCardId(idToSearch);
    if (!clean) {
      setErrorText(
        isUrdu
          ? 'براہ کرم درست کارڈ نمبر درج کریں (مثال: AB-26-123456)'
          : 'Please enter a valid Card ID format (e.g. AB-26-123456)'
      );
      return;
    }

    setLoading(true);
    setErrorText(null);
    setSearched(true);

    try {
      const record = await lookupVerifiedCard(clean, registrations);
      setVerifiedRecord(record);
    } catch (err: any) {
      setErrorText(
        isUrdu 
          ? 'تصدیقی ریکارڈ لوڈ کرنے میں خرابی۔' 
          : 'Error querying verification registry.'
      );
      setVerifiedRecord(null);
    } finally {
      setLoading(false);
    }
  }, [isUrdu, registrations]);

  useEffect(() => {
    if (isOpen) {
      const cleanInitial = sanitizeCardId(initialCardId);
      if (cleanInitial) {
        setSearchId(cleanInitial);
        setActiveTab('id');
        performLookup(cleanInitial);
      } else {
        setVerifiedRecord(null);
        setSearched(false);
        setErrorText(null);
        setExtractedData(null);
      }
    } else {
      stopCamera();
    }
  }, [isOpen, initialCardId, performLookup, stopCamera]);

  // Auto-start the camera the moment the Scan tab is opened, and stop it when
  // leaving that tab (or unmounting elsewhere below). This runs in a
  // useEffect - AFTER the 'scan' tab's content (including the <video> the
  // stream attaches to) has actually rendered - rather than being called
  // straight from the tab button's onClick. Calling it synchronously from
  // onClick right after setActiveTab('scan') doesn't work: React batches that
  // state update, so the <video> element still wouldn't exist yet at that
  // point and the stream would have nothing to attach to.
  useEffect(() => {
    if (activeTab === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }
    // Deliberately depends only on activeTab (not startCamera/stopCamera,
    // which are recreated - stopCamera via useCallback, startCamera fresh
    // every render) - only a tab change should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopCamera();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, stopCamera]);

  const startCamera = async () => {
    setCameraError(null);
    setScanSuccess(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('CAMERA_UNSUPPORTED');
        setCameraActive(false);
        return;
      }

      // NOTE: We deliberately do NOT hard-block here based on
      // navigator.permissions.query({name:'camera'}). That API's support and
      // accuracy varies significantly across browsers/WebViews, and has been
      // observed to report 'denied' even when a fresh getUserMedia() call
      // would succeed or correctly prompt the user. Gating on it risks
      // permanently blocking a user who actually has (or could grant) camera
      // access. The getUserMedia() call itself below is the reliable source
      // of truth — its own catch block below handles genuine denials.

      // Stop any existing stream first
      stopCamera();

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (e: any) {
        if (e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError' || e?.name === 'SecurityError') {
          setCameraError('CAMERA_DENIED');
          setCameraActive(false);
          return;
        }
        // Fallback to generic video constraint
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Set these as real JS properties (not just JSX/HTML attributes) —
        // some browsers only honor autoplay when muted/playsInline are set
        // imperatively before play() is called on a stream-backed video.
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.setAttribute('playsinline', 'true');

        // play() has its own autoplay-policy failure mode (also throws
        // NotAllowedError) that is unrelated to camera permission — the
        // stream was already successfully obtained above, so a play()
        // failure here must never be reported as "camera access denied".
        try {
          await videoRef.current.play();
        } catch {
          // Autoplay was blocked; the stream is live and the <video> element
          // will still display frames once the browser allows playback
          // (typically already satisfied here since this call originates
          // from the user's "Start Camera" click).
        }
        setCameraActive(true);
        requestScanFrame();
      }
    } catch (err: any) {
      setCameraActive(false);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError' || err?.message === 'CAMERA_DENIED' || err?.name === 'SecurityError') {
        setCameraError('CAMERA_DENIED');
      } else {
        setCameraError('CAMERA_UNSUPPORTED');
      }
    }
  };

  const requestScanFrame = () => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      animFrameIdRef.current = requestAnimationFrame(requestScanFrame);
      return;
    }

    const video = videoRef.current;
    if (!hiddenCanvasRef.current) {
      hiddenCanvasRef.current = document.createElement('canvas');
    }
    const canvas = hiddenCanvasRef.current;

    // Match canvas dimensions to video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const scanResult = scanQrFromCanvas(canvas);

      if (scanResult && scanResult.data) {
        // Successfully scanned QR code!
        handleQrDetected(scanResult.data, scanResult.extracted);
        return;
      }
    }

    animFrameIdRef.current = requestAnimationFrame(requestScanFrame);
  };

  const handleQrDetected = async (rawPayload: string, extracted: ExtractedMemberData) => {
    // Play light vibration if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100);
    }

    stopCamera();
    setScanSuccess(true);
    setExtractedData(extracted);

    if (!extracted.cardId) {
      setSearched(true);
      setErrorText(
        isUrdu
          ? 'کیو آر کوڈ اسکین ہو گیا لیکن کارڈ نمبر نہیں مل سکا۔'
          : 'QR code scanned, but no recognized Card ID was detected in the payload.'
      );
      return;
    }

    setSearchId(extracted.cardId);
    setLoading(true);
    setErrorText(null);
    setSearched(true);

    try {
      // Always check the authoritative registry FIRST. This is the fix for
      // a real data-integrity bug: every scan used to unconditionally
      // re-register the card from the QR's own text, with issuedAt
      // defaulting to "now" whenever the QR didn't carry a date - silently
      // overwriting the card's true, already-persisted issue date in
      // Firestore with the scan date, every single time it was scanned.
      // Only a card that has genuinely never been registered anywhere
      // before falls through to being created from the QR payload itself.
      const existing = await lookupVerifiedCard(extracted.cardId, registrations);
      if (existing) {
        setVerifiedRecord(existing);
        return;
      }

      if (extracted.fullName || extracted.fullNameUr) {
        const firstSeen: PublicVerifiedCard = {
          cardId: extracted.cardId,
          fullNameEn: extracted.fullName || '',
          fullNameUr: extracted.fullNameUr || extracted.fullName || '',
          membershipTypeEn: extracted.membershipType || 'Official Member',
          membershipTypeUr: extracted.membershipType || 'باضابطہ رکن',
          status: 'verified',
          // Use the issue date embedded in the card's own QR payload (now
          // that the generator actually writes one) - only fall back to
          // "now" when this exact card has truly never been seen before.
          issuedAt: extracted.issuedDate || new Date().toLocaleDateString('en-GB'),
          councilName: extracted.authority || settings?.siteName || 'ARAAIN ASSOCIATION BANNU',
        };
        await registerVerifiedCard(firstSeen);
        setVerifiedRecord(firstSeen);
      } else {
        setVerifiedRecord(null);
      }
    } catch (err) {
      setErrorText(
        isUrdu
          ? 'تصدیقی ریکارڈ لوڈ کرنے میں خرابی۔'
          : 'Error querying the verification registry.'
      );
      setVerifiedRecord(null);
    } finally {
      setLoading(false);
    }
  };

  const processImageFile = async (file: File) => {
    setLoading(true);
    setCameraError(null);
    setScanSuccess(false);
    setErrorText(null);

    try {
      const result = await scanQrFromImageFile(file);
      if (result && result.data) {
        handleQrDetected(result.data, result.extracted);
      } else {
        setErrorText(
          isUrdu
            ? 'اس تصویر میں کوئی درست کیو آر کوڈ نہیں ملا۔ براہ کرم صاف اور واضح تصویر اپ لوڈ کریں۔'
            : 'No valid QR code was detected in this image. Please provide a clear, well-lit photo.'
        );
      }
    } catch (err: any) {
      setErrorText(
        isUrdu
          ? 'تصویر پڑھنے میں خرابی واقع ہوئی۔'
          : 'Failed to process the uploaded image file.'
      );
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(searchId);
  };

  const handleCopyCardId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#FBF9F4] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
      {/* Sticky Full-Screen Header with Back Movement */}
      <FullScreenHeader
        title={t('verifyModalTitle', 'Official Membership Verification')}
        subtitle={t('verifyModalSub', 'Public authenticity check & QR data extraction')}
        badge={t('siteName', 'ARAAIN BANNU')}
        icon={<ShieldCheck className="w-4 h-4 text-amber-300" />}
        onBack={handleClose}
      />

      {/* Screen Body Content */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/80 p-2 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveTab('id');
              }}
              className={`h-11 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'id'
                  ? 'bg-white text-[#16232F] shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Search className="w-4 h-4 text-[#AD7A28]" />
              <span>{isUrdu ? 'کارڈ نمبر سے تلاش' : 'Search by Card ID'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('scan')}
              className={`h-11 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'scan'
                  ? 'bg-[#AD7A28] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
            <Camera className="w-4 h-4" />
            <span>{isUrdu ? 'کیو آر کوڈ اسکین کریں' : 'Scan Card QR Code'}</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">

          {/* TAB 1: SEARCH BY CARD ID */}
          {activeTab === 'id' && (
            <div className="space-y-3">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                    placeholder={isUrdu ? "کارڈ نمبر یا شناختی کارڈ (مثلاً AB-26-XXXXXX)" : "Card ID or CNIC (e.g. AB-26-XXXXXX)"}
                    className="app-input w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 uppercase tracking-wider font-mono text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="app-btn-primary shrink-0"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>{loading ? (isUrdu ? 'تلاش جاری...' : 'Checking...') : (isUrdu ? 'تصدیق کریں' : 'Verify')}</span>
                </button>
              </form>

              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500 px-1">
                <span>{isUrdu ? 'کارڈ پر درج کارڈ آئی ڈی یا رجسٹرڈ قومی شناختی کارڈ درج کریں' : 'Accepts printed Card ID or registered CNIC number'}</span>
                {registrations && registrations.length > 0 && registrations.find(r => r.cardId) && (
                  <button
                    type="button"
                    onClick={() => {
                      const sample = registrations.find(r => r.cardId);
                      if (sample?.cardId) {
                        setSearchId(sample.cardId);
                        performLookup(sample.cardId);
                      }
                    }}
                    className="text-[#AD7A28] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>{isUrdu ? 'نمونہ کارڈ چیک کریں:' : 'Test sample card:'}</span>
                    <span className="font-mono">{registrations.find(r => r.cardId)?.cardId}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE QR SCANNER & IMAGE UPLOADER */}
          {activeTab === 'scan' && (
            <div className="space-y-4">
              {/* Camera Scanner Box with Drag & Drop */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDropFile}
                className={`relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 sm:aspect-16/9 min-h-[240px] flex items-center justify-center border-2 transition-all duration-200 shadow-inner ${
                  isDragging ? 'border-[#AD7A28] ring-4 ring-[#AD7A28]/30 bg-slate-900' : 'border-slate-800'
                }`}
              >
                {/*
                  IMPORTANT: this <video> must always be mounted, even while
                  cameraActive is false. startCamera() attaches the stream to
                  videoRef.current BEFORE it sets cameraActive to true, so if
                  this element only rendered when cameraActive is true, the
                  ref would still be null at that point and the stream would
                  never be attached (silently: no video, no error). Visibility
                  is toggled with a class instead of an unmount.
                */}
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${cameraActive ? '' : 'hidden'}`}
                  muted
                  playsInline
                />
                {cameraActive ? (
                  <>
                    {/* Scanner Framing Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-52 h-52 sm:w-60 sm:h-60 border-2 border-dashed border-[#F5CA7B] rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center">
                        <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-[#AD7A28] rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-[#AD7A28] rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-[#AD7A28] rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-[#AD7A28] rounded-br-lg" />
                        
                        {/* Scanning Laser Animation */}
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#F5CA7B] to-transparent shadow-[0_0_8px_#F5CA7B] animate-pulse" />
                      </div>
                    </div>

                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                      <span className="text-[11px] text-white/90 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 font-medium">
                        {isUrdu ? 'کارڈ پر موجود کیو آر کوڈ فریم میں لائیں' : 'Align card QR inside frame'}
                      </span>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="h-8 px-3 rounded-full text-xs font-medium text-white/90 bg-black/70 hover:bg-black border border-white/20 cursor-pointer transition-colors"
                      >
                        {isUrdu ? 'کیمرہ بند کریں' : 'Stop Camera'}
                      </button>
                    </div>
                  </>
                ) : cameraError === 'CAMERA_DENIED' ? (
                  /* FRIENDLY GRACEFUL FALLBACK WHEN CAMERA IS DENIED / SANDBOXED */
                  <div className="text-center p-6 space-y-3.5 max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-[#F5CA7B] border border-amber-500/30 flex items-center justify-center mx-auto">
                      <CameraOff className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-1">
                        <span>{isUrdu ? 'کیمرہ اجازت محدود ہے' : 'Camera Access Restricted'}</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed mt-1">
                        {isUrdu 
                          ? 'براؤزر یا سیکیورٹی سیٹنگز میں لائیو کیمرہ کی رسائی غیر فعال ہے۔ آپ کارڈ کی تصویر اپ لوڈ کر سکتے ہیں یا کارڈ نمبر سے تلاش کر سکتے ہیں۔'
                          : 'Live camera is blocked by browser permissions or sandbox. You can upload a photo of the card or look up by Card ID.'}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                      <label
                        htmlFor="qr-image-upload"
                        className="app-btn-primary app-btn-full"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isUrdu ? 'کارڈ تصویر اپ لوڈ کریں' : 'Upload Card Photo'}</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          stopCamera();
                          setActiveTab('id');
                        }}
                        className="app-btn-ghost app-btn-full"
                      >
                        <Search className="w-4 h-4 text-amber-300" />
                        <span>{isUrdu ? 'کارڈ نمبر درج کریں' : 'Enter Card ID'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 pt-1">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="text-amber-300/80 hover:text-amber-200 hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{isUrdu ? 'کیمرہ دوبارہ آزمائیں' : 'Retry camera permissions'}</span>
                      </button>
                    </div>
                  </div>
                ) : cameraError === 'CAMERA_UNSUPPORTED' ? (
                  /* Browser/device genuinely has no camera API - upload is the only path */
                  <div className="text-center p-6 space-y-3.5 max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#F5CA7B] flex items-center justify-center mx-auto border border-white/10">
                      <CameraOff className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">
                        {isUrdu ? 'کیمرہ دستیاب نہیں' : 'Camera Not Available'}
                      </h4>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {isUrdu
                          ? 'اس براؤزر یا ڈیوائس پر لائیو کیمرہ دستیاب نہیں۔ نیچے دیے گئے بٹن سے کارڈ کی تصویر اپ لوڈ کریں یا کارڈ نمبر سے تلاش کریں۔'
                          : 'Live camera isn\u2019t available on this browser or device. Upload a card photo below, or search by Card ID instead.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('id')}
                      className="app-btn-ghost app-btn-sm"
                    >
                      <Search className="w-4 h-4 text-amber-300" />
                      <span>{isUrdu ? 'کارڈ نمبر درج کریں' : 'Enter Card ID'}</span>
                    </button>
                  </div>
                ) : (
                  /* Transient: the scan tab just opened and the camera is auto-starting
                     (permission prompt pending / stream negotiating). This should be
                     on-screen only briefly - if it lingers, one of the two branches
                     above will take over once startCamera() resolves either way. */
                  <div className="text-center p-6 space-y-3 max-w-sm mx-auto">
                    <div className="w-8 h-8 border-3 border-[#F5CA7B] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {isUrdu ? 'کیمرہ کھولا جا رہا ہے...' : 'Opening camera\u2026'}
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Card Image Fallback Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-700 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#AD7A28]/10 text-[#AD7A28] flex items-center justify-center shrink-0">
                    <FileUp className="w-4 h-4" />
                  </div>
                  <span>{isUrdu ? 'کارڈ یا کیو آر کوڈ کی تصویر اپ لوڈ کریں:' : 'Upload card image or screenshot file:'}</span>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                    id="qr-image-upload"
                  />
                  <label
                    htmlFor="qr-image-upload"
                    className="app-btn-secondary app-btn-sm !text-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#AD7A28]" />
                    <span>{isUrdu ? 'فائل منتخب کریں' : 'Browse File'}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorText && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="p-6 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-[#AD7A28] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-600 font-medium">
                {isUrdu 
                  ? 'مرکزی کونسل کے ریکارڈ سے کارڈ کی تصدیق اور ڈیٹا نکالا جا رہا ہے...' 
                  : 'Validating credentials & extracting data from registry...'}
              </p>
            </div>
          )}

          {/* EXTRACTED QR DATA SECTION (Shown whenever a QR code is scanned) */}
          {extractedData && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>{isUrdu ? 'کیو آر کوڈ سے حاصل شدہ ڈیٹا (Extracted Data)' : 'Extracted QR Data Dossier'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRawPayload(!showRawPayload)}
                  className="text-[10px] text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>{showRawPayload ? (isUrdu ? 'مخفی کریں' : 'Hide Raw') : (isUrdu ? 'مکمل کوڈ دیکھیں' : 'View Raw')}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {extractedData.cardId && (
                  <div className="col-span-2 sm:col-span-1 bg-white p-2 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-400 block">{isUrdu ? 'کارڈ نمبر' : 'Card ID'}:</span>
                    <span className="font-mono font-bold text-[#16232F]">{extractedData.cardId}</span>
                  </div>
                )}

                {extractedData.fullName && (
                  <div className="col-span-2 sm:col-span-1 bg-white p-2 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-400 block">{isUrdu ? 'رکن کا نام' : 'Full Name'}:</span>
                    <span className="font-semibold text-slate-800">{extractedData.fullName}</span>
                  </div>
                )}

                {extractedData.fatherName && (
                  <div className="col-span-2 sm:col-span-1 bg-white p-2 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-400 block">{isUrdu ? 'ولدیت' : 'Father / Guardian'}:</span>
                    <span className="font-semibold text-slate-800">{extractedData.fatherName}</span>
                  </div>
                )}

                {extractedData.caste && (
                  <div className="col-span-2 sm:col-span-1 bg-white p-2 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-400 block">{isUrdu ? 'قومیت / قبیلہ' : 'Caste'}:</span>
                    <span className="font-bold text-[#AD7A28]">{extractedData.caste}</span>
                  </div>
                )}

                {extractedData.cnic && (
                  <div className="col-span-2 sm:col-span-1 bg-white p-2 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-400 block">CNIC:</span>
                    <span className="font-mono font-semibold text-slate-700">{extractedData.cnic}</span>
                  </div>
                )}

                {extractedData.dob && (
                  <div className="col-span-2 sm:col-span-1 bg-white p-2 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-400 block">{isUrdu ? 'تاریخ پیدائش' : 'Date of Birth'}:</span>
                    <span className="font-mono font-semibold text-slate-700">{extractedData.dob}</span>
                  </div>
                )}

                {extractedData.membershipType && (
                  <div className="col-span-2 sm:col-span-1 bg-white p-2 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-400 block">{isUrdu ? 'کیٹگری' : 'Category'}:</span>
                    <span className="font-medium text-slate-700">{extractedData.membershipType}</span>
                  </div>
                )}

                {extractedData.occupation && (
                  <div className="col-span-2 sm:col-span-1 bg-white p-2 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-400 block">{isUrdu ? 'پیشہ' : 'Occupation'}:</span>
                    <span className="font-medium text-slate-700">{extractedData.occupation}</span>
                  </div>
                )}

                {extractedData.education && (
                  <div className="col-span-2 sm:col-span-1 bg-white p-2 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-400 block">{isUrdu ? 'تعلیم' : 'Education'}:</span>
                    <span className="font-medium text-slate-700">{extractedData.education}</span>
                  </div>
                )}

                {extractedData.address && (
                  <div className="col-span-2 bg-white p-2 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-400 block">{isUrdu ? 'پتہ' : 'Address'}:</span>
                    <span className="font-medium text-slate-700 break-words">{extractedData.address}</span>
                  </div>
                )}
              </div>

              {/* Collapsible Raw Scanned Payload */}
              {showRawPayload && (
                <div className="pt-2 border-t border-blue-200">
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1">Raw Scanned QR String:</span>
                  <pre className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 text-[10px] font-mono whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed select-all">
                    {extractedData.raw}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* RESULT CARD: VERIFIED IN DATABASE */}
          {!loading && searched && verifiedRecord && (
            <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/30 p-4 sm:p-5 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{isUrdu ? 'مصدق رکن / کارڈ فعال ہے' : 'VERIFIED OFFICIAL MEMBER'}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider border border-emerald-300">
                  {verifiedRecord.status || 'Active'}
                </span>
              </div>

              {/* Verified Details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{isUrdu ? 'کارڈ نمبر' : 'Card ID'}:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                    <span>{verifiedRecord.cardId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCardId(verifiedRecord.cardId)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Copy Card ID"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{isUrdu ? 'رکن کا نام' : 'Member Name'}:</span>
                  <span className="font-bold text-slate-900">
                    {isUrdu 
                      ? (verifiedRecord.fullNameUr || verifiedRecord.fullNameEn) 
                      : (verifiedRecord.fullNameEn || verifiedRecord.fullNameUr)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{isUrdu ? 'رکنیت کی قسم' : 'Membership Category'}:</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#AD7A28]" />
                    {isUrdu 
                      ? (verifiedRecord.membershipTypeUr || verifiedRecord.membershipTypeEn) 
                      : (verifiedRecord.membershipTypeEn || verifiedRecord.membershipTypeUr)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{isUrdu ? 'جاری کنندہ ادارہ' : 'Issuing Council'}:</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {verifiedRecord.councilName || 'Araain Association Bannu'}
                  </span>
                </div>

                {verifiedRecord.issuedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{isUrdu ? 'تاریخ منظوری / اجراء' : 'Approved / Issued'}:</span>
                    <span className="text-xs text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{verifiedRecord.issuedAt}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Privacy Shield Notice */}
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                <Lock className="w-4 h-4 text-[#AD7A28] shrink-0 mt-0.5" />
                <span>
                  {isUrdu
                    ? 'شہریوں اور اراکین کے ذاتی کوائف (شناختی کارڈ، رابطہ نمبر اور پتہ) سخت ترین حفاظتی ضوابط کے تحت محفوظ ہیں۔'
                    : 'Confidential member identifiers (CNIC, phone & address) are strictly protected under Community Data Privacy Standards.'}
                </span>
              </div>
            </div>
          )}

          {/* RESULT CARD: NOT FOUND IN DATABASE */}
          {!loading && searched && !verifiedRecord && (
            <div className="rounded-2xl border-2 border-amber-300/80 bg-amber-50/40 p-4 sm:p-5 space-y-2.5 text-center animate-fadeIn">
              <AlertTriangle className="w-9 h-9 text-amber-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">
                {isUrdu ? 'کارڈ ریکارڈ مرکزی ڈیٹابیس میں نہیں ملا' : 'Card Record Not Found in Registry'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                {isUrdu
                  ? 'یہ کارڈ نمبر یا تو ابھی جاری نہیں ہوا یا ابھی تک تصدیق کے عمل سے نہیں گزرا۔ برائے تصدیق مرکزی دفتر سے رابطہ کریں۔'
                  : 'This Card ID could not be found in the verified registry. It may be pending review or invalid. Please contact the administration.'}
              </p>
            </div>
          )}

          {/* Help note */}
          <p className="text-[11px] text-slate-400 text-center">
            {isUrdu 
              ? 'کسی بھی سوال یا کارڈ تصدیق کے لیے رابطہ فارم استعمال کریں۔' 
              : 'For registration inquiries or card verification support, please use the official contact channels.'}
          </p>
        </div>

      </div>
    </div>
  </div>
  );
};
