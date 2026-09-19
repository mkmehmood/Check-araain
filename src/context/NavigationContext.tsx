import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PageItem, Leader, Program, Registration } from '../types';
import { sanitizeCardId } from '../utils/security';

export type ScreenId =
  | 'home'
  | 'membership'
  | 'donation'
  | 'verification'
  | 'page'
  | 'admin-login'
  | 'leader'
  | 'program'
  | 'gallery'
  | 'card-studio'
  | 'menu';

export interface ScreenParams {
  verifyCardId?: string;
  selectedPage?: PageItem | null;
  selectedLeader?: Leader | null;
  selectedProgram?: Program | null;
  galleryIndex?: number;
  registrationForCard?: Registration | null;
}

interface NavigationContextType {
  activeScreen: ScreenId;
  screenParams: ScreenParams;
  navigateTo: (screen: ScreenId, params?: ScreenParams) => void;
  navigateBack: () => void;
  closeToHome: () => void;
  isFullScreenOpen: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('home');
  const [screenParams, setScreenParams] = useState<ScreenParams>({});

  // Helper to construct hash from screen and parameters
  const getHashForScreen = useCallback((screen: ScreenId, params?: ScreenParams): string => {
    switch (screen) {
      case 'membership':
        return '#membership';
      case 'donation':
        return '#donate';
      case 'verification':
        return params?.verifyCardId ? `#verify=${encodeURIComponent(params.verifyCardId)}` : '#verify';
      case 'page':
        return params?.selectedPage?.slug ? `#page=${encodeURIComponent(params.selectedPage.slug)}` : '#page';
      case 'admin-login':
        return '#login';
      case 'leader':
        return params?.selectedLeader?.id ? `#leader=${encodeURIComponent(String(params.selectedLeader.id))}` : '#leader';
      case 'program':
        return params?.selectedProgram?.id ? `#program=${encodeURIComponent(String(params.selectedProgram.id))}` : '#program';
      case 'gallery':
        return typeof params?.galleryIndex === 'number' ? `#gallery=${params.galleryIndex}` : '#gallery';
      case 'card-studio':
        return '#card';
      case 'menu':
        return '#menu';
      case 'home':
      default:
        return '';
    }
  }, []);

  // Programmatic navigation to a screen
  const navigateTo = useCallback((screen: ScreenId, params?: ScreenParams) => {
    if (screen === 'home') {
      setActiveScreen('home');
      setScreenParams({});
      if (window.location.hash) {
        window.history.pushState({ screen: 'home' }, '', window.location.pathname + window.location.search);
      }
      return;
    }

    const hash = getHashForScreen(screen, params);
    const stateObj = { screen, params: params || {} };

    // Push new history state so device back navigation works
    window.history.pushState(stateObj, '', hash);
    setActiveScreen(screen);
    setScreenParams(params || {});

    // Scroll to top of window for fresh screen transition
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [getHashForScreen]);

  // Navigate backwards using browser history (supports device back button, back gestures, keyboard Alt+Left, Esc)
  const navigateBack = useCallback(() => {
    if (activeScreen === 'home') return;

    if (window.history.length > 1) {
      window.history.back();
    } else {
      setActiveScreen('home');
      setScreenParams({});
      window.history.replaceState({ screen: 'home' }, '', window.location.pathname + window.location.search);
    }
  }, [activeScreen]);

  // Instant reset to home
  const closeToHome = useCallback(() => {
    setActiveScreen('home');
    setScreenParams({});
    if (window.location.hash) {
      window.history.pushState({ screen: 'home' }, '', window.location.pathname + window.location.search);
    }
  }, []);

  // Sync navigation with browser history (popstate event triggered by Device Back button on Android/iOS, desktop browser back, mouse back button, Alt+Left)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      const hash = window.location.hash;

      if (state && state.screen) {
        setActiveScreen(state.screen);
        setScreenParams(state.params || {});
      } else if (hash) {
        // Derive screen from URL hash if state is not present
        if (hash === '#membership') {
          setActiveScreen('membership');
        } else if (hash === '#donate' || hash === '#donation') {
          setActiveScreen('donation');
        } else if (hash.startsWith('#verify')) {
          const cardId = hash.includes('=') ? hash.split('=')[1] : '';
          setActiveScreen('verification');
          if (cardId) setScreenParams({ verifyCardId: sanitizeCardId(cardId) });
        } else if (hash === '#login' || hash === '#admin') {
          setActiveScreen('admin-login');
        } else if (hash === '#menu') {
          setActiveScreen('menu');
        } else if (hash === '#card') {
          setActiveScreen('card-studio');
        } else {
          setActiveScreen('home');
          setScreenParams({});
        }
      } else {
        // No hash or state -> back on home
        setActiveScreen('home');
        setScreenParams({});
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard navigation listener (Escape key triggers back movement on all devices)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeScreen !== 'home') {
        e.preventDefault();
        navigateBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScreen, navigateBack]);

  // Initial URL parsing on first paint (deep links, QR code scan parameters, bookmarks)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    const verifyParam = params.get('verify') || params.get('card');
    if (verifyParam) {
      const cleanCard = sanitizeCardId(verifyParam);
      if (cleanCard) {
        navigateTo('verification', { verifyCardId: cleanCard });
        return;
      }
    }

    if (hash === '#membership') {
      setActiveScreen('membership');
    } else if (hash === '#donate' || hash === '#donation') {
      setActiveScreen('donation');
    } else if (hash.startsWith('#verify')) {
      const cardId = hash.includes('=') ? hash.split('=')[1] : '';
      setActiveScreen('verification');
      if (cardId) setScreenParams({ verifyCardId: sanitizeCardId(cardId) });
    } else if (hash === '#login' || hash === '#admin') {
      setActiveScreen('admin-login');
    } else if (hash === '#menu') {
      setActiveScreen('menu');
    }
  }, [navigateTo]);

  return (
    <NavigationContext.Provider
      value={{
        activeScreen,
        screenParams,
        navigateTo,
        navigateBack,
        closeToHome,
        isFullScreenOpen: activeScreen !== 'home',
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
