import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  BellOff,
  Pin,
  CheckCircle,
  Volume2,
  Trash2,
  MessageSquare,
  Sparkles,
  ListTodo,
  AlertCircle,
  Clock,
  Radio,
  EyeOff,
  Eye,
  Lock,
  Archive,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react';
import { ChatSession, FilterTab } from '../types/chat';
import { GroupAvatar } from './GroupAvatar';
import { CreateGroupModal } from './CreateGroupModal';

interface ConversationListProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onToggleMute: (id: string, e?: React.MouseEvent) => void;
  onTogglePin: (id: string, e?: React.MouseEvent) => void;
  onToggleHide?: (id: string, e?: React.MouseEvent) => void;
  onToggleNotDisplay?: (id: string, e?: React.MouseEvent) => void;
  onRestoreAllHidden?: () => void;
  onRestoreAllNotDisplayed?: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread?: (id: string) => void;
  onClearSession: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  onNewChat: (groupName?: string) => void;
  onJoinByLink?: (codeOrUrl: string) => boolean;
}

// 依据用户指定的时间段生成温馨提示
const getWarmGreeting = (now: Date = new Date()) => {
  const hour = now.getHours();

  // 8点-10点: 上午好，满满的正能量！
  if (hour >= 8 && hour < 10) {
    return {
      text: '上午好，满满的正能量！',
      icon: '✨',
      period: '08:00 - 10:00',
    };
  }
  // 10点-12点 (补充上午)
  if (hour >= 10 && hour < 12) {
    return {
      text: '上午好，满满的正能量！',
      icon: '☀️',
      period: '10:00 - 12:00',
    };
  }
  // 12点-14点: 中午好，小憩一会儿~
  if (hour >= 12 && hour < 14) {
    return {
      text: '中午好，小憩一会儿~',
      icon: '☕',
      period: '12:00 - 14:00',
    };
  }
  // 14点-16点: 能力恢复满格继续战斗！
  if (hour >= 14 && hour < 16) {
    return {
      text: '能力恢复满格继续战斗！',
      icon: '⚡',
      period: '14:00 - 16:00',
    };
  }
  // 16点-20点: 劳累一天辛苦啦~ (含18点-20点)
  if (hour >= 16 && hour < 20) {
    return {
      text: '劳累一天辛苦啦~',
      icon: '🍵',
      period: '16:00 - 20:00',
    };
  }
  // 20点-22点 (补充晚间)
  if (hour >= 20 && hour < 22) {
    return {
      text: '劳累一天辛苦啦~',
      icon: '🌟',
      period: '20:00 - 22:00',
    };
  }
  // 22点-4点: 夜深了，注意身体早点休息
  if (hour >= 22 || hour < 4) {
    return {
      text: '夜深了，注意身体早点休息',
      icon: '🌙',
      period: '22:00 - 04:00',
    };
  }
  // 4点-8点 (凌晨至清晨)
  return {
    text: '夜深了，注意身体早点休息',
    icon: '🌙',
    period: '04:00 - 08:00',
  };
};

// 格式化会话列表最后一条消息：群组内聊天仅展示 一个群昵称 + 消息即可
const formatConversationPreview = (session: ChatSession): string => {
  if (!session.lastMessage) return '';
  let msg = session.lastMessage.trim();
  // 去除可能存在的未读条数前缀如 [19条]、[464条]
  msg = msg.replace(/^\[\d+条\]\s*/, '');

  if (session.isGroup) {
    // 群组聊天：仅展示一个群昵称 + 消息
    let sender = (session.lastSender || '').trim();

    if (sender) {
      // 避免消息正文开头已携带发送者昵称而产生重复昵称（如“李斌斌：李斌斌: ...”）
      const escapedSender = sender.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const senderRegex = new RegExp(`^${escapedSender}[:：]\\s*`, 'i');
      if (senderRegex.test(msg)) {
        msg = msg.replace(senderRegex, '');
      }
      return `${sender}: ${msg}`;
    }

    // 若未显式记录 lastSender，但消息开头自带昵称前缀，则规范保留单个群昵称
    const genericMatch = msg.match(/^([^:：\s]{1,12})[:：]\s*(.*)$/);
    if (genericMatch) {
      return `${genericMatch[1]}: ${genericMatch[2]}`;
    }

    return msg;
  }

  // 非群聊（单聊/系统指令通知）：不重复追加昵称，直接展示内容
  if (session.lastSender) {
    const escapedSender = session.lastSender.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const senderRegex = new RegExp(`^${escapedSender}[:：]\\s*`, 'i');
    msg = msg.replace(senderRegex, '');
  }
  return msg;
};

