import React from 'react';
import { Megaphone, Bot, ClipboardCheck, ListTodo } from 'lucide-react';
import { UserMember } from '../types/chat';

interface GroupAvatarProps {
  session?: {
    isGroup?: boolean;
    avatar?: string;
    members?: UserMember[];
    name?: string;
    isNoticeSession?: boolean;
    isTaskSession?: boolean;
  };
  members?: UserMember[];
  avatar?: string;
  isGroup?: boolean;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GroupAvatar: React.FC<GroupAvatarProps> = ({
  session,
  members: propMembers,
  avatar: propAvatar,
  isGroup: propIsGroup,
  name: propName,
  className = '',
  size = 'md',
}) => {
  const isGroup = propIsGroup ?? session?.isGroup ?? false;
  const members = propMembers ?? session?.members ?? [];
  const fallbackAvatar = propAvatar ?? session?.avatar;
  const displayName = propName ?? session?.name ?? '群聊';
  const isNotice = session?.isNoticeSession || displayName === '指令流转' || displayName.includes('通知公告');
  const isTask = session?.isTaskSession || displayName === '我的任务';

  // Size classes
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-11 h-11 rounded-xl',
  }[size];

  // If notice announcement session (Matching screenshot 5)
  if (isNotice) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-tr from-[#3b82f6] to-[#60a5fa] text-white flex items-center justify-center shadow-xs shrink-0 ${sizeClasses} ${className}`}
      >
        <Megaphone className="w-5 h-5 fill-white/20 stroke-[2.2]" />
      </div>
    );
  }

  // If Task session
  if (isTask) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] text-white flex items-center justify-center shadow-xs shrink-0 ${sizeClasses} ${className}`}
      >
        <ClipboardCheck className="w-5 h-5 fill-white/20 stroke-[2.2]" />
      </div>
    );
  }

  // If single chat or no group flag
  if (!isGroup) {
    const singleAvatar = fallbackAvatar || (members.length > 0 ? members[0]?.avatar : '');
    return (
      <div className={`relative overflow-hidden bg-slate-200 shrink-0 ${sizeClasses} ${className}`}>
        {singleAvatar ? (
          <img
            src={singleAvatar}
            alt={displayName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold text-xs">
            {displayName.slice(0, 1)}
          </div>
        )}
      </div>
    );
  }

  // Group composite avatar: extract member avatars
  let avatarList = (members || []).map((m) => m?.avatar).filter(Boolean);

  // If members list is empty, fallback to generated/mock avatars
  if (avatarList.length === 0) {
    if (fallbackAvatar) {
      avatarList = [fallbackAvatar];
    } else {
      avatarList = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=120&auto=format&fit=crop&q=80',
      ];
    }
  }

  const count = avatarList.length;

  // 1 member
  if (count === 1) {
    return (
      <div className={`relative overflow-hidden bg-slate-200 shrink-0 ${sizeClasses} ${className}`}>
        <img
          src={avatarList[0]}
          alt={displayName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // 2 members: side by side
  if (count === 2) {
    return (
      <div
        className={`relative bg-[#dce6f2] p-[1.5px] flex items-center justify-between gap-[1.5px] shrink-0 overflow-hidden shadow-2xs ${sizeClasses} ${className}`}
      >
        <img
          src={avatarList[0]}
          alt=""
          className="w-[calc(50%-1px)] h-[calc(50%-1px)] rounded-[2.5px] object-cover"
        />
        <img
          src={avatarList[1]}
          alt=""
          className="w-[calc(50%-1px)] h-[calc(50%-1px)] rounded-[2.5px] object-cover"
        />
      </div>
    );
  }

  // 3 members: 1 top center, 2 bottom
  if (count === 3) {
    return (
      <div
        className={`relative bg-[#dce6f2] p-[1.5px] flex flex-col justify-between gap-[1.5px] shrink-0 overflow-hidden shadow-2xs ${sizeClasses} ${className}`}
      >
        {/* Top 1 */}
        <div className="flex justify-center w-full h-[calc(50%-1px)]">
          <img
            src={avatarList[0]}
            alt=""
            className="h-full aspect-square rounded-[2.5px] object-cover"
          />
        </div>
        {/* Bottom 2 */}
        <div className="flex justify-between w-full h-[calc(50%-1px)] gap-[1.5px]">
          <img
            src={avatarList[1]}
            alt=""
            className="w-[calc(50%-1px)] h-full rounded-[2.5px] object-cover"
          />
          <img
            src={avatarList[2]}
            alt=""
            className="w-[calc(50%-1px)] h-full rounded-[2.5px] object-cover"
          />
        </div>
      </div>
    );
  }

  // 4 or more members: Classic 2x2 grid (4 composite avatars)
  const displayAvatars = avatarList.slice(0, 4);

  return (
    <div
      className={`relative bg-[#dce6f2] p-[1.5px] grid grid-cols-2 grid-rows-2 gap-[1.5px] shrink-0 overflow-hidden shadow-2xs ${sizeClasses} ${className}`}
      title={`${displayName} (${members.length || count}人)`}
    >
      {displayAvatars.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt=""
          className="w-full h-full aspect-square rounded-[2px] object-cover bg-slate-300"
          loading="lazy"
        />
      ))}
    </div>
  );
};
