/**
 * [Model - Repository]
 * 统一数据仓库提供层：负责初始业务数据提供与持久化对接
 */

import { UserProfile, UserMember, Institution } from '../entities/user';
import { ChatSession, ChatMessage } from '../entities/chat';
import { TaskItem, InstructionItem, TaskDirective } from '../entities/task';
import { 
  CURRENT_USER, 
  RD_DEPT_MEMBERS, 
  INITIAL_SESSIONS, 
  INITIAL_MESSAGES, 
  INITIAL_DIRECTIVES,
} from '../../data/mockData';
import { 
  INITIAL_INSTITUTIONS, 
  INITIAL_USER as MOBILE_INITIAL_USER,
  INITIAL_CONVERSATIONS, 
  INITIAL_MESSAGES as MOBILE_INITIAL_MESSAGES,
  INITIAL_TASKS, 
  INITIAL_INSTRUCTIONS,
} from '../../mobile/data/mockData';

export class MockRepository {
  public static getCurrentUser(): UserMember {
    return CURRENT_USER as unknown as UserMember;
  }

  public static getMobileUser(): UserProfile {
    return MOBILE_INITIAL_USER as unknown as UserProfile;
  }

  public static getMembers(): UserMember[] {
    return RD_DEPT_MEMBERS as unknown as UserMember[];
  }

  public static getInitialSessions(): ChatSession[] {
    return INITIAL_SESSIONS as unknown as ChatSession[];
  }

  public static getInitialMessagesMap(): Record<string, ChatMessage[]> {
    return INITIAL_MESSAGES as unknown as Record<string, ChatMessage[]>;
  }

  public static getInitialDirectives(): TaskDirective[] {
    return INITIAL_DIRECTIVES as unknown as TaskDirective[];
  }

  public static getInitialInstitutions(): Institution[] {
    return INITIAL_INSTITUTIONS as unknown as Institution[];
  }

  public static getMobileInitialConversations(): any[] {
    return INITIAL_CONVERSATIONS;
  }

  public static getMobileInitialMessages(): Record<string, any[]> {
    return MOBILE_INITIAL_MESSAGES;
  }

  public static getInitialTasks(): TaskItem[] {
    return INITIAL_TASKS as unknown as TaskItem[];
  }

  public static getInitialInstructions(): InstructionItem[] {
    return INITIAL_INSTRUCTIONS as unknown as InstructionItem[];
  }
}
