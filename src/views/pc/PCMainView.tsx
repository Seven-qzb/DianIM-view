/**
 * [View - PCMainView]
 * PC端大屏桌面工作台主视图 (Thin View)
 * 纯UI呈现桌面三栏/四栏沉浸通讯，操作通过 Presenter 驱动
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { NavigationSidebar } from '../../components/NavigationSidebar';
import { ConversationList } from '../../components/ConversationList';
import { ChatArea } from '../../components/ChatArea';
import { GroupInfoDrawer } from '../../components/GroupInfoDrawer';
import { ServicesView } from '../../components/ServicesView';
import { SettingsView } from '../../components/SettingsView';
import { useChat } from '../../context/ChatContext';
import { useHashRouter } from '../../router/useHashRouter';
import { TaskDirective, UserMember } from '../../types/chat';

export interface PCMainViewProps {
  router: ReturnType<typeof useHashRouter>;
  onBackToPortal?: () => void;
}

export const PCMainView: React.FC<PCMainViewProps> = ({
  router,
  onBackToPortal,
}) => {
  const {
    activeTab,
    activeSessionId,
    setTab,
    setSessionId,
  } = router;

  const {
    sessions,
    messagesMap,
    totalUnreadCount,
    toast,
    toggleMute,
    togglePin,
    toggleHide,
    toggleNotDisplay,
    restoreAllHidden,
    restoreAllNotDisplayed,
    markAsRead,
    markAsUnread,
    clearSessionHistory,
    deleteSession,
    exitGroup,
    disbandGroup,
    toggleGroupStatus,
    toggleInviteConfirm,
    updateGroupName,
    updateAnnouncement,
    updateNickname,
    toggleReminderTrack,
    addMember,
    createNewGroupChat,
    joinGroupByLink,
    sendMessage,
    saveDraft,
    recallMessage,
    forwardMessages,
    createDirective,
    updateDirectiveStatus,
    clearUnread,
    syncActiveSessionId,
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Sync activeSessionId to chat engine
  useEffect(() => {
    if (activeSessionId) {
      syncActiveSessionId(activeSessionId);
    }
  }, [activeSessionId, syncActiveSessionId]);

  const activeSession = useMemo(() => {
    return (
      sessions.find((s) => s.id === activeSessionId) ||
      sessions.find((s) => !s.isHidden && !s.isNotDisplayed) ||
      sessions[0]
    );
  }, [sessions, activeSessionId]);

  const activeMessages = useMemo(() => {
    return (activeSession ? messagesMap[activeSession.id] : []) || [];
  }, [messagesMap, activeSession]);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      setSessionId(sessionId);
      clearUnread(sessionId);
      syncActiveSessionId(sessionId);
      setIsSidebarOpen(false);
    },
    [setSessionId, clearUnread, syncActiveSessionId]
  );

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeSessionId]);

  const handleNewChat = useCallback(
    (groupTitle?: string) => {
      const newId = createNewGroupChat(groupTitle);
      setSessionId(newId);
    },
    [createNewGroupChat, setSessionId]
  );

  const handleJoinByLink = useCallback(
    (codeOrUrl: string) => {
      const res = joinGroupByLink(codeOrUrl);
      if (res.success && res.sessionId) {
        setSessionId(res.sessionId);
        setTab('messages');
        return true;
      }
      return false;
    },
    [joinGroupByLink, setSessionId, setTab]
  );

  const handleSendMessage = useCallback(
    (
      content: string,
      type: 'text' | 'image' | 'push_card' | 'directive' = 'text',
      directive?: TaskDirective,
      quoteData?: { messageId: string; senderName: string; content: string }
    ) => {
      if (!activeSession) return;
      sendMessage(activeSession.id, content, type, directive, quoteData);
    },
    [activeSession, sendMessage]
  );

  const handleSaveDraft = useCallback(
    (sessionId: string, draft: string) => {
      saveDraft(sessionId, draft);
    },
    [saveDraft]
  );

  const handleRecallMessage = useCallback(
    (messageId: string) => {
      if (!activeSession) return;
      recallMessage(activeSession.id, messageId);
    },
    [activeSession, recallMessage]
  );

  const handleCreateDirective = useCallback(
    (directive: TaskDirective) => {
      if (!activeSession) return;
      createDirective(activeSession.id, directive);
    },
    [activeSession, createDirective]
  );

  const handleAddMember = useCallback(
    (newMember: UserMember) => {
      if (!activeSession) return;
      addMember(activeSession.id, newMember);
    },
    [activeSession, addMember]
  );

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#dbe8f8] text-gray-800 font-sans p-0 overflow-hidden select-none">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 z-50 bg-gray-900/90 text-white text-xs px-4 py-1.5 rounded-full shadow-lg backdrop-blur-xs transition-all animate-in fade-in slide-in-from-top-2">
          {toast.message}
        </div>
      )}

      {/* Top Breadcrumb & Return to Portal Bar */}
      {onBackToPortal && (
        <div className="w-[1220px] max-w-[98vw] mb-2 px-1 flex items-center justify-between text-xs text-slate-600 select-none">
          <div className="flex items-center gap-2">
            <button
              id="pc-top-btn-back-portal"
              type="button"
              onClick={onBackToPortal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 shadow-2xs font-semibold cursor-pointer transition-colors border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回主体菜单</span>
            </button>
            <span className="text-slate-400">/</span>
            <span className="font-semibold text-slate-800">PC客户端工作台</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-[11px] font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>点点密信 V8.2 桌面安全终端已连接</span>
          </div>
        </div>
      )}

      {/* Centered Desktop Window */}
      <div className="w-[1220px] h-[700px] max-w-[98vw] max-h-[96vh] flex bg-white rounded-xl shadow-2xl border border-slate-300/80 overflow-hidden shrink-0">
        <NavigationSidebar
          activeTab={activeTab}
          onTabChange={setTab}
          totalUnreadCount={totalUnreadCount}
          onBackToPortal={onBackToPortal}
        />

        {activeTab === 'messages' ? (
          <div className="flex-1 flex overflow-hidden min-w-0">
            <ConversationList
              sessions={sessions}
              activeSessionId={activeSession?.id || activeSessionId}
              onSelectSession={handleSelectSession}
              onToggleMute={toggleMute}
              onTogglePin={togglePin}
              onToggleHide={toggleHide}
              onToggleNotDisplay={toggleNotDisplay}
              onRestoreAllHidden={restoreAllHidden}
              onRestoreAllNotDisplayed={restoreAllNotDisplayed}
              onMarkAsRead={markAsRead}
              onMarkAsUnread={markAsUnread}
              onClearSession={clearSessionHistory}
              onDeleteSession={deleteSession}
              onNewChat={handleNewChat}
              onJoinByLink={handleJoinByLink}
            />

            <div className="flex-1 flex overflow-hidden min-w-0 relative h-full">
              {activeSession ? (
                <ChatArea
                  session={activeSession}
                  messages={activeMessages}
                  allSessions={sessions}
                  draftText={activeSession.draft || ''}
                  onSendMessage={handleSendMessage}
                  onSaveDraft={handleSaveDraft}
                  onRecallMessage={handleRecallMessage}
                  onForwardMessages={forwardMessages}
                  onCreateDirective={handleCreateDirective}
                  onUpdateDirectiveStatus={updateDirectiveStatus}
                  onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                  isSidebarOpen={isSidebarOpen}
                  onToggleMute={toggleMute}
                  onToggleReminderTrack={toggleReminderTrack}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-white text-gray-400 text-xs">
                  请选择左侧会话开始聊天
                </div>
              )}

              <AnimatePresence>
                {isSidebarOpen && activeSession && (
                  <>
                    <motion.div
                      key="group-info-drawer-backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setIsSidebarOpen(false)}
                      className="absolute inset-0 bg-black/15 z-25 cursor-pointer backdrop-blur-[0.5px]"
                      title="点击收回群组设置"
                    />
                    <motion.div
                      key="group-info-drawer"
                      initial={{ x: '100%', opacity: 0.8 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: '100%', opacity: 0.8 }}
                      transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                      className="absolute top-0 right-0 bottom-0 z-30 h-full shadow-2xl flex"
                    >
                      <GroupInfoDrawer
                        session={activeSession}
                        onClose={() => setIsSidebarOpen(false)}
                        onToggleMute={toggleMute}
                        onTogglePin={togglePin}
                        onToggleReminderTrack={toggleReminderTrack}
                        onToggleGroupStatus={toggleGroupStatus}
                        onToggleInviteConfirm={toggleInviteConfirm}
                        onUpdateGroupName={updateGroupName}
                        onUpdateAnnouncement={updateAnnouncement}
                        onUpdateNickname={updateNickname}
                        onClearHistory={clearSessionHistory}
                        onExitGroup={exitGroup}
                        onDisbandGroup={disbandGroup}
                        onAddMember={handleAddMember}
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : activeTab === 'services' ? (
          <div className="flex-1 bg-white overflow-hidden">
            <ServicesView
              onJumpToChat={(sessionId) => {
                setSessionId(sessionId);
                setTab('messages');
              }}
              onUpdateDirectiveStatus={updateDirectiveStatus}
            />
          </div>
        ) : (
          <div className="flex-1 bg-white overflow-hidden">
            <SettingsView />
          </div>
        )}
      </div>
    </div>
  );
};
export default PCMainView;
