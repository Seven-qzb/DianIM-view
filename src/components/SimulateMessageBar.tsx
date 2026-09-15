import React from 'react';
import { Sparkles, Send, Volume2, BellOff, AlertCircle } from 'lucide-react';
import { ChatSession } from '../types/chat';

interface SimulateMessageBarProps {
  currentSession: ChatSession;
  onSimulateIncoming: (sessionId: string) => void;
  onToggleMute: (sessionId: string) => void;
  onTestSound: () => void;
  lastToast: { message: string; type: 'muted' | 'unmuted' | 'info' } | null;
}

export const SimulateMessageBar: React.FC<SimulateMessageBarProps> = ({
  currentSession,
  onSimulateIncoming,
  onToggleMute,
  onTestSound,
  lastToast,
}) => {
  return (
    <div className="bg-[#f0f6ff]/95 border-b border-[#cfe0fa] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] select-none shrink-0 shadow-2xs">
      {/* Left: Current test status and function description */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 font-semibold text-[#1a56b2]">
          <Sparkles className="w-3 h-3 text-blue-600 animate-spin" />
          <span>免打扰测试：</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-blue-100 text-gray-700 shadow-2xs">
          <span>当前群：</span>
          <span className="font-semibold text-gray-900 max-w-[120px] truncate">{currentSession.name}</span>
          <span
            className={`px-1 py-0.2 rounded text-[10px] font-medium leading-none ${
              currentSession.isMuted
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {currentSession.isMuted ? '🔕 已免打扰(静音)' : '🔔 未免打扰(有声)'}
          </span>
        </div>

        {/* Live dynamic toast feedback */}
        {lastToast && (
          <div
            className={`animate-in fade-in slide-in-from-left duration-200 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 shadow-2xs ${
              lastToast.type === 'muted'
                ? 'bg-amber-50 text-amber-800 border border-amber-300'
                : lastToast.type === 'unmuted'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-blue-50 text-blue-800 border border-blue-300'
            }`}
          >
            <AlertCircle className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate max-w-[280px]">{lastToast.message}</span>
          </div>
        )}
      </div>

      {/* Right: Quick action test buttons */}
      <div className="flex items-center gap-1.5">
        <button
          id="btn-simulate-msg-current"
          onClick={() => onSimulateIncoming(currentSession.id)}
          className="flex items-center gap-1 bg-[#2979ff] hover:bg-[#1a66e5] active:scale-95 text-white font-medium px-2 py-0.8 rounded text-[10px] transition-all shadow-2xs"
          title="模拟接收群消息测试静音与未读累计"
        >
          <Send className="w-3 h-3" />
          <span>模拟接收新消息</span>
        </button>

        <button
          id="btn-quick-toggle-dnd"
          onClick={() => onToggleMute(currentSession.id)}
          className={`flex items-center gap-1 px-2 py-0.8 rounded text-[10px] border font-medium transition-all ${
            currentSession.isMuted
              ? 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
          }`}
          title="切换免打扰"
        >
          {currentSession.isMuted ? (
            <>
              <Volume2 className="w-3 h-3 text-blue-600" />
              <span>关闭免打扰</span>
            </>
          ) : (
            <>
              <BellOff className="w-3 h-3 text-amber-600" />
              <span>开启免打扰</span>
            </>
          )}
        </button>

        <button
          id="btn-test-chime-sound"
          onClick={onTestSound}
          className="flex items-center gap-0.5 text-gray-600 hover:text-blue-600 bg-white hover:bg-blue-50/50 border border-gray-200 px-1.5 py-0.8 rounded text-[10px] transition-colors"
          title="试听铃声"
        >
          <Volume2 className="w-3 h-3 text-gray-500" />
          <span>铃声</span>
        </button>
      </div>
    </div>
  );
};
