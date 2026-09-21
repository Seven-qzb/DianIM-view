/**
 * [MiniProgramCapsuleBar]
 * 微信小程序经典右上角胶囊功能栏 (三点功能栏 + 退出/圆点栏)
 * 具备功能三点栏弹出操作面板、退出/返回门户、悬浮交互动效
 */

import React from 'react';
import { motion } from 'motion/react';

interface MiniProgramCapsuleBarProps {
  onOpenMenu: () => void;
  onCloseMiniApp: () => void;
  isDarkTheme?: boolean;
}

export const MiniProgramCapsuleBar: React.FC<MiniProgramCapsuleBarProps> = ({
  onOpenMenu,
  onCloseMiniApp,
  isDarkTheme = false,
}) => {
  return (
    <div
      id="miniapp-capsule-bar"
      className="absolute top-[48px] right-[12px] z-50 flex items-center pointer-events-auto select-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`h-[32px] w-[88px] rounded-full border px-1 flex items-center justify-between shadow-xs transition-colors backdrop-blur-md ${
          isDarkTheme
            ? 'bg-black/45 border-white/20 text-white'
            : 'bg-white/80 border-slate-300/80 text-slate-800 hover:bg-white/95'
        }`}
      >
        {/* Left Action: 三点功能栏 (•••) */}
        <button
          id="miniapp-capsule-dots-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenMenu();
          }}
          className={`flex-1 h-full flex items-center justify-center rounded-l-full cursor-pointer transition-all active:scale-90 ${
            isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-slate-100/80'
          }`}
          title="小程序功能三点栏 (转发/收藏/重新进入/设置)"
          aria-label="小程序功能菜单"
        >
          {/* Authentic WeChat-styled 3 horizontal dots */}
          <div className="flex items-center gap-[2.5px] px-1">
            <span
              className={`w-[4.2px] h-[4.2px] rounded-full ${
                isDarkTheme ? 'bg-white' : 'bg-slate-800'
              }`}
            />
            <span
              className={`w-[4.2px] h-[4.2px] rounded-full ${
                isDarkTheme ? 'bg-white' : 'bg-slate-800'
              }`}
            />
            <span
              className={`w-[4.2px] h-[4.2px] rounded-full ${
                isDarkTheme ? 'bg-white' : 'bg-slate-800'
              }`}
            />
          </div>
        </button>

        {/* Middle Hairline Divider */}
        <div
          className={`w-[1px] h-[14px] shrink-0 ${
            isDarkTheme ? 'bg-white/25' : 'bg-slate-300/90'
          }`}
        />

        {/* Right Action: 退出/返回主圆点 (Concentric Circle ⦿) */}
        <button
          id="miniapp-capsule-close-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCloseMiniApp();
          }}
          className={`flex-1 h-full flex items-center justify-center rounded-r-full cursor-pointer transition-all active:scale-90 ${
            isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-slate-100/80'
          }`}
          title="退出小程序 / 返回多端门户"
          aria-label="退出小程序"
        >
          {/* Authentic WeChat-styled concentric target circle */}
          <div className="relative w-[14px] h-[14px] flex items-center justify-center">
            <div
              className={`w-[14px] h-[14px] rounded-full border-[1.5px] ${
                isDarkTheme ? 'border-white' : 'border-slate-800'
              }`}
            />
            <div
              className={`absolute w-[4.5px] h-[4.5px] rounded-full ${
                isDarkTheme ? 'bg-white' : 'bg-slate-800'
              }`}
            />
          </div>
        </button>
      </motion.div>
    </div>
  );
};
