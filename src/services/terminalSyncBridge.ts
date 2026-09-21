/**
 * TerminalSyncBridge: 跨终端同频实时同步中枢
 * 当在一端发送消息、撤回、修改群设置或操作任务指令时，另一端即时双向同步
 */

export interface CrossTerminalMessage {
  id: string;
  sourceSessionId: string;
  targetSessionId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isSelf: boolean;
  content: string;
  type: 'text' | 'image' | 'file' | 'instruction' | 'audio' | 'system';
  timestamp: string;
  audioDuration?: number;
  imageUrl?: string;
  extra?: any;
}

export interface GroupUpdatePayload {
  name?: string;
  announcement?: string;
  isMuted?: boolean;
  isClosed?: boolean;
  inviteConfirmEnabled?: boolean;
  myNickname?: string;
  draft?: string;
}

export interface DirectiveActionPayload {
  directiveId: string;
  title?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'signed';
  operatorName: string;
  timestamp: string;
}

export type TerminalSource = 'pc' | 'app' | 'miniapp';

type SyncEventListener = (payload: any) => void;

class TerminalSyncBridge {
  private listeners: Map<string, Set<SyncEventListener>> = new Map();

  // Session ID mapping between PC and APP/MiniApp terminals
  // PC 'session_rd_dept' <===> APP/MiniApp 'conv-2' (研发部)
  // PC 'session_notice'  <===> APP/MiniApp 'conv-1' (指令/舆情流转)
  private pcToMobileSessionMap: Record<string, string> = {
    'session_rd_dept': 'conv-2',
    'session_notice': 'conv-1',
  };

  private mobileToPcSessionMap: Record<string, string> = {
    'conv-2': 'session_rd_dept',
    'conv-1': 'session_notice',
  };

  public getMappedSessionId(source: TerminalSource, sessionId: string): string {
    if (source === 'pc') {
      return this.pcToMobileSessionMap[sessionId] || sessionId;
    } else {
      return this.mobileToPcSessionMap[sessionId] || sessionId;
    }
  }

  public subscribe(event: string, listener: SyncEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  public emit(event: string, payload: any): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          console.error(`[TerminalSyncBridge] Error in listener for ${event}:`, err);
        }
      });
    }
  }

  private getOtherTargets(source: TerminalSource): ('pc' | 'app' | 'miniapp')[] {
    const all: ('pc' | 'app' | 'miniapp')[] = ['pc', 'app', 'miniapp'];
    return all.filter((t) => t !== source);
  }

  // 1. Cross-terminal message sync
  public dispatchMessage(source: TerminalSource, message: CrossTerminalMessage): void {
    const targets = this.getOtherTargets(source);
    targets.forEach((target) => {
      this.emit(`message:${target}`, message);
    });
  }

  // 2. Cross-terminal message revoke
  public dispatchRevokeMessage(source: TerminalSource, sessionId: string, messageId: string): void {
    const targets = this.getOtherTargets(source);
    const targetSessionId = this.getMappedSessionId(source, sessionId);
    targets.forEach((target) => {
      this.emit(`revoke:${target}`, { sessionId: targetSessionId, messageId });
    });
  }

  // 3. Cross-terminal group update
  public dispatchGroupUpdate(source: TerminalSource, sessionId: string, updates: GroupUpdatePayload): void {
    const targets = this.getOtherTargets(source);
    const targetSessionId = this.getMappedSessionId(source, sessionId);
    targets.forEach((target) => {
      this.emit(`group_update:${target}`, { sessionId: targetSessionId, updates });
    });
  }

  // 4. Cross-terminal directive/task action
  public dispatchDirectiveAction(source: TerminalSource, payload: DirectiveActionPayload): void {
    const targets = this.getOtherTargets(source);
    targets.forEach((target) => {
      this.emit(`directive:${target}`, payload);
    });
  }

  // 5. Cross-terminal draft sync
  public dispatchDraftSync(source: TerminalSource, sessionId: string, draft: string): void {
    const targets = this.getOtherTargets(source);
    const targetSessionId = this.getMappedSessionId(source, sessionId);
    targets.forEach((target) => {
      this.emit(`draft:${target}`, { sessionId: targetSessionId, draft });
    });
  }
}

export const syncBridge = new TerminalSyncBridge();
