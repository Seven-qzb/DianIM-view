import React from 'react';
import { MessageSquare, Users, LayoutGrid, UserCircle } from 'lucide-react';

export type AppTab = 'messages' | 'contacts' | 'services' | 'profile';

interface BottomNavBarProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  unreadMessageCount?: number;
  pendingTaskCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  unreadMessageCount = 0,
  pendingTaskCount = 0,
}) => {
  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 pt-1.5 pb-6 flex items-center justify-around w-full max-w-[430px] mx-auto select-none shadow-[0_-1px_3px_rgba(0,0,0,0.03)]">
      {/* 消息 (Message) Tab */}
      <button
        id="tab-messages-btn"
        type="button"
        onClick={() => onTabChange('messages')}
        className={`flex flex-col items-center justify-center w-1/4 py-1 relative transition-transform active:scale-95 cursor-pointer ${
          currentTab === 'messages' ? 'text-[#1677FF]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <div className="relative">
          <MessageSquare
            className={`w-5 h-5 transition-all ${
              currentTab === 'messages' ? 'stroke-[2.2]' : 'stroke-[1.75]'
            }`}
          />
          {unreadMessageCount > 0 && (
            <span 
              id="bottom-nav-unread-badge"
              className="absolute -top-1.5 -right-3 bg-[#FF3B30] text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none"
            >
              {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
            </span>
          )}
        </div>
        <span className={`text-[11px] mt-0.5 tracking-tight ${
          currentTab === 'messages' ? 'font-semibold text-[#1677FF]' : 'font-medium text-slate-500'
        }`}>
          消息
        </span>
      </button>

      {/* 联系人 (Contacts) Tab */}
      <button
        id="tab-contacts-btn"
        type="button"
        onClick={() => onTabChange('contacts')}
        className={`flex flex-col items-center justify-center w-1/4 py-1 relative transition-transform active:scale-95 cursor-pointer ${
          currentTab === 'contacts' ? 'text-[#1677FF]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <div className="relative">
          <Users
            className={`w-5 h-5 transition-all ${
              currentTab === 'contacts' ? 'stroke-[2.2]' : 'stroke-[1.75]'
            }`}
          />
        </div>
        <span className={`text-[11px] mt-0.5 tracking-tight ${
          currentTab === 'contacts' ? 'font-semibold text-[#1677FF]' : 'font-medium text-slate-500'
        }`}>
          联系人
        </span>
      </button>

      {/* 服务 (Services) Tab */}
      <button
        id="tab-services-btn"
        type="button"
        onClick={() => onTabChange('services')}
        className={`flex flex-col items-center justify-center w-1/4 py-1 relative transition-transform active:scale-95 cursor-pointer ${
          currentTab === 'services' ? 'text-[#1677FF]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <div className="relative">
          <LayoutGrid
            className={`w-5 h-5 transition-all ${
              currentTab === 'services' ? 'stroke-[2.2]' : 'stroke-[1.75]'
            }`}
          />
          {pendingTaskCount > 0 && (
            <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white"></span>
          )}
        </div>
        <span className={`text-[11px] mt-0.5 tracking-tight ${
          currentTab === 'services' ? 'font-semibold text-[#1677FF]' : 'font-medium text-slate-500'
        }`}>
          服务
        </span>
      </button>

      {/* 我的 (Profile) Tab */}
      <button
        id="tab-profile-btn"
        type="button"
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center justify-center w-1/4 py-1 relative transition-transform active:scale-95 cursor-pointer ${
          currentTab === 'profile' ? 'text-[#1677FF]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <div className="relative">
          <UserCircle
            className={`w-5 h-5 transition-all ${
              currentTab === 'profile' ? 'stroke-[2.2]' : 'stroke-[1.75]'
            }`}
          />
        </div>
        <span className={`text-[11px] mt-0.5 tracking-tight ${
          currentTab === 'profile' ? 'font-semibold text-[#1677FF]' : 'font-medium text-slate-500'
        }`}>
          我的
        </span>
      </button>
    </nav>
  );
};
