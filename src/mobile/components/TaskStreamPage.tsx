import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, X, 
  Clock, CheckCircle2, AlertCircle, FileText, Send, Check, User, Plus
} from 'lucide-react';
import { SecurityWatermark } from './SecurityWatermark';
import { motion, AnimatePresence } from 'motion/react';

export interface TaskStreamItem {
  id: string;
  title: string;
  timeHeader: string; // e.g. "今天 09:15"
  status: '待接收' | '待审核' | '待处置' | '待处理' | '处理中' | '已完成';
  initiator: string; // 发起人
  handler: string; // 处理人
  createdAt: string; // 创建时间
  description?: string;
  priority?: '特急' | '急件' | '普通';
  department?: string;
  secretLevel?: string;
  groupName?: string;
}

interface TaskStreamPageProps {
  type: 'tasks' | 'instructions';
  title: string;
  currentUserName?: string;
  onClose: () => void;
  onNavigateToGroupChat?: (groupName: string) => void;
}

// Pre-seeded mock data based on the 4 task lifecycle states and notification titles
const DEFAULT_MY_TASKS: TaskStreamItem[] = [
  {
    id: 'task-stream-1',
    title: '有任务到达：自动化测试任务',
    timeHeader: '今天 16:52',
    status: '处理中',
    initiator: '赵力',
    handler: '戚中彪',
    createdAt: '2026-09-08 16:52:00',
    description: '执行点点密信国密SM4端到端加密握手与全链路压力测试，包含高并发消息收发与防截屏水印校验。',
    priority: '急件',
    secretLevel: '机密',
    department: '技术保障部',
    groupName: '研发部',
  },
  {
    id: 'task-stream-2',
    title: '有任务审核：涉密通信链路安全基线专项排查',
    timeHeader: '今天 14:30',
    status: '待审核',
    initiator: '戚中彪',
    handler: '任云辉',
    createdAt: '2026-08-27 14:30:15',
    description: '对骨干节点及密信通讯通道的安全基线开展排查审计，现处理人已完成自测并提交审核。',
    priority: '急件',
    secretLevel: '机密',
    department: '网络安全支队',
    groupName: '研发部',
  },
  {
    id: 'task-stream-3',
    title: '有任务到达：台湾省涉稳重点词库第三轮研判审校',
    timeHeader: '今天 09:15',
    status: '待处置',
    initiator: '史乐乐',
    handler: '戚中彪',
    createdAt: '2026-08-28 09:15:00',
    description: '请针对涉台涉稳新增的敏感词库与多维度研判标签进行第三轮协同核对，确认无误后导入敏感词过滤微服务。',
    priority: '特急',
    secretLevel: '机密',
    department: '涉警情报处',
    groupName: '研发部',
  },
  {
    id: 'task-stream-4',
    title: '任务已完成：点点密信跨省业务专线联调及加密插件自测',
    timeHeader: '09-06 14:20',
    status: '已完成',
    initiator: '韩浩',
    handler: '戚中彪',
    createdAt: '2026-09-06 14:20:30',
    description: '已完成跨节点双向TLS鉴权接入测试，国密加密插件自测报告已签字归档。',
    priority: '急件',
    secretLevel: '普通',
    department: '研发一部',
    groupName: '研发部',
  },
];

