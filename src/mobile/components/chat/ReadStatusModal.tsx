import React, { useState } from 'react';
import { ChatMessage, GroupMember } from '../../types';
import { ChevronLeft, Bell, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { SecurityWatermark } from '../SecurityWatermark';
import { AVATARS } from '../../data/avatars';

interface ReadStatusModalProps {
  message: ChatMessage;
  groupMembers: GroupMember[];
  onClose: () => void;
  onRemindUnread?: () => void;
}

export const ReadStatusModal: React.FC<ReadStatusModalProps> = ({
  message,
  groupMembers,
  onClose,
  onRemindUnread,
}) => {
  // Default to 'read' tab if there are read members (Figure 2 shows "6人已读" tab active)
  const [activeTab, setActiveTab] = useState<'read' | 'unread'>('read');
  const [reminded, setReminded] = useState(false);

  // Derive read and unread lists
  const defaultReadNames = ['戚中彪', '何坤', '韩浩', '吴鑫', '马宸卓', '马俊'];
  const defaultUnreadNames = [
    '史乐乐', '马言言', '孟雨希', '李晓飞', '黄洋', '杨美丽', 
    '任云辉', '刘建明', '杨羽', '贾珂', '陈乾喜'
  ];

  const readNames = message.readMembers && message.readMembers.length > 0 
    ? message.readMembers 
    : defaultReadNames;

  const unreadNames = message.unreadMembers && message.unreadMembers.length > 0
    ? message.unreadMembers
    : defaultUnreadNames;

  const readMembersList = readNames.map((name) => {
    const found = groupMembers.find((m) => m.name === name);
    return {
      name,
      avatar: found?.avatar || (AVATARS as any)[name] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isOwner: found?.role === 'owner' || name === '韩浩',
      readTime: '09月08日 09:27',
      department: found?.department || '研发中心',
    };
  });

  const unreadMembersList = unreadNames.map((name) => {
    const found = groupMembers.find((m) => m.name === name);
    return {
      name,
      avatar: found?.avatar || (AVATARS as any)[name] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      isOwner: found?.role === 'owner',
      department: found?.department || '研发中心',
    };
  });

  const handleRemind = () => {
    setReminded(true);
    if (onRemindUnread) {
      onRemindUnread();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-[#F7F8FA] flex flex-col w-full max-w-[430px] mx-auto select-none overflow-hidden"
    >
      {/* Background Watermark matching Figure 2 */}
      <SecurityWatermark name="戚中彪" timestamp="2026/09/08 09:34" />

      {/* Header Matching Figure 2: Back button + Title "消息已读详情" */}
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 -ml-1 text-slate-800 hover:bg-slate-100 rounded-lg transition-colors active:scale-95 cursor-pointer"
          title="返回"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2]" />
        </button>

        <h1 className="font-bold text-[16px] text-slate-900 tracking-tight">
          消息已读详情
        </h1>

        <div className="w-8" />
      </header>

      {/* Two Tabs Matching Figure 2: "6人已读" | "11人未读" */}
      <div className="bg-white border-b border-slate-200/80 flex items-center z-20 shrink-0">
        {/* Read Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('read')}
          className="flex-1 py-3 text-center relative cursor-pointer active:bg-slate-50 transition-colors"
        >
          <span className={`text-[14px] ${
            activeTab === 'read' ? 'font-bold text-slate-900' : 'text-slate-500 font-normal'
          }`}>
            {readMembersList.length}人已读
          </span>
          {activeTab === 'read' && (
            <motion.div
              layoutId="readTabUnderline"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] bg-[#0058BD] rounded-full"
            />
          )}
        </button>

        {/* Unread Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('unread')}
          className="flex-1 py-3 text-center relative cursor-pointer active:bg-slate-50 transition-colors"
        >
          <span className={`text-[14px] ${
            activeTab === 'unread' ? 'font-bold text-slate-900' : 'text-slate-500 font-normal'
          }`}>
            {unreadMembersList.length}人未读
          </span>
          {activeTab === 'unread' && (
            <motion.div
              layoutId="readTabUnderline"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] bg-[#0058BD] rounded-full"
            />
          )}
        </button>
      </div>

      {/* Member List Container Matching Figure 2 */}
      <main className="flex-1 overflow-y-auto px-4 py-2 relative z-20 space-y-0.5 divide-y divide-slate-100/80 bg-white">
        {activeTab === 'read' ? (
          readMembersList.map((member, idx) => (
            <div
              key={idx}
              className="py-3 flex items-center justify-between"
            >
              {/* Member Avatar + Name + Optional Role Tag */}
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200/80 shadow-2xs shrink-0"
                />
                <div className="flex items-center">
                  <span className="text-[14px] font-medium text-slate-900">
                    {member.name}
                  </span>
                  {member.isOwner && (
                    <span className="ml-2 text-[10px] font-medium border border-rose-400 text-rose-500 px-1 py-0.2 rounded leading-none">
                      群主
                    </span>
                  )}
                </div>
              </div>

              {/* Timestamp on Right Matching Figure 2: 09月08日 09:27 */}
              <div className="text-xs text-slate-400 font-mono">
                {member.readTime}
              </div>
            </div>
          ))
        ) : (
          unreadMembersList.map((member, idx) => (
            <div
              key={idx}
              className="py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200/80 shadow-2xs shrink-0"
                />
                <div>
                  <div className="flex items-center">
                    <span className="text-[14px] font-medium text-slate-900">
                      {member.name}
                    </span>
                    {member.isOwner && (
                      <span className="ml-2 text-[10px] font-medium border border-rose-400 text-rose-500 px-1 py-0.2 rounded leading-none">
                        群主
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {member.department}
                  </div>
                </div>
              </div>

              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 font-medium">
                未读
              </span>
            </div>
          ))
        )}
      </main>

      {/* Unread Action Footer: 加急提醒未读人员 */}
      {activeTab === 'unread' && unreadMembersList.length > 0 && (
        <footer className="p-4 bg-white border-t border-slate-200/80 z-20 shrink-0">
          <button
            type="button"
            onClick={handleRemind}
            disabled={reminded}
            className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
              reminded
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-[#0058BD] hover:bg-[#004CB3] text-white active:scale-98'
            }`}
          >
            {reminded ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>已发送加急提醒</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                <span>一键加急提醒 ({unreadMembersList.length}人)</span>
              </>
            )}
          </button>
        </footer>
      )}
    </motion.div>
  );
};
