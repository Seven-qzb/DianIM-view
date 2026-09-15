import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart2,
  CalendarCheck,
  ChevronRight,
  ChevronLeft,
  Minus,
  Square,
  X,
  Clock,
  Plus,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Share2,
  Eye,
  Check,
  Search,
  Shield,
  Ticket,
  Flame,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { TaskDirective } from '../types/chat';
import { PropagationH5Modal } from './PropagationH5Modal';

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'file';
  url?: string;
}

export interface MyTaskCardItem {
  id: string;
  title: string;
  status: 'pending_process' | 'pending_receive' | 'pending_audit' | 'completed' | 'canceled';
  statusLabel: string;
  creator: string;
  assignee: string;
  createdAt: string;
  requireTime?: string;
  completedTime?: string;
  overdueText?: string;
  isOverdue?: boolean;
  groupName: string;
  groupAvatar?: string;
  content: string;
  completedDesc?: string;
  attachments?: TaskAttachment[];
}

export interface PropagationTopicItem {
  id: string;
  topic: string;
  organization: string;
  totalData: number;
  startTime: string;
  endTime?: string;
  topicType?: string;
  status: 'monitoring' | 'completed' | 'archived';
  statusLabel: string;
}

const INITIAL_PROPAGATION_TOPICS: PropagationTopicItem[] = [
  {
    id: 'prop_000',
    topic: '陕西涉警舆情传播分析',
    organization: '陕西省公安厅',
    totalData: 10240,
    startTime: '2025-10-30 12:32:34',
    endTime: '2026-07-26 18:00:00',
    topicType: '专家话题',
    status: 'monitoring',
    statusLabel: '更新中',
  },
  {
    id: 'prop_001',
    topic: '#邵阳学院引进菲律宾博士#',
    organization: '台湾省网信办',
    totalData: 30,
    startTime: '2026-08-25 00:00:00',
    endTime: '2026-09-02 00:00:00',
    topicType: '自建话题',
    status: 'monitoring',
    statusLabel: '更新中',
  },
  {
    id: 'prop_002',
    topic: '徐州孟宪达',
    organization: '台湾省网信办',
    totalData: 376,
    startTime: '2026-01-01 08:00:00',
    endTime: '2026-09-02 00:00:00',
    topicType: '专家话题',
    status: 'monitoring',
    statusLabel: '更新中',
  },
  {
    id: 'prop_003',
    topic: '#西乡体检中心工作人员态度差#',
    organization: '台湾省网信办',
    totalData: 72,
    startTime: '2026-08-16 17:35:30',
    endTime: '2026-09-02 00:00:00',
    topicType: '自建话题',
    status: 'monitoring',
    statusLabel: '更新中',
  },
  {
    id: 'prop_004',
    topic: '刘翔 上海体育局',
    organization: '台湾省网信办',
    totalData: 1280,
    startTime: '2026-08-15 00:00:00',
    endTime: '2026-09-01 00:00:00',
    topicType: '专家话题',
    status: 'monitoring',
    statusLabel: '更新中',
  },
  {
    id: 'prop_005',
    topic: '#太原市重点网络舆情应急研判#',
    organization: '台湾省网信办',
    totalData: 520,
    startTime: '2026-08-30 09:15:00',
    endTime: '2026-09-01 18:00:00',
    topicType: '自建话题',
    status: 'completed',
    statusLabel: '已归档',
  },
];

interface ServicesViewProps {
  onJumpToChat?: (sessionId: string) => void;
  directives?: TaskDirective[];
  onUpdateDirectiveStatus?: (id: string, status: TaskDirective['status']) => void;
}

// Compact date time formatter: If current year (2026), displays 'MM-DD HH:mm', otherwise 'YYYY-MM-DD HH:mm'
export const formatCompactDateTime = (dateStr?: string) => {
  if (!dateStr) return '--';
  const currentYear = new Date().getFullYear().toString(); // '2026'
  const trimmed = dateStr.trim();
  const parts = trimmed.split(' ');
  const datePart = parts[0]; // e.g. '2026-08-31'
  const timePart = parts[1] ? parts[1].substring(0, 5) : ''; // e.g. '23:00'

  if (datePart.startsWith(currentYear + '-')) {
    const monthDay = datePart.substring(currentYear.length + 1); // '08-31'
    return timePart ? `${monthDay} ${timePart}` : monthDay;
  }
  return timePart ? `${datePart} ${timePart}` : datePart;
};