const DEFAULT_INSTRUCTIONS: TaskStreamItem[] = [
  {
    id: 'inst-stream-1',
    title: '舆情处置：西安长安区墓地咨询 墓地涉警问题核查',
    timeHeader: '今天 14:52',
    status: '待处置',
    initiator: '指挥中心-何坤',
    handler: '戚中彪',
    createdAt: '2026-09-08 14:52:00',
    description: '接群众反映及网络舆情监测报告，涉及西安长安区墓地咨询相关舆情发酵，请迅速开展线索核查与落地处置。',
    priority: '特急',
    secretLevel: '机密',
    department: '市局指挥中心',
    groupName: '研发部',
  },
  {
    id: 'inst-stream-2',
    title: '台湾省涉稳重点词库第三轮研判审校',
    timeHeader: '今天 09:15',
    status: '待接收',
    initiator: '史乐乐',
    handler: '戚中彪',
    createdAt: '2026-08-28 09:15:00',
    description: '各协同单位按照特级指令要求，对第三轮研判审校成果完成签收，并启动实名数字签名认证流程。',
    priority: '特急',
    secretLevel: '机密',
    department: '网信应急办',
    groupName: '研发部',
  },
  {
    id: 'inst-stream-3',
    title: '涉密专网跨节点加密握手协议核查',
    timeHeader: '今天 08:40',
    status: '待审核',
    initiator: '马剑',
    handler: '戚中彪',
    createdAt: '2026-08-28 08:40:12',
    description: '全网各节点即日起启动节点自查，对握手失败日志实行逐小时汇总，并向省厅网信平台同步提交审核材料。',
    priority: '急件',
    secretLevel: '机密',
    department: '技术支撑中心',
    groupName: '研发部',
  },
  {
    id: 'inst-stream-4',
    title: '网络重大突发事件应急联防联控专项协同指令',
    timeHeader: '09-06 10:30',
    status: '已完成',
    initiator: '中共娄底市委网信办',
    handler: '戚中彪',
    createdAt: '2026-09-06 10:30:15',
    description: '各联合处置专班已完成应急演练与实名签到，相关防护规则与溯源数据已完成保密归档。',
    priority: '特急',
    secretLevel: '机密',
    department: '中共娄底市委网信办',
    groupName: '研发部',
  },
];

