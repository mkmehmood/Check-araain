import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { AdminRegistrationsScreen } from './AdminRegistrationsScreen';
import { AdminDonationsScreen } from './AdminDonationsScreen';
import { AdminMessagesScreen } from './AdminMessagesScreen';
import { AdminWebsiteScreen, WebsiteSectionId } from './AdminWebsiteScreen';
import { PageCategory } from '../../types';
import {
  Users,
  Heart,
  Mail,
  Sliders,
  LogOut,
  Globe,
  ChevronRight,
  UserPlus,
  Wallet,
  MessageSquareText,
} from 'lucide-react';

interface AdminDashboardProps {
  onExitAdmin: () => void;
  onLogout: () => void;
  adminEmail: string;
}

type TermId = 'registrations' | 'donations' | 'messages' | 'website';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onExitAdmin,
  onLogout,
  adminEmail,
}) => {
  const { isUrdu } = useLanguage();
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

  const [activeScreen, setActiveScreen] = useState<TermId | null>(null);
  const [memberDeepLink, setMemberDeepLink] = useState<string | null>(null);
  const [websiteSection, setWebsiteSection] = useState<WebsiteSectionId | null>(null);
  const [pageCategory, setPageCategory] = useState<PageCategory>('documentation');

  const pendingRegistrations = registrations.filter((r) => (r.status || 'new') === 'new').length;
  const pendingDonations = donations.filter((d) => (d.status || 'pending') === 'pending').length;
  const unreadMessages = messages.filter((m) => (m.status || 'unread') === 'unread').length;
  const verifiedTotal = donations
    .filter((d) => d.status === 'verified')
    .reduce((acc, d) => acc + (Number(d.amount) || 0), 0);

  /**
   * Deep-Link URL Router:
   * domain/#admin/#website/#Information & Policies/#Documentation
   */
  const routeFromHash = () => {
    const raw = window.location.hash || '';
    const decoded = decodeURIComponent(raw).toLowerCase().trim();

    if (!decoded || decoded === '#admin') {
      setActiveScreen(null);
      setWebsiteSection(null);
      return;
    }
    if (decoded.includes('documentation')) {
      setActiveScreen('website');
      setWebsiteSection('pages');
      setPageCategory('documentation');
      return;
    }
    if (decoded.includes('information') && decoded.includes('polic')) {
      setActiveScreen('website');
      setWebsiteSection('pages');
      return;
    }
    if (decoded.includes('registration') || decoded.includes('member')) {
      setActiveScreen('registrations');
      if (decoded.includes('=')) {
        const id = decoded.split('=')[1];
        if (id) setMemberDeepLink(id);
      }
      return;
    }
    if (decoded.includes('donation')) {
      setActiveScreen('donations');
      return;
    }
    if (decoded.includes('message') || decoded.includes('inquir')) {
      setActiveScreen('messages');
      return;
    }
    if (decoded.startsWith('#website')) {
      setActiveScreen('website');
      const parts = decoded.split('/').filter(Boolean);
      const sectionRaw = parts[1] || '';
      const known: WebsiteSectionId[] = ['topbar', 'hero', 'about', 'programs', 'events', 'gallery', 'contact', 'pages', 'leaders', 'bank', 'cta', 'footer', 'analytics'];
      if (known.includes(sectionRaw as WebsiteSectionId)) {
        setWebsiteSection(sectionRaw as WebsiteSectionId);
      }
      return;
    }
  };

  useEffect(() => {
    routeFromHash();
    window.addEventListener('hashchange', routeFromHash);
    return () => window.removeEventListener('hashchange', routeFromHash);
  }, []);

  const openScreen = (id: TermId) => {
    setActiveScreen(id);
    window.history.pushState(null, '', `#${id}`);
  };

  const closeScreen = () => {
    setActiveScreen(null);
    setMemberDeepLink(null);
    setWebsiteSection(null);
    window.history.pushState(null, '', '#admin');
  };

  // ---------- Full screen sub-routes ----------
  if (activeScreen === 'registrations') {
    return (
      <AdminRegistrationsScreen
        registrations={registrations}
        updateRegistrationStatus={updateRegistrationStatus}
        deleteRegistration={deleteRegistration}
        isUrdu={isUrdu}
        onBack={closeScreen}
        initialMemberId={memberDeepLink}
      />
    );
  }

  if (activeScreen === 'donations') {
    return (
      <AdminDonationsScreen
        donations={donations}
        updateDonationStatus={updateDonationStatus}
        deleteDonation={deleteDonation}
        isUrdu={isUrdu}
        onBack={closeScreen}
      />
    );
  }

  if (activeScreen === 'messages') {
    return (
      <AdminMessagesScreen
        messages={messages}
        updateContactMessageStatus={updateContactMessageStatus}
        deleteContactMessage={deleteContactMessage}
        isUrdu={isUrdu}
        onBack={closeScreen}
      />
    );
  }

  if (activeScreen === 'website') {
    return (
      <AdminWebsiteScreen
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
        onBack={closeScreen}
        onViewWebsite={onExitAdmin}
        initialSection={websiteSection}
        initialPageCategory={pageCategory}
      />
    );
  }

  // ---------- Dashboard home ----------
  const terms: {
    id: TermId;
    n: number;
    icon: any;
    title: string;
    titleUr: string;
    desc: string;
    descUr: string;
    badge?: string;
  }[] = [
    {
      id: 'registrations',
      n: 1,
      icon: Users,
      title: 'Registrations',
      titleUr: 'رجسٹریشنز',
      desc: 'Photo, name, view and membership card',
      descUr: 'تصویر، نام، دیکھیں اور کارڈ',
      badge: pendingRegistrations > 0 ? `${pendingRegistrations} ${isUrdu ? 'نئے' : 'new'}` : undefined,
    },
    {
      id: 'donations',
      n: 2,
      icon: Heart,
      title: 'Donations',
      titleUr: 'عطیات',
      desc: 'Donation list, details and approve',
      descUr: 'عطیات کی فہرست اور منظوری',
      badge: pendingDonations > 0 ? `${pendingDonations} ${isUrdu ? 'زیر التوا' : 'pending'}` : undefined,
    },
    {
      id: 'messages',
      n: 3,
      icon: Mail,
      title: 'Messages',
      titleUr: 'پیغامات',
      desc: 'Message list with full details view',
      descUr: 'پیغامات کی مکمل تفصیل',
      badge: unreadMessages > 0 ? `${unreadMessages} ${isUrdu ? 'نئے' : 'unread'}` : undefined,
    },
    {
      id: 'website',
      n: 4,
      icon: Sliders,
      title: 'Update Website',
      titleUr: 'ویب سائٹ اپ ڈیٹ کریں',
      desc: 'Topbar, Hero, About, Programs, Events & more',
      descUr: 'ٹاپ بار، ہیرو، تعارف، پروگرامز اور مزید',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#16232F] flex flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-[#16232F] text-white border-b border-[#AD7A28]/30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {settings.logoData ? (
              <img src={settings.logoData} alt={settings.siteName} className="w-9 h-9 rounded-xl object-cover border border-[#AD7A28]/40 shrink-0" />
            ) : (
              <span className="w-9 h-9 rounded-xl bg-[#AD7A28]/20 border border-[#AD7A28]/40 flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4 text-amber-300" />
              </span>
            )}
            <div className="min-w-0">
              <h1 className="text-sm font-bold truncate">{settings.siteName || 'Admin'}</h1>
              <p className="text-[11px] text-slate-300 truncate hidden xs:block">{adminEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold transition-all border border-white/10 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#F5CA7B]" />
              <span className="hidden sm:inline">{isUrdu ? 'ویب سائٹ دیکھیں' : 'View Website'}</span>
            </button>
            <button type="button" onClick={onLogout} className="app-btn-icon" title={isUrdu ? 'لاگ آؤٹ' : 'Logout'}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Dashboard / analytics view */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#AD7A28] mb-3">
            {isUrdu ? 'ڈیش بورڈ' : 'Dashboard'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4">
              <UserPlus className="w-4 h-4 text-[#AD7A28] mb-2" />
              <div className="text-xl font-black text-[#16232F]">{registrations.length}</div>
              <div className="text-[11px] text-slate-500">{isUrdu ? 'رجسٹریشنز' : 'Registrations'}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4">
              <Wallet className="w-4 h-4 text-emerald-600 mb-2" />
              <div className="text-xl font-black text-[#16232F]">PKR {verifiedTotal.toLocaleString()}</div>
              <div className="text-[11px] text-slate-500">{isUrdu ? 'وصول شدہ عطیات' : 'Verified Donations'}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4">
              <MessageSquareText className="w-4 h-4 text-purple-600 mb-2" />
              <div className="text-xl font-black text-[#16232F]">{unreadMessages}</div>
              <div className="text-[11px] text-slate-500">{isUrdu ? 'نئے پیغامات' : 'Unread Messages'}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4">
              <Users className="w-4 h-4 text-amber-600 mb-2" />
              <div className="text-xl font-black text-[#16232F]">{pendingRegistrations}</div>
              <div className="text-[11px] text-slate-500">{isUrdu ? 'زیر التوا منظوری' : 'Pending Approval'}</div>
            </div>
          </div>
        </div>

        {/* Stacked terms, one after another */}
        <div className="space-y-3">
          {terms.map((term) => {
            const Icon = term.icon;
            return (
              <button
                key={term.id}
                type="button"
                onClick={() => openScreen(term.id)}
                className="w-full flex items-center gap-3.5 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-[#AD7A28]/50 hover:shadow-md transition-all text-left cursor-pointer"
              >
                <span className="w-11 h-11 shrink-0 rounded-2xl bg-[#16232F] text-amber-300 font-black text-sm flex items-center justify-center">
                  {term.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#AD7A28] shrink-0" />
                    <span className="text-sm sm:text-base font-bold text-[#16232F] truncate">
                      {isUrdu ? term.titleUr : term.title}
                    </span>
                    {term.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#AD7A28]/15 text-[#8A5F19] shrink-0">
                        {term.badge}
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5 truncate">
                    {isUrdu ? term.descUr : term.desc}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#AD7A28] shrink-0">
                  <span className="hidden sm:inline">{isUrdu ? 'کھولیں' : 'Open'}</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
