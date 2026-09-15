import React from 'react';
import { motion } from 'motion/react';
import { Delete, X } from 'lucide-react';

interface EmojiPickerSheetProps {
  onSelectEmoji: (emoji: string) => void;
  onDeleteChar?: () => void;
  onClose: () => void;
}

export const EMOJIS_GRID = [
  '😀', '🥹', '😍', '🧐', '😎', '😭', '😚',
  '🤐', '🥺', '🤨', '🥵', '😭', '😴', '😜',
  '🙁', '😳', '☺️', '🤭', '🤢', '🤬', '🪖',
  '😃', '🥵', '😏', '😁', '🥳', '🤫', '😰',
  '🫣', '🍳', '💀', '😤', '😮‍💨', '😢', '😆',
  '👍', '👎', '👌', '🤝', '🙏', '👏', '💪',
  '🎉', '🔥', '💣', '❤️', '💯', '✨', '⚡',
];

export const EmojiPickerSheet: React.FC<EmojiPickerSheetProps> = ({
  onSelectEmoji,
  onDeleteChar,
  onClose,
}) => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 260, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="bg-[#F6F7F9] border-t border-slate-200/90 overflow-hidden flex flex-col select-none shrink-0"
    >
      {/* Top action/close bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200/60 bg-white/70">
        <span className="text-[11px] font-semibold text-slate-500">选择表情包</span>
        <div className="flex items-center gap-1">
          {onDeleteChar && (
            <button
              type="button"
              onClick={onDeleteChar}
              className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="退格删除"
            >
              <Delete className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of emojis matching Image 3 */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-7 gap-y-2.5 gap-x-1 text-center items-center">
        {EMOJIS_GRID.map((emoji, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            className="text-2xl hover:scale-125 active:scale-95 transition-transform flex items-center justify-center p-1 rounded-xl hover:bg-white/80 cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
