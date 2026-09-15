import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  MoreVertical,
  Minus,
  Square,
  X,
  Smile,
  Image as ImageIcon,
  Paperclip,
  Scissors,
  ChevronDown,
  ArrowDown,
  BarChart2,
  Calendar,
  Bell,
  BellOff,
  MessageSquare,
  MessageSquareQuote,
  Copy,
  Share2,
  ListTodo,
  Undo2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  Megaphone,
  ClipboardCheck,
  Smartphone,
  Mic,
} from 'lucide-react';
import { ChatSession, ChatMessage, UserMember, TaskDirective, QuotedMessageData, GroupTask, GroupTaskStatus } from '../types/chat';
import { WatermarkBackground } from './WatermarkBackground';
import { CURRENT_USER, INITIAL_DIRECTIVES, INITIAL_GROUP_TASKS } from '../data/mockData';
import { GroupAvatar } from './GroupAvatar';
import { ImageGalleryModal } from './ImageGalleryModal';
import { MemberProfileModal } from './MemberProfileModal';
import { MessageForwardModal } from './MessageForwardModal';
import { DirectiveFlowModal } from './DirectiveFlowModal';
import { PropagationH5Modal } from './PropagationH5Modal';
import { MessageReadDetailModal } from './MessageReadDetailModal';
import { GroupTaskPanel } from './GroupTaskPanel';
import { CreateGroupTaskModal } from './CreateGroupTaskModal';
import { ChatHistoryDrawer } from './ChatHistoryDrawer';
import { VoiceMessageBubble } from './VoiceMessageBubble';
import { useChat } from '../context/ChatContext';

