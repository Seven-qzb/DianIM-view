/**
 * [Presenter - GroupPresenter]
 * 群组治理与成员权限业务逻辑控制器
 * 包含更名、公告、全员禁言、只读归档、解散退出与成员进出审核
 * 统一调度跨终端同频广播
 */

import { useCallback } from 'react';
import { unifiedStore } from '../models/stores/UnifiedStore';
import { UserMember } from '../models/entities/user';
import { ChatSession } from '../models/entities/chat';
import { syncBridge, TerminalSource } from '../services/terminalSyncBridge';
import { soundService } from '../services/audioService';

export function useGroupPresenter() {
  // 1. 修改群名称
  const updateGroupName = useCallback((source: TerminalSource, sessionId: string, newName: string) => {
    unifiedStore.setState((prev) => ({
      sessions: prev.sessions.map((s) => (s.id === sessionId ? { ...s, name: newName } : s)),
    }));
    syncBridge.dispatchGroupUpdate(source, sessionId, { name: newName });
  }, []);

  // 2. 更新群公告
  const updateAnnouncement = useCallback((source: TerminalSource, sessionId: string, announcement: string) => {
    unifiedStore.setState((prev) => ({
      sessions: prev.sessions.map((s) => (s.id === sessionId ? { ...s, announcement } : s)),
    }));
    syncBridge.dispatchGroupUpdate(source, sessionId, { announcement });
  }, []);

  // 3. 静音免打扰开关
  const toggleMute = useCallback((source: TerminalSource, sessionId: string) => {
    let nextState = false;
    unifiedStore.setState((prev) => {
      const nextSessions = prev.sessions.map((s) => {
        if (s.id === sessionId) {
          nextState = !s.isMuted;
          return { ...s, isMuted: nextState };
        }
        return s;
      });
      return { sessions: nextSessions };
    });

    soundService.playToggleSound();
    syncBridge.dispatchGroupUpdate(source, sessionId, { isMuted: nextState });
    return nextState;
  }, []);

  // 4. 置顶开关
  const togglePin = useCallback((sessionId: string) => {
    unifiedStore.setState((prev) => ({
      sessions: prev.sessions.map((s) => (s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s)),
    }));
  }, []);

  // 5. 隐藏/不显示设置
  const toggleHide = useCallback((sessionId: string) => {
    unifiedStore.setState((prev) => ({
      sessions: prev.sessions.map((s) => (s.id === sessionId ? { ...s, isHidden: !s.isHidden } : s)),
    }));
  }, []);

  const toggleNotDisplay = useCallback((sessionId: string) => {
    unifiedStore.setState((prev) => ({
      sessions: prev.sessions.map((s) => (s.id === sessionId ? { ...s, isNotDisplayed: !s.isNotDisplayed } : s)),
    }));
  }, []);

  // 6. 关闭/开启群聊（只读归档）
  const toggleGroupStatus = useCallback((source: TerminalSource, sessionId: string) => {
    let nextClosed = false;
    unifiedStore.setState((prev) => {
      const nextSessions = prev.sessions.map((s) => {
        if (s.id === sessionId) {
          nextClosed = !s.isClosed;
          return { ...s, isClosed: nextClosed };
        }
        return s;
      });
      return { sessions: nextSessions };
    });

    syncBridge.dispatchGroupUpdate(source, sessionId, { isClosed: nextClosed });
    return nextClosed;
  }, []);

  // 7. 群邀请审批开关
  const toggleInviteConfirm = useCallback((source: TerminalSource, sessionId: string) => {
    let nextConfirm = false;
    unifiedStore.setState((prev) => {
      const nextSessions = prev.sessions.map((s) => {
        if (s.id === sessionId) {
          nextConfirm = !s.inviteConfirmEnabled;
          return { ...s, inviteConfirmEnabled: nextConfirm };
        }
        return s;
      });
      return { sessions: nextSessions };
    });

    syncBridge.dispatchGroupUpdate(source, sessionId, { inviteConfirmEnabled: nextConfirm });
    return nextConfirm;
  }, []);

  // 8. 退出群聊
  const exitGroup = useCallback((source: TerminalSource, sessionId: string) => {
    unifiedStore.setState((prev) => ({
      sessions: prev.sessions.filter((s) => s.id !== sessionId),
    }));
    syncBridge.dispatchGroupUpdate(source, sessionId, { isClosed: true });
  }, []);

  // 9. 解散群聊
  const disbandGroup = useCallback((source: TerminalSource, sessionId: string) => {
    unifiedStore.setState((prev) => ({
      sessions: prev.sessions.filter((s) => s.id !== sessionId),
    }));
    syncBridge.dispatchGroupUpdate(source, sessionId, { isClosed: true });
  }, []);

  // 10. 邀请/添加成员
  const addMember = useCallback((sessionId: string, newMember: UserMember) => {
    unifiedStore.setState((prev) => ({
      sessions: prev.sessions.map((s) => {
        if (s.id === sessionId) {
          const members = [...(s.members || []), newMember];
          return {
            ...s,
            members,
            memberCount: members.length,
          };
        }
        return s;
      }),
    }));
  }, []);

  // 11. 创建新群组
  const createNewGroup = useCallback((groupTitle?: string): string => {
    const title = groupTitle?.trim() || '新加密产品讨论群';
    const state = unifiedStore.getState();
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      name: title,
      isGroup: true,
      isOwner: true,
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
      memberCount: 3,
      onlineCount: 2,
      lastSender: state.currentUser.name,
      lastMessage: '群聊已建立，信道采用SM4商用密码保护',
      lastTime: '刚刚',
      timestamp: Date.now(),
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      members: [state.currentUser],
    };

    unifiedStore.setState((prev) => ({
      sessions: [newSession, ...prev.sessions],
      messagesMap: {
        ...prev.messagesMap,
        [newSession.id]: [
          {
            id: `msg_init_${newSession.id}`,
            sessionId: newSession.id,
            conversationId: newSession.id,
            senderId: 'system',
            senderName: '系统',
            senderAvatar: '',
            type: 'system',
            content: '【系统提示】加密协同群组已建立，已开启端到端加密保护。',
            time: '刚刚',
            timestamp: Date.now(),
          },
        ],
      },
    }));

    return newSession.id;
  }, []);

  return {
    updateGroupName,
    updateAnnouncement,
    toggleMute,
    togglePin,
    toggleHide,
    toggleNotDisplay,
    toggleGroupStatus,
    toggleInviteConfirm,
    exitGroup,
    disbandGroup,
    addMember,
    createNewGroup,
  };
}
