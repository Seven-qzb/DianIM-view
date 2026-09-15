import { ChatMessage, UserMember } from '../types/chat';
import { RD_DEPT_MEMBERS } from '../data/mockData';

// 100 realistic, contextual group chat conversation dialogues for intelligent dispatch
export const GROUP_CHAT_DIALOGUES: Array<{
  senderName: string;
  senderRole?: string;
  content: string;
}> = [
  { senderName: '李斌斌', content: '各位老师，太原市和长春市的重点舆情态势指标已经同步至协同大屏，请相关责任人核对。' },
  { senderName: '孙沛文', content: '收到，值班室已完成第一轮排查，重点传播链路未见聚集性异常。' },
  { senderName: '马言言', content: '数据仓库清洗模块刚刚完成了算法更新，敏感关联识别时延缩短到30毫秒以内了。' },
  { senderName: '韩尚君', content: '运维网络已完成国密信道双向健康自检，全省各节点通信正常，时延平均14ms。' },
  { senderName: '唐雨晨', content: '涉密专线信道的SM4国密加密握手完成，密钥周期更新策略已全量同步各终端。' },
  { senderName: '曾小明', content: '全网传播态势分析已完成最新快照采样，整体舆情关注度呈良性平稳走势。' },
  { senderName: '陈工', content: '分布式加密消息分发队列已完成吞吐测试，每秒峰值负载抗压稳定无丢包。' },
  { senderName: '任云辉', content: '各应急协同工作组注意，下午请对全省热榜负面指标展开第二轮交叉核验。' },
  { senderName: '李斌斌', content: '收到任主任要求，服务中心值班人员已全部到位，正配合开展多源比对。' },
  { senderName: '孙沛文', content: '@戚中彪 戚老师，有两份协同响应处置工单已流转至待办，方便时请确认签收。' },
  { senderName: '马剑', content: '涉密硬件节点安全沙箱测试通过，固件签名验证正常，未发现异常进程外联。' },
  { senderName: '史乐乐', content: '上一批次的重点舆情溯源报告已通过涉密信道分发给指挥部，反馈处置及时高效。' },
  { senderName: '马言言', content: '热搜榜单抓取链路重新校验了分词特征矩阵，召回准确率提升到了98.6%。' },
  { senderName: '韩尚君', content: '机房双路备用供电与光纤主备链路切换演练完成，一切指标在绿色安全线以内。' },
  { senderName: '曾小明', content: '长安区陵园涉稳信息溯源已形成阶段性研判结论，已沉淀至本地存证库。' },
  { senderName: '唐雨晨', content: '外部协同单位的安全审计对接已通过边界安全网关认证，白名单校验无误。' },
  { senderName: '李斌斌', content: '技术支持服务热线与即时协同反馈通道畅通，上午共接处协同需求14件，均已响应。' },
  { senderName: '陈工', content: '客户端最新加密补丁已就绪，更新了离线草稿自动同步与断线重连心跳保障。' },
  { senderName: '孙沛文', content: '气象与突发事件联动机能已接入，有涉民生关注点时会自动触发三级协同告警。' },
  { senderName: '任云辉', content: '好的，请技术支持部配合孙沛文做好阈值监测，重点关注晚间高峰时段。' },
  { senderName: '马剑', content: '明白，值班轮岗人员已在终端旁守候，会实时盯住预警仪表盘。' },
  { senderName: '史乐乐', content: '台湾省网信应急协同中心已与总台完成信令联通，协同效率比上周提升约40%。' },
  { senderName: '马言言', content: '补充汇报：跨域热点扩散树可视化分析模型已训练完成，可清晰透视二级传播节点。' },
  { senderName: '韩尚君', content: '安全审计日志自动归档成功，每条数据均带时间戳与防篡改国密哈希指纹。' },
  { senderName: '曾小明', content: '今天的值班数据日报已生成草稿，下午4点前会同步至群内供大家审核。' },
  { senderName: '李斌斌', content: '@所有人 收到请回复，明天上午9点召开跨部门涉密通信保障周例会。' },
  { senderName: '孙沛文', content: '值班室收到，届时准时连线。' },
  { senderName: '马剑', content: '技术支持部收到，会提前准备网络支撑材料。' },
  { senderName: '陈工', content: '研发中心收到，会演示新版点对点端到端加密通信协议。' },
  { senderName: '唐雨晨', content: '外部协同组收到，已录入日程提醒。' },
  { senderName: '韩尚君', content: '运维团队收到，将提前巡检会议室加密音视频终端。' },
  { senderName: '马言言', content: '数仓团队收到，会准备态势预测准确率回顾报表。' },
  { senderName: '曾小明', content: '分析室收到。' },
  { senderName: '任云辉', content: '好的，大家准备充分点，重点讨论下一阶段跨省联动响应标准机制。' },
  { senderName: '史乐乐', content: '各市县网信办反馈联络人名单已整理完毕，稍后更新到公共通讯录中。' },
  { senderName: '孙沛文', content: '刚刚抓取到一条热榜波动，触发了次级关注标签，正在调取事件背景。' },
  { senderName: '曾小明', content: '我正在跟进这个话题的舆论情感分布，目前中性态度占比84%，整体可控。' },
  { senderName: '马言言', content: '该事件关联媒体信源主要是地方融媒体，暂无恶意炒作或违规搬运苗头。' },
  { senderName: '任云辉', content: '密切观察即可，做好定点监测，暂不下发处置指令。' },
  { senderName: '孙沛文', content: '明白，已设为半小时定时快照跟踪。' },
  { senderName: '陈工', content: '通知：下午15:00将对辅助集群进行无感灰度升级，不会影响当前正在进行的会话。' },
  { senderName: '韩尚君', content: '运维值班配合陈工盯紧集群容器健康状态，保障零中断切换。' },
  { senderName: '李斌斌', content: '服务中心收到，如有客服或一线咨询我们会及时解答。' },
  { senderName: '马剑', content: '各工单流转节点响应正常，平均工单流转耗时12分钟，优于指标要求。' },
  { senderName: '唐雨晨', content: '跨部门协作审批流已全部实现线上电子签章与多重认证，流程规范闭环。' },
  { senderName: '史乐乐', content: '近期网络舆情应急演练方案已经下发，请各小组认真学习演练处置手册。' },
  { senderName: '孙沛文', content: '值班人员已完成方案研读，预案步骤明确，责任分工清晰。' },
  { senderName: '曾小明', content: '模型对比显示，采用新预案后整体协同联动响应效率有望再提速25%。' },
  { senderName: '马言言', content: '舆情情感分析的中文分词库已扩充专业政务用语词汇1200条。' },
  { senderName: '陈工', content: '客户端数据压缩传输算法优化完毕，弱网环境下消息收发延迟减少了35%。' },
  { senderName: '韩尚君', content: '机房核心交换机流量监控图表平稳，内网带宽使用率保持在32%的理想区间。' },
  { senderName: '李斌斌', content: '服务协议审核任务已推进至法务复审环节，预计明天上午能够顺利归档。' },
  { senderName: '任云辉', content: '各项工作都在有序推进，大家保持好当前的工作节奏。' },
  { senderName: '马剑', content: '涉密U盘与移动存储介质交叉检查已完成，未发现违规违制接入现象。' },
  { senderName: '史乐乐', content: '收到上级部门的肯定通报，对我们前期的快速响应和精准研判提出表扬。' },
  { senderName: '孙沛文', content: '大家继续加油，值班室定当站好每一班岗！' },
  { senderName: '曾小明', content: '数据统计表明，本月协同任务闭环率达99.2%，创历史新高。' },
  { senderName: '唐雨晨', content: '协同安全机制运行稳健，外部对接的各个接口均已落实双向国密鉴权。' },
  { senderName: '韩尚君', content: '定时全盘安全扫描已执行，未发现任何木马或漏洞签名，安全评分100分。' },
  { senderName: '陈工', content: '后台缓存池命中率稳定在99.8%，各群组历史记录与搜索索引极速加载。' },
  { senderName: '李斌斌', content: '新入职同事的加密协同账号与权限已按角色策略分配到位，已加入各工作群。' },
  { senderName: '马言言', content: '热搜榜词云动态看板已就绪，欢迎大家随时在服务中心查看实时大屏。' },
  { senderName: '任云辉', content: '下周的重点保会期网络安全保障工作进入临战状态，各组做好应急值守。' },
  { senderName: '马剑', content: '技术支持部已进入一级值守，7×24小时驻点运维就位。' },
  { senderName: '孙沛文', content: '值班室双人双岗值守表已排定，并已报备指挥中心。' },
  { senderName: '史乐乐', content: '前线联络员已全部测试完卫星与加密电台直连备用信道，通信万无一失。' },
  { senderName: '曾小明', content: '保会期舆情态势研判模型已加载专属特征包，支持秒级异动预警。' },
  { senderName: '唐雨晨', content: '已完成与省市公安、应急、交通等部门的数据接口联调，确保协同顺畅。' },
  { senderName: '韩尚君', content: '各节点容灾热备已全部点亮，主从切换演练用时仅0.8秒，符合特级标准。' },
  { senderName: '陈工', content: '客户端所有交互动效与消息发送流程已做过最严苛的内存泄漏排查，平稳流畅。' },
  { senderName: '李斌斌', content: '后勤保障物资与值班用房已全部准备妥当，全方位保障大家的工作。' },
  { senderName: '马言言', content: '网络舆情图谱计算引擎性能测试达标，即使面对超大规模事件也能从容应对。' },
  { senderName: '孙沛文', content: '刚刚抽查了三个重点热榜话题，目前网民讨论理性客观，未见不实谣言。' },
  { senderName: '曾小明', content: '同意孙老师的研判，目前各信源正向与客观讨论占绝对主流。' },
  { senderName: '任云辉', content: '很好，越是平稳越不能掉以轻心，严防输入型舆论倒灌。' },
  { senderName: '史乐乐', content: '是的，境外社交平台监测专线也已同步布防，未见针对性攻击迹象。' },
  { senderName: '马剑', content: '防火墙规则已拦截未授权的外围端口探测32次，均已按策略自动黑名单封锁。' },
  { senderName: '韩尚君', content: '入侵防范系统（IPS）策略库已升级至最新版本，确保零日漏洞防护。' },
  { senderName: '唐雨晨', content: '各协同单位反馈，点对点加密通联质量优良，无杂音、无丢包。' },
  { senderName: '陈工', content: '系统内核日志保持常态化清理，加密存证区容量充裕，随时满足监管调阅。' },
  { senderName: '李斌斌', content: '各业务部门的日报汇总已收集齐全，数据真实完整。' },
  { senderName: '马言言', content: '我们根据过去两周的数据，提炼出了三个潜在的热点衍生方向供领导决策。' },
  { senderName: '曾小明', content: '图表可视化效果很清晰，一目了然，给数仓的同学点赞！' },
  { senderName: '任云辉', content: '分析做得很深很细，各处室要以数据为依据，做到科学研判、精准施策。' },
  { senderName: '孙沛文', content: '收到，值班室会结合分析报告，重点加强对这些方向的巡查频次。' },
  { senderName: '史乐乐', content: '应急协同机制正处于最佳运行状态，团队协作越来越默契了！' },
  { senderName: '马剑', content: '各终端的身份证书有效期已全面排查，均在安全周期内，无需集中更新。' },
  { senderName: '韩尚君', content: '机房温湿度及机柜风道巡检正常，环境保障稳定达标。' },
  { senderName: '唐雨晨', content: '外联涉密系统安全隔离网闸运行平稳，单向传输审计链无阻滞。' },
  { senderName: '陈工', content: '任务协同模块的处理流程和流转印章机制得到一致好评，体验顺滑。' },
  { senderName: '李斌斌', content: '确实，群内任务责任到人后，工单逾期率降为了零。' },
  { senderName: '曾小明', content: '下午的态势评估综合评分达到98.8分，属于全优健康运行状态。' },
  { senderName: '马言言', content: '下一轮算法自学习优化将在今晚24点无感启动，进一步提升拟合度。' },
  { senderName: '孙沛文', content: '各岗位值班交接班记录已填报完毕，信息完整对接。' },
  { senderName: '任云辉', content: '大家辛苦了，始终绷紧安全之弦，保质保量完成各项保障任务！' },
  { senderName: '史乐乐', content: '坚守岗位，请领导放心，使命必达！' },
  { senderName: '马剑', content: '技术团队时刻在岗，全力护航！' },
  { senderName: '陈工', content: '系统全天候平稳运转，持续提供最硬核的技术支撑！' },
  { senderName: '李斌斌', content: '服务中心随时响应，保障沟通顺畅高效！' },
  { senderName: '孙沛文', content: '第100条协同消息记录确认完毕，全量节点在线，群内畅聊协同圆满达成闭环！' },
];

