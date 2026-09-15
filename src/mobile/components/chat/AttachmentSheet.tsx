import React from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Camera, Folder, BarChart3, CalendarCheck } from 'lucide-react';

interface AttachmentSheetProps {
  onClose: () => void;
  onPickPhoto: () => void;
  onTakePhoto: () => void;
  onPickFile: () => void;
  onOpenPropagationAnalysis: () => void;
  onOpenMyTasks: () => void;
}

export const AttachmentSheet: React.FC<AttachmentSheetProps> = ({
  onClose,
  onPickPhoto,
  onTakePhoto,
  onPickFile,
  onOpenPropagationAnalysis,
  onOpenMyTasks,
}) => {
  const actions = [
    {
      id: 'album',
      label: '相册',
      icon: ImageIcon,
      iconColor: 'text-slate-700',
      bgColor: 'bg-white',
      onClick: onPickPhoto,
    },
    {
      id: 'camera',
      label: '拍照',
      icon: Camera,
      iconColor: 'text-slate-700',
      bgColor: 'bg-white',
      onClick: onTakePhoto,
    },
    {
      id: 'file',
      label: '文件',
      icon: Folder,
      iconColor: 'text-slate-700',
      bgColor: 'bg-white',
      onClick: onPickFile,
    },
    {
      id: 'analysis',
      label: '传播分析',
      icon: BarChart3,
      iconColor: 'text-slate-700',
      bgColor: 'bg-white',
      onClick: onOpenPropagationAnalysis,
    },
    {
      id: 'tasks',
      label: '我的任务',
      icon: CalendarCheck,
      iconColor: 'text-slate-700',
      bgColor: 'bg-white',
      onClick: onOpenMyTasks,
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 bg-black/35 backdrop-blur-2xs flex items-end justify-center"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-[#F1F3F6] rounded-t-3xl p-5 pb-8 shadow-2xl border-t border-slate-200/90 select-none"
      >
        {/* Top Handle Pill (Matching Image 2) */}
        <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mb-6" />

        {/* 5 Actions Grid Matching Image 2 */}
        <div className="grid grid-cols-4 gap-y-6 gap-x-3 px-2">
          {actions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
              >
                <div className="w-15 h-15 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:border-[#0058BD] group-hover:text-[#0058BD] transition-colors">
                  <Icon className="w-7 h-7 stroke-[1.8]" />
                </div>
                <span className="text-xs text-slate-700 font-medium tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