interface ChatAreaProps {
  session: ChatSession;
  messages: ChatMessage[];
  allSessions: ChatSession[];
  draftText?: string;
  onSendMessage: (
    content: string,
    type?: 'text' | 'image' | 'push_card' | 'directive',
    directive?: TaskDirective,
    quoteData?: QuotedMessageData
  ) => void;
  onSaveDraft?: (sessionId: string, draft: string) => void;
  onRecallMessage?: (messageId: string) => void;
  onForwardMessages?: (targetSessionIds: string[], messages: ChatMessage[]) => void;
  onCreateDirective?: (directive: TaskDirective) => void;
  onUpdateDirectiveStatus?: (directiveId: string, newStatus: 'pending' | 'in_progress' | 'completed') => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onToggleMute: (sessionId: string) => void;
  onToggleReminderTrack?: (sessionId: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  session,
  messages,
  allSessions,
  draftText = '',
  onSendMessage,
  onSaveDraft,
  onRecallMessage,
  onForwardMessages,
  onCreateDirective,
  onUpdateDirectiveStatus,
  onToggleSidebar,
  isSidebarOpen,
  onToggleMute,
  onToggleReminderTrack,
}) => {
  const [inputText, setInputText] = useState(draftText);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [quotedMessage, setQuotedMessage] = useState<QuotedMessageData | null>(null);
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const [selectedMember, setSelectedMember] = useState<UserMember | null>(null);
  const [forwardMessage, setForwardMessage] = useState<ChatMessage | null>(null);

  const [activeDirective, setActiveDirective] = useState<TaskDirective | null>(null);
  const [isDirectiveModalOpen, setIsDirectiveModalOpen] = useState(false);

  const [isPropagationModalOpen, setIsPropagationModalOpen] = useState(false);
  const [isReadDetailModalOpen, setIsReadDetailModalOpen] = useState(false);
  const [selectedReadMessage, setSelectedReadMessage] = useState<ChatMessage | null>(null);

  // Group Task Module states
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [groupTasks, setGroupTasks] = useState<GroupTask[]>(() => INITIAL_GROUP_TASKS);

  // Chat History Drawer state
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  const {
    chatCount,
    resetChatCount,
    toggleVoiceTranscription,
    sendSimulatedVoiceMessage,
  } = useChat();

  const handleCreateGroupTask = (data: {
    title: string;
    content: string;
    assigneeName: string;
    assigneeId: string;
    assigneeAvatar?: string;
    deadline?: string;
    isPublic: boolean;
  }) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newTask: GroupTask = {
      id: `gt-${Date.now()}`,
      title: data.title,
      content: data.content,
      status: 'pending_receive',
      creatorName: CURRENT_USER.name,
      creatorId: CURRENT_USER.id,
      assigneeName: data.assigneeName,
      assigneeId: data.assigneeId,
      assigneeAvatar: data.assigneeAvatar,
      createdAt: formattedDate,
      deadline: data.deadline,
      isPublic: data.isPublic,
      sessionId: session.id,
    };

    setGroupTasks((prev) => [newTask, ...prev]);
    showToast('任务已成功下发');

    onSendMessage(
      `【下发任务】${data.title}（处理人: ${data.assigneeName}，限期: ${data.deadline || '未指定'}）`,
      'text'
    );
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: GroupTaskStatus) => {
    setGroupTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    showToast('任务状态已更新');
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const emojis = ['😀', '😂', '😉', '😊', '😍', '🤔', '👍', '👎', '👌', '🤝', '👏', '🙏', '🎉', '❤️', '🔥', '💯', '✨', '⚡', '🤖', '💩'];

  // Auto-close task panel, history drawer & create task modal when switching sessions/groups
  useEffect(() => {
    setIsTaskPanelOpen(false);
    setIsHistoryDrawerOpen(false);
    setIsCreateTaskModalOpen(false);
  }, [session.id]);

  // When group info sidebar opens, close task panel & history drawer to prevent conflicts
  useEffect(() => {
    if (isSidebarOpen) {
      setIsTaskPanelOpen(false);
      setIsHistoryDrawerOpen(false);
    }
  }, [isSidebarOpen]);

  // Restore and sync draft when session changes
  useEffect(() => {
    setInputText(draftText || '');
  }, [session.id, draftText]);

  // Handle draft text update
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    onSaveDraft?.(session.id, val);
  };

  const handleOpenFlowDirective = (msg: ChatMessage) => {
    if (msg.directiveData) {
      setActiveDirective(msg.directiveData);
      setIsDirectiveModalOpen(true);
      return;
    }

    if (msg.flowCardData) {
      const flowStatus = msg.flowCardData.status;
      const statusNormalized: TaskDirective['status'] =
        flowStatus === '已办结' ? 'completed' : flowStatus === '处理中' ? 'in_progress' : 'pending';

      const directiveFromFlow: TaskDirective = {
        id: msg.flowCardData.directiveId || `dir_${msg.id}`,
        title: msg.flowCardData.title,
        description: msg.flowCardData.remark || '针对涉密信息与网络舆情动态实施全网多端溯源、流转交办与闭环核销。',
        status: statusNormalized,
        priority: msg.flowCardData.priority === '紧急' ? 'urgent' : 'normal',
        assignerName: msg.flowCardData.creator || msg.flowCardData.assigner || '史乐乐 (台湾省网信办)',
        assignerId: 'user_sll',
        assigneeName: '戚中彪 (当前经办)',
        assigneeId: CURRENT_USER.id,
        deadline: '今天 18:00',
        sessionId: session.id,
        sessionName: session.name,
        createdAt: msg.flowCardData.createTime || msg.time,
        flowSteps: [
          {
            title: '指令下发与立项',
            operator: msg.flowCardData.creator || msg.flowCardData.assigner || '史乐乐',
            time: msg.flowCardData.createTime || '已下发',
            status: 'done',
            remark: msg.flowCardData.remark || '工单已下发并加密同步至各端节点',
          },
          {
            title: '责任人签收与处置',
            operator: '戚中彪',
            time: statusNormalized === 'completed' ? '已办结' : statusNormalized === 'in_progress' ? '处理中' : '待处理',
            status: statusNormalized === 'completed' ? 'done' : statusNormalized === 'in_progress' ? 'active' : 'pending',
            remark: '实时协同跟进与研判处置',
          },
          {
            title: '核实研判与归档存证',
            operator: '系统自动存证',
            time: statusNormalized === 'completed' ? '已归档' : '待完成',
            status: statusNormalized === 'completed' ? 'done' : 'pending',
            remark: '经密级核销后自动封存国密存证凭据',
          },
        ],
      };
      setActiveDirective(directiveFromFlow);
      setIsDirectiveModalOpen(true);
      return;
    }

    if (msg.taskCardData) {
      const taskStatus = msg.taskCardData.status;
      const statusNormalized: TaskDirective['status'] =
        taskStatus === '已完成' || taskStatus === '已办结'
          ? 'completed'
          : taskStatus === '处理中' || taskStatus === '进行中'
          ? 'in_progress'
          : 'pending';

      const directiveFromTask: TaskDirective = {
        id: msg.taskCardData.directiveId || msg.taskCardData.id || `dir_${msg.id}`,
        title: msg.taskCardData.title,
        description: msg.taskCardData.remark || '测试与协同任务闭环跟踪处理。',
        status: statusNormalized,
        priority: 'normal',
        assignerName: msg.taskCardData.creator || '任务调度中心',
        assignerId: 'user_creator',
        assigneeName: msg.taskCardData.assignee || '戚中彪',
        assigneeId: CURRENT_USER.id,
        deadline: '当天 18:00',
        sessionId: session.id,
        sessionName: msg.taskCardData.groupName || session.name,
        createdAt: msg.taskCardData.createTime || msg.time,
        flowSteps: [
          {
            title: '任务下发',
            operator: msg.taskCardData.creator,
            time: msg.taskCardData.createTime,
            status: 'done',
            remark: '任务下发成功',
          },
          {
            title: '承办接收与执行',
            operator: msg.taskCardData.assignee,
            time: statusNormalized === 'completed' ? '已办结' : '执行中',
            status: statusNormalized === 'completed' ? 'done' : 'active',
          },
        ],
      };
      setActiveDirective(directiveFromTask);
      setIsDirectiveModalOpen(true);
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior,
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }
  };

  // Switch session jump to bottom
  useEffect(() => {
    scrollToBottom('auto');
    const timer = setTimeout(() => {
      scrollToBottom('smooth');
    }, 50);
    return () => clearTimeout(timer);
  }, [session.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottomBtn(isFarFromBottom);
  };

  // Handle global click to dismiss active message popover menu
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.message-action-menu') && !target.closest('.message-bubble-click-trigger')) {
        setActiveMenuMessageId(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Helper to compute a consistent read count for a message in a group session
  const getMessageReadCount = (msg: ChatMessage): number => {
    if (typeof msg.readCount === 'number') {
      return msg.readCount;
    }
    const maxMem = session.memberCount || session.members?.length || 10;
    let hash = 0;
    for (let i = 0; i < msg.id.length; i++) {
      hash = (hash << 5) - hash + msg.id.charCodeAt(i);
      hash |= 0;
    }
    const base = (Math.abs(hash) % 7) + 3; // 3 to 9
    return Math.min(Math.max(1, base), Math.max(1, maxMem - 1));
  };

  const renderReadCountBadge = (msg: ChatMessage, isCurrentUserMsg: boolean) => {
    if (!session.isGroup || session.isNoticeSession || session.isTaskSession) return null;
    const readCount = getMessageReadCount(msg);
    const totalMembers = session.memberCount || session.members?.length || 10;
    // 全部已读判定（群内其他人都已读，或者读取数达到总人数-1/总人数）
    const isAllRead = readCount >= totalMembers || (isCurrentUserMsg && readCount >= totalMembers - 1);

    return (
      <button
        type="button"
        id={`btn-read-detail-${msg.id}`}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedReadMessage(msg);
          setIsReadDetailModalOpen(true);
        }}
        className={`group/read-badge inline-flex items-center justify-center transition-all cursor-pointer select-none shrink-0 active:scale-95 ${
          isAllRead
            ? 'w-4 h-4 rounded-full bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600'
            : 'min-w-[17px] h-[17px] px-1 rounded-full border border-[#4096ff] text-[#2979ff] bg-transparent hover:bg-blue-50/80 text-[10px] font-normal leading-none'
        }`}
        title={isAllRead ? '全部已读 (点击查看详情)' : `${readCount}人已读 (点击查看详情)`}
      >
        {isAllRead ? (
          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
        ) : (
          <span className="tabular-nums scale-90 select-none">{readCount}</span>
        )}
      </button>
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 1800);
  };

  const handleCopyMessage = (msg: ChatMessage) => {
    if (!msg.content) return;
    navigator.clipboard.writeText(msg.content);
    showToast('已复制');
    setActiveMenuMessageId(null);
  };

  const handleQuoteMessage = (msg: ChatMessage) => {
    setQuotedMessage({
      messageId: msg.id,
      senderName: msg.senderName,
      content: msg.content || (msg.type === 'image' ? '[图片]' : '[消息]'),
    });
    setActiveMenuMessageId(null);
    textareaRef.current?.focus();
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), 'text', undefined, quotedMessage || undefined);
    setInputText('');
    setQuotedMessage(null);
    onSaveDraft?.(session.id, '');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Re-edit recalled message (within 5 minutes)
  const handleReEditRecalled = (originalContent?: string, quote?: QuotedMessageData) => {
    if (!originalContent) return;
    setInputText(originalContent);
    if (quote) {
      setQuotedMessage(quote);
    }
    onSaveDraft?.(session.id, originalContent);
    showToast('已填入输入框，可重新编辑发送');
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = originalContent.length;
        textareaRef.current.selectionEnd = originalContent.length;
      }
    }, 50);
  };

  // Collect all images in current chat for gallery sliding
  const openGalleryForImage = (imgUrl: string) => {
    const allImages: string[] = [];
    messages.forEach((m) => {
      if (m.type === 'image' && m.content) {
        allImages.push(m.content);
      } else if (m.content && m.content.startsWith('http') && (m.content.includes('.jpg') || m.content.includes('.png') || m.content.includes('.svg') || m.content.includes('unsplash'))) {
        allImages.push(m.content);
      }
    });
    if (!allImages.includes(imgUrl)) {
      allImages.unshift(imgUrl);
    }
    const idx = allImages.indexOf(imgUrl);
    setGalleryImages(allImages);
    setGalleryIndex(idx >= 0 ? idx : 0);
    setIsGalleryOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden min-w-0">
      {/* Background Security Watermark */}
      <WatermarkBackground text="戚中彪7630 2026-08-18 15:54" />

      {/* Top-level Window Controls */}
      <div className="absolute top-1.5 right-3 flex items-center gap-1 text-gray-400 z-20 select-none">
        <button
          id="btn-window-minimize"
          className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="最小化"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          id="btn-window-maximize"
          className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="最大化"
        >
          <Square className="w-2.5 h-2.5" />
        </button>
        <button
          id="btn-window-close"
          className="p-1 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="关闭"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Top Window Header */}
      <div className="h-[64px] border-b border-gray-200/80 px-4 pt-3 pb-1.5 flex items-center justify-between bg-white z-10 select-none shrink-0 relative">
        {/* Left: Chat info */}
        <div className="flex items-center gap-3">
          <GroupAvatar session={session} className="w-9 h-9 rounded-md shrink-0 cursor-pointer" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm font-bold text-gray-900 leading-tight flex items-center gap-1.5">
                <span>{session.name}</span>
                {session.isClosed && (
                  <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.2 rounded font-medium">
                    已关闭
                  </span>
                )}
              </h2>
              {session.reminderTracked && (
                <span className="text-[10px] bg-blue-50 text-[#2979ff] border border-blue-200 px-1.5 py-0.2 rounded font-medium">
                  追踪中
                </span>
              )}

              {/* 群聊畅聊沟通状态标识 (隐藏) */}
              {session.isGroup && !session.isNoticeSession && !session.isTaskSession && (
                <div
                  id="group-auto-chat-badge"
                  className="hidden"
                  title="群内成员实时畅聊沟通中（每5秒一条，支持切换群聊后重置次数）"
                >
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span>畅聊 {chatCount}/100条</span>
                  <span className="text-[9.5px] text-emerald-600/80 font-mono">每5秒</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetChatCount();
                    }}
                    className="ml-0.5 px-1 py-0.2 bg-emerald-100/90 hover:bg-emerald-200 text-emerald-800 rounded text-[9.5px] font-medium transition-colors cursor-pointer"
                    title="点击重置当前群聊畅聊次数为0，重新畅聊100条"
                  >
                    重置
                  </button>
                </div>
              )}
            </div>
            <div className="text-[11px] text-gray-500 font-normal leading-tight flex items-center gap-1 mt-0.5">
              {session.isTaskSession || session.isNoticeSession ? null : (
                <>
                  <span>{session.memberCount || session.members?.length || 1}人</span>
                  <span>·</span>
                  <span className="text-[#10b981]">在线{session.onlineCount || 1}人</span>
                </>
              )}
              {session.draft && (
                <>
                  <span>·</span>
                  <span className="text-amber-600 font-medium">[草稿已暂存]</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions (Only shown for normal chat sessions, hidden for task and notice sessions) */}
        {!session.isTaskSession && !session.isNoticeSession && (
          <div className="flex items-center gap-1 mt-3">
            {/* 免打扰铃铛 */}
            <button
              id="btn-toggle-mute-header"
              onClick={() => onToggleMute(session.id)}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                session.isMuted
                  ? 'text-[#2979ff] bg-blue-50 hover:bg-blue-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title={session.isMuted ? '已开启消息免打扰（点击关闭）' : '开启消息免打扰'}
            >
              {session.isMuted ? (
                <BellOff className="w-4 h-4" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </button>

            {/* 聊天记录 */}
            <button
              id="btn-chat-history"
              onClick={() => {
                if (isSidebarOpen) {
                  onToggleSidebar();
                }
                setIsTaskPanelOpen(false);
                setIsHistoryDrawerOpen((prev) => !prev);
              }}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                isHistoryDrawerOpen
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="历史消息记录"
            >
              <Clock className="w-4 h-4" />
            </button>

            {/* 群设置 */}
            <button
              id="btn-group-sidebar-toggle"
              onClick={() => {
                setIsTaskPanelOpen(false);
                setIsHistoryDrawerOpen(false);
                onToggleSidebar();
              }}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                isSidebarOpen
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="群设置"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Message Stream */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 z-10 custom-scrollbar relative"
      >
        {messages.map((msg, index) => {
          const isCurrentUser = msg.senderId === CURRENT_USER.id;

          const showTimeHeader =
            index === 0 ||
            msg.time !== messages[index - 1].time;

          // Message recalled view
          if (msg.isRecalled) {
            const originalText = msg.recalledOriginalContent || msg.reEditDraft || msg.content || '';
            const isWithinFiveMinutes = !msg.recalledTimestamp || (Date.now() - msg.recalledTimestamp <= 5 * 60 * 1000);
            const canReEdit = isCurrentUser && !!originalText && isWithinFiveMinutes;

            return (
              <div key={msg.id} className="flex flex-col gap-1.5">
                {showTimeHeader && (
                  <div className="flex justify-center my-0.5 select-none">
                    <span className="text-xs text-gray-400 font-normal">{msg.time}</span>
                  </div>
                )}
                <div className="flex justify-center my-1 select-none">
                  <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100/90 px-3 py-1 rounded-full">
                    <span>{isCurrentUser ? '你' : msg.senderName} 撤回了一条消息</span>
                    {canReEdit && (
                      <button
                        id={`btn-reedit-msg-${msg.id}`}
                        onClick={() => handleReEditRecalled(originalText, msg.quoteData)}
                        className="text-[#2979ff] hover:text-blue-700 hover:underline font-medium flex items-center gap-0.5 ml-1 cursor-pointer transition-colors"
                        title="撤回5分钟内支持重新编辑"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>重新编辑</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex flex-col gap-1.5 group/msg">
              {showTimeHeader && (
                <div className="flex justify-center my-0.5 select-none">
                  <span className="text-xs text-gray-400 font-normal">
                    {msg.time.includes(':') && !msg.time.includes('今天') && !msg.time.includes('2026')
                      ? `今天 ${msg.time}`
                      : msg.time}
                  </span>
                </div>
              )}

              {/* Directive Task Message */}
              {msg.type === 'directive' && msg.directiveData ? (
                <div
                  className={`flex items-start gap-2.5 max-w-[85%] ${
                    isCurrentUser ? 'self-end flex-row-reverse' : 'self-start'
                  }`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    onClick={() => {
                      const member = (session.members || []).find((m) => m.id === msg.senderId) || {
                        id: msg.senderId,
                        name: msg.senderName,
                        avatar: msg.senderAvatar,
                        role: 'member',
                        online: true,
                      };
                      setSelectedMember(member);
                    }}
                    className="w-8 h-8 rounded-lg object-cover bg-indigo-100 shadow-2xs shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    title="点击查看名片"
                  />
                  <div className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-400 font-normal">
                      {msg.senderName} {msg.time}
                    </span>

                    <div className="flex items-center gap-1.5 relative">
                      {/* Read badge for directive (current user) */}
                      {isCurrentUser && renderReadCountBadge(msg, true)}

                      {/* Interactive Directive Card */}
                      <div
                        onClick={() => handleOpenFlowDirective(msg)}
                        className="bg-white border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl p-4 text-xs text-gray-800 shadow-xs space-y-3 cursor-pointer transition-all hover:shadow-md max-w-md group"
                      >
                        {/* Header: Title on Left, Status on Right */}
                        <div className="flex items-start justify-between gap-3 border-b border-indigo-100 pb-2">
                          <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-xs leading-snug">
                            {msg.directiveData.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 shadow-2xs ${
                              msg.directiveData.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-rose-50 text-rose-600 border border-rose-200'
                            }`}
                          >
                            {msg.directiveData.status === 'completed' ? '已办结' : '待办'}
                          </span>
                        </div>

                        {/* Middle Info Fields */}
                        <div className="space-y-1.5 text-xs text-gray-600 font-normal">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400 font-medium shrink-0">发起人：</span>
                            <span className="text-gray-700 font-medium">
                              {msg.directiveData.assignerName || '指令调度中心'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400 font-medium shrink-0">创建时间：</span>
                            <span className="font-mono text-gray-500 text-[11px]">
                              {msg.directiveData.createdAt || msg.time}
                            </span>
                          </div>
                        </div>

                        {/* Bottom: Only Details */}
                        <div className="pt-2 border-t border-indigo-50 flex items-center justify-end text-xs text-indigo-600 font-medium group-hover:text-indigo-700">
                          <div className="flex items-center gap-0.5 text-xs group-hover:translate-x-0.5 transition-transform">
                            <span>详情</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>

                      {/* Read badge for directive (other members) */}
                      {!isCurrentUser && (
                        <div className="shrink-0 self-end select-none">
                          {renderReadCountBadge(msg, false)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : msg.type === 'push_card' && msg.pushCardData ? (
                /* Bot Push Card Message */
                <div className="flex items-start gap-2.5 max-w-[85%]">
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    onClick={() => {
                      const member = (session.members || []).find((m) => m.id === msg.senderId) || {
                        id: msg.senderId,
                        name: msg.senderName,
                        avatar: msg.senderAvatar,
                        role: 'member',
                        online: true,
                      };
                      setSelectedMember(member);
                    }}
                    className="w-8 h-8 rounded-full object-cover bg-blue-100 shadow-2xs shrink-0 cursor-pointer"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 font-normal">
                      {msg.senderName} {msg.time}
                    </span>

                    <div className="flex items-center gap-1.5 relative">
                      {isCurrentUser && renderReadCountBadge(msg, true)}

                      {/* Card container */}
                      <div className="bg-[#f0f4f9] rounded-xl p-3 text-xs text-gray-800 border border-gray-200/60 shadow-2xs space-y-2">
                        <div className="font-semibold text-gray-900 leading-snug">
                          <span className="text-gray-500 font-normal">标题：</span>
                          {msg.pushCardData.title}
                        </div>

                        {msg.pushCardData.link && (
                          <div className="text-blue-600 hover:underline break-all leading-tight text-xs flex items-center gap-1">
                            <span className="text-gray-500 font-normal">链接：</span>
                            <a
                              href={`https://${msg.pushCardData.link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2979ff]"
                            >
                              {msg.pushCardData.link}
                            </a>
                          </div>
                        )}

                        {msg.pushCardData.summary && (
                          <div className="leading-snug text-gray-600">
                            <span className="text-gray-500 font-normal">摘要：</span>
                            {msg.pushCardData.summary}
                          </div>
                        )}

                        <div className="pt-1.5 text-[11px] text-gray-500 space-y-0.5 border-t border-gray-200/50">
                          {msg.pushCardData.timeStr && (
                            <div>时间：{msg.pushCardData.timeStr}</div>
                          )}
                          {msg.pushCardData.source && (
                            <div>来源：{msg.pushCardData.source}</div>
                          )}
                        </div>

                        {/* H5 Propagation Report Button */}
                        <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60">
                          <button
                            onClick={() => setIsPropagationModalOpen(true)}
                            className="flex-1 py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <TrendingUp className="w-3 h-3" />
                            <span>打开全网传播分析 H5</span>
                          </button>
                          <button
                            onClick={() => setForwardMessage(msg)}
                            className="p-1 bg-white hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                            title="转发此卡片"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {!isCurrentUser && (
                        <div className="shrink-0 self-end select-none">
                          {renderReadCountBadge(msg, false)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : msg.type === 'task_card' && msg.taskCardData ? (
                /* Task Card (我的任务推送卡片) */
                <div className="flex flex-col items-center my-2 w-full">
                  <div
                    id={`task-card-${msg.id}`}
                    onClick={() => handleOpenFlowDirective(msg)}
                    className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 p-4 space-y-3 cursor-pointer group transition-all select-none"
                  >
                    {/* Header: Title on Left, Status on Right */}
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100/90 pb-2">
                      <h3 className="text-[13px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                        {msg.taskCardData.title}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 shadow-2xs whitespace-nowrap ${
                          msg.taskCardData.status === '待审核'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : msg.taskCardData.status === '已办结' || msg.taskCardData.status === '已完成'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}
                      >
                        {msg.taskCardData.status || '待处理'}
                      </span>
                    </div>

                    {/* Middle Info Fields: 发起人、处理人、创建时间 */}
                    <div className="space-y-1.5 text-xs text-gray-600 font-normal">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 font-medium shrink-0">发起人：</span>
                          <span className="text-gray-700 font-medium">{msg.taskCardData.creator}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <span className="text-gray-400 font-medium">处理人：</span>
                          <span className="text-gray-700 font-medium">{msg.taskCardData.assignee}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 font-medium shrink-0">创建时间：</span>
                        <span className="text-gray-500 font-mono text-[11px]">{msg.taskCardData.createTime}</span>
                      </div>
                    </div>

                    {/* Bottom: Only Details */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-end text-xs text-blue-600 font-medium group-hover:text-blue-700">
                      <div className="flex items-center gap-0.5 text-xs group-hover:translate-x-0.5 transition-transform">
                        <span>详情</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : msg.type === 'flow_card' && msg.flowCardData ? (
                /* Flow Card (指令流转推送卡片) */
                <div className="flex flex-col items-center my-2 w-full">
                  <div
                    id={`flow-card-${msg.id}`}
                    onClick={() => handleOpenFlowDirective(msg)}
                    className="w-full max-w-[420px] bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-4 space-y-3 cursor-pointer group select-none"
                  >
                    {/* Header: Title on Left, Status on Right */}
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2">
                      <h3 className="text-[13px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                        {msg.flowCardData.title}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 shadow-2xs whitespace-nowrap ${
                          msg.flowCardData.status === '已办结' || msg.flowCardData.status === '已完成'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}
                      >
                        {msg.flowCardData.status === '已办结' || msg.flowCardData.status === '已完成' ? '已办结' : '待办'}
                      </span>
                    </div>

                    {/* Middle Info Fields: 发起人、创建时间 */}
                    <div className="space-y-1.5 text-xs text-gray-600 font-normal">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 font-medium shrink-0">发起人：</span>
                        <span className="text-gray-700 font-medium">
                          {msg.flowCardData.creator || msg.flowCardData.assigner || '史乐乐/台湾省网信办'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 font-medium shrink-0">创建时间：</span>
                        <span className="font-mono text-gray-500 text-[11px]">
                          {msg.flowCardData.createTime}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Only Details */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-end text-xs text-blue-600 font-medium group-hover:text-blue-700">
                      <div className="flex items-center gap-0.5 text-xs group-hover:translate-x-0.5 transition-transform">
                        <span>详情</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : msg.type === 'image' || (msg.content && msg.content.startsWith('[图片:') && msg.content.endsWith(']')) ? (
                /* Image Message */
                <div
                  className={`flex items-start gap-2.5 max-w-[80%] ${
                    isCurrentUser ? 'self-end flex-row-reverse' : 'self-start'
                  }`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    onClick={() => {
                      const member = (session.members || []).find((m) => m.id === msg.senderId) || {
                        id: msg.senderId,
                        name: msg.senderName,
                        avatar: msg.senderAvatar,
                        role: 'member',
                        online: true,
                      };
                      setSelectedMember(member);
                    }}
                    className="w-8 h-8 rounded-xl object-cover bg-gray-200 shadow-2xs shrink-0 cursor-pointer"
                  />
                  <div className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-400 font-normal">
                      {msg.senderName} {msg.time}
                    </span>

                    <div className="flex items-center gap-1.5 relative">
                      {isCurrentUser && (
                        <div className="shrink-0 self-center order-first select-none">
                          {renderReadCountBadge(msg, true)}
                        </div>
                      )}

                      {/* Image Box */}
                      {(() => {
                        const rawUrl = msg.type === 'image'
                          ? msg.content
                          : msg.content.replace(/^\[图片:\s*/, '').replace(/\]$/, '');
                        return (
                          <div className="relative group/img cursor-pointer">
                            <img
                              src={rawUrl}
                              alt="聊天图片"
                              onClick={() => openGalleryForImage(rawUrl)}
                              className="max-w-[280px] max-h-[240px] rounded-xl object-cover border border-slate-200 shadow-sm hover:opacity-95 transition-opacity"
                            />
                            <div
                              onClick={() => openGalleryForImage(rawUrl)}
                              className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 rounded-xl flex items-center justify-center text-white text-xs gap-1 transition-opacity pointer-events-none"
                            >
                              <Eye className="w-4 h-4" />
                              <span>点击放大 / 滑动查看</span>
                            </div>
                          </div>
                        );
                      })()}

                      {!isCurrentUser && (
                        <div className="shrink-0 self-end select-none">
                          {renderReadCountBadge(msg, false)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : msg.type === 'voice' ? (
                /* Voice Message from Other Terminals (PC 端展示及转换为文字查看) */
                <div
                  className={`flex items-start gap-2.5 max-w-[85%] ${
                    isCurrentUser ? 'self-end flex-row-reverse' : 'self-start'
                  }`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    onClick={() => {
                      const member = (session.members || []).find((m) => m.id === msg.senderId) || {
                        id: msg.senderId,
                        name: msg.senderName,
                        avatar: msg.senderAvatar,
                        role: 'member',
                        online: true,
                      };
                      setSelectedMember(member);
                    }}
                    className="w-8 h-8 rounded-xl object-cover bg-gray-200 shadow-2xs shrink-0 cursor-pointer"
                    title="点击查看名片"
                  />
                  <div className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-400 font-normal">
                      {msg.senderName} {msg.time}
                    </span>
                    <VoiceMessageBubble
                      message={msg}
                      isCurrentUser={isCurrentUser}
                      onToggleTranscribe={(msgId) => toggleVoiceTranscription(session.id, msgId)}
                      onCopyText={(_text) => showToast('已复制')}
                      onQuoteMessage={(m) => handleQuoteMessage(m)}
                      onRecallMessage={(msgId) => onRecallMessage?.(msgId)}
                      renderReadBadge={renderReadCountBadge(msg, isCurrentUser)}
                      isActiveMenu={activeMenuMessageId === msg.id}
                      onToggleMenu={() => setActiveMenuMessageId(activeMenuMessageId === msg.id ? null : msg.id)}
                      onCloseMenu={() => setActiveMenuMessageId(null)}
                    />
                  </div>
                </div>
              ) : (
                /* Regular Text Messages */
                <div
                  className={`flex items-start gap-2.5 max-w-[80%] ${
                    isCurrentUser ? 'self-end flex-row-reverse' : 'self-start'
                  }`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    onClick={() => {
                      const member = (session.members || []).find((m) => m.id === msg.senderId) || {
                        id: msg.senderId,
                        name: msg.senderName,
                        avatar: msg.senderAvatar,
                        role: 'member',
                        online: true,
                      };
                      setSelectedMember(member);
                    }}
                    className="w-8 h-8 rounded-xl object-cover bg-gray-200 shadow-2xs shrink-0 cursor-pointer"
                    title="点击查看名片"
                  />
                  <div className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-400 font-normal">
                      {msg.senderName} {msg.time}
                    </span>
                    <div className="flex items-center gap-1.5 relative">
                      {/* Left Read status trigger for current user */}
                      {isCurrentUser && (
                        <div className="shrink-0 self-center order-first select-none">
                          {renderReadCountBadge(msg, true)}
                        </div>
                      )}

                      {/* Message Bubble Container with Action Menu */}
                      <div className="relative group/bubble">
                        <div
                          id={`msg-bubble-${msg.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuMessageId(activeMenuMessageId === msg.id ? null : msg.id);
                          }}
                          className={`message-bubble-click-trigger rounded-xl px-4 py-2.5 text-xs leading-relaxed select-text shadow-2xs whitespace-pre-wrap cursor-pointer transition-all ${
                            isCurrentUser
                              ? 'bg-[#d4e4ff] text-gray-900 hover:bg-[#c9dcfa]'
                              : 'bg-[#f0f2f5] text-gray-800 border border-gray-200/50 hover:bg-[#e7eaf0]'
                          } ${activeMenuMessageId === msg.id ? 'ring-2 ring-[#2979ff]/40 shadow-xs' : ''}`}
                          title="点击展开功能菜单 (引用、复制、撤回)"
                        >
                          {/* Quoted Message Render inside Bubble */}
                          {msg.quoteData && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                const targetMsgEl = document.getElementById(`msg-item-${msg.quoteData!.messageId}`);
                                if (targetMsgEl) {
                                  targetMsgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  targetMsgEl.classList.add('bg-blue-50/70', 'transition-colors', 'duration-500');
                                  setTimeout(() => {
                                    targetMsgEl.classList.remove('bg-blue-50/70');
                                  }, 1500);
                                }
                              }}
                              className={`mb-2 px-2.5 py-1.5 rounded-lg text-[11px] leading-relaxed cursor-pointer select-none border-l-2 transition-colors ${
                                isCurrentUser
                                  ? 'bg-blue-200/60 border-[#2979ff] text-blue-950 hover:bg-blue-200/90'
                                  : 'bg-gray-200/80 border-gray-400 text-gray-800 hover:bg-gray-300/80'
                              }`}
                              title="点击查看被引用的原消息"
                            >
                              <div className="font-semibold text-[11px] truncate opacity-90">
                                {msg.quoteData.senderName}
                              </div>
                              <div className="truncate text-[11px] opacity-75 mt-0.5">
                                {msg.quoteData.content}
                              </div>
                            </div>
                          )}

                          {msg.content}
                        </div>

                        {/* Action Menu Popover (点击消息后弹出的功能卡片) */}
                        {activeMenuMessageId === msg.id && (
                          <div
                            className={`message-action-menu absolute top-0 bg-white rounded-xl shadow-lg border border-gray-100/90 p-1 min-w-[96px] z-50 animate-in fade-in zoom-in-95 duration-100 select-none ${
                              isCurrentUser ? 'right-full mr-2' : 'left-full ml-2'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* 1. 引用 */}
                            <button
                              onClick={() => handleQuoteMessage(msg)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-left font-normal"
                            >
                              <MessageSquareQuote className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                              <span>引用</span>
                            </button>

                            {/* 2. 复制 */}
                            <button
                              onClick={() => handleCopyMessage(msg)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-left font-normal"
                            >
                              <Copy className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                              <span>复制</span>
                            </button>

                            {/* 3. 撤回 (我的消息展示) */}
                            {isCurrentUser && (
                              <button
                                onClick={() => {
                                  onRecallMessage?.(msg.id);
                                  setActiveMenuMessageId(null);
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

                      {/* Read status trigger for other members (Rendered to the RIGHT of bubble) */}
                      {!isCurrentUser && (
                        <div className="shrink-0 self-end select-none">
                          {renderReadCountBadge(msg, false)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />

        {/* Floating Quick Jump to Latest Message Button */}
        {showScrollBottomBtn && (
          <button
            id="btn-jump-to-latest-message"
            onClick={() => scrollToBottom('smooth')}
            className="sticky bottom-3 left-1/2 -translate-x-1/2 bg-[#2979ff] text-white text-xs font-medium px-3.5 py-1.5 rounded-full shadow-md hover:bg-[#1e6bf0] flex items-center gap-1.5 transition-all animate-bounce z-30 select-none cursor-pointer"
            title="点击跳转到最新消息"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>最新消息</span>
          </button>
        )}
      </div>

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-28 left-4 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-2 w-56 h-40 overflow-y-auto custom-scrollbar grid grid-cols-5 gap-1">
          {emojis.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => {
                const nextVal = inputText + emoji;
                setInputText(nextVal);
                onSaveDraft?.(session.id, nextVal);
                setShowEmojiPicker(false);
              }}
              className="text-base p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="border-t border-gray-100 bg-white z-10 flex flex-col">
        {/* Active Quotation Preview Bar */}
        {quotedMessage && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50/70 border-b border-blue-100/60 text-xs text-gray-700 animate-in fade-in slide-in-from-bottom-1 select-none">
            <div className="flex items-center gap-2 overflow-hidden mr-2">
              <MessageSquareQuote className="w-3.5 h-3.5 text-[#2979ff] shrink-0" />
              <span className="font-medium text-gray-800 shrink-0">引用 {quotedMessage.senderName}:</span>
              <span className="truncate text-gray-500">{quotedMessage.content}</span>
            </div>
            <button
              onClick={() => setQuotedMessage(null)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200/80 transition-colors shrink-0 cursor-pointer"
              title="取消引用"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-col p-3 pt-2">
          {/* Toolbar Icons */}
          <div className="flex items-center gap-3 text-gray-500 mb-1.5 select-none">
            <button
              id="btn-tool-emoji"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 hover:text-[#2979ff] rounded transition-colors cursor-pointer"
              title="表情"
            >
              <Smile className="w-4 h-4" />
            </button>
            <button
              id="btn-tool-image"
              onClick={() => {
                const sampleUrl = prompt('请输入要发送的图片链接或本地测试:', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600');
                if (sampleUrl) {
                  onSendMessage(sampleUrl, 'image');
                }
              }}
              className="p-1 hover:text-[#2979ff] rounded transition-colors cursor-pointer"
              title="发送图片"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              id="btn-tool-attach"
              onClick={() => alert('已调用国密端对端加密文件传输模块')}
              className="p-1 hover:text-[#2979ff] rounded transition-colors cursor-pointer"
              title="发送文件附件"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <div className="flex items-center hover:text-[#2979ff] rounded p-0.5 cursor-pointer">
              <button
                id="btn-tool-screenshot"
                onClick={() => alert('已调用截图工具 (快捷键: Ctrl+Alt+A)')}
                title="屏幕截图"
              >
                <Scissors className="w-4 h-4" />
              </button>
              <ChevronDown className="w-3 h-3 text-gray-400 ml-0.5" />
            </div>

            <button
              id="btn-tool-poll"
              onClick={() => {}}
              className="p-1 text-[#2979ff] hover:opacity-80 rounded transition-colors"
              title="传播分析"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              id="btn-tool-calendar"
              onClick={() => {
                if (!isTaskPanelOpen && isSidebarOpen) {
                  onToggleSidebar();
                }
                setIsHistoryDrawerOpen(false);
                setIsTaskPanelOpen((prev) => !prev);
              }}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isTaskPanelOpen
                  ? 'text-[#2979ff] bg-blue-50 ring-1 ring-blue-200 shadow-2xs'
                  : 'text-emerald-500 hover:opacity-80 hover:bg-emerald-50'
              }`}
              title="任务模块 (全部任务 / 我的任务)"
            >
              <ClipboardCheck className="w-4 h-4" />
            </button>

            {/* 模拟其他端发送语音按钮（方便测试与体验 PC 端接收及转文字功能） */}
            <button
              id="btn-simulate-mobile-voice"
              type="button"
              onClick={() => sendSimulatedVoiceMessage(session.id)}
              className="flex items-center gap-1 px-2 py-0.5 text-xs text-blue-600 bg-blue-50/80 hover:bg-blue-100 hover:text-blue-700 border border-blue-200/80 rounded-md transition-colors cursor-pointer select-none ml-auto"
              title="模拟其他端（手机移动端）向当前会话发送语音，体验PC端播放与转文字功能"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-medium">模拟移动端语音</span>
            </button>
          </div>

          {/* Text Input Box */}
          <div className="flex flex-col">
            {session.isClosed ? (
              <div className="py-4 text-center text-xs text-gray-400 bg-gray-50/80 rounded-lg border border-dashed border-gray-200 select-none">
                当前群聊已被群主关闭，暂不支持发送新消息
              </div>
            ) : (
              <>
                <textarea
                  ref={textareaRef}
                  id="chat-message-input"
                  rows={3}
                  placeholder="按回车 (Enter) 发送，草稿将自动保存"
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full text-xs text-gray-800 placeholder-gray-400 resize-none outline-hidden bg-transparent leading-relaxed py-1"
                />

                {/* Bottom Send Action */}
                <div className="flex items-center justify-end pt-1">
                  <button
                    id="btn-send-message"
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className={`px-4 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      inputText.trim()
                        ? 'bg-[#2979ff] text-white hover:bg-[#1e6bf0] active:scale-95 shadow-xs'
                        : 'bg-[#ebecee] text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    发送
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lightweight Toast for Copy / Actions */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg pointer-events-none animate-in fade-in zoom-in-95">
          {toastMessage}
        </div>
      )}

      {/* Modals Integration */}
      {/* 1. Image Gallery Lightbox */}
      <ImageGalleryModal
        isOpen={isGalleryOpen}
        images={galleryImages}
        initialIndex={galleryIndex}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* 2. Member Profile Modal */}
      <MemberProfileModal
        member={selectedMember}
        isOpen={!!selectedMember}
        currentGroupName={session.name}
        onClose={() => setSelectedMember(null)}
        onSendMessage={(m) => {
          setSelectedMember(null);
          const nextVal = `${inputText}@${m.name} `;
          setInputText(nextVal);
          onSaveDraft?.(session.id, nextVal);
          textareaRef.current?.focus();
        }}
      />

      {/* 3. Message Forward Modal */}
      <MessageForwardModal
        isOpen={!!forwardMessage}
        message={forwardMessage}
        sessions={allSessions}
        onClose={() => setForwardMessage(null)}
        onForward={(targetIds) => {
          if (forwardMessage) {
            onForwardMessages?.(targetIds, [forwardMessage]);
          }
          setForwardMessage(null);
        }}
      />

      {/* 4. Directive Flow Modal */}
      <DirectiveFlowModal
        isOpen={isDirectiveModalOpen}
        directive={activeDirective}
        session={session}
        sessionMembers={session.members || []}
        onClose={() => setIsDirectiveModalOpen(false)}
        onCreateDirective={(dir) => {
          onCreateDirective?.(dir);
          setIsDirectiveModalOpen(false);
        }}
        onUpdateStatus={(dirId, newStatus) => {
          onUpdateDirectiveStatus?.(dirId, newStatus);
          setIsDirectiveModalOpen(false);
        }}
      />

      {/* 5. Propagation Analysis H5 Modal */}
      <PropagationH5Modal
        isOpen={isPropagationModalOpen}
        onClose={() => setIsPropagationModalOpen(false)}
      />

      {/* 6. Message Read Detail Modal (10人已读 / 7人未读) Matching Screenshot 4 */}
      <MessageReadDetailModal
        isOpen={isReadDetailModalOpen}
        message={selectedReadMessage}
        onClose={() => {
          setIsReadDetailModalOpen(false);
          setSelectedReadMessage(null);
        }}
      />

      {/* Right-Side Group Task Module Panel with Backdrop Mask (Overlay drawer, does not squeeze chat records) */}
      <AnimatePresence>
        {isTaskPanelOpen && (
          <>
            {/* Backdrop: clicking outside closes the task drawer */}
            <motion.div
              key="group-task-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsTaskPanelOpen(false)}
              className="absolute inset-0 bg-black/15 z-25 cursor-pointer backdrop-blur-[0.5px]"
              title="点击关闭任务模块"
            />

            {/* Task Panel Drawer */}
            <motion.div
              key="group-task-drawer"
              initial={{ x: '100%', opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="absolute top-0 right-0 bottom-0 z-30 h-full shadow-2xl flex"
            >
              <GroupTaskPanel
                session={session}
                tasks={groupTasks}
                onClose={() => setIsTaskPanelOpen(false)}
                onOpenCreateModal={() => setIsCreateTaskModalOpen(true)}
                onUpdateTaskStatus={handleUpdateTaskStatus}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Right-Side Chat History Drawer with Backdrop Mask (Overlay drawer, matching Group Info Drawer form) */}
      <AnimatePresence>
        {isHistoryDrawerOpen && (
          <>
            {/* Backdrop: clicking outside closes the history drawer */}
            <motion.div
              key="chat-history-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsHistoryDrawerOpen(false)}
              className="absolute inset-0 bg-black/15 z-25 cursor-pointer backdrop-blur-[0.5px]"
              title="点击关闭历史消息"
            />

            {/* History Drawer */}
            <motion.div
              key="chat-history-drawer-motion"
              initial={{ x: '100%', opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="absolute top-0 right-0 bottom-0 z-30 h-full shadow-2xl flex"
            >
              <ChatHistoryDrawer
                session={session}
                messages={messages}
                onClose={() => setIsHistoryDrawerOpen(false)}
                onJumpToMessage={(messageId) => {
                  const element = document.getElementById(`msg-${messageId}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-2', 'ring-blue-400', 'bg-blue-50/50');
                    setTimeout(() => {
                      element.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-50/50');
                    }, 2000);
                  }
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Group Task Modal Matching Screenshot 2 (仅群内人员可选处理人) */}
      <CreateGroupTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        session={session}
        onSubmit={handleCreateGroupTask}
      />
    </div>
  );
};

