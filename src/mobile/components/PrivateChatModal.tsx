import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, Send, Smile, AudioLines, Plus, 
  ShieldCheck, Phone, Video, MoreHorizontal, Image as ImageIcon,
  CheckCheck
} from 'lucide-react';
import { SecurityWatermark } from './SecurityWatermark';
import { motion, AnimatePresence } from 'motion/react';
import { AVATARS } from '../data/avatars';

export interface PrivateChatTarget {
  id: string;
  name: string;
  avatar: string;
  department?: string;
  role?: string;
  onlineStatus?: 'online' | 'offline';
}

interface PrivateChatModalProps {
  target: PrivateChatTarget;
  currentUserName?: string;
  currentUserAvatar?: string;
  groupName?: string;
  onClose: () => void;
}

interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isSelf: boolean;
  content: string;
  type: 'text' | 'image' | 'audio';
  timestamp: string;
}

export const PrivateChatModal: React.FC<PrivateChatModalProps> = ({
  target,
  currentUserName = '戚中彪',
  currentUserAvatar = AVATARS.qizhongbiao,
  groupName = '研发部',
  onClose,
}) => {
  // Pre-seeded contextual messages based on who the member is
  const getInitialMessages = (): DirectMessage[] => {
    if (target.name.includes('韩浩')) {
      return [
        {
          id: 'dm-1',
          senderId: target.id,
          senderName: target.name,
          senderAvatar: target.avatar,
          isSelf: false,
          content: '戚工，刚才在群里讨论的那个郑钦文逆转比赛太神了！',
          type: 'text',
          timestamp: '09:27',
        },
        {
          id: 'dm-2',
          senderId: target.id,
          senderName: target.name,
          senderAvatar: target.avatar,
          isSelf: false,
          content: '对了，研发部这期的国密端到端加密插件自测报告我已经整理好了，你方便看下不？',
          type: 'text',
          timestamp: '09:28',
        },
      ];
    } else if (target.name.includes('何坤')) {
      return [
        {
          id: 'dm-1',
          senderId: target.id,
          senderName: target.name,
          senderAvatar: target.avatar,
          isSelf: false,
          content: '戚工，刚才群里发的文件收到没？接口文档和加解密鉴权逻辑都更新了。',
          type: 'text',
          timestamp: '09:18',
        },
      ];
    } else if (target.name.includes('马宸卓')) {
      return [
        {
          id: 'dm-1',
          senderId: target.id,
          senderName: target.name,
          senderAvatar: target.avatar,
          isSelf: false,
          content: '戚工，下午的微服务架构评审你这边准时参加吗？群主说需要你主讲第二部分。',
          type: 'text',
          timestamp: '09:12',
        },
      ];
    } else if (target.name.includes('杨美丽')) {
      return [
        {
          id: 'dm-1',
          senderId: target.id,
          senderName: target.name,
          senderAvatar: target.avatar,
          isSelf: false,
          content: '戚工，上周提报的安全审计日志已经汇总完毕了，你看下需要补充哪些维度？',
          type: 'text',
          timestamp: '09:05',
        },
      ];
    }

    return [
      {
        id: 'dm-1',
        senderId: target.id,
        senderName: target.name,
        senderAvatar: target.avatar,
        isSelf: false,
        content: `戚工你好，我是【${target.name}】，有什么需要组内协同的随时发我私信。`,
        type: 'text',
        timestamp: '09:20',
      },
    ];
  };

  const [messages, setMessages] = useState<DirectMessage[]>(getInitialMessages);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg: DirectMessage = {
      id: `dm-${Date.now()}`,
      senderId: 'self',
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      isSelf: true,
      content,
      type: 'text',
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setShowEmojiPicker(false);

    // Simulated quick intelligent reply after 1.2s
    setTimeout(() => {
      let replyText = '好的戚工，收到！我这就按方案处理，稍后在群里同步结果给你！';
      if (content.includes('？') || content.includes('?')) {
        replyText = '这个问题我刚好排查过，目前环境和配置都是正常的，我把排查日志私发你看看。';
      } else if (content.includes('测试') || content.includes('报告')) {
        replyText = '没问题，测试用例和回归报告已经准备就绪，随时可以进行联调！';
      } else if (content.includes('郑钦文') || content.includes('比赛')) {
        replyText = '确实太燃了！六届大满贯得主都能逆转拿下，太提气了！';
      }

      const replyMsg: DirectMessage = {
        id: `dm-reply-${Date.now()}`,
        senderId: target.id,
        senderName: target.name,
        senderAvatar: target.avatar,
        isSelf: false,
        content: replyText,
        type: 'text',
        timestamp: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
      };

      setMessages((prev) => [...prev, replyMsg]);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Emojis
  const EMOJIS = ['👍', '🤝', '😄', '🙏', '👏', '💪', '👌', '🎉', '☕', '🔥'];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="absolute inset-0 z-50 bg-[#F5F7FB] text-slate-900 flex flex-col w-full h-full overflow-hidden select-none font-sans"
    >
      {/* Background Watermark */}
      <SecurityWatermark name={currentUserName} timestamp="2026/09/08 09:34" />

      {/* Toast Notice */}
      <AnimatePresence>
        {toastNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-60 bg-slate-900/90 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg pointer-events-none backdrop-blur-xs flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-md px-3 pt-3 pb-2.5 border-b border-slate-200/80 flex items-center justify-between shrink-0 z-30 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1 -ml-1 text-slate-700 hover:text-[#0058BD] active:scale-90 transition-transform cursor-pointer rounded-full"
            title="返回群聊"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>

          <div className="relative">
            <img
              src={target.avatar}
              alt={target.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
          </div>

          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-1.5">
              <h2 className="font-semibold text-sm text-slate-900 truncate">
                {target.name}
              </h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.2 rounded font-medium">
                在线
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {groupName} · 组内一对一加密私信
            </p>
          </div>
        </div>

        {/* Right Security Badge */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => triggerToast('国密SM4端到端信道正常')}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-[#0058BD] border border-blue-200 text-[11px] font-medium active:scale-95 transition-all cursor-pointer"
            title="加密状态"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#0058BD]" />
            <span>SM4</span>
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-3 relative z-10 no-scrollbar">
        {/* Encryption Banner */}
        <div className="flex justify-center my-1">
          <div className="bg-blue-50/80 border border-blue-200/80 text-blue-800 text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs max-w-[90%] text-center">
            <ShieldCheck className="w-4 h-4 text-[#0058BD] shrink-0" />
            <span>已建立国密端到端加密私聊通道，消息仅双方可见</span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex justify-center my-1">
          <span className="text-[10px] text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full font-normal">
            今日 09:25
          </span>
        </div>

        {/* Messages */}
        {messages.map((msg) => {
          const isSelf = msg.isSelf;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 items-start ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <img
                src={msg.senderAvatar}
                alt={msg.senderName}
                className="w-8 h-8 rounded-full object-cover shrink-0 shadow-2xs mt-0.5 border border-slate-200"
              />

              <div className={`max-w-[76%] flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                {!isSelf && (
                  <span className="text-[10px] text-slate-400 mb-0.5 px-0.5 font-normal">
                    {msg.senderName}
                  </span>
                )}

                <div
                  className={`relative select-text ${
                    isSelf
                      ? 'bg-[#D4E5FF] text-[#0F172A] rounded-2xl rounded-tr-xs px-3.5 py-2.5 shadow-2xs border border-blue-200/40'
                      : 'bg-white text-slate-900 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-2xs border border-slate-200/80'
                  }`}
                >
                  <p className="text-[13.5px] leading-relaxed break-words whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>

                <div className="flex items-center gap-1 mt-0.5 px-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {msg.timestamp}
                  </span>
                  {isSelf && (
                    <span className="text-[9px] text-[#0058BD] flex items-center gap-0.5 font-medium">
                      <CheckCheck className="w-3 h-3 text-[#0058BD]" />
                      已读
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Quick Suggested Replies Bar */}
      <div className="bg-white/80 backdrop-blur-xs px-3 py-1.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 z-20">
        <span className="text-[10px] text-slate-400 shrink-0">快捷回复:</span>
        {['好的，马上跟进', '已收到，稍后核对', '我看一下方案', '稍后在群里回复你'].map((quick, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(quick)}
            className="text-[11px] text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-[#0058BD] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors border border-slate-200/60 active:scale-95 cursor-pointer"
          >
            {quick}
          </button>
        ))}
      </div>

      {/* Bottom Input Area */}
      <footer className="bg-white border-t border-slate-200/80 p-2.5 pb-5 relative z-20 shrink-0">
        <div className="flex items-center gap-2">
          {/* Plus action button */}
          <button
            type="button"
            onClick={() => triggerToast('支持发送附件、图片和协同工作流')}
            className="w-9 h-9 rounded-full bg-[#E5E7EB] text-slate-700 hover:text-slate-900 active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
            title="更多功能"
          >
            <Plus className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Capsule input container */}
          <div className="flex-1 bg-[#F1F3F5] rounded-full px-3 py-1.5 flex items-center gap-2 border border-slate-200/70 focus-within:border-[#0058BD] focus-within:bg-white transition-all shadow-2xs">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`发私信给 ${target.name}...`}
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none font-normal"
            />

            {/* Emoji button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                showEmojiPicker ? 'text-[#0058BD] bg-blue-50' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="表情包"
            >
              <Smile className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Audio recording placeholder */}
            <button
              type="button"
              onClick={() => triggerToast('语音功能已就绪')}
              className="p-1 text-slate-600 hover:text-slate-900 rounded-full transition-colors cursor-pointer"
              title="语音私信"
            >
              <AudioLines className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            className="w-9 h-9 rounded-full bg-[#0058BD] text-white flex items-center justify-center shadow-xs active:scale-95 cursor-pointer hover:bg-[#004CB3] transition-all shrink-0"
            title="发送"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        {/* Emoji bar if active */}
        {showEmojiPicker && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-around">
            {EMOJIS.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText((prev) => prev + emoji);
                  inputRef.current?.focus();
                }}
                className="text-xl p-1.5 hover:scale-125 active:scale-95 transition-transform cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </footer>
    </motion.div>
  );
};
