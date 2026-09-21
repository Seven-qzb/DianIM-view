/**
 * [View - MiniAppMainView]
 * 微信小程序端主界面视图
 * 根据 APP端 原型 100% 深度复制，顶部右侧集成专属原生「功能三点栏 (Capsule Bar)」与小程序操作生态
 * 具备双向跨端同频广播、音视频对讲、公文指令流转与群聊治理全部能力
 */

import React, { useState, useEffect } from 'react';
import { 
  Institution, UserProfile, ChatConversation, 
  ChatMessage, TaskItem, InstructionItem 
} from '../../mobile/types';
import { 
  INITIAL_INSTITUTIONS, INITIAL_USER, 
  INITIAL_CONVERSATIONS, INITIAL_MESSAGES, 
  INITIAL_TASKS, INITIAL_INSTRUCTIONS 
} from '../../mobile/data/mockData';
import { LoginScreen } from '../../mobile/components/LoginScreen';
import { InstitutionSelectScreen } from '../../mobile/components/InstitutionSelectScreen';
import { BottomNavBar, AppTab } from '../../mobile/components/BottomNavBar';
import { MessagesTab } from '../../mobile/components/MessagesTab';
import { MobileContactsTab } from '../../mobile/components/MobileContactsTab';
import { ChatDetailScreen } from '../../mobile/components/ChatDetailScreen';
import { GroupSettingsScreen } from '../../mobile/components/GroupSettingsScreen';
import { ServicesTab } from '../../mobile/components/ServicesTab';
import { ProfileTab } from '../../mobile/components/ProfileTab';
import { InstructionFlowModal } from '../../mobile/components/InstructionFlowModal';
import { MiniProgramContainer } from '../../miniapp/components/MiniProgramContainer';
import { motion, AnimatePresence } from 'motion/react';
import { useMobileRouter } from '../../mobile/router/useMobileRouter';
import { useChatPresenter } from '../../presenters/useChatPresenter';
import { useGroupPresenter } from '../../presenters/useGroupPresenter';
import { useTaskPresenter } from '../../presenters/useTaskPresenter';
import { syncBridge, CrossTerminalMessage } from '../../services/terminalSyncBridge';

export interface MiniAppMainViewProps {
  onBackToPortal?: () => void;
  onSwitchToAPP?: () => void;
  onSwitchToPC?: () => void;
}

