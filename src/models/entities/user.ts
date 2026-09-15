/**
 * [Model - User Entity]
 * 统一用户与组织架构实体定义
 */

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  institutionId: string;
  institutionName: string;
  role: string;
  department: string;
  policeNo?: string;
  securityLevel: string;
  encryptionCert: string;
  certExpireDate: string;
  onlineStatus: 'online' | 'busy' | 'offline';
}

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  code: string;
  tag: string;
  memberCount: number;
  disabled?: boolean;
}

export interface UserMember {
  id: string;
  name: string;
  avatar: string;
  role?: 'owner' | 'admin' | 'member' | string;
  department: string;
  online?: boolean;
  phone?: string;
  ip?: string;
  email?: string;
}
