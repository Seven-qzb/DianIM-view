import React, { useState } from 'react';
import { ChatConversation } from '../types';
import { 
  Search, Scan, Plus, Users, BellOff, Pin, 
  MessageSquarePlus, X, ClipboardCheck, Megaphone 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TaskStreamPage } from './TaskStreamPage';

interface MessagesTabProps {
  conversations: ChatConversation[];
  onSelectConversation: (conv: ChatConversation) => void;
  onCreateNewChat: (name: string, isGroup: boolean, memberNames: string[]) => void;
  tasksUnreadCount?: number;
  onClearTasksUnread?: () => void;
  instructionsUnreadCount?: number;
  onClearInstructionsUnread?: () => void;
}

// WeChat / DianDianMiXin style multi-avatar composite component
const CompositeAvatar: React.FC<{
  images?: string[];
  singleImage?: string;
  name: string;
  isGroup: boolean;
}> = ({ images, singleImage, name, isGroup }) => {
  if (!isGroup || !images || images.length === 0) {
    return (
      <img
        src={singleImage || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'}
        alt={name}
        className="w-full h-full object-cover rounded-xl"
      />
    );
  }

  const count = Math.min(images.length, 9);
  const displayImages = images.slice(0, count);

  // 2 items: 2 columns
  if (count === 2) {
    return (
      <div className="w-full h-full bg-[#E5E9F0] p-[2px] rounded-xl grid grid-cols-2 gap-[1.5px] items-center justify-center overflow-hidden">
        {displayImages.map((src, i) => (
          <img key={i} src={src} alt="" className="w-full h-full object-cover rounded-xs" />
        ))}
      </div>
    );
  }

  // 3 items: 1 top center, 2 bottom
  if (count === 3) {
    return (
      <div className="w-full h-full bg-[#E5E9F0] p-[2px] rounded-xl flex flex-col items-center justify-center gap-[1.5px] overflow-hidden">
        <div className="w-1/2 h-[48%] overflow-hidden rounded-xs">
          <img src={displayImages[0]} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="w-full h-[48%] grid grid-cols-2 gap-[1.5px]">
          <img src={displayImages[1]} alt="" className="w-full h-full object-cover rounded-xs" />
          <img src={displayImages[2]} alt="" className="w-full h-full object-cover rounded-xs" />
        </div>
      </div>
    );
  }

  // 4 items: 2x2
  if (count === 4) {
    return (
      <div className="w-full h-full bg-[#E5E9F0] p-[2px] rounded-xl grid grid-cols-2 grid-rows-2 gap-[1.5px] overflow-hidden">
        {displayImages.map((src, i) => (
          <img key={i} src={src} alt="" className="w-full h-full object-cover rounded-xs" />
        ))}
      </div>
    );
  }

  // 5~9 items: 3x3
  return (
    <div className="w-full h-full bg-[#E5E9F0] p-[2px] rounded-xl grid grid-cols-3 grid-rows-3 gap-[1px] overflow-hidden">
      {displayImages.map((src, i) => (
        <img key={i} src={src} alt="" className="w-full h-full object-cover rounded-xs" />
      ))}
      {Array.from({ length: 9 - count }).map((_, idx) => (
        <div key={`empty-${idx}`} className="bg-[#D8DEE9]" />
      ))}
    </div>
  );
};

export const MessagesTab: React.FC<MessagesTabProps> = ({
  conversations,
  onSelectConversation,
  onCreateNewChat,
  tasksUnreadCount = 2,
  onClearTasksUnread,
  instructionsUnreadCount = 1,
  onClearInstructionsUnread,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatIsGroup, setNewChatIsGroup] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['戚中彪', '史乐乐', '陈工', '马言言']);

  // Special System Task Streams (From User's Image 1 & 2)
  const [activeSpecialPage, setActiveSpecialPage] = useState<'tasks' | 'instructions' | null>(null);
  const [activeHoveredItem, setActiveHoveredItem] = useState<'tasks' | 'instructions' | null>('tasks');

  // Sort: pinned first, then preserve original order
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const q = searchQuery.toLowerCase().trim();

  // Search filter for special items
  const showMyTasksItem = !q || '我的任务'.includes(q) || '自动化测试任务'.includes(q) || '任务'.includes(q);
  const showInstructionItem = !q || '指令流转'.includes(q) || '舆情处置'.includes(q) || '西安长安区墓地咨询'.includes(q) || '指令'.includes(q);

  const filteredConversations = sortedConversations.filter((c) =>
    c.name.toLowerCase().includes(q) ||
    c.lastMessage.toLowerCase().includes(q) ||
    (c.draft && c.draft.toLowerCase().includes(q))
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName.trim()) return;
    onCreateNewChat(newChatName.trim(), newChatIsGroup, selectedMembers);
    setNewChatName('');
    setShowCreateModal(false);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-[#F7F8FA] text-slate-900 select-none font-sans no-scrollbar">
      {/* Top Mobile Header Matching Figure 4 */}
      <header className="pt-3 pb-2.5 px-4 sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-lg text-slate-900 tracking-tight">
              欢迎来到点点密信！
            </h1>
            <span className="bg-[#0058BD] text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
              正式版
            </span>
          </div>

          {/* Right Action Icons: Scan and Add/New Chat */}
          <div className="flex items-center gap-2 text-slate-700">
            <button
              id="scan-code-btn"
              type="button"
              onClick={() => setShowScanModal(true)}
              className="p-1.5 text-slate-700 hover:text-[#0058BD] hover:bg-slate-100 transition-colors rounded-lg active:scale-95"
              title="扫一扫"
            >
              <Scan className="w-5 h-5 stroke-[2]" />
            </button>

            <button
              id="create-new-chat-btn"
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="w-6 h-6 rounded-full bg-[#0058BD] text-white flex items-center justify-center hover:bg-[#004CB3] transition-all shadow-xs active:scale-95"
              title="发起会话"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Search Bar Matching Figure 4: subtle grey rounded bar with Search placeholder */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="conversation-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索"
            className="w-full bg-[#ECEFF2] rounded-xl py-2 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 outline-none border border-transparent focus:border-[#0058BD] focus:bg-white transition-all font-normal"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Conversation List Section */}
      <main className="flex-1 bg-white">
        <ul className="divide-y divide-slate-100">
          {/* 1. 我的任务 (Matching User Image 1) */}
          {showMyTasksItem && (
            <li
              id="conversation-item-my-tasks"
              onClick={() => {
                setActiveHoveredItem('tasks');
                setActiveSpecialPage('tasks');
                onClearTasksUnread?.();
              }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors active:bg-[#DDE9FD] ${
                activeHoveredItem === 'tasks' ? 'bg-[#EAF2FE]' : 'bg-white hover:bg-slate-50'
              }`}
            >
              {/* Blue icon container with white ClipboardCheck */}
              <div className="relative w-12 h-12 shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#2B85FF] flex items-center justify-center text-white shadow-2xs">
                  <ClipboardCheck className="w-6 h-6 stroke-[2.2] text-white" />
                </div>

                {/* Unread badge */}
                {tasksUnreadCount > 0 && (
                  <span
                    id="unread-badge-my-tasks"
                    className="absolute -top-1.5 -right-1.5 bg-[#FF3B30] text-white text-[11px] font-bold min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-xs z-20 pointer-events-none"
                  >
                    {tasksUnreadCount}
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex justify-between items-baseline mb-1">
                  <h2 className="font-semibold text-sm text-slate-900 truncate">
                    我的任务
                  </h2>
                  <span className="text-[11px] text-slate-400 shrink-0 font-normal">
                    16:52
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  自动化测试任务
                </p>
              </div>
            </li>
          )}

          {/* 2. 指令流转 (Matching User Image 1) */}
          {showInstructionItem && (
            <li
              id="conversation-item-instruction-flow"
              onClick={() => {
                setActiveHoveredItem('instructions');
                setActiveSpecialPage('instructions');
                onClearInstructionsUnread?.();
              }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors active:bg-[#DDE9FD] ${
                activeHoveredItem === 'instructions' ? 'bg-[#EAF2FE]' : 'bg-white hover:bg-slate-50'
              }`}
            >
              {/* Blue icon container with white Megaphone */}
              <div className="relative w-12 h-12 shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#2B85FF] flex items-center justify-center text-white shadow-2xs">
                  <Megaphone className="w-6 h-6 stroke-[2.2] text-white" />
                </div>

                {/* Unread badge */}
                {instructionsUnreadCount > 0 && (
                  <span
                    id="unread-badge-instructions"
                    className="absolute -top-1.5 -right-1.5 bg-[#FF3B30] text-white text-[11px] font-bold min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-xs z-20 pointer-events-none"
                  >
                    {instructionsUnreadCount}
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex justify-between items-baseline mb-1">
                  <h2 className="font-semibold text-sm text-slate-900 truncate">
                    指令流转
                  </h2>
                  <span className="text-[11px] text-slate-400 shrink-0 font-normal">
                    14:52
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  舆情处置：西安长安区墓地咨询 墓...
                </p>
              </div>
            </li>
          )}

          {filteredConversations.length === 0 && !showMyTasksItem && !showInstructionItem ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center">
              <MessageSquarePlus className="w-12 h-12 text-slate-300 mb-2 stroke-[1.5]" />
              <p className="text-xs">暂无匹配的会话</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const hasDraft = !!conv.draft && conv.draft.trim().length > 0;

              return (
                <li
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors active:bg-slate-100 ${
                    conv.isPinned ? 'bg-[#F2F4F7]' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  {/* Composite / Single Avatar Container */}
                  <div className="relative w-12 h-12 shrink-0">
                    <div className="w-full h-full rounded-xl overflow-hidden shadow-2xs border border-slate-200/80">
                      <CompositeAvatar
                        images={conv.avatarGrid}
                        singleImage={conv.avatarSingle}
                        name={conv.name}
                        isGroup={conv.isGroup}
                      />
                    </div>

                    {/* Red Badge for Unread Messages: Red circle with white number, fully visible on top-right corner */}
                    {conv.unreadCount > 0 && (
                      <span
                        id={`unread-badge-${conv.id}`}
                        className="absolute -top-1.5 -right-1.5 bg-[#FF3B30] text-white text-[11px] font-bold min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-xs z-20 pointer-events-none"
                      >
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Conversation Title & Content Snippet */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        {conv.isPinned && (
                          <Pin className="w-3 h-3 text-[#0058BD] fill-[#0058BD] shrink-0" />
                        )}
                        <h2 className="font-semibold text-sm text-slate-900 truncate">
                          {conv.name}
                        </h2>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 font-normal">
                        {conv.lastTime}
                      </span>
                    </div>

                    {/* Message Preview or Draft Display */}
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs text-slate-500 truncate flex-1 min-w-0">
                        {hasDraft ? (
                          <>
                            <span className="text-[#BA1A1A] font-semibold mr-1">
                              [草稿]
                            </span>
                            <span className="text-slate-600">{conv.draft}</span>
                          </>
                        ) : (
                          <>
                            {conv.lastSender && (
                              <span className="text-slate-600 font-medium">
                                {conv.lastSender}：
                              </span>
                            )}
                            <span>{conv.lastMessage}</span>
                          </>
                        )}
                      </p>

                      {/* Muted Icon */}
                      {conv.isMuted && (
                        <BellOff className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                      )}
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </main>

      {/* Create New Group/Chat Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="bg-white rounded-t-3xl sm:rounded-2xl max-w-[430px] w-full p-6 shadow-xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">发起加密群组协同</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    群组名称 / 会话标题
                  </label>
                  <input
                    type="text"
                    required
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    placeholder="例如：网络应急防线突击组"
                    className="w-full bg-slate-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none border border-slate-200 focus:border-[#0058BD] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    协同类型
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewChatIsGroup(true)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                        newChatIsGroup
                          ? 'border-[#0058BD] bg-blue-50 text-[#0058BD] font-bold'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>机构工作群聊</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewChatIsGroup(false)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                        !newChatIsGroup
                          ? 'border-[#0058BD] bg-blue-50 text-[#0058BD] font-bold'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>单人加密私信</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    初始协同成员
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['戚中彪 (我)', '史乐乐', '陈工', '马言言', '马宸卓', '韩浩'].map((name) => {
                      const cleanName = name.replace(' (我)', '');
                      const isSelected = selectedMembers.includes(cleanName);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedMembers(selectedMembers.filter((n) => n !== cleanName));
                            } else {
                              setSelectedMembers([...selectedMembers, cleanName]);
                            }
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-blue-50 text-[#0058BD] border-blue-300 font-medium'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#0058BD] hover:bg-[#004CB3] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    立即创建加密群组
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Scan Modal */}
      <AnimatePresence>
        {showScanModal && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-[340px] w-full p-6 shadow-2xl border border-slate-200 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0058BD] flex items-center justify-center mx-auto mb-3">
                <Scan className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">扫描入群二维码</h3>
              <p className="text-xs text-slate-500 mb-4">对准机构安全入群二维码或密信名片即可自动识别添加</p>
              
              <div className="w-48 h-48 mx-auto rounded-xl border-2 border-dashed border-[#0058BD] flex items-center justify-center bg-slate-50 relative overflow-hidden mb-4">
                <div className="w-full h-0.5 bg-[#0058BD] absolute top-1/2 left-0 right-0 animate-pulse"></div>
                <span className="text-xs text-slate-400">摄像头取景中...</span>
              </div>

              <button
                onClick={() => setShowScanModal(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                关闭
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task & Instruction Stream Template Page (Matching User Image 2) */}
      <AnimatePresence>
        {activeSpecialPage && (
          <TaskStreamPage
            type={activeSpecialPage}
            title={activeSpecialPage === 'tasks' ? '我的任务' : '指令流转'}
            currentUserName="戚中彪"
            onClose={() => setActiveSpecialPage(null)}
            onNavigateToGroupChat={(groupName) => {
              const found = conversations.find(
                (c) => c.name.includes(groupName) || groupName.includes(c.name)
              );
              if (found) {
                onSelectConversation(found);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
