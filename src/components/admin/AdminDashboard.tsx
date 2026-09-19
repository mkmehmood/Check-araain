import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { Registration } from '../../types';
import { AdminMembers } from './AdminMembers';
import { AdminDonations } from './AdminDonations';
import { AdminInquiries } from './AdminInquiries';
import { AdminSiteContent, SubTabId } from './AdminSiteContent';
import { AdminRegistrationsScreen } from './AdminRegistrationsScreen';
import { AdminWebsiteCmsScreen } from './AdminWebsiteCmsScreen';
import { PolicyCategory } from './PagesCms';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  Heart, 
  Mail, 
  Sliders, 
  LogOut, 
  ExternalLink,
  Globe,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Database,
  BookOpen,
  Maximize2
} from 'lucide-react';

interface AdminDashboardProps {
  onExitAdmin: () => void;
  onLogout: () => void;
  adminEmail: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onExitAdmin,
  onLogout,
  adminEmail,
}) => {
  const { isUrdu, lang, setLanguage, tSetting } = useLanguage();
  const {
    settings,
    programs,
    leaders,
    events,
    pages,
    gallery,
    registrations,
    donations,
    messages,
    saveSettings,
    savePrograms,
    saveLeaders,
    saveEvents,
    savePages,
    saveGallery,
    updateRegistrationStatus,
    deleteRegistration,
    updateDonationStatus,
    deleteDonation,
    updateContactMessageStatus,
    deleteContactMessage,
  } = useData();

  // Accordion state for the 4 terms (one by one, below after another)
  const [openSections, setOpenSections] = useState<{
    registrations: boolean;
    donations: boolean;
    messages: boolean;
    website: boolean;
  }>({
    registrations: true,
    donations: false,
    messages: false,
    website: false,
  });

  const [activeCmsSubTab, setActiveCmsSubTab] = useState<SubTabId>('topbar');
  const [cmsPageCategory, setCmsPageCategory] = useState<PolicyCategory>('all');
  const [isRegistrationsFullScreen, setIsRegistrationsFullScreen] = useState(false);
  const [isWebsiteCmsFullScreen, setIsWebsiteCmsFullScreen] = useState(false);
  const [selectedMemberIdForDetail, setSelectedMemberIdForDetail] = useState<string | null>(null);

  // Metrics
  const pendingMembersCount = registrations.filter(r => (r.status || 'new') === 'new').length;
  const pendingDonationsCount = donations.filter(d => (d.status || 'pending') === 'pending').length;
  const unreadMessagesCount = messages.filter(m => (m.status || 'new') === 'new').length;
  const verifiedDonationTotal = donations
    .filter(d => d.status === 'verified')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  /**
   * Deep-Link URL Router:
   * Parses URL hash (e.g. domain/#admin/#website/#Information & Policies/#Documentation)
   */
  const parseHashAndRoute = () => {
    const rawHash = window.location.hash || '';
    const decoded = decodeURIComponent(rawHash).toLowerCase().trim();

    if (!decoded || decoded === '#admin') {
      setIsRegistrationsFullScreen(false);
      setIsWebsiteCmsFullScreen(false);
      setSelectedMemberIdForDetail(null);
      return;
    }

    if (decoded.includes('documentation')) {
      setIsWebsiteCmsFullScreen(true);
      setIsRegistrationsFullScreen(false);
      setActiveCmsSubTab('pages');
      setCmsPageCategory('documentation');
      return;
    }

    if (decoded.includes('information & policies') || decoded.includes('information and policies') || decoded.includes('information-policies')) {
      setIsWebsiteCmsFullScreen(true);
      setIsRegistrationsFullScreen(false);
      setActiveCmsSubTab('pages');
      setCmsPageCategory('all');
      return;
    }

    if (decoded.includes('registration') || decoded.includes('member')) {
      setIsRegistrationsFullScreen(true);
      setIsWebsiteCmsFullScreen(false);
      if (decoded.includes('=')) {
        const id = decoded.split('=')[1];
        if (id) setSelectedMemberIdForDetail(id);
      }
      return;
    }

    if (decoded.includes('donation')) {
      setIsRegistrationsFullScreen(false);
      setIsWebsiteCmsFullScreen(false);
      setOpenSections({ registrations: false, donations: true, messages: false, website: false });
      return;
    }

    if (decoded.includes('message') || decoded.includes('inquir')) {
      setIsRegistrationsFullScreen(false);
      setIsWebsiteCmsFullScreen(false);
      setOpenSections({ registrations: false, donations: false, messages: true, website: false });
      return;
    }

    if (decoded.includes('website') || decoded.includes('topbar') || decoded.includes('hero') || decoded.includes('about')) {
      let sub: SubTabId = 'topbar';
      if (decoded.includes('hero')) sub = 'hero';
      else if (decoded.includes('about')) sub = 'about';
      else if (decoded.includes('program')) sub = 'programs';
      else if (decoded.includes('leader')) sub = 'leaders';
      else if (decoded.includes('event')) sub = 'events';
      else if (decoded.includes('gallery')) sub = 'gallery';
      else if (decoded.includes('bank') || decoded.includes('account')) sub = 'bank';
      else if (decoded.includes('contact') || decoded.includes('desk')) sub = 'contact';
      else if (decoded.includes('cta')) sub = 'cta';
      else if (decoded.includes('footer')) sub = 'footer';
      else if (decoded.includes('analytic') || decoded.includes('seo')) sub = 'analytics';
      else if (decoded.includes('page')) sub = 'pages';

      setIsWebsiteCmsFullScreen(true);
      setIsRegistrationsFullScreen(false);
      setActiveCmsSubTab(sub);
      return;
    }
  };

  useEffect(() => {
    parseHashAndRoute();
    window.addEventListener('hashchange', parseHashAndRoute);
    return () => window.removeEventListener('hashchange', parseHashAndRoute);
  }, []);

  const toggleSection = (section: 'registrations' | 'donations' | 'messages' | 'website') => {
    setOpenSections(prev => {
      const nextVal = !prev[section];
      const updated = { ...prev, [section]: nextVal };
      
      // Update hash reflecting selection
      if (nextVal) {
        if (section === 'registrations') window.history.replaceState(null, '', '#registrations');
        else if (section === 'donations') window.history.replaceState(null, '', '#donations');
        else if (section === 'messages') window.history.replaceState(null, '', '#messages');
        else if (section === 'website') window.history.replaceState(null, '', '#website');
      } else {
        window.history.replaceState(null, '', '#admin');
      }
      return updated;
    });
  };

  const openOnlySection = (section: 'registrations' | 'donations' | 'messages' | 'website') => {
    setOpenSections({
      registrations: section === 'registrations',
      donations: section === 'donations',
      messages: section === 'messages',
      website: section === 'website',
    });
    window.history.replaceState(null, '', `#${section}`);
  };

  const handleCmsSubTabChange = (newSubTab: SubTabId) => {
    setActiveCmsSubTab(newSubTab);
    if (newSubTab === 'pages') {
      window.history.replaceState(null, '', '#Information & Policies');
    } else {
      window.history.replaceState(null, '', `#website/${newSubTab}`);
    }
  };

  const siteName = settings.siteName || (isUrdu ? 'آرائیں بنوں' : 'ARAAIN BANNU');
  const siteSubName = settings.siteSubName || (isUrdu ? 'انتظامیہ کنٹرول پورٹل' : 'ADMIN CRM');

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col text-slate-900 font-sans selection:bg-[#AD7A28]/20 selection:text-[#AD7A28]">
      {/* 1. TOPBAR: Website Name, Logo, View Website, Language, Logout */}
      <header className="sticky top-0 z-40 bg-[#16232F] text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Website Name */}
          <div className="flex items-center gap-3 min-w-0">
            {settings.logoData ? (
              <img
                src={settings.logoData}
                alt="Logo"
                className="w-9 h-9 rounded-xl object-contain bg-white/10 p-0.5 border border-white/10 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white truncate">
                  {siteName}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/20">
                  {siteSubName}
                </span>
              </div>
              {adminEmail && (
                <p className="text-[10px] text-slate-400 font-mono truncate hidden md:block">
                  {adminEmail}
                </p>
              )}
            </div>
          </div>

          {/* Topbar Actions: View Website, Language, Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* View Website Button (Prominent, High-Contrast) */}
            <button
              type="button"
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#AD7A28] hover:bg-[#8A5F19] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer ring-1 ring-amber-400/30"
              title="Return to Public Website"
            >
              <Eye className="w-4 h-4 text-amber-200" />
              <span className="hidden xs:inline">{isUrdu ? 'ویب سائٹ دیکھیں' : 'View Website'}</span>
              <span className="xs:hidden">{isUrdu ? 'ویب سائٹ' : 'Site'}</span>
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLanguage(lang === 'ur' ? 'en' : 'ur')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all border border-white/10 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'ur' ? 'English' : 'اردو'}</span>
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={() => {
                if (confirm(isUrdu ? 'کیا آپ واقعی ایڈمن پورٹل سے لاگ آؤٹ کرنا چاہتے ہیں؟' : 'Are you sure you want to sign out of the Admin CRM?')) {
                  onLogout();
                }
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold transition-all border border-red-500/20 cursor-pointer flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isUrdu ? 'لاگ آؤٹ' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* 2. DASHBOARD / ANALYTICAL VIEW (Directly Below Topbar) */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/10 text-[#AD7A28] uppercase tracking-wider">
                Real-Time Console
              </span>
              <h2 className="text-lg font-black text-[#16232F] mt-0.5">
                {isUrdu ? 'انتظامی ڈیش بورڈ و تجزیاتی جائزہ' : 'Dashboard & Analytical Overview'}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono">Live Database Sync</span>
            </div>
          </div>

          {/* 4 Key Analytical Tiles matching the 4 terms */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Registrations KPI */}
            <div
              onClick={() => {
                setIsRegistrationsFullScreen(true);
                window.history.pushState(null, '', '#registrations');
              }}
              className="group p-4 rounded-2xl border border-slate-200 hover:border-[#AD7A28] bg-slate-50/50 hover:bg-amber-50/20 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-amber-500/10 text-[#AD7A28]">
                  <Users className="w-4 h-4" />
                </span>
                {pendingMembersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {pendingMembersCount} {isUrdu ? 'زیر جائزہ' : 'New'}
                  </span>
                )}
              </div>
              <div className="text-2xl font-black text-[#16232F] mt-2">
                {registrations.length}
              </div>
              <div className="text-xs font-bold text-slate-600 mt-0.5 flex items-center justify-between">
                <span>{isUrdu ? '1. ممبرشپ رجسٹریشنز' : '1. Registrations'}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#AD7A28] transition-colors" />
              </div>
            </div>

            {/* 2. Donations KPI */}
            <div
              onClick={() => openOnlySection('donations')}
              className="group p-4 rounded-2xl border border-slate-200 hover:border-[#AD7A28] bg-slate-50/50 hover:bg-amber-50/20 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Heart className="w-4 h-4" />
                </span>
                {pendingDonationsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {pendingDonationsCount} {isUrdu ? 'زیر توثیق' : 'Pending'}
                  </span>
                )}
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-2 truncate">
                PKR {verifiedDonationTotal.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-slate-600 mt-0.5 flex items-center justify-between">
                <span>{isUrdu ? '2. عطیات و فنڈز' : '2. Donations'}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#AD7A28] transition-colors" />
              </div>
            </div>

            {/* 3. Messages KPI */}
            <div
              onClick={() => openOnlySection('messages')}
              className="group p-4 rounded-2xl border border-slate-200 hover:border-[#AD7A28] bg-slate-50/50 hover:bg-amber-50/20 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                  <Mail className="w-4 h-4" />
                </span>
                {unreadMessagesCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                    {unreadMessagesCount} {isUrdu ? 'نئے' : 'Unread'}
                  </span>
                )}
              </div>
              <div className="text-2xl font-black text-[#16232F] mt-2">
                {messages.length}
              </div>
              <div className="text-xs font-bold text-slate-600 mt-0.5 flex items-center justify-between">
                <span>{isUrdu ? '3. پیغامات و رابطے' : '3. Messages'}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#AD7A28] transition-colors" />
              </div>
            </div>

            {/* 4. Update Website KPI */}
            <div
              onClick={() => {
                setIsWebsiteCmsFullScreen(true);
                window.history.pushState(null, '', '#website');
              }}
              className="group p-4 rounded-2xl border border-slate-200 hover:border-[#AD7A28] bg-slate-50/50 hover:bg-amber-50/20 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-slate-800 text-amber-300">
                  <Sliders className="w-4 h-4" />
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-amber-300">
                  13 Modules
                </span>
              </div>
              <div className="text-2xl font-black text-[#16232F] mt-2">
                CMS Ready
              </div>
              <div className="text-xs font-bold text-slate-600 mt-0.5 flex items-center justify-between">
                <span>{isUrdu ? '4. مواد مینیجر' : '4. Update Website'}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#AD7A28] transition-colors" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. THE 4 TERMS ONE BY ONE, BELOW AFTER ANOTHER */}
        <div className="space-y-4">
          {/* TERM 1: REGISTRATIONS */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
            {/* Term Header Bar with Open / Close Button */}
            <div 
              onClick={() => toggleSection('registrations')}
              className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-slate-50/60 hover:bg-slate-50 border-b border-slate-200/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#16232F] text-amber-300 font-black text-xs flex items-center justify-center shadow-xs">
                  1
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#16232F]">
                      {isUrdu ? 'رجسٹریشنز (Registrations)' : '1. Registrations'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                      {registrations.length} {isUrdu ? 'اراکین' : 'Total'}
                    </span>
                    {pendingMembersCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                        {pendingMembersCount} {isUrdu ? 'نئی درخواستیں' : 'Pending'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 hidden sm:block">
                    {isUrdu
                      ? 'تصویر، نام، مکمل تفصیلات دیکھنے اور آفیشل کارڈ جنریٹ کرنے کی سہولت'
                      : 'Registration list with picture, name, view, and digital card button.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRegistrationsFullScreen(true);
                    window.history.pushState(null, '', '#registrations');
                  }}
                  className="app-btn-primary app-btn-sm"
                  title="Open Full Screen Registrations Screen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isUrdu ? 'مکمل اسکرین' : 'Full Screen'}</span>
                </button>
                <span className="text-xs font-bold text-[#AD7A28] hidden xs:inline">
                  {openSections.registrations ? (isUrdu ? 'بند کریں' : 'Close') : (isUrdu ? 'کھولیں' : 'Open')}
                </span>
                <button
                  type="button"
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                >
                  {openSections.registrations ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Term Content: Registration List */}
            {openSections.registrations && (
              <div className="p-5 sm:p-6 animate-fadeIn border-t border-slate-100">
                <AdminMembers
                  registrations={registrations}
                  updateRegistrationStatus={updateRegistrationStatus}
                  deleteRegistration={deleteRegistration}
                  isUrdu={isUrdu}
                  onOpenFullScreen={() => {
                    setIsRegistrationsFullScreen(true);
                    window.history.pushState(null, '', '#registrations');
                  }}
                />
              </div>
            )}
          </div>

          {/* TERM 2: DONATIONS */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
            {/* Term Header Bar with Open / Close Button */}
            <div 
              onClick={() => toggleSection('donations')}
              className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-slate-50/60 hover:bg-slate-50 border-b border-slate-200/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#16232F] text-amber-300 font-black text-xs flex items-center justify-center shadow-xs">
                  2
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#16232F]">
                      {isUrdu ? 'عطیات (Donations)' : '2. Donations'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                      PKR {verifiedDonationTotal.toLocaleString()}
                    </span>
                    {pendingDonationsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                        {pendingDonationsCount} {isUrdu ? 'زیر توثیق' : 'Pending'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 hidden sm:block">
                    {isUrdu
                      ? 'عطیات کی فہرست، رسید کی تفصیلی معلومات اور فوری منظوری (Approve) بٹن'
                      : 'List of donations and details with approve button and verification ledger.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#AD7A28] hidden xs:inline">
                  {openSections.donations ? (isUrdu ? 'بند کریں' : 'Close') : (isUrdu ? 'کھولیں' : 'Open')}
                </span>
                <button
                  type="button"
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                >
                  {openSections.donations ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Term Content: Donations List */}
            {openSections.donations && (
              <div className="p-5 sm:p-6 animate-fadeIn border-t border-slate-100">
                <AdminDonations
                  donations={donations}
                  updateDonationStatus={updateDonationStatus}
                  deleteDonation={deleteDonation}
                  isUrdu={isUrdu}
                />
              </div>
            )}
          </div>

          {/* TERM 3: MESSAGES */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
            {/* Term Header Bar with Open / Close Button */}
            <div 
              onClick={() => toggleSection('messages')}
              className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-slate-50/60 hover:bg-slate-50 border-b border-slate-200/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#16232F] text-amber-300 font-black text-xs flex items-center justify-center shadow-xs">
                  3
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#16232F]">
                      {isUrdu ? 'پیغامات (Messages)' : '3. Messages'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                      {messages.length} {isUrdu ? 'کل' : 'Total'}
                    </span>
                    {unreadMessagesCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                        {unreadMessagesCount} {isUrdu ? 'نئے' : 'Unread'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 hidden sm:block">
                    {isUrdu
                      ? 'پیغامات کی فہرست اور تفصیلی پیغام کھولنے کا بٹن (View Details)'
                      : 'List of messages with view button that opens complete message details.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#AD7A28] hidden xs:inline">
                  {openSections.messages ? (isUrdu ? 'بند کریں' : 'Close') : (isUrdu ? 'کھولیں' : 'Open')}
                </span>
                <button
                  type="button"
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                >
                  {openSections.messages ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Term Content: Messages List */}
            {openSections.messages && (
              <div className="p-5 sm:p-6 animate-fadeIn border-t border-slate-100">
                <AdminInquiries
                  messages={messages}
                  updateContactMessageStatus={updateContactMessageStatus}
                  deleteContactMessage={deleteContactMessage}
                  isUrdu={isUrdu}
                />
              </div>
            )}
          </div>

          {/* TERM 4: UPDATE WEBSITE */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
            {/* Term Header Bar with Open / Close Button */}
            <div 
              onClick={() => toggleSection('website')}
              className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-slate-50/60 hover:bg-slate-50 border-b border-slate-200/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#16232F] text-amber-300 font-black text-xs flex items-center justify-center shadow-xs">
                  4
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#16232F]">
                      {isUrdu ? 'ویب سائٹ اپ ڈیٹ کریں (Update Website)' : '4. Update Website'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-amber-300">
                      . Topbar, . Hero, . About, . Documentation
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 hidden sm:block">
                    {isUrdu
                      ? 'ٹاپ بار، ہیرو سیکشن، تعارف، پروگرامز، اور سرکاری معلوماتی صفحات کا انتظام'
                      : 'Live CMS editor for Topbar, Hero section, About section, and Information & Policies.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWebsiteCmsFullScreen(true);
                    window.history.pushState(null, '', '#website');
                  }}
                  className="app-btn-primary app-btn-sm"
                  title="Open Full Screen Website Updates Studio"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isUrdu ? 'مکمل اسکرین ایڈیٹر' : 'Full Screen Editor'}</span>
                </button>
                <span className="text-xs font-bold text-[#AD7A28] hidden xs:inline">
                  {openSections.website ? (isUrdu ? 'بند کریں' : 'Close') : (isUrdu ? 'کھولیں' : 'Open')}
                </span>
                <button
                  type="button"
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                >
                  {openSections.website ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Term Content: Update Website CMS Modules */}
            {openSections.website && (
              <div className="p-5 sm:p-6 animate-fadeIn border-t border-slate-100">
                <AdminSiteContent
                  settings={settings}
                  programs={programs}
                  leaders={leaders}
                  events={events}
                  pages={pages}
                  gallery={gallery}
                  onSettingsUpdate={saveSettings}
                  onProgramsUpdate={savePrograms}
                  onLeadersUpdate={saveLeaders}
                  onEventsUpdate={saveEvents}
                  onPagesUpdate={savePages}
                  onGalleryUpdate={saveGallery}
                  isUrdu={isUrdu}
                  initialSubTab={activeCmsSubTab}
                  initialPageCategory={cmsPageCategory}
                  onSubTabChange={handleCmsSubTabChange}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Full-Screen Complete Registrations Directory & Member Dossier */}
      {isRegistrationsFullScreen && (
        <AdminRegistrationsScreen
          registrations={registrations}
          onBack={() => {
            setIsRegistrationsFullScreen(false);
            setSelectedMemberIdForDetail(null);
            window.history.replaceState(null, '', '#admin');
          }}
          updateRegistrationStatus={updateRegistrationStatus}
          deleteRegistration={deleteRegistration}
          isUrdu={isUrdu}
          initialMemberId={selectedMemberIdForDetail}
        />
      )}

      {/* Full-Screen Website Content Management System (CMS) with Located Tabs */}
      {isWebsiteCmsFullScreen && (
        <AdminWebsiteCmsScreen
          settings={settings}
          programs={programs}
          leaders={leaders}
          events={events}
          pages={pages}
          gallery={gallery}
          onSettingsUpdate={saveSettings}
          onProgramsUpdate={savePrograms}
          onLeadersUpdate={saveLeaders}
          onEventsUpdate={saveEvents}
          onPagesUpdate={savePages}
          onGalleryUpdate={saveGallery}
          isUrdu={isUrdu}
          onBack={() => {
            setIsWebsiteCmsFullScreen(false);
            window.history.replaceState(null, '', '#admin');
          }}
          onViewWebsite={onExitAdmin}
          initialSubTab={activeCmsSubTab}
          initialPageCategory={cmsPageCategory}
        />
      )}
    </div>
  );
};
