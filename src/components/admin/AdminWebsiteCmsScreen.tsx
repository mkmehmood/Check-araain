import React, { useState, useEffect } from 'react';
import { 
  Program, 
  Leader, 
  EventItem, 
  PageItem, 
  GalleryItem, 
  SiteSettings 
} from '../../types';
import { FullScreenHeader } from '../common/FullScreenHeader';
import { SubTabId } from './AdminSiteContent';
import { PolicyCategory } from './PagesCms';
import { IdentityCms } from './IdentityCms';
import { HeroCms } from './HeroCms';
import { AboutCms } from './AboutCms';
import { ProgramsCms } from './ProgramsCms';
import { LeadersCms } from './LeadersCms';
import { EventsCms } from './EventsCms';
import { GalleryCms } from './GalleryCms';
import { CtaCms } from './CtaCms';
import { BankCms } from './BankCms';
import { ContactCms } from './ContactCms';
import { PagesCms } from './PagesCms';
import { FooterCms } from './FooterCms';
import { AnalyticsCms } from './AnalyticsCms';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Info, 
  Heart, 
  Users, 
  Calendar, 
  Images, 
  BookOpen, 
  Building2, 
  Building, 
  UserCheck, 
  Share2, 
  BarChart3,
  Sliders,
  ExternalLink,
  ChevronRight,
  Globe
} from 'lucide-react';

interface AdminWebsiteCmsScreenProps {
  settings: SiteSettings;
  programs: Program[];
  leaders: Leader[];
  events: EventItem[];
  pages: PageItem[];
  gallery: GalleryItem[];
  onSettingsUpdate: (patch: Partial<SiteSettings>) => void;
  onProgramsUpdate: (programs: Program[]) => void;
  onLeadersUpdate: (leaders: Leader[]) => void;
  onEventsUpdate: (events: EventItem[]) => void;
  onPagesUpdate: (pages: PageItem[]) => void;
  onGalleryUpdate: (gallery: GalleryItem[]) => void;
  isUrdu: boolean;
  onBack: () => void;
  onViewWebsite?: () => void;
  initialSubTab?: SubTabId;
  initialPageCategory?: PolicyCategory;
}

