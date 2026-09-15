import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  ChevronDown,
  Search,
  Calendar,
  User,
  RotateCcw,
  Check,
} from 'lucide-react';
import { ChatSession, ChatMessage, UserMember } from '../types/chat';

interface ChatHistoryDrawerProps {
  session: ChatSession;
  messages: ChatMessage[];
  onClose: () => void;
  onJumpToMessage?: (messageId: string) => void;
}

export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  session,
  messages,
  onClose,
  onJumpToMessage,
}) => {
  const [selectedSenderId, setSelectedSenderId] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const [isSenderDropdownOpen, setIsSenderDropdownOpen] = useState<boolean>(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState<boolean>(false);

  const senderDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        senderDropdownRef.current &&
        !senderDropdownRef.current.contains(e.target as Node)
      ) {
        setIsSenderDropdownOpen(false);
      }
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Collect all unique senders from session members and message history
  const senderOptions = useMemo(() => {
    const membersMap = new Map<string, { id: string; name: string; avatar: string }>();

    // Add session members
    if (session.members) {
      session.members.forEach((m) => {
        membersMap.set(m.id, { id: m.id, name: m.name, avatar: m.avatar });
      });
    }

    // Add any senders who sent messages in this session
    messages.forEach((msg) => {
      if (msg.senderId && !membersMap.has(msg.senderId)) {
        membersMap.set(msg.senderId, {
          id: msg.senderId,
          name: msg.senderName,
          avatar: msg.senderAvatar,
        });
      }
    });

    return Array.from(membersMap.values());
  }, [session.members, messages]);

  // Available date filters
  const dateOptions = [
    { value: 'all', label: '全部日期' },
    { value: 'today', label: '今天' },
    { value: 'yesterday', label: '昨天' },
    { value: 'last7days', label: '近7天' },
    { value: 'last30days', label: '近30天' },
  ];

  // Helper to format date string from timestamp
  const getMessageDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Filter messages
  const filteredMessages = useMemo(() => {
    const now = new Date();
    const todayStr = getMessageDate(now.getTime());
    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = getMessageDate(yesterdayDate.getTime());
    const sevenDaysAgoTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgoTime = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    return messages.filter((msg) => {
      // Exclude recalled messages
      if (msg.isRecalled) return false;

      // Sender filter
      if (selectedSenderId !== 'all') {
        const matchesSenderId = msg.senderId === selectedSenderId;
        const matchesSenderName =
          senderOptions.find((s) => s.id === selectedSenderId)?.name === msg.senderName;
        if (!matchesSenderId && !matchesSenderName) return false;
      }

      // Date filter
      if (selectedDateFilter !== 'all') {
        const msgTime = msg.timestamp || Date.now();
        const msgDateStr = getMessageDate(msgTime);

        if (selectedDateFilter === 'today' && msgDateStr !== todayStr) {
          return false;
        }
        if (selectedDateFilter === 'yesterday' && msgDateStr !== yesterdayStr) {
          return false;
        }
        if (selectedDateFilter === 'last7days' && msgTime < sevenDaysAgoTime) {
          return false;
        }
        if (selectedDateFilter === 'last30days' && msgTime < thirtyDaysAgoTime) {
          return false;
        }
      }

      // Keyword search
      if (searchKeyword.trim()) {
        const query = searchKeyword.trim().toLowerCase();
        const contentText = (msg.content || '').toLowerCase();
        const senderText = (msg.senderName || '').toLowerCase();
        const voiceText = (msg.voiceData?.transcription || '').toLowerCase();
        const cardTitle = (
          msg.pushCardData?.title ||
          msg.taskCardData?.title ||
          msg.directiveData?.title ||
          ''
        ).toLowerCase();

        if (
          !contentText.includes(query) &&
          !senderText.includes(query) &&
          !cardTitle.includes(query) &&
          !voiceText.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [messages, selectedSenderId, selectedDateFilter, searchKeyword, senderOptions]);

  const selectedSenderObj = senderOptions.find((s) => s.id === selectedSenderId);
  const selectedDateObj = dateOptions.find((d) => d.value === selectedDateFilter);

  const hasActiveFilters =
    selectedSenderId !== 'all' || selectedDateFilter !== 'all' || searchKeyword.trim() !== '';

  const handleResetFilters = () => {
    setSelectedSenderId('all');
    setSelectedDateFilter('all');
    setSearchKeyword('');
  };

  return (
    <div
      id="chat-history-drawer"
      className="w-[310px] bg-[#fcfcfd] border-l border-gray-200/90 flex flex-col h-full select-none shrink-0 shadow-2xl z-30 justify-between text-gray-800"
    >
      {/* Top Header matching image.png */}
      <div className="p-3.5 pb-3 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-gray-900 tracking-tight">历史消息</span>
          {hasActiveFilters && (
            <span className="text-[11px] text-gray-400">({filteredMessages.length})</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          title="关闭历史消息"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Section matching image.png */}
      <div className="p-3 bg-white border-b border-gray-100/90 space-y-2 shrink-0">
        {/* Dropdowns Row: 发送人 & 日期 */}
        <div className="grid grid-cols-2 gap-2">
          {/* Sender Dropdown */}
          <div className="relative" ref={senderDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsSenderDropdownOpen((prev) => !prev);
                setIsDateDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs font-normal transition-all cursor-pointer ${
                selectedSenderId !== 'all'
                  ? 'border-blue-300 bg-blue-50/60 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
              }`}
            >
              <span className="truncate">
                {selectedSenderId === 'all' ? '发送人' : selectedSenderObj?.name || '发送人'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${
                  isSenderDropdownOpen ? 'rotate-180 text-blue-500' : ''
                }`}
              />
            </button>

            {/* Sender Dropdown Menu */}
            {isSenderDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 max-h-56 overflow-y-auto custom-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSenderId('all');
                    setIsSenderDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedSenderId === 'all' ? 'text-blue-600 font-medium bg-blue-50/40' : 'text-gray-700'
                  }`}
                >
                  <span>全部发送人</span>
                  {selectedSenderId === 'all' && <Check className="w-3 h-3 text-blue-600" />}
                </button>
                <div className="border-t border-gray-100 my-1" />
                {senderOptions.map((sender) => (
                  <button
                    key={sender.id}
                    type="button"
                    onClick={() => {
                      setSelectedSenderId(sender.id);
                      setIsSenderDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedSenderId === sender.id
                        ? 'text-blue-600 font-medium bg-blue-50/40'
                        : 'text-gray-700'
                    }`}
                  >
                    <img
                      src={sender.avatar}
                      alt={sender.name}
                      className="w-4 h-4 rounded-full object-cover shrink-0"
                    />
                    <span className="truncate flex-1">{sender.name}</span>
                    {selectedSenderId === sender.id && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Dropdown */}
          <div className="relative" ref={dateDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsDateDropdownOpen((prev) => !prev);
                setIsSenderDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs font-normal transition-all cursor-pointer ${
                selectedDateFilter !== 'all'
                  ? 'border-blue-300 bg-blue-50/60 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
              }`}
            >
              <span className="truncate">
                {selectedDateFilter === 'all' ? '日期' : selectedDateObj?.label || '日期'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${
                  isDateDropdownOpen ? 'rotate-180 text-blue-500' : ''
                }`}
              />
            </button>

            {/* Date Dropdown Menu */}
            {isDateDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 overflow-hidden">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSelectedDateFilter(opt.value);
                      setIsDateDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedDateFilter === opt.value
                        ? 'text-blue-600 font-medium bg-blue-50/40'
                        : 'text-gray-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedDateFilter === opt.value && <Check className="w-3 h-3 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search keyword input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索消息内容..."
            className="w-full pl-8 pr-7 py-1.5 bg-gray-50/80 border border-gray-200 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Active filter tags row */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500">
            <span>已筛选 {filteredMessages.length} 条</span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>重置条件</span>
            </button>
          </div>
        )}
      </div>

      {/* Message List or Empty State */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {filteredMessages.length === 0 ? (
          /* Empty state matching image.png */
          <div className="h-full flex flex-col items-center justify-center text-center py-16 select-none">
            {/* Cute basket illustration matching image.png */}
            <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
              <svg
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full opacity-85 drop-shadow-sm"
              >
                {/* Background soft glow */}
                <circle cx="60" cy="65" r="45" fill="#f1f5f9" />
                {/* Paper sheet behind */}
                <rect x="36" y="24" width="34" height="42" rx="3" fill="#e2e8f0" transform="rotate(-6 36 24)" />
                <rect x="48" y="22" width="36" height="44" rx="3" fill="#cbd5e1" transform="rotate(4 48 22)" />
                <rect x="42" y="26" width="36" height="42" rx="3" fill="#f8fafc" />
                <line x1="48" y1="36" x2="72" y2="36" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                <line x1="48" y1="42" x2="66" y2="42" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                <line x1="48" y1="48" x2="70" y2="48" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

                {/* Storage Basket */}
                <path
                  d="M26 62C26 59.7909 27.7909 58 30 58H90C92.2091 58 94 59.7909 94 62L88 94C87.5 96.5 85 98 82 98H38C35 98 32.5 96.5 32 94L26 62Z"
                  fill="#e2e8f0"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                />
                {/* Basket Rim */}
                <rect x="24" y="55" width="72" height="6" rx="3" fill="#cbd5e1" />
                {/* Basket Grid Lines */}
                <line x1="38" y1="62" x2="42" y2="95" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
                <line x1="50" y1="62" x2="52" y2="95" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
                <line x1="62" y1="62" x2="62" y2="95" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
                <line x1="74" y1="62" x2="72" y2="95" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
                <line x1="86" y1="62" x2="82" y2="95" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />

                {/* Cute puppy face in the basket */}
                <ellipse cx="60" cy="50" rx="13" ry="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                {/* Left Ear */}
                <path d="M48 42C46 38 43 43 45 49C46 51 49 50 48 42Z" fill="#94a3b8" />
                {/* Right Ear */}
                <path d="M72 42C74 38 77 43 75 49C74 51 71 50 72 42Z" fill="#94a3b8" />
                {/* Eyes */}
                <circle cx="55" cy="49" r="1.5" fill="#334155" />
                <circle cx="65" cy="49" r="1.5" fill="#334155" />
                {/* Nose & Mouth */}
                <ellipse cx="60" cy="53" rx="1.5" ry="1" fill="#334155" />
                {/* Floating sparkle/stars */}
                <path d="M96 40L97 43L100 44L97 45L96 48L95 45L92 44L95 43L96 40Z" fill="#cbd5e1" />
                <circle cx="28" cy="45" r="2" fill="#cbd5e1" />
                <circle cx="92" cy="78" r="1.5" fill="#94a3b8" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-400 tracking-wide">暂无数据</p>
            {hasActiveFilters && (
              <p className="text-[11px] text-gray-400 mt-1">未匹配到符合条件的历史消息</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => onJumpToMessage?.(msg.id)}
                className="p-2.5 bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-xs transition-all cursor-pointer group"
              >
                {/* Sender info & Time */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-5 h-5 rounded-full object-cover bg-gray-200 shrink-0"
                    />
                    <span className="text-xs font-semibold text-gray-800 truncate">
                      {msg.senderName}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono shrink-0">
                    {msg.time}
                  </span>
                </div>

                {/* Message Content Preview */}
                <div className="text-xs text-gray-600 leading-relaxed break-words line-clamp-3 select-text pl-6.5">
                  {msg.type === 'voice' ? (
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-[11px]">
                        <span>[语音]</span>
                        <span className="font-mono text-gray-700">{msg.voiceData?.duration || 10}"</span>
                      </div>
                      {msg.voiceData?.transcription && (
                        <div className="text-[11.5px] text-gray-600 pl-1 border-l-2 border-blue-300 italic">
                          转文字: {msg.voiceData.transcription}
                        </div>
                      )}
                    </div>
                  ) : (
                    msg.content ||
                    msg.pushCardData?.title ||
                    msg.directiveData?.title ||
                    msg.taskCardData?.title ||
                    '[多媒体消息]'
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
