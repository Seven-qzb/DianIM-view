/**
 * [Component - ContactProfileCard]
 * 1:1 还原用户参考设计图（image.png）的正方形好友名片组件
 * 
 * 视觉与交互规范：
 * 1. 正方形卡片（310px × 310px），纯白背景、圆角与精致阴影
 * 2. 左上角关闭 × 按钮，右上角「• 在线 / 离线」圆角药丸徽章
 * 3. 居中方圆头像（w-14 h-14）与加粗姓名
 * 4. 详细信息行：IP、手机（中间四位脱敏）、当前群聊（取消所属机构展示）
 * 5. 底部操作按钮：蓝色全宽「群内私信」按钮
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ContactUser } from '../services/contactService';

export interface ContactProfileCardProps {
  contact: ContactUser;
  currentGroupName?: string; // 若从群组内点击打开，传入当前群聊名称（如 "vpn"）
  fromGroup?: boolean; // 是否从群成员列表中打开（群友名片）
  showCloseButton?: boolean; // 是否显示左上角关闭按钮（仅在弹窗模式下开启，PC面板默认关闭）
  onClose?: () => void;
  onStartChat?: (contact: ContactUser) => void;
  onGroupPrivateChat?: (contact: ContactUser) => void;
  onDeleted?: () => void;
}

export const ContactProfileCard: React.FC<ContactProfileCardProps> = ({
  contact,
  currentGroupName,
  fromGroup = false,
  showCloseButton = false,
  onClose,
  onStartChat,
  onGroupPrivateChat,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const handleAction = () => {
    if (fromGroup) {
      if (onGroupPrivateChat) {
        onGroupPrivateChat(contact);
      } else if (onStartChat) {
        onStartChat(contact);
      } else {
        showToast(`已向 ${contact.name} 发起群内私信`);
      }
    } else {
      if (onStartChat) {
        onStartChat(contact);
      } else {
        showToast(`已向 ${contact.name} 发起聊天`);
      }
    }
  };

  // 群友名片展示的群聊名称
  const displayGroupName = currentGroupName || 'vpn';

  return (
    <div
      id="contact-profile-card"
      className="w-[310px] h-[310px] bg-white rounded-2xl shadow-xl border border-slate-100/90 p-5 flex flex-col justify-between relative select-none animate-in fade-in zoom-in-95 duration-150 shrink-0"
    >
      {/* Toast 提示浮层 */}
      {toastMessage && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap">
          {toastMessage}
        </div>
      )}

      {/* 顶部操作区：仅在显式开启关闭按钮且提供 onClose 时渲染关闭按钮，右上角在线徽章 */}
      <div className="flex items-center justify-between w-full h-7">
        {showCloseButton && onClose ? (
          <button
            id="close-profile-card-btn"
            type="button"
            onClick={onClose}
            className="w-7 h-7 -ml-1 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="关闭名片"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-7 h-7" />
        )}

        {contact.isOnline !== false ? (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#EAF8EE] text-[#1EBE5D] text-xs font-medium rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1EBE5D]" />
            在线
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            离线
          </div>
        )}
      </div>

      {/* 头像与名称 */}
      <div className="flex flex-col items-center">
        <img
          src={contact.avatar}
          alt={contact.name}
          className="w-14 h-14 rounded-xl object-cover shadow-2xs ring-1 ring-slate-100"
          referrerPolicy="no-referrer"
        />
        <h3 className="mt-2 text-base font-bold text-slate-800 tracking-tight text-center">
          {contact.name}
        </h3>
      </div>

      {/* 信息列表行：IP、手机；群友名片额外展示当前群聊，机构好友/我的好友不展示 */}
      <div className="space-y-2.5 text-sm px-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-800 font-normal">IP</span>
          <span className="text-slate-400 font-normal select-all">
            {contact.ip ? contact.ip.split(' ')[0] : '223.104.11.116'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-800 font-normal">手机</span>
          <span className="text-slate-400 font-normal select-all">
            {contact.phone || '183****1626'}
          </span>
        </div>

        {fromGroup && (
          <div className="flex items-center justify-between">
            <span className="text-slate-800 font-normal">当前群聊</span>
            <span className="text-slate-400 font-normal truncate max-w-[170px] text-right">
              {displayGroupName}
            </span>
          </div>
        )}
      </div>

      {/* 底部全宽蓝色按钮：机构好友与我的好友为「发起聊天」，群友名片为「群内私信」 */}
      <div className="w-full pt-1">
        <button
          id="profile-card-action-btn"
          type="button"
          onClick={handleAction}
          className="w-full h-10 bg-[#2979ff] hover:bg-[#1a68ea] active:bg-[#155bd5] text-white rounded-xl font-medium text-sm transition-all shadow-xs flex items-center justify-center cursor-pointer active:scale-98"
        >
          {fromGroup ? '群内私信' : '发起聊天'}
        </button>
      </div>
    </div>
  );
};
