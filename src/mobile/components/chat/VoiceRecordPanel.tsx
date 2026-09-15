import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, X, FileText } from 'lucide-react';

interface VoiceRecordPanelProps {
  onCancel: () => void;
  onSendAudio: (duration: number) => void;
  onConvertToText: (recognizedText: string) => void;
}

export const VoiceRecordPanel: React.FC<VoiceRecordPanelProps> = ({
  onCancel,
  onSendAudio,
  onConvertToText,
}) => {
  const [seconds, setSeconds] = useState(1);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleReleaseToSend = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onSendAudio(Math.max(seconds, 2));
  };

  const handleConvertTextClick = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onConvertToText('收到，已完成保密自查，国密通道运转正常。');
  };

  // Wave heights for animated green waveform
  const waveBars = [6, 12, 18, 24, 16, 28, 32, 26, 36, 30, 22, 14, 8, 18, 26, 34, 28, 16, 10, 20, 28, 18, 8];

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      className="bg-[#1E232B] text-white pt-6 pb-8 px-5 rounded-t-3xl shadow-2xl border-t border-slate-700/60 select-none shrink-0"
    >
      {/* Top Recording Status & Seconds */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-xs text-slate-300 font-mono">
          录音中 {seconds}&quot; (SM4加密音频传输)
        </span>
      </div>

      {/* Two Action Buttons: Left "取消", Right "滑到这里 转文字" (Matching Image 4) */}
      <div className="flex items-center justify-between mb-8 px-2">
        {/* Left Cancel Button */}
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center justify-center px-4 py-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-600/60 active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          <span>取消</span>
        </button>

        {/* Right Convert to Text Button */}
        <button
          type="button"
          onClick={handleConvertTextClick}
          className="flex items-center justify-center px-4 py-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-600/60 active:scale-95 transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 mr-1 text-emerald-400" />
          <span>滑到这里 转文字</span>
        </button>
      </div>

      {/* Center "松开 发送" Button & Animated Green Waveform (Matching Image 4) */}
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Animated Green Audio Waveform */}
        <div className="flex items-center justify-center gap-1 h-10 w-full px-8">
          {waveBars.map((height, idx) => (
            <motion.span
              key={idx}
              animate={{
                height: [height * 0.4, height, height * 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8 + (idx % 5) * 0.15,
                ease: 'easeInOut',
              }}
              className="w-1 rounded-full bg-[#10B981]"
              style={{ minHeight: '4px' }}
            />
          ))}
        </div>

        {/* Center Send Action Button */}
        <button
          type="button"
          onClick={handleReleaseToSend}
          className="w-full max-w-[280px] py-3.5 rounded-2xl bg-[#0058BD] hover:bg-[#004CB3] text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-900/40 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Mic className="w-4 h-4" />
          <span>松开 发送</span>
        </button>
      </div>
    </motion.div>
  );
};
