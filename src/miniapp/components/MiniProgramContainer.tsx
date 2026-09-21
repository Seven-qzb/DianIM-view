/**
 * [MiniProgramContainer]
 * 微信小程序端专用展示容器 (含顶部右上角功能三点栏 + 胶囊菜单 + 浮窗与多端切换)
 */

import React, { useState, useEffect } from 'react';
import { Wifi, Battery, ArrowLeft, Monitor, Smartphone, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MiniProgramCapsuleBar } from './MiniProgramCapsuleBar';
import { MiniProgramActionSheet } from './MiniProgramActionSheet';
import { MiniProgramShareModal } from './MiniProgramShareModal';
import { MiniProgramSettingsModal } from './MiniProgramSettingsModal';
import { MiniProgramAboutModal } from './MiniProgramAboutModal';
import { MiniProgramFloatingBall } from './MiniProgramFloatingBall';

interface MiniProgramContainerProps {
  children: React.ReactNode;
  onBackToPortal?: () => void;
  onSwitchToAPP?: () => void;
  onSwitchToPC?: () => void;
  onRestart?: () => void;
}

export const MiniProgramContainer: React.FC<MiniProgramContainerProps> = ({
  children,
  onBackToPortal,
  onSwitchToAPP,
  onSwitchToPC,
  onRestart,
}) => {
  const [currentTime, setCurrentTime] = useState('9:41');
  const [isFitMode, setIsFitMode] = useState(true);
  const [frameColor, setFrameColor] = useState<'natural' | 'black'>('black');
  const [scaleFactor, setScaleFactor] = useState(1);

  // Mini Program Functional States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const calculateScale = () => {
      if (!isFitMode) {
        setScaleFactor(1);
        return;
      }
      if (typeof window !== 'undefined') {
        const windowHeight = window.innerHeight;
        const availableHeight = windowHeight - 48;
        if (availableHeight < 956) {
          const factor = Math.max(0.65, Math.min(1, availableHeight / 956));
          setScaleFactor(factor);
        } else {
          setScaleFactor(1);
        }
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [isFitMode]);

  const handleToggleStar = () => {
    const next = !isStarred;
    setIsStarred(next);
    triggerToast(next ? '已添加到「我的小程序」' : '已移出「我的小程序」');
  };

  const handleRestart = () => {
    triggerToast('正在重新加载小程序...');
    setTimeout(() => {
      onRestart?.();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0A1017] text-slate-100 flex flex-col items-center justify-center relative overflow-x-hidden p-0 sm:p-4 select-none">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden sm:block">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-600/10 blur-[130px] rounded-full" />
        <div className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[450px] bg-teal-600/8 blur-[120px] rounded-full" />
      </div>

      {/* Top Cross-Terminal Navigation Bar */}
      <div className="w-full max-w-[480px] mb-2 px-1 flex items-center justify-between text-xs z-50">
        <div className="flex items-center gap-2">
          {onBackToPortal && (
            <button
              id="miniapp-top-btn-back-portal"
              type="button"
              onClick={onBackToPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 shadow-md font-semibold cursor-pointer transition-colors border border-slate-700/80"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回多端门户</span>
            </button>
          )}
          {onSwitchToAPP && (
            <button
              id="miniapp-top-btn-switch-app"
              type="button"
              onClick={onSwitchToAPP}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white shadow-md font-semibold cursor-pointer transition-colors border border-blue-400/40"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>切换至 原生APP端</span>
            </button>
          )}
          {onSwitchToPC && (
            <button
              id="miniapp-top-btn-switch-pc"
              type="button"
              onClick={onSwitchToPC}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 shadow-md font-semibold cursor-pointer transition-colors border border-slate-600/50"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>PC工作台</span>
            </button>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-emerald-400 text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>微信小程序端 (顶部右侧三点栏)</span>
        </div>
      </div>

      {/* Top Desktop Adaptation Toolbar */}
      <aside
        aria-label="小程序屏幕适配栏"
        className="hidden sm:flex items-center justify-between w-full max-w-[480px] mb-3 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-800/80 shadow-lg text-[12px] z-50 text-slate-300"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-white">微信小程序 · 运行预览</span>
          <span className="text-[11px] text-slate-400">430 × 932 pt</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsFitMode(!isFitMode)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
              isFitMode
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {isFitMode ? '自适应窗口' : '1:1 实际尺寸'}
          </button>

          <button
            type="button"
            onClick={() => setFrameColor(frameColor === 'black' ? 'natural' : 'black')}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            {frameColor === 'black' ? '深空黑钛' : '原色钛'}
          </button>
        </div>
      </aside>

      {/* Scaler Wrapper */}
      <div
        style={{
          transform: scaleFactor !== 1 ? `scale(${scaleFactor})` : undefined,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-out',
        }}
        className="relative"
      >
        {/* Chassis */}
        <div
          className={`relative transition-all duration-300 ${
            frameColor === 'black'
              ? 'sm:bg-[#1E1F22] sm:border-[#35373D]'
              : 'sm:bg-[#6D6E71] sm:border-[#A4A5A8]'
          } sm:p-[12px] sm:rounded-[56px] sm:border-[2px] sm:shadow-[0_25px_60px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.08),inset_0_0_3px_1px_rgba(255,255,255,0.12)] w-full sm:w-[454px]`}
        >
          {/* Outer Buttons */}
          <div className="hidden sm:block absolute -left-[4px] top-[115px] w-[3px] h-[28px] bg-slate-500 rounded-l-xs shadow-xs" />
          <div className="hidden sm:block absolute -left-[4px] top-[162px] w-[3px] h-[52px] bg-slate-500 rounded-l-xs shadow-xs" />
          <div className="hidden sm:block absolute -left-[4px] top-[228px] w-[3px] h-[52px] bg-slate-500 rounded-l-xs shadow-xs" />
          <div className="hidden sm:block absolute -right-[4px] top-[180px] w-[3px] h-[78px] bg-slate-500 rounded-r-xs shadow-xs" />
          <div className="hidden sm:block absolute top-[5px] left-1/2 -translate-x-1/2 w-[58px] h-[3.5px] bg-[#111214] rounded-full z-40 border border-white/5" />

          {/* Screen Display Area */}
          <div
            id="miniapp-screen-viewport"
            className="w-full sm:w-[430px] h-dvh sm:h-[932px] sm:rounded-[46px] overflow-hidden relative flex flex-col bg-[#F8F9FA] text-slate-900 shadow-inner"
          >
            {/* Top iOS Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-[44px] z-40 px-7 flex items-center justify-between pointer-events-none text-slate-900 select-none">
              <div className="w-[80px] text-left pt-1">
                <span className="font-semibold text-[14.5px] tracking-tight font-sans">
                  {currentTime}
                </span>
              </div>
              <div className="w-[126px]" />
              <div className="w-[80px] flex items-center justify-end gap-1.5 pt-1 text-slate-900">
                <div className="flex items-end gap-[1.5px] h-3">
                  <span className="w-[2.5px] h-[3px] bg-slate-900 rounded-[0.5px]" />
                  <span className="w-[2.5px] h-[5px] bg-slate-900 rounded-[0.5px]" />
                  <span className="w-[2.5px] h-[7.5px] bg-slate-900 rounded-[0.5px]" />
                  <span className="w-[2.5px] h-[10px] bg-slate-900 rounded-[0.5px]" />
                </div>
                <span className="text-[10px] font-bold tracking-tighter">5G</span>
                <Wifi className="w-3.5 h-3.5 stroke-[2.2]" />
                <div className="flex items-center gap-[1px]">
                  <div className="w-[22px] h-[11px] rounded-[3px] border-[1.2px] border-slate-900 p-[1px] flex items-center">
                    <div className="w-full h-full bg-slate-900 rounded-[1.5px]" />
                  </div>
                  <div className="w-[1.2px] h-[4px] bg-slate-900 rounded-r-[0.5px]" />
                </div>
              </div>
            </div>

            {/* Dynamic Island Sensor */}
            <div className="absolute top-[11px] left-1/2 -translate-x-1/2 z-50 pointer-events-none">
              <div className="bg-black text-white w-[126px] h-[35px] rounded-full shadow-lg flex items-center justify-between px-3">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#121528] border border-blue-900/40 relative flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#182042]" />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/5" />
                </div>
              </div>
            </div>

            {/* ===================================================================
                ★ 用户重点诉求：小程序端顶部右侧增加功能三点栏 (Capsule Bar)
                永久挂载于小程序窗口顶部右侧，支持点击打开操作菜单与关闭
               =================================================================== */}
            <MiniProgramCapsuleBar
              onOpenMenu={() => setIsMenuOpen(true)}
              onCloseMiniApp={() => {
                if (onBackToPortal) {
                  onBackToPortal();
                } else {
                  setIsMenuOpen(true);
                }
              }}
            />

            {/* Toast Notification */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-[88px] left-6 right-6 z-50 max-w-[320px] mx-auto bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-lg flex items-center justify-between text-xs font-medium"
                >
                  <span>{toastMessage}</span>
                  <Check className="w-4 h-4 text-emerald-400" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Screen Content */}
            <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col pt-[44px]">
              {children}
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-[8px] left-0 right-0 flex justify-center pointer-events-none z-50">
              <div className="w-[138px] h-[4.5px] bg-slate-900/35 rounded-full backdrop-blur-xs" />
            </div>

            {/* Floating Window Ball */}
            <MiniProgramFloatingBall
              isVisible={isFloating}
              onRestore={() => triggerToast('已置前点点密信小程序')}
              onClose={() => setIsFloating(false)}
            />

            {/* Action Sheet Menu */}
            <MiniProgramActionSheet
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              isStarred={isStarred}
              onToggleStar={handleToggleStar}
              isFloating={isFloating}
              onToggleFloating={() => setIsFloating(!isFloating)}
              onRestartMiniApp={handleRestart}
              onOpenShareModal={() => setShowShareModal(true)}
              onOpenMomentsShare={() => triggerToast('已生成点点密信朋友圈分享图卡')}
              onOpenSettingsModal={() => setShowSettingsModal(true)}
              onOpenAboutModal={() => setShowAboutModal(true)}
              onExitMiniApp={() => onBackToPortal?.()}
            />

            {/* Share Modal */}
            <MiniProgramShareModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              onConfirmShare={(target) => triggerToast(`已将小程序卡片发送给 ${target}`)}
            />

            {/* Settings Modal */}
            <MiniProgramSettingsModal
              isOpen={showSettingsModal}
              onClose={() => setShowSettingsModal(false)}
            />

            {/* About Modal */}
            <MiniProgramAboutModal
              isOpen={showAboutModal}
              onClose={() => setShowAboutModal(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