/**
 * Creates a high-fidelity dynamic group chat conversation message
 */
export function createGroupChatMessage(
  sessionId: string,
  count: number,
  groupMembers?: UserMember[]
): { message: ChatMessage; previewText: string; timeStr: string; senderName: string } {
  const index = (count - 1) % GROUP_CHAT_DIALOGUES.length;
  const dialogue = GROUP_CHAT_DIALOGUES[index];

  // Try to find matching member in current session or RD_DEPT_MEMBERS
  const availableMembers = groupMembers && groupMembers.length > 0 ? groupMembers : RD_DEPT_MEMBERS;
  const matchedMember =
    availableMembers.find((m) => m.name === dialogue.senderName) ||
    availableMembers[index % availableMembers.length];

  const senderName = dialogue.senderName || matchedMember.name;
  const senderAvatar = matchedMember.avatar;
  const senderId = matchedMember.id;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  // Every 5th message is sent as a realistic voice message from mobile terminals
  const isVoiceMessage = count % 5 === 0;
  const voiceDuration = Math.min(30, Math.max(5, Math.round(dialogue.content.length * 0.4)));

  const message: ChatMessage = {
    id: `msg_chat_${sessionId}_${count}_${Date.now()}`,
    sessionId,
    senderId,
    senderName,
    senderAvatar,
    isBot: false,
    type: isVoiceMessage ? 'voice' : 'text',
    content: isVoiceMessage ? `[语音] ${voiceDuration}"` : dialogue.content,
    time: timeStr,
    timestamp: Date.now(),
    voiceData: isVoiceMessage
      ? {
          duration: voiceDuration,
          terminal: count % 2 === 0 ? '移动端' : 'iOS手机端',
          transcription: dialogue.content,
          isTranscribed: false,
          isTranscribing: false,
          isListened: false,
          confidence: 0.998,
        }
      : undefined,
    readCount: Math.min(
      availableMembers.length,
      Math.max(2, Math.floor(Math.random() * availableMembers.length) + 1)
    ),
    unreadCount: Math.max(0, availableMembers.length - 3),
  };

  return {
    message,
    previewText: isVoiceMessage ? `[语音 ${voiceDuration}"]` : dialogue.content,
    timeStr,
    senderName,
  };
}
