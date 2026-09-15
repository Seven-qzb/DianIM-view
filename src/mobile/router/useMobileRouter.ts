import { useState, useCallback } from 'react';
import { AppTab } from '../components/BottomNavBar';

export type MobileScreenState = 'login' | 'institution' | 'main';

export interface MobileRouteState {
  screen: MobileScreenState;
  tab: AppTab;
  conversationId: string | null;
  isGroupSettings: boolean;
}

export function useMobileRouter(initialScreen: MobileScreenState = 'main') {
  const [route, setRoute] = useState<MobileRouteState>({
    screen: initialScreen,
    tab: 'messages',
    conversationId: null,
    isGroupSettings: false,
  });

  const goToLogin = useCallback(() => {
    setRoute((prev) => ({
      ...prev,
      screen: 'login',
      conversationId: null,
      isGroupSettings: false,
    }));
  }, []);

  const goToInstitution = useCallback(() => {
    setRoute((prev) => ({
      ...prev,
      screen: 'institution',
      conversationId: null,
      isGroupSettings: false,
    }));
  }, []);

  const goToTab = useCallback((tab: AppTab) => {
    setRoute((prev) => ({
      ...prev,
      screen: 'main',
      tab,
      conversationId: null,
      isGroupSettings: false,
    }));
  }, []);

  const goToChat = useCallback((convId: string) => {
    setRoute((prev) => ({
      ...prev,
      screen: 'main',
      tab: 'messages',
      conversationId: convId,
      isGroupSettings: false,
    }));
  }, []);

  const goToGroupSettings = useCallback((convId: string) => {
    setRoute((prev) => ({
      ...prev,
      screen: 'main',
      tab: 'messages',
      conversationId: convId,
      isGroupSettings: true,
    }));
  }, []);

  const goBackToMessages = useCallback(() => {
    setRoute((prev) => ({
      ...prev,
      screen: 'main',
      tab: 'messages',
      conversationId: null,
      isGroupSettings: false,
    }));
  }, []);

  return {
    route,
    goToLogin,
    goToInstitution,
    goToTab,
    goToChat,
    goToGroupSettings,
    goBackToMessages,
  };
}
