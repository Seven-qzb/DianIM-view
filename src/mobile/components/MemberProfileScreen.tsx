import React, { useState } from 'react';
import { GroupMember } from '../types';
import { ChevronLeft, Check, AlertTriangle } from 'lucide-react';
import { SecurityWatermark } from './SecurityWatermark';
import { motion, AnimatePresence } from 'motion/react';

interface MemberProfileScreenProps {
  member: GroupMember;
  groupName: string;
  isCurrentUserOwner?: boolean;
  onBack: () => void;
  onUpdateMember: (updated: Partial<GroupMember>) => void;
  onRemoveMember: (memberId: string) => void;
  onDirectChat?: (member: GroupMember) => void;
}

export const MemberProfileScreen: React.FC<MemberProfileScreenProps> = ({
  member,
  groupName,
  isCurrentUserOwner = true,
  onBack,
  onUpdateMember,
  onRemoveMember,
  onDirectChat,
}) => {
  const [isMuted, setIsMuted] = useState(!!member.isMuted);
  const [isAdmin, setIsAdmin] = useState(member.role === 'admin' || member.role === 'owner');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2400);
  };

  // Toggle Mute for this member
  const handleToggleMute = () => {
    const nextVal = !isMuted;
    setIsMuted(nextVal);
    onUpdateMember({ isMuted: nextVal });
    triggerToast(nextVal ? `已对 ${member.name} 开启禁言` : `已解除 ${member.name} 的禁言`);
  };

  // Toggle Admin role for this member
  const handleToggleAdmin = () => {
    if (member.role === 'owner') {
      triggerToast('群主身份无法修改');
      return;
    }
    const nextVal = !isAdmin;
    setIsAdmin(nextVal);
    onUpdateMember({ role: nextVal ? 'admin' : 'member' });
    triggerToast(nextVal ? `已将 ${member.name} 设为群管理员` : `已取消 ${member.name} 的管理员权限`);
  };

  // Confirm remove member
  const handleConfirmRemove = () => {
    setShowRemoveConfirm(false);
    onRemoveMember(member.id);
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#F4F6F9] text-slate-900 flex flex-col w-full h-full overflow-y-auto select-none font-sans">
      <SecurityWatermark name="戚中彪" timestamp="2026/09/07 17:21" />

      {/* Toast Notice */}
      <AnimatePresence>
        {toastNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 z-60 max-w-[360px] mx-auto bg-slate-900/95 text-white py-2.5 px-4 rounded-xl shadow-xl flex items-center justify-between text-xs font-medium backdrop-blur-xs"
          >
            <span>{toastNotice}</span>
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-20 bg-[#F4F6F9]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-slate-800 hover:text-slate-600 active:scale-95 transition-transform cursor-pointer"
          title="返回"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2]" />
        </button>
        <h1 className="text-[17px] font-medium text-slate-900 absolute left-1/2 -translate-x-1/2">
          成员信息
        </h1>
        <div className="w-6" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-4 pb-12 space-y-4 relative z-15">
        {/* User Card Header matching Image 3 */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-100/60">
          <div className="relative shrink-0">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-16 h-16 rounded-full object-cover border border-slate-200/80 shadow-xs"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[19px] font-medium text-slate-900 truncate">
                {member.name}
              </h2>
              {member.role === 'owner' && (
                <span className="border border-red-300 text-red-500 bg-red-50/50 text-[11px] px-1.5 py-0.5 rounded leading-none">
                  群主
                </span>
              )}
              {member.role === 'admin' && (
                <span className="border border-slate-300 text-slate-500 bg-slate-100/60 text-[11px] px-1.5 py-0.5 rounded leading-none">
                  管理员
                </span>
              )}
            </div>
            <p className="text-[12px] text-slate-400 mt-1 truncate">
              {member.department || '技术研发中心'}
            </p>
          </div>
        </div>

        {/* Detailed Info List matching Image 3 */}
        <div className="bg-white rounded-2xl divide-y divide-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-100/60 overflow-hidden">
          {/* IP */}
          <div className="px-4 py-3.5 flex items-center justify-between text-[15px]">
            <span className="text-slate-800">IP</span>
            <span className="text-slate-700 font-mono text-[14px]">
              {member.ip || '183.200.98.87'}
            </span>
          </div>

          {/* 手机 */}
          <div className="px-4 py-3.5 flex items-center justify-between text-[15px]">
            <span className="text-slate-800">手机</span>
            <span className="text-slate-700 font-mono text-[14px]">
              {member.phone || '134****4789'}
            </span>
          </div>

          {/* 当前群聊 */}
          <div className="px-4 py-3.5 flex items-center justify-between text-[15px]">
            <span className="text-slate-800 shrink-0">当前群聊</span>
            <span className="text-slate-600 text-[14px] truncate ml-4 text-right">
              {groupName}
            </span>
          </div>

          {/* 禁言 */}
          <div className="px-4 py-3 flex items-center justify-between text-[15px]">
            <span className="text-slate-800">禁言</span>
            <button
              onClick={handleToggleMute}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                isMuted ? 'bg-[#0058BD]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                  isMuted ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 管理员 */}
          <div className="px-4 py-3 flex items-center justify-between text-[15px]">
            <span className="text-slate-800">管理员</span>
            <button
              onClick={handleToggleAdmin}
              disabled={member.role === 'owner'}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                member.role === 'owner'
                  ? 'bg-slate-300 opacity-60 cursor-not-allowed'
                  : isAdmin
                  ? 'bg-[#0058BD] cursor-pointer'
                  : 'bg-slate-300 cursor-pointer'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                  isAdmin ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Actions Card matching Image 3 */}
        {member.role !== 'owner' && (
          <div className="bg-white rounded-2xl divide-y divide-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-100/60 overflow-hidden">
            {/* 移除群聊 */}
            <button
              onClick={() => setShowRemoveConfirm(true)}
              className="w-full py-3.5 text-center text-[16px] text-[#BA1A1A] font-medium hover:bg-red-50/40 active:bg-red-50 transition-colors cursor-pointer"
            >
              移除群聊
            </button>

            {/* 群内私信 */}
            <button
              onClick={() => {
                if (onDirectChat) {
                  onDirectChat(member);
                } else {
                  triggerToast(`已与 ${member.name} 建立密信端到端加密会话`);
                }
              }}
              className="w-full py-3.5 text-center text-[16px] text-[#0058BD] font-medium hover:bg-blue-50/40 active:bg-blue-50 transition-colors cursor-pointer"
            >
              群内私信
            </button>
          </div>
        )}

        {member.role === 'owner' && (
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-100/60 overflow-hidden">
            <button
              onClick={() => {
                if (onDirectChat) {
                  onDirectChat(member);
                } else {
                  triggerToast(`已与群主 ${member.name} 建立端到端加密通道`);
                }
              }}
              className="w-full py-3.5 text-center text-[16px] text-[#0058BD] font-medium hover:bg-blue-50/40 active:bg-blue-50 transition-colors cursor-pointer"
            >
              群内私信
            </button>
          </div>
        )}
      </main>

      {/* Remove Confirm Modal */}
      <AnimatePresence>
        {showRemoveConfirm && (
          <div className="absolute inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-2xl max-w-[320px] w-full p-5 shadow-2xl border border-slate-200 text-center"
            >
              <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-[16px] font-bold text-slate-900 mb-1">
                移出群聊确认
              </h3>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-5">
                确定要将 <span className="font-semibold text-slate-800">{member.name}</span> 移出当前群聊吗？移出后该成员将无法查看群消息。
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmRemove}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
                >
                  确认移出
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
