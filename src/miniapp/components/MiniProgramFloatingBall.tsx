/**
 * [MiniProgramFloatingBall]
 * 微信小程序浮窗悬浮球组件
 */

import React from 'react';
import { motion } from 'motion/react';
import { X, Layers } from 'lucide-react';

interface MiniProgramFloatingBallProps {
  isVisible: boolean;
  onRestore: () => void;
  onClose: () => void;
}

export const MiniProgramFloatingBall: React.FC<MiniProgramFloatingBallProps> = ({
  isVisible,
  onRestore,
  onClose,
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="absolute bottom-20 right-4 z-50 flex items-center select-none"
    >
      <div
        onClick={onRestore}
        className="group relative flex items-center gap-2 bg-[#28211b] text-white px-3 py-2 rounded-full shadow-xl border border-white/20 cursor-pointer hover:scale-105 active:scale-95 transition-all"
        title="点点密信小程序浮窗"
      >
        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
          点
        </div>
        <span className="text-[11px] font-medium tracking-tight">点点密信</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white/80 hover:text-white"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </div>
    </motion.div>
  );
};
