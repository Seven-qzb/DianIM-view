import React from 'react';
import { ChatMessage } from '../../types';
import { Copy, MessageSquareQuote, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

export interface CalculatedMenuPosition {
  top: number;
  left?: number;
  right?: number;
}

interface MessageContextMenuProps {
  message: ChatMessage;
  isCurrentUserOwner?: boolean;
  position?: CalculatedMenuPosition | null;
  onClose: () => void;
  onCopy: () => void;
  onQuote: () => void;
  onRevoke: () => void;
  onDelete?: () => void;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  message,
  position,
  onClose,
  onCopy,
  onQuote,
  onRevoke,
}) => {
  // Self messages support "复制", "引用", "撤回"; Other messages show "复制", "引用"
  const isSelf = message.isSelf;

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-50 bg-black/15 select-none pointer-events-auto overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 6 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 6 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center pointer-events-auto z-50"
        style={
          position
            ? {
                position: 'absolute',
                top: `${position.top}px`,
                left: position.left !== undefined ? `${position.left}px` : undefined,
                right: position.right !== undefined ? `${position.right}px` : undefined,
              }
            : {
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }
        }
      >
        {/* Black floating menu pill matching Figure uploaded by user (Image 1) */}
        <div className="bg-[#000000] text-white rounded-2xl shadow-2xl px-5 py-2.5 flex items-center justify-around gap-6 sm:gap-8 border border-white/10">
          {/* 1. 复制 (Copy) */}
          <button
            type="button"
            onClick={onCopy}
            className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
          >
            <Copy className="w-5 h-5 text-white stroke-[1.9] mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[12px] font-medium text-white tracking-wide">复制</span>
          </button>

          {/* 2. 引用 (Quote) */}
          <button
            type="button"
            onClick={onQuote}
            className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
          >
            <MessageSquareQuote className="w-5 h-5 text-white stroke-[1.9] mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[12px] font-medium text-white tracking-wide">引用</span>
          </button>

          {/* 3. 撤回 (Revoke - Only for self message) */}
          {isSelf && (
            <button
              type="button"
              onClick={onRevoke}
              className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
            >
              <RotateCcw className="w-5 h-5 text-white stroke-[1.9] mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[12px] font-medium text-white tracking-wide">撤回</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
