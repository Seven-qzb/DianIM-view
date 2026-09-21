/**
 * [Service - ContactService]
 * 统一联系人状态管理与业务服务
 * 
 * 核心业务规则：
 * 1. 机构好友：该机构下应用点点密信的用户，无需添加好友默认可私信，无法删除
 * 2. 我的好友：添加应用点点密信其他机构的用户，支持群组私信和添加删除。
 *    游客用户无法添加好友，但可以私信（私信为群组内私信）
 * 3. 个人名片信息规范：头像、名称、IP、手机号（中间四位做加密处理）
 * 4. 我的群组：加入的群组列表，点击指定群组支持查看群组下的全员列表
 */

import { AVATARS } from '../mobile/data/avatars';

export type ContactType = 'org' | 'friend';

export interface FriendRequest {
  id: string;
  requesterId: string;
  name: string;
  avatar: string;
  ip: string;
  phone: string; // 保证中间4位已脱敏加密，如 150****9286
  institutionName: string;
  department: string;
  applyReason: string;
  applyTime: string;
  status: 'pending' | 'accepted' | 'rejected';
  rejectReason?: string; // 拒绝时的理由反馈
}

export interface ContactUser {
  id: string;
  name: string;
  avatar: string;
  ip: string;
  phone: string; // 保证中间4位已脱敏加密，例如 138****5678
  rawPhone?: string; // 完整号码（脱敏前，仅供比对或内部系统使用）
  type: ContactType; // 'org': 机构好友 | 'friend': 我的好友
  department: string;
  institutionName: string;
  isOnline: boolean;
  role?: 'owner' | 'admin' | 'member';
  canDelete: boolean; // 机构好友为 false, 我的好友为 true
  sessionId?: string; // 关联的单聊会话ID
  groupSessionId?: string; // 游客关联的群内临时会话ID
  gender?: 'male' | 'female';
  addedAt?: string;
  remark?: string;
}

export interface ContactGroup {
  id: string;
  name: string;
  avatar: string;
  memberCount: number;
  members: ContactUser[];
  announcement?: string;
  institutionName?: string;
  groupTag?: string; // e.g. "机构内部群" | "跨机构协同群"
  sessionId: string; // 关联的群聊会话ID
  ownerName: string;
}

