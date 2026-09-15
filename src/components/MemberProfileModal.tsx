import React, { useState } from 'react';
import { X } from 'lucide-react';
import { UserMember } from '../types/chat';

interface MemberProfileModalProps {
  member: UserMember | null;
  isOpen: boolean;
  onClose: () => void;
  currentGroupName?: string;
  onSendMessage?: (member: UserMember) => void;
  onRemoveMember?: (member: UserMember) => void;
  onToggleMuteMember?: (member: UserMember, isMuted: boolean) => void;
  onToggleAdminMember?: (member: UserMember, isAdmin: boolean) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  member,
  isOpen,
  onClose,
  currentGroupName = '正式研发中心测试群222',
  onSendMessage,
  onRemoveMember,
  onToggleMuteMember,
  onToggleAdminMember,
}) => {
  const [showLargeAvatar, setShowLargeAvatar] = useState(false);
  const [isMuted, setIsMuted] = useState(member?.isMutedInGroup || false);
  const [isAdmin, setIsAdmin] = useState(
    member?.isAdmin !== undefined
      ? member.isAdmin
      : member?.role === 'admin' || member?.role === 'owner' || member?.name === '赵力'
  );

  React.useEffect(() => {
    if (member) {
      setIsMuted(member.isMutedInGroup || false);
      setIsAdmin(
        member.isAdmin !== undefined
          ? member.isAdmin
          : member.role === 'admin' || member.role === 'owner' || member.name === '赵力'
      );
      setShowLargeAvatar(false);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleToggleMute = () => {
    const nextVal = !isMuted;
    setIsMuted(nextVal);
    onToggleMuteMember?.(member, nextVal);
  };

  const handleToggleAdmin = () => {
    const nextVal = !isAdmin;
    setIsAdmin(nextVal);
    onToggleAdminMember?.(member, nextVal);
  };

  const handlePrivateMessage = () => {
    onSendMessage?.(member);
    onClose();
  };

  const handleRemove = () => {
    if (window.confirm(`确定将 ${member.name} 移出当前群聊？`)) {
      onRemoveMember?.(member);
      onClose();
    }
  };

  return (
    <>
      {/* Main Profile Card Modal matching provided screenshot */}
      <div
        id="member-profile-overlay"
        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
        onClick={onClose}
      >
        <div
          id="member-profile-card"
          className="bg-white rounded-2xl shadow-xl w-full max-w-[330px] p-5 relative border border-gray-100 animate-in zoom-in-95 duration-150 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar: Close Button on Left & Online/Offline Status on Right */}
          <div className="flex items-center justify-between w-full mb-1">
            <button
              id="btn-close-member-modal"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 -ml-1 rounded-md cursor-pointer"
              title="关闭"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>

            <div className="flex items-center">
              {member.online !== false ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  在线
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  离线
                </span>
              )}
            </div>
          </div>

          {/* Center: Avatar & Name */}
          <div className="flex flex-col items-center mt-1 mb-4">
            <div className="relative group cursor-pointer" onClick={() => setShowLargeAvatar(true)}>
              <img
                src={member.avatar}
                alt={member.name}
                className="w-16 h-16 rounded-xl object-cover shadow-2xs hover:scale-105 transition-transform"
                title="点击放大头像"
              />
            </div>
            <h3 className="text-base font-bold text-gray-900 mt-2.5 tracking-tight">
              {member.name}
            </h3>
          </div>

          {/* Info Rows: IP, 手机, 当前群聊 */}
          <div className="space-y-3 text-xs w-full mb-4 px-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-800 font-medium">IP</span>
              <span className="text-gray-600 font-normal">
                {member.ip || '124.89.90.210'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-800 font-medium">手机</span>
              <span className="text-gray-600 font-normal">
                {member.phone || '189****2938'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-800 font-medium">当前群聊</span>
              <span className="text-gray-600 font-normal truncate max-w-[190px]">
                {member.currentGroup || currentGroupName}
              </span>
            </div>
          </div>

          {/* Light Horizontal Divider */}
          <div className="h-px bg-gray-100 w-full mb-3.5" />

          {/* Switch Options: 禁言 & 管理员 */}
          <div className="space-y-3.5 text-xs w-full mb-6 px-1">
            {/* 禁言 Switch */}
            <div className="flex items-center justify-between">
              <span className="text-gray-800 font-medium">禁言</span>
              <button
                type="button"
                role="switch"
                aria-checked={isMuted}
                onClick={handleToggleMute}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isMuted ? 'bg-[#2979ff]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    isMuted ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 管理员 Switch */}
            <div className="flex items-center justify-between">
              <span className="text-gray-800 font-medium">管理员</span>
              <button
                type="button"
                role="switch"
                aria-checked={isAdmin}
                onClick={handleToggleAdmin}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isAdmin ? 'bg-[#2979ff]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    isAdmin ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Bottom Action Buttons: 移除群聊 & 群内私信 */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              id="btn-remove-from-group"
              onClick={handleRemove}
              className="w-full py-2 px-3 border border-gray-200 hover:bg-red-50 text-red-500 rounded-xl text-xs font-medium transition-colors cursor-pointer text-center"
            >
              移除群聊
            </button>

            <button
              id="btn-group-private-message"
              onClick={handlePrivateMessage}
              className="w-full py-2 px-3 bg-[#2979ff] hover:bg-[#1e6bf0] text-white rounded-xl text-xs font-medium transition-colors cursor-pointer text-center shadow-2xs"
            >
              群内私信
            </button>
          </div>
        </div>
      </div>

      {/* Large Avatar Viewer (No grayscale, full color, click anywhere to recover/close) */}
      {showLargeAvatar && (
        <div
          id="large-avatar-preview-overlay"
          className="fixed inset-0 z-[70] bg-black/65 flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150 select-none"
          onClick={() => setShowLargeAvatar(false)}
          title="点击任意区域恢复"
        >
          <div className="relative max-w-[85vw] max-h-[85vh] flex flex-col items-center">
            <img
              src={member.avatar}
              alt={member.name}
              className="max-w-[80vw] max-h-[80vh] rounded-2xl shadow-2xl object-contain border border-white/20 transition-transform duration-200 hover:scale-[1.01]"
              onClick={(e) => {
                e.stopPropagation();
                setShowLargeAvatar(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
