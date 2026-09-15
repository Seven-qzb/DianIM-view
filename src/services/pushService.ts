import { ChatMessage } from '../types/chat';

export const AUTOMATED_PUSH_TEMPLATES = [
  '实时感知到第 {count} 批次全省舆情态势指标回传，网格协同状态正常。',
  '接收到节点 #{count} 加密信道自检心跳数据包，时延 14ms，校验通过。',
  '自动研判引擎完成第 {count} 轮态势聚合，当前重点研判线索已存证。',
  '收到指令流转中心第 {count} 项协同响应回执，关联部门：省网信应急协同中心。',
  '智能巡检已记录第 {count} 条安全审计日志，密级：机密，已同步存证链。',
  '第 {count} 批次协同工单流转节点已就绪，正在派发至一线值班人员。',
  '分布式加密通信网络第 {count} 次健康巡检完成，全量节点在线。',
  '收到第 {count} 份来自应急协同前线的现场数据报告，已自动归档。',
  '自动化情报关联比对引擎完成第 {count} 组特征匹配，未发现异常外联。',
  '全网传播态势分析服务第 {count} 次定时快照已生成，覆盖重点传播链路。',
];

export function createAutoPushMessage(
  sessionId: string,
  count: number,
  memberCount: number = 8
): { message: ChatMessage; previewText: string; timeStr: string } {
  const template = AUTOMATED_PUSH_TEMPLATES[(count - 1) % AUTOMATED_PUSH_TEMPLATES.length];
  const content = `[自动化推送 #${count}] ${template.replace('{count}', String(count))}`;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const message: ChatMessage = {
    id: `msg_auto_${sessionId}_${count}_${Date.now()}`,
    sessionId,
    senderId: 'bot_auto_push',
    senderName: '自动化推送助手',
    senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    isBot: true,
    type: 'text',
    content,
    time: timeStr,
    timestamp: Date.now(),
    readCount: Math.min(memberCount, Math.max(1, (count % 5) + 3)),
  };

  return { message, previewText: content, timeStr };
}
