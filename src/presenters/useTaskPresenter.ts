/**
 * [Presenter - TaskPresenter]
 * 待办指令流转与协同任务业务逻辑控制器
 * 包含指令实名签收、流程节点推进、任务状态流转及跨端广播
 */

import { useCallback } from 'react';
import { unifiedStore } from '../models/stores/UnifiedStore';
import { TaskDirective, TaskItem, InstructionItem } from '../models/entities/task';
import { syncBridge } from '../services/terminalSyncBridge';

export function useTaskPresenter() {
  // 1. 实名签署公文/指令
  const signInstruction = useCallback((source: 'pc' | 'app', instructionId: string, operatorName: string) => {
    unifiedStore.setState((prev) => {
      const nextInstructions = prev.instructions.map((inst) => {
        if (inst.id === instructionId || inst.code === instructionId) {
          const nextSigned = Math.min(inst.signedCount + 1, inst.totalReceivers);
          const nextStatus = nextSigned >= inst.totalReceivers ? 'completed' : 'processing';
          return {
            ...inst,
            signedCount: nextSigned,
            status: nextStatus as any,
          };
        }
        return inst;
      });

      return { instructions: nextInstructions };
    });

    // 跨端同步指令状态
    syncBridge.dispatchDirectiveAction(source, {
      directiveId: instructionId,
      status: 'signed',
      operatorName,
      timestamp: '刚刚',
    });
  }, []);

  // 2. 更新指令处置状态
  const updateDirectiveStatus = useCallback(
    (source: 'pc' | 'app', directiveId: string, status: 'pending' | 'in_progress' | 'completed') => {
      unifiedStore.setState((prev) => {
        const nextSessions = prev.sessions.map((s) => {
          if (s.directives) {
            const updatedDirs = s.directives.map((d) =>
              d.id === directiveId ? { ...d, status } : d
            );
            return { ...s, directives: updatedDirs };
          }
          return s;
        });
        return { sessions: nextSessions };
      });

      syncBridge.dispatchDirectiveAction(source, {
        directiveId,
        status,
        operatorName: '戚中彪',
        timestamp: '刚刚',
      });
    },
    []
  );

  // 3. 创建并派发协同任务
  const createTask = useCallback((taskData: Omit<TaskItem, 'id' | 'createdAt' | 'logs'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task_${Date.now()}`,
      createdAt: new Date().toLocaleDateString('zh-CN'),
      logs: [
        {
          time: '刚刚',
          operator: '戚中彪 (网信办)',
          action: '任务下达并派发至协同处置组',
        },
      ],
    };

    unifiedStore.setState((prev) => ({
      tasks: [newTask, ...prev.tasks],
    }));

    return newTask.id;
  }, []);

  // 4. 更新协同任务进度
  const updateTask = useCallback((taskId: string, updates: Partial<TaskItem>) => {
    unifiedStore.setState((prev) => ({
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    }));
  }, []);

  return {
    signInstruction,
    updateDirectiveStatus,
    createTask,
    updateTask,
  };
}
