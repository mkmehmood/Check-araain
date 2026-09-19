import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { checkRateLimit, sanitizeText, sanitizeEmail } from '../utils/security';
import { 
  resolveContactType, 
  ContactIconComponent, 
  getContactActionHref, 
  getContactTypeTheme 
} from '../utils/contactIcons';

export const ContactSection: React.FC = () => {
  const { t, isUrdu, tSetting, getContacts } = useLanguage();
  const { settings, sendContactMessage } = useData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Anti-Bot Honeypot Defense
    if (honeypot.trim()) {
      setIsSent(true);
      return;
    }

    // 2. Submission Rate Limiter (max 3 inquiries per 2 minutes)
    const rateCheck = checkRateLimit('contact_submit', 3, 120000);
    if (!rateCheck.allowed) {
      setError(
        isUrdu 
          ? `بہت زیادہ پیغامات موصول ہو رہے ہیں۔ براہ کرم ${rateCheck.retryAfterSec} سیکنڈ بعد کوشش کریں۔`
          : `Too many inquiries sent. Please wait ${rateCheck.retryAfterSec} seconds before sending another.`
      );
      return;
    }

    const cleanName = sanitizeText(name, 100);
    const cleanEmail = sanitizeEmail(email);
    const cleanSubject = sanitizeText(subject, 150);
    const cleanMessage = sanitizeText(message, 1500);

    if (!cleanName || !cleanEmail || !cleanMessage) {
      setError(isUrdu ? 'براہ کرم تمام مطلوبہ خانے درست طریقے سے پُر کریں۔' : 'Please fill out all required fields properly.');
      return;
    }

    try {
      setIsSending(true);
      await sendContactMessage({
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject || (isUrdu ? 'عمومی رابطہ' : 'General Inquiry'),
        message: cleanMessage,
      });
      setIsSent(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => setIsSent(false), 5000);
    } catch (err) {
      console.error(err);
      setError(isUrdu ? 'پیغام بھیجنے میں خرابی پیش آئی۔' : 'Failed to send message. Please retry.');
    } finally {
      setIsSending(false);
    }
  };

  const contactsList = settings.multipleContacts && settings.multipleContacts.length > 0
    ? getContacts(settings.multipleContacts)
    : null;

  return (
    <section id="contact" className="py-20 sm:py-24 bg-[#F8F4E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] text-xs font-bold uppercase tracking-wider mb-3 ${
            isUrdu ? 'font-naskh' : 'font-sans'
          }`}>
            {t('navContact', 'Contact Us')}
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold text-[#16232F] ltr:tracking-tight rtl:tracking-normal ltr:leading-tight rtl:leading-[1.45] ${
            isUrdu ? 'font-nastaliq' : 'font-display tracking-wider'
          }`}>
            {tSetting('contactHeading', settings) || t('contactHeading', 'Get In Touch')}
          </h2>
          <p className={`mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium ltr:leading-relaxed rtl:leading-[1.85] rtl:tracking-normal ${
            isUrdu ? 'font-nastaliq' : 'font-editorial italic'
          }`}>
            {tSetting('contactSubheading', settings) || t('contactSubheading', 'Have questions about our initiatives or wish to visit our regional center? We welcome your message.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start max-w-5xl mx-auto">
          
          {/* Information Column */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Secretariat Office Building / Landmark Photo if saved in Firestore */}
            {Boolean(settings.officePhoto) && (
              <div className="rounded-2xl overflow-hidden border border-[#16232F]/10 bg-slate-900 shadow-sm">
                <div className="relative h-48 sm:h-56 w-full">
                  <img
                    src={settings.officePhoto}
                    alt={isUrdu ? 'مرکزی سیکرٹریٹ دفتر بنوں' : 'Central Secretariat Bannu'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                    <span className="text-white text-xs font-bold px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs">
                      {isUrdu ? 'مرکزی سیکرٹریٹ دفتر بنوں' : 'Central Secretariat & Regional Council'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {contactsList ? (
              // Multiple dynamic contacts with automated icons
              contactsList.map((contact, idx) => {
                const resolvedType = resolveContactType(contact);
                const theme = getContactTypeTheme(resolvedType);
                const actionHref = getContactActionHref(resolvedType, contact.value);
                const displayTitle = contact.title;
                const displayNote = contact.note;

                return (
                  <div 
                    key={contact.id || idx}
                    className={`p-5 rounded-2xl bg-white border border-[#16232F]/10 shadow-sm transition-all duration-200 hover:shadow-md ${
                      contact.isPrimary ? 'ring-1 ring-[#AD7A28]/30 border-[#AD7A28]/40' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                        <ContactIconComponent type={resolvedType} className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-sm font-bold text-[#16232F] truncate">
                            {displayTitle}
                          </h4>
                          {Boolean(contact.isPrimary) && (
                            <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] text-[10px] font-bold">
                              {isUrdu ? 'مرکزی رابطہ' : 'Primary'}
                            </span>
                          )}
                        </div>

                        {actionHref ? (
                          <a
                            href={actionHref}
                            target={resolvedType === 'link' || resolvedType === 'address' ? '_blank' : undefined}
                            rel={resolvedType === 'link' || resolvedType === 'address' ? 'noopener noreferrer' : undefined}
                            className="text-xs sm:text-sm font-semibold text-[#AD7A28] hover:underline inline-flex items-center gap-1 break-words"
                          >
                            <span>{contact.value}</span>
                            {(resolvedType === 'link' || resolvedType === 'address') && (
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            )}
                          </a>
                        ) : (
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words">
                            {contact.value}
                          </p>
                        )}

                        {displayNote && (
                          <p className="text-[11px] text-slate-400 mt-1">
                            {displayNote}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback standard contact cards
              <>
                <div className="p-6 rounded-2xl bg-white border border-[#16232F]/10 shadow-sm flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#AD7A28]/15 text-[#AD7A28] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#16232F] mb-1">
                      {t('contactAddressTitle', 'Our Office')}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {tSetting('contactAddress', settings)}
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-[#16232F]/10 shadow-sm flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#AD7A28]/15 text-[#AD7A28] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#16232F] mb-1">
                      {t('contactHoursTitle', 'Office Hours')}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {tSetting('contactHours', settings)}
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-[#16232F]/10 shadow-sm flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#AD7A28]/15 text-[#AD7A28] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#16232F] mb-1">
                      {t('contactPhoneTitle', 'Helpline & WhatsApp')}
                    </h4>
                    <a 
                      href={`tel:${settings.contactPhone}`}
                      className="text-xs sm:text-sm text-[#AD7A28] font-semibold hover:underline block"
                    >
                      {tSetting('contactPhone', settings)}
                    </a>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-[#16232F]/10 shadow-sm flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#AD7A28]/15 text-[#AD7A28] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#16232F] mb-1">
                      {t('contactEmailTitle', 'Official Email')}
                    </h4>
                    <a 
                      href={`mailto:${settings.contactEmail}`}
                      className="text-xs sm:text-sm text-[#AD7A28] font-semibold hover:underline block"
                    >
                      {tSetting('contactEmail', settings)}
                    </a>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Interactive Form */}
          <div className="lg:col-span-7 bg-white p-7 sm:p-9 rounded-3xl border border-[#16232F]/10 shadow-sm">
            <h3 className={`text-xl font-bold text-[#16232F] mb-1 ${
              isUrdu ? 'font-nastaliq' : 'font-display tracking-wide'
            }`}>
              {t('contactFormTitle', 'Send Direct Inquiry')}
            </h3>
            <p className={`text-xs sm:text-sm text-slate-500 mb-6 ${
              isUrdu ? 'font-naskh' : 'font-sans'
            }`}>
              {t('contactFormDesc', 'Our communications team responds promptly to all community members.')}
            </p>

            {isSent && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{t('msgSentSuccess')}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Anti-Bot Honeypot */}
              <input
                type="text"
                name="user_msg_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
                style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
              />
              {/* Row 1: Name & Email - 2 fields per row */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('formName', 'Your Full Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('contactPhFullName', 'e.g. Asad Chaudhary')}
                    className="app-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('formEmail', 'Email Address')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('phEmail', 'you@domain.com')}
                    className="app-input w-full"
                  />
                </div>
              </div>

              {/* Row 2: Subject & Department - 2 fields per row */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('formSubject', 'Subject')}
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t('phSubject', 'e.g. Scholarships / Inquiry')}
                    className="app-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isUrdu ? 'شعبہ / نوعیت' : 'Inquiry Department'}
                  </label>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        setSubject(prev => prev ? `${prev} [${val}]` : val);
                      }
                    }}
                    className="app-input w-full bg-white text-xs sm:text-sm"
                  >
                    <option value="">{isUrdu ? 'عمومی رابطہ' : 'General Inquiry'}</option>
                    <option value={isUrdu ? 'رکنیت و کارڈ' : 'Membership & Cards'}>{isUrdu ? 'رکنیت و کارڈ' : 'Membership & Cards'}</option>
                    <option value={isUrdu ? 'تعلیمی وظائف' : 'Scholarships & Education'}>{isUrdu ? 'تعلیمی وظائف' : 'Scholarships & Education'}</option>
                    <option value={isUrdu ? 'فلاحی امداد' : 'Welfare & Relief'}>{isUrdu ? 'فلاحی امداد' : 'Welfare & Relief'}</option>
                    <option value={isUrdu ? 'دیگر' : 'Other'}>{isUrdu ? 'دیگر' : 'Other'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('formMessage', 'Your Message')} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('phMessage', 'Please write your detailed message...')}
                  className="app-input w-full min-h-[100px] py-2.5"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="app-btn-primary app-btn-lg"
              >
                <Send className="w-4 h-4 rtl:rotate-180" />
                <span>{isSending ? t('sendingBtn', 'Sending...') : t('btnSendMessage', 'Send Message')}</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
};
