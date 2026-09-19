import React, { useState, useEffect } from 'react';
import { 
  Program, 
  Leader, 
  EventItem, 
  PageItem, 
  GalleryItem, 
  SiteSettings 
} from '../../types';
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
import { PagesCms, PolicyCategory } from './PagesCms';
import { FooterCms } from './FooterCms';
import { AnalyticsCms } from './AnalyticsCms';
import { 
  Megaphone, 
  Sparkles, 
  Image as ImageIcon, 
  Info, 
  Heart, 
  Users, 
  Calendar, 
  Images, 
  UserCheck, 
  Building2, 
  Building, 
  BookOpen, 
  Share2, 
  BarChart3,
  Sliders
} from 'lucide-react';

export type SubTabId =
  | 'topbar'
  | 'hero'
  | 'about'
  | 'programs'
  | 'leaders'
  | 'events'
  | 'gallery'
  | 'pages'
  | 'bank'
  | 'contact'
  | 'cta'
  | 'footer'
  | 'analytics';

interface AdminSiteContentProps {
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
  initialSubTab?: SubTabId;
  initialPageCategory?: PolicyCategory;
  onSubTabChange?: (subTab: SubTabId) => void;
}

export const AdminSiteContent: React.FC<AdminSiteContentProps> = ({
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
  initialSubTab = 'topbar',
  initialPageCategory = 'all',
  onSubTabChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSubTabClick = (id: SubTabId) => {
    setActiveSubTab(id);
    if (onSubTabChange) {
      onSubTabChange(id);
    }
  };

  const subNavItems: { id: SubTabId; label: string; dotLabel: string; icon: any; doc: string }[] = [
    { id: 'topbar', label: isUrdu ? 'ٹاپ بار و شناخت' : 'Topbar & Identity', dotLabel: '. Topbar', icon: Sparkles, doc: 'siteConfig/identity' },
    { id: 'hero', label: isUrdu ? 'ہیرو بینر' : 'Hero Section', dotLabel: '. Hero section', icon: ImageIcon, doc: 'siteConfig/hero' },
    { id: 'about', label: isUrdu ? 'تعارف و اعداد' : 'About Section', dotLabel: '. About Section', icon: Info, doc: 'siteConfig/about' },
    { id: 'programs', label: isUrdu ? 'فلاحی پروگرامز' : 'Programs', dotLabel: '. Programs', icon: Heart, doc: 'siteConfig/programs' },
    { id: 'leaders', label: isUrdu ? 'قیادت و کابینہ' : 'Leadership', dotLabel: '. Leadership', icon: Users, doc: 'siteConfig/leaders' },
    { id: 'events', label: isUrdu ? 'تقریبات' : 'Events Calendar', dotLabel: '. Events', icon: Calendar, doc: 'siteConfig/events' },
    { id: 'gallery', label: isUrdu ? 'ٹاؤن گیلری' : 'Town Gallery', dotLabel: '. Town Gallery', icon: Images, doc: 'siteConfig/gallery' },
    { id: 'pages', label: isUrdu ? 'معلومات، آئین و پالیسیز' : 'Information & Policies / Documentation', dotLabel: '. Documentation', icon: BookOpen, doc: 'siteConfig/pages' },
    { id: 'bank', label: isUrdu ? 'بینک اکاؤنٹس' : 'Bank & Accounts', dotLabel: '. Bank Accounts', icon: Building2, doc: 'siteConfig/donation' },
    { id: 'contact', label: isUrdu ? 'رابطہ و ڈیسکس' : 'Contact & Desks', dotLabel: '. Contact Desks', icon: Building, doc: 'siteConfig/contact' },
    { id: 'cta', label: isUrdu ? 'ممبرشپ بینرز' : 'CTAs & Banners', dotLabel: '. CTAs', icon: UserCheck, doc: 'siteConfig/sections' },
    { id: 'footer', label: isUrdu ? 'فوٹر و سوشل' : 'Footer & Social', dotLabel: '. Footer', icon: Share2, doc: 'siteConfig/footer' },
    { id: 'analytics', label: isUrdu ? 'اینالیٹکس و ایس ای او' : 'Analytics & SEO', dotLabel: '. Analytics', icon: BarChart3, doc: 'siteConfig/misc' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sub-tab Pills (Horizontal scrollable with dot prefixes matching user prompt) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSubTabClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#16232F] text-amber-300 shadow-xs ring-1 ring-[#16232F]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#AD7A28]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Sub CMS Component */}
      <div className="pt-2">
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
            initialCategory={initialPageCategory}
            onNavigateToGallery={() => handleSubTabClick('gallery')}
          />
        )}

        {activeSubTab === 'cta' && (
          <CtaCms
            settings={settings}
            onSaved={onSettingsUpdate}
            isUrdu={isUrdu}
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
  );
};
