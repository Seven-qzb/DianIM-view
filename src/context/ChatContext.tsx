import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ChatSession, ChatMessage, UserMember, TaskDirective } from '../types/chat';
import { INITIAL_SESSIONS, INITIAL_MESSAGES, CURRENT_USER, INITIAL_MEMBERS } from '../data/mockData';
import { soundService } from '../services/audioService';
import { createGroupChatMessage } from '../services/groupChatService';
import { syncBridge, CrossTerminalMessage } from '../services/terminalSyncBridge';

export interface ToastInfo {
  message: string;
  type: 'muted' | 'unmuted' | 'info';
}

interface ChatContextType {
  sessions: ChatSession[];
  messagesMap: Record<string, ChatMessage[]>;
  totalUnreadCount: number;
  toast: ToastInfo | null;
  showToast: (message: string, type?: 'muted' | 'unmuted' | 'info') => void;
  // Auto group chat status & controls
  chatCount: number;
  isAutoChatPaused: boolean;
  resetChatCount: () => void;
  toggleAutoChatPause: () => void;
  syncActiveSessionId: (sessionId: string) => void;
  // Session operations
  toggleMute: (sessionId: string) => void;
  togglePin: (sessionId: string) => void;
  toggleHide: (sessionId: string) => void;
  toggleNotDisplay: (sessionId: string) => void;
  restoreAllHidden: () => void;
  restoreAllNotDisplayed: () => void;
  markAsRead: (sessionId: string) => void;
  markAsUnread: (sessionId: string) => void;
  clearSessionHistory: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  exitGroup: (sessionId: string) => void;
  disbandGroup: (sessionId: string) => void;
  toggleGroupStatus: (sessionId: string) => void;
  toggleInviteConfirm: (sessionId: string) => void;
  updateGroupName: (sessionId: string, newName: string) => void;
  updateAnnouncement: (sessionId: string, newAnnounce: string) => void;
  updateNickname: (sessionId: string, newNickname: string) => void;
  toggleReminderTrack: (sessionId: string) => void;
  addMember: (sessionId: string, newMember: UserMember) => void;
  createNewGroupChat: (groupTitle?: string) => string;
  joinGroupByLink: (codeOrUrl: string) => { success: boolean; sessionId?: string; name?: string };
  // Message operations
  sendMessage: (
    sessionId: string,
    content: string,
    type?: 'text' | 'image' | 'push_card' | 'directive',
    directive?: TaskDirective,
    quoteData?: { messageId: string; senderName: string; content: string }
  ) => void;
  saveDraft: (sessionId: string, draft: string) => void;
  recallMessage: (sessionId: string, messageId: string) => void;
  forwardMessages: (targetSessionIds: string[], messagesToForward: ChatMessage[]) => void;
  createDirective: (sessionId: string, directive: TaskDirective) => void;
  updateDirectiveStatus: (
    directiveId: string,
    newStatus: 'pending' | 'in_progress' | 'completed'
  ) => void;
  clearUnread: (sessionId: string) => void;
  toggleVoiceTranscription: (sessionId: string, messageId: string) => void;
  sendSimulatedVoiceMessage: (
    sessionId: string,
    params?: {
      senderName?: string;
      senderAvatar?: string;
      duration?: number;
      text?: string;
      terminal?: string;
    }
  ) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{
  children: React.ReactNode;
  activeSessionId?: string;
}> = ({ children, activeSessionId }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_SESSIONS);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Auto group chat status & active session tracking
  const [currentActiveSessionId, setCurrentActiveSessionId] = useState<string | undefined>(activeSessionId);
  const [chatCount, setChatCount] = useState<number>(0);
  const [isAutoChatPaused, setIsAutoChatPaused] = useState<boolean>(false);

  const chatCountRef = useRef<number>(0);
  const isAutoChatPausedRef = useRef<boolean>(false);
  isAutoChatPausedRef.current = isAutoChatPaused;

  const sessionsRef = useRef<ChatSession[]>(sessions);
  sessionsRef.current = sessions;

  // Sync activeSessionId if prop updates
  useEffect(() => {
    if (activeSessionId) {
      setCurrentActiveSessionId(activeSessionId);
    }
  }, [activeSessionId]);

