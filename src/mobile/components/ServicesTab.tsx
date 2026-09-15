import React, { useState } from 'react';
import { TaskItem } from '../types';
import { 
  BarChart3, CheckCircle2
} from 'lucide-react';
import { PropagationAnalysisModal } from './PropagationAnalysisModal';
import { MyTasksModal } from './MyTasksModal';
import { motion } from 'motion/react';

interface ServicesTabProps {
  tasks: TaskItem[];
  onUpdateTask?: (taskId: string, updates: Partial<TaskItem>) => void;
  onCreateTask?: (task: Omit<TaskItem, 'id' | 'createdAt' | 'logs'>) => void;
  institutionName?: string;
}

export const ServicesTab: React.FC<ServicesTabProps> = ({
  tasks,
  onUpdateTask,
  onCreateTask,
  institutionName = '中共娄底市委网信办',
}) => {
  const [activeModal, setActiveModal] = useState<'propagation' | 'tasks' | null>(null);

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-[#FAF9FE] text-[#1A1B1F] select-none font-['Hanken_Grotesk'] no-scrollbar">
      {/* Mobile Header */}
      <header className="pt-4 pb-3 px-4 flex flex-col items-center justify-center relative">
        <h1 className="font-bold text-lg text-slate-900 tracking-tight">
          服务
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {institutionName} · 业务协同工作台
        </p>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 px-4 max-w-[430px] mx-auto w-full space-y-3.5">
        {/* 1. 传播分析 (Blue Gradient Card) */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          id="service-propagation-card"
          type="button"
          onClick={() => setActiveModal('propagation')}
          className="w-full rounded-2xl p-4.5 text-white flex items-center justify-between min-h-[96px] text-left shadow-sm relative overflow-hidden group cursor-pointer transition-all"
          style={{
            background: 'linear-gradient(135deg, #4da9ff 0%, #2f8cff 100%)',
          }}
        >
          <div className="relative z-10">
            <h2 className="font-bold text-lg drop-shadow-xs">
              传播分析
            </h2>
            <p className="text-xs text-white/90 drop-shadow-xs mt-1 font-medium">
              分析舆情动态
            </p>
          </div>

          <div className="relative z-10 bg-white/20 p-3 rounded-2xl backdrop-blur-xs group-hover:bg-white/30 transition-colors shadow-xs">
            <BarChart3 className="w-7 h-7 stroke-[2.2]" />
          </div>

          {/* Decorative ambient blur */}
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/15 rounded-full blur-xl pointer-events-none" />
        </motion.button>

        {/* 2. 我的任务 (Green Gradient Card) */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          id="service-tasks-card"
          type="button"
          onClick={() => setActiveModal('tasks')}
          className="w-full rounded-2xl p-4.5 text-white flex items-center justify-between min-h-[96px] text-left shadow-sm relative overflow-hidden group cursor-pointer transition-all"
          style={{
            background: 'linear-gradient(135deg, #4bd5a6 0%, #2bb281 100%)',
          }}
        >
          <div className="relative z-10">
            <h2 className="font-bold text-lg drop-shadow-xs">
              我的任务
            </h2>
            <p className="text-xs text-white/90 drop-shadow-xs mt-1 font-medium">
              管理任务进度
            </p>
          </div>

          <div className="relative z-10 bg-white/20 p-3 rounded-2xl backdrop-blur-xs group-hover:bg-white/30 transition-colors shadow-xs">
            <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
          </div>

          {/* Decorative ambient blur */}
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/15 rounded-full blur-xl pointer-events-none" />
        </motion.button>
      </main>

      {/* Sub-module Modals */}
      {activeModal === 'propagation' && (
        <PropagationAnalysisModal
          onClose={() => setActiveModal(null)}
          institutionName={institutionName}
        />
      )}

      {activeModal === 'tasks' && (
        <MyTasksModal
          tasks={tasks}
          onClose={() => setActiveModal(null)}
          onUpdateTask={onUpdateTask || (() => {})}
          onCreateTask={onCreateTask || (() => {})}
        />
      )}
    </div>
  );
};
