import React, { useState } from 'react';
import { TaskItem } from '../types';
import { 
  ChevronLeft, Search, Clock, Plus, CheckCircle2, 
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface MyTasksModalProps {
  tasks: TaskItem[];
  onClose: () => void;
  onUpdateTask?: (taskId: string, updates: Partial<TaskItem>) => void;
  onCreateTask?: (task: Omit<TaskItem, 'id' | 'createdAt' | 'logs'>) => void;
}

export const MyTasksModal: React.FC<MyTasksModalProps> = ({
  tasks,
  onClose,
  onCreateTask,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'to_receive' | 'to_review' | 'completed' | 'cancelled'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newHandler, setNewHandler] = useState('芯梦');
  const [newGroup, setNewGroup] = useState('点点密信研发沟通群！！（必用）');

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

  const statusTabs: Array<{ id: typeof activeTab; label: string }> = [
    { id: 'pending', label: '待处理' },
    { id: 'to_receive', label: '待接收' },
    { id: 'to_review', label: '待审核' },
    { id: 'completed', label: '已完成' },
    { id: 'cancelled', label: '已撤销' },
  ];

  const filteredTasks = tasks.filter((t) => {
    const matchesTab = t.status === activeTab;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.handler.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateTask({
      title: newTitle.trim(),
      description: '点点密信业务协同工作任务',
      type: '信息核查',
      priority: '急件',
      status: 'pending',
      creator: '戚中彪',
      handler: newHandler,
      assigner: '指挥中心 (戚中彪)',
      institution: '台湾省网信办',
      deadline: '2026-09-05 18:00',
      progress: 0,
      overdueText: '剩余 72小时',
      targetGroupOrUser: {
        name: newGroup,
        avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=100&auto=format&fit=crop&q=80',
        isGroup: true,
      }
    });

    setNewTitle('');
    setShowCreateModal(false);
    triggerToast('任务创建成功');
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#F4F6F9] text-slate-900 flex flex-col w-full max-w-[430px] mx-auto overflow-hidden select-none font-sans">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="absolute top-4 left-4 right-4 z-60 max-w-[370px] mx-auto bg-slate-900/95 text-white py-2.5 px-4 rounded-xl shadow-xl flex items-center justify-between text-xs font-medium backdrop-blur-xs">
          <span>{toastNotice}</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        </div>
      )}

      {/* Header (Matching Image 2) */}
      <header className="h-12 bg-[#F4F6F9] px-3 flex items-center justify-between sticky top-0 z-30">
        <button
          id="back-to-services-from-tasks-btn"
          onClick={onClose}
          className="p-1.5 -ml-1 text-slate-800 hover:bg-slate-200/60 rounded-full transition-colors active:scale-95"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
        <h1 className="font-bold text-[17px] text-slate-900 tracking-tight">
          我的任务
        </h1>
        <button
          id="open-create-task-btn"
          onClick={() => setShowCreateModal(true)}
          className="p-1.5 text-[#1677FF] hover:bg-blue-50 rounded-full text-xs font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Search Input (Matching Image 2) */}
      <div className="px-3.5 pb-2.5">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="tasks-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索"
            className="w-full bg-white rounded-full pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none border border-slate-200/70 focus:border-[#1677FF] shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs (Matching Image 2) */}
      <div className="px-3.5 pb-3 flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
        {statusTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all text-center whitespace-nowrap shadow-2xs ${
                isActive
                  ? 'bg-[#E6F4FF] text-[#1677FF] border border-[#91CAFF] font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Task List (Matching Image 2 - Display Only) */}
      <div className="flex-1 overflow-y-auto px-3.5 py-1 space-y-3 pb-8">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-100/90 text-left relative overflow-hidden select-text"
          >
            {/* Top Right Stamp Badge (Authentic Oval Double-line Stamp) */}
            <div className="absolute top-2.5 right-3 pointer-events-none select-none rotate-[-12deg] opacity-85">
              <div className="border-[1.5px] border-dashed border-[#789FD6] rounded-xl px-2.5 py-0.5 text-center flex flex-col items-center justify-center bg-blue-50/20">
                <div className="flex items-center gap-0.5 text-[7px] text-[#789FD6] leading-none mb-0.5">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                </div>
                <span className="text-[12px] font-bold text-[#5584C8] tracking-wider leading-none">
                  {task.status === 'pending' ? '待处理' :
                   task.status === 'to_receive' ? '待接收' :
                   task.status === 'to_review' ? '待审核' :
                   task.status === 'completed' ? '已完成' : '已撤销'}
                </span>
                <div className="flex items-center gap-0.5 text-[7px] text-[#789FD6] leading-none mt-0.5">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                </div>
              </div>
            </div>

            {/* Task Title */}
            <h2 className="font-bold text-[15px] text-slate-900 tracking-tight mb-2.5 pr-20">
              {task.title}
            </h2>

            {/* Meta Row 1 (发起人 & 处理人) */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 pr-14">
              <div>
                <span className="text-slate-400">发起人：</span>
                <span className="text-slate-700">{task.creator}</span>
              </div>
              <div>
                <span className="text-slate-400">处理人：</span>
                <span className="text-slate-700">{task.handler}</span>
              </div>
            </div>

            {/* Meta Row 2 (创建时间) */}
            <div className="text-xs text-slate-500 mb-2.5">
              <span className="text-slate-400">创建时间：</span>
              <span className="text-slate-600 font-mono text-[11px]">{task.createdAt}</span>
            </div>

            {/* Overdue Alert Bar (Red background if overdue) */}
            {task.overdueText && (
              <div className="bg-[#FFF1F0] text-[#FF4D4F] px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 font-medium mb-2.5 border border-[#FFCCC7]/50">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{task.overdueText}</span>
              </div>
            )}

            {/* Bottom Association Group / User */}
            {task.targetGroupOrUser && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 pt-1 border-t border-slate-50">
                <img
                  src={task.targetGroupOrUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
                <span className="text-slate-700 truncate max-w-[260px] text-[11.5px]">
                  {task.targetGroupOrUser.name}
                </span>
              </div>
            )}
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-xs">
            暂无{statusTabs.find(t => t.id === activeTab)?.label}任务
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="absolute inset-0 z-60 bg-black/40 backdrop-blur-xs flex items-end justify-center p-0 max-w-[430px] mx-auto">
            <motion.form
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onSubmit={handleCreateTask}
              className="bg-white w-full rounded-t-3xl p-5 space-y-3.5 max-h-[85vh] overflow-y-auto text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">
                  新建业务任务
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  任务名称 *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：测试任务上传"
                  className="w-full bg-[#F4F6F9] rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:bg-white border border-transparent focus:border-[#1677FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  处理人
                </label>
                <input
                  type="text"
                  value={newHandler}
                  onChange={(e) => setNewHandler(e.target.value)}
                  placeholder="例如：芯梦 / 马言言"
                  className="w-full bg-[#F4F6F9] rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:bg-white border border-transparent focus:border-[#1677FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  关联工作群
                </label>
                <input
                  type="text"
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  placeholder="例如：点点密信研发沟通群！！（必用）"
                  className="w-full bg-[#F4F6F9] rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:bg-white border border-transparent focus:border-[#1677FF]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1677FF] text-white rounded-xl text-xs font-semibold shadow-md hover:bg-blue-600"
                >
                  立即创建
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