  const syncActiveSessionId = useCallback((sessionId: string) => {
    setCurrentActiveSessionId(sessionId);
  }, []);

  const resetChatCount = useCallback(() => {
    chatCountRef.current = 0;
    setChatCount(0);
  }, []);

  const toggleAutoChatPause = useCallback(() => {
    setIsAutoChatPaused((prev) => !prev);
  }, []);

  // Toast notification helper
  const showToast = useCallback((message: string, type: 'muted' | 'unmuted' | 'info' = 'info') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  // Total unread count across visible sessions
  const totalUnreadCount = useMemo(() => {
    return sessions.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  }, [sessions]);

  // Automated group chat simulation:
  // 1. Switches reset count to 0.
  // 2. Chats up to 100 messages.
  // 3. One realistic group conversation message every 5 seconds (5000ms).
  useEffect(() => {
    if (!currentActiveSessionId) {
      chatCountRef.current = 0;
      setChatCount(0);
      return;
    }

    const currentSession = sessionsRef.current.find((s) => s.id === currentActiveSessionId);
    if (!currentSession || !currentSession.isGroup || currentSession.isNoticeSession || currentSession.isTaskSession) {
      chatCountRef.current = 0;
      setChatCount(0);
      return;
    }

    // 切换群聊后重置次数
    chatCountRef.current = 0;
    setChatCount(0);

    const interval = setInterval(() => {
      if (isAutoChatPausedRef.current) return;

      if (chatCountRef.current >= 100) {
        clearInterval(interval);
        return;
      }

      chatCountRef.current += 1;
      const nextCount = chatCountRef.current;
      setChatCount(nextCount);

      const targetSession = sessionsRef.current.find((s) => s.id === currentActiveSessionId);
      const { message, previewText, timeStr, senderName } = createGroupChatMessage(
        currentActiveSessionId,
        nextCount,
        targetSession?.members
      );

      // 追加群聊沟通记录
      setMessagesMap((prev) => ({
        ...prev,
        [currentActiveSessionId]: [...(prev[currentActiveSessionId] || []), message],
      }));

      // 更新会话列表展示
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentActiveSessionId
            ? {
                ...s,
                lastSender: senderName,
                lastMessage: previewText,
                lastTime: timeStr,
                timestamp: Date.now(),
              }
            : s
        )
      );
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [currentActiveSessionId]);

  // =========================================================================
  // 跨端同频同步监听 (Subscribe to events from APP terminal via syncBridge)
  // =========================================================================
  useEffect(() => {
    // 1. Receive cross-terminal messages from APP
    const unsubMsg = syncBridge.subscribe('message:pc', (incoming: CrossTerminalMessage) => {
      const targetSessionId = incoming.targetSessionId;
      const newPcMsg: ChatMessage = {
        id: incoming.id,
        sessionId: targetSessionId,
        senderId: incoming.senderId,
        senderName: incoming.senderName,
        senderAvatar: incoming.senderAvatar,
        type: incoming.type === 'audio' ? 'text' : (incoming.type as any),
        content: incoming.type === 'audio' ? `[语音 ${incoming.audioDuration || 5}"]` : incoming.content,
        time: incoming.timestamp,
        timestamp: Date.now(),
      };

      setMessagesMap((prev) => ({
        ...prev,
        [targetSessionId]: [...(prev[targetSessionId] || []), newPcMsg],
      }));

      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? {
                ...s,
                lastSender: incoming.senderName,
                lastMessage: incoming.type === 'audio' ? `[语音 ${incoming.audioDuration || 5}"]` : incoming.content,
                lastTime: incoming.timestamp,
                timestamp: Date.now(),
              }
            : s
        )
      );
    });

    // 2. Receive message revocation from APP
    const unsubRevoke = syncBridge.subscribe('revoke:pc', ({ sessionId, messageId }) => {
      setMessagesMap((prev) => ({
        ...prev,
        [sessionId]: (prev[sessionId] || []).map((m) =>
          m.id === messageId
            ? {
                ...m,
                isRecalled: true,
                recallText: '移动端撤回了一条消息',
                recalledTimestamp: Date.now(),
              }
            : m
        ),
      }));
    });

    // 3. Receive group update from APP
    const unsubGroup = syncBridge.subscribe('group_update:pc', ({ sessionId, updates }) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                ...(updates.name ? { name: updates.name } : {}),
                ...(updates.announcement ? { announcement: updates.announcement } : {}),
                ...(typeof updates.isClosed === 'boolean' ? { isClosed: updates.isClosed } : {}),
                ...(typeof updates.isMuted === 'boolean' ? { isMuted: updates.isMuted } : {}),
              }
            : s
        )
      );
    });

    return () => {
      unsubMsg();
      unsubRevoke();
      unsubGroup();
    };
  }, []);

  // Clear unread count
  const clearUnread = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId && s.unreadCount > 0 ? { ...s, unreadCount: 0 } : s))
    );
  }, []);

  // Toggle Mute
  const toggleMute = useCallback((sessionId: string) => {
    let nextState = false;
    let targetSessionName = '';

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          nextState = !s.isMuted;
          targetSessionName = s.name;
          return { ...s, isMuted: nextState };
        }
        return s;
      })
    );

    soundService.playToggleSound();

    if (nextState) {
      showToast(
        `「${targetSessionName}」已开启免打扰：新消息静音，未读数正常累计 🔕`,
        'muted'
      );
    } else {
      showToast(
        `「${targetSessionName}」已关闭免打扰：恢复声音提醒 🔔`,
        'unmuted'
      );
    }
  }, [showToast]);

  // Toggle Pin
  const togglePin = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const nextPinned = !s.isPinned;
          showToast(`「${s.name}」已${nextPinned ? '置顶' : '取消置顶'}`);
          return { ...s, isPinned: nextPinned };
        }
        return s;
      })
    );
  }, [showToast]);

  // Toggle Hide
  const toggleHide = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const nextHidden = !s.isHidden;
          showToast(`「${s.name}」已${nextHidden ? '移入隐私隐藏列表' : '恢复显示'}`);
          return { ...s, isHidden: nextHidden };
        }
        return s;
      })
    );
  }, [showToast]);

  // Toggle Not Display
  const toggleNotDisplay = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const nextNotDisplay = !s.isNotDisplayed;
          showToast(`「${s.name}」已${nextNotDisplay ? '设置为不显示该聊天' : '恢复在列表中显示'}`);
          return { ...s, isNotDisplayed: nextNotDisplay };
        }
        return s;
      })
    );
  }, [showToast]);

  // Restore All Hidden
  const restoreAllHidden = useCallback(() => {
    setSessions((prev) => prev.map((s) => ({ ...s, isHidden: false })));
    showToast('已恢复所有隐藏会话至主消息列表');
  }, [showToast]);

  // Restore All Not Displayed
  const restoreAllNotDisplayed = useCallback(() => {
    setSessions((prev) => prev.map((s) => ({ ...s, isNotDisplayed: false })));
    showToast('已恢复所有不显示会话至主消息列表');
  }, [showToast]);

  // Mark as Read
  const markAsRead = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const newCount = s.unreadCount > 0 ? 0 : 1;
          return { ...s, unreadCount: newCount };
        }
        return s;
      })
    );
  }, []);

  // Mark as Unread
  const markAsUnread = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, unreadCount: 1 } : s))
    );
    showToast('已标为未读');
  }, [showToast]);

  // Clear Session History
  const clearSessionHistory = useCallback((sessionId: string) => {
    setMessagesMap((prev) => ({
      ...prev,
      [sessionId]: [],
    }));
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, lastMessage: '[聊天记录已清空]', unreadCount: 0 }
          : s
      )
    );
    showToast('当前群聊本地历史记录已清空');
  }, [showToast]);

  // Delete Session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast('已删除该会话');
  }, [showToast]);

  // Exit Group
  const exitGroup = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast('您已退出该群聊');
  }, [showToast]);

  // Disband Group
  const disbandGroup = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast('群主已删除该群组，所有数据已销毁');
  }, [showToast]);

  // Toggle Group Status
  const toggleGroupStatus = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const nextClosed = !s.isClosed;
          showToast(nextClosed ? '群主已关闭群聊，暂停收发消息' : '群主已开启群聊');
          return { ...s, isClosed: nextClosed };
        }
        return s;
      })
    );
  }, [showToast]);

  // Toggle Invite Confirm
  const toggleInviteConfirm = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const nextState = !s.inviteConfirmEnabled;
          showToast(
            nextState
              ? '已开启群邀请确认，新成员进群需群主/管理员审批'
              : '已关闭群邀请确认，新成员可直接进群'
          );
          return { ...s, inviteConfirmEnabled: nextState };
        }
        return s;
      })
    );
  }, [showToast]);

  // Update Group Name
  const updateGroupName = useCallback((sessionId: string, newName: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, name: newName } : s))
    );
    showToast(`群聊名称已修改为「${newName}」`);
  }, [showToast]);

  // Update Announcement
  const updateAnnouncement = useCallback((sessionId: string, newAnnounce: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, announcement: newAnnounce } : s))
    );
    showToast('群公告已更新');
  }, [showToast]);

  // Update Nickname
  const updateNickname = useCallback((sessionId: string, newNickname: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, myNickname: newNickname } : s))
    );
    showToast(`群昵称已更新为「${newNickname}」`);
  }, [showToast]);

  // Toggle Reminder Track
  const toggleReminderTrack = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const nextTrack = !s.reminderTrack;
          showToast(`「${s.name}」已${nextTrack ? '开启' : '关闭'}重要消息提醒跟踪`);
          return { ...s, reminderTrack: nextTrack };
        }
        return s;
      })
    );
  }, [showToast]);

  // Add Member
  const addMember = useCallback((sessionId: string, newMember: UserMember) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const updatedMembers = [...(s.members || []), newMember];
          return {
            ...s,
            members: updatedMembers,
            memberCount: updatedMembers.length,
          };
        }
        return s;
      })
    );
    showToast(`已邀请 ${newMember.name} 加入群聊`);
  }, [showToast]);

  // Create New Group Chat
  const createNewGroupChat = useCallback((groupTitle?: string): string => {
    const title = groupTitle?.trim() || '新产品加密讨论群';
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      name: title,
      isGroup: true,
      isOwner: true,
      inviteConfirmEnabled: false,
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
      memberCount: 3,
      onlineCount: 2,
      lastSender: CURRENT_USER.name,
      lastMessage: '群聊已创建，开启端到端加密保护',
      lastTime: '刚刚',
      timestamp: Date.now(),
      unreadCount: 0,
      isMuted: false,
      isPinned: false,
      announcement: '欢迎加入新加密群聊',
      myNickname: CURRENT_USER.name,
      members: INITIAL_MEMBERS.slice(0, 3),
    };
    setSessions((prev) => [newSession, ...prev]);
    showToast(`群聊「${title}」创建成功`);
    return newSession.id;
  }, [showToast]);

  // Join Group By Link
  const joinGroupByLink = useCallback((_codeOrUrl: string) => {
    const existing = sessions.find((s) => s.id === 'session_rd_test222') || sessions[0];
    if (existing) {
      showToast(`已成功识别链接，跳转至「${existing.name}」`);
      return { success: true, sessionId: existing.id, name: existing.name };
    }
    return { success: false };
  }, [sessions, showToast]);

  // Send Message
  const sendMessage = useCallback(
    (
      sessionId: string,
      content: string,
      type: 'text' | 'image' | 'push_card' | 'directive' = 'text',
      directive?: TaskDirective,
      quoteData?: { messageId: string; senderName: string; content: string }
    ) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        sessionId,
        senderId: CURRENT_USER.id,
        senderName: CURRENT_USER.name,
        senderAvatar: CURRENT_USER.avatar,
        type,
        content,
        imageUrl: type === 'image' ? content : undefined,
        directiveData: directive,
        quoteData,
        time: timeStr,
        timestamp: Date.now(),
      };

      setMessagesMap((prev) => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] || []), newMsg],
      }));

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                lastSender: CURRENT_USER.name,
                lastMessage:
                  type === 'image'
                    ? '[图片]'
                    : type === 'directive'
                    ? `[待办指令] ${directive?.title || content}`
                    : content,
                lastTime: timeStr,
                timestamp: Date.now(),
                draft: undefined,
                hasTaskDirective: type === 'directive' ? true : s.hasTaskDirective,
              }
            : s
        )
      );

      // Dispatch to APP terminal via syncBridge
      syncBridge.dispatchMessage('pc', {
        id: newMsg.id,
        sourceSessionId: sessionId,
        targetSessionId: syncBridge.getMappedSessionId('pc', sessionId),
        senderId: CURRENT_USER.id,
        senderName: CURRENT_USER.name,
        senderAvatar: CURRENT_USER.avatar,
        isSelf: true,
        content,
        type: type === 'push_card' ? 'text' : (type as any),
        timestamp: timeStr,
        imageUrl: type === 'image' ? content : undefined,
      });
    },
    []
  );

  // Save Draft
  const saveDraft = useCallback((sessionId: string, draft: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, draft: draft.trim() ? draft : undefined } : s))
    );
    syncBridge.dispatchDraftSync('pc', sessionId, draft);
  }, []);

  // Recall Message
  const recallMessage = useCallback((sessionId: string, messageId: string) => {
    setMessagesMap((prev) => {
      const currentList = prev[sessionId] || [];
      const updatedList = currentList.map((m) => {
        if (m.id === messageId) {
          const originalContent = m.content || m.reEditDraft || m.recalledOriginalContent || '';
          return {
            ...m,
            isRecalled: true,
            recallText: '你撤回了一条消息',
            recalledOriginalContent: originalContent,
            reEditDraft: originalContent,
            recalledTimestamp: Date.now(),
          };
        }
        return m;
      });
      return {
        ...prev,
        [sessionId]: updatedList,
      };
    });

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              lastMessage: '撤回了一条消息',
              timestamp: Date.now(),
            }
          : s
      )
    );

    // Broadcast revoke to APP terminal
    syncBridge.dispatchRevokeMessage('pc', sessionId, messageId);

    showToast('消息已撤回，可重新编辑');
  }, [showToast]);

  // Forward Messages
  const forwardMessages = useCallback(
    (targetSessionIds: string[], messagesToForward: ChatMessage[]) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      messagesToForward.forEach((msg) => {
        targetSessionIds.forEach((targetId) => {
          const forwardedMsg: ChatMessage = {
            ...msg,
            id: `msg_fwd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            sessionId: targetId,
            senderId: CURRENT_USER.id,
            senderName: CURRENT_USER.name,
            senderAvatar: CURRENT_USER.avatar,
            time: timeStr,
            timestamp: Date.now(),
          };

          setMessagesMap((prev) => ({
            ...prev,
            [targetId]: [...(prev[targetId] || []), forwardedMsg],
          }));

          setSessions((prev) =>
            prev.map((s) =>
              s.id === targetId
                ? {
                    ...s,
                    lastSender: CURRENT_USER.name,
                    lastMessage: `[转发] ${msg.type === 'image' ? '[图片]' : msg.content}`,
                    lastTime: timeStr,
                    timestamp: Date.now(),
                  }
                : s
            )
          );
        });
      });

      showToast(`已成功转发 ${messagesToForward.length} 条消息至 ${targetSessionIds.length} 个会话`);
    },
    [showToast]
  );

  // Create Directive
  const createDirective = useCallback((sessionId: string, directive: TaskDirective) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const directiveMsg: ChatMessage = {
      id: `msg_dir_${Date.now()}`,
      sessionId,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      senderAvatar: CURRENT_USER.avatar,
      type: 'directive',
      content: directive.title,
      directiveData: directive,
      time: timeStr,
      timestamp: Date.now(),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), directiveMsg],
    }));

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              lastSender: CURRENT_USER.name,
              lastMessage: `[待办指令] ${directive.title}`,
              lastTime: timeStr,
              timestamp: Date.now(),
              hasTaskDirective: true,
            }
          : s
      )
    );

    showToast(`任务指令「${directive.title}」已下发`);
  }, [showToast]);

  // Update Directive Status
  const updateDirectiveStatus = useCallback(
    (directiveId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
      setMessagesMap((prev) => {
        const updated: Record<string, ChatMessage[]> = {};
        Object.keys(prev).forEach((sId) => {
          updated[sId] = prev[sId].map((m) => {
            if (m.directiveData && m.directiveData.id === directiveId) {
              return {
                ...m,
                directiveData: {
                  ...m.directiveData,
                  status: newStatus,
                },
              };
            }
            return m;
          });
        });
        return updated;
      });

      showToast(
        `指令状态已变更为: ${
          newStatus === 'completed' ? '已完成' : newStatus === 'in_progress' ? '进行中' : '待处理'
        }`
      );
    },
    [showToast]
  );

  // Toggle Voice Speech-to-Text Transcription (语音转文字查看/收起)
  const toggleVoiceTranscription = useCallback(
    (sessionId: string, messageId: string) => {
      setMessagesMap((prev) => {
        const list = prev[sessionId] || [];
        const targetMsg = list.find((m) => m.id === messageId);
        if (!targetMsg || !targetMsg.voiceData) return prev;

        const currentTranscribed = targetMsg.voiceData.isTranscribed;

        // If currently transcribed, collapse it
        if (currentTranscribed) {
          return {
            ...prev,
            [sessionId]: list.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    voiceData: {
                      ...m.voiceData!,
                      isTranscribed: false,
                      isTranscribing: false,
                    },
                  }
                : m
            ),
          };
        }

        // Otherwise simulate speech recognition progress
        setTimeout(() => {
          setMessagesMap((laterPrev) => {
            const laterList = laterPrev[sessionId] || [];
            return {
              ...laterPrev,
              [sessionId]: laterList.map((m) =>
                m.id === messageId
                  ? {
                      ...m,
                      voiceData: {
                        ...m.voiceData!,
                        isTranscribing: false,
                        isTranscribed: true,
                        isListened: true,
                      },
                    }
                  : m
              ),
            };
          });
          soundService.playTranscriptionDoneSound();
        }, 550);

        return {
          ...prev,
          [sessionId]: list.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  voiceData: {
                    ...m.voiceData!,
                    isTranscribing: true,
                  },
                }
              : m
          ),
        };
      });
    },
    []
  );

  // Simulate receiving a voice message sent from another terminal (e.g. mobile/iOS/Android)
  const sendSimulatedVoiceMessage = useCallback(
    (
      sessionId: string,
      params?: {
        senderName?: string;
        senderAvatar?: string;
        duration?: number;
        text?: string;
        terminal?: string;
      }
    ) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const duration = params?.duration || Math.floor(Math.random() * 15) + 6;
      const terminal = params?.terminal || '移动端';
      const text =
        params?.text ||
        '戚老师，现场移动终端刚刚上报了最新的网络链路健康检查结果，各涉密通信节点响应指标均正常。';

      const newVoiceMsg: ChatMessage = {
        id: `msg_voice_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sessionId,
        senderId: 'user_sll',
        senderName: params?.senderName || '史乐乐',
        senderAvatar:
          params?.senderAvatar ||
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
        type: 'voice',
        content: `[语音] ${duration}"`,
        time: timeStr,
        timestamp: Date.now(),
        voiceData: {
          duration,
          terminal,
          transcription: text,
          isTranscribed: false,
          isTranscribing: false,
          isListened: false,
          confidence: 0.998,
        },
        readCount: 10,
        unreadCount: 7,
      };

      setMessagesMap((prev) => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] || []), newVoiceMsg],
      }));

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                lastMessage: `[语音 ${duration}"]`,
                lastSender: newVoiceMsg.senderName,
                lastTime: timeStr,
                timestamp: Date.now(),
              }
            : s
        )
      );

      soundService.playMessageChime();
      showToast(`收到来自${terminal}的语音消息（${duration}秒）`);
    },
    [showToast]
  );

  const value = useMemo(
    () => ({
      sessions,
      messagesMap,
      totalUnreadCount,
      toast,
      showToast,
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
      toggleVoiceTranscription,
      sendSimulatedVoiceMessage,
      chatCount,
      isAutoChatPaused,
      resetChatCount,
      toggleAutoChatPause,
      syncActiveSessionId,
    }),
    [
      sessions,
      messagesMap,
      totalUnreadCount,
      toast,
      showToast,
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
      toggleVoiceTranscription,
      sendSimulatedVoiceMessage,
      chatCount,
      isAutoChatPaused,
      resetChatCount,
      toggleAutoChatPause,
      syncActiveSessionId,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
