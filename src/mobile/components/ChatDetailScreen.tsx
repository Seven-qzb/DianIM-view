import React, { useState, useRef, useEffect } from 'react';
import { ChatConversation, ChatMessage, GroupMember, TaskItem } from '../types';
import { 
  ChevronLeft, SlidersHorizontal, Send, Image as ImageIcon, 
  Mic, Plus, FileText, AlertTriangle, X, 
  Check, Smile, Volume2, VolumeX, Calendar, MessageSquare, AudioLines
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SecurityWatermark } from './SecurityWatermark';
import { ReadStatusModal } from './chat/ReadStatusModal';
import { AttachmentSheet } from './chat/AttachmentSheet';
import { EmojiPickerSheet } from './chat/EmojiPickerSheet';
import { VoiceRecordPanel } from './chat/VoiceRecordPanel';
import { MessageContextMenu, CalculatedMenuPosition } from './chat/MessageContextMenu';
import { PropagationAnalysisModal } from './PropagationAnalysisModal';
import { MyTasksModal } from './MyTasksModal';
import { PrivateChatModal, PrivateChatTarget } from './PrivateChatModal';
import { INITIAL_TASKS, RANDD_MEMBERS } from '../data/mockData';
import { AVATARS } from '../data/avatars';

interface ChatDetailScreenProps {
  conversation: ChatConversation;
  messages: ChatMessage[];
  onBack: () => void;
  onOpenSettings: () => void;
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file' | 'instruction' | 'audio', extra?: any) => void;
  onRevokeMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onSaveDraft?: (convId: string, draft: string) => void;
  onOpenInstructionFlow?: (code: string) => void;
}

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({
  conversation,
  messages,
  onBack,
  onOpenSettings,
  onSendMessage,
  onRevokeMessage,
  onDeleteMessage,
  onSaveDraft,
  onOpenInstructionFlow,
}) => {
  // Input & Draft State: initialize with existing conversation draft if available
  const [inputText, setInputText] = useState(conversation.draft || '');
  
  // Sheet & Panel states matching Figure 1, 2, 3, 4
  const [showAttachMenu, setShowAttachMenu] = useState(false); // Figure 2: Plus menu
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Figure 3: Emoji panel
  const [isVoiceRecordingOpen, setIsVoiceRecordingOpen] = useState(false); // Figure 4: Voice panel
  
  // Modals
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [selectedReadStatusMessage, setSelectedReadStatusMessage] = useState<ChatMessage | null>(null);
  const [activeMenuMessage, setActiveMenuMessage] = useState<ChatMessage | null>(null);
  const [menuPosition, setMenuPosition] = useState<CalculatedMenuPosition | null>(null);
  const [showPropagationAnalysis, setShowPropagationAnalysis] = useState(false);
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [activePrivateTarget, setActivePrivateTarget] = useState<PrivateChatTarget | null>(null);

  // Quote State
  const [quotedMessage, setQuotedMessage] = useState<{ senderName: string; content: string } | null>(null);

  // Audio Playback Simulation State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenMenu = (e: React.MouseEvent, msg: ChatMessage) => {
    e.stopPropagation();
    const bubbleEl = e.currentTarget as HTMLElement;
    const bubbleRect = bubbleEl.getBoundingClientRect();
    const containerRect = chatContainerRef.current?.getBoundingClientRect();

    if (containerRect) {
      const relTop = bubbleRect.top - containerRect.top;
      const relLeft = bubbleRect.left - containerRect.left;
      const relRight = containerRect.right - bubbleRect.right;
      const bubbleHeight = bubbleRect.height;
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      const menuWidth = msg.isSelf ? 230 : 165;
      const menuHeight = 66;

      // Vertical calculation: prefer floating directly above message, else below
      let top = relTop - menuHeight - 10;
      if (top < 65) {
        top = relTop + bubbleHeight + 10;
      }
      // Strictly clamp vertical position within visible chat area
      top = Math.max(64, Math.min(containerHeight - menuHeight - 80, top));

      if (msg.isSelf) {
        // Right-aligned for self messages, matching uploaded photo
        const right = Math.max(16, Math.min(containerWidth - menuWidth - 16, relRight));
        setMenuPosition({ top, right });
      } else {
        // Left-aligned for others' messages
        const left = Math.max(16, Math.min(containerWidth - menuWidth - 16, relLeft));
        setMenuPosition({ top, left });
      }
    } else {
      setMenuPosition({ top: 120, right: 16 });
    }
    setActiveMenuMessage(msg);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keep draft in sync if conversation changes
  useEffect(() => {
    setInputText(conversation.draft || '');
  }, [conversation.id]);

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

  // Real-time draft updating as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    if (onSaveDraft) {
      onSaveDraft(conversation.id, val);
    }
  };

  // Handle back: ensure draft is saved
  const handleBackWithDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(conversation.id, inputText);
    }
    onBack();
  };

  // Send Message
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim(), 'text', {
      quoteMessage: quotedMessage ? { ...quotedMessage } : undefined,
    });

    setInputText('');
    setQuotedMessage(null);
    setShowEmojiPicker(false);
    if (onSaveDraft) {
      onSaveDraft(conversation.id, '');
    }
  };

  // Send Voice Message (Figure 4)
  const handleSendVoiceAudio = (duration: number) => {
    setIsVoiceRecordingOpen(false);
    onSendMessage(`[语音] ${duration}"`, 'audio', {
      audioDuration: duration,
    });
    triggerToast(`已发送 ${duration} 秒加密语音`);
  };

  // Convert Voice to Text (Figure 4)
  const handleVoiceConvertedText = (recognizedText: string) => {
    setIsVoiceRecordingOpen(false);
    const nextText = inputText ? `${inputText} ${recognizedText}` : recognizedText;
    setInputText(nextText);
    if (onSaveDraft) {
      onSaveDraft(conversation.id, nextText);
    }
    triggerToast('已转为文字并填入输入框');
    inputRef.current?.focus();
  };

  // Play audio simulation
  const handleTogglePlayAudio = (msgId: string, duration: number = 3) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(msgId);
      setTimeout(() => {
        setPlayingAudioId(null);
      }, duration * 1000);
    }
  };

  // Local Image Upload via file input
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      onSendMessage('发送了图片', 'image', {
        imageUrl: url,
      });
      triggerToast('图片已发送');
    };
    reader.readAsDataURL(file);
    setShowAttachMenu(false);
  };

  const handleSendMockImage = () => {
    setShowAttachMenu(false);
    onSendMessage('现场取证图像', 'image', {
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    });
    triggerToast('现场取证图片已发送');
  };

  const handleSendMockFile = () => {
    setShowAttachMenu(false);
    onSendMessage('公文附件', 'file', {
      fileInfo: {
        name: '研发部国密端到端通信自查报告(2026).pdf',
        size: '2.4 MB',
        type: 'pdf',
      },
    });
    triggerToast('加密公文已发送');
  };

  // Message Actions
  const handleCopyMessage = (msg: ChatMessage) => {
    navigator.clipboard?.writeText(msg.content);
    triggerToast('已复制到剪贴板');
    setActiveMenuMessage(null);
  };

  const handleQuoteMessage = (msg: ChatMessage) => {
    setQuotedMessage({
      senderName: msg.senderName.replace(' (我)', ''),
      content: msg.type === 'image' ? '[图片]' : msg.type === 'audio' ? `[语音 ${msg.audioDuration || 3}"]` : msg.content,
    });
    setActiveMenuMessage(null);
    inputRef.current?.focus();
  };

  const handleRevoke = (msg: ChatMessage) => {
    if (onRevokeMessage) {
      onRevokeMessage(msg.id);
    }
    setActiveMenuMessage(null);
    triggerToast('已撤回消息 (5分钟内可重新编辑)');
  };

  // Re-edit recalled message
  const handleReEdit = (content: string) => {
    setInputText(content);
    if (onSaveDraft) {
      onSaveDraft(conversation.id, content);
    }
    inputRef.current?.focus();
    triggerToast('已恢复已撤回内容至输入框');
  };

  const handleDelete = (msg: ChatMessage) => {
    if (onDeleteMessage) {
      onDeleteMessage(msg.id);
    }
    setActiveMenuMessage(null);
    triggerToast('消息已删除');
  };

  // Select Emoji from picker
  const handleSelectEmoji = (emoji: string) => {
    const nextVal = `${inputText}${emoji}`;
    setInputText(nextVal);
    if (onSaveDraft) {
      onSaveDraft(conversation.id, nextVal);
    }
  };

  const handleDeleteEmojiChar = () => {
    if (inputText.length > 0) {
      const nextVal = Array.from(inputText).slice(0, -1).join('');
      setInputText(nextVal);
      if (onSaveDraft) {
        onSaveDraft(conversation.id, nextVal);
      }
    }
  };

  // Quick `@` from top avatar bar
  const handleQuickMention = (memberName: string) => {
    const clean = memberName.replace(' (我)', '');
    const nextVal = `${inputText}@${clean} `;
    setInputText(nextVal);
    if (onSaveDraft) {
      onSaveDraft(conversation.id, nextVal);
    }
    inputRef.current?.focus();
  };

  // Member avatars matching Figure 1 (CQX boy, man in jacket, woman at beach, baby)
  const quickMembers = [
    { id: 'qm-chengong', name: '陈工', avatar: AVATARS.chengong },
    { id: 'qm-machenzhuo', name: '马宸卓', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80' },
    { id: 'qm-mayanyan', name: '马言言', avatar: AVATARS.mayanyan },
    { id: 'qm-hanhao', name: '韩浩', avatar: AVATARS.hanhao },
  ];

  const groupMembersList = conversation.members && conversation.members.length > 0 
    ? conversation.members 
    : RANDD_MEMBERS;

  return (
    <div 
      ref={chatContainerRef}
      className="flex flex-col h-full bg-[#F4F5F7] text-slate-900 w-full max-w-[430px] mx-auto relative select-none font-sans overflow-hidden"
    >
      {/* Background Security Watermark (Figure 1: 戚中彪 2026/08/28 16:10 单位：市公安局) */}
      <SecurityWatermark name="戚中彪" timestamp="2026/09/07 17:24" />

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Toast Notice */}
      <AnimatePresence>
        {toastNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 left-6 right-6 z-50 max-w-[360px] mx-auto bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-lg flex items-center justify-between text-xs font-medium"
          >
            <span>{toastNotice}</span>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Matching Figure 1: Back | Title (count) with online count | Sliders settings icon */}
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs shrink-0">
        <button
          onClick={handleBackWithDraft}
          className="p-1.5 -ml-1 text-slate-800 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
          title="返回会话列表"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2]" />
        </button>

        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1">
            <h1 className="font-bold text-[15px] text-slate-900 tracking-tight">
              {conversation.name}
            </h1>
            {conversation.isGroup && (
              <span className="text-[15px] font-bold text-slate-900">
                ({conversation.memberCount || 17})
              </span>
            )}
          </div>
          
          {/* Subtitle Matching Figure 1: 🟢 当前有10人在在线 */}
          <div className="flex items-center gap-1 text-[11px] text-[#22C55E] font-medium leading-none mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] inline-block animate-pulse"></span>
            <span>当前有{conversation.onlineCount || 10}人在在线</span>
          </div>
        </div>

        {/* Group Settings Button (Figure 1: SlidersHorizontal icon) */}
        <button
          id="group-settings-btn"
          onClick={onOpenSettings}
          className="p-2 text-slate-700 hover:text-[#0058BD] hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
          title="群设置"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[2]" />
        </button>
      </header>

      {/* Floating Notice Pill Matching Figure 1: 点点密信 用起来 */}
      <div className="px-3 pt-2 pb-0.5 z-20 shrink-0 flex justify-start">
        <div className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-full px-3 py-1 shadow-2xs text-[11px] text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0058BD]"></span>
          <span>点点密信 用起来</span>
        </div>
      </div>

      {/* Message Feed Canvas */}
      <main className="flex-1 overflow-y-auto px-4 py-2 space-y-3 relative z-10 no-scrollbar">
        {messages.map((msg) => {
          // Centered Time / System Notice (e.g. "09:54", "14:29", "14:41", "15:44")
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="text-slate-400 text-xs px-2.5 py-0.5 rounded font-mono">
                  {msg.content}
                </span>
              </div>
            );
          }

          // Revoked Message Item with [重新编辑] (5 minutes check)
          if (msg.isRevoked) {
            // Check if revoked within 5 minutes (5 * 60 * 1000 = 300,000 ms)
            const isWithin5Minutes = !msg.revokedAt || (Date.now() - msg.revokedAt <= 5 * 60 * 1000);

            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="bg-slate-200/70 text-slate-600 text-xs px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                  <span>你撤回了一条消息</span>
                  {isWithin5Minutes && msg.revokedContent && (
                    <button
                      onClick={() => handleReEdit(msg.revokedContent!)}
                      className="text-[#0058BD] font-semibold hover:underline ml-1 cursor-pointer"
                    >
                      重新编辑
                    </button>
                  )}
                </div>
              </div>
            );
          }

          const isSelf = msg.isSelf;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 items-start ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar: clicking others' avatar opens private chat */}
              <img
                src={msg.senderAvatar || AVATARS.qizhongbiao}
                alt={msg.senderName}
                onClick={() => {
                  if (!isSelf) {
                    setActivePrivateTarget({
                      id: msg.senderId,
                      name: msg.senderName,
                      avatar: msg.senderAvatar || AVATARS.qizhongbiao,
                    });
                  }
                }}
                className={`w-9 h-9 rounded-lg object-cover shrink-0 shadow-2xs mt-0.5 border border-slate-200 ${
                  !isSelf ? 'cursor-pointer active:scale-95 hover:ring-2 hover:ring-[#0058BD]/40' : ''
                }`}
                title={!isSelf ? `点击与 ${msg.senderName} 发起群内私信` : undefined}
              />

              {/* Message Bubble Container */}
              <div className={`max-w-[76%] flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                {/* Sender Name */}
                {!isSelf && (
                  <span className="text-[11px] text-slate-500 mb-1 px-0.5 font-normal">
                    {msg.senderName}
                  </span>
                )}

                <div className="relative group flex items-center gap-1.5">
                  {/* For Self Message: Read/Unread Status Indicator on the LEFT of the bubble (Figure 1: "4" or "...") */}
                  {isSelf && (
                    <div className="flex items-center shrink-0">
                      {msg.unreadMembersCount && msg.unreadMembersCount > 0 ? (
                        /* Unread Count Circle Badge (Figure 1: circle with "4") */
                        <button
                          type="button"
                          onClick={() => setSelectedReadStatusMessage(msg)}
                          className="w-5 h-5 rounded-full border border-slate-300 bg-white text-[11px] font-bold text-slate-600 flex items-center justify-center cursor-pointer hover:border-[#0058BD] hover:text-[#0058BD] shadow-2xs active:scale-90 transition-all"
                          title={`${msg.unreadMembersCount}人未读，点击查看详情`}
                        >
                          {msg.unreadMembersCount}
                        </button>
                      ) : (
                        /* All Read Icon (Figure 1: small speech bubble icon with dots) */
                        <button
                          type="button"
                          onClick={() => setSelectedReadStatusMessage(msg)}
                          className="w-4 h-4 text-slate-400 hover:text-[#0058BD] cursor-pointer flex items-center justify-center transition-colors"
                          title="已全部已读，点击查看详情"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    onClick={(e) => handleOpenMenu(e, msg)}
                    className={`cursor-pointer transition-transform active:scale-[0.99] select-text relative ${
                      isSelf
                        ? 'bg-[#D4E5FF] text-[#0F172A] rounded-2xl rounded-tr-xs px-3.5 py-2.5 shadow-2xs border border-blue-200/40'
                        : 'bg-white text-slate-900 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-2xs border border-slate-200/80'
                    }`}
                  >
                    {/* Quoted Message preview if exists */}
                    {msg.quoteMessage && (
                      <div className={`mb-1.5 text-[11px] px-2.5 py-1 rounded-lg border-l-2 ${
                        isSelf ? 'bg-blue-100/60 border-[#0058BD] text-slate-700' : 'bg-slate-100 border-[#0058BD] text-slate-600'
                      }`}>
                        <span className="font-semibold mr-1">{msg.quoteMessage.senderName}:</span>
                        <span className="truncate">{msg.quoteMessage.content}</span>
                      </div>
                    )}

                    {/* Text Message */}
                    {msg.type === 'text' && (
                      <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    )}

                    {/* Audio Message */}
                    {msg.type === 'audio' && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePlayAudio(msg.id, msg.audioDuration || 3);
                        }}
                        className="flex items-center gap-2 cursor-pointer py-0.5"
                      >
                        <Volume2 className={`w-4 h-4 ${playingAudioId === msg.id ? 'animate-bounce text-[#0058BD]' : 'text-slate-600'}`} />
                        <span className="text-xs font-mono font-medium text-slate-800">
                          {msg.audioDuration || 3}&quot;
                        </span>
                        {/* Audio Wave Bars */}
                        <div className="flex items-center gap-0.5 h-3 ml-1">
                          <span className={`w-0.5 h-2.5 rounded-full ${playingAudioId === msg.id ? 'bg-[#0058BD] animate-pulse' : 'bg-slate-400'}`}></span>
                          <span className={`w-0.5 h-3.5 rounded-full ${playingAudioId === msg.id ? 'bg-[#0058BD] animate-pulse' : 'bg-slate-500'}`}></span>
                          <span className={`w-0.5 h-2 rounded-full ${playingAudioId === msg.id ? 'bg-[#0058BD] animate-pulse' : 'bg-slate-400'}`}></span>
                        </div>
                      </div>
                    )}

                    {/* Image Message */}
                    {msg.type === 'image' && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(msg.imageUrl || null);
                        }}
                        className="rounded-xl overflow-hidden max-w-[200px] max-h-[220px] bg-black/5"
                      >
                        <img
                          src={msg.imageUrl}
                          alt="图片"
                          className="w-full h-auto object-cover hover:opacity-95 transition-opacity"
                        />
                      </div>
                    )}

                    {/* File Message */}
                    {msg.type === 'file' && (
                      <div className="flex items-center gap-2.5 min-w-[180px]">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0058BD] flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate text-slate-800">{msg.fileInfo?.name || '公文附件.pdf'}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{msg.fileInfo?.size || '1.8 MB'}</p>
                        </div>
                      </div>
                    )}

                    {/* Emergency Instruction Message */}
                    {msg.type === 'instruction' && (
                      <div className="min-w-[220px] space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-red-500 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {msg.instructionInfo?.level || '特急'}指令
                          </span>
                          <span className="text-[10px] opacity-75 font-mono">{msg.instructionInfo?.code}</span>
                        </div>
                        <p className="text-xs font-medium">{msg.content}</p>
                      </div>
                    )}
                  </div>

                  {/* For Others' Messages: Right side speech icon (Figure 1: small speech bubble icon on the right of bubble) */}
                  {!isSelf && (
                    <button
                      onClick={(e) => handleOpenMenu(e, msg)}
                      className="p-1 text-slate-400 hover:text-[#0058BD] hover:bg-slate-200/70 rounded-full transition-all shrink-0 cursor-pointer"
                      title="引用 / 复制"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Quoted Message Bar (if user is currently quoting a message) */}
      <AnimatePresence>
        {quotedMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-100 border-t border-slate-200 px-3.5 py-1.5 flex items-center justify-between text-xs text-slate-700 z-20 shrink-0"
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0058BD]" />
              <span className="font-semibold text-slate-900 shrink-0">
                引用 {quotedMessage.senderName}:
              </span>
              <span className="truncate text-slate-500">{quotedMessage.content}</span>
            </div>
            <button
              onClick={() => setQuotedMessage(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Members & Task Bar Matching Figure 1 */}
      <div className="bg-white/95 backdrop-blur-md border-t border-slate-200/70 px-3 py-1.5 flex items-center gap-2.5 overflow-x-auto z-20 shrink-0">
        {/* Task Calendar Icon (Figure 1: Green calendar with black "任务" badge) */}
        <button
          type="button"
          onClick={() => setShowMyTasks(true)}
          className="relative flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-pointer active:scale-95 shrink-0"
          title="群协同任务"
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[8px] px-1 rounded-sm font-bold scale-90">
            任务
          </span>
        </button>

        {/* Member Avatars: Click opens private chat page */}
        {quickMembers.map((m) => (
          <button
            key={m.id}
            onClick={() => setActivePrivateTarget(m)}
            className="relative shrink-0 group flex flex-col items-center active:scale-90 transition-transform cursor-pointer"
            title={`点击与 ${m.name} 发起群内私信`}
          >
            <img
              src={m.avatar}
              alt={m.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-2xs group-hover:border-[#0058BD]"
            />
          </button>
        ))}
      </div>

      {/* Bottom Input Area Matching Figure 1 - Hidden for 我的任务 and 指令流转 */}
      {!conversation.isNoticeSession &&
        !conversation.isTaskSession &&
        conversation.name !== '我的任务' &&
        conversation.name !== '指令流转' &&
        conversation.id !== 'session_my_tasks' &&
        conversation.id !== 'session_notice' && (
          <footer className="bg-white border-t border-slate-200/80 p-2.5 pb-5 relative z-20 shrink-0">
            {/* Mute All Notice Banner */}
            {conversation.isGroup && conversation.isMutedAll && (
              <div className="mb-2 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl flex items-center justify-between text-[11px] text-amber-800">
                <div className="flex items-center gap-1.5">
                  <VolumeX className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>全员禁言中，仅群主和管理员可发言</span>
                </div>
                {conversation.isOwner !== false && (
                  <span className="text-[10px] bg-amber-200/70 px-1.5 py-0.5 rounded text-amber-900 font-medium shrink-0">
                    群主可发言
                  </span>
                )}
              </div>
            )}

            {/* Input Bar or Closed Notice */}
            {conversation.isClosed ? (
              <div className="py-2.5 px-4 bg-slate-100 text-slate-500 rounded-xl text-xs text-center font-medium border border-slate-200">
                该群组已关闭，已转为只读归档状态，无法继续发送消息
              </div>
            ) : conversation.isGroup && conversation.isMutedAll && conversation.isOwner === false ? (
              <div className="py-2.5 px-4 bg-amber-50/80 text-amber-700 rounded-xl text-xs text-center font-medium border border-amber-200/80 flex items-center justify-center gap-1.5">
                <VolumeX className="w-4 h-4 text-amber-600" />
                <span>全员禁言中，仅群主和管理员可以发言</span>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex items-center gap-2">
                {/* Plus Button on Far Left Matching Figure 1: Circle gray plus */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(!showAttachMenu);
                    setShowEmojiPicker(false);
                    setIsVoiceRecordingOpen(false);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    showAttachMenu
                      ? 'bg-blue-100 text-[#0058BD]'
                      : 'bg-[#E5E7EB] text-slate-700 hover:text-slate-900 active:scale-95'
                  }`}
                  title="更多功能"
                >
                  <Plus className="w-5 h-5 stroke-[2.2]" />
                </button>

                {/* Input Bar Container Matching Figure 1: Rounded pill container */}
                <div className="flex-1 bg-[#F1F3F5] rounded-full px-3 py-1.5 flex items-center gap-2 border border-slate-200/70 focus-within:border-[#0058BD] focus-within:bg-white transition-all shadow-2xs">
                  {/* Text Input with Real-time Draft Preservation */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder={
                      conversation.isGroup && conversation.isMutedAll
                        ? '全员禁言中（您是群主，可发言）'
                        : '输入信息...'
                    }
                    className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none font-normal"
                  />

                  {/* Smile Emoji Button Matching Figure 1 */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowAttachMenu(false);
                      setIsVoiceRecordingOpen(false);
                    }}
                    className={`p-1 rounded-full transition-colors cursor-pointer ${
                      showEmojiPicker ? 'text-[#0058BD] bg-blue-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="选择表情包"
                  >
                    <Smile className="w-5 h-5 stroke-[1.8]" />
                  </button>

                  {/* Voice Button Matching Figure 1: Audio lines / soundwave lines inside */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsVoiceRecordingOpen(!isVoiceRecordingOpen);
                      setShowEmojiPicker(false);
                      setShowAttachMenu(false);
                    }}
                    className={`p-1 rounded-full transition-colors cursor-pointer ${
                      isVoiceRecordingOpen ? 'text-[#0058BD] bg-blue-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="语音输入"
                  >
                    <AudioLines className="w-5 h-5 stroke-[1.8]" />
                  </button>
                </div>

                {/* Send Button if input has content */}
                {inputText.trim().length > 0 && (
                  <button
                    type="submit"
                    className="w-9 h-9 rounded-full bg-[#0058BD] text-white flex items-center justify-center shadow-xs active:scale-95 cursor-pointer hover:bg-[#004CB3] transition-all shrink-0"
                    title="发送"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                )}
              </form>
            )}
          </footer>
        )}

      {/* Slide-up Plus Menu Sheet (Figure 2) */}
      <AnimatePresence>
        {showAttachMenu && (
          <AttachmentSheet
            onClose={() => setShowAttachMenu(false)}
            onPickPhoto={() => fileInputRef.current?.click()}
            onTakePhoto={handleSendMockImage}
            onPickFile={handleSendMockFile}
            onOpenPropagationAnalysis={() => setShowPropagationAnalysis(true)}
            onOpenMyTasks={() => setShowMyTasks(true)}
          />
        )}
      </AnimatePresence>

      {/* Slide-up Emoji Picker Panel (Figure 3) */}
      <AnimatePresence>
        {showEmojiPicker && (
          <EmojiPickerSheet
            onSelectEmoji={handleSelectEmoji}
            onDeleteChar={handleDeleteEmojiChar}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-up Voice Recording Panel (Figure 4) */}
      <AnimatePresence>
        {isVoiceRecordingOpen && (
          <VoiceRecordPanel
            onCancel={() => setIsVoiceRecordingOpen(false)}
            onSendAudio={handleSendVoiceAudio}
            onConvertToText={handleVoiceConvertedText}
          />
        )}
      </AnimatePresence>

      {/* Message Action Context Menu (复制, 引用, 撤回, 删除) */}
      <AnimatePresence>
        {activeMenuMessage && (
          <MessageContextMenu
            message={activeMenuMessage}
            position={menuPosition}
            isCurrentUserOwner={conversation.isOwner}
            onClose={() => {
              setActiveMenuMessage(null);
              setMenuPosition(null);
            }}
            onCopy={() => handleCopyMessage(activeMenuMessage)}
            onQuote={() => handleQuoteMessage(activeMenuMessage)}
            onRevoke={() => handleRevoke(activeMenuMessage)}
            onDelete={() => handleDelete(activeMenuMessage)}
          />
        )}
      </AnimatePresence>

      {/* Read/Unread Status Details Modal */}
      <AnimatePresence>
        {selectedReadStatusMessage && (
          <ReadStatusModal
            message={selectedReadStatusMessage}
            groupMembers={groupMembersList}
            onClose={() => setSelectedReadStatusMessage(null)}
            onRemindUnread={() => triggerToast('已向未读成员发送加急提醒')}
          />
        )}
      </AnimatePresence>

      {/* Propagation Analysis Modal */}
      <AnimatePresence>
        {showPropagationAnalysis && (
          <PropagationAnalysisModal
            onClose={() => setShowPropagationAnalysis(false)}
            institutionName={conversation.institutionName}
          />
        )}
      </AnimatePresence>

      {/* My Tasks Modal */}
      <AnimatePresence>
        {showMyTasks && (
          <MyTasksModal
            tasks={INITIAL_TASKS}
            onClose={() => setShowMyTasks(false)}
          />
        )}
      </AnimatePresence>

      {/* 1-on-1 Group Member Private Chat Modal */}
      <AnimatePresence>
        {activePrivateTarget && (
          <PrivateChatModal
            target={activePrivateTarget}
            currentUserName="戚中彪"
            groupName={conversation.name}
            onClose={() => setActivePrivateTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={previewImage}
            alt="预览"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
