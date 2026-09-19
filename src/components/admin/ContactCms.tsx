import React, { useState, useEffect } from 'react';
import { SiteSettings, ContactDetail } from '../../types';
import { ImageUploadField } from './ImageUploadField';
import { BilingualField } from './BilingualField';
import { RepeatableListEditor } from './RepeatableListEditor';
import { SaveBar } from './SaveBar';
import { pushSettingsDocToCloud } from '../../services/firebase';
import { 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Globe, 
  Plus, 
  Trash2, 
  Map,
  Sparkles
} from 'lucide-react';

interface ContactCmsProps {
  settings: SiteSettings;
  onSaved: (patch: Partial<SiteSettings>) => void;
  isUrdu: boolean;
}

export const ContactCms: React.FC<ContactCmsProps> = ({
  settings,
  onSaved,
  isUrdu,
}) => {
  const [formData, setFormData] = useState({
    contactAddress: settings.contactAddress || '',
    contactAddressUr: settings.contactAddressUr || '',
    contactHours: settings.contactHours || '',
    contactPhone: settings.contactPhone || '',
    contactEmail: settings.contactEmail || '',
    contactOfficeImage: settings.contactOfficeImage || settings.officePhoto || '',
    officePhoto: settings.contactOfficeImage || settings.officePhoto || '',
    contactMapUrl: settings.contactMapUrl || settings.mapUrl || '',
    mapUrl: settings.contactMapUrl || settings.mapUrl || '',
    multipleContacts: settings.multipleContacts || [],
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      contactAddress: settings.contactAddress || '',
      contactAddressUr: settings.contactAddressUr || '',
      contactHours: settings.contactHours || '',
      contactPhone: settings.contactPhone || '',
      contactEmail: settings.contactEmail || '',
      contactOfficeImage: settings.contactOfficeImage || settings.officePhoto || '',
      officePhoto: settings.contactOfficeImage || settings.officePhoto || '',
      contactMapUrl: settings.contactMapUrl || settings.mapUrl || '',
      mapUrl: settings.contactMapUrl || settings.mapUrl || '',
      multipleContacts: settings.multipleContacts || [],
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
      const payload = {
        ...formData,
        officePhoto: formData.contactOfficeImage,
        mapUrl: formData.contactMapUrl,
      };
      await pushSettingsDocToCloud('contact', payload);
      onSaved(payload);
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

  const createNewChannel = (): ContactDetail => ({
    id: `contact_${Date.now()}`,
    title: isUrdu ? 'نیا رابطہ چینل' : 'New Contact Channel',
    titleUr: 'نیا رابطہ چینل',
    value: '+92 331 9051410',
    type: 'phone',
    note: 'Mon - Sat: 9:00 AM - 5:00 PM',
    noteUr: 'پیر تا ہفتہ: صبح 9 تا شام 5 بجے',
    isPrimary: false,
    sort_order: (formData.multipleContacts || []).length + 1,
  });

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-[#AD7A28]">
            <Building className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
              Firestore: siteConfig/contact
            </span>
            <h3 className="text-lg font-bold text-[#16232F] mt-0.5">
              {isUrdu ? 'رابطہ اور سیکرٹریٹ معلومات' : 'Contact & Secretariat'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'مرکزی سیکرٹریٹ پتہ، فون نمبر، اوقات کار، دفتری تصویر اور کسٹم رابطے'
                : 'Manage head office address, phone lines, email desks, working hours, and secretariat building photo.'}
            </p>
          </div>
        </div>
      </div>

      {/* Primary Secretariat Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
        <h4 className="text-xs font-bold text-[#16232F] uppercase tracking-wider pb-2 border-b border-slate-100">
          {isUrdu ? '1. مرکزی سیکرٹریٹ پتہ و رابطے' : '1. Core Secretariat Channels'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#AD7A28]" />
              <span>{isUrdu ? 'مرکزی ہیلپ لائن فون (contactPhone)' : 'Primary Phone / Helpline'}</span>
            </label>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => updateField('contactPhone', e.target.value)}
              placeholder="e.g. +92 331 9051410"
              className="app-input font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#AD7A28]" />
              <span>{isUrdu ? 'سرکاری ای میل (contactEmail)' : 'Official Email Desk'}</span>
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => updateField('contactEmail', e.target.value)}
              placeholder="e.g. secretariat@araainbannu.org"
              className="app-input"
            />
          </div>
        </div>

        <BilingualField
          label={isUrdu ? 'مرکزی دفتر کا پتہ (contactAddress)' : 'Secretariat Office Address'}
          valueEn={formData.contactAddress}
          valueUr={formData.contactAddressUr}
          onChange={(en, ur) => {
            setFormData(prev => ({
              ...prev,
              contactAddress: en,
              contactAddressUr: ur,
            }));
            setIsDirty(true);
          }}
          placeholder="e.g. Near Railway Station Road, Bannu City, Khyber Pakhtunkhwa"
          isUrdu={isUrdu}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#AD7A28]" />
              <span>{isUrdu ? 'دفتری اوقات کار (contactHours)' : 'Working Hours'}</span>
            </label>
            <input
              type="text"
              value={formData.contactHours}
              onChange={(e) => updateField('contactHours', e.target.value)}
              placeholder="e.g. Mon - Sat: 9:00 AM - 5:00 PM"
              className="app-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5 text-[#AD7A28]" />
              <span>{isUrdu ? 'گوگل میپ لنک (contactMapUrl)' : 'Google Maps Embed/Direct URL'}</span>
            </label>
            <input
              type="url"
              value={formData.contactMapUrl}
              onChange={(e) => {
                updateField('contactMapUrl', e.target.value);
                updateField('mapUrl', e.target.value);
              }}
              placeholder="https://maps.google.com/..."
              className="app-input text-xs"
            />
          </div>
        </div>

        {/* Office Photo */}
        <ImageUploadField
          label={isUrdu ? 'سیکرٹریٹ بلڈنگ یا دفتر کی تصویر (contactOfficeImage)' : 'Secretariat Office Building Photo'}
          value={formData.contactOfficeImage}
          onChange={(val) => {
            updateField('contactOfficeImage', val);
            updateField('officePhoto', val);
          }}
          aspectRatio="banner"
          maxWidth={1200}
          quality={0.85}
          isUrdu={isUrdu}
        />
      </div>

      {/* Multiple Contact Channels CRUD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <h4 className="text-xs font-bold text-[#16232F] uppercase tracking-wider">
          {isUrdu ? '2. اضافی رابطہ چینلز اور ڈیسک (ContactDetail[] CRUD)' : '2. Specialized Desks & Channels (ContactDetail[] CRUD)'}
        </h4>

        <RepeatableListEditor<ContactDetail>
          items={formData.multipleContacts || []}
          onChange={(newContacts) => {
            setFormData(prev => ({ ...prev, multipleContacts: newContacts }));
            setIsDirty(true);
          }}
          createNewItem={createNewChannel}
          addButtonLabel={isUrdu ? 'نیا رابطہ چینل شامل کریں' : 'Add Contact Channel'}
          emptyMessage={isUrdu ? 'کوئی اضافی رابطہ چینل موجود نہیں۔' : 'No specialized contact channels added yet.'}
          itemTitle={(c) => c.title || c.titleUr || c.value || 'Contact Desk'}
          itemBadge={(c) => (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
              {c.type || 'phone'}
            </span>
          )}
          isUrdu={isUrdu}
          renderItem={(channel, index, updateChannel) => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <BilingualField
                    label={isUrdu ? 'چینل کا نام / ڈیسک (Desk Title)' : 'Desk Title'}
                    valueEn={channel.title}
                    valueUr={channel.titleUr}
                    onChange={(en, ur) => updateChannel({ title: en, titleUr: ur })}
                    isUrdu={isUrdu}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isUrdu ? 'چینل کی قسم (Type)' : 'Channel Type'}
                  </label>
                  <select
                    value={channel.type || 'phone'}
                    onChange={(e) => updateChannel({ type: e.target.value as any })}
                    className="app-input"
                  >
                    <option value="phone">Phone Helpline</option>
                    <option value="whatsapp">WhatsApp Desk</option>
                    <option value="email">Email Desk</option>
                    <option value="address">Address / Center</option>
                    <option value="hours">Hours / Schedule</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isUrdu ? 'رابطہ نمبر، پتہ یا ای میل (Value)' : 'Contact Value (Number, Email, URL)'}
                </label>
                <input
                  type="text"
                  value={channel.value || ''}
                  onChange={(e) => updateChannel({ value: e.target.value })}
                  placeholder="e.g. +92 331 9051410 or desk@araainbannu.org"
                  className="app-input font-mono text-xs"
                />
              </div>

              <BilingualField
                label={isUrdu ? 'اضافی نوٹ / اوقات (Note)' : 'Additional Note / Timings'}
                valueEn={channel.note}
                valueUr={channel.noteUr}
                onChange={(en, ur) => updateChannel({ note: en, noteUr: ur })}
                placeholder="e.g. Available 9am to 5pm / صبح 9 تا شام 5 بجے"
                isUrdu={isUrdu}
              />
            </div>
          )}
        />
      </div>

      <SaveBar
        onSave={handleSave}
        isDirty={isDirty}
        isSaving={isSaving}
        lastSaved={lastSaved}
        statusMessage={statusMsg}
        isUrdu={isUrdu}
        onReset={() => {
          setFormData({
            contactAddress: settings.contactAddress || '',
            contactAddressUr: settings.contactAddressUr || '',
            contactHours: settings.contactHours || '',
            contactPhone: settings.contactPhone || '',
            contactEmail: settings.contactEmail || '',
            contactOfficeImage: settings.contactOfficeImage || settings.officePhoto || '',
            officePhoto: settings.contactOfficeImage || settings.officePhoto || '',
            contactMapUrl: settings.contactMapUrl || settings.mapUrl || '',
            mapUrl: settings.contactMapUrl || settings.mapUrl || '',
            multipleContacts: settings.multipleContacts || [],
          });
          setIsDirty(false);
        }}
      />
    </div>
  );
};
