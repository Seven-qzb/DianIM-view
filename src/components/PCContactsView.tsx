/**
 * [View - PCContactsView]
 * PC端联系人核心三层交互架构：
 * 
 * 第一层：联系人菜单列表（新的好友[带申请数量]、机构好友、我的好友、我的群组）
 * 第二层：好友列表/申请列表/群组全员列表
 *        - 新的好友：他人申请列表（通过/拒绝，动态数量徽标）
 *        - 机构好友 & 我的好友：列表仅展示头像和名称
 *        - 我的群组：加入群列表与群全员列表
 * 第三层：指定好友名片（1:1 还原参考图样式，机构好友底部叫做「发起聊天」，群组好友底部展示「添加好友」与「群内私信」，已加好友仅展示「发起聊天」）
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Building2, UserPlus, MessageSquare, 
  Search, Shield, ChevronRight, UserCheck, Bell, 
  Check, X, AlertCircle, Sparkles, Lock, ArrowLeft,
  UserX
} from 'lucide-react';
import { 
  contactService, ContactUser, ContactGroup, 
  FriendRequest, maskPhoneNumber 
} from '../services/contactService';
import { ContactProfileCard } from './ContactProfileCard';

export type ContactMenuKey = 'new_friends' | 'org' | 'friends' | 'groups';

interface PCContactsViewProps {
  onJumpToChat?: (sessionId: string) => void;
}

export const PCContactsView: React.FC<PCContactsViewProps> = ({ onJumpToChat }) => {
  // 第一层：菜单导航激活项
  const [selectedMenu, setSelectedMenu] = useState<ContactMenuKey>('new_friends');

  // 数据层状态
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [orgContacts, setOrgContacts] = useState<ContactUser[]>([]);
  const [myFriends, setMyFriends] = useState<ContactUser[]>([]);
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [isGuest, setIsGuest] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // 第二层：搜索与选中项
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);
  const [groupMemberQuery, setGroupMemberQuery] = useState('');

  // 第三层：名片展示目标（用户及其所在群聊上下文）
  const [inspectingContact, setInspectingContact] = useState<ContactUser | null>(null);
  const [inspectingFromGroup, setInspectingFromGroup] = useState<boolean>(false);
  const [inspectingGroupName, setInspectingGroupName] = useState<string>('');

  // 群友名片弹窗目标（我的群组页点击后弹窗展示）
  const [groupMemberModalContact, setGroupMemberModalContact] = useState<ContactUser | null>(null);

  // 拒绝申请反馈理由弹窗状态
  const [rejectingRequest, setRejectingRequest] = useState<FriendRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 数据订阅更新
  useEffect(() => {
    const update = () => {
      const reqs = contactService.getFriendRequests();
      const orgs = contactService.getOrgContacts();
      const friends = contactService.getMyFriends();
      const grps = contactService.getMyGroups();
      setFriendRequests(reqs);
      setOrgContacts(orgs);
      setMyFriends(friends);
      setGroups(grps);
      setIsGuest(contactService.isGuest());
      setPendingCount(contactService.getPendingRequestsCount());
    };

    update();
    const unsubscribe = contactService.subscribe(update);
    return unsubscribe;
  }, []);

  // 默认选中项初始化
  useEffect(() => {
    if (selectedMenu === 'new_friends') {
      // 新的朋友页无需展示该群友/个人名片
      setInspectingContact(null);
      setInspectingFromGroup(false);
      setInspectingGroupName('');
    } else if (selectedMenu === 'org') {
      if (orgContacts.length > 0 && (!inspectingContact || inspectingContact.type !== 'org')) {
        setInspectingContact(orgContacts[0]);
        setInspectingFromGroup(false);
        setInspectingGroupName('');
      }
    } else if (selectedMenu === 'friends') {
      if (myFriends.length > 0 && (!inspectingContact || inspectingContact.type !== 'friend' || inspectingFromGroup)) {
        setInspectingContact(myFriends[0]);
        setInspectingFromGroup(false);
        setInspectingGroupName('');
      }
    } else if (selectedMenu === 'groups') {
      // 我的群组页不做固定展示群友名片
      setInspectingContact(null);
      setInspectingFromGroup(false);
      setInspectingGroupName('');
      if (groups.length > 0) {
        const currentGroupStillExists = selectedGroup && groups.some((g) => g.id === selectedGroup.id);
        const grp = currentGroupStillExists ? selectedGroup : groups[0];
        if (!currentGroupStillExists) {
          setSelectedGroup(grp);
        }
      }
    }
  }, [selectedMenu, orgContacts, myFriends, groups, friendRequests]);

  // 好友申请：通过
  const handleAcceptRequest = (req: FriendRequest, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const res = contactService.acceptFriendRequest(req.id);
    if (res.success) {
      showToast(res.message, 'success');
      if (res.friend) {
        setInspectingContact(res.friend);
        setInspectingFromGroup(false);
      }
    } else {
      showToast(res.message, 'error');
    }
  };

  // 好友申请：打开拒绝理由反馈弹窗
  const handleOpenRejectDialog = (req: FriendRequest, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRejectingRequest(req);
    setRejectReason('');
  };

  // 确认拒绝并提交理由反馈
  const handleConfirmReject = () => {
    if (!rejectingRequest) return;
    const res = contactService.rejectFriendRequest(rejectingRequest.id, rejectReason.trim());
    if (res.success) {
      showToast(res.message, 'warning');
    } else {
      showToast(res.message, 'error');
    }
    setRejectingRequest(null);
    setRejectReason('');
  };

  // 发起私信跳转
  const handleStartChat = (user: ContactUser) => {
    if (onJumpToChat) {
      onJumpToChat(user.sessionId || 'session_rd_dept');
    }
  };

  // 群内私信跳转
  const handleGroupPrivateChat = (user: ContactUser) => {
    if (onJumpToChat) {
      onJumpToChat(user.groupSessionId || selectedGroup?.sessionId || 'session_rd_dept');
    }
  };

  // 过滤后的机构好友（第2层仅展示头像和名称）
  const filteredOrgList = useMemo(() => {
    if (!searchQuery.trim()) return orgContacts;
    const q = searchQuery.toLowerCase();
    return orgContacts.filter((c) => c.name.toLowerCase().includes(q));
  }, [orgContacts, searchQuery]);

  // 过滤后的我的好友（第2层仅展示头像和名称）
  const filteredMyFriendsList = useMemo(() => {
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

  // 过滤后的我的群组列表
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.groupTag && g.groupTag.toLowerCase().includes(q)) ||
        (g.institutionName && g.institutionName.toLowerCase().includes(q)) ||
        (g.ownerName && g.ownerName.toLowerCase().includes(q))
    );
  }, [groups, searchQuery]);

  return (
    <div id="pc-contacts-view" className="flex-1 h-full flex bg-[#F8FAFC] overflow-hidden select-none relative">
      {/* Toast 提示 */}
      {toast && (
        <div
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150 ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : toast.type === 'warning'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600" />
          ) : (
            <Check className="w-4 h-4 text-emerald-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 第一层：联系人菜单列表 (Contact Menu List - 170px 紧凑侧边栏) */}
      {/* ==================================================================== */}
      <div
        id="contacts-tier1-menu"
        className="w-[170px] h-full bg-white border-r border-slate-200/80 flex flex-col shrink-0"
      >
        <div className="px-3.5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">
            联系人
          </h2>
        </div>

        {/* 4大联系人菜单项 */}
        <div className="p-2 space-y-1 flex-1 overflow-y-auto">
          {/* 1. 新的好友 */}
          <button
            id="menu-new-friends-btn"
            onClick={() => {
              setSelectedMenu('new_friends');
              setSearchQuery('');
              setSelectedGroup(null);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all text-left cursor-pointer ${
              selectedMenu === 'new_friends'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedMenu === 'new_friends'
                    ? 'bg-blue-600 text-white'
                    : 'bg-orange-100 text-orange-600'
                }`}
              >
                <UserPlus className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium truncate">新的好友</span>
            </div>
            {pendingCount > 0 && (
              <span
                id="pending-count-badge"
                className="px-1.5 py-0.2 text-[10px] font-bold bg-red-500 text-white rounded-full shadow-2xs shrink-0"
              >
                {pendingCount}
              </span>
            )}
          </button>

          {/* 2. 机构好友 */}
          <button
            id="menu-org-friends-btn"
            onClick={() => {
              setSelectedMenu('org');
              setSearchQuery('');
              setSelectedGroup(null);
              if (orgContacts.length > 0) {
                setInspectingContact(orgContacts[0]);
                setInspectingFromGroup(false);
                setInspectingGroupName('');
              }
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all text-left cursor-pointer ${
              selectedMenu === 'org'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedMenu === 'org'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium truncate">机构好友</span>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md font-mono shrink-0">
              {orgContacts.length}
            </span>
          </button>

          {/* 3. 我的好友 */}
          <button
            id="menu-my-friends-btn"
            onClick={() => {
              setSelectedMenu('friends');
              setSearchQuery('');
              setSelectedGroup(null);
              if (myFriends.length > 0) {
                setInspectingContact(myFriends[0]);
                setInspectingFromGroup(false);
                setInspectingGroupName('');
              }
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all text-left cursor-pointer ${
              selectedMenu === 'friends'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedMenu === 'friends'
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium truncate">我的好友</span>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md font-mono shrink-0">
              {myFriends.length}
            </span>
          </button>

          {/* 4. 我的群组 */}
          <button
            id="menu-my-groups-btn"
            onClick={() => {
              setSelectedMenu('groups');
              setSearchQuery('');
              setSelectedGroup(null);
              setInspectingContact(null);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all text-left cursor-pointer ${
              selectedMenu === 'groups'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedMenu === 'groups'
                    ? 'bg-blue-600 text-white'
                    : 'bg-purple-100 text-purple-600'
                }`}
              >
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium truncate">我的群组</span>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md font-mono shrink-0">
              {groups.length}
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 第二层：好友列表 / 申请列表 / 群组列表 (260px) */}
      {/* ==================================================================== */}
      <div
        id="contacts-tier2-list"
        className="w-[260px] h-full bg-white border-r border-slate-200/80 flex flex-col shrink-0"
      >
        {/* 顶部搜索栏 */}
        <div className="p-2.5 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                selectedMenu === 'new_friends'
                  ? '搜索好友申请...'
                  : selectedMenu === 'groups'
                  ? '搜索群组...'
                  : '搜索好友名称...'
              }
              className="w-full pl-7 pr-6 py-1 text-xs bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-blue-400 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 列表主体内容 */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {/* ===================== 子视图 1：新的好友申请列表 ===================== */}
          {selectedMenu === 'new_friends' && (
            <div className="p-1.5 space-y-1.5">
              <div className="px-1.5 py-0.5 text-[11px] text-slate-500 font-medium">
                <span>申请列表</span>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">暂无好友申请</div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-2 rounded-xl border bg-white border-slate-100 hover:border-slate-200 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <img
                        src={req.avatar}
                        alt={req.name}
                        className="w-8 h-8 rounded-lg object-cover shrink-0 ring-1 ring-slate-200/50"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0 flex items-center">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {req.name}
                        </span>
                      </div>
                    </div>

                    {/* 操作按钮：通过 / 拒绝（带理由反馈） */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100/80">
                      <span className="text-[10px] text-slate-400">
                        {req.status === 'pending' ? '待处理' : req.status === 'accepted' ? '已添加' : '已拒绝'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              id={`reject-req-${req.id}`}
                              onClick={(e) => handleOpenRejectDialog(req, e)}
                              className="px-2 py-0.5 text-[11px] text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            >
                              拒绝
                            </button>
                            <button
                              id={`accept-req-${req.id}`}
                              onClick={(e) => handleAcceptRequest(req, e)}
                              className="px-2.5 py-0.5 text-[11px] font-medium bg-[#2979ff] text-white hover:bg-[#1a68ea] rounded-md transition-colors shadow-2xs cursor-pointer"
                            >
                              通过
                            </button>
                          </>
                        ) : req.status === 'accepted' ? (
                          <span className="text-[10px] text-emerald-600 font-medium px-1.5 py-0.2 bg-emerald-50 rounded">
                            已通过
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 px-1.5 py-0.2 bg-slate-100 rounded">
                              已拒绝
                            </span>
                            {req.rejectReason && (
                              <span
                                className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.2 rounded max-w-[90px] truncate"
                                title={`拒绝理由：${req.rejectReason}`}
                              >
                                {req.rejectReason}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ===================== 子视图 2：机构好友列表 ===================== */}
          {selectedMenu === 'org' && (
            <div>
              <div className="px-2.5 py-1.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">机构好友 ({filteredOrgList.length})</span>
              </div>
              <div className="p-1 space-y-0.5">
                {filteredOrgList.map((contact) => {
                  const isSelected = inspectingContact?.id === contact.id;
                  return (
                    <div
                      key={contact.id}
                      onClick={() => {
                        setInspectingContact(contact);
                        setInspectingFromGroup(false);
                        setInspectingGroupName('');
                      }}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/90 font-medium text-blue-800'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200/60"
                          referrerPolicy="no-referrer"
                        />
                        {contact.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#22C55E] ring-2 ring-white" />
                        )}
                      </div>
                      <div className="text-xs font-medium tracking-tight truncate">
                        {contact.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================== 子视图 3：我的好友列表 ===================== */}
          {selectedMenu === 'friends' && (
            <div>
              <div className="px-2.5 py-1.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">我的好友 ({filteredMyFriendsList.length})</span>
              </div>

              {filteredMyFriendsList.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  暂无好友
                </div>
              ) : (
                <div className="p-1 space-y-0.5">
                  {filteredMyFriendsList.map((friend) => {
                    const isSelected = inspectingContact?.id === friend.id;
                    return (
                      <div
                        key={friend.id}
                        onClick={() => {
                          setInspectingContact(friend);
                          setInspectingFromGroup(false);
                          setInspectingGroupName('');
                        }}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/90 font-medium text-blue-800'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200/60"
                            referrerPolicy="no-referrer"
                          />
                          {friend.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#22C55E] ring-2 ring-white" />
                          )}
                        </div>
                        <div className="text-xs font-medium tracking-tight truncate">
                          {friend.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================== 子视图 4：我的群组列表 ===================== */}
          {selectedMenu === 'groups' && (
            <div>
              <div className="px-3 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">我的群组 ({filteredGroups.length})</span>
              </div>
              {filteredGroups.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  未找到匹配群组
                </div>
              ) : (
                <div className="p-1.5 space-y-1">
                  {filteredGroups.map((grp) => {
                    const isSelected = selectedGroup?.id === grp.id;
                    return (
                      <div
                        key={grp.id}
                        onClick={() => {
                          setSelectedGroup(grp);
                          setGroupMemberModalContact(null);
                        }}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 text-blue-900 font-semibold ring-1 ring-blue-200/80 shadow-2xs'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <img
                          src={grp.avatar}
                          alt={grp.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-slate-200/70"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate text-slate-900">
                            {grp.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 第三层：主视区展示 */}
      {/* ==================================================================== */}
      <div
        id="contacts-tier3-display"
        className="flex-1 h-full flex overflow-hidden bg-[#F8FAFC] relative"
      >
        {selectedMenu === 'groups' ? (
          // 我的群组：群内人员列表（名片改为点击后弹窗展示，不做固定展示）
          selectedGroup ? (
            <div
              id="group-members-panel"
              className="flex-1 h-full flex flex-col bg-white p-5 overflow-hidden relative"
            >
              {/* 顶部搜索栏与人员数量（无群聊信息、无进入群聊按钮） */}
              <div className="pb-3.5 flex items-center justify-between gap-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">群内人员</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                    {selectedGroup.members.length} 人
                  </span>
                </div>

                <div className="relative w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={groupMemberQuery}
                    onChange={(e) => setGroupMemberQuery(e.target.value)}
                    placeholder="搜索群内人员..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/70 rounded-lg focus:bg-white focus:border-blue-400 focus:outline-none transition-colors"
                  />
                  {groupMemberQuery && (
                    <button
                      type="button"
                      onClick={() => setGroupMemberQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 群内人员列表：头像 + 群内昵称，点击弹窗展示群友名片 */}
              <div className="flex-1 overflow-y-auto pr-1 mt-2 space-y-1 divide-y-0">
                {selectedGroup.members
                  .filter((m) =>
                    !groupMemberQuery.trim() ||
                    m.name.toLowerCase().includes(groupMemberQuery.toLowerCase()) ||
                    m.department.toLowerCase().includes(groupMemberQuery.toLowerCase())
                  )
                  .map((member) => (
                    <div
                      key={member.id}
                      onClick={() => {
                        setGroupMemberModalContact(member);
                      }}
                      className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 text-slate-800 transition-all border border-transparent hover:border-slate-100/80"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* 头像展示 */}
                        <div className="relative shrink-0">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200/70 group-hover:ring-blue-300 transition-all"
                            referrerPolicy="no-referrer"
                          />
                          {member.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] rounded-full ring-2 ring-white" />
                          )}
                        </div>

                        {/* 群内昵称展示 */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                            {member.name}
                          </span>
                          {member.role === 'owner' && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200/60 rounded font-normal shrink-0">
                              群主
                            </span>
                          )}
                          {member.role === 'admin' && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200/60 rounded font-normal shrink-0">
                              管理员
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 点击查看名片提示 */}
                      <div className="shrink-0 flex items-center gap-1 pl-2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>查看名片</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  ))}
              </div>
              {/* 仅遮罩右侧群组成员列表面板（群内人员div），不遮罩一级菜单与群列表 */}
              {groupMemberModalContact && (
                <div
                  id="group-member-modal-mask"
                  className="absolute inset-0 z-30 bg-slate-900/35 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-150"
                  onClick={() => setGroupMemberModalContact(null)}
                >
                  <div
                    className="animate-in zoom-in-95 duration-150 drop-shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ContactProfileCard
                      contact={groupMemberModalContact}
                      fromGroup={true}
                      currentGroupName={selectedGroup.name}
                      showCloseButton={true}
                      onClose={() => setGroupMemberModalContact(null)}
                      onStartChat={(user) => {
                        setGroupMemberModalContact(null);
                        handleStartChat(user);
                      }}
                      onGroupPrivateChat={(user) => {
                        setGroupMemberModalContact(null);
                        handleGroupPrivateChat(user);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 h-full flex flex-col items-center justify-center text-slate-400">
              <Users className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-xs">请从左侧选择群组</p>
            </div>
          )
        ) : selectedMenu === 'new_friends' ? (
          // 新的朋友：这一块区域空着，无需展示任何内容
          <div className="flex-1 h-full bg-[#F8FAFC]" />
        ) : (
          // 单人名片主视区（来自机构好友、我的好友）
          <div className="flex-1 h-full flex flex-col items-center justify-center p-6 overflow-y-auto">
            {inspectingContact ? (
              <ContactProfileCard
                contact={inspectingContact}
                fromGroup={false}
                onStartChat={handleStartChat}
                showCloseButton={false}
              />
            ) : (
              <div className="text-center text-slate-400">
                <UserCheck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium">请从左侧列表选择联系人以查看个人名片</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 弹窗：拒绝好友申请并添加理由反馈 */}
      {/* ==================================================================== */}
      {rejectingRequest && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setRejectingRequest(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <UserX className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">拒绝好友申请</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 好友信息：仅展示头像与名称 */}
            <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <img
                src={rejectingRequest.avatar}
                alt={rejectingRequest.name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200/60"
                referrerPolicy="no-referrer"
              />
              <span className="text-sm font-semibold text-slate-800 truncate">
                {rejectingRequest.name}
              </span>
            </div>

            {/* 拒绝填写文本信息 */}
            <div className="mt-3.5">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请输入拒绝理由..."
                rows={3}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-400 focus:outline-none transition-colors resize-none"
                autoFocus
              />
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center justify-end gap-2 mt-3.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
