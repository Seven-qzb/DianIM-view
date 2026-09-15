/**
 * DianIM-APP 移动端主应用组件
 * 完整移植自 DianIM-APP，并与 PC 终端建立双向实时同频数据与事件同步
 */

import React, { useState, useEffect } from 'react';
import { 
  Institution, UserProfile, ChatConversation, 
  ChatMessage, TaskItem, InstructionItem 
} from './types';
import { 
  INITIAL_INSTITUTIONS, INITIAL_USER, 
  INITIAL_CONVERSATIONS, INITIAL_MESSAGES, 
  INITIAL_TASKS, INITIAL_INSTRUCTIONS 
} from './data/mockData';
import { LoginScreen } from './components/LoginScreen';
import { InstitutionSelectScreen } from './components/InstitutionSelectScreen';
import { BottomNavBar, AppTab } from './components/BottomNavBar';
import { MessagesTab } from './components/MessagesTab';
import { ChatDetailScreen } from './components/ChatDetailScreen';
import { GroupSettingsScreen } from './components/GroupSettingsScreen';
import { ServicesTab } from './components/ServicesTab';
import { ProfileTab } from './components/ProfileTab';
import { InstructionFlowModal } from './components/InstructionFlowModal';
import { IPhone15ProMaxContainer } from './components/IPhone15ProMaxContainer';
import { motion, AnimatePresence } from 'motion/react';
import { useMobileRouter } from './router/useMobileRouter';
import { syncBridge, CrossTerminalMessage } from '../services/terminalSyncBridge';

interface MobileAppProps {
  onBackToPortal?: () => void;
  onSwitchToPC?: () => void;
}

