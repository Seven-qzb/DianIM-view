/**
 * [Bootstrap / Application Root]
 * 组装 MVP 各层，提供顶层终端路由器调度
 * Model:   src/models/     (数据模型、状态仓库与持久源)
 * Presenter: src/presenters/ (聊天、群组、任务业务逻辑控制器与跨端同频总线)
 * View:    src/views/      (PortalView 多端门户, PCMainView 桌面工作台, MobileMainView 原生APP端)
 */

import React, { useState, useEffect } from 'react';
import { PortalView } from './views/portal/PortalView';
import { PCMainView } from './views/pc/PCMainView';
import { MobileMainView } from './views/mobile/MobileMainView';
import { MiniAppMainView } from './views/miniapp/MiniAppMainView';
import { ChatProvider } from './context/ChatContext';
import { useHashRouter } from './router/useHashRouter';

export default function App() {
  const router = useHashRouter('session_rd_dept');
  const [terminal, setTerminal] = useState<'portal' | 'pc' | 'app' | 'miniapp'>(() => {
    if (typeof window === 'undefined') return 'portal';
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('miniapp') || hash.includes('mp')) return 'miniapp';
    if (hash.includes('app') && !hash.includes('portal')) return 'app';
    if (hash.includes('messages') || hash.includes('contacts') || hash.includes('services') || hash.includes('settings') || hash.includes('pc')) {
      return 'pc';
    }
    return 'portal';
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('portal') || hash === '' || hash === '#/') {
        setTerminal('portal');
      } else if (hash.includes('miniapp') || hash.includes('mp')) {
        setTerminal('miniapp');
      } else if (hash.includes('app') && !hash.includes('portal')) {
        setTerminal('app');
      } else if (hash.includes('messages') || hash.includes('contacts') || hash.includes('services') || hash.includes('settings') || hash.includes('pc')) {
        setTerminal('pc');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelectTerminal = (t: 'pc' | 'app' | 'miniapp') => {
    if (t === 'pc') {
      setTerminal('pc');
      window.location.hash = '#/messages';
    } else if (t === 'app') {
      setTerminal('app');
      window.location.hash = '#/app';
    } else if (t === 'miniapp') {
      setTerminal('miniapp');
      window.location.hash = '#/miniapp';
    }
  };

  const handleBackToPortal = () => {
    setTerminal('portal');
    window.location.hash = '#/portal';
  };

  return (
    <ChatProvider activeSessionId={router.activeSessionId}>
      {terminal === 'portal' ? (
        <PortalView onSelectTerminal={handleSelectTerminal} />
      ) : terminal === 'miniapp' ? (
        <MiniAppMainView
          onBackToPortal={handleBackToPortal}
          onSwitchToAPP={() => handleSelectTerminal('app')}
          onSwitchToPC={() => handleSelectTerminal('pc')}
        />
      ) : terminal === 'app' ? (
        <MobileMainView
          onBackToPortal={handleBackToPortal}
          onSwitchToPC={() => handleSelectTerminal('pc')}
          onSwitchToMiniApp={() => handleSelectTerminal('miniapp')}
        />
      ) : (
        <PCMainView
          router={router}
          onBackToPortal={handleBackToPortal}
          onSwitchToMiniApp={() => handleSelectTerminal('miniapp')}
          onSwitchToAPP={() => handleSelectTerminal('app')}
        />
      )}
    </ChatProvider>
  );
}
