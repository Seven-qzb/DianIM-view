/**
 * [View - PortalView]
 * 多端统一门户视图 (Thin View)
 * 纯UI渲染展示 APP端 与 PC端 入口
 */

import React, { useState } from 'react';
import {
  Layers,
  Smartphone,
  Monitor,
  ArrowRight,
  CheckCircle2,
  Lock,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { CURRENT_USER } from '../../data/mockData';

export interface PortalViewProps {
  onSelectTerminal: (terminal: 'pc' | 'app' | 'miniapp') => void;
}

export const PortalView: React.FC<PortalViewProps> = ({ onSelectTerminal }) => {
  const [hoveredCard, setHoveredCard] = useState<'app' | 'pc' | 'miniapp' | null>(null);

  return (
    <div className="w-full min-h-screen bg-[#f7f4ec] text-[#28211b] font-sans flex flex-col justify-between select-none overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="w-full px-6 md:px-12 py-5 flex items-center justify-between border-b border-[#ece4d6]/80 bg-[#f7f4ec]/80 backdrop-blur-xs sticky top-0 z-20">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#28211b] text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
            <span>点</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-[#28211b] tracking-tight">
                点点密信
              </span>
              <span className="bg-[#d9483b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                V8
              </span>
            </div>
            <span className="text-xs text-[#786b5e] font-normal leading-tight mt-0.5">
              综合加密与多端协同生态平台
            </span>
          </div>
        </div>

        {/* Right: Security Gateway Status & Current User Info */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eee7dc] border border-[#e2d8ca] text-xs text-[#5c5043]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">国密安全网关运行中</span>
          </div>

          <div className="flex items-center gap-2.5 pl-2 border-l border-[#e2d8ca]">
            <img
              src={CURRENT_USER.avatar}
              alt={CURRENT_USER.name}
              className="w-8 h-8 rounded-full object-cover border border-white shadow-2xs"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#28211b] leading-tight">
                {CURRENT_USER.name}
              </span>
              <span className="text-[10px] text-[#786b5e] leading-tight mt-0.5">
                {CURRENT_USER.department}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 md:py-16 flex flex-col items-center justify-center">
        {/* Top Tag / Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#eee7dc] border border-[#e2d8ca] text-[#5c5043] text-xs font-medium shadow-2xs mb-4"
        >
          <Layers className="w-3.5 h-3.5 text-[#8c6b3e]" />
          <span>多端 登录与系统门户</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="text-3xl sm:text-4xl md:text-[42px] font-black text-[#28211b] tracking-tight text-center leading-tight"
        >
          点点密信v8管理平台
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="text-sm md:text-base text-[#6f6153] text-center mt-3 max-w-xl font-normal"
        >
          请根据您的业务场景与使用设备选择进入对应的业务工作端
        </motion.p>

        {/* Multi-Terminal Cards Grid (Mini Program, APP, PC) */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-7 mt-10 md:mt-12">
          {/* Card 1: 小程序端 (微信小程序原生胶囊三点栏轻应用) */}
          <motion.div
            id="card-terminal-miniapp"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onMouseEnter={() => setHoveredCard('miniapp')}
            onMouseLeave={() => setHoveredCard(null)}
            className="group relative bg-white rounded-3xl p-7 md:p-8 border border-[#e6ddd0] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(5,150,105,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border-t-4 border-t-[#059669] ring-1 ring-emerald-500/10"
          >
            <div>
              <div className="w-13 h-13 rounded-2xl bg-[#064E3B] text-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform relative">
                <Smartphone className="w-6 h-6 text-emerald-300" />
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px] font-black shadow-xs">
                  •••
                </span>
              </div>

              <div className="flex items-center gap-2.5 mb-3">
                <h3 className="text-2xl font-bold text-[#28211b] tracking-tight">
                  小程序端
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  顶部功能三点栏
                </span>
              </div>

              <p className="text-xs text-[#786b5e] leading-relaxed mb-5 min-h-[52px]">
                根据 APP端 原型 100% 深度复制，顶部右侧专属集成原生微信胶囊「功能三点栏」，支持直接轻量进入，提供转发给朋友、星标收藏、浮窗切换、公文签署与多端同频互通。
              </p>

              <div className="space-y-2 mb-6 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-2 text-[11.5px] text-[#5c5043]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>右上角专属功能三点栏 · 胶囊操作抽屉</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-[#5c5043]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>转发/收藏/重新进入/浮窗与全功能同步</span>
                </div>
              </div>
            </div>

            <button
              id="btn-enter-miniapp"
              type="button"
              onClick={() => onSelectTerminal('miniapp')}
              className="w-full py-3 px-4 rounded-xl bg-[#064E3B] hover:bg-[#043327] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs active:scale-[0.99]"
            >
              <span>进入 小程序端</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Card 2: APP端 */}
          <motion.div
            id="card-terminal-app"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            onMouseEnter={() => setHoveredCard('app')}
            onMouseLeave={() => setHoveredCard(null)}
            className="group relative bg-white rounded-3xl p-7 md:p-8 border border-[#e6ddd0] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(25,103,210,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border-t-4 border-t-[#2979ff]"
          >
            <div>
              <div className="w-13 h-13 rounded-2xl bg-[#1a2d48] text-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <Smartphone className="w-6 h-6 text-blue-300" />
              </div>

              <div className="flex items-center gap-2.5 mb-3">
                <h3 className="text-2xl font-bold text-[#28211b] tracking-tight">
                  APP端
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                  原生客户端
                </span>
              </div>

              <p className="text-xs text-[#786b5e] leading-relaxed mb-5 min-h-[52px]">
                全新设计构建原生态完整合入项目，点击直接在当前页面打开原生交互，支持随身加密会话、按住录音对讲、现场水印拍照存证与国密安全中心。
              </p>

              <div className="space-y-2 mb-6 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-2 text-[11.5px] text-[#5c5043]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>无需打开新应用 · 原生触碰自适应</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-[#5c5043]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>极佳按键语音对讲 · 现场水印拍照存证</span>
                </div>
              </div>
            </div>

            <button
              id="btn-enter-app"
              type="button"
              onClick={() => onSelectTerminal('app')}
              className="w-full py-3 px-4 rounded-xl bg-[#1c2c44] hover:bg-[#0f1b2c] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs active:scale-[0.99]"
            >
              <span>进入 APP端系统</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Card 3: PC端 */}
          <motion.div
            id="card-terminal-pc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            onMouseEnter={() => setHoveredCard('pc')}
            onMouseLeave={() => setHoveredCard(null)}
            className="group relative bg-white rounded-3xl p-7 md:p-8 border border-[#e6ddd0] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(40,33,27,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border-t-4 border-t-[#28211b] ring-1 ring-[#28211b]/10"
          >
            <div>
              <div className="w-13 h-13 rounded-2xl bg-[#28211b] text-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <Monitor className="w-6 h-6 text-emerald-300" />
              </div>

              <div className="flex items-center gap-2.5 mb-3">
                <h3 className="text-2xl font-bold text-[#28211b] tracking-tight">
                  PC端
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300/80">
                  专业工作台
                </span>
              </div>

              <p className="text-xs text-[#786b5e] leading-relaxed mb-5 min-h-[52px]">
                桌面级全能协同矩阵，包含大屏群组沉浸通讯、多端语音播放转文字、待办指令中心、文档加密流转及系统安全配置。
              </p>

              <div className="space-y-2 mb-6 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-2 text-[11.5px] text-[#5c5043]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>支持移动端设备指示灯 · 快捷文字变声</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-[#5c5043]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>群组治理、任务看板、多维条件检索管理</span>
                </div>
              </div>
            </div>

            <button
              id="btn-enter-pc"
              type="button"
              onClick={() => onSelectTerminal('pc')}
              className="w-full py-3 px-4 rounded-xl bg-[#28211b] hover:bg-[#14100d] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm active:scale-[0.99]"
            >
              <span>进入 PC客户端系统</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>

        {/* Bottom Lock Info */}
        <div className="mt-14 text-center text-xs text-[#8c7e70] flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#8c6b3e]" />
          <span>点点密信 V8.2 企业级端到端加密系统 · 全域双端同频互通已就绪</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-[#a09384] border-t border-[#ece4d6]/60">
        点点密信 © 2026 版权所有 · 综合云端与演练实障系统平台
      </footer>
    </div>
  );
};
export default PortalView;
