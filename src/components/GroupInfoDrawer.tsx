import React, { useState } from 'react';
import {
  ChevronRight,
  Plus,
  Minus,
  X,
  Trash2,
  LogOut,
  AlertOctagon,
  Power,
} from 'lucide-react';
import { ChatSession, UserMember } from '../types/chat';
import { GroupInviteModal } from './GroupInviteModal';
import { MemberProfileModal } from './MemberProfileModal';

interface GroupInfoDrawerProps {
  session: ChatSession;
  onClose: () => void;
  onToggleMute: (sessionId: string) => void;
  onTogglePin: (sessionId: string) => void;
  onToggleReminderTrack?: (sessionId: string) => void;
  onToggleGroupStatus?: (sessionId: string) => void;
  onToggleInviteConfirm?: (sessionId: string) => void;
  onUpdateGroupName: (sessionId: string, newName: string) => void;
  onUpdateAnnouncement: (sessionId: string, newAnnounce: string) => void;
  onUpdateNickname: (sessionId: string, newNickname: string) => void;
  onClearHistory: (sessionId: string) => void;
  onExitGroup: (sessionId: string) => void;
  onDisbandGroup?: (sessionId: string) => void;
  onAddMember: (member: UserMember) => void;
  onViewLargeAvatar?: (avatarUrl: string) => void;
  onMentionMember?: (member: UserMember) => void;
}

