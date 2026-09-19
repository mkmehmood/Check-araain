import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Globe, 
  MessageCircle, 
  HelpCircle, 
  Building2,
  ExternalLink
} from 'lucide-react';
import { ContactDetail } from '../types';

export type ContactType = 'phone' | 'whatsapp' | 'email' | 'address' | 'hours' | 'link' | 'auto';

/**
 * Automatically inspects the contact title and value to detect the most appropriate channel type.
 */
export function detectContactType(title: string = '', value: string = ''): 'phone' | 'whatsapp' | 'email' | 'address' | 'hours' | 'link' {
  const v = (value || '').trim().toLowerCase();
  const t = (title || '').trim().toLowerCase();
  const combined = `${t} ${v}`;

  // 1. Email detection
  if (v.includes('@') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || combined.includes('email') || combined.includes('ای میل') || combined.includes('میل')) {
    return 'email';
  }

  // 2. WhatsApp detection
  if (
    v.includes('wa.me') || 
    v.includes('whatsapp') || 
    t.includes('whatsapp') || 
    t.includes('وٹساپ') || 
    t.includes('واٹس ایپ') || 
    t.includes('واٹس')
  ) {
    return 'whatsapp';
  }

  // 3. Office Hours detection
  if (
    combined.includes('hour') || 
    combined.includes('timing') || 
    combined.includes('اوقات') || 
    combined.includes('وقت') || 
    combined.includes('schedule') || 
    combined.includes('پیر تا') || 
    combined.includes('ہفتہ') || 
    combined.includes('اتوار') || 
    combined.includes('daily') || 
    combined.includes('am') && combined.includes('pm')
  ) {
    return 'hours';
  }

  // 4. Physical Address detection
  if (
    combined.includes('address') || 
    combined.includes('office') || 
    combined.includes('headquarters') || 
    combined.includes('دفتر') || 
    combined.includes('پتہ') || 
    combined.includes('مرکز') || 
    combined.includes('road') || 
    combined.includes('street') || 
    combined.includes('city') || 
    combined.includes('bannu') || 
    combined.includes('بنوں') || 
    combined.includes('چوک') || 
    combined.includes('سٹی') || 
    combined.includes('ضلع')
  ) {
    return 'address';
  }

  // 5. Website / Link detection
  if (
    v.startsWith('http://') || 
    v.startsWith('https://') || 
    v.startsWith('www.') || 
    combined.includes('website') || 
    combined.includes('web') || 
    combined.includes('link') || 
    combined.includes('پورٹل') || 
    combined.includes('ویب')
  ) {
    return 'link';
  }

  // 6. Phone number detection (default for standard numerical strings)
  if (
    /^[+]?[\d\s\-().]{5,25}$/.test(v) || 
    combined.includes('phone') || 
    combined.includes('helpline') || 
    combined.includes('mobile') || 
    combined.includes('call') || 
    combined.includes('tel') || 
    combined.includes('فون') || 
    combined.includes('موبائل') || 
    combined.includes('ہیلپ لائن') || 
    combined.includes('رابطہ')
  ) {
    return 'phone';
  }

  // Fallback heuristic: long text with spaces is likely address, otherwise link
  if (v.split(' ').length >= 4) {
    return 'address';
  }

  return 'phone';
}

/**
 * Resolves the final contact type, either explicitly assigned or automatically detected.
 */
export function resolveContactType(contact: Partial<ContactDetail>): 'phone' | 'whatsapp' | 'email' | 'address' | 'hours' | 'link' {
  if (contact.type && contact.type !== 'auto') {
    return contact.type;
  }
  return detectContactType(contact.title || '', contact.value || '');
}

/**
 * Renders an automated styled icon based on the resolved type.
 */
export const ContactIconComponent: React.FC<{
  type?: string;
  className?: string;
}> = ({ type = 'phone', className = 'w-5 h-5' }) => {
  switch (type) {
    case 'whatsapp':
      return <MessageCircle className={className} />;
    case 'email':
      return <Mail className={className} />;
    case 'address':
      return <MapPin className={className} />;
    case 'hours':
      return <Clock className={className} />;
    case 'link':
      return <Globe className={className} />;
    case 'phone':
    default:
      return <Phone className={className} />;
  }
};

/**
 * Returns the proper interactive URL for one-click action.
 */
