/**
 * [Model - Chat Entity]
 * 统一会话与消息核心实体定义
 */

import { UserMember } from './user';
import { TaskDirective } from './task';

export type { TaskDirective } from './task';

export interface ChatMessage {
  id: string;
  sessionId?: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: 'text' | 'image' | 'file' | 'instruction' | 'system' | 'audio' | 'push_card' | 'directive' | 'voice' | 'flow_card' | 'task_card';
  content: string;
  time?: string;
  timestamp?: number | string;
  isSelf?: boolean;
  imageUrl?: string;
  audioDuration?: number;
  voiceDuration?: number;
  voiceText?: string;
  isVoiceTranscribed?: boolean;
  fileInfo?: {
    name: string;
    size: string;
    type?: string;
  };
  directiveData?: TaskDirective;
  directiveInfo?: {
    level: '特急' | '急件' | '常规';
    title: string;
    code: string;
    status: 'pending' | 'signed' | 'completed';
  };
  quoteData?: {
    messageId: string;
    senderName: string;
    content: string;
  };
  quoteMessage?: {
    senderName: string;
    content: string;
  };
  isRecalled?: boolean;
  isRevoked?: boolean;
  recallText?: string;
  recalledOriginalContent?: string;
  reEditDraft?: string;
  recalledTimestamp?: number;
  unreadMembersCount?: number;
  readMembers?: string[];
  unreadMembers?: string[];
}

export interface ChatSession {
  id: string;
  name: string;
  isGroup: boolean;
  isOwner?: boolean;
  avatar: string;
  avatarGrid?: string[];
  avatarSingle?: string;
  memberCount?: number;
  onlineCount?: number;
  lastSender?: string;
  lastMessage: string;
  lastTime: string;
  timestamp?: number;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  isMutedAll?: boolean;
  isHidden?: boolean;
  isNotDisplayed?: boolean;
  isClosed?: boolean;
  announcement?: string;
  myNickname?: string;
  inviteConfirmEnabled?: boolean;
  inviteLink?: string;
  reminderTrack?: boolean;
  draft?: string;
  members?: UserMember[];
  institutionName?: string;
  hasTaskDirective?: boolean;
  activeDirectiveCount?: number;
  directives?: TaskDirective[];
  isNoticeSession?: boolean;
  isTaskSession?: boolean;
}
