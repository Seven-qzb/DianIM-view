import React, { useState } from 'react';
import { X, Search, Check, Send, Users, User } from 'lucide-react';
import { ChatSession, ChatMessage } from '../types/chat';

interface MessageForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: ChatMessage | null;
  sessions: ChatSession[];
  onConfirmForward: (targetSessionIds: string[], forwardComment?: string) => void;
}

export const MessageForwardModal: React.FC<MessageForwardModalProps> = ({
  isOpen,
  onClose,
  message,
  sessions,
  onConfirmForward,
}) => {
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [forwardComment, setForwardComment] = useState('');

  if (!isOpen || !message) return null;

  const toggleSelect = (sessionId: string) => {
    setSelectedSessionIds((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const filteredSessions = sessions.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirm = () => {
    if (selectedSessionIds.length === 0) return;
    onConfirmForward(selectedSessionIds, forwardComment.trim());
    setSelectedSessionIds([]);
    setForwardComment('');
    onClose();
  };

  // Preview content
  const previewText =
    message.type === 'push_card' && message.pushCardData
      ? `[推送卡片] ${message.pushCardData.title}`
      : message.type === 'directive' && message.directiveData
      ? `[指令待办] ${message.directiveData.title}`
      : message.content || '[图片/文件消息]';

  return (
    <div
      id="message-forward-overlay"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="message-forward-dialog"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">转发消息</h2>
            <p className="text-[11px] text-gray-400">选择要转发到的群聊或联系人</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message preview snippet */}
        <div className="mx-5 my-3 p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-gray-500">
            原消息 · {message.senderName}:
          </span>
          <p className="text-gray-800 line-clamp-2 leading-relaxed">
            {previewText}
          </p>
        </div>

        {/* Search filter */}
        <div className="px-5 mb-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3" />
            <input
              type="text"
              placeholder="搜索联系人或群聊..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:border-[#2979ff] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-5 space-y-1.5 max-h-60 custom-scrollbar">
          {filteredSessions.map((session) => {
            const isSelected = selectedSessionIds.includes(session.id);
            return (
              <div
                key={session.id}
                onClick={() => toggleSelect(session.id)}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50/80 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={session.avatar}
                    alt={session.name}
                    className="w-8 h-8 rounded-lg object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-gray-800 truncate">
                      {session.name}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      {session.isGroup ? (
                        <>
                          <Users className="w-3 h-3 text-blue-500" />
                          <span>群聊 ({session.memberCount || session.members?.length || 1}人)</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 text-emerald-500" />
                          <span>个人会话</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#2979ff] border-[#2979ff] text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional forward note */}
        <div className="px-5 pt-2">
          <input
            type="text"
            placeholder="留言/附加说明（选填）..."
            value={forwardComment}
            onChange={(e) => setForwardComment(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:border-[#2979ff] focus:bg-white"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 mt-2">
          <span className="text-xs text-gray-500">
            已选择 <b className="text-[#2979ff]">{selectedSessionIds.length}</b> 个会话
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              id="btn-confirm-forward"
              onClick={handleConfirm}
              disabled={selectedSessionIds.length === 0}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedSessionIds.length > 0
                  ? 'bg-[#2979ff] hover:bg-[#1e6bf0] text-white shadow-xs cursor-pointer active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3 h-3" />
              <span>确认转发</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
