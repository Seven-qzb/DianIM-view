/**
 * [Component - MobileContactsTab]
 * 移动端/小程序端 联系人核心三层交互架构：
 * 
 * 第一层：联系人菜单列表（新的好友[带申请数量]、机构好友、我的好友、我的群组）
 * 第二层：好友列表 / 申请列表 / 群列表
 *        - 新的好友：他人申请列表（通过/拒绝，实时数量徽标）
 *        - 机构好友 & 我的好友：列表仅展示头像和名称
 *        - 我的群组：群列表 -> 点击进入群全员列表
 * 第三层：指定好友名片（1:1 还原参考图样式，机构好友底部叫做「发起聊天」，群组好友底部有「添加好友」与「群内私信」，已加好友仅展示「发起聊天」）
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Building2, UserPlus, Search, Shield, ChevronRight, 
  ArrowLeft, Check, X, AlertCircle, UserCheck, Plus, MessageSquare
} from 'lucide-react';
import { 
  contactService, ContactUser, ContactGroup, 
  FriendRequest, maskPhoneNumber 
} from '../../services/contactService';
import { ContactProfileCardModal } from './ContactProfileCardModal';
import { GroupFullMembersModal } from './GroupFullMembersModal';

export type MobileContactMenuKey = 'new_friends' | 'org' | 'friends' | 'groups';

interface MobileContactsTabProps {
  onNavigateToChat: (sessionId: string) => void;
  isMiniApp?: boolean;
}

export const MobileContactsTab: React.FC<MobileContactsTabProps> = ({
  onNavigateToChat,
  isMiniApp = false,
}) => {
  // 层级状态：'menu' 为第一层菜单；'sublist' 为第二层列表
  const [currentLevel, setCurrentLevel] = useState<'menu' | 'sublist'>('menu');
  const [activeMenu, setActiveMenu] = useState<MobileContactMenuKey>('new_friends');

  // 数据层状态
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [orgContacts, setOrgContacts] = useState<ContactUser[]>([]);
  const [myFriends, setMyFriends] = useState<ContactUser[]>([]);
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [isGuest, setIsGuest] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // 搜索
  const [searchQuery, setSearchQuery] = useState('');

  // 第三层：名片弹窗目标
  const [inspectedContact, setInspectedContact] = useState<ContactUser | null>(null);
  const [inspectedFromGroup, setInspectedFromGroup] = useState<boolean>(false);
  const [inspectedGroupName, setInspectedGroupName] = useState<string>('');

  // 群组全员列表弹窗
  const [inspectedGroup, setInspectedGroup] = useState<ContactGroup | null>(null);

  // 添加好友弹窗
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addOrg, setAddOrg] = useState('');
  const [addDept, setAddDept] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    const sync = () => {
      setFriendRequests(contactService.getFriendRequests());
      setOrgContacts(contactService.getOrgContacts());
      setMyFriends(contactService.getMyFriends());
      setGroups(contactService.getMyGroups());
      setIsGuest(contactService.isGuest());
      setPendingCount(contactService.getPendingRequestsCount());
    };
    sync();
    const unsubscribe = contactService.subscribe(sync);
    return unsubscribe;
  }, []);

  // 好友申请：通过
  const handleAcceptRequest = (req: FriendRequest, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const res = contactService.acceptFriendRequest(req.id);
    if (res.success) {
      showToast(res.message, 'success');
      if (res.friend) {
        setInspectedContact(res.friend);
        setInspectedFromGroup(false);
        setInspectedGroupName('');
      }
    } else {
      showToast(res.message, 'error');
    }
  };

  // 好友申请：拒绝
  const handleRejectRequest = (req: FriendRequest, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const res = contactService.rejectFriendRequest(req.id);
    if (res.success) {
      showToast(res.message, 'warning');
    } else {
      showToast(res.message, 'error');
    }
  };

  // 手动添加外部好友提交
  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      showToast('请输入姓名', 'warning');
      return;
    }
    if (!addPhone.trim()) {
      showToast('请输入手机号', 'warning');
      return;
    }

    const res = contactService.addFriend({
      name: addName.trim(),
      phone: addPhone.trim(),
      institutionName: addOrg.trim() || '外部协同机构',
      department: addDept.trim() || '研发部',
    });

    if (res.success) {
      showToast(res.message, 'success');
      setShowAddModal(false);
      setAddName('');
      setAddPhone('');
      setAddOrg('');
      setAddDept('');
      if (res.friend) {
        setActiveMenu('friends');
        setCurrentLevel('sublist');
        setInspectedContact(res.friend);
        setInspectedFromGroup(false);
        setInspectedGroupName('');
      }
    } else {
      showToast(res.message, 'error');
    }
  };

  // 发起聊天
  const handleStartChat = (contact: ContactUser) => {
    showToast(`正在建立与 ${contact.name} 的国密加密通道...`, 'success');
    onNavigateToChat(contact.sessionId || 'session_rd_dept');
  };

  // 群内私信
  const handleGroupPrivateChat = (contact: ContactUser) => {
    showToast(`【群内私信】已向 ${contact.name} 发起群内加密临时私信`, 'success');
    onNavigateToChat(contact.groupSessionId || inspectedGroup?.sessionId || 'session_rd_dept');
  };

  // 过滤后的机构好友（仅按名称过滤）
  const filteredOrgList = useMemo(() => {
    if (!searchQuery.trim()) return orgContacts;
    const q = searchQuery.toLowerCase();
    return orgContacts.filter((c) => c.name.toLowerCase().includes(q));
  }, [orgContacts, searchQuery]);

  // 过滤后的我的好友（仅按名称过滤）
  const filteredFriendsList = useMemo(() => {
    if (!searchQuery.trim()) return myFriends;
    const q = searchQuery.toLowerCase();
    return myFriends.filter((f) => f.name.toLowerCase().includes(q));
  }, [myFriends, searchQuery]);

  // 过滤后的申请列表
  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return friendRequests;
    const q = searchQuery.toLowerCase();
    return friendRequests.filter((r) => r.name.toLowerCase().includes(q) || r.department.toLowerCase().includes(q));
  }, [friendRequests, searchQuery]);

  // 过滤后的群组
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, searchQuery]);

  return (
    <div id="mobile-contacts-tab" className="flex-1 w-full h-full bg-[#F7F8FA] flex flex-col overflow-hidden relative select-none">
      {/* Toast 提示 */}
      {toast && (
        <div
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-80 px-3.5 py-1.5 rounded-full shadow-lg border text-xs font-medium flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150 ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : toast.type === 'warning'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          ) : (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 头部导航条 */}
      {/* ==================================================================== */}
      <div className="bg-white border-b border-slate-100 px-4 pt-3 pb-3 flex items-center justify-between shrink-0 shadow-2xs">
        {currentLevel === 'menu' ? (
          <>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">通讯录</h1>
            <span className="text-xs text-slate-400">点点密信</span>
          </>
        ) : (
          <>
            <button
              id="back-to-contacts-menu-btn"
              onClick={() => {
                setCurrentLevel('menu');
                setSearchQuery('');
              }}
              className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>通讯录</span>
            </button>
            <h2 className="text-base font-bold text-slate-900">
              {activeMenu === 'new_friends' && '新的好友'}
              {activeMenu === 'org' && '机构好友'}
              {activeMenu === 'friends' && '我的好友'}
              {activeMenu === 'groups' && '我的群组'}
            </h2>
            {activeMenu === 'friends' ? (
              <button
                id="mobile-add-friend-btn"
                onClick={() => setShowAddModal(true)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                title="添加好友"
              >
                <Plus className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-7" />
            )}
          </>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 第一层：联系人菜单列表 (Menu List) */}
      {/* ==================================================================== */}
      {currentLevel === 'menu' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 4大联系人菜单卡片 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden divide-y divide-slate-100">
            {/* 1. 新的好友 */}
            <div
              id="mobile-menu-new-friends"
              onClick={() => {
                setActiveMenu('new_friends');
                setCurrentLevel('sublist');
                setSearchQuery('');
              }}
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50/80 active:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">新的好友</div>
                  <div className="text-xs text-slate-400 mt-0.5">申请与验证通知</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pendingCount > 0 && (
                  <span
                    id="mobile-pending-badge"
                    className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full shadow-xs"
                  >
                    {pendingCount}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* 2. 机构好友 */}
            <div
              id="mobile-menu-org-friends"
              onClick={() => {
                setActiveMenu('org');
                setCurrentLevel('sublist');
                setSearchQuery('');
              }}
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50/80 active:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">机构好友</div>
                  <div className="text-xs text-slate-400 mt-0.5">该机构下用户 · 默认可私信 · 无法删除</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">({orgContacts.length})</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* 3. 我的好友 */}
            <div
              id="mobile-menu-my-friends"
              onClick={() => {
                setActiveMenu('friends');
                setCurrentLevel('sublist');
                setSearchQuery('');
              }}
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50/80 active:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">我的好友</div>
                  <div className="text-xs text-slate-400 mt-0.5">其他机构协同用户 · 支持管理与私信</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">({myFriends.length})</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* 4. 我的群组 */}
            <div
              id="mobile-menu-my-groups"
              onClick={() => {
                setActiveMenu('groups');
                setCurrentLevel('sublist');
                setSearchQuery('');
              }}
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50/80 active:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">我的群组</div>
                  <div className="text-xs text-slate-400 mt-0.5">加入的群聊 · 查看全员列表</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">({groups.length})</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* 游客权限模拟卡片 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">游客用户模式</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isGuest ? '当前为游客身份：无法添加好友，但可在群内私信' : '当前为正式机构认证身份：拥有完整协同权限'}
                </p>
              </div>
              <button
                id="mobile-toggle-guest-btn"
                onClick={() => {
                  const next = !isGuest;
                  contactService.setGuestMode(next);
                  showToast(
                    next ? '已切换为【游客模式】（无法添加好友，仅群内私信）' : '已恢复为【正式机构用户】',
                    next ? 'warning' : 'success'
                  );
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                  isGuest ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isGuest ? '游客 (受限)' : '正式用户'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 第二层：好友列表 / 申请列表 / 群组列表 (Sublist) */}
      {/* ==================================================================== */}
      {currentLevel === 'sublist' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 搜索栏 */}
          <div className="p-3 bg-white border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeMenu === 'new_friends'
                    ? '搜索好友申请...'
                    : activeMenu === 'groups'
                    ? '搜索群聊...'
                    : '搜索好友名称...'
                }
                className="w-full pl-9 pr-7 py-1.5 text-xs bg-slate-100 border border-transparent rounded-xl focus:bg-white focus:border-blue-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 列表主体 */}
          <div className="flex-1 overflow-y-auto">
            {/* 子视图 1：新的好友申请列表 */}
            {activeMenu === 'new_friends' && (
              <div className="p-3 space-y-2.5">
                <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
                  <span>他人申请列表</span>
                  <span>待处理 {pendingCount} 人</span>
                </div>

                {filteredRequests.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">暂无好友申请</div>
                ) : (
                  filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => {
                        setInspectedContact({
                          id: req.requesterId,
                          name: req.name,
                          avatar: req.avatar,
                          ip: req.ip,
                          phone: req.phone,
                          type: 'friend',
                          department: req.department,
                          institutionName: req.institutionName,
                          isOnline: true,
                          canDelete: true,
                        });
                        setInspectedFromGroup(false);
                        setInspectedGroupName('');
                      }}
                      className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs active:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-start gap-3 mb-2.5">
                        <img
                          src={req.avatar}
                          alt={req.name}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200/60 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900 truncate">
                              {req.name}
                            </span>
                            <span className="text-[10px] text-slate-400">{req.applyTime}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {req.department} · {req.institutionName}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                            {req.applyReason}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={(e) => handleRejectRequest(req, e)}
                              className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                            >
                              拒绝
                            </button>
                            <button
                              onClick={(e) => handleAcceptRequest(req, e)}
                              className="px-3.5 py-1 text-xs font-medium bg-[#2979ff] text-white rounded-lg shadow-xs"
                            >
                              通过
                            </button>
                          </>
                        ) : req.status === 'accepted' ? (
                          <span className="text-xs text-emerald-600 font-medium px-2 py-0.5 bg-emerald-50 rounded">
                            已通过
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400 px-2 py-0.5 bg-slate-100 rounded">
                              已拒绝
                            </span>
                            {req.rejectReason && (
                              <span
                                className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded max-w-[120px] truncate"
                                title={`拒绝理由：${req.rejectReason}`}
                              >
                                {req.rejectReason}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 子视图 2：机构好友列表 */}
            {/* 用户规则：机构好友和我的好友列表仅展示头像和名称即可 */}
            {activeMenu === 'org' && (
              <div className="p-2">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs divide-y divide-slate-100 overflow-hidden">
                  {filteredOrgList.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => {
                        setInspectedContact(contact);
                        setInspectedFromGroup(false);
                        setInspectedGroupName('');
                      }}
                      className="flex items-center justify-between p-3 active:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200/60"
                            referrerPolicy="no-referrer"
                          />
                          {contact.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22C55E] ring-2 ring-white" />
                          )}
                        </div>
                        {/* 仅展示头像和名称即可 */}
                        <span className="text-sm font-bold text-slate-900">
                          {contact.name}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 子视图 3：我的好友列表 */}
            {/* 用户规则：机构好友和我的好友列表仅展示头像和名称即可 */}
            {activeMenu === 'friends' && (
              <div className="p-2">
                {filteredFriendsList.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    暂无好友
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs divide-y divide-slate-100 overflow-hidden">
                    {filteredFriendsList.map((friend) => (
                      <div
                        key={friend.id}
                        onClick={() => {
                          setInspectedContact(friend);
                          setInspectedFromGroup(false);
                          setInspectedGroupName('');
                        }}
                        className="flex items-center justify-between p-3 active:bg-slate-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200/60"
                              referrerPolicy="no-referrer"
                            />
                            {friend.isOnline && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22C55E] ring-2 ring-white" />
                            )}
                          </div>
                          {/* 仅展示头像和名称即可 */}
                          <span className="text-sm font-bold text-slate-900">
                            {friend.name}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 子视图 4：我的群组列表 */}
            {activeMenu === 'groups' && (
              <div className="p-2 space-y-2">
                {filteredGroups.map((grp) => (
                  <div
                    key={grp.id}
                    onClick={() => setInspectedGroup(grp)}
                    className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between active:bg-slate-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={grp.avatar}
                        alt={grp.name}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200/60 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {grp.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {grp.memberCount} 人 · 查看群全员
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 第三层：指定好友名片弹窗 (严格依照参考图 image.png) */}
      {/* ==================================================================== */}
      <ContactProfileCardModal
        contact={inspectedContact}
        isOpen={!!inspectedContact}
        fromGroup={inspectedFromGroup}
        currentGroupName={inspectedGroupName}
        onClose={() => setInspectedContact(null)}
        onSendMessage={handleStartChat}
        onGroupPrivateMessage={handleGroupPrivateChat}
        onDeleteFriend={(c) => {
          contactService.deleteFriend(c.id);
          showToast(`已将 ${c.name} 从我的好友中删除`, 'warning');
        }}
      />

      {/* 群组全员列表弹窗 */}
      <GroupFullMembersModal
        group={inspectedGroup}
        isOpen={!!inspectedGroup}
        onClose={() => setInspectedGroup(null)}
        onSelectMember={(member) => {
          // 在全员列表中点击成员，呼出该成员的指定好友名片（带群聊上下文）
          setInspectedContact(member);
          setInspectedFromGroup(true);
          setInspectedGroupName(inspectedGroup?.name || '研发部');
        }}
        onEnterGroupChat={(sessionId) => {
          setInspectedGroup(null);
          onNavigateToChat(sessionId);
        }}
      />

      {/* 添加好友弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-70 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">添加我的好友</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFriendSubmit} className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="例如：黄洋"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  手机号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  placeholder="例如：15012349286"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  所属机构
                </label>
                <input
                  type="text"
                  value={addOrg}
                  onChange={(e) => setAddOrg(e.target.value)}
                  placeholder="例如：国家工业信息安全发展研究中心"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  所在部门
                </label>
                <input
                  type="text"
                  value={addDept}
                  onChange={(e) => setAddDept(e.target.value)}
                  placeholder="例如：研发部"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {isGuest && (
                <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded-lg">
                  当前处于游客模式，无法添加好友。
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isGuest}
                  className="px-4 py-1.5 text-xs font-medium bg-[#2979ff] disabled:bg-slate-300 text-white rounded-xl shadow-xs"
                >
                  确认添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