export const TaskStreamPage: React.FC<TaskStreamPageProps> = ({
  type,
  title,
  currentUserName = '戚中彪',
  onClose,
  onNavigateToGroupChat,
}) => {
  const [items, setItems] = useState<TaskStreamItem[]>(() => 
    type === 'tasks' ? DEFAULT_MY_TASKS : DEFAULT_INSTRUCTIONS
  );
  const [selectedItem, setSelectedItem] = useState<TaskStreamItem | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newHandler, setNewHandler] = useState('戚中彪');

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const extractRawTitle = (fullTitle: string) => {
    return fullTitle
      .replace(/^有任务到达：/, '')
      .replace(/^有任务审核：/, '')
      .replace(/^任务已完成：/, '')
      .replace(/^有任务已完成：/, '')
      .trim();
  };

  // 1、创建任务 接收方：处理人 通知标题：有任务到达：+任务标题
  const handleCreateTask = () => {
    if (!newTitle.trim()) return;
    const raw = extractRawTitle(newTitle);
    const assignedHandler = newHandler.trim() || '戚中彪';
    const finalTitle = `有任务到达：${raw}`;
    const newTask: TaskStreamItem = {
      id: `task-stream-${Date.now()}`,
      title: finalTitle,
      timeHeader: '刚刚',
      status: '待接收',
      initiator: currentUserName,
      handler: assignedHandler,
      createdAt: new Date().toLocaleDateString('zh-CN') + ' ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      description: '新下发加密协同工作任务，请及时接收并闭环办理。',
      priority: '普通',
      secretLevel: '机密',
      department: '技术保障部',
      groupName: '研发部',
    };
    setItems((prev) => [newTask, ...prev]);
    setIsCreateModalOpen(false);
    setNewTitle('');
    triggerToast(`任务已创建！接收方：处理人（${assignedHandler}），通知标题：有任务到达：${raw}`);
  };

  // 2、提交任务 接收方：创建人 通知标题：有任务审核：+任务标题
  const handleSubmitTask = (item: TaskStreamItem) => {
    const raw = extractRawTitle(item.title);
    const updatedTitle = `有任务审核：${raw}`;
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, title: updatedTitle, status: '待审核' } : it))
    );
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem({ ...selectedItem, title: updatedTitle, status: '待审核' });
    }
    triggerToast(`任务已提交！接收方：创建人（${item.initiator}），通知标题：有任务审核：${raw}`);
  };

  // 3、审核驳回 接收方：处理人 通知标题：有任务到达：+任务标题
  const handleRejectAudit = (item: TaskStreamItem) => {
    const raw = extractRawTitle(item.title);
    const updatedTitle = `有任务到达：${raw}`;
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, title: updatedTitle, status: '待处置' } : it))
    );
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem({ ...selectedItem, title: updatedTitle, status: '待处置' });
    }
    triggerToast(`已审核驳回！接收方：处理人（${item.handler}），通知标题：有任务到达：${raw}`);
  };

  // 4、审核通过 接收方：处理人 通知标题：任务已完成：+任务标题
  const handlePassAudit = (item: TaskStreamItem) => {
    const raw = extractRawTitle(item.title);
    const updatedTitle = `任务已完成：${raw}`;
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, title: updatedTitle, status: '已完成' } : it))
    );
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem({ ...selectedItem, title: updatedTitle, status: '已完成' });
    }
    triggerToast(`审核通过！接收方：处理人（${item.handler}），通知标题：任务已完成：${raw}`);
  };

  // Helper for Status Badge styling (Only used for instructions; tasks do NOT display status)
  const renderStatusBadge = (status: TaskStreamItem['status']) => {
    switch (status) {
      case '待接收':
        return (
          <span className="bg-[#FFFBE6] text-[#FAAD14] border border-[#FFE58F] px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 shadow-2xs">
            待接收
          </span>
        );
      case '待审核':
        return (
          <span className="bg-[#E6F4FF] text-[#1677FF] border border-[#91CAFF] px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 shadow-2xs">
            待审核
          </span>
        );
      case '待处置':
      case '待处理':
        return (
          <span className="bg-[#FFF2E8] text-[#FA541C] border border-[#FFBB96] px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 shadow-2xs">
            {status}
          </span>
        );
      case '处理中':
        return (
          <span className="bg-[#F0F5FF] text-[#2F54EB] border border-[#ADC6FF] px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 shadow-2xs">
            处理中
          </span>
        );
      case '已完成':
        return (
          <span className="bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F] px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 shadow-2xs">
            已完成
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0">
            {status}
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="absolute inset-0 z-50 bg-[#F4F6F9] text-slate-900 flex flex-col w-full h-full overflow-hidden select-none font-sans"
    >
      {/* Background Watermark matching Figure 2 */}
      <SecurityWatermark name={currentUserName} timestamp="2026/08/28 09:15" />

      {/* Toast Notice */}
      <AnimatePresence>
        {toastNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-60 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg pointer-events-none backdrop-blur-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{toastNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-md px-3 pt-3 pb-2.5 border-b border-slate-200/80 flex items-center justify-between shrink-0 z-30 shadow-2xs">
        <button
          type="button"
          onClick={onClose}
          className="p-1 -ml-1 text-slate-700 hover:text-[#0058BD] active:scale-90 transition-transform cursor-pointer rounded-full"
          title="返回消息页"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
        <h1 className="font-bold text-[17px] text-slate-900 tracking-tight">
          {title}
        </h1>
        {type === 'tasks' ? (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs font-semibold bg-[#1677FF] text-white px-2.5 py-1 rounded-lg hover:bg-[#0958D9] active:scale-95 transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建</span>
          </button>
        ) : (
          <div className="w-8" />
        )}
      </header>

      {/* Stream List (Directly display the message template stream matching Image 2) */}
      <main className="flex-1 overflow-y-auto px-4 py-2 space-y-3 relative z-10 no-scrollbar pb-10">
        {items.length === 0 ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center">
            <FileText className="w-12 h-12 text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-xs">暂无{title}消息</p>
          </div>
        ) : (
          items.map((item) => (
            <React.Fragment key={item.id}>
              {/* Centered Timestamp Divider (Matching "今天 09:15" in Image 2) */}
              <div className="flex justify-center my-1.5">
                <span className="text-[11px] text-slate-400 font-normal select-none">
                  {item.timeHeader}
                </span>
              </div>

              {/* Template Card (Exact layout and typography matching Image 2) */}
              <div
                id={`card-${item.id}`}
                className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/70 text-left relative overflow-hidden select-text transition-all hover:shadow-xs"
              >
                {/* Top Row: Title (No status badge for tasks) */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h2 className="font-bold text-[14.5px] sm:text-[15px] text-slate-900 tracking-tight leading-snug flex-1">
                    {item.title}
                  </h2>
                  {type !== 'tasks' && renderStatusBadge(item.status)}
                </div>

                {/* Middle Row 1: 发起人 & 处理人 (Two columns) */}
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">发起人：</span>
                    <span className="text-slate-800 font-medium">{item.initiator}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">处理人：</span>
                    <span className="text-slate-800 font-medium">{item.handler}</span>
                  </div>
                </div>

                {/* Middle Row 2: 创建时间 */}
                <div className="flex items-center gap-1 text-xs text-slate-600 mb-2.5">
                  <span className="text-slate-400">创建时间：</span>
                  <span className="text-slate-600 font-mono text-[11.5px]">{item.createdAt}</span>
                </div>

                {/* Bottom Separator & Right Link: 详情 > (Matching Image 2) */}
                <div className="border-t border-slate-100 pt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="text-[#1677FF] hover:text-[#0958d9] text-xs font-medium flex items-center gap-0.5 cursor-pointer group active:scale-95 transition-transform"
                  >
                    <span>详情</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.2] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </React.Fragment>
          ))
        )}
      </main>

      {/* Task / Instruction Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div
            className="absolute inset-0 z-60 bg-black/45 backdrop-blur-xs flex items-end justify-center"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Top Header */}
              <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 truncate max-w-[260px]">
                    {title}详情
                  </h3>
                  {type !== 'tasks' && renderStatusBadge(selectedItem.status)}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 overflow-y-auto space-y-3.5 text-xs text-slate-700 no-scrollbar">
                {/* Title Card */}
                <div className="bg-[#F8F9FA] rounded-xl p-3 border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 mb-1 block">标题名称</span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {selectedItem.title}
                  </h4>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block mb-0.5">发起人</span>
                    <span className="font-medium text-slate-900 text-xs">{selectedItem.initiator}</span>
                  </div>
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block mb-0.5">当前处理人</span>
                    <span className="font-medium text-slate-900 text-xs">{selectedItem.handler}</span>
                  </div>
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block mb-0.5">创建时间</span>
                    <span className="font-mono text-slate-700 text-[11px]">{selectedItem.createdAt}</span>
                  </div>
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block mb-0.5">密级与缓急</span>
                    <span className="font-medium text-[#0058BD] text-xs">
                      {selectedItem.secretLevel || '机密'} · {selectedItem.priority || '特急'}
                    </span>
                  </div>
                </div>

                {/* Description Content */}
                <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/60 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-medium">任务与指令要求</span>
                  <p className="text-slate-800 text-[12.5px] leading-relaxed whitespace-pre-wrap font-normal">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Workflow Simulation Timeline */}
                <div className="bg-white border border-slate-200/70 p-3 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-slate-800 block">流转节点追溯</span>
                  <div className="space-y-2 pl-2 border-l-2 border-blue-400/40 ml-1">
                    <div className="relative pl-3">
                      <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] font-semibold text-slate-800">1. 指令/任务发起并审核下发</span>
                        <span className="text-[10px] text-slate-400">{selectedItem.timeHeader}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">发起人：{selectedItem.initiator}</p>
                    </div>

                    <div className="relative pl-3">
                      <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] font-semibold text-slate-800">2. 责任人签收与协同处置</span>
                        <span className="text-[10px] text-slate-400">实时协同</span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        处理人：{selectedItem.handler}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
                {type === 'tasks' ? (
                  <>
                    {/* 2、提交任务 接收方：创建人 通知标题：有任务审核：+任务标题 */}
                    {(selectedItem.title.startsWith('有任务到达：') || (!selectedItem.title.startsWith('有任务审核：') && !selectedItem.title.startsWith('任务已完成：'))) && (
                      <button
                        type="button"
                        onClick={() => handleSubmitTask(selectedItem)}
                        className="flex-1 bg-[#1677FF] hover:bg-[#0958D9] text-white py-2.5 px-4 rounded-xl text-xs font-semibold active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>提交任务（接收方：创建人）</span>
                      </button>
                    )}

                    {/* 3、审核驳回 / 4、审核通过 */}
                    {selectedItem.title.startsWith('有任务审核：') && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRejectAudit(selectedItem)}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 px-3 rounded-xl text-xs font-semibold active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>审核驳回</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePassAudit(selectedItem)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>审核通过</span>
                        </button>
                      </>
                    )}

                    {/* 任务已完成 */}
                    {selectedItem.title.startsWith('任务已完成：') && (
                      <div className="flex-1 py-2 text-center text-xs text-emerald-600 font-semibold bg-emerald-50 rounded-xl border border-emerald-200">
                        任务已完成归档
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {selectedItem.status === '待接收' && (
                      <button
                        type="button"
                        onClick={() => {
                          setItems((prev) => prev.map((it) => it.id === selectedItem.id ? { ...it, status: '处理中' } : it));
                          setSelectedItem({ ...selectedItem, status: '处理中' });
                          triggerToast('已确认接收该指令，已进入处理阶段');
                        }}
                        className="flex-1 bg-[#FAAD14] hover:bg-[#D48806] text-white py-2.5 px-4 rounded-xl text-xs font-semibold active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>立即接收指令</span>
                      </button>
                    )}

                    {selectedItem.status === '待审核' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setItems((prev) => prev.map((it) => it.id === selectedItem.id ? { ...it, status: '待处置' } : it));
                            setSelectedItem({ ...selectedItem, status: '待处置' });
                            triggerToast('已驳回，需发起人补充材料');
                          }}
                          className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-medium active:scale-95 transition-all cursor-pointer"
                        >
                          驳回修改
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setItems((prev) => prev.map((it) => it.id === selectedItem.id ? { ...it, status: '处理中' } : it));
                            setSelectedItem({ ...selectedItem, status: '处理中' });
                            triggerToast('审核通过，已进入执行流转');
                          }}
                          className="flex-1 bg-[#1677FF] hover:bg-[#0958D9] text-white py-2.5 px-4 rounded-xl text-xs font-semibold active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>审核通过</span>
                        </button>
                      </>
                    )}

                    {(selectedItem.status === '待处置' || selectedItem.status === '处理中') && (
                      <button
                        type="button"
                        onClick={() => {
                          setItems((prev) => prev.map((it) => it.id === selectedItem.id ? { ...it, status: '已完成' } : it));
                          setSelectedItem({ ...selectedItem, status: '已完成' });
                          triggerToast('已完成处置并归档');
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>标记为已完成办结</span>
                      </button>
                    )}

                    {selectedItem.status === '已完成' && (
                      <button
                        type="button"
                        onClick={() => triggerToast('归档报告已在国密区块链完成留存')}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 px-4 rounded-xl text-xs font-medium cursor-pointer"
                      >
                        已办结归档（点击核对存证）
                      </button>
                    )}
                  </>
                )}

                {/* Optional navigate to group chat */}
                {onNavigateToGroupChat && selectedItem.groupName && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem(null);
                      onClose();
                      onNavigateToGroupChat(selectedItem.groupName || '研发部');
                    }}
                    className="px-3 py-2.5 bg-blue-50 text-[#0058BD] border border-blue-200 rounded-xl text-xs font-medium hover:bg-blue-100 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    前往群聊
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Task Modal for Mobile */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div
            className="absolute inset-0 z-70 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-2xl border border-slate-100 space-y-3.5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-bold text-sm text-slate-900">新建协同任务</h3>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">任务标题</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="输入任务标题，如：跨省专网加密链路联调"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">接收方（处理人）</label>
                  <select
                    value={newHandler}
                    onChange={(e) => setNewHandler(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="戚中彪">戚中彪</option>
                    <option value="任云辉">任云辉</option>
                    <option value="史乐乐">史乐乐</option>
                    <option value="韩浩">韩浩</option>
                    <option value="马剑">马剑</option>
                    <option value="赵力">赵力</option>
                  </select>
                </div>

                <div className="p-2.5 bg-blue-50 rounded-xl text-[11px] text-blue-700 leading-relaxed">
                  通知标题规则：创建后将向处理人发送通知<strong>「有任务到达：{newTitle || '任务标题'}」</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleCreateTask}
                  disabled={!newTitle.trim()}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#1677FF] hover:bg-[#0958D9] disabled:opacity-50 text-white rounded-lg cursor-pointer"
                >
                  确认创建
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
