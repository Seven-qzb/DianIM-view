import React, { useState } from 'react';
import { ChatConversation, GroupMember } from '../types';
import { 
  ChevronLeft, Plus, Minus, QrCode, Copy, ChevronRight, 
  Calendar, Users, Check, AlertTriangle, X, Search, Shield, UserPlus, UserMinus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GroupMembersScreen } from './GroupMembersScreen';
import { PrivateChatModal, PrivateChatTarget } from './PrivateChatModal';

// Pool of candidate contacts available to add into the group
const CANDIDATE_CONTACTS: GroupMember[] = [
  { id: 'c-wang', name: '王建国', department: '市局指挥中心', role: 'member', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80' },
  { id: 'c-sun', name: '孙宇', department: '密码管理局', role: 'member', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80' },
  { id: 'c-zheng', name: '郑海涛', department: '省厅网安总队', role: 'member', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
  { id: 'c-zhou', name: '周洁', department: '机要保密科', role: 'member', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80' },
  { id: 'c-zhang', name: '张鹏', department: '应急处突支队', role: 'member', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80' },
  { id: 'c-du', name: '杜维', department: '政法委信息化组', role: 'member', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80' },
  { id: 'c-lin', name: '林晨', department: '电子政务中心', role: 'member', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
];

interface GroupSettingsScreenProps {
  conversation: ChatConversation;
  onBack: () => void;
  onUpdateGroup: (updatedConv: Partial<ChatConversation>) => void;
  onExitGroup: (convId: string) => void;
  onClearHistory: (convId: string) => void;
  onDisbandGroup?: (convId: string) => void;
  onCloseGroup?: (convId: string) => void;
}

export const GroupSettingsScreen: React.FC<GroupSettingsScreenProps> = ({
  conversation,
  onBack,
  onUpdateGroup,
  onExitGroup,
  onClearHistory,
  onDisbandGroup,
  onCloseGroup,
}) => {
  const [groupName, setGroupName] = useState(conversation.name || '研发部');
  const [isEditingName, setIsEditingName] = useState(false);
  const [myNickname, setMyNickname] = useState(conversation.myNickname || '戚中彪');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isMuted, setIsMuted] = useState(!!conversation.isMuted);
  const [isMutedAll, setIsMutedAll] = useState(!!conversation.isMutedAll);
  const [isPinned, setIsPinned] = useState(!!conversation.isPinned);
  const [inviteConfirm, setInviteConfirm] = useState(conversation.inviteConfirm !== false);
  const [announcement, setAnnouncement] = useState(conversation.announcement || '研发部门例会定于每周五上午10:00举行，请携带保密笔记本准时参会。');
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  
  // Group members state
  const [members, setMembers] = useState<GroupMember[]>(conversation.members || []);

  // Modals & Action States
  const [showMembersPage, setShowMembersPage] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showAllMembersModal, setShowAllMembersModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCloseGroupConfirm, setShowCloseGroupConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [activePrivateTarget, setActivePrivateTarget] = useState<PrivateChatTarget | null>(null);

  // Search in member modals
  const [memberSearch, setMemberSearch] = useState('');
  const [addSearch, setAddSearch] = useState('');
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [selectedToRemove, setSelectedToRemove] = useState<string[]>([]);

  // History query modal
  const [historyModalType, setHistoryModalType] = useState<'person' | 'date' | null>(null);

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

  const inviteLink = conversation.inviteLink || 'https://dianim.cn/zzh5/groupCode?key=GRPOSZB03A2';

  // Toggle Invite Confirmation
  const handleToggleInviteConfirm = () => {
    const nextVal = !inviteConfirm;
    setInviteConfirm(nextVal);
    onUpdateGroup({ inviteConfirm: nextVal });
    triggerToast(nextVal ? '已开启邀请确认：需群主或管理员确认后进群' : '已关闭邀请确认');
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextVal = !isMuted;
    setIsMuted(nextVal);
    onUpdateGroup({ isMuted: nextVal });
    triggerToast(nextVal ? '已开启消息免打扰' : '已关闭消息免打扰');
  };

  // Toggle Mute All (全员禁言)
  const handleToggleMuteAll = () => {
    const nextVal = !isMutedAll;
    setIsMutedAll(nextVal);
    onUpdateGroup({ isMutedAll: nextVal });
    triggerToast(nextVal ? '已开启全员禁言：仅群主和管理员可发言' : '已关闭全员禁言');
  };

  // Toggle Pin
  const handleTogglePin = () => {
    const nextVal = !isPinned;
    setIsPinned(nextVal);
    onUpdateGroup({ isPinned: nextVal });
    triggerToast(nextVal ? '已置顶该群聊' : '已取消置顶');
  };

  // Save Group Name
  const handleSaveName = () => {
    if (!groupName.trim()) return;
    onUpdateGroup({ name: groupName.trim() });
    setIsEditingName(false);
    triggerToast('群聊名称已更新');
  };

  // Save Announcement
  const handleSaveAnnouncement = () => {
    onUpdateGroup({ announcement: announcement.trim() });
    setIsEditingAnnouncement(false);
    triggerToast('群公告已更新');
  };

  // Copy Invite Link
  const handleCopyInviteLink = () => {
    navigator.clipboard?.writeText(inviteLink);
    triggerToast('邀请链接已复制');
  };

  // Add selected members
  const handleConfirmAddMembers = () => {
    if (selectedToAdd.length === 0) {
      triggerToast('请选择要添加的联系人');
      return;
    }
    const newlyAdded = CANDIDATE_CONTACTS.filter((c) => selectedToAdd.includes(c.id));
    const nextMembers = [...members, ...newlyAdded];
    setMembers(nextMembers);
    onUpdateGroup({ 
      members: nextMembers, 
      memberCount: nextMembers.length,
      avatarGrid: nextMembers.slice(0, 9).map((m) => m.avatar)
    });
    setSelectedToAdd([]);
    setShowAddModal(false);
    triggerToast(`已成功添加 ${newlyAdded.length} 位成员`);
  };

  // Remove selected members
  const handleConfirmRemoveMembers = () => {
    if (selectedToRemove.length === 0) {
      triggerToast('请选择要移出的成员');
      return;
    }
    const nextMembers = members.filter((m) => !selectedToRemove.includes(m.id));
    setMembers(nextMembers);
    onUpdateGroup({ 
      members: nextMembers, 
      memberCount: nextMembers.length,
      avatarGrid: nextMembers.slice(0, 9).map((m) => m.avatar)
    });
    const count = selectedToRemove.length;
    setSelectedToRemove([]);
    setShowRemoveModal(false);
    triggerToast(`已移出 ${count} 位成员`);
  };

  // Remove single member directly
  const handleRemoveSingleMember = (memberId: string, memberName: string) => {
    const nextMembers = members.filter((m) => m.id !== memberId);
    setMembers(nextMembers);
    onUpdateGroup({ 
      members: nextMembers, 
      memberCount: nextMembers.length,
      avatarGrid: nextMembers.slice(0, 9).map((m) => m.avatar)
    });
    triggerToast(`已将 ${memberName} 移出群组`);
  };

  // Close Group Handler
  const handleConfirmCloseGroup = () => {
    setShowCloseGroupConfirm(false);
    if (onCloseGroup) {
      onCloseGroup(conversation.id);
    } else if (onDisbandGroup) {
      onDisbandGroup(conversation.id);
    } else {
      onExitGroup(conversation.id);
    }
    triggerToast('该群组已关闭并转为只读归档');
  };

  // Exit and Disband Group Handler (底部的退出群聊修改为退出并解散)
  const handleConfirmExitAndDisband = () => {
    setShowExitConfirm(false);
    if (onDisbandGroup) {
      onDisbandGroup(conversation.id);
    } else {
      onExitGroup(conversation.id);
    }
    triggerToast('已退出并解散该群聊');
  };

  // Clear Chat History Handler (底部增加清空聊天记录功能)
  const handleConfirmClearHistory = () => {
    setShowClearConfirm(false);
    onClearHistory(conversation.id);
    triggerToast('本群聊天记录已清空');
  };

  // Candidates not already in this group
  const availableCandidates = CANDIDATE_CONTACTS.filter(
    (c) => !members.some((m) => m.name === c.name)
  ).filter((c) => c.name.toLowerCase().includes(addSearch.toLowerCase()));

  // Ensure owner is ALWAYS strictly ranked first, followed by admins, then members
  const sortedMembers = React.useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.role === 'owner') return -1;
      if (b.role === 'owner') return 1;
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (b.role === 'admin' && a.role !== 'admin') return 1;
      return 0;
    });
  }, [members]);

  // Filtered members for member modal (owner ranked first)
  const filteredMembers = sortedMembers.filter(
    (m) => m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white text-slate-900 w-full max-w-[430px] mx-auto relative select-none font-sans pb-20 no-scrollbar">
      {/* Background Security Watermark (Exact: 戚中彪 2026/08/28 16:10 as shown in screenshots) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-12 overflow-hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='130' viewBox='0 0 220 130'><text x='20' y='50' fill='%2364748B' font-size='11' font-family='sans-serif' transform='rotate(-22 20,50)'>戚中彪 2026/08/28 16:10</text></svg>")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Toast Notice */}
      <AnimatePresence>
        {toastNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 left-4 right-4 z-50 max-w-[360px] mx-auto bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between text-xs font-medium"
          >
            <span>{toastNotice}</span>
            <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Header (Matching Image 1: Back arrow, centered title "群设置") */}
      <header className="h-12 bg-white/95 backdrop-blur-md px-3 flex items-center justify-between sticky top-0 z-30 border-b border-slate-100">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 text-slate-800 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
          title="返回"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2]" />
        </button>

        <h1 className="font-bold text-[17px] text-slate-900 absolute left-1/2 -translate-x-1/2">
          群设置
        </h1>

        <div className="w-8" />
      </header>

      {/* Scrollable Settings Content */}
      <main className="relative z-10 bg-white">
        
        {/* =========================================================================
            SECTION 1: 群成员展示情况 (支持添加和移出成员) + 查看全部成员 17人 >
           ========================================================================= */}
        <section className="bg-white px-4 pt-3 pb-2">
          {/* Member Avatars Grid (5 Columns matching Image 1) */}
          <div className="grid grid-cols-5 gap-y-3.5 gap-x-2 text-center mb-3">
            {/* Render up to 13 members in top grid - Owner ranked 1st */}
            {sortedMembers.slice(0, 13).map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-1">
                <div className="relative">
                  <div className="w-[50px] h-[50px] sm:w-[52px] sm:h-[52px] rounded-[10px] overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-full h-full object-cover select-none"
                      referrerPolicy="no-referrer"
                      loading="eager"
                    />
                  </div>
                  {m.role === 'owner' && (
                    <span className="absolute -top-1 -right-1 bg-[#0058BD] text-white text-[9px] font-medium px-1 py-0.2 rounded-xs leading-tight shadow-xs">
                      群主
                    </span>
                  )}
                </div>
                <span className="text-[12px] text-slate-700 truncate w-[56px] font-normal leading-tight text-center mt-0.5">
                  {m.name}
                </span>
              </div>
            ))}

            {/* Action 1: Plus (添加成员) Button - Exactly matching Image 1 dashed box */}
            <button
              onClick={() => {
                setSelectedToAdd([]);
                setAddSearch('');
                setShowAddModal(true);
              }}
              className="flex flex-col items-center gap-1 group cursor-pointer"
              title="添加成员"
            >
              <div className="w-[50px] h-[50px] sm:w-[52px] sm:h-[52px] rounded-[10px] border border-dashed border-slate-300 group-hover:border-[#0058BD] group-hover:bg-blue-50/40 flex items-center justify-center text-slate-400 group-hover:text-[#0058BD] transition-all bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <Plus className="w-5 h-5 stroke-[1.75]" />
              </div>
              <span className="text-[12px] text-slate-400 group-hover:text-[#0058BD] leading-tight mt-0.5">添加</span>
            </button>

            {/* Action 2: Minus (移出成员) Button - Required: 支持添加和移出成员 */}
            <button
              onClick={() => {
                setSelectedToRemove([]);
                setShowRemoveModal(true);
              }}
              className="flex flex-col items-center gap-1 group cursor-pointer"
              title="移出成员"
            >
              <div className="w-[50px] h-[50px] sm:w-[52px] sm:h-[52px] rounded-[10px] border border-dashed border-slate-300 group-hover:border-red-500 group-hover:bg-red-50/40 flex items-center justify-center text-slate-400 group-hover:text-red-500 transition-all bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <Minus className="w-5 h-5 stroke-[1.75]" />
              </div>
              <span className="text-[12px] text-slate-400 group-hover:text-red-500 leading-tight mt-0.5">移出</span>
            </button>
          </div>

          {/* List Item: 查看全部成员 11人 > (用户要求：修改为新页面) */}
          <div
            onClick={() => setShowMembersPage(true)}
            className="pt-3 border-t border-slate-100 flex items-center justify-between cursor-pointer text-[14px] text-slate-800 hover:bg-slate-50/60 -mx-4 px-4 py-2 transition-colors"
          >
            <span className="font-normal text-slate-800">查看全部成员</span>
            <div className="flex items-center gap-1 text-slate-400 font-normal">
              <span className="text-[14px]">{members.length}人</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </section>

        {/* Separator Strip */}
        <div className="h-2.5 bg-[#F4F5F7] border-y border-slate-100/80" />

        {/* =========================================================================
            SECTION 2: 群聊名称 & 群公告 (Matching Image 1)
           ========================================================================= */}
        <section className="bg-white divide-y divide-slate-100">
          {/* 群聊名称 */}
          <div
            onClick={() => setIsEditingName(true)}
            className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors"
          >
            <span className="text-[14px] text-slate-800">群聊名称</span>
            <div className="flex items-center gap-1 text-slate-500 text-[14px]">
              <span className="font-medium text-slate-800">{groupName}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* 群公告 */}
          <div
            onClick={() => setIsEditingAnnouncement(true)}
            className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors"
          >
            <span className="text-[14px] text-slate-800">群公告</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </section>

        {/* Separator Strip */}
        <div className="h-2.5 bg-[#F4F5F7] border-y border-slate-100/80" />

        {/* =========================================================================
            SECTION 3: 邀请二维码与邀请链接 (Matching Image 1)
           ========================================================================= */}
        <section className="bg-white divide-y divide-slate-100">
          {/* 邀请二维码 */}
          <div
            onClick={() => setShowQrModal(true)}
            className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors"
          >
            <span className="text-[14px] text-slate-800">邀请二维码</span>
            <div className="flex items-center gap-1">
              <QrCode className="w-4 h-4 text-[#0058BD]" />
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* 邀请链接 */}
          <div className="px-4 py-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-slate-800">邀请链接</span>
              <button
                onClick={handleCopyInviteLink}
                className="flex items-center gap-1 text-[13px] text-[#0058BD] font-medium hover:opacity-80 active:scale-95 transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>复制链接</span>
              </button>
            </div>
            {/* Light blue pill container with exact URL */}
            <div className="bg-[#EEF4FE] text-[#0058BD] px-3.5 py-2 rounded-xl text-[12px] font-mono break-all leading-relaxed select-all">
              {inviteLink}
            </div>
          </div>
        </section>

        {/* Separator Strip */}
        <div className="h-2.5 bg-[#F4F5F7] border-y border-slate-100/80" />

        {/* =========================================================================
            SECTION 4: 我在本群昵称 (Matching Image 2)
           ========================================================================= */}
        <section className="bg-white">
          <div
            onClick={() => setIsEditingNickname(true)}
            className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors"
          >
            <span className="text-[14px] text-slate-800">我在本群昵称</span>
            <div className="flex items-center gap-1 text-[14px]">
              <span className="font-medium text-slate-800">{myNickname}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </section>

        {/* Separator Strip */}
        <div className="h-2.5 bg-[#F4F5F7] border-y border-slate-100/80" />

        {/* =========================================================================
            SECTION 5: 免打扰、置顶、邀请确认 (用户明确要求：放聊天记录上方)
           ========================================================================= */}
        <section className="bg-white divide-y divide-slate-100">
          {/* 邀请确认 */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-[14px] text-slate-800">邀请确认</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                开启后，群成员需群主或管理员确认后方可邀请他人入群
              </p>
            </div>
            <button
              onClick={handleToggleInviteConfirm}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                inviteConfirm ? 'bg-[#0058BD]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                  inviteConfirm ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 全员禁言 (用户要求：群设置页增加全员禁言开启关闭功能) */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-[14px] text-slate-800">全员禁言</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                开启后，仅群主和管理员可以发言
              </p>
            </div>
            <button
              onClick={handleToggleMuteAll}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                isMutedAll ? 'bg-[#0058BD]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                  isMutedAll ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 消息免打扰 */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <span className="text-[14px] text-slate-800">消息免打扰</span>
            <button
              onClick={handleToggleMute}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                isMuted ? 'bg-[#0058BD]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                  isMuted ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 置顶聊天 */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <span className="text-[14px] text-slate-800">置顶聊天</span>
            <button
              onClick={handleTogglePin}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                isPinned ? 'bg-[#0058BD]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                  isPinned ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Separator Strip */}
        <div className="h-2.5 bg-[#F4F5F7] border-y border-slate-100/80" />

        {/* =========================================================================
            SECTION 6: 查看聊天记录 (用户明确要求：将聊天记录往下调整，并在免打扰/置顶/邀请确认下方)
           ========================================================================= */}
        <section className="bg-white px-4 py-4 space-y-3">
          <div>
            <h3 className="text-[14px] font-medium text-slate-900">查看聊天记录</h3>
            <p className="text-[12px] text-slate-400 mt-1">
              聊天内容为加密存储，暂不支持按关键词搜索。
            </p>
          </div>

          {/* Two Action Columns Matching Image 2: Calendar icon + 按人员 | Users icon + 按日期 */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <button
              onClick={() => setHistoryModalType('person')}
              className="flex flex-col items-center justify-center py-2.5 px-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group active:scale-95"
            >
              <Calendar className="w-6 h-6 text-slate-800 stroke-[1.75] mb-1.5 group-hover:text-[#0058BD] transition-colors" />
              <span className="text-[13px] text-slate-700 font-normal">按人员</span>
            </button>

            <button
              onClick={() => setHistoryModalType('date')}
              className="flex flex-col items-center justify-center py-2.5 px-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group active:scale-95"
            >
              <Users className="w-6 h-6 text-slate-800 stroke-[1.75] mb-1.5 group-hover:text-[#0058BD] transition-colors" />
              <span className="text-[13px] text-slate-700 font-normal">按日期</span>
            </button>
          </div>
        </section>

        {/* Separator Strip */}
        <div className="h-2.5 bg-[#F4F5F7] border-y border-slate-100/80" />

        {/* =========================================================================
            SECTION 7: 底部功能 (清空聊天记录、关闭群组、退出并解散)
           ========================================================================= */}
        <section className="bg-white divide-y divide-slate-100">
          {/* 清空聊天记录 (新增功能) */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-3.5 text-center text-[15px] font-normal text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
          >
            清空聊天记录
          </button>

          {/* 关闭群组 */}
          <button
            onClick={() => setShowCloseGroupConfirm(true)}
            className="w-full py-3.5 text-center text-[15px] font-normal text-[#BA1A1A] hover:bg-red-50/50 active:bg-red-100/60 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>关闭群组</span>
          </button>

          {/* 退出并解散 (由退出群聊修改为退出并解散) */}
          <button
            onClick={() => setShowExitConfirm(true)}
            className="w-full py-3.5 text-center text-[15px] font-normal text-[#BA1A1A] hover:bg-red-50/50 active:bg-red-100/60 transition-colors cursor-pointer"
          >
            退出并解散
          </button>
        </section>

        {/* Bottom indicator space */}
        <div className="h-6" />
      </main>

      {/* =========================================================================
          MODAL 1: 添加成员 Modal (支持搜索、勾选、一键添加)
         ========================================================================= */}
      <AnimatePresence>
        {showAddModal && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-3xl sm:rounded-2xl max-w-[430px] w-full p-5 max-h-[85vh] flex flex-col shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#0058BD]" />
                  <h3 className="text-base font-bold text-slate-900">添加群成员</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  placeholder="搜索单位内联系人"
                  className="w-full bg-slate-100 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 outline-none border border-slate-200 focus:bg-white focus:border-[#0058BD]"
                />
              </div>

              <div className="overflow-y-auto flex-1 divide-y divide-slate-100 max-h-[50vh] pr-1">
                {availableCandidates.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    没有找到匹配的可添加联系人
                  </div>
                ) : (
                  availableCandidates.map((c) => {
                    const isChecked = selectedToAdd.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedToAdd((prev) =>
                            isChecked ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                          );
                        }}
                        className="py-2.5 px-1 flex items-center justify-between hover:bg-slate-50 rounded-xl cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{c.name}</p>
                            <p className="text-[10px] text-slate-400">{c.department}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-[#0058BD] border-[#0058BD] text-white' : 'border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">已选 {selectedToAdd.length} 人</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConfirmAddMembers}
                    disabled={selectedToAdd.length === 0}
                    className="px-4 py-1.5 text-xs bg-[#0058BD] disabled:bg-slate-300 text-white font-medium rounded-xl hover:bg-[#004CB3] transition-colors"
                  >
                    确定添加
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 2: 移出成员 Modal (支持单选/多选/搜索移出成员)
         ========================================================================= */}
      <AnimatePresence>
        {showRemoveModal && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-3xl sm:rounded-2xl max-w-[430px] w-full p-5 max-h-[85vh] flex flex-col shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <UserMinus className="w-5 h-5 text-[#BA1A1A]" />
                  <h3 className="text-base font-bold text-slate-900">移出群成员</h3>
                </div>
                <button onClick={() => setShowRemoveModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mb-3">
                勾选需要移出本群的成员，群主及系统保密账号不可移出。
              </p>

              <div className="overflow-y-auto flex-1 divide-y divide-slate-100 max-h-[50vh] pr-1">
                {members.map((m) => {
                  const isOwner = m.role === 'owner';
                  const isChecked = selectedToRemove.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        if (isOwner) return;
                        setSelectedToRemove((prev) =>
                          isChecked ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                        );
                      }}
                      className={`py-2.5 px-1 flex items-center justify-between rounded-xl ${
                        isOwner ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-900">{m.name}</p>
                            {isOwner && (
                              <span className="bg-[#0058BD] text-white text-[9px] px-1 py-0.5 rounded font-bold">群主</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">{m.department || '研发部'}</p>
                        </div>
                      </div>

                      {isOwner ? (
                        <span className="text-[10px] text-slate-400">不可移出</span>
                      ) : (
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-[#BA1A1A] border-[#BA1A1A] text-white' : 'border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">已选 {selectedToRemove.length} 人</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRemoveModal(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConfirmRemoveMembers}
                    disabled={selectedToRemove.length === 0}
                    className="px-4 py-1.5 text-xs bg-[#BA1A1A] disabled:bg-slate-300 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                  >
                    确认移出
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          VIEW ALL MEMBERS FULL PAGE (用户要求：查看全部成员修改为新页面，支持多选人员移除，并支持单点人员查看个人名片)
         ========================================================================= */}
      <AnimatePresence>
        {showMembersPage && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="absolute inset-0 z-50 w-full h-full"
          >
            <GroupMembersScreen
              members={members}
              groupName={groupName}
              isCurrentUserOwner={conversation.isOwner !== false}
              onBack={() => setShowMembersPage(false)}
              onUpdateMembers={(next) => {
                setMembers(next);
                onUpdateGroup({ members: next, memberCount: next.length });
              }}
              onDirectChat={(m) => {
                setActivePrivateTarget({
                  id: m.id,
                  name: m.name,
                  avatar: m.avatar,
                  department: m.department,
                  role: m.role,
                });
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 4: 关闭群组确认弹窗 (用户明确要求：底部增加关闭群组功能)
         ========================================================================= */}
      <AnimatePresence>
        {showCloseGroupConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-[320px] w-full p-5 shadow-2xl border border-slate-200 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-[#BA1A1A] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">确定关闭此群组？</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                关闭群组后，该群将停止协同，全员消息信道封存并转为只读归档状态，群成员将无法继续发送新消息。
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setShowCloseGroupConfirm(false)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmCloseGroup}
                  className="py-2.5 px-3 bg-[#BA1A1A] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  确认关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 4.5: 清空聊天记录确认弹窗 (新增功能)
         ========================================================================= */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-[320px] w-full p-5 shadow-2xl border border-slate-200 text-center space-y-3"
            >
              <h3 className="text-base font-bold text-slate-900">确定清空聊天记录？</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                清空后，本群所有本地历史消息、图片和文件将被清除，且无法找回。
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmClearHistory}
                  className="py-2.5 px-3 bg-[#BA1A1A] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  清空
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 5: 退出并解散确认弹窗 (底部的退出群聊修改为退出并解散)
         ========================================================================= */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-[320px] w-full p-5 shadow-2xl border border-slate-200 text-center space-y-3"
            >
              <h3 className="text-base font-bold text-slate-900">确定退出并解散？</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                解散后，该群组将被彻底销毁，全员协同信道关闭，群成员将被移出且无法恢复。
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmExitAndDisband}
                  className="py-2.5 px-3 bg-[#BA1A1A] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  退出并解散
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 6: 聊天记录搜索/索引筛选弹窗 (按人员 / 按日期)
         ========================================================================= */}
      <AnimatePresence>
        {historyModalType && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-3xl sm:rounded-2xl max-w-[430px] w-full p-5 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  {historyModalType === 'person' ? '按人员调取加密记录' : '按日期检索协同记录'}
                </h3>
                <button onClick={() => setHistoryModalType(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                因属于<span className="text-[#BA1A1A] font-medium">涉密文件</span>，信道采用商用密码按索引快速定位：
              </p>
              <div className="space-y-2 mb-4">
                {historyModalType === 'person' ? (
                  members.slice(0, 4).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setHistoryModalType(null);
                        triggerToast(`已调取成员【${m.name}】的涉密发言记录`);
                      }}
                      className="w-full py-2 px-3 bg-slate-50 hover:bg-blue-50 text-left rounded-xl text-xs flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800">{m.name}</span>
                      <span className="text-slate-400 text-[10px]">{m.department || '研发部'}</span>
                    </button>
                  ))
                ) : (
                  ['今天 (2026/08/28)', '昨日 (2026/08/27)', '更早前一周', '历史归档记录'].map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setHistoryModalType(null);
                        triggerToast(`已定位到【${d}】的会话节点`);
                      }}
                      className="w-full py-2.5 px-3 bg-slate-50 hover:bg-blue-50 text-left rounded-xl text-xs flex items-center justify-between text-slate-800"
                    >
                      <span>{d}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={() => setHistoryModalType(null)}
                className="w-full py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
              >
                关闭
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 7: 邀请二维码名片
         ========================================================================= */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-[320px] w-full p-6 shadow-2xl border border-slate-200 text-center"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">群二维码名片</h3>
                <button onClick={() => setShowQrModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4 inline-block">
                <div className="w-44 h-44 bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-center relative">
                  <QrCode className="w-36 h-36 text-slate-800" />
                  <span className="text-[10px] text-slate-400 font-mono mt-1">GRP-{conversation.id.toUpperCase()}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                该二维码7天内(至9月4日)有效，重新生成将使旧码失效
              </p>

              <button
                onClick={handleCopyInviteLink}
                className="w-full py-2.5 bg-[#0058BD] hover:bg-[#004CB3] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                复制邀请链接
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 8: 修改群聊名称
         ========================================================================= */}
      <AnimatePresence>
        {isEditingName && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-[340px] w-full p-5 shadow-xl border border-slate-200"
            >
              <h3 className="text-sm font-bold text-slate-900 mb-3">修改群聊名称</h3>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-slate-100 text-xs font-medium text-slate-900 px-3 py-2 rounded-xl border border-[#0058BD] outline-none mb-4"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingName(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveName}
                  className="px-3 py-1.5 text-xs bg-[#0058BD] text-white rounded-lg font-medium hover:bg-[#004CB3]"
                >
                  保存
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 9: 修改群公告
         ========================================================================= */}
      <AnimatePresence>
        {isEditingAnnouncement && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-[340px] w-full p-5 shadow-xl border border-slate-200"
            >
              <h3 className="text-sm font-bold text-slate-900 mb-3">编辑群公告</h3>
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                rows={4}
                className="w-full bg-slate-100 text-xs text-slate-900 p-3 rounded-xl border border-[#0058BD] outline-none mb-4"
                placeholder="请输入面向全群的公告内容..."
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingAnnouncement(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveAnnouncement}
                  className="px-3 py-1.5 text-xs bg-[#0058BD] text-white rounded-lg font-medium hover:bg-[#004CB3]"
                >
                  发布
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 10: 修改我在本群昵称
         ========================================================================= */}
      <AnimatePresence>
        {isEditingNickname && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-[340px] w-full p-5 shadow-xl border border-slate-200"
            >
              <h3 className="text-sm font-bold text-slate-900 mb-3">修改我在本群昵称</h3>
              <input
                type="text"
                value={myNickname}
                onChange={(e) => setMyNickname(e.target.value)}
                className="w-full bg-slate-100 text-xs font-medium text-slate-900 px-3 py-2 rounded-xl border border-[#0058BD] outline-none mb-4"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingNickname(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setIsEditingNickname(false);
                    onUpdateGroup({ myNickname: myNickname.trim() });
                    triggerToast('本群昵称已修改');
                  }}
                  className="px-3 py-1.5 text-xs bg-[#0058BD] text-white rounded-lg font-medium hover:bg-[#004CB3]"
                >
                  确定
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* 1-on-1 Private Chat Modal */}
      <AnimatePresence>
        {activePrivateTarget && (
          <PrivateChatModal
            target={activePrivateTarget}
            currentUserName="戚中彪"
            groupName={groupName}
            onClose={() => setActivePrivateTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
