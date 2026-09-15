import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Copy,
  Check,
  ChevronUp,
  FileText,
  Volume2,
  RefreshCw,
  MessageSquareQuote,
  Undo2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, VoiceData } from '../types/chat';
import { soundService } from '../services/audioService';

interface VoiceMessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  onToggleTranscribe: (messageId: string) => void;
  onCopyText?: (text: string) => void;
  onQuoteMessage?: (msg: ChatMessage) => void;
  onRecallMessage?: (messageId: string) => void;
  renderReadBadge?: React.ReactNode;
  isActiveMenu?: boolean;
  onToggleMenu?: () => void;
  onCloseMenu?: () => void;
}

// Preset decorative sound wave bar heights
const WAVE_BARS = [
  6, 12, 18, 10, 16, 22, 14, 8, 20, 15, 24, 18, 12, 16, 20, 14, 10, 18, 12, 6,
];

export const VoiceMessageBubble: React.FC<VoiceMessageBubbleProps> = ({
  message,
  isCurrentUser,
  onToggleTranscribe,
  onCopyText,
  onQuoteMessage,
  onRecallMessage,
  renderReadBadge,
  isActiveMenu,
  onToggleMenu,
  onCloseMenu,
}) => {
  const voiceData: VoiceData = message.voiceData || {
    duration: 10,
    transcription: message.content || '（语音消息）',
    isTranscribed: false,
    isTranscribing: false,
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isListened, setIsListened] = useState(voiceData.isListened || false);
  const [copied, setCopied] = useState(false);
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);

  const isMenuOpen = isActiveMenu !== undefined ? isActiveMenu : internalMenuOpen;

  const handleCloseMenu = () => {
    if (onCloseMenu) {
      onCloseMenu();
    } else {
      setInternalMenuOpen(false);
    }
  };

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleMenu) {
      onToggleMenu();
    } else {
      setInternalMenuOpen((prev) => !prev);
    }
  };

  const stopPlaybackRef = useRef<(() => void) | null>(null);

  // Stop playback when component unmounts
  useEffect(() => {
    return () => {
      if (stopPlaybackRef.current) {
        stopPlaybackRef.current();
      }
    };
  }, []);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      if (stopPlaybackRef.current) {
        stopPlaybackRef.current();
        stopPlaybackRef.current = null;
      }
      setIsPlaying(false);
      setPlaybackProgress(0);
      setElapsedTime(0);
    } else {
      setIsListened(true);
      setIsPlaying(true);
      setPlaybackProgress(0);
      setElapsedTime(0);

      const stopFn = soundService.playVoiceAudio(
        voiceData.transcription,
        voiceData.duration || 6,
        (elapsed, total) => {
          setElapsedTime(Math.round(elapsed));
          setPlaybackProgress(total > 0 ? elapsed / total : 0);
        },
        () => {
          setIsPlaying(false);
          setPlaybackProgress(0);
          setElapsedTime(0);
          stopPlaybackRef.current = null;
        }
      );

      stopPlaybackRef.current = stopFn;
    }
  };

  const handleCopyTranscription = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!voiceData.transcription) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(voiceData.transcription);
    }
    setCopied(true);
    onCopyText?.(voiceData.transcription);
    setTimeout(() => setCopied(false), 1800);
  };

  // Calculate bubble width based on audio duration (minimum ~140px, maximum ~240px)
  const duration = voiceData.duration || 5;
  const bubbleWidthPx = Math.min(250, Math.max(140, 120 + duration * 4.2));

  return (
    <div className="relative flex flex-col gap-1.5 select-none group/voice">
      {/* Voice Bubble Row */}
      <div className="flex items-center gap-2">
        {isCurrentUser && renderReadBadge}

        <div className="relative">
          <div
            id={`voice-bubble-${message.id}`}
            onClick={handleToggleMenu}
            style={{ width: `${bubbleWidthPx}px` }}
            className={`message-bubble-click-trigger relative rounded-xl px-3 py-2 shadow-2xs cursor-pointer transition-all border ${
              isCurrentUser
                ? 'bg-[#d4e4ff] text-blue-950 border-blue-200/80 hover:bg-[#c9dcfa]'
                : 'bg-[#f0f2f5] text-gray-800 border-gray-200/60 hover:bg-[#e7eaf0]'
            } ${isMenuOpen ? 'ring-2 ring-blue-400/50 shadow-xs' : ''}`}
            title="点击展开功能菜单 (转文字、引用、复制、撤回)"
          >
            {/* Voice Player Controls & Waveform */}
            <div className="flex items-center gap-2">
              {/* Play/Pause Button */}
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-2xs cursor-pointer ${
                  isPlaying
                    ? 'bg-blue-600 text-white animate-pulse'
                    : isCurrentUser
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                title={isPlaying ? '暂停播放' : '点击播放语音'}
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3 fill-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                )}
              </button>

              {/* Animated Sound Wave Bars */}
              <div
                className="flex-1 flex items-center justify-between gap-[2px] h-5 overflow-hidden px-1"
                onClick={handleTogglePlay}
              >
                {WAVE_BARS.map((barHeight, idx) => {
                  const barRatio = idx / WAVE_BARS.length;
                  const isPassed = isPlaying && barRatio <= playbackProgress;
                  const dynamicHeight = isPlaying
                    ? Math.max(3, Math.min(20, barHeight + Math.sin(idx + elapsedTime * 6) * 6))
                    : Math.min(18, barHeight);

                  return (
                    <span
                      key={idx}
                      style={{ height: `${dynamicHeight}px` }}
                      className={`w-[2.2px] rounded-full transition-all duration-150 ${
                        isPassed
                          ? 'bg-blue-600'
                          : isPlaying
                          ? 'bg-blue-400/80'
                          : isCurrentUser
                          ? 'bg-blue-400/60'
                          : 'bg-gray-300'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Duration Display */}
              <div className="text-xs font-mono font-semibold tracking-tight text-gray-700 shrink-0">
                {isPlaying ? `${elapsedTime}"` : `${duration}"`}
              </div>
            </div>

            {/* Playback progress line if playing */}
            {isPlaying && (
              <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-100"
                  style={{ width: `${Math.min(100, playbackProgress * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Action Popover Menu (点击消息后弹出的功能栏) */}
          {isMenuOpen && (
            <div
              className={`message-action-menu absolute top-0 bg-white rounded-xl shadow-lg border border-gray-100/90 p-1 min-w-[105px] z-50 animate-in fade-in zoom-in-95 duration-100 select-none ${
                isCurrentUser ? 'right-full mr-2' : 'left-full ml-2'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 1. 转为文字 / 收起文字 */}
              <button
                type="button"
                onClick={() => {
                  handleCloseMenu();
                  onToggleTranscribe(message.id);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors text-left font-medium"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{voiceData.isTranscribed ? '收起文字' : '转为文字'}</span>
              </button>

              {/* 2. 播放/暂停 */}
              <button
                type="button"
                onClick={(e) => {
                  handleCloseMenu();
                  handleTogglePlay(e);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-left font-normal"
              >
                <Volume2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span>{isPlaying ? '暂停播放' : '播放语音'}</span>
              </button>

              {/* 3. 复制文字 (若已识别转录) */}
              {voiceData.isTranscribed && voiceData.transcription && (
                <button
                  type="button"
                  onClick={(e) => {
                    handleCloseMenu();
                    handleCopyTranscription(e);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-left font-normal"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span>复制文字</span>
                </button>
              )}

              {/* 4. 引用 */}
              <button
                type="button"
                onClick={() => {
                  handleCloseMenu();
                  onQuoteMessage?.(message);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-left font-normal"
              >
                <MessageSquareQuote className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span>引用</span>
              </button>

              {/* 5. 撤回 (仅当前用户) */}
              {isCurrentUser && (
                <button
                  type="button"
                  onClick={() => {
                    handleCloseMenu();
                    onRecallMessage?.(message.id);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-left font-normal"
                >
                  <Undo2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span>撤回</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Unlistened red dot for recipient */}
        {!isListened && !isCurrentUser && (
          <span
            className="w-2 h-2 rounded-full bg-red-500 shrink-0 shadow-2xs"
            title="未收听语音"
          />
        )}

        {!isCurrentUser && renderReadBadge}
      </div>

      {/* Transcribed Text Container (点击功能栏中“转为文字”后展开展示) */}
      <AnimatePresence>
        {(voiceData.isTranscribing || voiceData.isTranscribed) && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div
              className={`rounded-xl p-2.5 text-xs border shadow-xs max-w-[380px] transition-colors ${
                isCurrentUser
                  ? 'bg-blue-50/90 border-blue-200 text-gray-900'
                  : 'bg-slate-50/95 border-slate-200 text-gray-800'
              }`}
            >
              {/* Header inside transcription card */}
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-gray-200/50 text-[11px]">
                <div className="flex items-center gap-1.5 text-blue-700 font-medium">
                  <FileText className="w-3 h-3 text-blue-600" />
                  <span>转文字</span>
                </div>

                {voiceData.isTranscribed && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyTranscription}
                      className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                      title="复制文字"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>复制</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleTranscribe(message.id)}
                      className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                      title="收起转文字"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Body Content */}
              {voiceData.isTranscribing ? (
                <div className="flex items-center gap-2 py-1 text-amber-700 text-[11px]">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                  <span className="animate-pulse">正在转文字...</span>
                </div>
              ) : (
                <div className="leading-relaxed whitespace-pre-wrap select-text text-gray-800 text-[12px] font-normal">
                  {voiceData.transcription || '（未能识别到清晰语音）'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
