import React, { useState } from 'react';
import { InstructionItem } from '../types';
import { 
  ChevronLeft, ArrowLeftRight, CheckCircle2, ShieldCheck, 
  Clock, AlertTriangle, Plus, Search, Building2, 
  FileText, Check, X, Download, Send, Sparkles, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InstructionFlowModalProps {
  instructions: InstructionItem[];
  onClose: () => void;
  onSignInstruction: (instructionId: string) => void;
  onCreateInstruction: (inst: Omit<InstructionItem, 'id' | 'createdAt' | 'signedCount' | 'flowSteps'>) => void;
  initialSelectedCode?: string;
}

export const InstructionFlowModal: React.FC<InstructionFlowModalProps> = ({
  instructions,
  onClose,
  onSignInstruction,
  onCreateInstruction,
  initialSelectedCode,
}) => {
  const [tab, setTab] = useState<'all' | 'received' | 'dispatched'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InstructionItem | null>(() => {
    if (initialSelectedCode) {
      return instructions.find(i => i.code === initialSelectedCode) || instructions[0] || null;
    }
    return null;
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // New Instruction Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newLevel, setNewLevel] = useState<InstructionItem['level']>('特急');
  const [newSecretLevel, setNewSecretLevel] = useState<InstructionItem['secretLevel']>('机密');
  const [newDeadline, setNewDeadline] = useState('今日 18:00');
  const [selectedReceivers, setSelectedReceivers] = useState<string[]>([
    '市公安局网安支队',
    '技术保障中心',
  ]);

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const filteredInstructions = instructions.filter((i) => {
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.senderOrg.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateInstruction({
      code: `ZL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle.trim(),
      content: newContent.trim() || '请各协同单位严格按照应急预案落实指令要求。',
      senderOrg: '中共娄底市委网络安全和信息化委员会办公室',
      receiverOrgs: selectedReceivers,
      level: newLevel,
      secretLevel: newSecretLevel,
      status: 'dispatched',
      deadline: newDeadline,
      totalReceivers: selectedReceivers.length,
      attachments: [{ name: '网络应急处置要点与协同表.pdf', size: '1.5 MB' }],
    });

    setNewTitle('');
    setNewContent('');
    setShowCreateModal(false);
    triggerToast('加密工作指令已成功签发并全网分发');
  };

  const handleSign = (item: InstructionItem) => {
    onSignInstruction(item.id);
    setSelectedItem({
      ...item,
      status: 'processing',
      signedCount: Math.min(item.signedCount + 1, item.totalReceivers),
      flowSteps: item.flowSteps.map((step, idx) => {
        if (step.title.includes('签收')) {
          return { ...step, status: 'done', note: '张明华 (我) 已实名完成密码机签收' };
        }
        return step;
      })
    });
    triggerToast('您已完成该指令的合规实名签收！');
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#F8F9FA] text-slate-900 flex flex-col max-w-[430px] w-full mx-auto overflow-y-auto select-none font-sans">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="absolute top-4 left-4 right-4 z-50 max-w-[390px] mx-auto bg-slate-900 text-white p-3 rounded-xl shadow-xl flex items-center justify-between text-xs font-medium">
          <span>{toastNotice}</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
      )}

      {/* Header */}
      <header className="h-14 bg-white border-b border-[#E3E2E7] px-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
            title="返回服务"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1.5">
            <h1 className="font-['Manrope'] font-bold text-base text-slate-900">
              指令流转协同中枢
            </h1>
            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
              全流程可追溯
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="p-2 text-purple-700 hover:bg-purple-50 rounded-full transition-colors flex items-center gap-1 text-xs font-semibold"
          title="发布指令"
        >
          <Plus className="w-4 h-4" />
          <span>下发指令</span>
        </button>
      </header>

      {/* Search & Status Bar */}
      <div className="p-4 bg-white border-b border-slate-200/80 sticky top-14 z-20 space-y-2.5">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索指令编号、标题或发布机关..."
            className="w-full bg-[#F4F3F8] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 outline-none focus:bg-white border border-transparent focus:border-purple-600"
          />
        </div>

        <div className="flex gap-2">
          {[
            { id: 'all', label: `全部指令 (${instructions.length})` },
            { id: 'received', label: '我接收的' },
            { id: 'dispatched', label: '我下发的' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                tab === t.id
                  ? 'bg-[#8A5AF0] text-white shadow-xs'
                  : 'bg-[#F4F3F8] text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Instruction List */}
      <main className="p-4 space-y-3 pb-16">
        {filteredInstructions.map((item) => {
          const isUrgent = item.level === '特急';
          const isSigned = item.signedCount === item.totalReceivers;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
                isUrgent ? 'border-purple-200 hover:border-purple-400' : 'border-slate-200/80 hover:border-purple-300'
              }`}
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isUrgent ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.level}
                  </span>

                  <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
                    {item.secretLevel}
                  </span>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.code}
                  </span>
                </div>

                <span className="text-[11px] text-purple-600 font-bold">
                  {item.status === 'finished' ? '已办结' : '流转中'}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-['Manrope'] font-bold text-sm text-slate-900 mb-1.5 leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                {item.content}
              </p>

              {/* Progress & Signed Stat */}
              <div className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-1.5 text-purple-900 font-medium text-[11px]">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>机构签收进度：{item.signedCount}/{item.totalReceivers} 已签收</span>
                </div>
                <span className="text-[10px] font-mono text-purple-700 font-bold">
                  {Math.round((item.signedCount / item.totalReceivers) * 100)}%
                </span>
              </div>

              {/* Footer Org & Deadline */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[140px]">{item.senderOrg}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>时效: {item.deadline}</span>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Instruction Detail & Lifecycle Timeline Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 max-h-[88vh] flex flex-col shadow-2xl overflow-y-auto"
            >
              {/* Sheet Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">
                    {selectedItem.level}
                  </span>
                  <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded">
                    {selectedItem.secretLevel}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedItem.code}</span>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-base font-bold text-slate-900 font-['Manrope'] mb-2">
                {selectedItem.title}
              </h2>

              <div className="bg-[#F4F3F8] p-3.5 rounded-xl text-xs text-slate-700 leading-relaxed mb-4 border border-slate-200">
                <p className="font-semibold text-slate-900 mb-1">【指令正文】</p>
                {selectedItem.content}
              </div>

              {/* Sender & Receiver Info */}
              <div className="space-y-1.5 text-xs mb-4">
                <p className="text-slate-500">
                  <span className="font-semibold text-slate-700">发布机关：</span>
                  {selectedItem.senderOrg}
                </p>
                <p className="text-slate-500">
                  <span className="font-semibold text-slate-700">接收机构：</span>
                  {selectedItem.receiverOrgs.join('、')}
                </p>
              </div>

              {/* Attachments */}
              {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-800 mb-1.5">密件附件</p>
                  <div className="space-y-1.5">
                    {selectedItem.attachments.map((att, i) => (
                      <div
                        key={i}
                        onClick={() => triggerToast(`正在安全解密附件：${att.name}`)}
                        className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between cursor-pointer hover:bg-blue-100/60 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#0058BD]" />
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{att.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{att.size}</p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-[#0058BD]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifecycle Flow Timeline (全流程追溯轨迹) */}
              <div className="border-t border-slate-100 pt-3 mb-4">
                <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>指令流转全流程追溯轨迹</span>
                </h4>

                <div className="space-y-3 pl-1">
                  {selectedItem.flowSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 relative">
                      {/* Connection Line */}
                      {idx < selectedItem.flowSteps.length - 1 && (
                        <div className="absolute left-[7px] top-4 bottom-[-12px] w-[2px] bg-slate-200" />
                      )}

                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        step.status === 'done'
                          ? 'bg-purple-600 text-white'
                          : step.status === 'current'
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-slate-200 text-slate-400'
                      }`}>
                        {step.status === 'done' ? (
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{step.title}</span>
                          {step.time && <span className="text-[10px] font-mono text-slate-400">{step.time}</span>}
                        </div>
                        <p className="text-[11px] text-slate-600">{step.orgOrUser}</p>
                        {step.note && (
                          <p className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded mt-0.5 inline-block">
                            {step.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSign(selectedItem)}
                  className="flex-1 py-2.5 bg-[#8A5AF0] hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>一键实名签收</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('办理反馈已提交并加密同步至发令机关')}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-slate-600" />
                  <span>提交办理反馈</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Instruction Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900 font-['Manrope']">
                  签发跨部门协同工作指令
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    指令标题
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="例如：关于针对某敏感事件全网协同阻断的指令"
                    className="w-full bg-[#F4F3F8] rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-purple-600 border border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    指令具体要求与处置规范
                  </label>
                  <textarea
                    rows={3}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="请输入具体的指令事项、责任时限及协调机制..."
                    className="w-full bg-[#F4F3F8] rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-purple-600 border border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      时效级别
                    </label>
                    <select
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value as any)}
                      className="w-full bg-[#F4F3F8] rounded-xl px-2.5 py-2 text-xs text-slate-900 outline-none"
                    >
                      <option value="特急">特急 (立即执行)</option>
                      <option value="紧急">紧急 (2小时内)</option>
                      <option value="普通">普通 (常规流转)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      密级标识
                    </label>
                    <select
                      value={newSecretLevel}
                      onChange={(e) => setNewSecretLevel(e.target.value as any)}
                      className="w-full bg-[#F4F3F8] rounded-xl px-2.5 py-2 text-xs text-slate-900 outline-none"
                    >
                      <option value="机密">机密 (国密通道)</option>
                      <option value="秘密">秘密</option>
                      <option value="内部">内部</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    接收单位与机构
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {['市公安局网安支队', '技术保障中心', '各区县网信办', '新闻发布协调组'].map((org) => {
                      const isSelected = selectedReceivers.includes(org);
                      return (
                        <button
                          type="button"
                          key={org}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedReceivers(selectedReceivers.filter(r => r !== org));
                            } else {
                              setSelectedReceivers([...selectedReceivers, org]);
                            }
                          }}
                          className={`p-2 rounded-xl text-left border transition-all ${
                            isSelected
                              ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold'
                              : 'bg-[#F4F3F8] border-slate-200 text-slate-600'
                          }`}
                        >
                          {org}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#8A5AF0] hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/20"
                  >
                    立即分发下达
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
