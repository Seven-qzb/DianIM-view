import React from 'react';
import { MessageSquare, LayoutGrid, Settings, ChevronDown, Layers, ArrowLeft } from 'lucide-react';
import { MainNavTab } from '../types/chat';
import { CURRENT_USER } from '../data/mockData';

interface NavigationSidebarProps {
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  totalUnreadCount: number;
  onBackToPortal?: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  onTabChange,
  totalUnreadCount,
  onBackToPortal,
}) => {
  return (
    <aside className="w-[185px] bg-[#f0f5fc] border-r border-[#dbe6f5] flex flex-col justify-between select-none shrink-0 h-full p-4 pt-5">
      {/* Top Logo & App Branding */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2.5 pt-0.5">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-lg bg-[#2979ff] flex items-center justify-center shadow-xs text-white">
            <span className="font-bold text-lg leading-none">点</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#1967d2] font-bold text-sm leading-tight tracking-tight">
              点点密信
            </span>
            <span className="text-[10px] text-[#2979ff] bg-[#dbe8fd] px-1.5 py-0.5 rounded font-medium mt-0.5 leading-none w-fit">
              企业级加密通讯
            </span>
          </div>
        </div>

        {/* Back to Portal / Multi-Terminal Switch Button */}
        {onBackToPortal && (
          <button
            id="nav-btn-back-to-portal"
            type="button"
            onClick={onBackToPortal}
            className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#5c5043] bg-[#f6efe4] hover:bg-[#eee2d0] border border-[#e4d6c1] transition-all cursor-pointer shadow-2xs group"
            title="返回点点密信主体菜单 (小程序端/APP端/PC端)"
          >
            <div className="w-5 h-5 rounded-md bg-[#28211b] text-white flex items-center justify-center text-[10px] shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-3 h-3 text-amber-300" />
            </div>
            <div className="flex flex-col text-left truncate">
              <span className="leading-tight text-[#3b3127]">主体菜单</span>
              <span className="text-[9px] text-[#8c7a65] font-normal leading-none mt-0.5">多端协同门户</span>
            </div>
          </button>
        )}

        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-2">
          {/* Messages Tab */}
          <button
            id="nav-tab-messages"
            onClick={() => onTabChange('messages')}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'messages'
                ? 'bg-white text-gray-800 shadow-sm font-semibold'
                : 'text-[#475569] hover:bg-white/60 hover:text-[#1e293b]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#2979ff] flex items-center justify-center text-white shrink-0">
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
              </div>
              <span>消息</span>
            </div>
            {totalUnreadCount > 0 && (
              <span className="bg-[#e53935] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center leading-tight">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </button>

          {/* Services Tab */}
          <button
            id="nav-tab-services"
            onClick={() => onTabChange('services')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'services'
                ? 'bg-white text-gray-800 shadow-sm font-semibold'
                : 'text-[#475569] hover:bg-white/60 hover:text-[#1e293b]'
            }`}
          >
            <LayoutGrid className="w-5 h-5 text-gray-500 ml-0.5" />
            <span>服务</span>
          </button>

          {/* Settings Tab */}
          <button
            id="nav-tab-settings"
            onClick={() => onTabChange('settings')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-white text-gray-800 shadow-sm font-semibold'
                : 'text-[#475569] hover:bg-white/60 hover:text-[#1e293b]'
            }`}
          >
            <Settings className="w-5 h-5 text-gray-500 ml-0.5" />
            <span>系统设置</span>
          </button>
        </nav>
      </div>

      {/* Bottom Profile Widget */}
      <div className="flex flex-col gap-2 pb-1">
        {/* User Card */}
        <div className="bg-[#9bbef3] rounded-2xl p-2.5 flex flex-col gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <img
              src={CURRENT_USER.avatar}
              alt={CURRENT_USER.name}
              className="w-8 h-8 rounded-full object-cover border border-white shrink-0"
            />
            <div className="flex flex-col text-white truncate leading-tight">
              <span className="text-[11px] font-bold truncate">KN 康奈网络</span>
              <span className="text-[9px] opacity-80">knwl.cn</span>
            </div>
          </div>

          {/* Department dropdown selector box */}
          <button
            id="user-dept-selector"
            className="bg-white hover:bg-gray-50 rounded-xl px-2.5 py-1.5 flex items-center justify-between transition-colors shadow-2xs text-left"
          >
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-gray-800 leading-tight truncate">
                {CURRENT_USER.department}
              </span>
              <span className="text-[10px] text-gray-500 leading-tight mt-0.5">
                {CURRENT_USER.name}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
          </button>
        </div>
      </div>
    </aside>
  );
};
