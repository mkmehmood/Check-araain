import React, { useState, useEffect, lazy, Suspense } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider, useData } from './context/DataContext';
import { PageItem } from './types';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signOutAdmin } from './services/firebase';
import { isAuthorizedAdminEmail, sanitizeCardId } from './utils/security';

// Public Components (eagerly bundled for fast first-paint)
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ProgramsSection } from './components/ProgramsSection';
import { LeadershipSection } from './components/LeadershipSection';
import { EventsSection } from './components/EventsSection';
import { GallerySection } from './components/GallerySection';
import { CtaSection } from './components/CtaSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

// Public Modals
import { MembershipModal } from './components/MembershipModal';
import { DonationModal } from './components/DonationModal';
import { PageModal } from './components/PageModal';
import { CardVerificationModal } from './components/CardVerificationModal';

/**
 * TASK 2: CODE SEPARATION VIA DYNAMIC IMPORTS
 * 
 * AdminLoginModal and AdminDashboard are loaded on-demand via React.lazy().
 * They are NEVER bundled into the main JavaScript payload that ordinary
 * visitors download. Furthermore, they are rendered conditionally so the
 * network request for the admin chunk is never dispatched on normal visits.
 * 
 * SECURITY ARCHITECTURE NOTE:
 * Code separation and hidden UI entry points provide obscurity and optimize
 * bundle size, but they DO NOT constitute the security boundary.
 * The absolute security boundary is enforced server-side by Firebase Auth
 * and Firestore Security Rules (firestore.rules) gating all sensitive
 * documents behind request.auth.token.email.
 */
const AdminLoginModal = lazy(() =>
  import('./components/admin/AdminLoginModal').then((module) => ({
    default: module.AdminLoginModal,
  }))
);

const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((module) => ({
    default: module.AdminDashboard,
  }))
);

