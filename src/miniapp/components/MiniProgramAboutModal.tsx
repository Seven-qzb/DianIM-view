/**
 * [MiniProgramAboutModal]
 * 关于点点密信小程序模态框
 */

import React from 'react';
import { X, ShieldCheck, CheckCircle2, Lock, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MiniProgramAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MiniProgramAboutModal: React.FC<MiniProgramAboutModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 select-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="relative w-full max-w-[340px] bg-white rounded-2xl p-5 shadow-2xl z-10 border border-slate-200 text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#28211b] text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3 shadow-md">
              <span>点</span>
            </div>

            <h3 className="font-bold text-base text-slate-900 mb-0.5">
              点点密信小程序
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              版本号 V8.2.1-MP (Build 2026.09)
            </p>

            <div className="space-y-2 text-left bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-4 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">主体开发者</span>
                <span className="font-medium text-slate-800">点点密信生态技术团队</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">服务类目</span>
                <span className="font-medium text-slate-800">协同办公 · 企业即时通讯</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">加密标准</span>
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  SM4 国密端到端信道
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">多端互通</span>
                <span className="font-medium text-blue-600">APP端 / PC端 双向实时同频</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              知道了
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
