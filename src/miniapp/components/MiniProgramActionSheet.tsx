/**
 * [MiniProgramActionSheet]
 * 微信小程序原生功能三点栏弹出的核心操作面板 (Action Sheet)
 * 包含：发送给朋友、分享到朋友圈、添加到我的小程序、重新进入、浮窗、设置、关于、退出小程序
 */

import React from 'react';
import { 
  Send, Share2, Star, Smartphone, RotateCcw, 
  Layers, Settings, Info, LogOut, CheckCircle2, 
  ShieldCheck, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MiniProgramActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isStarred: boolean;
  onToggleStar: () => void;
  isFloating: boolean;
  onToggleFloating: () => void;
  onRestartMiniApp: () => void;
  onOpenShareModal: () => void;
  onOpenMomentsShare: () => void;
  onOpenSettingsModal: () => void;
  onOpenAboutModal: () => void;
  onExitMiniApp: () => void;
}

export const MiniProgramActionSheet: React.FC<MiniProgramActionSheetProps> = ({
  isOpen,
  onClose,
  isStarred,
  onToggleStar,
  isFloating,
  onToggleFloating,
  onRestartMiniApp,
  onOpenShareModal,
  onOpenMomentsShare,
  onOpenSettingsModal,
  onOpenAboutModal,
  onExitMiniApp,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-end justify-center select-none">
          {/* Backdrop Mask */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Action Sheet Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-[430px] bg-[#F2F2F7] rounded-t-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] border-t border-slate-200"
          >
            {/* Top Handle / Header */}
            <div className="pt-3 pb-2 px-5 flex flex-col items-center border-b border-slate-200/70 bg-white/70">
              <div className="w-9 h-1 bg-slate-300 rounded-full mb-3" />

              <div className="w-full flex items-center justify-between">
                {/* Mini Program Info */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#28211b] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                    <span>点</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900 leading-tight">
                        点点密信 · 微信小程序端
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-1.5 py-0.2 rounded leading-none flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        国密认证
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      主体：点点密信多端协同实验室 · V8.2
                    </span>
                  </div>
                </div>

                {/* Close X */}
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Grid (WeChat Classic 8-Grid) */}
            <div className="p-4 bg-white grid grid-cols-4 gap-y-4 gap-x-2 text-center border-b border-slate-200/80">
              {/* 1. 发送给朋友 */}
              <button
                id="miniapp-action-share-friend"
                type="button"
                onClick={() => {
                  onClose();
                  onOpenShareModal();
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs group-hover:bg-emerald-100 transition-colors">
                  <Send className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-[11.5px] text-slate-700 font-medium leading-tight">
                  发送给朋友
                </span>
              </button>

              {/* 2. 分享到朋友圈 */}
              <button
                id="miniapp-action-share-moments"
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMomentsShare();
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs group-hover:bg-blue-100 transition-colors">
                  <Share2 className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-[11.5px] text-slate-700 font-medium leading-tight">
                  分享到朋友圈
                </span>
              </button>

              {/* 3. 添加到我的小程序 */}
              <button
                id="miniapp-action-star"
                type="button"
                onClick={onToggleStar}
                className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs transition-colors ${
                    isStarred
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-amber-50 text-amber-500 group-hover:bg-amber-100'
                  }`}
                >
                  <Star className={`w-5 h-5 stroke-[2] ${isStarred ? 'fill-amber-500' : ''}`} />
                </div>
                <span className="text-[11.5px] text-slate-700 font-medium leading-tight">
                  {isStarred ? '已在小程序' : '设为星标'}
                </span>
              </button>

              {/* 4. 添加到桌面 */}
              <button
                id="miniapp-action-desktop"
                type="button"
                onClick={() => {
                  alert('提示：在手机端微信右上角三点栏中，点击「添加到桌面」即可在主屏幕生成点点密信快捷入口。');
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs group-hover:bg-indigo-100 transition-colors">
                  <Smartphone className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-[11.5px] text-slate-700 font-medium leading-tight">
                  添加到桌面
                </span>
              </button>

              {/* 5. 重新进入小程序 */}
              <button
                id="miniapp-action-restart"
                type="button"
                onClick={() => {
                  onClose();
                  onRestartMiniApp();
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shadow-2xs group-hover:bg-slate-200 transition-colors">
                  <RotateCcw className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-[11.5px] text-slate-700 font-medium leading-tight">
                  重新进入
                </span>
              </button>

              {/* 6. 浮窗 */}
              <button
                id="miniapp-action-float"
                type="button"
                onClick={() => {
                  onToggleFloating();
                  onClose();
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs transition-colors ${
                    isFloating
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'
                  }`}
                >
                  <Layers className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-[11.5px] text-slate-700 font-medium leading-tight">
                  {isFloating ? '关闭浮窗' : '悬浮窗'}
                </span>
              </button>

              {/* 7. 小程序设置 */}
              <button
                id="miniapp-action-settings"
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettingsModal();
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-2xs group-hover:bg-orange-100 transition-colors">
                  <Settings className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-[11.5px] text-slate-700 font-medium leading-tight">
                  权限与设置
                </span>
              </button>

              {/* 8. 关于小程序 */}
              <button
                id="miniapp-action-about"
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAboutModal();
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-2xs group-hover:bg-teal-100 transition-colors">
                  <Info className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-[11.5px] text-slate-700 font-medium leading-tight">
                  关于小程序
                </span>
              </button>
            </div>

            {/* Exit Mini Program Button */}
            <div className="p-3 bg-white space-y-2">
              <button
                id="miniapp-action-exit-btn"
                type="button"
                onClick={() => {
                  onClose();
                  onExitMiniApp();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-red-50 text-red-600 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>退出当前小程序 (返回多端门户)</span>
              </button>
            </div>

            {/* Cancel Bottom Bar */}
            <div className="p-3 pt-2 pb-6 bg-[#F2F2F7]">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm shadow-xs transition-colors cursor-pointer"
              >
                取消
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
