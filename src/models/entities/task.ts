/**
 * [Model - Task & Instruction Entity]
 * 统一任务工单与指令流转实体定义
 */

export interface InstructionFlowStep {
  title: string;
  operator?: string;
  orgOrUser?: string;
  time?: string;
  status: 'done' | 'active' | 'current' | 'waiting' | 'pending';
  note?: string;
  remark?: string;
}

export interface TaskDirective {
  id: string;
  title: string;
  description: string;
  senderName?: string;
  senderAvatar?: string;
  assigneeName?: string;
  assigneeId?: string;
  assignerName?: string;
  assignerId?: string;
  deadline?: string;
  priority?: 'urgent' | 'high' | 'normal';
  status: 'pending' | 'in_progress' | 'completed' | 'signed';
  sessionId: string;
  sessionName?: string;
  createdAt: string;
  flowSteps?: InstructionFlowStep[];
}

export interface TaskLog {
  time: string;
  operator: string;
  action: string;
  comment?: string;
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
  logs: TaskLog[];
}

export interface InstructionItem {
  id: string;
  code: string;
  title: string;
  content: string;
  issuerOrg?: string;
  issuerUser?: string;
  level: '特急' | '急件' | '常规';
  receiverOrgs: string[];
  totalReceivers: number;
  signedCount: number;
  deadline: string;
  createdAt: string;
  status: 'processing' | 'completed';
  flowSteps: InstructionFlowStep[];
  attachmentName?: string;
  attachmentSize?: string;
}
