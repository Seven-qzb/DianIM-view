/**
 * [Presenter - ChatPresenter]
 * 核心聊天与会话业务逻辑控制器
 * 封装消息校验、国密信道标记、时间戳格式化、撤回与双端同步
 * 修改此处的逻辑，PC端与APP端同步生效
 */

import { useCallback } from 'react';
import { unifiedStore } from '../models/stores/UnifiedStore';
import { ChatMessage, TaskDirective } from '../models/entities/chat';
import { syncBridge, TerminalSource } from '../services/terminalSyncBridge';
import { soundService } from '../services/audioService';

export function useChatPresenter() {
  // 1. 发送消息业务逻辑
  const sendMessage = useCallback(
    (
      source: TerminalSource,
      sessionId: string,
      content: string,
      type: 'text' | 'image' | 'file' | 'instruction' | 'audio' | 'directive' | 'push_card' = 'text',
      extra?: {
        directive?: TaskDirective;
        audioDuration?: number;
        imageUrl?: string;
        quoteData?: { messageId: string; senderName: string; content: string };
      }
    ) => {
      if (!content.trim() && type === 'text') return;

      const state = unifiedStore.getState();
      const user = source === 'pc' ? state.currentUser : state.mobileUser;
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sessionId,
        conversationId: sessionId,
        senderId: user.id,
        senderName: source !== 'pc' ? `${user.name} (我)` : user.name,
        senderAvatar: user.avatar,
        isSelf: true,
        type: type === 'push_card' ? 'text' : type,
        content,
        imageUrl: type === 'image' ? (extra?.imageUrl || content) : undefined,
        audioDuration: extra?.audioDuration,
        voiceDuration: extra?.audioDuration,
        directiveData: extra?.directive,
        quoteData: extra?.quoteData,
        time: timeStr,
        timestamp: Date.now(),
        unreadMembersCount: 2,
      };

      // 更新 Store
      unifiedStore.setState((prev) => {
        const currentMessages = prev.messagesMap[sessionId] || [];
        const nextMessages = [...currentMessages, newMsg];

        let snippet = content;
        if (type === 'image') snippet = '[图片]';
        else if (type === 'audio') snippet = `[语音 ${extra?.audioDuration || 5}"]`;
        else if (type === 'directive') snippet = `[待办指令] ${extra?.directive?.title || content}`;

        const nextSessions = prev.sessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                lastSender: user.name,
                lastMessage: snippet,
                lastTime: timeStr,
                timestamp: Date.now(),
                draft: undefined,
              }
            : s
        );

        return {
          messagesMap: {
            ...prev.messagesMap,
            [sessionId]: nextMessages,
          },
          sessions: nextSessions,
        };
      });

      // 跨端即时双向同步广播
      const targetSessionId = syncBridge.getMappedSessionId(source, sessionId);
      syncBridge.dispatchMessage(source, {
        id: newMsg.id,
        sourceSessionId: sessionId,
        targetSessionId,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar,
        isSelf: true,
        content,
        type: type === 'push_card' || type === 'directive' ? 'text' : type,
        timestamp: timeStr,
        audioDuration: extra?.audioDuration,
        imageUrl: newMsg.imageUrl,
      });
    },
    []
  );

  // 2. 撤回消息业务逻辑
  const recallMessage = useCallback(
    (source: TerminalSource, sessionId: string, messageId: string) => {
      unifiedStore.setState((prev) => {
        const currentList = prev.messagesMap[sessionId] || [];
        const updatedList = currentList.map((m) => {
          if (m.id === messageId) {
            const original = m.content || m.reEditDraft || m.recalledOriginalContent || '';
            return {
              ...m,
              isRecalled: true,
              isRevoked: true,
              recallText: source === 'pc' ? '你撤回了一条消息' : '你撤回了一条消息',
              recalledOriginalContent: original,
              reEditDraft: original,
              recalledTimestamp: Date.now(),
            };
          }
          return m;
        });

        const nextSessions = prev.sessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                lastMessage: '撤回了一条消息',
                timestamp: Date.now(),
              }
            : s
        );

        return {
          messagesMap: {
            ...prev.messagesMap,
            [sessionId]: updatedList,
          },
          sessions: nextSessions,
        };
      });

      // 跨端广播撤回
      syncBridge.dispatchRevokeMessage(source, sessionId, messageId);
    },
    []
  );

  // 3. 草稿保存逻辑
  const saveDraft = useCallback((source: TerminalSource, sessionId: string, draft: string) => {
    const cleanDraft = draft.trim() ? draft : undefined;
    unifiedStore.setState((prev) => ({
      sessions: prev.sessions.map((s) => (s.id === sessionId ? { ...s, draft: cleanDraft } : s)),
    }));
    syncBridge.dispatchDraftSync(source, sessionId, draft);
  }, []);

  // 4. 清空会话历史逻辑
  const clearSessionHistory = useCallback((sessionId: string) => {
    unifiedStore.setState((prev) => ({
      messagesMap: {
        ...prev.messagesMap,
        [sessionId]: [],
      },
      sessions: prev.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, lastMessage: '[聊天记录已清空]', unreadCount: 0 }
          : s
      ),
    }));
  }, []);

  // 5. 标为已读/未读逻辑
  const markAsRead = useCallback((sessionId: string) => {
    unifiedStore.setState((prev) => ({
      sessions: prev.sessions.map((s) => (s.id === sessionId ? { ...s, unreadCount: 0 } : s)),
    }));
  }, []);

  const markAsUnread = useCallback((sessionId: string) => {
    unifiedStore.setState((prev) => ({
      sessions: prev.sessions.map((s) => (s.id === sessionId ? { ...s, unreadCount: 1 } : s)),
    }));
  }, []);

  // 6. 语音转文字切换
  const toggleVoiceTranscription = useCallback((sessionId: string, messageId: string) => {
    unifiedStore.setState((prev) => {
      const msgs = prev.messagesMap[sessionId] || [];
      return {
        messagesMap: {
          ...prev.messagesMap,
          [sessionId]: msgs.map((m) =>
            m.id === messageId ? { ...m, isVoiceTranscribed: !m.isVoiceTranscribed } : m
          ),
        },
      };
    });
  }, []);

  return {
    sendMessage,
    recallMessage,
    saveDraft,
    clearSessionHistory,
    markAsRead,
    markAsUnread,
    toggleVoiceTranscription,
  };
}