/**
 * 手机号中间四位加密工具函数
 * 将 13812345678 转换为 138****5678
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '138****0000';
  const clean = phone.trim();
  if (/^\d{3}\*{4}\d{4}$/.test(clean)) return clean;
  const digits = clean.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}****${digits.slice(7)}`;
  }
  if (digits.length >= 7) {
    return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
  }
  return clean;
}

// 初始机构好友列表（台湾省网信办 / 研发中心内部同事，无需添加，默认互通，不可删除）
const INITIAL_ORG_CONTACTS: ContactUser[] = [
  {
    id: 'user_ryh',
    name: '任云辉',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    ip: '183.200.98.42',
    phone: maskPhoneNumber('13912345678'),
    rawPhone: '13912345678',
    type: 'org',
    department: '研发架构部',
    institutionName: '台湾省网信办',
    isOnline: true,
    role: 'admin',
    canDelete: false,
    sessionId: 'session_rd_dept',
  },
  {
    id: 'user_sll',
    name: '史乐乐',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    ip: '183.200.98.55',
    phone: maskPhoneNumber('13823456789'),
    rawPhone: '13823456789',
    type: 'org',
    department: '指挥督导处',
    institutionName: '台湾省网信办',
    isOnline: true,
    role: 'admin',
    canDelete: false,
    sessionId: 'session_notice',
  },
  {
    id: 'user_hk',
    name: '何坤',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    ip: '183.200.98.87',
    phone: maskPhoneNumber('13434567890'),
    rawPhone: '13434567890',
    type: 'org',
    department: '研发一部',
    institutionName: '台湾省网信办',
    isOnline: true,
    role: 'member',
    canDelete: false,
  },
  {
    id: 'user_wx',
    name: '吴鑫',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    ip: '183.200.98.12',
    phone: maskPhoneNumber('13945678901'),
    rawPhone: '13945678901',
    type: 'org',
    department: '终端研发科',
    institutionName: '台湾省网信办',
    isOnline: true,
    role: 'member',
    canDelete: false,
  },
  {
    id: 'user_hh',
    name: '韩浩',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
    ip: '183.200.98.54',
    phone: maskPhoneNumber('13856789012'),
    rawPhone: '13856789012',
    type: 'org',
    department: '系统架构组',
    institutionName: '台湾省网信办',
    isOnline: true,
    role: 'owner',
    canDelete: false,
  },
  {
    id: 'user_mcz',
    name: '马宸卓',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    ip: '183.200.98.33',
    phone: maskPhoneNumber('13767890123'),
    rawPhone: '13767890123',
    type: 'org',
    department: '研发二部',
    institutionName: '台湾省网信办',
    isOnline: true,
    role: 'member',
    canDelete: false,
  },
  {
    id: 'user_mj',
    name: '马俊',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    ip: '183.200.98.91',
    phone: maskPhoneNumber('15878901234'),
    rawPhone: '15878901234',
    type: 'org',
    department: '算法安全组',
    institutionName: '台湾省网信办',
    isOnline: true,
    role: 'member',
    canDelete: false,
  },
  {
    id: 'user_wyq',
    name: '汪艳琼',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    ip: '183.200.98.68',
    phone: maskPhoneNumber('18689012345'),
    rawPhone: '18689012345',
    type: 'org',
    department: '密信产品部',
    institutionName: '台湾省网信办',
    isOnline: true,
    role: 'member',
    canDelete: false,
  },
  {
    id: 'user_zl',
    name: '赵力',
    avatar: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=120&auto=format&fit=crop&q=80',
    ip: '183.200.98.24',
    phone: maskPhoneNumber('13390123456'),
    rawPhone: '13390123456',
    type: 'org',
    department: '安全审计科',
    institutionName: '台湾省网信办',
    isOnline: true,
    role: 'admin',
    canDelete: false,
  },
  {
    id: 'user_cg',
    name: '陈工',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&auto=format&fit=crop&q=80',
    ip: '183.200.98.79',
    phone: maskPhoneNumber('18901234567'),
    rawPhone: '18901234567',
    type: 'org',
    department: '国密工程组',
    institutionName: '台湾省网信办',
    isOnline: true,
    role: 'member',
    canDelete: false,
  },
  {
    id: 'user_mjw',
    name: '马剑',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    ip: '183.200.98.15',
    phone: maskPhoneNumber('13512345670'),
    rawPhone: '13512345670',
    type: 'org',
    department: '技术支持中心',
    institutionName: '台湾省网信办',
    isOnline: true,
    role: 'member',
    canDelete: false,
  },
];

// 初始我的好友列表（其他机构添加的用户，支持群组私信、添加、删除；游客用户无法添加好友）
const INITIAL_MY_FRIENDS: ContactUser[] = [
  {
    id: 'friend_tyc',
    name: '唐雨晨',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    ip: '113.246.12.89 (湖南·娄底)',
    phone: maskPhoneNumber('13958217789'),
    rawPhone: '13958217789',
    type: 'friend',
    department: '应急协查处',
    institutionName: '中共娄底市委网络安全和信息化委员会办公室',
    isOnline: true,
    role: 'member',
    canDelete: true,
    addedAt: '2026-08-15',
    remark: '娄底网信协同联络员',
    groupSessionId: 'conv-4',
  },
  {
    id: 'friend_lbb',
    name: '李斌斌',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    ip: '222.240.180.45 (湖南·长沙)',
    phone: maskPhoneNumber('18633908812'),
    rawPhone: '18633908812',
    type: 'friend',
    department: '安全监测中心',
    institutionName: '湖南省网络安全与应急协同指挥中心',
    isOnline: true,
    role: 'admin',
    canDelete: true,
    addedAt: '2026-07-20',
    remark: '应急指挥调度对接人',
    groupSessionId: 'conv-3',
  },
  {
    id: 'friend_spw',
    name: '孙沛文',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
    ip: '124.127.88.102 (北京·西城)',
    phone: maskPhoneNumber('15891246633'),
    rawPhone: '15891246633',
    type: 'friend',
    department: '数字金融合规实验室',
    institutionName: '国家金融与发展实验室',
    isOnline: false,
    role: 'member',
    canDelete: true,
    addedAt: '2026-06-11',
    remark: '金融密文算法合作专家',
    groupSessionId: 'conv-4',
  },
  {
    id: 'friend_myy',
    name: '马言言',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    ip: '117.34.78.215 (陕西·西安)',
    phone: maskPhoneNumber('18966219088'),
    rawPhone: '18966219088',
    type: 'friend',
    department: '测评认证一部',
    institutionName: '陕西省网络空间安全测评中心',
    isOnline: true,
    role: 'member',
    canDelete: true,
    addedAt: '2026-09-02',
    remark: '安全评测核验专员',
    groupSessionId: 'conv-2',
  },
  {
    id: 'friend_hsj',
    name: '韩尚君',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    ip: '101.89.155.67 (上海·浦东)',
    phone: maskPhoneNumber('13744185520'),
    rawPhone: '13744185520',
    type: 'friend',
    department: '综合调度科',
    institutionName: '华东协同应急联络处',
    isOnline: false,
    role: 'member',
    canDelete: true,
    addedAt: '2026-08-28',
    remark: '华东跨区任务联动',
    groupSessionId: 'conv-3',
  },
  {
    id: 'friend_zxl',
    name: '周晓琳',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    ip: '120.244.110.33 (北京·海淀)',
    phone: maskPhoneNumber('15088321900'),
    rawPhone: '15088321900',
    type: 'friend',
    department: '商密合规测评组',
    institutionName: '国家密码管理局评估合作组',
    isOnline: true,
    role: 'admin',
    canDelete: true,
    addedAt: '2026-09-10',
    remark: '国密SM4资质联合复核',
    groupSessionId: 'conv-4',
  },
];

// 初始他人好友申请列表（新的好友申请，包含黄洋等）
const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 'req_hy',
    requesterId: 'user_hy',
    name: '黄洋',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    ip: '223.104.202.78',
    phone: '150****9286',
    institutionName: '国家工业信息安全发展研究中心',
    department: '研发部',
    applyReason: '申请添加好友：协同开展网络空间安全攻防演练专项对接',
    applyTime: '10分钟前',
    status: 'pending',
  },
  {
    id: 'req_czq',
    requesterId: 'user_czq',
    name: '陈志强',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    ip: '113.246.88.19 (湖南·长沙)',
    phone: '138****3241',
    institutionName: '湖南省委网信办',
    department: '应急督查处',
    applyReason: '申请添加好友：两地联合应急响应处置工作联络',
    applyTime: '昨天 16:30',
    status: 'pending',
  },
  {
    id: 'req_lxh',
    requesterId: 'user_lxh',
    name: '林晓慧',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
    ip: '183.200.77.102 (福建·厦门)',
    phone: '189****6612',
    institutionName: '厦门市委网络安全和信息化委员会办公室',
    department: '网安保障科',
    applyReason: '申请添加好友：海峡两岸网信学术交流活动会务联络',
    applyTime: '3天前',
    status: 'pending',
  },
];

// 初始加入的群组列表（支持查看群组下的全员列表）
const INITIAL_GROUPS: ContactGroup[] = [
  {
    id: 'group_vpn',
    name: 'vpn',
    avatar: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=120&auto=format&fit=crop&q=80',
    memberCount: 16,
    announcement: 'vpn加密协同与专线网络安全运行维护保障群组。',
    institutionName: '网络安全协同中心',
    groupTag: '专网VPN',
    sessionId: 'session_vpn',
    ownerName: '韩浩',
    members: [
      {
        id: 'user_hh_vpn',
        name: '韩浩',
        avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
        ip: '223.104.11.116',
        phone: '183****1626',
        rawPhone: '18312341626',
        type: 'org',
        department: '系统架构组',
        institutionName: '台湾省网信办',
        isOnline: true,
        role: 'owner',
        canDelete: false,
        groupSessionId: 'session_vpn',
      },
      {
        id: 'user_qzb_vpn',
        name: '戚中彪 (我)',
        avatar: AVATARS.qizhongbiao,
        ip: '183.200.98.66',
        phone: maskPhoneNumber('15688887630'),
        rawPhone: '15688887630',
        type: 'org',
        department: '技术研发中心',
        institutionName: '台湾省网信办',
        isOnline: true,
        role: 'admin',
        canDelete: false,
        groupSessionId: 'session_vpn',
      },
      {
        id: 'user_hy_vpn',
        name: '黄洋',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
        ip: '223.104.202.78',
        phone: '150****9286',
        rawPhone: '15012349286',
        type: 'friend',
        department: '研发部',
        institutionName: '研发部协同专班',
        isOnline: true,
        role: 'member',
        canDelete: true,
        groupSessionId: 'session_vpn',
      },
      INITIAL_ORG_CONTACTS[0], // 任云辉
      INITIAL_ORG_CONTACTS[1], // 史乐乐
      INITIAL_ORG_CONTACTS[2], // 何坤
      INITIAL_ORG_CONTACTS[3], // 吴鑫
      INITIAL_MY_FRIENDS[0],   // 唐雨晨
      INITIAL_MY_FRIENDS[1],   // 李斌斌
    ],
  },
  {
    id: 'group_rd_dept',
    name: '正式研发中心测试群222',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
    memberCount: 26,
    announcement: '【涉密提醒】各研发协同人员必须严格遵守商密信息交互规范，严禁跨域泄露。',
    institutionName: '台湾省网信办',
    groupTag: '机构核心研发群',
    sessionId: 'session_rd_dept',
    ownerName: '韩浩',
    members: [
      {
        id: 'user_qzb',
        name: '戚中彪 (我)',
        avatar: AVATARS.qizhongbiao,
        ip: '183.200.98.66 (台湾·值守)',
        phone: maskPhoneNumber('15688887630'),
        rawPhone: '15688887630',
        type: 'org',
        department: '技术研发中心',
        institutionName: '台湾省网信办',
        isOnline: true,
        role: 'owner',
        canDelete: false,
      },
      {
        id: 'user_hy',
        name: '黄洋',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
        ip: '223.104.202.78',
        phone: '150****9286',
        rawPhone: '15012349286',
        type: 'friend',
        department: '研发部',
        institutionName: '研发部协同专班',
        isOnline: true,
        role: 'member',
        canDelete: true,
        groupSessionId: 'session_rd_dept',
      },
      ...INITIAL_ORG_CONTACTS,
      INITIAL_MY_FRIENDS[3], // 马言言
    ],
  },
  {
    id: 'group_notice',
    name: '指令流转与应急调度',
    avatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=80',
    memberCount: 12,
    announcement: '实时接收并闭环处置下发的舆情监测工单及特急督办指令。',
    institutionName: '台湾省网信办',
    groupTag: '行政指令流转',
    sessionId: 'session_notice',
    ownerName: '史乐乐',
    members: [
      INITIAL_ORG_CONTACTS[1], // 史乐乐
      {
        id: 'user_qzb',
        name: '戚中彪 (我)',
        avatar: AVATARS.qizhongbiao,
        ip: '183.200.98.66',
        phone: maskPhoneNumber('15688887630'),
        rawPhone: '15688887630',
        type: 'org',
        department: '技术研发中心',
        institutionName: '台湾省网信办',
        isOnline: true,
        role: 'admin',
        canDelete: false,
      },
      INITIAL_ORG_CONTACTS[0], // 任云辉
      INITIAL_ORG_CONTACTS[8], // 赵力
      INITIAL_ORG_CONTACTS[9], // 陈工
      INITIAL_ORG_CONTACTS[10], // 马剑
      INITIAL_MY_FRIENDS[0], // 唐雨晨
      INITIAL_MY_FRIENDS[1], // 李斌斌
    ],
  },
  {
    id: 'group_emergency',
    name: '涉密应急指挥调度专班群',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80',
    memberCount: 18,
    announcement: '跨区域突发事件7×24小时值班协同应急通道。',
    institutionName: '湖南省网络安全与应急协同指挥中心',
    groupTag: '跨区域应急',
    sessionId: 'session_broadcast',
    ownerName: '李斌斌',
    members: [
      INITIAL_MY_FRIENDS[1], // 李斌斌
      INITIAL_MY_FRIENDS[0], // 唐雨晨
      INITIAL_MY_FRIENDS[4], // 韩尚君
      INITIAL_ORG_CONTACTS[0], // 任云辉
      INITIAL_ORG_CONTACTS[1], // 史乐乐
      INITIAL_ORG_CONTACTS[4], // 韩浩
      {
        id: 'user_qzb',
        name: '戚中彪 (我)',
        avatar: AVATARS.qizhongbiao,
        ip: '183.200.98.66',
        phone: maskPhoneNumber('15688887630'),
        rawPhone: '15688887630',
        type: 'org',
        department: '技术研发中心',
        institutionName: '台湾省网信办',
        isOnline: true,
        role: 'member',
        canDelete: false,
      },
    ],
  },
  {
    id: 'group_collab',
    name: '跨机构数据互通联合攻关组',
    avatar: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=120&auto=format&fit=crop&q=80',
    memberCount: 32,
    announcement: '推进跨机构点点密信SM4国密算法互信互通认证测试。',
    institutionName: '联合攻关工作组',
    groupTag: '跨机构互联',
    sessionId: 'session_external_collab',
    ownerName: '周晓琳',
    members: [
      INITIAL_MY_FRIENDS[5], // 周晓琳
      INITIAL_MY_FRIENDS[2], // 孙沛文
      INITIAL_MY_FRIENDS[3], // 马言言
      INITIAL_ORG_CONTACTS[0], // 任云辉
      INITIAL_ORG_CONTACTS[9], // 陈工
      INITIAL_ORG_CONTACTS[7], // 汪艳琼
      {
        id: 'user_qzb',
        name: '戚中彪 (我)',
        avatar: AVATARS.qizhongbiao,
        ip: '183.200.98.66',
        phone: maskPhoneNumber('15688887630'),
        rawPhone: '15688887630',
        type: 'org',
        department: '技术研发中心',
        institutionName: '台湾省网信办',
        isOnline: true,
        role: 'member',
        canDelete: false,
      },
    ],
  },
];

class ContactService {
  private orgContacts: ContactUser[] = [...INITIAL_ORG_CONTACTS];
  private myFriends: ContactUser[] = [...INITIAL_MY_FRIENDS];
  private groups: ContactGroup[] = [...INITIAL_GROUPS];
  private friendRequests: FriendRequest[] = [...INITIAL_FRIEND_REQUESTS];
  // 游客用户模式状态开关：true表示当前为游客用户，false为正式机构认证用户
  private isGuestMode: boolean = false;
  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // 游客模式获取与切换
  public isGuest(): boolean {
    return this.isGuestMode;
  }

  public setGuestMode(isGuest: boolean) {
    this.isGuestMode = isGuest;
    this.notify();
  }

  // 1. 获取好友申请列表 (新的好友)
  public getFriendRequests(): FriendRequest[] {
    return [...this.friendRequests];
  }

  // 获取待处理的好友申请数量
  public getPendingRequestsCount(): number {
    return this.friendRequests.filter((r) => r.status === 'pending').length;
  }

  // 通过好友申请
  public acceptFriendRequest(requestId: string): { success: boolean; message: string; friend?: ContactUser } {
    const req = this.friendRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: '未找到该申请' };

    req.status = 'accepted';

    // 检查是否已经在我的好友列表中
    const alreadyFriend = this.myFriends.find((f) => f.name === req.name || f.id === req.requesterId);
    let addedFriend: ContactUser;

    if (!alreadyFriend) {
      addedFriend = {
        id: req.requesterId || `friend_${Date.now()}`,
        name: req.name,
        avatar: req.avatar,
        ip: req.ip,
        phone: req.phone,
        type: 'friend',
        department: req.department,
        institutionName: req.institutionName,
        isOnline: true,
        role: 'member',
        canDelete: true,
        addedAt: new Date().toISOString().split('T')[0],
        sessionId: 'session_rd_dept',
      };
      this.myFriends = [addedFriend, ...this.myFriends];
    } else {
      addedFriend = alreadyFriend;
    }

    this.notify();
    return { success: true, message: `已通过 ${req.name} 的好友申请`, friend: addedFriend };
  }

  // 拒绝好友申请（支持传入理由反馈）
  public rejectFriendRequest(requestId: string, reason?: string): { success: boolean; message: string } {
    const req = this.friendRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: '未找到该申请' };

    req.status = 'rejected';
    if (reason && reason.trim()) {
      req.rejectReason = reason.trim();
    }
    this.notify();
    const reasonMsg = reason && reason.trim() ? `（理由：${reason.trim()}）` : '';
    return { success: true, message: `已拒绝 ${req.name} 的好友申请${reasonMsg}` };
  }

  // 检查某人是否已经是好友（在我的好友列表中）
  public isFriend(userIdOrName: string): boolean {
    return this.myFriends.some(
      (f) => f.id === userIdOrName || f.name === userIdOrName
    );
  }

  // 检查某人是否是本机构好友
  public isOrgUser(userIdOrName: string): boolean {
    return this.orgContacts.some(
      (c) => c.id === userIdOrName || c.name === userIdOrName
    );
  }

  // 从群聊成员列表中一键添加好友
  public addGroupMemberAsFriend(user: ContactUser): { success: boolean; message: string; friend?: ContactUser } {
    if (this.isGuestMode) {
      return {
        success: false,
        message: '游客用户无法添加好友，但可以发起群组内私信',
      };
    }

    if (this.isOrgUser(user.name)) {
      return {
        success: false,
        message: '该成员为本机构内部同事，默认在“机构好友”中，无需添加',
      };
    }

    if (this.isFriend(user.name)) {
      return {
        success: false,
        message: '该成员已经是您的好友',
      };
    }

    const newFriend: ContactUser = {
      ...user,
      id: user.id || `friend_${Date.now()}`,
      type: 'friend',
      canDelete: true,
      addedAt: new Date().toISOString().split('T')[0],
    };

    this.myFriends = [newFriend, ...this.myFriends];
    
    // 如果存在 pending 的申请，同步置为 accepted
    const relatedReq = this.friendRequests.find((r) => r.name === user.name && r.status === 'pending');
    if (relatedReq) {
      relatedReq.status = 'accepted';
    }

    this.notify();
    return { success: true, message: `已成功将 ${user.name} 添加为好友！`, friend: newFriend };
  }

  // 1. 获取机构好友列表（该机构下应用点点密信的用户，无需添加默认可私信，无法删除）
  public getOrgContacts(): ContactUser[] {
    return [...this.orgContacts];
  }

  // 2. 获取我的好友列表（添加应用点点密信其他机构的用户，支持群组私信和添加删除）
  public getMyFriends(): ContactUser[] {
    return [...this.myFriends];
  }

  // 3. 获取我的群组列表（加入的群组，点击指定群组支持查看群组下的全员列表）
  public getMyGroups(): ContactGroup[] {
    return [...this.groups];
  }

  // 获取指定群组及其全员列表
  public getGroupById(groupId: string): ContactGroup | undefined {
    return this.groups.find((g) => g.id === groupId || g.sessionId === groupId);
  }

  // 添加好友（业务规则：游客用户无法添加好友；正式用户可添加其他机构用户）
  public addFriend(newFriend: {
    name: string;
    phone: string;
    institutionName: string;
    department?: string;
    remark?: string;
  }): { success: boolean; message: string; friend?: ContactUser } {
    if (this.isGuestMode) {
      return {
        success: false,
        message: '游客用户无法添加好友。您可以在加入的群组中直接向群成员发起群内私信。',
      };
    }

    if (!newFriend.name.trim()) {
      return { success: false, message: '请输入好友名称' };
    }

    if (!newFriend.phone.trim()) {
      return { success: false, message: '请输入手机号' };
    }

    const cleanDigits = newFriend.phone.replace(/\D/g, '');
    const masked = maskPhoneNumber(newFriend.phone);

    // 检查是否已存在
    const exists = this.myFriends.some(
      (f) => f.name === newFriend.name.trim() || (f.rawPhone && f.rawPhone === cleanDigits)
    );
    if (exists) {
      return { success: false, message: '该用户已在您的“我的好友”列表中' };
    }

    // 检查是否为机构内部成员
    const isOrgMember = this.orgContacts.some((c) => c.name === newFriend.name.trim());
    if (isOrgMember) {
      return {
        success: false,
        message: '该用户为您所在机构的内部同事，默认在“机构好友”列表中，无需重复添加',
      };
    }

    const created: ContactUser = {
      id: `friend_ext_${Date.now()}`,
      name: newFriend.name.trim(),
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
      ip: '115.236.98.142 (外部节点)',
      phone: masked,
      rawPhone: cleanDigits,
      type: 'friend',
      department: newFriend.department || '协同联络部',
      institutionName: newFriend.institutionName || '外部协同机构',
      isOnline: true,
      role: 'member',
      canDelete: true,
      addedAt: new Date().toISOString().split('T')[0],
      remark: newFriend.remark,
    };

    this.myFriends = [created, ...this.myFriends];
    this.notify();
    return { success: true, message: `已成功添加好友 ${created.name}`, friend: created };
  }

  // 删除好友（业务规则：机构好友无法删除；我的好友支持删除）
  public deleteFriend(contactId: string): { success: boolean; message: string } {
    // 机构好友保护
    const isOrg = this.orgContacts.some((c) => c.id === contactId);
    if (isOrg) {
      return {
        success: false,
        message: '机构好友为该机构下应用点点密信的用户，默认互通，无法删除。',
      };
    }

    const target = this.myFriends.find((f) => f.id === contactId);
    if (!target) {
      return { success: false, message: '未找到指定的好友' };
    }

    this.myFriends = this.myFriends.filter((f) => f.id !== contactId);
    this.notify();
    return { success: true, message: `已将 ${target.name} 从“我的好友”中删除` };
  }

  // 搜索联系人与群组
  public search(query: string): {
    orgMatches: ContactUser[];
    friendMatches: ContactUser[];
    groupMatches: ContactGroup[];
  } {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        orgMatches: this.orgContacts,
        friendMatches: this.myFriends,
        groupMatches: this.groups,
      };
    }

    const orgMatches = this.orgContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.ip.includes(q)
    );

    const friendMatches = this.myFriends.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.department.toLowerCase().includes(q) ||
        f.institutionName.toLowerCase().includes(q) ||
        f.phone.includes(q) ||
        (f.remark && f.remark.toLowerCase().includes(q))
    );

    const groupMatches = this.groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.announcement && g.announcement.toLowerCase().includes(q)) ||
        (g.groupTag && g.groupTag.toLowerCase().includes(q)) ||
        g.members.some((m) => m.name.toLowerCase().includes(q))
    );

    return { orgMatches, friendMatches, groupMatches };
  }
}

export const contactService = new ContactService();
