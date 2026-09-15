/**
 * [Model - Store]
 * UnifiedStore: 单一可信数据源（Single Source of Truth）
 * 管理会话、消息、任务实体，并支持事件订阅通知
 */

import { ChatSession, ChatMessage } from '../entities/chat';
import { TaskItem, InstructionItem } from '../entities/task';
import { UserMember, UserProfile, Institution } from '../entities/user';
import { MockRepository } from '../repositories/mockRepository';

export interface UnifiedState {
  currentUser: UserMember;
  mobileUser: UserProfile;
  institutions: Institution[];
  sessions: ChatSession[];
  messagesMap: Record<string, ChatMessage[]>;
  tasks: TaskItem[];
  instructions: InstructionItem[];
  activeSessionId: string;
}

type StoreListener = (state: UnifiedState) => void;

class UnifiedStore {
  private state: UnifiedState;
  private listeners: Set<StoreListener> = new Set();

  constructor() {
    this.state = {
      currentUser: MockRepository.getCurrentUser(),
      mobileUser: MockRepository.getMobileUser(),
      institutions: MockRepository.getInitialInstitutions(),
      sessions: MockRepository.getInitialSessions(),
      messagesMap: MockRepository.getInitialMessagesMap(),
      tasks: MockRepository.getInitialTasks(),
      instructions: MockRepository.getInitialInstructions(),
      activeSessionId: 'session_rd_dept',
    };
  }

  public getState(): UnifiedState {
    return this.state;
  }

  public setState(updater: Partial<UnifiedState> | ((prev: UnifiedState) => Partial<UnifiedState>)): void {
    const nextState = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...nextState };
    this.notify();
  }

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (err) {
        console.error('[UnifiedStore] Listener error:', err);
      }
    });
  }
}

export const unifiedStore = new UnifiedStore();
