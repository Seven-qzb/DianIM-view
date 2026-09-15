import { useState, useEffect, useCallback } from 'react';
import { MainNavTab } from '../types/chat';
import { RouteState } from './types';

function parseHash(hash: string): RouteState {
  const cleanHash = hash.replace(/^#\/?/, '').trim();
  if (!cleanHash) {
    return { tab: 'messages' };
  }

  const parts = cleanHash.split('/').filter(Boolean);
  const tabCandidate = parts[0] as MainNavTab;
  const validTabs: MainNavTab[] = ['messages', 'services', 'settings'];

  const tab: MainNavTab = validTabs.includes(tabCandidate) ? tabCandidate : 'messages';

  if (tab === 'messages') {
    const sessionId = parts[1] || undefined;
    return { tab, sessionId };
  }

  if (tab === 'services') {
    const subView = parts[1] || undefined;
    return { tab, subView };
  }

  return { tab };
}

function buildHash(route: RouteState): string {
  if (route.tab === 'messages') {
    return route.sessionId ? `#/messages/${route.sessionId}` : '#/messages';
  }
  if (route.tab === 'services') {
    return route.subView ? `#/services/${route.subView}` : '#/services';
  }
  return `/#/${route.tab}`;
}

export function useHashRouter(defaultSessionId: string = 'session_rd_dept') {
  const [route, setRoute] = useState<RouteState>(() => {
    if (typeof window === 'undefined') return { tab: 'messages', sessionId: defaultSessionId };
    const parsed = parseHash(window.location.hash);
    if (parsed.tab === 'messages' && !parsed.sessionId) {
      return { ...parsed, sessionId: defaultSessionId };
    }
    return parsed;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHash(window.location.hash);
      setRoute((prev) => {
        if (
          prev.tab === parsed.tab &&
          prev.sessionId === parsed.sessionId &&
          prev.subView === parsed.subView
        ) {
          return prev;
        }
        return parsed;
      });
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // If initially no hash, sync default hash
    if (!window.location.hash) {
      window.location.hash = buildHash(route);
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [route]);

  const navigate = useCallback((nextRoute: Partial<RouteState>) => {
    setRoute((prev) => {
      const merged: RouteState = {
        tab: nextRoute.tab ?? prev.tab,
        sessionId: nextRoute.sessionId !== undefined ? nextRoute.sessionId : prev.sessionId,
        subView: nextRoute.subView !== undefined ? nextRoute.subView : prev.subView,
      };

      const newHash = buildHash(merged);
      if (window.location.hash !== newHash) {
        window.location.hash = newHash;
      }
      return merged;
    });
  }, []);

  const setTab = useCallback((tab: MainNavTab) => {
    navigate({ tab });
  }, [navigate]);

  const setSessionId = useCallback((sessionId: string) => {
    navigate({ tab: 'messages', sessionId });
  }, [navigate]);

  return {
    route,
    activeTab: route.tab,
    activeSessionId: route.sessionId || defaultSessionId,
    setTab,
    setSessionId,
    navigate,
  };
}
