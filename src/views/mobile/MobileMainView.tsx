/**
 * [View - MobileMainView]
 * 移动端主界面视图 (Thin View)
 * 纯UI呈现，将消息发送、撤回、群管理、任务签署全部委托给 Presenter 层
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
import { ChatDetailScreen } from '../../mobile/components/ChatDetailScreen';
import { GroupSettingsScreen } from '../../mobile/components/GroupSettingsScreen';
import { ServicesTab } from '../../mobile/components/ServicesTab';
import { ProfileTab } from '../../mobile/components/ProfileTab';
import { InstructionFlowModal } from '../../mobile/components/InstructionFlowModal';
import { IPhone15ProMaxContainer } from '../../mobile/components/IPhone15ProMaxContainer';
import { motion, AnimatePresence } from 'motion/react';
import { useMobileRouter } from '../../mobile/router/useMobileRouter';
import { useChatPresenter } from '../../presenters/useChatPresenter';
import { useGroupPresenter } from '../../presenters/useGroupPresenter';
import { useTaskPresenter } from '../../presenters/useTaskPresenter';
import { syncBridge, CrossTerminalMessage } from '../../services/terminalSyncBridge';

export interface MobileMainViewProps {
  onBackToPortal?: () => void;
  onSwitchToPC?: () => void;
}

export const MobileMainView: React.FC<MobileMainViewProps> = ({
  onBackToPortal,
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

  // 跨端同频事件监听
  useEffect(() => {
    const unsubMsg = syncBridge.subscribe('message:app', (incoming: CrossTerminalMessage) => {
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

    const unsubRevoke = syncBridge.subscribe('revoke:app', ({ sessionId, messageId }) => {
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

    const unsubGroup = syncBridge.subscribe('group_update:app', ({ sessionId, updates }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === sessionId
            ? {
                ...c,
                ...(updates.name ? { name: updates.name } : {}),
                ...(updates.announcement ? { announcement: updates.announcement } : {}),
                ...(typeof updates.isClosed === 'boolean' ? { isClosed: updates.isClosed } : {}),
                ...(typeof updates.isMuted === 'boolean' ? { isMuted: updates.isMuted } : {}),
              }
            : c
        )
      );
    });

    const unsubDirective = syncBridge.subscribe('directive:app', (payload) => {
      setInstructions((prev) =>
        prev.map((i) =>
          i.id === payload.directiveId || i.code === payload.directiveId
            ? {
                ...i,
                status: payload.status === 'completed' ? 'completed' : 'processing',
                signedCount: Math.min(i.signedCount + 1, i.totalReceivers),
              }
            : i
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

  const handleLoginSuccess = (phone: string) => {
    setUser((prev) => ({ ...prev, phone }));
    goToInstitution();
  };

  const handleSelectInstitution = (institution: Institution) => {
    setUser((prev) => ({
      ...prev,
      institutionId: institution.id,
      institutionName: institution.name,
    }));
    goToTab('messages');
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeMessages = activeConversationId ? (messagesMap[activeConversationId] || []) : [];

  // 消息发送 -> 委托 Presenter
  const handleSendMessage = (
    content: string, 
    type: 'text' | 'image' | 'file' | 'instruction' | 'audio' = 'text', 
    extra?: any
  ) => {
    if (!activeConversationId) return;

    chatPresenter.sendMessage('app', activeConversationId, content, type, {
      audioDuration: extra?.audioDuration,
      imageUrl: extra?.imageUrl,
    });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversationId,
      senderId: user.id,
      senderName: `${user.name} (我)`,
      senderAvatar: user.avatar,
      isSelf: true,
      content,
      type,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      unreadMembersCount: activeConversation?.isGroup ? 4 : 1,
      ...extra,
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
              draft: '',
              lastMessage: type === 'image' 
                ? '[图片]' 
                : type === 'audio' 
                ? `[语音] ${extra?.audioDuration || 3}"`
                : content,
              lastSender: `${user.name}`,
              lastTime: newMsg.timestamp,
            }
          : c
      )
    );
  };

  // 草稿保存 -> 委托 Presenter
  const handleSaveDraft = (convId: string, draft: string) => {
    chatPresenter.saveDraft('app', convId, draft);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, draft } : c))
    );
  };

  // 消息撤回 -> 委托 Presenter
  const handleRevokeMessage = (messageId: string) => {
    if (!activeConversationId) return;
    chatPresenter.recallMessage('app', activeConversationId, messageId);
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

  // 群组管理 -> 委托 Presenter
  const handleUpdateGroup = (updates: Partial<ChatConversation>) => {
    if (!activeConversationId) return;
    if (updates.name) groupPresenter.updateGroupName('app', activeConversationId, updates.name);
    if (updates.announcement) groupPresenter.updateAnnouncement('app', activeConversationId, updates.announcement);

    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, ...updates } : c))
    );
  };

  const handleCloseGroup = (convId: string) => {
    groupPresenter.toggleGroupStatus('app', convId);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              isClosed: true,
              lastMessage: '【系统提示】该群组已关闭，已转为只读归档状态。',
              lastTime: '刚刚',
            }
          : c
      )
    );
    goToChat(convId);
  };

  const handleDisbandGroup = (convId: string) => {
    groupPresenter.disbandGroup('app', convId);
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    goBackToMessages();
  };

  // 指令签署 -> 委托 Presenter
  const handleSignInstruction = (instructionId: string) => {
    taskPresenter.signInstruction('app', instructionId, user.name);
    setInstructions((prev) =>
      prev.map((i) =>
        i.id === instructionId
          ? {
              ...i,
              status: 'processing',
              signedCount: Math.min(i.signedCount + 1, i.totalReceivers),
            }
          : i
      )
    );
  };

  const totalGroupUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const totalUnreadMessages = totalGroupUnread + tasksUnreadCount + instructionsUnreadCount;
  const totalPendingTasks = tasks.filter((t) => t.status !== 'completed').length;

  return (
    <IPhone15ProMaxContainer
      onBackToPortal={onBackToPortal}
      onSwitchToPC={onSwitchToPC}
    >
      <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#F8F9FA] text-slate-900 font-sans">
        <AnimatePresence mode="wait">
          {screen === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              <LoginScreen onLoginSuccess={handleLoginSuccess} />
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
                      groupPresenter.exitGroup('app', convId);
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
    </IPhone15ProMaxContainer>
  );
};
export default MobileMainView;