export const GroupInfoDrawer: React.FC<GroupInfoDrawerProps> = ({
  session,
  onClose,
  onToggleMute,
  onTogglePin,
  onToggleReminderTrack,
  onToggleGroupStatus,
  onToggleInviteConfirm,
  onUpdateGroupName,
  onUpdateAnnouncement,
  onUpdateNickname,
  onClearHistory,
  onExitGroup,
  onDisbandGroup,
  onAddMember,
  onViewLargeAvatar,
  onMentionMember,
}) => {
  const [isMuteAll, setIsMuteAll] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showDisbandConfirm, setShowDisbandConfirm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<UserMember | null>(null);
  const [editModal, setEditModal] = useState<{
    type: 'name' | 'announcement' | 'nickname';
    value: string;
  } | null>(null);

  const membersList = session?.members || [];
  const isOwner = session?.isGroup && (session.isOwner ?? true);

  const handleSaveModal = () => {
    if (!editModal) return;
    if (editModal.type === 'name' && editModal.value.trim()) {
      onUpdateGroupName(session.id, editModal.value.trim());
    } else if (editModal.type === 'announcement') {
      onUpdateAnnouncement(session.id, editModal.value.trim() || '无群公告');
    } else if (editModal.type === 'nickname' && editModal.value.trim()) {
      onUpdateNickname(session.id, editModal.value.trim());
    }
    setEditModal(null);
  };

  const handleConfirmClear = () => {
    onClearHistory(session.id);
    setShowClearConfirm(false);
  };

  const handleConfirmExit = () => {
    onExitGroup(session.id);
    setShowExitConfirm(false);
  };

  const handleConfirmDisband = () => {
    onDisbandGroup?.(session.id);
    setShowDisbandConfirm(false);
  };

  return (
    <div
      id="group-info-sidebar"
      className="w-[290px] bg-[#f8fafc] border-l border-gray-200/90 flex flex-col h-full select-none shrink-0 overflow-y-auto custom-scrollbar shadow-2xl z-30 justify-between"
    >
      <div>
        {/* Top Header with Close Button */}
        <div className="p-3 pb-2.5 border-b border-gray-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-800">群组设置</span>
            <span className="text-[11px] text-gray-400">({membersList.length}人)</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            title="关闭群信息"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Member Avatar Grid */}
        <div className="p-3 pb-2 bg-white">
          <div className="grid grid-cols-4 gap-y-3 gap-x-2 text-center px-0.5">
            {membersList.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
                title={`${member.name} (${member.role === 'owner' ? '群主' : member.role === 'admin' ? '管理员' : '成员'})`}
              >
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-lg object-cover bg-gray-200 border border-gray-100 group-hover:scale-105 transition-transform shadow-2xs"
                  />
                  {/* Role indicator pill */}
                  {member.role === 'owner' && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] px-1 rounded font-bold shadow-2xs">
                      主
                    </span>
                  )}
                  {member.role === 'admin' && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] px-1 rounded font-bold shadow-2xs">
                      管
                    </span>
                  )}
                  {/* Online dot */}
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${
                      member.online ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                  />
                </div>
                <span className="text-[11px] text-gray-700 truncate max-w-[54px] leading-tight">
                  {member.name}
                </span>
              </div>
            ))}

            {/* Add member button */}
            <button
              id="btn-add-group-member"
              onClick={() => {
                const newMemberName = prompt('请输入要添加的新群成员姓名:');
                if (newMemberName && newMemberName.trim()) {
                  onAddMember({
                    id: `user_${Date.now()}`,
                    name: newMemberName.trim(),
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newMemberName)}`,
                    role: 'member',
                    department: '研发中心',
                    online: true,
                  });
                }
              }}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg border border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-all bg-white">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[11px] text-gray-500 group-hover:text-blue-600">添加</span>
            </button>

            {/* Remove member button */}
            <button
              id="btn-remove-group-member"
              onClick={() => alert('请在成员名片中选择移出成员或由管理员操作')}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg border border-dashed border-gray-300 hover:border-red-400 hover:bg-red-50/50 flex items-center justify-center text-gray-400 group-hover:text-red-500 transition-all bg-white">
                <Minus className="w-4 h-4" />
              </div>
              <span className="text-[11px] text-gray-500 group-hover:text-red-500">移出</span>
            </button>
          </div>
        </div>

        <div className="h-2 bg-[#f1f5f9] border-y border-gray-200/60" />

        {/* Group Configuration Items */}
        <div className="flex flex-col text-xs text-gray-700 bg-white">
          {/* 群聊名称 */}
          <button
            id="setting-group-name"
            onClick={() => setEditModal({ type: 'name', value: session.name })}
            className="flex items-center justify-between px-3.5 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left group cursor-pointer"
          >
            <span className="text-gray-800 font-medium shrink-0">群聊名称</span>
            <div className="flex items-center gap-1 text-gray-400 group-hover:text-gray-700 min-w-0 pl-2">
              <span className="truncate text-gray-500 text-xs">{session.name}</span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          </button>

          {/* 群公告 */}
          <button
            id="setting-group-announcement"
            onClick={() => setEditModal({ type: 'announcement', value: session.announcement || '无公告' })}
            className="flex items-center justify-between px-3.5 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left group cursor-pointer"
          >
            <span className="text-gray-800 font-medium shrink-0">群公告</span>
            <div className="flex items-center gap-1 text-gray-400 group-hover:text-gray-700 min-w-0 pl-2">
              <span className="truncate text-gray-400 text-xs">{session.announcement || '无公告'}</span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          </button>

          {/* 我在本群的昵称 */}
          <button
            id="setting-my-nickname"
            onClick={() => setEditModal({ type: 'nickname', value: session.myNickname || '戚中彪' })}
            className="flex items-center justify-between px-3.5 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left group cursor-pointer"
          >
            <span className="text-gray-800 font-medium shrink-0">我在本群的昵称</span>
            <div className="flex items-center gap-1 text-gray-400 group-hover:text-gray-700 min-w-0 pl-2">
              <span className="truncate text-gray-500 text-xs">{session.myNickname || '戚中彪'}</span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          </button>

          {/* 群组邀请 (专属邀请弹窗) */}
          <button
            id="setting-group-invite"
            onClick={() => setShowInviteModal(true)}
            className="flex items-center justify-between px-3.5 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left group cursor-pointer"
          >
            <span className="text-gray-800 font-medium shrink-0">群组邀请</span>
            <div className="flex items-center text-gray-400 group-hover:text-gray-700">
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          </button>

          {/* 邀请确认 (群主可开启/关闭) */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100">
            <div className="flex flex-col pr-2">
              <span className="text-gray-800 font-medium">邀请确认</span>
              <span className="text-[10px] text-gray-400">开启后邀请进群需审批</span>
            </div>
            <button
              id="toggle-invite-confirm-switch"
              role="switch"
              aria-checked={session.inviteConfirmEnabled ?? false}
              onClick={() => onToggleInviteConfirm?.(session.id)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                session.inviteConfirmEnabled ? 'bg-[#2979ff]' : 'bg-gray-200'
              }`}
              title={isOwner ? '群主可开启/关闭邀请确认' : '仅群主可开启/关闭'}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5 ${
                  session.inviteConfirmEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* 消息免打扰 */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100">
            <span className="text-gray-800 font-medium">消息免打扰</span>
            <button
              id="toggle-mute-switch"
              role="switch"
              aria-checked={session.isMuted}
              onClick={() => onToggleMute(session.id)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                session.isMuted ? 'bg-[#2979ff]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5 ${
                  session.isMuted ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* 置顶聊天 */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100">
            <span className="text-gray-800 font-medium">置顶聊天</span>
            <button
              id="toggle-pin-switch"
              role="switch"
              aria-checked={session.isPinned}
              onClick={() => onTogglePin(session.id)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                session.isPinned ? 'bg-[#2979ff]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5 ${
                  session.isPinned ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* 全员禁言 */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100">
            <span className="text-gray-800 font-medium">全员禁言</span>
            <button
              id="toggle-mute-all"
              role="switch"
              aria-checked={isMuteAll}
              onClick={() => setIsMuteAll(!isMuteAll)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                isMuteAll ? 'bg-[#2979ff]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5 ${
                  isMuteAll ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions: 清空聊天记录 -> 关闭群组 -> 删除并解散 / 退出群聊 */}
      <div className="p-3 flex flex-col gap-2 bg-white border-t border-gray-100 mt-auto shrink-0">
        {/* 1. 首先是: 清空聊天记录 */}
        <button
          id="btn-clear-chat-history"
          onClick={() => setShowClearConfirm(true)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer border border-gray-200 shadow-2xs"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-500" />
          <span>清空聊天记录</span>
        </button>

        {/* 2. 再是: 开启/关闭群组 (群主权限) */}
        {isOwner && (
          <button
            id="btn-toggle-group-status"
            onClick={() => onToggleGroupStatus?.(session.id)}
            className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center cursor-pointer shadow-2xs ${
              !session.isClosed
                ? 'text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200'
                : 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200'
            }`}
          >
            {!session.isClosed ? '关闭群组' : '开启群组'}
          </button>
        )}

        {/* 3. 和: 删除并解散 (群主) 或 退出群聊 (普通成员) */}
        {isOwner ? (
          <button
            id="btn-disband-group"
            onClick={() => setShowDisbandConfirm(true)}
            className="w-full py-1.5 px-2 rounded-lg text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all text-center cursor-pointer shadow-2xs"
          >
            删除并解散
          </button>
        ) : (
          <button
            id="btn-exit-group"
            onClick={() => setShowExitConfirm(true)}
            className="w-full py-1.5 px-2 rounded-lg text-xs font-medium text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all text-center cursor-pointer shadow-2xs"
          >
            退出群聊
          </button>
        )}
      </div>

      {/* Member Profile Card & Large Avatar Viewer */}
      <MemberProfileModal
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        onMentionMember={(m) => {
          onMentionMember?.(m);
          setSelectedMember(null);
        }}
        onViewLargeAvatar={(url) => {
          onViewLargeAvatar?.(url);
          setSelectedMember(null);
        }}
      />

      {/* Group Invite Modal (群邀请弹窗) */}
      <GroupInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        session={session}
      />

      {/* Confirm Clear Chat History Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-5 flex flex-col gap-3.5 border border-slate-100">
            <div className="flex items-center gap-2.5 text-gray-900">
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold">清空聊天记录</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              确定要清空「{session.name}」的所有本地聊天记录吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                id="btn-confirm-clear-history"
                onClick={handleConfirmClear}
                className="px-3.5 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                确定清空
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Exit Group Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-5 flex flex-col gap-3.5 border border-slate-100">
            <div className="flex items-center gap-2.5 text-gray-900">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold">退出群聊</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              确定要退出「{session.name}」吗？退出后将不再接收该群消息。
            </p>
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                id="btn-confirm-exit-group"
                onClick={handleConfirmExit}
                className="px-3.5 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                确定退出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete / Disband Group Modal (群组删除并解散二次确认) */}
      {showDisbandConfirm && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-5 flex flex-col gap-3.5 border border-red-100">
            <div className="flex items-center gap-2.5 text-red-600">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold">删除并解散群聊确认</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              您正在以<b>群主</b>身份解散「{session.name}」。解散后该群聊将被永久销毁，所有数据清空。
            </p>
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => setShowDisbandConfirm(false)}
                className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                id="btn-confirm-disband-group"
                onClick={handleConfirmDisband}
                className="px-3.5 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                确认删除并解散
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Profile Modal */}
      <MemberProfileModal
        member={selectedMember}
        isOpen={!!selectedMember}
        currentGroupName={session.name}
        onClose={() => setSelectedMember(null)}
        onSendMessage={(m) => {
          setSelectedMember(null);
          onMentionMember?.(m);
        }}
      />

      {/* Edit Modal (Dialog) */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xs p-4 flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-gray-800">
              {editModal.type === 'name'
                ? '修改群聊名称'
                : editModal.type === 'announcement'
                ? '修改群公告'
                : '修改我在本群的昵称'}
            </h3>

            {editModal.type === 'announcement' ? (
              <textarea
                value={editModal.value}
                onChange={(e) => setEditModal({ ...editModal, value: e.target.value })}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-md p-2 text-xs text-gray-800 outline-hidden focus:border-blue-400 focus:bg-white resize-none"
                placeholder="请输入群公告"
              />
            ) : (
              <input
                type="text"
                value={editModal.value}
                onChange={(e) => setEditModal({ ...editModal, value: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-md p-2 text-xs text-gray-800 outline-hidden focus:border-blue-400 focus:bg-white"
                placeholder="请输入内容"
              />
            )}

            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => setEditModal(null)}
                className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveModal}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


