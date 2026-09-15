import React, { useState } from 'react';
import { ChevronLeft, Plus, Clock, FileText, X, CheckCircle, ArrowRight, CornerDownRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { ChatSession, GroupTask, GroupTaskStatus } from '../types/chat';
import { CURRENT_USER } from '../data/mockData';

interface GroupTaskPanelProps {
  session: ChatSession;
  tasks: GroupTask[];
  onClose: () => void;
  onOpenCreateModal: () => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: GroupTaskStatus) => void;
}

const STATUS_FILTERS: { key: GroupTaskStatus | 'all'; label: string }[] = [
  { key: 'pending_receive', label: '待接收' },
  { key: 'pending_process', label: '待处理' },
  { key: 'pending_audit', label: '待审核' },
  { key: 'completed', label: '已完成' },
  { key: 'canceled', label: '已撤销' },
];

export const GroupTaskPanel: React.FC<GroupTaskPanelProps> = ({
  session,
  tasks,
  onClose,
  onOpenCreateModal,
  onUpdateTaskStatus,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'all' | 'my'>('all');
  const [statusFilter, setStatusFilter] = useState<GroupTaskStatus | 'all'>('pending_receive');
  const [selectedTask, setSelectedTask] = useState<GroupTask | null>(null);
  const [completionNote, setCompletionNote] = useState('');

  // Filter tasks
  // 1. By session (current group)
  const sessionTasks = tasks.filter((t) => t.sessionId === session.id);

  // 2. By "全部任务" vs "我的任务"
  const tabTasks = sessionTasks.filter((t) => {
    if (activeMainTab === 'my') {
      return (
        t.assigneeName === CURRENT_USER.name ||
        t.assigneeId === CURRENT_USER.id ||
        t.creatorName === CURRENT_USER.name ||
        t.creatorId === CURRENT_USER.id
      );
    }
    return true;
  });

  // 3. By status filter
  const displayedTasks = tabTasks.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  // Render stamp based on status
  const renderStamp = (status: GroupTaskStatus, isSmall = false) => {
    const baseClass = isSmall
      ? 'border px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wider select-none shadow-2xs rotate-[-8deg]'
      : 'border-2 px-2 py-0.5 rounded-lg text-xs font-bold tracking-wider select-none shadow-2xs rotate-[-10deg]';

    switch (status) {
      case 'pending_receive':
        return (
          <div className={`${baseClass} border-orange-500/80 text-orange-600 bg-orange-50/50`}>
            待接收
          </div>
        );
      case 'pending_audit':
        return (
          <div className={`${baseClass} border-rose-500/80 text-rose-600 bg-rose-50/50`}>
            待审核
          </div>
        );
      case 'pending_process':
        return (
          <div className={`${baseClass} border-blue-500/80 text-blue-600 bg-blue-50/50`}>
            待处理
          </div>
        );
      case 'completed':
        return (
          <div className={`${baseClass} border-emerald-500/80 text-emerald-600 bg-emerald-50/50`}>
            已完成
          </div>
        );
      case 'canceled':
        return (
          <div className={`${baseClass} border-gray-400/80 text-gray-500 bg-gray-50/60`}>
            已撤销
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusLabel = (status: GroupTaskStatus) => {
    switch (status) {
      case 'pending_receive':
        return '待接收';
      case 'pending_process':
        return '待处理';
      case 'pending_audit':
        return '待审核';
      case 'completed':
        return '已完成';
      case 'canceled':
        return '已撤销';
      default:
        return '未定义';
    }
  };

  const currentSelected = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || selectedTask
    : null;

  return (
    <div
      id="group-task-sidebar-content"
      className="w-[300px] bg-[#f8fafc] border-l border-gray-200/90 flex flex-col h-full select-none shrink-0 overflow-hidden shadow-2xl z-30 justify-between"
    >
      {/* CASE 1: TASK DETAIL VIEW (Identical to Service Page Task Detail Drawer) */}
      {currentSelected ? (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Header with Back & Close Buttons */}
          <div className="p-3 pb-2.5 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
            <button
              onClick={() => setSelectedTask(null)}
              className="flex items-center gap-1 text-xs text-[#2979ff] hover:text-blue-700 font-semibold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>返回列表</span>
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-800">任务详情</span>
              <span className="text-[11px] text-gray-400">({getStatusLabel(currentSelected.status)})</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              title="关闭任务模块"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Task Detail Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Section 1: Task Title & Status Stamp */}
            <div className="p-3 bg-white border-b border-gray-100 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-bold text-gray-900 leading-snug break-words">
                  {currentSelected.title}
                </h3>
                <div className="shrink-0">
                  {renderStamp(currentSelected.status, true)}
                </div>
              </div>

              {currentSelected.deadline && (
                <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span className="truncate">要求时间: {currentSelected.deadline}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-gray-600 pt-0.5">
                <span className="text-gray-400">所属群:</span>
                <span className="truncate font-medium text-gray-800">{session.name}</span>
              </div>
            </div>

            {/* Section 2: Task Metadata */}
            <div className="text-xs divide-y divide-gray-100 bg-white border-b border-gray-100">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-gray-500 text-[11px]">任务提出人</span>
                <span className="text-gray-800 text-[11px] font-medium">{currentSelected.creatorName}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-gray-500 text-[11px]">责任处理人</span>
                <span className="text-gray-800 text-[11px] font-medium">{currentSelected.assigneeName}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-gray-500 text-[11px]">要求完成时间</span>
                <span className="text-gray-700 text-[11px] font-medium font-mono">
                  {currentSelected.deadline || '未指定'}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-gray-500 text-[11px]">创建时间</span>
                <span className="text-gray-600 text-[11px] font-mono">{currentSelected.createdAt}</span>
              </div>
            </div>

            {/* Timeout Warning */}
            {currentSelected.timeoutText && (
              <div className="bg-[#fef2f2] text-[#ef4444] text-[11px] font-medium py-2 px-3 flex items-center gap-1.5 border-b border-red-100">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{currentSelected.timeoutText}</span>
              </div>
            )}

            {/* Section 3: Task Content */}
            <div className="p-3 bg-white border-b border-gray-100 space-y-1.5">
              <div className="text-[11px] font-bold text-gray-700">任务内容</div>
              <div className="bg-[#f8fafc] rounded-lg p-2.5 text-[11px] text-gray-700 leading-relaxed break-words whitespace-pre-wrap border border-gray-100">
                {currentSelected.content || '无具体内容说明'}
              </div>
            </div>

            {/* Section 4: Actions based on status */}
            <div className="p-3 space-y-2">
              <div className="text-[11px] font-bold text-gray-700">操作流程</div>
              {currentSelected.status === 'pending_receive' && (
                <button
                  type="button"
                  onClick={() => onUpdateTaskStatus?.(currentSelected.id, 'pending_process')}
                  className="w-full py-2 bg-[#2979ff] hover:bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>确认接收任务</span>
                </button>
              )}

              {currentSelected.status === 'pending_process' && (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={completionNote}
                    onChange={(e) => setCompletionNote(e.target.value)}
                    placeholder="请输入任务处理描述..."
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-[11px] text-gray-800 placeholder-gray-400 focus:border-blue-500 outline-hidden resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateTaskStatus?.(currentSelected.id, 'pending_audit');
                      setCompletionNote('');
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>提交审核</span>
                  </button>
                </div>
              )}

              {currentSelected.status === 'pending_audit' && (
                <button
                  type="button"
                  onClick={() => onUpdateTaskStatus?.(currentSelected.id, 'completed')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>审核通过并归档</span>
                </button>
              )}

              {currentSelected.status !== 'completed' && currentSelected.status !== 'canceled' && (
                <button
                  type="button"
                  onClick={() => onUpdateTaskStatus?.(currentSelected.id, 'canceled')}
                  className="w-full py-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg text-xs font-medium border border-gray-200/80 cursor-pointer transition-colors"
                >
                  撤销该任务
                </button>
              )}

              {currentSelected.status === 'completed' && (
                <div className="py-2.5 text-center text-xs text-emerald-600 font-semibold bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>该任务已闭环完成</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* CASE 2: TASK LIST VIEW (Matching screenshot 1, sized to 300px) */
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Header with Tabs & Create Button */}
          <div className="bg-white border-b border-gray-200 px-3 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-1 -ml-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                title="关闭任务模块"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Main Tabs: 全部任务 / 我的任务 */}
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => setActiveMainTab('all')}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <span
                    className={`text-xs tracking-tight transition-colors ${
                      activeMainTab === 'all'
                        ? 'font-bold text-gray-900'
                        : 'font-normal text-gray-500 group-hover:text-gray-700'
                    }`}
                  >
                    全部任务
                  </span>
                  {activeMainTab === 'all' ? (
                    <span className="h-[2px] w-5 bg-[#2979ff] rounded-full mt-1" />
                  ) : (
                    <span className="h-[2px] w-5 bg-transparent mt-1" />
                  )}
                </button>

                <button
                  onClick={() => setActiveMainTab('my')}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <span
                    className={`text-xs tracking-tight transition-colors ${
                      activeMainTab === 'my'
                        ? 'font-bold text-gray-900'
                        : 'font-normal text-gray-500 group-hover:text-gray-700'
                    }`}
                  >
                    我的任务
                  </span>
                  {activeMainTab === 'my' ? (
                    <span className="h-[2px] w-5 bg-[#2979ff] rounded-full mt-1" />
                  ) : (
                    <span className="h-[2px] w-5 bg-transparent mt-1" />
                  )}
                </button>
              </div>
            </div>

            {/* 新建任务 Button */}
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-0.5 text-xs font-semibold text-[#2979ff] hover:text-blue-700 px-1.5 py-1 rounded hover:bg-blue-50 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建任务</span>
            </button>
          </div>

          {/* Status Sub-Filters */}
          <div className="px-2.5 py-2 bg-white/80 border-b border-gray-100 flex items-center gap-1 overflow-x-auto custom-scrollbar shrink-0">
            {STATUS_FILTERS.map((f) => {
              const isSelected = statusFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(isSelected && statusFilter !== 'all' ? 'all' : f.key)}
                  className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition-all shrink-0 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-white text-gray-900 border border-gray-200 shadow-2xs font-semibold'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Task List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
            {displayedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mb-2.5">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-xs text-gray-500 font-medium">暂无匹配的任务</p>
                <p className="text-[10px] text-gray-400 mt-1">可点击右上角「+ 新建任务」发起新任务</p>
              </div>
            ) : (
              displayedTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="bg-white rounded-xl border border-gray-200/70 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all relative overflow-hidden flex flex-col cursor-pointer active:scale-[0.995]"
                  title="点击查看任务详情"
                >
                  {/* Task Header & Stamp */}
                  <div className="p-3 pb-2 relative">
                    <div className="flex items-start justify-between gap-1.5">
                      <h4 className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 pr-12">
                        {task.title}
                      </h4>
                      <div className="absolute top-2.5 right-2.5 pointer-events-none">
                        {renderStamp(task.status, true)}
                      </div>
                    </div>

                    {/* Sub info */}
                    <div className="mt-2.5 space-y-0.5 text-[11px] text-gray-500">
                      <div className="flex items-center justify-between">
                        <span className="truncate">发起: {task.creatorName}</span>
                        <span className="truncate">处理: {task.assigneeName}</span>
                      </div>
                      <div className="text-gray-400 text-[10px] font-mono">
                        {task.createdAt}
                      </div>
                    </div>
                  </div>

                  {/* Timeout banner */}
                  {task.timeoutText && (
                    <div className="bg-[#fef2f2] text-[#ef4444] text-[10px] font-medium py-1 px-3 flex items-center gap-1 border-t border-red-100/60">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="truncate">{task.timeoutText}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