// Initial Mock Tasks: tasks needing processing by current user (戚中彪)
// Group names strictly match the chat session list, and creators are real names
const INITIAL_MY_TASKS: MyTaskCardItem[] = [
  {
    id: 'task_001',
    title: '省局涉政网络舆情专报归档与电子签发存证',
    status: 'completed',
    statusLabel: '已完成',
    creator: '任云辉',
    assignee: '戚中彪',
    createdAt: '2026-08-31 22:30:00',
    requireTime: '2026-08-31 23:00:00',
    completedTime: '2026-08-31 22:35:00',
    groupName: '研发部',
    groupAvatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=120&auto=format&fit=crop&q=80',
    content: '《华西能源涉政舆情专项分析及研判专报》已完成省局领导审签并归档存证。',
    completedDesc: '已归档至综合档案库，生成电子签章存证凭据。',
    attachments: [],
  },
  {
    id: 'task_002',
    title: '涉密舆情研判多端数据同步通道异常排查',
    status: 'pending_process',
    statusLabel: '待处理',
    creator: '马剑',
    assignee: '戚中彪',
    createdAt: '2026-08-31 21:20:00',
    requireTime: '2026-09-01 12:00:00',
    groupName: '研发中心与服务中心沟通群',
    groupAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
    content: '排查舆情研判涉密分发通道多端同步异常，核验国密SM4加密传输协议与双向证书链路完整性。',
    completedDesc: '',
    attachments: [],
  },
  {
    id: 'task_003',
    title: '全网热点高频负面预警推送降噪与流控确认',
    status: 'pending_receive',
    statusLabel: '待接收',
    creator: '孙沛文',
    assignee: '戚中彪',
    createdAt: '2026-08-29 12:49:00',
    requireTime: '2026-08-30 18:00:00',
    groupName: '推送中心-群聊需求沟通群',
    groupAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    content: '全网热搜负面预警通道瞬时触发频次过高，需确认接收并启用二级智能降噪与梯度削峰策略。',
    completedDesc: '',
    attachments: [],
  },
  {
    id: 'task_004',
    title: '审批《太原市重点舆情态势研判与应急预警服务协议》',
    status: 'pending_audit',
    statusLabel: '待审核',
    creator: '史乐乐',
    assignee: '戚中彪',
    createdAt: '2026-08-31 19:50:00',
    requireTime: '2026-09-01 18:00:00',
    groupName: '吉林省热榜-内部群',
    groupAvatar: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=120&auto=format&fit=crop&q=80',
    content: '太原市网信办重大网络舆情监测与应急研判技术支撑服务协议待审核，请核对服务保障与技术指标条款。',
    completedDesc: '',
    attachments: [],
  },
  {
    id: 'task_005',
    title: '确认全网舆情情感分类标签与知识图谱对齐规范',
    status: 'pending_process',
    statusLabel: '待处理',
    creator: '马言言',
    assignee: '戚中彪',
    createdAt: '2026-08-31 18:50:00',
    requireTime: '2026-09-01 17:00:00',
    groupName: '数据仓库&数据标签项目沟通...',
    groupAvatar: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=120&auto=format&fit=crop&q=80',
    content: '核对数仓涉稳/负面舆情多维情感分类标签库及知识图谱本体，确保与实时分析引擎指标口径一致。',
    completedDesc: '',
    attachments: [],
  },
  {
    id: 'task_006',
    title: '全网热搜爬虫采集合规签与节点安全审核',
    status: 'pending_audit',
    statusLabel: '待审核',
    creator: '赵力',
    assignee: '戚中彪',
    createdAt: '2026-08-29 16:11:00',
    requireTime: '2026-08-30 18:00:00',
    groupName: '研发正式环境测试1群',
    groupAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
    content: '新接入多平台热搜与资讯采集分布式节点，需进行采集合规性评审与安全审计准入审批。',
    completedDesc: '',
    attachments: [],
  },
  {
    id: 'task_007',
    title: '舆情处置：西安长安区墓位咨询涉稳研判',
    status: 'pending_process',
    statusLabel: '待处理',
    creator: '史乐乐',
    assignee: '戚中彪',
    createdAt: '2026-08-25 11:50:00',
    requireTime: '2026-08-26 18:00:00',
    groupName: '长春市委-热榜-内部群',
    groupAvatar: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=120&auto=format&fit=crop&q=80',
    content: '针对西安长安区相关墓位咨询与陵园服务涉稳信息展开源头溯源、多端监测与闭环处置。',
    completedDesc: '',
    attachments: [],
  },
  {
    id: 'task_008',
    title: '河南全省热榜负面预警规则校验与敏感词库同步',
    status: 'pending_receive',
    statusLabel: '待接收',
    creator: '唐雨晨',
    assignee: '戚中彪',
    createdAt: '2026-08-31 22:25:00',
    requireTime: '2026-09-01 10:00:00',
    groupName: '河南全省热榜负面预警-内...',
    groupAvatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=120&auto=format&fit=crop&q=80',
    content: '河南热榜监测通道新增3个高频涉稳预警规则，需接收并在测试环境验证过滤与告警准确率。',
    completedDesc: '',
    attachments: [],
  },
  {
    id: 'task_009',
    title: '《吉林省网络舆情监测与热点分析简报》待审签',
    status: 'pending_audit',
    statusLabel: '待审核',
    creator: '何坤',
    assignee: '戚中彪',
    createdAt: '2026-08-31 22:00:00',
    requireTime: '2026-09-01 18:00:00',
    groupName: '研发部',
    groupAvatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=120&auto=format&fit=crop&q=80',
    content: '吉林省网络舆情重点事件周期性分析与预警研判简报已编制完成，需负责人审核签发。',
    completedDesc: '',
    attachments: [],
  },
  {
    id: 'task_010',
    title: '突发重大舆情应急通道备用链路切换确认',
    status: 'pending_receive',
    statusLabel: '待接收',
    creator: '韩浩',
    assignee: '戚中彪',
    createdAt: '2026-08-31 21:50:00',
    requireTime: '2026-09-01 02:00:00',
    groupName: '密信对接推送中心...',
    groupAvatar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=120&auto=format&fit=crop&q=80',
    content: '监测到主流舆情爬虫源站反爬策略升级，系统已生成备用解析通道切换单，请尽快接收确认。',
    completedDesc: '',
    attachments: [],
  },
  {
    id: 'task_011',
    title: 'SZ热榜重点事件监测简报日报核发',
    status: 'pending_process',
    statusLabel: '待处理',
    creator: '汪艳琼',
    assignee: '戚中彪',
    createdAt: '2026-08-31 19:10:00',
    requireTime: '2026-09-01 18:00:00',
    groupName: '康奈W1-【SZ热榜...',
    groupAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    content: '康奈SZ热榜重点网络舆情事件监测简报编制完毕，请核对分析数据并执行签发推送。',
    completedDesc: '',
    attachments: [],
  },
  {
    id: 'task_012',
    title: '舆情自动化采集调度与加密存证测评报告核对',
    status: 'pending_receive',
    statusLabel: '待接收',
    creator: '吴鑫',
    assignee: '戚中彪',
    createdAt: '2026-07-04 17:41:24',
    requireTime: '2026-07-04 18:30:00',
    groupName: '研发正式环境测试1群',
    groupAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
    content: '核查全网舆情自动化抓取调度与区块链加密存证测评报告，验证双向端到端证书分发机制。',
    completedDesc: '',
    attachments: [],
  },
  {
    id: 'task_013',
    title: '突发敏感舆情自动预警联调测试回滚指令',
    status: 'canceled',
    statusLabel: '已撤销',
    creator: '赵力',
    assignee: '戚中彪',
    createdAt: '2026-08-25 15:48:02',
    requireTime: '2026-08-25 16:00:00',
    groupName: '研发正式环境测试1群',
    groupAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
    content: '临时工单：因舆情模型联调计划调整，发起人已撤回该项测试回滚指令。',
    completedDesc: '',
    attachments: [],
  },
  {
    id: 'task_014',
    title: '完成网络舆情大数据分析模型并发压力测评',
    status: 'completed',
    statusLabel: '已完成',
    creator: '任云辉',
    assignee: '戚中彪',
    createdAt: '2026-08-24 11:00:00',
    requireTime: '2026-08-25 18:00:00',
    completedTime: '2026-08-25 17:30:00',
    groupName: '研发部',
    groupAvatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=120&auto=format&fit=crop&q=80',
    content: '对亿级舆情文本实体抽取与情感倾向性分析模型进行并发压测，并生成完整测评报告。',
    completedDesc: '舆情大数据分析压测报告已出具，10万并发事件抽取平均时延 < 26ms。',
    attachments: [
      {
        id: 'att_01',
        name: '舆情大数据分析模型压测报告_v2.pdf',
        size: '2.4 MB',
        type: 'file',
      },
    ],
  },
  {
    id: 'task_015',
    title: '重大突发网络舆情应急处置演练指令',
    status: 'canceled',
    statusLabel: '已撤销',
    creator: '李斌斌',
    assignee: '戚中彪',
    createdAt: '2026-08-20 14:00:00',
    requireTime: '2026-08-20 16:00:00',
    groupName: '研发中心与服务中心沟通群',
    groupAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
    content: '重大突发舆情应急处置联合演练计划因值班排班变动已作撤销处理。',
    completedDesc: '',
    attachments: [],
  },
];