const MainApp: React.FC = () => {
  const { pages } = useData();

  // Modal & Sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<PageItem | null>(null);

  // Card Verification state (for QR scanning and public authenticity checks)
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [verifyCardId, setVerifyCardId] = useState('');

  // Admin authentication state (strictly bound to Firebase Auth)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [isInAdminMode, setIsInAdminMode] = useState(false);

  // Synchronized Back Navigation Handlers
  const handleOpenMembership = () => {
    setIsMembershipOpen(true);
    window.history.pushState({ screen: 'membership' }, '', '#membership');
  };
  const handleCloseMembership = () => {
    setIsMembershipOpen(false);
    if (window.location.hash.includes('#membership')) {
      window.history.back();
    }
  };

  const handleOpenDonation = () => {
    setIsDonationOpen(true);
    window.history.pushState({ screen: 'donation' }, '', '#donate');
  };
  const handleCloseDonation = () => {
    setIsDonationOpen(false);
    if (window.location.hash.includes('#donate') || window.location.hash.includes('#donation')) {
      window.history.back();
    }
  };

  const handleOpenVerification = (cardId = '') => {
    const cleanId = sanitizeCardId(cardId);
    setVerifyCardId(cleanId);
    setIsVerificationOpen(true);
    const hash = cleanId ? `#verify=${cleanId}` : '#verify';
    window.history.pushState({ screen: 'verification', cardId: cleanId }, '', hash);
  };
  const handleCloseVerification = () => {
    setIsVerificationOpen(false);
    setVerifyCardId('');
    if (window.location.hash.startsWith('#verify')) {
      window.history.back();
    }
  };

  const handleOpenPage = (page: PageItem) => {
    setSelectedPage(page);
    window.history.pushState({ screen: 'page', slug: page.slug }, '', `#page=${page.slug}`);
  };
  const handleClosePage = () => {
    setSelectedPage(null);
    if (window.location.hash.startsWith('#page')) {
      window.history.back();
    }
  };

  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
    window.history.pushState({ screen: 'menu' }, '', '#menu');
  };
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    if (window.location.hash.includes('#menu')) {
      window.history.back();
    }
  };

  const handleOpenAdminLogin = () => {
    setIsAdminLoginOpen(true);
    window.history.pushState({ screen: 'login' }, '', '#login');
  };
  const handleCloseAdminLogin = () => {
    setIsAdminLoginOpen(false);
    if (window.location.hash.includes('#login') || window.location.hash.includes('#admin') || window.location.hash.includes('#portal')) {
      window.history.back();
    }
  };

  const isAdminHash = (rawHash: string): boolean => {
    if (!rawHash) return false;
    const decoded = decodeURIComponent(rawHash).toLowerCase().trim();
    return (
      decoded.startsWith('#admin') ||
      decoded.startsWith('#website') ||
      decoded.startsWith('#information & policies') ||
      decoded.startsWith('#information and policies') ||
      decoded.startsWith('#documentation') ||
      decoded.startsWith('#registration') ||
      decoded.startsWith('#donation') ||
      decoded.startsWith('#message') ||
      decoded.startsWith('#inquir') ||
      decoded === '#portal'
    );
  };

  const handleOpenAdminMode = () => {
    setIsInAdminMode(true);
    if (!isAdminHash(window.location.hash)) {
      window.history.pushState({ screen: 'admin' }, '', '#admin');
    }
  };
  const handleExitAdminMode = () => {
    setIsInAdminMode(false);
    window.history.pushState({ screen: 'home' }, '', window.location.pathname);
  };

  /**
   * SECURITY ENFORCEMENT:
   * Real-time Firebase Auth session synchronization.
   * Prevents client-side spoofing (e.g. localStorage tampering) by verifying
   * actual cryptographic credentials against the authorized admin whitelist.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && isAuthorizedAdminEmail(user.email)) {
        setIsAdminLoggedIn(true);
        setAdminEmail(user.email || '');
      } else {
        setIsAdminLoggedIn(false);
        setAdminEmail('');
        setIsInAdminMode(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Public QR Code and URL verification listener
   * Supports ?verify=CARD_ID, ?card=CARD_ID, and #verify=CARD_ID
   */
  useEffect(() => {
    const checkVerificationParam = () => {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      
      const verifyParam = params.get('verify') || params.get('card');
      let cardIdFromHash = '';
      if (hash.startsWith('#verify=')) {
        cardIdFromHash = hash.replace('#verify=', '');
      }

      const targetCard = verifyParam || cardIdFromHash;
      if (targetCard) {
        const cleanCard = sanitizeCardId(targetCard);
        if (cleanCard) {
          setVerifyCardId(cleanCard);
          setIsVerificationOpen(true);

          // Clean URL parameter without page reload
          const currentPath = window.location.pathname;
          const currentSearch = window.location.search
            .replace(/[?&]verify(=[^&]*)?/i, '')
            .replace(/[?&]card(=[^&]*)?/i, '')
            .replace(/^[?&]/, '');
          const cleanUrl = currentPath + (currentSearch ? `?${currentSearch}` : '');
          window.history.replaceState(null, '', cleanUrl || '/');
        }
      }
    };

    checkVerificationParam();
    window.addEventListener('hashchange', checkVerificationParam);
    return () => window.removeEventListener('hashchange', checkVerificationParam);
  }, []);

  const openAdminPortal = () => {
    if (isAdminLoggedIn) {
      handleOpenAdminMode();
    } else {
      handleOpenAdminLogin();
    }
  };

  // Global history listener for browser back/forward and device navigation gestures
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const hash = window.location.hash;
      const state = e.state;

      if (state?.screen === 'membership' || hash === '#membership') {
        setIsMembershipOpen(true);
        setIsDonationOpen(false);
        setIsVerificationOpen(false);
        setSelectedPage(null);
        setIsSidebarOpen(false);
        setIsAdminLoginOpen(false);
      } else if (state?.screen === 'donation' || hash === '#donate' || hash === '#donation') {
        setIsDonationOpen(true);
        setIsMembershipOpen(false);
        setIsVerificationOpen(false);
        setSelectedPage(null);
        setIsSidebarOpen(false);
        setIsAdminLoginOpen(false);
      } else if (state?.screen === 'verification' || hash.startsWith('#verify')) {
        const id = state?.cardId || (hash.includes('=') ? hash.split('=')[1] : '');
        if (id) setVerifyCardId(sanitizeCardId(id));
        setIsVerificationOpen(true);
        setIsMembershipOpen(false);
        setIsDonationOpen(false);
        setSelectedPage(null);
        setIsSidebarOpen(false);
        setIsAdminLoginOpen(false);
      } else if (state?.screen === 'page' || hash.startsWith('#page=')) {
        const slug = state?.slug || hash.replace('#page=', '');
        const target = pages.find((p) => p.slug === slug);
        if (target) {
          setSelectedPage(target);
          setIsMembershipOpen(false);
          setIsDonationOpen(false);
          setIsVerificationOpen(false);
          setIsSidebarOpen(false);
          setIsAdminLoginOpen(false);
        }
      } else if (state?.screen === 'menu' || hash === '#menu') {
        setIsSidebarOpen(true);
        setIsMembershipOpen(false);
        setIsDonationOpen(false);
        setIsVerificationOpen(false);
        setSelectedPage(null);
        setIsAdminLoginOpen(false);
      } else if (state?.screen === 'login' || hash === '#login') {
        setIsAdminLoginOpen(true);
        setIsMembershipOpen(false);
        setIsDonationOpen(false);
        setIsVerificationOpen(false);
        setSelectedPage(null);
        setIsSidebarOpen(false);
      } else if (state?.screen === 'admin' || isAdminHash(hash)) {
        if (isAdminLoggedIn) {
          setIsInAdminMode(true);
        } else {
          setIsAdminLoginOpen(true);
        }
      } else {
        // Return to home screen
        setIsMembershipOpen(false);
        setIsDonationOpen(false);
        setIsVerificationOpen(false);
        setSelectedPage(null);
        setIsSidebarOpen(false);
        setIsAdminLoginOpen(false);
        setIsInAdminMode(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdminLoggedIn, pages]);

  // Initial deep link verification & route hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#membership') {
      setIsMembershipOpen(true);
    } else if (hash === '#donate' || hash === '#donation') {
      setIsDonationOpen(true);
    } else if (hash.startsWith('#page=')) {
      const slug = hash.replace('#page=', '');
      const target = pages.find((p) => p.slug === slug);
      if (target) setSelectedPage(target);
    }
  }, [pages]);

  // Escape key support across public screens
  useEffect(() => {
    const handleEscapeNav = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMembershipOpen) {
          handleCloseMembership();
        } else if (isDonationOpen) {
          handleCloseDonation();
        } else if (isVerificationOpen) {
          handleCloseVerification();
        } else if (selectedPage) {
          handleClosePage();
        } else if (isSidebarOpen) {
          handleCloseSidebar();
        } else if (isAdminLoginOpen) {
          handleCloseAdminLogin();
        } else if (isInAdminMode) {
          handleExitAdminMode();
        }
      }
    };

    window.addEventListener('keydown', handleEscapeNav);
    return () => window.removeEventListener('keydown', handleEscapeNav);
  }, [
    isMembershipOpen,
    isDonationOpen,
    isVerificationOpen,
    selectedPage,
    isSidebarOpen,
    isAdminLoginOpen,
    isInAdminMode
  ]);

  /**
   * TASK 3 — HIDDEN ADMIN ENTRY POINT MECHANISM 1:
   * Hidden URL trigger via URL Hash (#admin, #portal) or Query Parameter (?admin=1, ?portal=admin).
   */
  useEffect(() => {
    const checkUrlSecret = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);

      const hasQueryParam = params.has('admin') || params.get('portal') === 'admin';
      const isHashMatch = isAdminHash(hash);

      if (hasQueryParam) {
        // Scrub the secret query parameter from address bar without reloading
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search
          .replace(/[?&]admin(=[^&]*)?/i, '')
          .replace(/[?&]portal=admin/i, '')
          .replace(/^[?&]/, '');
        const cleanUrl = currentPath + (currentSearch ? `?${currentSearch}` : '');
        window.history.replaceState(null, '', cleanUrl || '/');

        openAdminPortal();
      } else if (isHashMatch) {
        openAdminPortal();
      }
    };

    checkUrlSecret();
    window.addEventListener('hashchange', checkUrlSecret);
    return () => window.removeEventListener('hashchange', checkUrlSecret);
  }, [isAdminLoggedIn]);

  /**
   * TASK 3 — HIDDEN ADMIN ENTRY POINT MECHANISM 2:
   * Secret Keyboard Shortcut for Desktop/Laptop users: Ctrl + Shift + A (or Cmd + Shift + A).
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        openAdminPortal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminLoggedIn]);

  const handleLoginSuccess = (email: string) => {
    setIsAdminLoggedIn(true);
    setAdminEmail(email);
    handleOpenAdminMode();
  };

  const handleLogout = async () => {
    setIsAdminLoggedIn(false);
    setIsInAdminMode(false);
    setAdminEmail('');
    if (window.location.hash.includes('#admin') || window.location.hash.includes('#portal')) {
      window.history.replaceState(null, '', '/');
    }
    await signOutAdmin();
  };

  const scrollToSection = (id: string) => {
    if (isInAdminMode) {
      handleExitAdminMode();
    }
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Only render and load AdminDashboard if authenticated admin is in admin mode
  if (isInAdminMode && isAdminLoggedIn) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#121D27] flex items-center justify-center text-amber-200">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading Administrator Workspace...</span>
            </div>
          </div>
        }
      >
        <AdminDashboard
          adminEmail={adminEmail}
          onExitAdmin={handleExitAdminMode}
          onLogout={handleLogout}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F4] text-[#16232F] selection:bg-[#AD7A28] selection:text-white">
      {/* Top Navbar (Brand logo has 5-tap hidden entry for phone & desktop) */}
      <Navbar
        onOpenMembership={handleOpenMembership}
        onOpenDonation={handleOpenDonation}
        onNavigateSection={scrollToSection}
        onOpenSidebar={handleOpenSidebar}
        onOpenAdmin={openAdminPortal}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero
          onOpenMembership={handleOpenMembership}
          onOpenDonation={handleOpenDonation}
          onNavigateSection={scrollToSection}
        />
        <AboutSection />
        <ProgramsSection />
        <LeadershipSection />
        <EventsSection />
        <GallerySection />
        <CtaSection
          onOpenMembership={handleOpenMembership}
          onOpenDonation={handleOpenDonation}
        />
        <ContactSection />
      </main>

      {/* Footer (Copyright notice has 3-tap stealth backup entry; zero visible admin UI) */}
      <Footer
        onOpenPage={handleOpenPage}
        onNavigateSection={scrollToSection}
        onOpenMembership={handleOpenMembership}
        onOpenDonation={handleOpenDonation}
        onOpenAdmin={openAdminPortal}
        onOpenVerification={() => handleOpenVerification('')}
      />

      {/* Sidebar Drawer (Clean navigation & language switcher; zero admin or cloud status) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        onOpenMembership={handleOpenMembership}
        onOpenDonation={handleOpenDonation}
        onNavigateSection={scrollToSection}
        onOpenVerification={() => handleOpenVerification('')}
      />

      {/* Public Modals */}
      <MembershipModal
        isOpen={isMembershipOpen}
        onClose={handleCloseMembership}
      />

      <DonationModal
        isOpen={isDonationOpen}
        onClose={handleCloseDonation}
      />

      <PageModal
        page={selectedPage}
        onClose={handleClosePage}
      />

      <CardVerificationModal
        isOpen={isVerificationOpen}
        onClose={handleCloseVerification}
        initialCardId={verifyCardId}
      />

      {/* 
        TASK 2: CONDITIONAL LAZY ADMIN LOGIN MODAL
        Only mounted when isAdminLoginOpen is true.
        The bundle chunk is never requested over the network until this state becomes true.
      */}
      {isAdminLoginOpen && (
        <Suspense fallback={null}>
          <AdminLoginModal
            isOpen={isAdminLoginOpen}
            onClose={handleCloseAdminLogin}
            onLoginSuccess={handleLoginSuccess}
          />
        </Suspense>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </LanguageProvider>
  );
};

export default App;
