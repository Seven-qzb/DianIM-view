import React, { useState, useMemo } from 'react';
import { X, Search, ChevronRight, MessageSquare, Shield, Users } from 'lucide-react';
import { ContactGroup, ContactUser } from '../../services/contactService';
import { motion } from 'motion/react';

interface GroupFullMembersModalProps {
  group: ContactGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectMember: (member: ContactUser) => void;
  onEnterGroupChat: (sessionId: string) => void;
}

export const GroupFullMembersModal: React.FC<GroupFullMembersModalProps> = ({
  group,
  isOpen,
  onClose,
  onSelectMember,
  onEnterGroupChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = useMemo(() => {
    if (!group) return [];
    if (!searchQuery.trim()) return group.members;
    const q = searchQuery.toLowerCase();
    return group.members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.department.toLowerCase().includes(q) || m.phone.includes(q)
    );
  }, [group, searchQuery]);

  if (!isOpen || !group) return null;

  return (
    <div
      className="fixed inset-0 z-55 bg-black/50 flex flex-col justify-end select-none backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl w-full max-w-[430px] mx-auto max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Top Drag Handle & Close */}
        <div className="pt-3 pb-2 px-4 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="w-8" />
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Header Info */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={group.avatar}
              alt={group.name}
              className="w-12 h-12 rounded-xl object-cover border border-white shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">{group.name}</h3>
                <span className="text-[10px] bg-[#1677FF] text-white px-1.5 py-0.2 rounded-full font-bold">
                  {group.memberCount}人
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                {group.announcement || '暂无群公告'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onEnterGroupChat(group.sessionId);
              onClose();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1677FF] text-white rounded-lg text-xs font-semibold hover:bg-[#125ecc] transition-all shadow-xs cursor-pointer shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>进群</span>
          </button>
        </div>

        {/* Member Search */}
        <div className="p-3 border-b border-slate-100 shrink-0 bg-white">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索群内成员姓名、部门、手机号..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#1677FF] focus:outline-none"
            />
          </div>
        </div>

        {/* Members List Header */}
        <div className="px-4 py-2 bg-slate-100/60 text-[11px] text-slate-500 font-semibold flex items-center justify-between shrink-0">
          <span>群组全员列表 ({filteredMembers.length})</span>
          <span className="text-[10px] text-slate-400 font-normal">点击成员查看个人名片</span>
        </div>

        {/* Scrollable Members List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-10">
          {filteredMembers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">无匹配的群成员</div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => onSelectMember(member)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                    />
                    {member.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {member.name}
                      </span>
                      {member.role === 'owner' && (
                        <span className="text-[9px] bg-red-100 text-red-600 px-1 py-0.2 rounded font-semibold shrink-0">
                          群主
                        </span>
                      )}
                      {member.role === 'admin' && (
                        <span className="text-[9px] bg-amber-100 text-amber-700 px-1 py-0.2 rounded font-semibold shrink-0">
                          管理员
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {member.department}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {member.phone} · IP: {member.ip}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-[10px] text-slate-400">名片</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
