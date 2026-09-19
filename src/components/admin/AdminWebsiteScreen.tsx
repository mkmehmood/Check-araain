import React, { useEffect, useState } from 'react';
import {
  Program,
  Leader,
  EventItem,
  PageItem,
  GalleryItem,
  SiteSettings,
  PageCategory,
} from '../../types';
import { FullScreenHeader } from '../common/FullScreenHeader';
import { IdentityCms } from './IdentityCms';
import { HeroCms } from './HeroCms';
import { AboutCms } from './AboutCms';
import { ProgramsCms } from './ProgramsCms';
import { LeadersCms } from './LeadersCms';
import { EventsCms } from './EventsCms';
import { GalleryCms } from './GalleryCms';
import { ContactCms } from './ContactCms';
import { PagesCms } from './PagesCms';
import { BankCms } from './BankCms';
import { CtaCms } from './CtaCms';
import { FooterCms } from './FooterCms';
import { AnalyticsCms } from './AnalyticsCms';
import {
  Sparkles,
  Image as ImageIcon,
  Info,
  Heart,
  Calendar,
  Images,
  Building,
  BookOpen,
  Users,
  Building2,
  UserCheck,
  Share2,
  BarChart3,
  ChevronRight,
  Sliders,
  Globe,
} from 'lucide-react';

export type WebsiteSectionId =
  | 'topbar'
  | 'hero'
  | 'about'
  | 'programs'
  | 'events'
  | 'gallery'
  | 'contact'
  | 'pages'
  | 'leaders'
  | 'bank'
  | 'cta'
  | 'footer'
  | 'analytics';

interface SectionDef {
  id: WebsiteSectionId;
  dot: string;
  title: string;
  titleUr: string;
  desc: string;
  descUr: string;
  icon: any;
}

const PRIMARY_SECTIONS: SectionDef[] = [
  { id: 'topbar', dot: '.', title: 'Topbar', titleUr: 'ٹاپ بار', desc: 'Logo, organization name, sub name & announcements', descUr: 'لوگو، تنظیمی نام، ذیلی نام اور اعلانات', icon: Sparkles },
  { id: 'hero', dot: '.', title: 'Hero Section', titleUr: 'ہیرو سیکشن', desc: 'Badge, title, subtitle, tagline, background photos & notice', descUr: 'بیج، سرخی، ذیلی سرخی، پس منظر تصاویر اور نوٹس', icon: ImageIcon },
  { id: 'about', dot: '.', title: 'About Section', titleUr: 'تعارف', desc: 'Main title, subtitle, narrative paragraphs & impact counters', descUr: 'مرکزی عنوان، ذیلی عنوان اور اعداد و شمار', icon: Info },
  { id: 'programs', dot: '.', title: 'Strategic Welfare Wings', titleUr: 'فلاحی شعبہ جات', desc: 'Add programs with title, objective & pictures', descUr: 'پروگرامز کا عنوان، مقصد اور تصاویر شامل کریں', icon: Heart },
  { id: 'events', dot: '.', title: 'Events', titleUr: 'تقریبات', desc: 'Add events with title, date, location & pictures', descUr: 'تقریب کا عنوان، تاریخ، مقام اور تصاویر شامل کریں', icon: Calendar },
  { id: 'gallery', dot: '.', title: 'Photo Gallery', titleUr: 'فوٹو گیلری', desc: 'Upload pictures and preview the public gallery', descUr: 'تصاویر اپ لوڈ کریں اور پیش منظر دیکھیں', icon: Images },
  { id: 'contact', dot: '.', title: 'Contact Section', titleUr: 'رابطہ', desc: 'Office address, phone, hours & contact desks', descUr: 'دفتر کا پتہ، فون اور اوقات کار', icon: Building },
  { id: 'pages', dot: '.', title: 'Information & Policies', titleUr: 'معلومات و پالیسیز', desc: 'Our Blog, Our History, Documentation, Environmental, Town Gallery, Department', descUr: 'بلاگ، تاریخ، دستاویزات، ماحولیات، ٹاؤن گیلری، شعبہ جات', icon: BookOpen },
];

const SETTINGS_SECTIONS: SectionDef[] = [
  { id: 'leaders', dot: '.', title: 'Leadership', titleUr: 'قیادت', desc: 'Patrons, office bearers & council members', descUr: 'سرپرست اور عہدیداران', icon: Users },
  { id: 'bank', dot: '.', title: 'Bank & Donation Accounts', titleUr: 'بینک اکاؤنٹس', desc: 'IBAN, EasyPaisa, JazzCash & Raast donation channels', descUr: 'عطیات کے بینک اکاؤنٹس', icon: Building2 },
  { id: 'cta', dot: '.', title: 'Membership & Donation Banners', titleUr: 'ممبرشپ بینرز', desc: 'Call-to-action banners across the site', descUr: 'دعوت شمولیت بینرز', icon: UserCheck },
  { id: 'footer', dot: '.', title: 'Footer & Social', titleUr: 'فوٹر', desc: 'Social links, footer text & copyright', descUr: 'سوشل روابط اور کاپی رائٹ', icon: Share2 },
  { id: 'analytics', dot: '.', title: 'Analytics & SEO', titleUr: 'اینالیٹکس', desc: 'Google Analytics ID & search meta tags', descUr: 'اینالیٹکس اور ایس ای او', icon: BarChart3 },
];

const ALL_SECTIONS = [...PRIMARY_SECTIONS, ...SETTINGS_SECTIONS];

