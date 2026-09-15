import React, { useState } from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, ArrowRight, UserCheck, Send, ShieldAlert, FileText, Check } from 'lucide-react';
import { TaskDirective, UserMember, ChatSession } from '../types/chat';
import { CURRENT_USER } from '../data/mockData';

interface DirectiveFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: ChatSession;
  sessionMembers?: UserMember[];
  directive?: TaskDirective | null;
  onDispatchDirective?: (newDirective: TaskDirective) => void;
  onCreateDirective?: (newDirective: TaskDirective) => void;
  onUpdateDirectiveStatus?: (directiveId: string, status: TaskDirective['status'], remark?: string) => void;
  onUpdateStatus?: (directiveId: string, status: TaskDirective['status'], remark?: string) => void;
}

export const DirectiveFlowModal: React.FC<DirectiveFlowModalProps> = ({
  isOpen,
  onClose,
  session,
  sessionMembers,
  directive,
  onDispatchDirective,
  onCreateDirective,
  onUpdateDirectiveStatus,
  onUpdateStatus,
}) => {
  // Mode: view existing directive or create a new one
  const isViewMode = !!directive;

  const members = (sessionMembers && sessionMembers.length > 0)
    ? sessionMembers
    : (session?.members && session.members.length > 0)
    ? session.members
    : [CURRENT_USER];
  const initialAssigneeId = members[1]?.id || members[0]?.id || CURRENT_USER.id;

  // New directive form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(initialAssigneeId);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [deadline, setDeadline] = useState('今天 18:00');
  const [feedbackRemark, setFeedbackRemark] = useState('');

  if (!isOpen) return null;

  const handleCreateDirective = () => {
    if (!title.trim()) return;
    const targetMember = members.find((m) => m.id === assigneeId) || members[0] || CURRENT_USER;

    const newDirective: TaskDirective = {
      id: `dir_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || '请按时高效落实本项安全合规指令，并于截止时间前在端内提交办结凭证。',
      status: 'pending',
      priority,
      assigneeName: targetMember.name,
      assigneeId: targetMember.id,
      assignerName: CURRENT_USER.name,
      assignerId: CURRENT_USER.id,
      deadline,
      sessionId: session?.id || directive?.sessionId || '',
      sessionName: session?.name || directive?.sessionName || '群聊',
      createdAt: '今天 ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      flowSteps: [
        {
          title: '指令下发与立项',
          operator: CURRENT_USER.name,
          time: '今天 ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          status: 'done',
          remark: '指令已同步加密推送至承办人与会话流',
        },
        {
          title: '承办人接收与处理',
          operator: targetMember.name,
          time: '待接收',
          status: 'active',
          remark: '等待承办人确认接收',
        },
        {
          title: '办结核验与归档',
          operator: CURRENT_USER.name,
          time: '待完成',
          status: 'pending',
          remark: '经密级审计后自动封存区块链凭据',
        },
      ],
    };

    if (onDispatchDirective) {
      onDispatchDirective(newDirective);
    } else if (onCreateDirective) {
      onCreateDirective(newDirective);
    }
    onClose();
  };

  return (
    <div
      id="directive-flow-overlay"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="directive-flow-dialog"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1e293b] to-[#334155] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2979ff] flex items-center justify-center text-white font-bold shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                {isViewMode ? '密信指令流转详情与处理' : '下发群组指令待办'}
              </h2>
              <p className="text-[11px] text-slate-300">
                {isViewMode ? `所属群聊：${directive?.sessionName || '群聊'}` : `下发至群聊：${session?.name || '当前群聊'}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
          {isViewMode && directive ? (
            /* View Existing Directive Detail & Timeline */
            <div className="space-y-4">
              {/* Title & Priority Badge */}
              <div className="flex items-start justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        directive.priority === 'high'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {directive.priority === 'high' ? '🚨 紧急度: 高' : '📌 普通指令'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                        directive.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : directive.status === 'processing'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {directive.status === 'completed'
                        ? '✅ 已办结'
                        : directive.status === 'processing'
                        ? '⚡ 处理中'
                        : '⏳ 待承办'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">
                    {directive.title}
                  </h3>
                  <p className="text-gray-600 mt-1 leading-relaxed">
                    {directive.description}
                  </p>
                </div>
              </div>

              {/* Standardized 4 Docked Fields Card: 标题、状态、发起人、创建时间 */}
              <div className="bg-slate-50 p-3.5 border border-slate-200/90 rounded-xl space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 font-medium shrink-0">标题：</span>
                  <span className="font-bold text-gray-900 leading-snug">{directive.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-medium shrink-0">状态：</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                      directive.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : directive.status === 'processing' || directive.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {directive.status === 'completed'
                      ? '已办结'
                      : directive.status === 'processing' || directive.status === 'in_progress'
                      ? '处理中'
                      : '待处理'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-gray-400 font-medium">发起人：</span>
                    <span className="font-semibold text-gray-800">{directive.assignerName || directive.senderName || '指令调度中心'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">创建时间：</span>
                    <span className="font-mono text-gray-600">{directive.createdAt}</span>
                  </div>
                </div>

                {directive.description && (
                  <div className="pt-1 text-gray-600 border-t border-slate-200/60 leading-relaxed">
                    <span className="text-gray-400 font-medium">摘要说明：</span>
                    <span>{directive.description}</span>
                  </div>
                )}
              </div>

              {/* Workflow Flow Steps Timeline */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>指令流转链路存证</span>
                </h4>
                <div className="space-y-3 pl-2 border-l-2 border-blue-200 ml-2">
                  {((directive.flowSteps && directive.flowSteps.length > 0)
                    ? directive.flowSteps
                    : [
                        {
                          title: '工单下发与立项',
                          operator: directive.assignerName || directive.senderName || '系统调度中心',
                          time: directive.createdAt || '已下发',
                          status: 'done',
                          remark: directive.description || '工单已下发',
                        },
                        {
                          title: '责任人签收与处置',
                          operator: directive.assigneeName || '经办责任人',
                          time: directive.status === 'completed' ? '已办结' : directive.status === 'processing' || directive.status === 'in_progress' ? '处理中' : '待处理',
                          status: directive.status === 'completed' ? 'done' : directive.status === 'processing' || directive.status === 'in_progress' ? 'active' : 'pending',
                          remark: '协同跟进与闭环处置',
                        },
                        {
                          title: '核实研判与结果存证',
                          operator: '系统自动存证',
                          time: directive.status === 'completed' ? '已归档' : '待完成',
                          status: directive.status === 'completed' ? 'done' : 'pending',
                        },
                      ]
                  ).map((step, idx) => (
                    <div key={idx} className="relative pl-4">
                      {/* Step node dot */}
                      <span
                        className={`absolute -left-[19px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${
                          step.status === 'done'
                            ? 'bg-emerald-500 text-white'
                            : step.status === 'active'
                            ? 'bg-blue-500 animate-pulse'
                            : 'bg-gray-300'
                        }`}
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800">{step.title}</span>
                        <span className="text-[10px] text-gray-400">{step.time}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        经办人: <span className="font-medium text-gray-700">{step.operator}</span>
                        {step.remark && <span className="ml-2 text-gray-600">({step.remark})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status transition action */}
              {directive.status !== 'completed' && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2.5">
                  <span className="font-bold text-blue-900">提交指令办结/流转反馈</span>
                  <input
                    type="text"
                    placeholder="填写流转反馈或办结凭据说明..."
                    value={feedbackRemark}
                    onChange={(e) => setFeedbackRemark(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {directive.status === 'pending' && (
                      <button
                        onClick={() => {
                          const updateFn = onUpdateDirectiveStatus || onUpdateStatus;
                          updateFn?.(directive.id, 'processing', feedbackRemark || '已接收指令并开始处理');
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        确认接收并开始处理
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const updateFn = onUpdateDirectiveStatus || onUpdateStatus;
                        updateFn?.(directive.id, 'completed', feedbackRemark || '指令已全部办结核验');
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>标记为已办结</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Create New Directive Form */
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  指令标题 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="例如：关于全链路SM4密钥轮转与测试验证工作指令"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  指令详细要求与办理指引
                </label>
                <textarea
                  rows={3}
                  placeholder="请详细说明指令办理要求、预期交付物及涉密安全等级..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:border-blue-600 focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    指定承办责任人
                  </label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:border-blue-600 focus:bg-white"
                  >
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.department || '群成员'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    紧急度等级
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:border-blue-600 focus:bg-white"
                  >
                    <option value="high">🚨 特急 (2小时内核验)</option>
                    <option value="medium">📌 重要 (今日完成)</option>
                    <option value="low">📋 常规待办</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  办结截止时限
                </label>
                <input
                  type="text"
                  placeholder="例如：今天 18:00 / 2026-08-28 12:00"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions for creation */}
        {!isViewMode && (
          <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              * 指令下发后将自动生成密信区块链存证并同步至承办人「我的任务」
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-200/60 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                id="btn-confirm-dispatch-directive"
                onClick={handleCreateDirective}
                disabled={!title.trim()}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  title.trim()
                    ? 'bg-[#2979ff] hover:bg-[#1e6bf0] text-white shadow-xs cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>下发指令</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
