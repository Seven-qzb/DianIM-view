export interface UserMember {
  id: string;
  name: string;
  avatar: string;
  role?: 'owner' | 'admin' | 'member';
  department?: string;
  online?: boolean;
  phone?: string;
  ip?: string;
  currentGroup?: string;
  isMutedInGroup?: boolean;
  isAdmin?: boolean;
  email?: string;
  gender?: 'male' | 'female';
  joinTime?: string;
}

export type GroupTaskStatus = 'pending_receive' | 'pending_process' | 'pending_audit' | 'completed' | 'canceled';

export interface GroupTask {
  id: string;
  title: string;
  content: string;
  status: GroupTaskStatus;
  creatorName: string;
  creatorId?: string;
  assigneeName: string;
  assigneeId?: string;
  assigneeAvatar?: string;
  createdAt: string;
  deadline?: string;
  timeoutText?: string;
  isPublic: boolean;
  sessionId: string;
}

export interface TaskDirective {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'in_progress' | 'auditing' | 'completed' | 'canceled' | 'urgent';
  priority: 'urgent' | 'high' | 'medium' | 'normal' | 'low';
  assigneeName: string;
  assigneeId?: string;
  assignerName?: string;
  assignerId?: string;
  senderName?: string;
  senderAvatar?: string;
  deadline: string;
  sessionId?: string;
  sessionName?: string;
  createdAt: string;
  flowSteps?: {
    title: string;
    operator: string;
    time: string;
    status: 'done' | 'active' | 'pending';
    remark?: string;
  }[];
}

export interface QuotedMessageData {
  messageId: string;
  senderName: string;
  content: string;
}

export interface VoiceData {
  duration: number; // 语音时长（秒），例如 8, 14, 25
  terminal?: 'mobile' | 'ios' | 'android' | 'pad' | string; // 来源端，例如 "移动端" / "iOS手机端" / "Android终端"
  audioUrl?: string;
  transcription?: string; // 语音转文字后的文本内容
  isTranscribed?: boolean; // 是否已转为文字显示
  isTranscribing?: boolean; // 是否正在转换中
  confidence?: number; // 识别置信度，例如 0.99
  isListened?: boolean; // 是否已听过
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isBot?: boolean;
  type: 'text' | 'push_card' | 'image' | 'system' | 'directive' | 'flow_card' | 'task_card' | 'voice';
  content?: string;
  imageUrl?: string;
  time: string;
  timestamp: number;
  isRecalled?: boolean;
  recallText?: string;
  recalledContent?: string;
  recalledOriginalContent?: string;
  recalledTimestamp?: number;
  reEditDraft?: string;
  voiceData?: VoiceData;
  directiveData?: TaskDirective;
  quoteData?: QuotedMessageData;
  taskCardData?: {
    id?: string;
    title: string;
    creator: string;
    assignee: string;
    createTime: string;
    groupName: string;
    groupAvatar?: string;
    status: string;
    overdueText?: string;
    isOverdue?: boolean;
    remark?: string;
    directiveId?: string;
  };
  flowCardData?: {
    title: string;
    creator?: string;
    assigner?: string;
    createTime: string;
    directiveId?: string;
    status?: string;
    priority?: string;
    remark?: string;
  };
  pushCardData?: {
    title: string;
    link?: string;
    summary?: string;
    quote?: string;
    timeStr?: string;
    source?: string;
    mediaType?: string;
    author?: string;
  };
  readCount?: number;
  unreadCount?: number;
}

export interface ChatSession {
  id: string;
  name: string;
  isGroup: boolean;
  avatar: string;
  memberCount?: number;
  onlineCount?: number;
  lastMessage: string;
  lastSender?: string;
  lastTime: string;
  timestamp: number;
  unreadCount: number;
  deptTag?: string;
  isMuted: boolean; // 消息免打扰
  isPinned: boolean; // 置顶聊天
  reminderTrack?: boolean; // 消息提醒跟踪 (@我/重点跟踪)
  reminderTracked?: boolean;
  isClosed?: boolean; // 群组开启/关闭状态 (群主控制)
  isOwner?: boolean; // 当前用户是否为群主
  inviteConfirmEnabled?: boolean; // 邀请确认开关 (开启后进群需群主/管理员审批)
  isHidden?: boolean; // 隐藏会话 (移入隐私隐藏夹)
  isNotDisplayed?: boolean; // 不显示该聊天 (临时从列表移除)
  isNoticeSession?: boolean; // 通知公告/流程流转卡片会话
  isTaskSession?: boolean; // 我的任务专用展示会话
  isExternal?: boolean; // 外部群/外部聊天
  draft?: string; // 输入框草稿
  announcement?: string;
  myNickname?: string;
  members: UserMember[];
  hasTaskDirective?: boolean;
  activeDirectiveCount?: number;
  directives?: TaskDirective[];
}

export type MainNavTab = 'messages' | 'services' | 'settings';
export type FilterTab = 'all' | 'unread' | 'read' | 'task' | 'tasks' | 'pinned' | 'hidden' | 'not_displayed' | 'at_me' | 'group' | 'direct';