export const MobileApp: React.FC<MobileAppProps> = ({
  onBackToPortal,
  onSwitchToPC,
}) => {
  // Mobile Navigation Router
  const {
    route,
    goToLogin,
    goToInstitution,
    goToTab,
    goToChat,
    goToGroupSettings,
    goBackToMessages,
  } = useMobileRouter('main'); // Start directly on main authenticated screen

  const screen = route.screen;
  const currentTab = route.tab;
  const activeConversationId = route.conversationId;
  const isGroupSettingsOpen = route.isGroupSettings;
  
  // Data States
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [institutions, setInstitutions] = useState<Institution[]>(INITIAL_INSTITUTIONS);
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [instructions, setInstructions] = useState<InstructionItem[]>(INITIAL_INSTRUCTIONS);

  // Task Stream unread counts (我的任务 & 指令流转 on the conversation list)
  const [tasksUnreadCount, setTasksUnreadCount] = useState(2);
  const [instructionsUnreadCount, setInstructionsUnreadCount] = useState(1);

  // Active Sub-screen States
  const [directInstructionCode, setDirectInstructionCode] = useState<string | null>(null);

  // Auto-mark conversation as read when active conversation ID changes
  useEffect(() => {
    if (activeConversationId) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversationId ? { ...c, unreadCount: 0 } : c))
      );
    }
  }, [activeConversationId]);

  // =========================================================================
  // 跨端同频同步监听 (Subscribe to PC terminal events via TerminalSyncBridge)
  // =========================================================================
  useEffect(() => {
    // 1. Receive cross-terminal messages from PC
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
                  ? '[现场存证照片]'
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

    // 2. Receive message revocation from PC
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

    // 3. Receive group updates from PC
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

    // 4. Receive directive updates from PC
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

  // 1. Handle Login Success -> Jump to Institution Select
  const handleLoginSuccess = (phone: string) => {
    setUser((prev) => ({ ...prev, phone }));
    goToInstitution();
  };

  // 2. Handle Institution Select -> Jump to Main App (Default to Messages Tab)
  const handleSelectInstitution = (institution: Institution) => {
    setUser((prev) => ({
      ...prev,
      institutionId: institution.id,
      institutionName: institution.name,
    }));
    goToTab('messages');
  };

  // 3. Chat Session Navigation
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeMessages = activeConversationId ? (messagesMap[activeConversationId] || []) : [];

  const handleSelectConversation = (conv: ChatConversation) => {
    goToChat(conv.id);
  };

  const handleSendMessage = (
    content: string, 
    type: 'text' | 'image' | 'file' | 'instruction' | 'audio' = 'text', 
    extra?: any
  ) => {
    if (!activeConversationId) return;

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
      readMembers: ['史乐乐', '马言言', '何坤', '马宸卓', '黄洋', '孟雨希', '李晓飞', '韩浩'],
      unreadMembers: ['韩尚君', '贾珂', '杨羽', '陈工'],
      ...extra,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMsg],
    }));

    // Update conversation last message snippet and clear draft
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
                : type === 'file' 
                ? `[文件] ${extra?.fileInfo?.name || ''}` 
                : content,
              lastSender: `${user.name}`,
              lastTime: newMsg.timestamp,
            }
          : c
      )
    );

    // =========================================================
    // 同步到 PC 客户端 (Dispatch message to PC via Sync Bridge)
    // =========================================================
    const mappedPcSessionId = syncBridge.getMappedSessionId('app', activeConversationId);
    syncBridge.dispatchMessage('app', {
      id: newMsg.id,
      sourceSessionId: activeConversationId,
      targetSessionId: mappedPcSessionId,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      isSelf: true,
      content,
      type,
      timestamp: newMsg.timestamp,
      audioDuration: extra?.audioDuration,
      imageUrl: extra?.imageUrl,
    });
  };

  const handleSaveDraft = (convId: string, draft: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, draft } : c))
    );
    syncBridge.dispatchDraftSync('app', convId, draft);
  };

  const handleRevokeMessage = (messageId: string) => {
    if (!activeConversationId) return;
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

    // Broadcast revoke to PC
    syncBridge.dispatchRevokeMessage('app', activeConversationId, messageId);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!activeConversationId) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversationId]: (prev[activeConversationId] || []).filter((m) => m.id !== messageId),
    }));
  };

  const handleDisbandGroup = (convId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    syncBridge.dispatchGroupUpdate('app', convId, { isClosed: true });
    goBackToMessages();
  };

  const handleCloseGroup = (convId: string) => {
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
    syncBridge.dispatchGroupUpdate('app', convId, { isClosed: true });
    if (convId) {
      goToChat(convId);
    } else {
      goBackToMessages();
    }
  };

  const handleCreateNewChat = (name: string, isGroup: boolean, memberNames: string[]) => {
    const newId = `conv-${Date.now()}`;
    const newConv: ChatConversation = {
      id: newId,
      name,
      isGroup,
      avatarGrid: isGroup ? [
        user.avatar,
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      ] : undefined,
      avatarSingle: !isGroup ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' : undefined,
      lastMessage: '会话已创建，已开启国密端到端传输加密。',
      lastSender: '系统提示',
      lastTime: '刚刚',
      unreadCount: 0,
      memberCount: memberNames.length,
      institutionName: user.institutionName,
      members: memberNames.map((m, idx) => ({
        id: `mem-${idx}`,
        name: m,
        role: idx === 0 ? 'owner' : 'member',
        department: user.department,
        avatar: idx === 0 ? user.avatar : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      })),
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessagesMap((prev) => ({
      ...prev,
      [newId]: [
        {
          id: `msg-init-${newId}`,
          conversationId: newId,
          senderId: 'system',
          senderName: '系统',
          senderAvatar: '',
          isSelf: false,
          content: '【系统提示】加密协同群组已建立，信道采用SM4商用密码保护。',
          type: 'system',
          timestamp: '刚刚',
        },
      ],
    }));

    goToChat(newId);
  };

  const handleUpdateGroup = (updates: Partial<ChatConversation>) => {
    if (!activeConversationId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, ...updates } : c))
    );
    syncBridge.dispatchGroupUpdate('app', activeConversationId, updates);
  };

  const handleExitGroup = (convId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    goBackToMessages();
  };

  const handleClearHistory = (convId: string) => {
    setMessagesMap((prev) => ({
      ...prev,
      [convId]: [
        {
          id: `msg-cleared-${Date.now()}`,
          conversationId: convId,
          senderId: 'system',
          senderName: '系统',
          senderAvatar: '',
          isSelf: false,
          content: '聊天记录已由用户主动清空。',
          type: 'system',
          timestamp: '刚刚',
        },
      ],
    }));
  };

  // Tasks Handlers
  const handleUpdateTask = (taskId: string, updates: Partial<TaskItem>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  };

  const handleCreateTask = (taskData: Omit<TaskItem, 'id' | 'createdAt' | 'logs'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('zh-CN'),
      logs: [
        {
          time: '刚刚',
          operator: `${user.name} (我)`,
          action: '任务创建并下发',
        },
      ],
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Instructions Handlers
  const handleSignInstruction = (instructionId: string) => {
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

    // Sync directive signing to PC terminal
    syncBridge.dispatchDirectiveAction('app', {
      directiveId: instructionId,
      status: 'signed',
      operatorName: user.name,
      timestamp: '刚刚',
    });
  };

  const handleCreateInstruction = (
    instData: Omit<InstructionItem, 'id' | 'createdAt' | 'signedCount' | 'flowSteps'>
  ) => {
    const newInst: InstructionItem = {
      ...instData,
      id: `inst-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('zh-CN'),
      signedCount: 1,
      flowSteps: [
        {
          title: '指令下达',
          orgOrUser: user.institutionName,
          time: '刚刚',
          status: 'done',
          note: '已下发至相关接收主体',
        },
        {
          title: '各主体签收',
          orgOrUser: instData.receiverOrgs.join(' / '),
          status: 'current',
          note: '等待各接收机构实名签收',
        },
        {
          title: '协同处置执行',
          orgOrUser: '应急联合专班',
          status: 'waiting',
        },
        {
          title: '办结归档',
          orgOrUser: user.institutionName,
          status: 'waiting',
        },
      ],
    };
    setInstructions((prev) => [newInst, ...prev]);
  };

  // Unread Total: sum of all groups/conversations on the list + tasks unread count + instruction flow unread count
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
          {/* 1. Login Screen */}
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

          {/* 2. Institution Select Screen */}
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

          {/* 3. Main Application Screen */}
          {screen === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col relative overflow-hidden"
            >
              {/* If Chat Detail is active */}
              {activeConversation ? (
                isGroupSettingsOpen ? (
                  <GroupSettingsScreen
                    conversation={activeConversation}
                    onBack={() => activeConversationId ? goToChat(activeConversationId) : goBackToMessages()}
                    onUpdateGroup={handleUpdateGroup}
                    onExitGroup={handleExitGroup}
                    onClearHistory={handleClearHistory}
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
                    onDeleteMessage={handleDeleteMessage}
                    onSaveDraft={handleSaveDraft}
                    onOpenInstructionFlow={(code) => setDirectInstructionCode(code)}
                  />
                )
              ) : (
                /* Tab-based View */
                <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
                  {currentTab === 'messages' && (
                    <MessagesTab
                      conversations={conversations}
                      onSelectConversation={handleSelectConversation}
                      onCreateNewChat={handleCreateNewChat}
                      tasksUnreadCount={tasksUnreadCount}
                      onClearTasksUnread={() => setTasksUnreadCount(0)}
                      instructionsUnreadCount={instructionsUnreadCount}
                      onClearInstructionsUnread={() => setInstructionsUnreadCount(0)}
                    />
                  )}

                  {currentTab === 'services' && (
                    <ServicesTab
                      tasks={tasks}
                      onUpdateTask={handleUpdateTask}
                      onCreateTask={handleCreateTask}
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

                  {/* Bottom Navigation Bar */}
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

        {/* Direct Instruction Flow Modal Triggered from Chat Cards */}
        {directInstructionCode && (
          <InstructionFlowModal
            instructions={instructions}
            initialSelectedCode={directInstructionCode}
            onClose={() => setDirectInstructionCode(null)}
            onSignInstruction={handleSignInstruction}
            onCreateInstruction={handleCreateInstruction}
          />
        )}
      </div>
    </IPhone15ProMaxContainer>
  );
};
export default MobileApp;