// Slanted double-border Seal Stamp Component
const StatusStamp: React.FC<{ status: MyTaskCardItem['status']; text: string; size?: 'sm' | 'md' }> = ({
  status,
  text,
  size = 'sm',
}) => {
  const getStampStyles = () => {
    switch (status) {
      case 'pending_process':
        return {
          border: 'border-[#3b82f6]',
          innerBorder: 'border-[#3b82f6]/70',
          text: 'text-[#3b82f6]',
          bg: 'bg-blue-50/30',
        };
      case 'pending_receive':
        return {
          border: 'border-[#f59e0b]',
          innerBorder: 'border-[#f59e0b]/70',
          text: 'text-[#f59e0b]',
          bg: 'bg-amber-50/30',
        };
      case 'pending_audit':
        return {
          border: 'border-[#ef4444]',
          innerBorder: 'border-[#ef4444]/70',
          text: 'text-[#ef4444]',
          bg: 'bg-red-50/30',
        };
      case 'completed':
        return {
          border: 'border-[#10b981]',
          innerBorder: 'border-[#10b981]/70',
          text: 'text-[#10b981]',
          bg: 'bg-emerald-50/30',
        };
      case 'canceled':
      default:
        return {
          border: 'border-[#9ca3af]',
          innerBorder: 'border-[#9ca3af]/70',
          text: 'text-[#9ca3af]',
          bg: 'bg-gray-50/30',
        };
    }
  };

  const s = getStampStyles();

  if (size === 'md') {
    return (
      <div className={`relative select-none pointer-events-none transform -rotate-12 ${s.text}`}>
        <div className={`px-2.5 py-1 rounded-md border-2 ${s.border} ${s.bg} flex items-center justify-center`}>
          <div className={`px-1.5 py-0.5 border border-dashed ${s.innerBorder} rounded font-bold text-xs tracking-wider`}>
            {text}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative select-none pointer-events-none transform -rotate-12 ${s.text}`}>
      <div className={`px-2 py-0.5 rounded border ${s.border} ${s.bg} flex items-center justify-center shadow-2xs`}>
        <div className={`px-1 py-0.2 border border-dotted ${s.innerBorder} rounded text-[10px] font-bold tracking-tight`}>
          {text}
        </div>
      </div>
    </div>
  );
};

export const ServicesView: React.FC<ServicesViewProps> = ({
  onJumpToChat,
  directives,
  onUpdateDirectiveStatus,
}) => {
  // Navigation: 'home' (Overview) | 'my_tasks' (Card list & detail) | 'propagation_analysis' (Propagation list)
  const [currentView, setCurrentView] = useState<'home' | 'my_tasks' | 'propagation_analysis'>('home');
  const [isPropagationModalOpen, setIsPropagationModalOpen] = useState(false);
  const [selectedPropagationTopic, setSelectedPropagationTopic] = useState<PropagationTopicItem | null>(null);

  // Propagation topics state
  const [propagationTopics, setPropagationTopics] = useState<PropagationTopicItem[]>(INITIAL_PROPAGATION_TOPICS);
  const [propagationFilter, setPropagationFilter] = useState<'all' | 'custom' | 'expert'>('all');
  const [propagationSearchQuery, setPropagationSearchQuery] = useState('');

  // Task state
  const [tasks, setTasks] = useState<MyTaskCardItem[]>(INITIAL_MY_TASKS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending_process' | 'pending_receive' | 'pending_audit' | 'completed' | 'canceled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<MyTaskCardItem | null>(null);

  // Detail panel editing state
  const [completionText, setCompletionText] = useState('');
  const [taskAttachments, setTaskAttachments] = useState<TaskAttachment[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File input ref for upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Dynamic stats calculation for tasks
  const stats = {
    total: tasks.length,
    pendingReceive: tasks.filter((t) => t.status === 'pending_receive').length,
    pendingProcess: tasks.filter((t) => t.status === 'pending_process').length,
    pendingAudit: tasks.filter((t) => t.status === 'pending_audit').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    canceled: tasks.filter((t) => t.status === 'canceled').length,
  };

  // Propagation topics stats
  const propStats = {
    total: propagationTopics.length,
    custom: propagationTopics.filter((p) => p.topicType === '自建话题').length,
    expert: propagationTopics.filter((p) => p.topicType === '专家话题').length,
  };

  // Filtered propagation topics: only search by topic name (话题名称) as requested
  const filteredPropagationTopics = useMemo(() => {
    return propagationTopics.filter((item) => {
      const matchFilter =
        propagationFilter === 'all' ||
        (propagationFilter === 'custom' && item.topicType === '自建话题') ||
        (propagationFilter === 'expert' && item.topicType === '专家话题');
      const matchSearch =
        !propagationSearchQuery.trim() ||
        item.topic.toLowerCase().includes(propagationSearchQuery.trim().toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [propagationTopics, propagationFilter, propagationSearchQuery]);

  // Group badge styling helper - unified to the clean sky blue outlined pill style
  const getGroupBadgeStyle = (_groupName?: string) => {
    return 'border-sky-300 text-sky-600 bg-sky-50/40';
  };

  // Status dot & text helper matching the 5 required types
  const getStatusDisplay = (status: MyTaskCardItem['status']) => {
    switch (status) {
      case 'pending_receive':
        return {
          dotBg: 'bg-[#ff9500]',
          text: 'text-[#ff9500]',
          label: '待接收',
        };
      case 'pending_process':
        return {
          dotBg: 'bg-[#2979ff]',
          text: 'text-[#2979ff]',
          label: '待处理',
        };
      case 'pending_audit':
        return {
          dotBg: 'bg-[#ef4444]',
          text: 'text-[#ef4444]',
          label: '待审核',
        };
      case 'completed':
        return {
          dotBg: 'bg-[#34c759]',
          text: 'text-[#34c759]',
          label: '已完成',
        };
      case 'canceled':
      default:
        return {
          dotBg: 'bg-[#8e8e93]',
          text: 'text-[#8e8e93]',
          label: '已撤销',
        };
    }
  };

  // Filtered tasks with search query
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchFilter = activeFilter === 'all' || t.status === activeFilter;
      const matchSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.groupName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [tasks, activeFilter, searchQuery]);

  // Handle task click to open detail
  const handleSelectTask = (task: MyTaskCardItem) => {
    setSelectedTask(task);
    setCompletionText(task.completedDesc || '');
    setTaskAttachments(task.attachments || []);
  };

  // Handle propagation item click to open H5 detail
  const handleOpenPropagationDetail = (topicItem: PropagationTopicItem) => {
    setSelectedPropagationTopic(topicItem);
    setIsPropagationModalOpen(true);
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    showToast('已将当前所有待办和未读通知标记为已处理');
  };

  // Handle file/image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: TaskAttachment[] = Array.from(files).map((file: File, idx: number) => {
      const isImg = file.type.startsWith('image/');
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

      let previewUrl: string | undefined = undefined;
      if (isImg) {
        previewUrl = URL.createObjectURL(file);
      }

      return {
        id: `att_${Date.now()}_${idx}`,
        name: file.name,
        size: sizeStr,
        type: isImg ? 'image' : 'file',
        url: previewUrl,
      };
    });

    setTaskAttachments((prev) => [...prev, ...newAttachments]);
    showToast(`成功添加 ${newAttachments.length} 个附件`);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove attachment
  const handleRemoveAttachment = (attId: string) => {
    setTaskAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  // Submit task completion
  const handleSubmitTask = () => {
    if (!selectedTask) return;
    if (!completionText.trim() && taskAttachments.length === 0) {
      showToast('请填写完成描述或上传相关附件');
      return;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id
          ? {
              ...t,
              status: 'pending_audit',
              statusLabel: '待审核',
              completedDesc: completionText,
              attachments: taskAttachments,
            }
          : t
      )
    );

    setSelectedTask((prev) =>
      prev
        ? {
            ...prev,
            status: 'pending_audit',
            statusLabel: '待审核',
            completedDesc: completionText,
            attachments: taskAttachments,
          }
        : null
    );

    showToast('任务已成功提交，已转入待审核状态！');
  };

  // Quick navigation to My Tasks tab
  const handleOpenMyTasks = (filterKey: typeof activeFilter = 'pending_process') => {
    setActiveFilter(filterKey);
    setCurrentView('my_tasks');
    setSelectedTask(null);
  };

  return (
    <div className="flex-1 bg-[#f4f7fc] flex flex-col h-full select-none overflow-hidden relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 text-white text-xs px-4 py-2 rounded-lg shadow-xl backdrop-blur-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
        className="hidden"
      />

      {/* VIEW 1: Service Center Home (Overview) with Compact Mini Cards matching Screenshot */}
      {currentView === 'home' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Window Bar */}
          <div className="px-6 pt-4 pb-3 flex items-center justify-between bg-transparent">
            <h1 className="text-base font-bold text-gray-900 tracking-tight">服务中心</h1>
            <div className="flex items-center gap-1 text-gray-500">
              <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-200/80 transition-colors cursor-pointer" title="最小化">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-200/80 transition-colors cursor-pointer" title="最大化">
                <Square className="w-3 h-3 stroke-[2]" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500 hover:text-white transition-colors cursor-pointer" title="关闭">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Compact Mini Cards Overview Grid (Only 传播分析 and 我的任务) */}
          <div className="px-6 py-3 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl">
              {/* Card 1: 传播分析 (Clicking opens Propagation List View) */}
              <div
                id="service-card-propagation-analysis"
                onClick={() => setCurrentView('propagation_analysis')}
                className="bg-white rounded-2xl p-4 border border-gray-100/90 shadow-xs hover:shadow-md hover:border-blue-200/70 transition-all cursor-pointer flex items-center gap-3.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#2979ff] flex items-center justify-center shrink-0 shadow-2xs">
                  <BarChart2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#2979ff] transition-colors truncate">
                    传播分析
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 font-normal truncate" title="监控和分析网络舆情动态与传播链路">
                    监控和分析网络舆情动态
                  </p>
                </div>
              </div>

              {/* Card 2: 我的任务 (Clicking opens Task Table View) */}
              <div
                id="service-card-my-tasks"
                onClick={() => handleOpenMyTasks('pending_process')}
                className="bg-white rounded-2xl p-4 border border-gray-100/90 shadow-xs hover:shadow-md hover:border-teal-200/70 transition-all cursor-pointer flex items-center gap-3.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#e6f7f5] text-[#26bba6] flex items-center justify-center shrink-0 shadow-2xs">
                  <CalendarCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#26bba6] transition-colors truncate">
                    我的任务
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 font-normal truncate" title="管理和跟踪任务执行进度">
                    管理和跟踪任务执行进度
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: 传播分析 List View (Modified from card-grid to Table/List display as requested) */}
      {currentView === 'propagation_analysis' && (
        <div className="flex flex-1 h-full overflow-hidden bg-white">
          <div className="flex-1 flex flex-col h-full bg-[#f4f7fc] min-w-0 overflow-hidden">
            {/* Top Navigation & Window Controls */}
            <div className="px-5 pt-3 pb-2.5 flex items-center justify-between bg-white border-b border-gray-200/70 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  id="btn-back-from-propagation"
                  onClick={() => setCurrentView('home')}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                  title="返回服务中心"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                </button>
                <h1 className="text-base font-bold text-gray-900 tracking-tight">传播分析</h1>
              </div>

              <div className="flex items-center gap-1 text-gray-500">
                <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer" title="最小化">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer" title="最大化">
                  <Square className="w-3 h-3 stroke-[2]" />
                </button>
                <button
                  onClick={() => setCurrentView('home')}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                  title="关闭"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter and Search Bar matching Screenshot */}
            <div className="px-5 py-3 bg-white border-b border-gray-100 shrink-0 space-y-2.5">
              {/* Search Input on top: only searches by topic name */}
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none stroke-[1.8]" />
                <input
                  id="propagation-search-input"
                  type="text"
                  value={propagationSearchQuery}
                  onChange={(e) => setPropagationSearchQuery(e.target.value)}
                  placeholder="输入话题名称搜索"
                  className="w-full pl-9.5 pr-8 py-1.5 bg-[#f2f4f8] hover:bg-[#ebf0f6] focus:bg-white text-xs text-gray-800 placeholder-gray-400 rounded-full border border-transparent focus:border-blue-300 focus:outline-none transition-all"
                />
                {propagationSearchQuery && (
                  <button
                    onClick={() => setPropagationSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                    title="清空搜索"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Pills row below search input */}
              <div className="flex items-center gap-2">
                {[
                  { key: 'all', label: `全部(${propStats.total})` },
                  { key: 'custom', label: `自建话题(${propStats.custom})` },
                  { key: 'expert', label: `专家话题(${propStats.expert})` },
                ].map((tab) => {
                  const isActive = propagationFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setPropagationFilter(tab.key as any)}
                      className={`px-3.5 py-1 text-xs rounded-full font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] font-semibold shadow-2xs'
                          : 'bg-[#f3f5f8] text-gray-700 hover:bg-gray-200/80 border border-transparent'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Propagation Topics Cards Grid Container */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 custom-scrollbar">
              {filteredPropagationTopics.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs">
                  <BarChart2 className="w-10 h-10 text-gray-300 mb-2 stroke-1" />
                  <span>暂无匹配的传播分析话题</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPropagationTopics.map((item) => {
                    const isUpdating = item.status === 'monitoring';
                    return (
                      <div
                        key={item.id}
                        id={`prop-card-${item.id}`}
                        onClick={() => handleOpenPropagationDetail(item)}
                        className="relative bg-white rounded-2xl border border-sky-300 hover:border-blue-400 hover:shadow-md transition-all p-4.5 cursor-pointer overflow-hidden group shadow-2xs select-none"
                      >
                        {/* Top-Right Corner Status Badge */}
                        <div
                          className={`absolute top-0 right-0 text-white text-[12px] font-medium px-4 py-0.5 rounded-bl-xl tracking-wider select-none ${
                            isUpdating ? 'bg-[#00c587]' : 'bg-gray-400'
                          }`}
                        >
                          {isUpdating ? '更新中' : '已归档'}
                        </div>

                        {/* Topic Title */}
                        <h3
                          className="text-[15px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate leading-snug pr-20 pt-0.5"
                          title={item.topic}
                        >
                          {item.topic}
                        </h3>

                        {/* Subtle Horizontal Divider */}
                        <div className="border-b border-gray-100 my-3.5" />

                        {/* Middle Row: 总数据量 (Left) & 专家话题 (Right) */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          {/* Left: Orange icon + 总数据量 + Total Data */}
                          <div className="flex items-center">
                            <div className="w-[18px] h-[18px] rounded-[3.5px] bg-[#ff6801] flex items-center justify-center shrink-0 shadow-2xs">
                              <BarChart2 className="w-3 h-3 text-white stroke-[2.5]" />
                            </div>
                            <span className="text-[13px] text-gray-500 ml-2 font-normal">总数据量</span>
                            <span className="text-[13px] font-bold text-gray-900 ml-2.5 font-mono">
                              {item.totalData.toLocaleString()}
                            </span>
                          </div>

                          {/* Right: Document icon + 专家话题 */}
                          <div className="flex items-center text-gray-700">
                            <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0 stroke-[1.8]" />
                            <span className="text-[13px] text-gray-700 ml-1.5 font-normal">
                              {item.topicType || '专家话题'}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Row: 起止时间 */}
                        <div className="flex items-center text-[13px] text-gray-500">
                          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0 stroke-[1.8]" />
                          <span className="ml-2 text-gray-500 shrink-0 font-normal">起止时间</span>
                          <span className="ml-2.5 font-mono text-gray-600 truncate">
                            {item.startTime} ~ {item.endTime || '2026-07-26 18:00:00'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Pagination */}
            <div className="px-6 py-2.5 bg-white border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-500 select-none shrink-0">
              <div className="text-[11px] text-gray-400">
                显示第 1 至 {filteredPropagationTopics.length} 条，共 {filteredPropagationTopics.length} 条记录
              </div>

              <div className="flex items-center gap-1.5">
                <button className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="w-6 h-6 flex items-center justify-center rounded bg-blue-50 text-blue-600 font-bold text-xs">
                  1
                </button>
                <button className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: 我的任务 Full View matching Screenshots */}
      {currentView === 'my_tasks' && (
        <div className="flex flex-1 h-full overflow-hidden bg-white">
          {/* Left / Center: Task Table Column */}
          <div className="flex-1 flex flex-col h-full bg-[#f4f7fc] min-w-0 border-r border-gray-200/80 overflow-hidden">
            {/* Top Navigation & Window Controls */}
            <div className="px-5 pt-3 pb-2 flex items-center justify-between bg-white border-b border-gray-200/70">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('home')}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                  title="返回服务中心"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                </button>
                <h1 className="text-base font-bold text-gray-900 tracking-tight">我的任务</h1>
              </div>

              <div className="flex items-center gap-1 text-gray-500">
                <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer" title="最小化">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer" title="最大化">
                  <Square className="w-3 h-3 stroke-[2]" />
                </button>
                <button
                  onClick={() => setCurrentView('home')}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                  title="关闭"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Top Status Filter Bar: 全部、待接收、待处理、待审核、已完成、已撤销 + 对应数量 */}
            <div className="px-6 py-2.5 flex items-center justify-between bg-white border-b border-gray-200/70">
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-0.5">
                {/* Status Tabs with exact counts */}
                {[
                  { key: 'all', label: '全部', count: stats.total, dotColor: 'bg-blue-600' },
                  { key: 'pending_receive', label: '待接收', count: stats.pendingReceive, dotColor: 'bg-[#ff9500]' },
                  { key: 'pending_process', label: '待处理', count: stats.pendingProcess, dotColor: 'bg-[#2979ff]' },
                  { key: 'pending_audit', label: '待审核', count: stats.pendingAudit, dotColor: 'bg-[#ef4444]' },
                  { key: 'completed', label: '已完成', count: stats.completed, dotColor: 'bg-[#34c759]' },
                  { key: 'canceled', label: '已撤销', count: stats.canceled, dotColor: 'bg-[#8e8e93]' },
                ].map((tab) => {
                  const isActive = activeFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveFilter(tab.key as any)}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-all cursor-pointer border flex items-center gap-1.5 shrink-0 ${
                        isActive
                          ? 'bg-blue-50/90 border-blue-400 text-blue-600 font-semibold shadow-2xs'
                          : 'bg-white border-gray-200/80 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${tab.dotColor}`} />
                      <span>{tab.label}</span>
                      <span
                        className={`text-[11px] font-sans px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-blue-200/60 text-blue-700 font-bold'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Side: Quick Search Input */}
              <div className="relative w-52 shrink-0 pl-2">
                <Search className="w-3.5 h-3.5 absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="task-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索任务/提出人/群组..."
                  className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50/80 hover:bg-white border border-gray-200/90 rounded-md placeholder-gray-400 text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                    title="清空搜索"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar flex flex-col">
              {/* Sticky Table Header */}
              <div className="px-6 py-2.5 bg-[#fafbfd] border-b border-gray-200/80 text-[12px] font-bold text-gray-700 select-none flex items-center shrink-0 sticky top-0 z-10 shadow-2xs">
                <div className="w-[85px] shrink-0 pl-1">状态</div>
                <div className="w-[160px] shrink-0">所属群组</div>
                <div className="flex-1 min-w-[265px] pr-4">任务标题与内容</div>
                <div className="w-[110px] shrink-0">任务提出人</div>
                <div className="w-[135px] shrink-0">要求完成时间</div>
                <div className="w-[105px] shrink-0 text-right pr-1">创建时间</div>
              </div>

              {/* Table Rows */}
              {filteredTasks.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs">
                  <CalendarCheck className="w-10 h-10 text-gray-300 mb-2 stroke-1" />
                  <span>暂无匹配的任务数据</span>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 flex-1">
                  {filteredTasks.map((task) => {
                    const isSelected = selectedTask?.id === task.id;
                    const statusInfo = getStatusDisplay(task.status);
                    const groupBadgeStyle = getGroupBadgeStyle(task.groupName);

                    return (
                      <div
                        key={task.id}
                        onClick={() => handleSelectTask(task)}
                        className={`px-6 py-3.5 flex items-center transition-all cursor-pointer group text-xs select-text ${
                          isSelected
                            ? 'bg-blue-50/80 border-l-[3px] border-l-blue-600 pl-[21px]'
                            : 'bg-white hover:bg-[#f8fafc]'
                        }`}
                      >
                        {/* 状态 (Status with dot indicator) */}
                        <div className="w-[85px] shrink-0 flex items-center gap-1.5 font-medium pl-1">
                          <span className={`w-2 h-2 rounded-full ${statusInfo.dotBg} shrink-0`} />
                          <span className={`${statusInfo.text} font-medium text-xs`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* 所属群组 (Group Name Tag with colored outline pill) */}
                        <div className="w-[160px] shrink-0 pr-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded border text-[11px] font-normal truncate max-w-full ${groupBadgeStyle}`}
                            title={task.groupName}
                          >
                            {task.groupName}
                          </span>
                        </div>

                        {/* 任务标题与内容详情 (Title and description detail with +25px width) */}
                        <div className="flex-1 min-w-[265px] flex items-baseline gap-2.5 pr-4 overflow-hidden">
                          <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors shrink-0 max-w-[285px] truncate text-xs">
                            {task.title}
                          </span>
                          <span className="text-gray-500 truncate text-[11px] font-normal">
                            {task.content}
                          </span>
                        </div>

                        {/* 任务提出人 (Creator - Real Chinese name) */}
                        <div className="w-[110px] shrink-0 text-gray-700 font-medium truncate pr-2 text-xs">
                          {task.creator}
                        </div>

                        {/* 要求完成时间 (Required completion time formatted to MM-DD HH:mm for current year) */}
                        <div className="w-[135px] shrink-0 text-gray-600 text-[11px] truncate pr-2 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">
                            {formatCompactDateTime(task.requireTime)}
                          </span>
                        </div>

                        {/* 创建时间 (Creation Time formatted to MM-DD HH:mm for current year) */}
                        <div className="w-[105px] shrink-0 text-gray-400 text-[11px] text-right pr-1 font-mono">
                          {formatCompactDateTime(task.createdAt)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Pagination & Status Summary Footer */}
            <div className="px-6 py-2.5 bg-white border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-500 select-none">
              <div className="text-[11px] text-gray-400">
                显示第 1 至 {filteredTasks.length} 条，共 {filteredTasks.length} 条记录
              </div>

              <div className="flex items-center gap-1.5">
                <button className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="w-6 h-6 flex items-center justify-center rounded bg-blue-50 text-blue-600 font-bold text-xs">
                  1
                </button>
                <button className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Task Detail Drawer matching Group Settings (`群组设置`) style with Light Backdrop */}
          <AnimatePresence>
            {selectedTask && (
              <>
                {/* Backdrop: Clicking outside on the left retracts/closes the drawer */}
                <motion.div
                  key="task-detail-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setSelectedTask(null)}
                  className="absolute inset-0 bg-black/15 z-25 cursor-pointer backdrop-blur-[0.5px]"
                  title="点击收回任务详情"
                />

                {/* Task Detail Drawer */}
                <motion.div
                  key="task-detail-sidebar"
                  initial={{ x: '100%', opacity: 0.8 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0.8 }}
                  transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                  className="absolute top-0 right-0 bottom-0 z-30 h-full shadow-2xl flex"
                >
                  <div
                    id="task-detail-sidebar-content"
                    className="w-[300px] bg-[#f8fafc] border-l border-gray-200/90 flex flex-col h-full select-none shrink-0 overflow-y-auto custom-scrollbar justify-between"
                  >
                    <div>
                      {/* Top Header with Close Button */}
                      <div className="p-3 pb-2.5 border-b border-gray-100 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-800">任务详情</span>
                          <span className="text-[11px] text-gray-400">({selectedTask.statusLabel})</span>
                        </div>
                        <button
                          onClick={() => setSelectedTask(null)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                          title="关闭任务详情"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Section 1: Task Title & Status Stamp */}
                      <div className="p-3 bg-white border-b border-gray-100 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-bold text-gray-900 leading-snug">
                            {selectedTask.title}
                          </h3>
                          <div className="shrink-0">
                            <StatusStamp status={selectedTask.status} text={selectedTask.statusLabel} size="sm" />
                          </div>
                        </div>

                        {selectedTask.requireTime && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>要求时间: {selectedTask.requireTime}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-[11px] text-gray-600 pt-0.5">
                          <img
                            src={
                              selectedTask.groupAvatar ||
                              'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80'
                            }
                            alt="群头像"
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                          />
                          <span className="truncate">{selectedTask.groupName}</span>
                        </div>
                      </div>

                      {/* Section 2: Task Metadata */}
                      <div className="text-xs divide-y divide-gray-100 bg-white border-b border-gray-100">
                        <div className="flex items-center justify-between px-3.5 py-2">
                          <span className="text-gray-500 text-[11px]">任务提出人</span>
                          <span className="text-gray-800 text-[11px] font-medium">{selectedTask.creator}</span>
                        </div>
                        <div className="flex items-center justify-between px-3.5 py-2">
                          <span className="text-gray-500 text-[11px]">责任处理人</span>
                          <span className="text-gray-800 text-[11px] font-medium">{selectedTask.assignee}</span>
                        </div>
                        <div className="flex items-center justify-between px-3.5 py-2">
                          <span className="text-gray-500 text-[11px]">要求完成时间</span>
                          <span className="text-gray-700 text-[11px] font-medium font-mono">{formatCompactDateTime(selectedTask.requireTime)}</span>
                        </div>
                        <div className="flex items-center justify-between px-3.5 py-2">
                          <span className="text-gray-500 text-[11px]">创建时间</span>
                          <span className="text-gray-600 text-[11px] font-mono">{formatCompactDateTime(selectedTask.createdAt)}</span>
                        </div>
                      </div>

                      {/* Section 3: 任务内容 */}
                      <div className="p-3 bg-white border-b border-gray-100 space-y-1.5">
                        <div className="text-[11px] font-bold text-gray-700">任务内容</div>
                        <div className="bg-[#f8fafc] rounded-lg p-2.5 text-[11px] text-gray-700 leading-relaxed break-words whitespace-pre-wrap border border-gray-100">
                          {selectedTask.content}
                        </div>
                      </div>

                      {/* Section 4: 完成描述 */}
                      <div className="p-3 bg-white border-b border-gray-100 space-y-1.5">
                        <div className="text-[11px] font-bold text-gray-700">完成描述</div>
                        <textarea
                          rows={3}
                          value={completionText}
                          onChange={(e) => setCompletionText(e.target.value)}
                          placeholder="请输入完成描述..."
                          className="w-full bg-[#f8fafc] border border-gray-200/80 rounded-lg p-2.5 text-[11px] text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all resize-none"
                        />
                      </div>

                      {/* Section 5: 上传附件 (File & Image upload) */}
                      <div className="p-3 bg-white border-b border-gray-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-700">任务附件</span>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                            <span>添加</span>
                          </button>
                        </div>

                        {/* Attachment List */}
                        {taskAttachments.length === 0 ? (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border border-dashed border-gray-200 rounded-lg p-3 text-center text-[10px] text-gray-400 hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer"
                          >
                            点击或拖拽文件/图片上传
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {taskAttachments.map((att) => (
                              <div
                                key={att.id}
                                className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 border border-gray-200/70 text-xs text-gray-700 group hover:border-blue-200 transition-all"
                              >
                                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                                  {att.type === 'image' && att.url ? (
                                    <img
                                      src={att.url}
                                      alt={att.name}
                                      className="w-6 h-6 rounded object-cover border border-gray-200 shrink-0"
                                    />
                                  ) : att.type === 'image' ? (
                                    <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                      <ImageIcon className="w-3.5 h-3.5" />
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                      <FileText className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div
                                      className="text-[11px] font-medium text-gray-800 truncate max-w-[170px]"
                                      title={att.name}
                                    >
                                      {att.name}
                                    </div>
                                    <div className="text-[9px] text-gray-400">{att.size}</div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveAttachment(att.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-200/60 transition-colors cursor-pointer"
                                  title="删除附件"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Submit Action */}
                    <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                      <button
                        type="button"
                        onClick={handleSubmitTask}
                        className="w-full py-2 bg-[#2979ff] hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>提交任务</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Propagation H5 Dashboard Modal */}
      <PropagationH5Modal
        isOpen={isPropagationModalOpen}
        onClose={() => {
          setIsPropagationModalOpen(false);
          setSelectedPropagationTopic(null);
        }}
        title={selectedPropagationTopic?.topic || '涉密信息舆情动态与多端传播分析'}
        source="台湾省网信办"
      />
    </div>
  );
};