export const ConversationList: React.FC<ConversationListProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onToggleMute,
  onTogglePin,
  onToggleHide,
  onToggleNotDisplay,
  onRestoreAllHidden,
  onRestoreAllNotDisplayed,
  onMarkAsRead,
  onMarkAsUnread,
  onClearSession,
  onDeleteSession,
  onNewChat,
  onJoinByLink,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [currentGreeting, setCurrentGreeting] = useState(() => getWarmGreeting());
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    sessionId: string;
  } | null>(null);

  // 定时每分钟刷新当前时段的温馨提示
  useEffect(() => {
    const updateGreeting = () => {
      setCurrentGreeting(getWarmGreeting(new Date()));
    };
    updateGreeting();
    const timer = setInterval(updateGreeting, 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate counts
  const hiddenCount = sessions.filter((s) => s.isHidden).length;
  const notDisplayedCount = sessions.filter((s) => s.isNotDisplayed).length;

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    // Hidden & Not displayed logic:
    if (filterTab === 'hidden') {
      return s.isHidden === true;
    }
    if (filterTab === 'not_displayed') {
      return s.isNotDisplayed === true;
    }

    // Standard view hides sessions that are explicitly hidden or marked as not displayed
    if (s.isHidden || s.isNotDisplayed) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchMsg = s.lastMessage.toLowerCase().includes(q);
      if (!matchName && !matchMsg) return false;
    }

    // Tab filter
    if (filterTab === 'unread') return s.unreadCount > 0;
    if (filterTab === 'read') return s.unreadCount === 0;
    if (filterTab === 'task' || filterTab === 'tasks') {
      return s.hasTaskDirective || s.isNoticeSession || (s.directives && s.directives.length > 0);
    }
    if (filterTab === 'pinned') return s.isPinned;
    return true;
  });

  // Sort pinned items to the top, then by timestamp
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.timestamp - a.timestamp;
  });

  const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 180),
      y: Math.min(e.clientY, window.innerHeight - 260),
      sessionId,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <div
      className="w-[280px] bg-[#f7fafd] border-r border-[#e2eaf5] flex flex-col h-full select-none shrink-0"
      onClick={closeContextMenu}
    >
      {/* Top Header: Title & Action buttons */}
      <div className="px-3.5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-800" />
          <span className="text-gray-900 font-bold text-sm tracking-tight">消息</span>
          <span className="w-2 h-2 rounded-full bg-[#10b981]" title="在线" />
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* New Chat */}
          <button
            id="btn-create-new-chat"
            onClick={() => setIsCreateGroupModalOpen(true)}
            className="w-5 h-5 rounded-md bg-[#2979ff] hover:bg-[#1e6bf0] text-white flex items-center justify-center transition-colors shadow-2xs active:scale-95 cursor-pointer"
            title="创建群组"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-1.5">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
          <input
            id="search-conversations-input"
            type="text"
            placeholder="搜索群聊和聊天记录"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-gray-800 placeholder-gray-400 text-[11px] rounded-lg pl-8 pr-3 py-1.5 transition-all outline-hidden border border-slate-200/80 focus:border-[#2979ff] shadow-2xs leading-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 温馨时段提示语 Banner */}
      <div className="px-3 pt-1 pb-1 space-y-1">
        <div
          id="time-based-greeting-banner"
          className="w-[calc(100%-8px)] mx-auto bg-transparent px-1 py-0.5 flex items-center gap-1.5"
        >
          <span className="text-xs select-none shrink-0 opacity-80">{currentGreeting.icon}</span>
          <span className="text-[11px] text-slate-500 font-normal truncate">
            {currentGreeting.text}
          </span>
        </div>

        {/* Optional secondary pills for hidden or not displayed */}
        {(hiddenCount > 0 || notDisplayedCount > 0) && (
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pt-0.5">
            {filterTab !== 'all' && (
              <button
                onClick={() => setFilterTab('all')}
                className="px-2 py-1 text-[11px] rounded-lg font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer shrink-0"
              >
                返回全部
              </button>
            )}
            {hiddenCount > 0 && (
              <button
                id="filter-tab-hidden"
                onClick={() => setFilterTab(filterTab === 'hidden' ? 'all' : 'hidden')}
                className={`px-2 py-1 text-[11px] rounded-lg font-medium transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                  filterTab === 'hidden'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
                title="查看已隐藏的隐私会话"
              >
                <EyeOff className="w-2.5 h-2.5" />
                <span>已隐藏 ({hiddenCount})</span>
              </button>
            )}

            {notDisplayedCount > 0 && (
              <button
                id="filter-tab-not-displayed"
                onClick={() => setFilterTab(filterTab === 'not_displayed' ? 'all' : 'not_displayed')}
                className={`px-2 py-1 text-[11px] rounded-lg font-medium transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                  filterTab === 'not_displayed'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
                title="查看不显示会话"
              >
                <span>不显示 ({notDisplayedCount})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Special State Notice Banner */}
      {filterTab === 'hidden' && (
        <div className="mx-2 mb-1 p-2 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between text-[10px] text-purple-800">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>已隐藏会话专区 ({hiddenCount})</span>
          </div>
          {onRestoreAllHidden && (
            <button
              onClick={onRestoreAllHidden}
              className="text-purple-600 hover:underline font-bold cursor-pointer"
            >
              一键恢复
            </button>
          )}
        </div>
      )}

      {filterTab === 'not_displayed' && (
        <div className="mx-2 mb-1 p-2 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between text-[10px] text-amber-800">
          <div className="flex items-center gap-1">
            <Archive className="w-3 h-3" />
            <span>不显示的会话 ({notDisplayedCount})</span>
          </div>
          {onRestoreAllNotDisplayed && (
            <button
              onClick={onRestoreAllNotDisplayed}
              className="text-amber-600 hover:underline font-bold cursor-pointer"
            >
              全部恢复
            </button>
          )}
        </div>
      )}

      {/* Conversation List Items */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 custom-scrollbar">
        {sortedSessions.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs flex flex-col items-center gap-2">
            <MessageSquare className="w-8 h-8 opacity-40 text-gray-400" />
            <span>
              {filterTab === 'hidden'
                ? '暂无已隐藏的会话'
                : filterTab === 'not_displayed'
                ? '暂无不显示会话'
                : '无相关消息'}
            </span>
          </div>
        ) : (
          sortedSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const isPinned = session.isPinned;
            const isNotice = session.isNoticeSession;

            return (
              <div
                key={session.id}
                id={`conversation-item-${session.id}`}
                onClick={() => onSelectSession(session.id)}
                onContextMenu={(e) => handleContextMenu(e, session.id)}
                className={`relative group flex items-start gap-2.5 p-2 rounded-[2px] cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#cde2f7]'
                    : isPinned
                    ? 'bg-[#e2ebf7] hover:bg-[#d7e4f3]'
                    : 'hover:bg-white/80'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <GroupAvatar session={session} size="md" />

                  {/* Unread badge on avatar */}
                  {session.unreadCount > 0 && !session.isMuted && (
                    <span className="absolute -top-1 -right-1 bg-[#ff3b30] text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center shadow-2xs leading-tight z-10">
                      {session.unreadCount > 99 ? '99+' : session.unreadCount}
                    </span>
                  )}

                  {/* Muted unread dot */}
                  {session.unreadCount > 0 && session.isMuted && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gray-400 border-2 border-white rounded-full shadow-2xs z-10"
                      title={`${session.unreadCount}条未读（免打扰）`}
                    />
                  )}
                </div>

                {/* Info Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs truncate font-bold leading-tight text-gray-900">
                        {session.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-gray-400 font-normal">
                        {session.lastTime}
                      </span>
                      {isPinned && (
                        <Pin className="w-2.5 h-2.5 text-[#2979ff] fill-[#2979ff]/20 shrink-0" title="置顶" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[11px] text-gray-500 truncate leading-tight flex items-center gap-1 min-w-0">
                      {/* Draft indicator */}
                      {session.draft ? (
                        <>
                          <span className="text-red-500 font-bold shrink-0">[草稿]</span>
                          <span className="truncate">{session.draft}</span>
                        </>
                      ) : (
                        <span className="truncate">
                          {formatConversationPreview(session)}
                        </span>
                      )}
                    </p>

                    {/* Right status area: Mute Icon */}
                    {session.isMuted && (
                      <div
                        title="消息免打扰已开启"
                        className="text-gray-400 shrink-0 ml-1"
                      >
                        <BellOff className="w-3 h-3 stroke-[2]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreateGroup={(groupName) => {
          onNewChat(groupName);
          setIsCreateGroupModalOpen(false);
        }}
      />

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200/90 py-1.5 w-40 text-xs text-gray-700 font-medium animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const current = sessions.find((s) => s.id === contextMenu.sessionId);
            if (!current) return null;

            return (
              <>
                {/* 1. 不显示 */}
                <button
                  id="ctx-toggle-not-display"
                  onClick={() => {
                    onToggleNotDisplay?.(current.id);
                    closeContextMenu();
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                  <span>不显示</span>
                </button>

                {/* 2. 消息免打扰（如果已为消息免打扰显示新消息提醒） */}
                <button
                  id="ctx-toggle-mute"
                  onClick={() => {
                    onToggleMute(current.id);
                    closeContextMenu();
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {current.isMuted ? (
                    <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <BellOff className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>{current.isMuted ? '新消息提醒' : '消息免打扰'}</span>
                </button>

                {/* 3. 置顶（取消置顶） */}
                <button
                  id="ctx-toggle-pin"
                  onClick={() => {
                    onTogglePin(current.id);
                    closeContextMenu();
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Pin className="w-3.5 h-3.5 text-blue-500" />
                  <span>{current.isPinned ? '取消置顶' : '置顶'}</span>
                </button>

                <div className="h-px bg-gray-100 my-1" />

                {/* 4. 删除 */}
                <button
                  id="ctx-delete-session"
                  onClick={() => {
                    if (onDeleteSession) {
                      onDeleteSession(current.id);
                    } else {
                      onClearSession(current.id);
                    }
                    closeContextMenu();
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>删除</span>
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
