import React, { useState, useEffect } from 'react';
import { Wifi, Battery, ShieldCheck, ArrowLeft, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IPhone15ProMaxContainerProps {
  children: React.ReactNode;
  onBackToPortal?: () => void;
  onSwitchToPC?: () => void;
}

export const IPhone15ProMaxContainer: React.FC<IPhone15ProMaxContainerProps> = ({
  children,
  onBackToPortal,
  onSwitchToPC,
}) => {
  const [currentTime, setCurrentTime] = useState('9:41');
  const [isDynamicIslandExpanded, setIsDynamicIslandExpanded] = useState(false);
  const [isFitMode, setIsFitMode] = useState(true);
  const [frameColor, setFrameColor] = useState<'natural' | 'black'>('black');
  const [scaleFactor, setScaleFactor] = useState(1);

  // Update clock to match real time formatted as HH:mm
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

  // Compute adaptive scale factor when isFitMode is active on desktop
  useEffect(() => {
    const calculateScale = () => {
      if (!isFitMode) {
        setScaleFactor(1);
        return;
      }
      if (typeof window !== 'undefined') {
        const windowHeight = window.innerHeight;
        // Total iPhone frame height including bezel is ~956px (932px screen + 24px bezel)
        // Reserve 48px padding for desktop environment
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

  return (
    <div className="min-h-screen bg-[#0D1117] text-slate-100 flex flex-col items-center justify-center relative overflow-x-hidden p-0 sm:p-4 select-none">
      {/* Background Ambient Glow for Desktop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden sm:block">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full" />
        <div className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[450px] bg-indigo-600/8 blur-[120px] rounded-full" />
      </div>

      {/* Top Cross-Terminal Navigation Bar */}
      <div className="w-full max-w-[480px] mb-2 px-1 flex items-center justify-between text-xs z-50">
        <div className="flex items-center gap-2">
          {onBackToPortal && (
            <button
              id="app-top-btn-back-portal"
              type="button"
              onClick={onBackToPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 shadow-md font-semibold cursor-pointer transition-colors border border-slate-700/80"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回多端门户</span>
            </button>
          )}
          {onSwitchToPC && (
            <button
              id="app-top-btn-switch-pc"
              type="button"
              onClick={onSwitchToPC}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white shadow-md font-semibold cursor-pointer transition-colors border border-blue-400/40"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>切换至 PC工作台</span>
            </button>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>APP端已实时同步</span>
        </div>
      </div>

      {/* Top Desktop Adaptation Toolbar */}
      <aside aria-label="屏幕适配控制栏" className="hidden sm:flex items-center justify-between w-full max-w-[480px] mb-3 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-800/80 shadow-lg text-[12px] z-50 text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-200">iPhone 15 Pro Max</span>
          <span className="text-[11px] text-slate-400">430 × 932 pt</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Fit Screen Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsFitMode(!isFitMode)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
              isFitMode
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="切换高度自适应或 1:1 实际物理像素"
          >
            {isFitMode ? '自适应窗口' : '1:1 实际尺寸'}
          </button>

          {/* Color Switcher */}
          <button
            type="button"
            onClick={() => setFrameColor(frameColor === 'black' ? 'natural' : 'black')}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="切换钛金属边框颜色"
          >
            {frameColor === 'black' ? '深空黑钛' : '原色钛'}
          </button>
        </div>
      </aside>

      {/* Scaler Wrapper to handle viewport fit on desktop */}
      <div 
        style={{
          transform: scaleFactor !== 1 ? `scale(${scaleFactor})` : undefined,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-out',
        }}
        className="relative"
      >
        {/* =========================================================================
            iPhone 15 Pro Max Chassis
            Width: 430px screen + 24px bezel = 454px
            Height: 932px screen + 24px bezel = 956px
            Corner radius: 56px
           ========================================================================= */}
        <div
          className={`relative transition-all duration-300 ${
            frameColor === 'black'
              ? 'sm:bg-[#1E1F22] sm:border-[#35373D]'
              : 'sm:bg-[#6D6E71] sm:border-[#A4A5A8]'
          } sm:p-[12px] sm:rounded-[56px] sm:border-[2px] sm:shadow-[0_25px_60px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.08),inset_0_0_3px_1px_rgba(255,255,255,0.12)] w-full sm:w-[454px]`}
        >
          {/* Hardware Buttons on Outer Chassis (Desktop Only) */}
          {/* Left: Action Button */}
          <div className="hidden sm:block absolute -left-[4px] top-[115px] w-[3px] h-[28px] bg-slate-500 rounded-l-xs shadow-xs" />
          {/* Left: Volume Up */}
          <div className="hidden sm:block absolute -left-[4px] top-[162px] w-[3px] h-[52px] bg-slate-500 rounded-l-xs shadow-xs" />
          {/* Left: Volume Down */}
          <div className="hidden sm:block absolute -left-[4px] top-[228px] w-[3px] h-[52px] bg-slate-500 rounded-l-xs shadow-xs" />
          {/* Right: Power / Side Button */}
          <div className="hidden sm:block absolute -right-[4px] top-[180px] w-[3px] h-[78px] bg-slate-500 rounded-r-xs shadow-xs" />

          {/* Top Speaker Ear-piece Slit */}
          <div className="hidden sm:block absolute top-[5px] left-1/2 -translate-x-1/2 w-[58px] h-[3.5px] bg-[#111214] rounded-full z-40 border border-white/5" />

          {/* =====================================================================
              iPhone 15 Pro Max Screen Display Area (Exact 430 × 932 pt)
             ===================================================================== */}
          <div 
            id="iphone-screen-viewport"
            className="w-full sm:w-[430px] h-dvh sm:h-[932px] sm:rounded-[46px] overflow-hidden relative flex flex-col bg-[#F8F9FA] text-slate-900 shadow-inner"
          >
            {/* Top iOS Status Bar (44px on iPhone 15 Pro Max) */}
            <div className="absolute top-0 left-0 right-0 h-[44px] z-40 px-7 flex items-center justify-between pointer-events-none text-slate-900 select-none">
              {/* Left: Clock */}
              <div className="w-[80px] text-left pt-1">
                <span className="font-semibold text-[14.5px] tracking-tight font-sans">
                  {currentTime}
                </span>
              </div>

              {/* Center Spacer for Dynamic Island */}
              <div className="w-[126px]" />

              {/* Right: iOS Signal, WiFi, Battery Icons */}
              <div className="w-[80px] flex items-center justify-end gap-1.5 pt-1 text-slate-900">
                {/* 4-Bar Cellular Signal */}
                <div className="flex items-end gap-[1.5px] h-3">
                  <span className="w-[2.5px] h-[3px] bg-slate-900 rounded-[0.5px]" />
                  <span className="w-[2.5px] h-[5px] bg-slate-900 rounded-[0.5px]" />
                  <span className="w-[2.5px] h-[7.5px] bg-slate-900 rounded-[0.5px]" />
                  <span className="w-[2.5px] h-[10px] bg-slate-900 rounded-[0.5px]" />
                </div>

                {/* 5G Text */}
                <span className="text-[10px] font-bold tracking-tighter">5G</span>

                {/* Wi-Fi Icon */}
                <Wifi className="w-3.5 h-3.5 stroke-[2.2]" />

                {/* Battery with 100% / charge status */}
                <div className="flex items-center gap-[1px]">
                  <div className="w-[22px] h-[11px] rounded-[3px] border-[1.2px] border-slate-900 p-[1px] flex items-center">
                    <div className="w-full h-full bg-slate-900 rounded-[1.5px]" />
                  </div>
                  <div className="w-[1.2px] h-[4px] bg-slate-900 rounded-r-[0.5px]" />
                </div>
              </div>
            </div>

            {/* ===================================================================
                Dynamic Island (灵动岛)
                Dimensions: width 126px, height 35px, rounded-full
               =================================================================== */}
            <div className="absolute top-[11px] left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
              <motion.div
                layout
                onClick={() => setIsDynamicIslandExpanded(!isDynamicIslandExpanded)}
                className={`bg-black text-white cursor-pointer select-none transition-all flex items-center justify-between px-3 ${
                  isDynamicIslandExpanded
                    ? 'w-[320px] h-[64px] rounded-[32px] shadow-2xl p-3'
                    : 'w-[126px] h-[35px] rounded-full shadow-lg'
                }`}
              >
                {!isDynamicIslandExpanded ? (
                  // Compact Dynamic Island
                  <div className="w-full flex items-center justify-between px-1">
                    {/* Left: Security SM4 indicator */}
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    {/* Right: Camera Lens & Face ID Sensor reflection */}
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#121528] border border-blue-900/40 relative flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#182042]" />
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/5" />
                    </div>
                  </div>
                ) : (
                  // Expanded Dynamic Island
                  <div className="w-full flex items-center justify-between px-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#0058BD] flex items-center justify-center text-white">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-white leading-tight">
                          点点密信 · 安全防护中
                        </span>
                        <span className="text-[10px] text-slate-300 leading-tight mt-0.5">
                          SM4 国密端到端信道加密 · 验签有效
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-slate-200">
                      轻触收起
                    </span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Screen Content Container (Scrolls vertically, safe area padded) */}
            <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col pt-[44px]">
              {children}
            </div>

            {/* ===================================================================
                iOS Home Indicator Bar (138px × 5px rounded pill)
               =================================================================== */}
            <div className="absolute bottom-[8px] left-0 right-0 flex justify-center pointer-events-none z-50">
              <div className="w-[138px] h-[4.5px] bg-slate-900/35 rounded-full backdrop-blur-xs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