export const AdminWebsiteCmsScreen: React.FC<AdminWebsiteCmsScreenProps> = ({
  settings,
  programs,
  leaders,
  events,
  pages,
  gallery,
  onSettingsUpdate,
  onProgramsUpdate,
  onLeadersUpdate,
  onEventsUpdate,
  onPagesUpdate,
  onGalleryUpdate,
  isUrdu,
  onBack,
  onViewWebsite,
  initialSubTab = 'topbar',
  initialPageCategory = 'all',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>(initialSubTab);
  const [pageCategory, setPageCategory] = useState<PolicyCategory>(initialPageCategory);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    if (initialPageCategory) {
      setPageCategory(initialPageCategory);
    }
  }, [initialPageCategory]);

  const subNavItems: { 
    id: SubTabId; 
    label: string; 
    dotLabel: string; 
    shortDesc: string;
    icon: any; 
  }[] = [
    { 
      id: 'topbar', 
      label: isUrdu ? 'ٹاپ بار و شناخت' : 'Topbar & Identity', 
      dotLabel: '. Topbar', 
      shortDesc: isUrdu ? 'لوگو، نام اور اعلانات' : 'Site Name, Logo & Announcements',
      icon: Sparkles 
    },
    { 
      id: 'hero', 
      label: isUrdu ? 'ہیرو بینر' : 'Hero Section', 
      dotLabel: '. Hero section', 
      shortDesc: isUrdu ? 'اہم بینر، سرخی اور نوٹس' : 'Hero Title, Tagline & Background',
      icon: ImageIcon 
    },
    { 
      id: 'about', 
      label: isUrdu ? 'تعارف و اعداد' : 'About Section', 
      dotLabel: '. About Section', 
      shortDesc: isUrdu ? 'مقاصد اور کارکردگی کے اعداد' : 'Mission, Vision & Key Numbers',
      icon: Info 
    },
    { 
      id: 'programs', 
      label: isUrdu ? 'فلاحی پروگرامز' : 'Programs', 
      dotLabel: '. Programs', 
      shortDesc: isUrdu ? 'تعلیمی، طبی اور فلاحی پروجیکٹس' : 'Welfare Initiatives & Funding',
      icon: Heart 
    },
    { 
      id: 'leaders', 
      label: isUrdu ? 'قیادت و کابینہ' : 'Leadership', 
      dotLabel: '. Leadership', 
      shortDesc: isUrdu ? 'عہدیداران، سرپرست اور اراکین' : 'Patrons, Office Bearers & Council',
      icon: Users 
    },
    { 
      id: 'events', 
      label: isUrdu ? 'تقریبات و شیڈول' : 'Events Calendar', 
      dotLabel: '. Events', 
      shortDesc: isUrdu ? 'آئندہ اجلاس، کانفرنسز اور تقاریب' : 'Upcoming Gatherings & Seminars',
      icon: Calendar 
    },
    { 
      id: 'gallery', 
      label: isUrdu ? 'ٹاؤن گیلری' : 'Town Gallery', 
      dotLabel: '. Town Gallery', 
      shortDesc: isUrdu ? 'تاریخی تصاویر اور تصویری البم' : 'Photo Collections & Albums',
      icon: Images 
    },
    { 
      id: 'pages', 
      label: isUrdu ? 'معلومات، آئین و پالیسیز' : 'Information & Policies / Documentation', 
      dotLabel: '. Documentation', 
      shortDesc: isUrdu ? 'آئین، تاریخ، بلاگ، ماحولیات اور شعبہ جات' : 'Constitution, History, Blog & Departments',
      icon: BookOpen 
    },
    { 
      id: 'bank', 
      label: isUrdu ? 'بینک اکاؤنٹس' : 'Bank Accounts', 
      dotLabel: '. Bank Accounts', 
      shortDesc: isUrdu ? 'عطیات کے بینک اور ایزی پیسہ اکاؤنٹس' : 'Donation IBAN, Title & Channels',
      icon: Building2 
    },
    { 
      id: 'contact', 
      label: isUrdu ? 'رابطہ و ڈیسکس' : 'Contact Desks', 
      dotLabel: '. Contact Desks', 
      shortDesc: isUrdu ? 'دفتر کا پتہ، فون نمبر اور ہیلپ لائن' : 'Official Office Address & Helplines',
      icon: Building 
    },
    { 
      id: 'cta', 
      label: isUrdu ? 'ممبرشپ بینرز' : 'CTAs & Banners', 
      dotLabel: '. CTAs', 
      shortDesc: isUrdu ? 'دعوت شمولیت اور عطیہ بینرز' : 'Call-to-Action Banners & Slogans',
      icon: UserCheck 
    },
    { 
      id: 'footer', 
      label: isUrdu ? 'فوٹر و سوشل' : 'Footer & Social', 
      dotLabel: '. Footer', 
      shortDesc: isUrdu ? 'سوشل لنکس اور کاپی رائٹ تفصیلات' : 'Social Channels, Links & Copyright',
      icon: Share2 
    },
    { 
      id: 'analytics', 
      label: isUrdu ? 'اینالیٹکس و ایس ای او' : 'Analytics & SEO', 
      dotLabel: '. Analytics', 
      shortDesc: isUrdu ? 'گوگل اینالیٹکس اور سرچ میٹا ٹیگز' : 'Google Analytics ID & Search Tags',
      icon: BarChart3 
    },
  ];

  const currentTab = subNavItems.find(t => t.id === activeSubTab) || subNavItems[0];

  const handleTabSelect = (tabId: SubTabId) => {
    setActiveSubTab(tabId);
    window.history.replaceState(null, '', `#website/${tabId}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FBF9F4] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
      {/* Full Screen Header */}
      <FullScreenHeader
        title={currentTab.label}
        subtitle={
          isUrdu
            ? `عوامی ویب سائٹ کا لائیو مواد اپڈیٹ کریں (${currentTab.dotLabel})`
            : `Live Website Content Updates (${currentTab.dotLabel}) • Full Screen Editor`
        }
        badge={currentTab.dotLabel}
        icon={<Sliders className="w-4 h-4 text-amber-300" />}
        onBack={onBack}
        rightActions={
          onViewWebsite ? (
            <button
              type="button"
              onClick={onViewWebsite}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#F5CA7B]" />
              <span className="hidden sm:inline">{isUrdu ? 'ویب سائٹ دیکھیں' : 'View Public Website'}</span>
            </button>
          ) : undefined
        }
      />

      {/* Located Tabs Navigation Bar */}
      <div className="sticky top-[53px] sm:top-[61px] z-30 bg-[#16232F] border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {subNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabSelect(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#AD7A28] text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-amber-300/70'}`} />
                  <span>{item.dotLabel}</span>
                  <span className="hidden md:inline font-normal text-[11px] opacity-80">
                    — {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Full Screen Editor Container */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Section Header Card in Located Style */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#16232F] text-[#F5CA7B] flex items-center justify-center shrink-0 border border-[#AD7A28]/30">
              {React.createElement(currentTab.icon, { className: "w-5 h-5" })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#AD7A28] font-mono">
                  {currentTab.dotLabel}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-semibold">
                  {isUrdu ? 'عوامی ویب سائٹ سیکشن' : 'Public Website Section'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#16232F]">
                {currentTab.label}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentTab.shortDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <span>{isUrdu ? 'سی آر ایم پر واپس' : 'Return to CRM'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Full Screen Editor Component */}
        <div className="bg-transparent">
          {activeSubTab === 'topbar' && (
            <IdentityCms
              settings={settings}
              onSaved={onSettingsUpdate}
              isUrdu={isUrdu}
            />
          )}

          {activeSubTab === 'hero' && (
            <HeroCms
              settings={settings}
              onSaved={onSettingsUpdate}
              isUrdu={isUrdu}
            />
          )}

          {activeSubTab === 'about' && (
            <AboutCms
              settings={settings}
              leaders={leaders}
              onSaved={onSettingsUpdate}
              isUrdu={isUrdu}
            />
          )}

          {activeSubTab === 'programs' && (
            <ProgramsCms
              programs={programs}
              settings={settings}
              onProgramsSaved={onProgramsUpdate}
              onSettingsSaved={onSettingsUpdate}
              isUrdu={isUrdu}
            />
          )}

          {activeSubTab === 'leaders' && (
            <LeadersCms
              leaders={leaders}
              settings={settings}
              onLeadersSaved={onLeadersUpdate}
              onSettingsSaved={onSettingsUpdate}
              isUrdu={isUrdu}
            />
          )}

          {activeSubTab === 'events' && (
            <EventsCms
              events={events}
              settings={settings}
              onEventsSaved={onEventsUpdate}
              onSettingsSaved={onSettingsUpdate}
              isUrdu={isUrdu}
            />
          )}

          {activeSubTab === 'gallery' && (
            <GalleryCms
              gallery={gallery}
              settings={settings}
              onGallerySaved={onGalleryUpdate}
              onSettingsSaved={onSettingsUpdate}
              isUrdu={isUrdu}
            />
          )}

          {activeSubTab === 'pages' && (
            <PagesCms
              pages={pages}
              onPagesSaved={onPagesUpdate}
              isUrdu={isUrdu}
              initialCategory={pageCategory}
            />
          )}

          {activeSubTab === 'bank' && (
            <BankCms
              settings={settings}
              onSaved={onSettingsUpdate}
              isUrdu={isUrdu}
            />
          )}

          {activeSubTab === 'contact' && (
            <ContactCms
              settings={settings}
              onSaved={onSettingsUpdate}
              isUrdu={isUrdu}
            />
          )}

          {activeSubTab === 'cta' && (
            <CtaCms
              settings={settings}
              onSaved={onSettingsUpdate}
              isUrdu={isUrdu}
            />
          )}

          {activeSubTab === 'footer' && (
            <FooterCms
              settings={settings}
              onSaved={onSettingsUpdate}
              isUrdu={isUrdu}
            />
          )}

          {activeSubTab === 'analytics' && (
            <AnalyticsCms
              settings={settings}
              onSaved={onSettingsUpdate}
              isUrdu={isUrdu}
            />
          )}
        </div>

      </div>
    </div>
  );
};