interface AdminWebsiteScreenProps {
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
  onViewWebsite: () => void;
  initialSection?: WebsiteSectionId | null;
  initialPageCategory?: PageCategory;
}

export const AdminWebsiteScreen: React.FC<AdminWebsiteScreenProps> = ({
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
  initialSection = null,
  initialPageCategory = 'documentation',
}) => {
  const [activeSection, setActiveSection] = useState<WebsiteSectionId | null>(initialSection);
  const [pageCategory, setPageCategory] = useState<PageCategory>(initialPageCategory);

  useEffect(() => setActiveSection(initialSection ?? null), [initialSection]);
  useEffect(() => setPageCategory(initialPageCategory), [initialPageCategory]);

  const openSection = (id: WebsiteSectionId) => {
    setActiveSection(id);
    window.history.pushState(null, '', `#website/${id}`);
  };

  const closeSection = () => {
    setActiveSection(null);
    window.history.pushState(null, '', '#website');
  };

  const current = ALL_SECTIONS.find((s) => s.id === activeSection);

  // ---------- Full-screen single section editor ----------
  if (current) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FBF9F4] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
        <FullScreenHeader
          title={isUrdu ? current.titleUr : current.title}
          subtitle={isUrdu ? current.descUr : current.desc}
          badge={isUrdu ? 'ویب سائٹ اپ ڈیٹ' : 'Update Website'}
          icon={<current.icon className="w-4 h-4 text-amber-300" />}
          onBack={closeSection}
        />
        <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7">
          {current.id === 'topbar' && <IdentityCms settings={settings} onSaved={onSettingsUpdate} isUrdu={isUrdu} />}
          {current.id === 'hero' && <HeroCms settings={settings} onSaved={onSettingsUpdate} isUrdu={isUrdu} />}
          {current.id === 'about' && <AboutCms settings={settings} leaders={leaders} onSaved={onSettingsUpdate} isUrdu={isUrdu} />}
          {current.id === 'programs' && (
            <ProgramsCms programs={programs} settings={settings} onProgramsSaved={onProgramsUpdate} onSettingsSaved={onSettingsUpdate} isUrdu={isUrdu} />
          )}
          {current.id === 'events' && (
            <EventsCms events={events} settings={settings} onEventsSaved={onEventsUpdate} onSettingsSaved={onSettingsUpdate} isUrdu={isUrdu} />
          )}
          {current.id === 'gallery' && (
            <GalleryCms gallery={gallery} settings={settings} onGallerySaved={onGalleryUpdate} onSettingsSaved={onSettingsUpdate} isUrdu={isUrdu} />
          )}
          {current.id === 'contact' && <ContactCms settings={settings} onSaved={onSettingsUpdate} isUrdu={isUrdu} />}
          {current.id === 'pages' && (
            <PagesCms pages={pages} onPagesSaved={onPagesUpdate} isUrdu={isUrdu} initialCategory={pageCategory} />
          )}
          {current.id === 'leaders' && (
            <LeadersCms leaders={leaders} settings={settings} onLeadersSaved={onLeadersUpdate} onSettingsSaved={onSettingsUpdate} isUrdu={isUrdu} />
          )}
          {current.id === 'bank' && <BankCms settings={settings} onSaved={onSettingsUpdate} isUrdu={isUrdu} />}
          {current.id === 'cta' && <CtaCms settings={settings} onSaved={onSettingsUpdate} isUrdu={isUrdu} />}
          {current.id === 'footer' && <FooterCms settings={settings} onSaved={onSettingsUpdate} isUrdu={isUrdu} />}
          {current.id === 'analytics' && <AnalyticsCms settings={settings} onSaved={onSettingsUpdate} isUrdu={isUrdu} />}
        </div>
      </div>
    );
  }

  // ---------- Hub: grid of section cards ----------
  const renderGrid = (list: SectionDef[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {list.map((s) => {
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => openSection(s.id)}
            className="group flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-[#AD7A28]/50 hover:shadow-md text-left transition-all cursor-pointer"
          >
            <span className="w-11 h-11 shrink-0 rounded-xl bg-[#16232F] text-[#F5CA7B] flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-[#16232F] truncate">
                {isUrdu ? s.titleUr : s.title}
              </span>
              <span className="block text-xs text-slate-500 truncate">
                {isUrdu ? s.descUr : s.desc}
              </span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#AD7A28] shrink-0" />
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#FBF9F4] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
      <FullScreenHeader
        title={isUrdu ? 'ویب سائٹ اپ ڈیٹ کریں' : 'Update Website'}
        subtitle={isUrdu ? 'ہر سیکشن اپنی مکمل اسکرین میں کھلتا ہے' : 'Each section opens in its own full screen editor'}
        icon={<Sliders className="w-4 h-4 text-amber-300" />}
        onBack={onBack}
        rightActions={
          <button
            type="button"
            onClick={onViewWebsite}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#F5CA7B]" />
            <span className="hidden sm:inline">{isUrdu ? 'ویب سائٹ دیکھیں' : 'View Website'}</span>
          </button>
        }
      />

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-7">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#AD7A28] mb-3">
            {isUrdu ? 'ویب سائٹ سیکشنز' : 'Website Sections'}
          </h2>
          {renderGrid(PRIMARY_SECTIONS)}
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            {isUrdu ? 'تنظیمی ترتیبات' : 'Organization Settings'}
          </h2>
          {renderGrid(SETTINGS_SECTIONS)}
        </div>
      </div>
    </div>
  );
};
