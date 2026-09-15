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

type SyncEventListener = (payload: any) => void;

class TerminalSyncBridge {
  private listeners: Map<string, Set<SyncEventListener>> = new Map();

  // Session ID mapping between PC and APP terminals
  // PC 'session_rd_dept' <===> APP 'conv-2' (研发部)
  // PC 'session_notice'  <===> APP 'conv-1' (指令/舆情流转)
  private pcToAppSessionMap: Record<string, string> = {
    'session_rd_dept': 'conv-2',
    'session_notice': 'conv-1',
  };

  private appToPcSessionMap: Record<string, string> = {
    'conv-2': 'session_rd_dept',
    'conv-1': 'session_notice',
  };

  public getMappedSessionId(source: 'pc' | 'app', sessionId: string): string {
    if (source === 'pc') {
      return this.pcToAppSessionMap[sessionId] || sessionId;
    } else {
      return this.appToPcSessionMap[sessionId] || sessionId;
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

  // 1. Cross-terminal message sync
  public dispatchMessage(source: 'pc' | 'app', message: CrossTerminalMessage): void {
    const target = source === 'pc' ? 'app' : 'pc';
    this.emit(`message:${target}`, message);
  }

  // 2. Cross-terminal message revoke
  public dispatchRevokeMessage(source: 'pc' | 'app', sessionId: string, messageId: string): void {
    const target = source === 'pc' ? 'app' : 'pc';
    const targetSessionId = this.getMappedSessionId(source, sessionId);
    this.emit(`revoke:${target}`, { sessionId: targetSessionId, messageId });
  }

  // 3. Cross-terminal group update
  public dispatchGroupUpdate(source: 'pc' | 'app', sessionId: string, updates: GroupUpdatePayload): void {
    const target = source === 'pc' ? 'app' : 'pc';
    const targetSessionId = this.getMappedSessionId(source, sessionId);
    this.emit(`group_update:${target}`, { sessionId: targetSessionId, updates });
  }

  // 4. Cross-terminal directive/task action
  public dispatchDirectiveAction(source: 'pc' | 'app', payload: DirectiveActionPayload): void {
    const target = source === 'pc' ? 'app' : 'pc';
    this.emit(`directive:${target}`, payload);
  }

  // 5. Cross-terminal draft sync
  public dispatchDraftSync(source: 'pc' | 'app', sessionId: string, draft: string): void {
    const target = source === 'pc' ? 'app' : 'pc';
    const targetSessionId = this.getMappedSessionId(source, sessionId);
    this.emit(`draft:${target}`, { sessionId: targetSessionId, draft });
  }
}

export const syncBridge = new TerminalSyncBridge();
