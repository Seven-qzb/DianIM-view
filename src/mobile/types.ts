export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  institutionId: string;
  institutionName: string;
  role: string;
  department: string;
  policeNo?: string;
  securityLevel: string;
  encryptionCert: string;
  certExpireDate: string;
  onlineStatus: 'online' | 'busy' | 'offline';
}

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  code: string;
  tag: string;
  memberCount: number;
  disabled?: boolean;
}

export interface GroupMember {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  department: string;
  avatar: string;
  phone?: string;
  ip?: string;
  onlineStatus?: 'online' | 'offline';
  isMuted?: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isSelf: boolean;
  content: string;
  type: 'text' | 'image' | 'file' | 'instruction' | 'system' | 'audio';
  timestamp: string;
  audioDuration?: number;
  unreadMembersCount?: number;
  readMembers?: string[];
  unreadMembers?: string[];
  quoteMessage?: {
    senderName: string;
    content: string;
  };
  isRevoked?: boolean;
  revokedContent?: string;
  revokedAt?: number;
  fileInfo?: {
    name: string;
    size: string;
    type: string;
  };
  imageUrl?: string;
  instructionInfo?: {
    level: '特急' | '急件' | '常规';
    title: string;
    code: string;
    status: 'pending' | 'signed' | 'completed';
  };
}

export interface ChatConversation {
  id: string;
  name: string;
  isGroup: boolean;
  avatarGrid?: string[];
  avatarSingle?: string;
  lastMessage: string;
  lastSender: string;
  lastTime: string;
  unreadCount: number;
  draft?: string;
  isPinned?: boolean;
  isMuted?: boolean;
  isMutedAll?: boolean;
  isOwner?: boolean;
  onlineCount?: number;
  memberCount?: number;
  members?: GroupMember[];
  announcement?: string;
  institutionName?: string;
  myNickname?: string;
  inviteLink?: string;
  inviteConfirm?: boolean;
  isClosed?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  type: '舆情研判' | '信息核查' | '应急响应' | '系统巡检' | '日常值守';
  priority: '特急' | '急件' | '普通';
  status: 'pending' | 'in_progress' | 'completed' | 'to_receive' | 'to_review' | 'cancelled';
  creator: string;
  handler: string;
  assigner: string;
  institution: string;
  deadline: string;
  progress: number;
  createdAt: string;
  overdueText?: string;
  targetGroupOrUser?: {
    name: string;
    avatar?: string;
    isGroup?: boolean;
  };
  logs: Array<{
    time: string;
    operator: string;
    action: string;
    comment?: string;
  }>;
}

export interface PropagationFeedItem {
  id: string;
  sentiment: '中性' | '正面' | '负面';
  level?: string;
  isWarning?: boolean;
  timeAgo?: string;
  createdAt?: string;
  content: string;
  title?: string;
  highlightKeywords?: string[];
  images?: string[];
  source: string;
  sourceIcon?: 'weibo' | 'toutiao' | 'news' | 'app' | 'ximalaya';
  author: string;
  authorUid?: string;
}

export interface PropagationMediaStat {
  name: string;
  count: number;
  percentage: string;
  color: string;
}

export interface PropagationTopicItem {
  id: string;
  title: string;
  topicType: string;
  dataTotal: number;
  startTime: string;
  endTime?: string;
  detailTimeRange?: string;
  statusText: string;
  status?: 'active' | 'closed';
  isSelfCreated?: boolean;
  overviewSummary?: string;
  trendData?: Array<{ time: string; value: number }>;
  sentimentDistribution?: {
    total: number;
    negative: { count: number; percent: string };
    neutral: { count: number; percent: string };
    positive: { count: number; percent: string };
  };
  mediaStats?: PropagationMediaStat[];
  feedItems?: PropagationFeedItem[];
}

export interface InstructionItem {
  id: string;
  code: string;
  title: string;
  content: string;
  senderOrg: string;
  receiverOrgs: string[];
  level: '特急' | '紧急' | '普通';
  secretLevel: '机密' | '秘密' | '内部';
  status: 'draft' | 'dispatched' | 'signed' | 'processing' | 'finished';
  createdAt: string;
  deadline: string;
  signedCount: number;
  totalReceivers: number;
  flowSteps: Array<{
    title: string;
    orgOrUser: string;
    time?: string;
    status: 'done' | 'current' | 'waiting';
    note?: string;
  }>;
  attachments?: Array<{
    name: string;
    size: string;
  }>;
}