export const MiniAppMainView: React.FC<MiniAppMainViewProps> = ({
  onBackToPortal,
  onSwitchToAPP,
  onSwitchToPC,
}) => {
  const {
    route,
    goToLogin,
    goToInstitution,
    goToTab,
    goToChat,
    goToGroupSettings,
    goBackToMessages,
  } = useMobileRouter('main');

  // Presenter 业务逻辑钩子注入
  const chatPresenter = useChatPresenter();
  const groupPresenter = useGroupPresenter();
  const taskPresenter = useTaskPresenter();

  const screen = route.screen;
  const currentTab = route.tab;
  const activeConversationId = route.conversationId;
  const isGroupSettingsOpen = route.isGroupSettings;
  
  // Data States
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [institutions] = useState<Institution[]>(INITIAL_INSTITUTIONS);
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [instructions, setInstructions] = useState<InstructionItem[]>(INITIAL_INSTRUCTIONS);

  const [tasksUnreadCount, setTasksUnreadCount] = useState(2);
  const [instructionsUnreadCount, setInstructionsUnreadCount] = useState(1);
  const [directInstructionCode, setDirectInstructionCode] = useState<string | null>(null);

  useEffect(() => {
    if (activeConversationId) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversationId ? { ...c, unreadCount: 0 } : c))
      );
    }
  }, [activeConversationId]);

  // 跨端同频事件监听 (小程序端同步接收来自 PC端 / APP端 的消息与更新)
  useEffect(() => {
    const unsubMsg = syncBridge.subscribe('message:miniapp', (incoming: CrossTerminalMessage) => {
      const targetConvId = incoming.targetSessionId;
      const newAppMsg: ChatMessage = {
        id: incoming.id,
        conversationId: targetConvId,
        senderId: incoming.senderId,
        senderName: incoming.senderName,
        senderAvatar: incoming.senderAvatar,
        isSelf: incoming.isSelf,
        content: incoming.content,
        type: incoming.type,
        timestamp: incoming.timestamp,
        audioDuration: incoming.audioDuration,
        imageUrl: incoming.imageUrl,
        unreadMembersCount: 2,
      };

      setMessagesMap((prev) => ({
        ...prev,
        [targetConvId]: [...(prev[targetConvId] || []), newAppMsg],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                lastMessage: incoming.type === 'image'
                  ? '[图片]'
                  : incoming.type === 'audio'
                  ? `[语音 ${incoming.audioDuration || 5}"]`
                  : incoming.content,
                lastSender: incoming.senderName,
                lastTime: incoming.timestamp,
              }
            : c
        )
      );
    });

    const unsubRevoke = syncBridge.subscribe('revoke:miniapp', ({ sessionId, messageId }) => {
      setMessagesMap((prev) => ({
        ...prev,
        [sessionId]: (prev[sessionId] || []).map((m) =>
          m.id === messageId
            ? {
                ...m,
                isRevoked: true,
                revokedContent: m.content,
                revokedAt: Date.now(),
              }
            : m
        ),
      }));
    });

    const unsubGroup = syncBridge.subscribe('group_update:miniapp', ({ sessionId, updates }) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === sessionId ? { ...c, ...updates } : c))
      );
    });

    const unsubDirective = syncBridge.subscribe('directive:miniapp', (payload) => {
      setInstructions((prev) =>
        prev.map((inst) =>
          inst.id === payload.directiveId || inst.code === payload.directiveId
            ? {
                ...inst,
                signedCount: Math.min(inst.signedCount + 1, inst.totalReceivers),
                status: 'completed',
              }
            : inst
        )
      );
    });

    return () => {
      unsubMsg();
      unsubRevoke();
      unsubGroup();
      unsubDirective();
    };
  }, []);

  // 消息收发控制 (标记来源为 miniapp)
  const handleSendMessage = (
    content: string, 
    type: 'text' | 'image' | 'file' | 'instruction' | 'audio' = 'text',
    extra?: any
  ) => {
    if (!activeConversationId) return;

    chatPresenter.sendMessage(
      'miniapp',
      activeConversationId,
      content,
      type,
      extra
    );

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: `msg_mp_${Date.now()}`,
      conversationId: activeConversationId,
      senderId: user.id,
      senderName: `${user.name} (我)`,
      senderAvatar: user.avatar,
      isSelf: true,
      content,
      type,
      audioDuration: extra?.audioDuration,
      imageUrl: extra?.imageUrl,
      fileInfo: extra?.fileInfo,
      quoteMessage: extra?.quoteData ? {
        senderName: extra.quoteData.senderName || '',
        content: extra.quoteData.content || '',
      } : undefined,
      timestamp: timeStr,
      unreadMembersCount: activeConversation?.isGroup ? 4 : 1,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              lastMessage: type === 'image' 
                ? '[图片]' 
                : type === 'audio' 
                ? `[语音 ${extra?.audioDuration || 5}"]` 
                : content,
              lastSender: user.name,
              lastTime: timeStr,
              draft: '',
            }
          : c
      )
    );
  };

  const handleRevokeMessage = (messageId: string) => {
    if (!activeConversationId) return;

    chatPresenter.recallMessage('miniapp', activeConversationId, messageId);

    setMessagesMap((prev) => ({
      ...prev,
      [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
        m.id === messageId
          ? {
              ...m,
              isRevoked: true,
              revokedContent: m.content,
              revokedAt: Date.now(),
            }
          : m
      ),
    }));
  };

  const handleSaveDraft = (convId: string, draft: string) => {
    chatPresenter.saveDraft('miniapp', convId, draft);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, draft: draft.trim() ? draft : undefined } : c))
    );
  };

  const handleSignInstruction = (instructionId: string) => {
    taskPresenter.signInstruction('miniapp', instructionId, user.name);

    setInstructions((prev) =>
      prev.map((inst) =>
        inst.id === instructionId
          ? {
              ...inst,
              signedCount: Math.min(inst.signedCount + 1, inst.totalReceivers),
              status: 'completed',
            }
          : inst
      )
    );

    if (activeConversationId) {
      handleSendMessage(`【小程序实名签署完成】指令《${instructionId}》已成功签收并同步归档至加密账本。`, 'text');
    }
  };

  const handleUpdateGroup = (updates: Partial<ChatConversation>) => {
    if (!activeConversationId) return;

    if (updates.name) {
      groupPresenter.updateGroupName('miniapp', activeConversationId, updates.name);
    }
    if (updates.announcement) {
      groupPresenter.updateAnnouncement('miniapp', activeConversationId, updates.announcement);
    }

    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, ...updates } : c))
    );
  };

  const handleDisbandGroup = (convId: string) => {
    groupPresenter.disbandGroup('miniapp', convId);
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    goBackToMessages();
  };

  const handleCloseGroup = (convId: string) => {
    groupPresenter.toggleGroupStatus('miniapp', convId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, isClosed: !c.isClosed } : c))
    );
  };

  const handleSelectInstitution = (inst: Institution) => {
    setUser((prev) => ({
      ...prev,
      institutionId: inst.id,
      institutionName: inst.name,
    }));
    goToTab('messages');
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeMessages = activeConversationId ? messagesMap[activeConversationId] || [] : [];
  const totalUnreadMessages = conversations.reduce((acc, cur) => acc + (cur.unreadCount || 0), 0);
  const totalPendingTasks = tasks.filter((t) => t.status === 'pending').length;

  return (
    <MiniProgramContainer
      onBackToPortal={onBackToPortal}
      onSwitchToAPP={onSwitchToAPP}
      onSwitchToPC={onSwitchToPC}
      onRestart={() => {
        goBackToMessages();
        goToTab('messages');
      }}
    >
      {/* 
        Container with [&_header]:pr-[96px] 
        Ensures screen headers gracefully reserve 96px for the WeChat top-right capsule button
      */}
      <div className="w-full h-full relative overflow-hidden flex flex-col [&_header]:pr-[96px]">
        <AnimatePresence mode="wait">
          {screen === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <LoginScreen onLoginSuccess={() => goToTab('messages')} />
            </motion.div>
          )}

          {screen === 'institution' && (
            <motion.div
              key="institution"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              <InstitutionSelectScreen
                institutions={institutions}
                currentInstitutionId={user.institutionId}
                onSelectInstitution={handleSelectInstitution}
              />
            </motion.div>
          )}

          {screen === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col relative overflow-hidden"
            >
              {activeConversation ? (
                isGroupSettingsOpen ? (
                  <GroupSettingsScreen
                    conversation={activeConversation}
                    onBack={() => activeConversationId ? goToChat(activeConversationId) : goBackToMessages()}
                    onUpdateGroup={handleUpdateGroup}
                    onExitGroup={(convId) => {
                      groupPresenter.exitGroup('miniapp', convId);
                      setConversations((prev) => prev.filter((c) => c.id !== convId));
                      goBackToMessages();
                    }}
                    onClearHistory={(convId) => chatPresenter.clearSessionHistory(convId)}
                    onDisbandGroup={handleDisbandGroup}
                    onCloseGroup={handleCloseGroup}
                  />
                ) : (
                  <ChatDetailScreen
                    conversation={activeConversation}
                    messages={activeMessages}
                    onBack={goBackToMessages}
                    onOpenSettings={() => activeConversationId && goToGroupSettings(activeConversationId)}
                    onSendMessage={handleSendMessage}
                    onRevokeMessage={handleRevokeMessage}
                    onDeleteMessage={(messageId) => {
                      setMessagesMap((prev) => ({
                        ...prev,
                        [activeConversationId]: (prev[activeConversationId] || []).filter((m) => m.id !== messageId),
                      }));
                    }}
                    onSaveDraft={handleSaveDraft}
                    onOpenInstructionFlow={(code) => setDirectInstructionCode(code)}
                  />
                )
              ) : (
                <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
                  {currentTab === 'messages' && (
                    <MessagesTab
                      conversations={conversations}
                      onSelectConversation={(conv) => goToChat(conv.id)}
                      onCreateNewChat={(name) => {
                        const newId = groupPresenter.createNewGroup(name);
                        goToChat(newId);
                      }}
                      tasksUnreadCount={tasksUnreadCount}
                      onClearTasksUnread={() => setTasksUnreadCount(0)}
                      instructionsUnreadCount={instructionsUnreadCount}
                      onClearInstructionsUnread={() => setInstructionsUnreadCount(0)}
                    />
                  )}

                  {currentTab === 'contacts' && (
                    <MobileContactsTab
                      onNavigateToChat={(sessionId) => goToChat(sessionId)}
                      isMiniApp={true}
                    />
                  )}

                  {currentTab === 'services' && (
                    <ServicesTab
                      tasks={tasks}
                      onUpdateTask={(id, up) => taskPresenter.updateTask(id, up)}
                      onCreateTask={(td) => taskPresenter.createTask(td)}
                      institutionName={user.institutionName}
                    />
                  )}

                  {currentTab === 'profile' && (
                    <ProfileTab
                      user={user}
                      institutions={institutions}
                      onUpdateUser={(up) => setUser((prev) => ({ ...prev, ...up }))}
                      onSwitchInstitution={goToInstitution}
                      onLogout={goToLogin}
                    />
                  )}

                  <BottomNavBar
                    currentTab={currentTab}
                    onTabChange={goToTab}
                    unreadMessageCount={totalUnreadMessages}
                    pendingTaskCount={totalPendingTasks}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {directInstructionCode && (
          <InstructionFlowModal
            instructions={instructions}
            initialSelectedCode={directInstructionCode}
            onClose={() => setDirectInstructionCode(null)}
            onSignInstruction={handleSignInstruction}
            onCreateInstruction={() => {}}
          />
        )}
      </div>
    </MiniProgramContainer>
  );
};

export default MiniAppMainView;