export function getContactActionHref(type: string, value: string): string | null {
  const trimmed = (value || '').trim();
  if (!trimmed) return null;

  switch (type) {
    case 'phone': {
      const clean = trimmed.replace(/[^\d+]/g, '');
      return clean ? `tel:${clean}` : null;
    }
    case 'whatsapp': {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
      }
      const clean = trimmed.replace(/[^\d]/g, '');
      return clean ? `https://wa.me/${clean}` : null;
    }
    case 'email': {
      return `mailto:${trimmed}`;
    }
    case 'address': {
      return `https://maps.google.com/?q=${encodeURIComponent(trimmed)}`;
    }
    case 'link': {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
      }
      return `https://${trimmed}`;
    }
    case 'hours':
    default:
      return null;
  }
}

/**
 * Contact Type options for administrator dropdown
 */
export const CONTACT_TYPE_OPTIONS = [
  { value: 'auto', labelEn: 'Auto-Detect (Automated Icon)', labelUr: 'خودکار شناخت (آٹومیٹک آئیکن)' },
  { value: 'phone', labelEn: 'Phone Call', labelUr: 'فون کال' },
  { value: 'whatsapp', labelEn: 'WhatsApp Chat', labelUr: 'واٹس ایپ رابطہ' },
  { value: 'email', labelEn: 'Email Address', labelUr: 'ای میل پتہ' },
  { value: 'address', labelEn: 'Physical Address', labelUr: 'دفتری پتہ' },
  { value: 'hours', labelEn: 'Office Hours', labelUr: 'دفتری اوقات' },
  { value: 'link', labelEn: 'Web Link / Portal', labelUr: 'ویب لنک / پورٹل' },
];

/**
 * UI Color configuration for contact cards
 */
export function getContactTypeTheme(type: string): {
  iconBg: string;
  iconColor: string;
  borderHover: string;
  badgeBg: string;
  badgeText: string;
  labelEn: string;
  labelUr: string;
} {
  switch (type) {
    case 'whatsapp':
      return {
        iconBg: 'bg-emerald-50 text-emerald-600',
        iconColor: 'text-emerald-600',
        borderHover: 'hover:border-emerald-500',
        badgeBg: 'bg-emerald-100 text-emerald-800',
        badgeText: 'text-emerald-700',
        labelEn: 'WhatsApp',
        labelUr: 'واٹس ایپ'
      };
    case 'email':
      return {
        iconBg: 'bg-sky-50 text-sky-600',
        iconColor: 'text-sky-600',
        borderHover: 'hover:border-sky-500',
        badgeBg: 'bg-sky-100 text-sky-800',
        badgeText: 'text-sky-700',
        labelEn: 'Email',
        labelUr: 'ای میل'
      };
    case 'address':
      return {
        iconBg: 'bg-amber-50 text-amber-600',
        iconColor: 'text-amber-600',
        borderHover: 'hover:border-amber-500',
        badgeBg: 'bg-amber-100 text-amber-800',
        badgeText: 'text-amber-700',
        labelEn: 'Office Address',
        labelUr: 'دفتری پتہ'
      };
    case 'hours':
      return {
        iconBg: 'bg-indigo-50 text-indigo-600',
        iconColor: 'text-indigo-600',
        borderHover: 'hover:border-indigo-500',
        badgeBg: 'bg-indigo-100 text-indigo-800',
        badgeText: 'text-indigo-700',
        labelEn: 'Office Hours',
        labelUr: 'دفتری اوقات'
      };
    case 'link':
      return {
        iconBg: 'bg-purple-50 text-purple-600',
        iconColor: 'text-purple-600',
        borderHover: 'hover:border-purple-500',
        badgeBg: 'bg-purple-100 text-purple-800',
        badgeText: 'text-purple-700',
        labelEn: 'Web Link',
        labelUr: 'ویب لنک'
      };
    case 'phone':
    default:
      return {
        iconBg: 'bg-[#AD7A28]/15 text-[#AD7A28]',
        iconColor: 'text-[#AD7A28]',
        borderHover: 'hover:border-[#AD7A28]',
        badgeBg: 'bg-[#AD7A28]/20 text-[#8A5F19]',
        badgeText: 'text-[#AD7A28]',
        labelEn: 'Helpline',
        labelUr: 'ہیلپ لائن'
      };
  }
}
