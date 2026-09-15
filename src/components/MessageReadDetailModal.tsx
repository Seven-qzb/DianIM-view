import React, { useState } from 'react';
import { X, CheckCircle2, Clock, Bell, User, Sparkles } from 'lucide-react';
import { ChatMessage, UserMember } from '../types/chat';

interface MessageReadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: ChatMessage | null;
  readMembers?: { id: string; name: string; avatar: string; time: string; department?: string }[];
  unreadMembers?: { id: string; name: string; avatar: string; department?: string }[];
  onRemindUnread?: (unreadIds: string[]) => void;
}

export const MessageReadDetailModal: React.FC<MessageReadDetailModalProps> = ({
  isOpen,
  onClose,
  message,
  readMembers: customReadMembers,
  unreadMembers: customUnreadMembers,
  onRemindUnread,
}) => {
  const [activeTab, setActiveTab] = useState<'read' | 'unread'>('read');
  const [hasReminded, setHasReminded] = useState(false);

  if (!isOpen) return null;

  // Default mock read members matching screenshot 4
  const defaultReadList = [
    {
      id: 'u_ryh',
      name: '任云辉',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      time: '2026-08-27 17:40',
      department: '研发部',
    },
    {
      id: 'u_wyq',
      name: '汪艳琼',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      time: '2026-08-27 17:39',
      department: '产品部',
    },
    {
      id: 'u_qzb',
      name: '戚中彪',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      time: '2026-08-27 17:39',
      department: '台湾省网信办',
    },
    {
      id: 'u_hk',
      name: '何坤',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
      time: '2026-08-27 17:39',
      department: '研发部',
    },
    {
      id: 'u_wx',
      name: '吴鑫',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      time: '2026-08-27 17:39',
      department: '研发部',
    },
    {
      id: 'u_mcz',
      name: '马宸卓',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
      time: '2026-08-27 17:40',
      department: '研发部',
    },
    {
      id: 'u_mj',
      name: '马俊',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      time: '2026-08-27 17:39',
      department: '技术部',
    },
    {
      id: 'u_sll',
      name: '史乐乐',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      time: '2026-08-27 17:39',
      department: '运营部',
    },
    {
      id: 'u_zl',
      name: '赵力',
      avatar: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=120&auto=format&fit=crop&q=80',
      time: '2026-08-27 17:38',
      department: '研发部',
    },
    {
      id: 'u_hh',
      name: '韩浩',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
      time: '2026-08-27 17:35',
      department: '研发部',
    },
  ];

  const defaultUnreadList = [
    {
      id: 'u_spw',
      name: '孙沛文',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
      department: '值班室',
    },
    {
      id: 'u_lbb',
      name: '李斌斌',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      department: '服务中心',
    },
    {
      id: 'u_tyc',
      name: '唐雨晨',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      department: '外部协同',
    },
    {
      id: 'u_myy',
      name: '马言言',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      department: '数据仓库',
    },
    {
      id: 'u_hsj',
      name: '韩尚君',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
      department: '运维部',
    },
    {
      id: 'u_cg',
      name: '陈工',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&auto=format&fit=crop&q=80',
      department: '研发部',
    },
    {
      id: 'u_mjw',
      name: '马剑',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      department: '技术支持',
    },
  ];

  // Candidate pool
  const allCandidateMembers = [
    ...defaultReadList,
    ...defaultUnreadList.map((u, i) => ({
      ...u,
      time: `2026-08-27 17:${String(Math.max(10, 30 - i)).padStart(2, '0')}`,
    })),
  ];

  let readList = customReadMembers;
  let unreadList = customUnreadMembers;

  if (!readList || !unreadList) {
    let targetReadCount = 10;
    if (message) {
      if (typeof message.readCount === 'number') {
        targetReadCount = message.readCount;
      } else {
        let hash = 0;
        for (let i = 0; i < message.id.length; i++) {
          hash = (hash << 5) - hash + message.id.charCodeAt(i);
          hash |= 0;
        }
        targetReadCount = (Math.abs(hash) % 7) + 3;
      }
    }
    targetReadCount = Math.min(targetReadCount, allCandidateMembers.length);
    readList = allCandidateMembers.slice(0, targetReadCount);
    unreadList = allCandidateMembers.slice(targetReadCount);
  }

  const handleRemindAll = () => {
    setHasReminded(true);
    onRemindUnread?.(unreadList.map((u) => u.id));
    setTimeout(() => {
      setHasReminded(false);
    }, 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden border border-gray-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">消息已读详情</h2>
          <button
            id="btn-close-read-detail-modal"
            onClick={onClose}
            className="w-7 h-7 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs: X人已读 / Y人未读 */}
        <div className="flex items-center border-b border-gray-100 px-5 text-sm font-medium">
          <button
            id="tab-read-members"
            onClick={() => setActiveTab('read')}
            className={`py-3 relative flex-1 text-center transition-colors cursor-pointer ${
              activeTab === 'read'
                ? 'text-[#2979ff] font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>{readList.length}人已读</span>
            {activeTab === 'read' && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#2979ff] rounded-full" />
            )}
          </button>

          <button
            id="tab-unread-members"
            onClick={() => setActiveTab('unread')}
            className={`py-3 relative flex-1 text-center transition-colors cursor-pointer ${
              activeTab === 'unread'
                ? 'text-[#2979ff] font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>{unreadList.length}人未读</span>
            {activeTab === 'unread' && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#2979ff] rounded-full" />
            )}
          </button>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar min-h-[300px] max-h-[420px]">
          {activeTab === 'read' ? (
            readList.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">暂无人已读</div>
            ) : (
              readList.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{user.name}</div>
                      {user.department && (
                        <div className="text-[11px] text-gray-400">{user.department}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{user.time}</span>
                </div>
              ))
            )
          ) : (
            unreadList.length === 0 ? (
              <div className="text-center py-12 text-emerald-600 text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8" />
                <span>所有成员均已读本条消息</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  {unreadList.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0 grayscale-30"
                        />
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">{user.name}</div>
                          {user.department && (
                            <div className="text-[11px] text-gray-400">{user.department}</div>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium border border-amber-100">
                        未读
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
