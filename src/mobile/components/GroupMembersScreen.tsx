import React, { useState } from 'react';
import { GroupMember } from '../types';
import { ChevronLeft, Search, Check, AlertTriangle, X } from 'lucide-react';
import { SecurityWatermark } from './SecurityWatermark';
import { MemberProfileScreen } from './MemberProfileScreen';
import { motion, AnimatePresence } from 'motion/react';

interface GroupMembersScreenProps {
  members: GroupMember[];
  groupName: string;
  isCurrentUserOwner?: boolean;
  onBack: () => void;
  onUpdateMembers: (nextMembers: GroupMember[]) => void;
  onDirectChat?: (member: GroupMember) => void;
}

export const GroupMembersScreen: React.FC<GroupMembersScreenProps> = ({
  members,
  groupName,
  isCurrentUserOwner = true,
  onBack,
  onUpdateMembers,
  onDirectChat,
}) => {
  // Mode: 'normal' view or 'select' (multi-select removal)
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<GroupMember | null>(null);
  const [showBatchRemoveConfirm, setShowBatchRemoveConfirm] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

  // Filter members by search keyword
  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  // Toggle selection for a member (owner is excluded from removal)
  const toggleSelectMember = (member: GroupMember) => {
    if (member.role === 'owner') return;
    if (selectedMemberIds.includes(member.id)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== member.id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, member.id]);
    }
  };

  // Confirm batch remove
  const handleConfirmBatchRemove = () => {
    if (selectedMemberIds.length === 0) return;
    const count = selectedMemberIds.length;
    const nextMembers = members.filter((m) => !selectedMemberIds.includes(m.id));
    onUpdateMembers(nextMembers);
    setSelectedMemberIds([]);
    setIsSelectMode(false);
    setShowBatchRemoveConfirm(false);
    triggerToast(`已成功移除 ${count} 位成员`);
  };

  // Single remove from member detail screen
  const handleSingleRemove = (memberId: string) => {
    const nextMembers = members.filter((m) => m.id !== memberId);
    onUpdateMembers(nextMembers);
    setSelectedMemberForDetail(null);
    triggerToast('已将该成员移出群聊');
  };

  // Update single member info (role, mute, etc.)
  const handleUpdateSingleMember = (memberId: string, updated: Partial<GroupMember>) => {
    const nextMembers = members.map((m) => (m.id === memberId ? { ...m, ...updated } : m));
    onUpdateMembers(nextMembers);
    if (selectedMemberForDetail && selectedMemberForDetail.id === memberId) {
      setSelectedMemberForDetail({ ...selectedMemberForDetail, ...updated });
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#F4F6F9] text-slate-900 flex flex-col w-full h-full overflow-hidden select-none font-sans">
      <SecurityWatermark name="戚中彪" timestamp="2026/09/07 17:21" />

      {/* Toast Notice */}
      <AnimatePresence>
        {toastNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 z-60 max-w-[360px] mx-auto bg-slate-900/95 text-white py-2.5 px-4 rounded-xl shadow-xl flex items-center justify-between text-xs font-medium backdrop-blur-xs"
          >
            <span>{toastNotice}</span>
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header matching Image 1 & Image 2 */}
      <header className="shrink-0 bg-[#F4F6F9]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between z-20 border-b border-slate-100">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-slate-800 hover:text-slate-600 active:scale-95 transition-transform cursor-pointer"
          title="返回群设置"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2]" />
        </button>

        <h1 className="text-[17px] font-medium text-slate-900 absolute left-1/2 -translate-x-1/2">
          群成员{members.length}人
        </h1>

        {/* Right Toggle Button: "选择" / "取消" */}
        <button
          onClick={() => {
            if (isSelectMode) {
              setIsSelectMode(false);
              setSelectedMemberIds([]);
            } else {
              setIsSelectMode(true);
            }
          }}
          className="text-[15px] text-[#0058BD] font-normal hover:opacity-80 active:scale-95 transition-all cursor-pointer"
        >
          {isSelectMode ? '取消' : '选择'}
        </button>
      </header>

      {/* Search Input Bar matching Image 1 & 2 */}
      <div className="shrink-0 px-4 py-2.5 bg-[#F4F6F9] z-20">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索"
            className="w-full bg-white text-slate-800 placeholder-slate-400 pl-10 pr-9 py-2 rounded-xl text-[14px] border border-slate-200/80 focus:outline-none focus:border-[#0058BD] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Member List Area */}
      <main className="flex-1 overflow-y-auto px-4 divide-y divide-slate-100 bg-white relative z-15 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {filteredMembers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            未搜索到相关成员
          </div>
        ) : (
          filteredMembers.map((member) => {
            const isSelected = selectedMemberIds.includes(member.id);
            const isOwner = member.role === 'owner';
            const isOnline = member.onlineStatus === 'online';

            return (
              <div
                key={member.id}
                onClick={() => {
                  if (isSelectMode) {
                    toggleSelectMember(member);
                  } else {
                    setSelectedMemberForDetail(member);
                  }
                }}
                className={`py-3.5 flex items-center justify-between cursor-pointer transition-colors active:bg-slate-50/80 ${
                  isSelectMode && isOwner ? 'opacity-85 cursor-default' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Select Mode Checkbox (Image 2) */}
                  {isSelectMode && (
                    <div className="shrink-0 pr-1">
                      {isOwner ? (
                        /* Owner cannot be removed */
                        <div className="w-5 h-5 rounded border border-slate-200 bg-slate-100 flex items-center justify-center opacity-40" />
                      ) : (
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#0058BD] border border-[#0058BD] text-white shadow-xs'
                              : 'border border-slate-300 bg-white hover:border-slate-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Avatar */}
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-11 h-11 rounded-lg object-cover border border-slate-100 shrink-0 shadow-xs"
                    referrerPolicy="no-referrer"
                  />

                  {/* Name & Role Tag matching Image 1 */}
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[15px] font-normal text-slate-900 truncate">
                      {member.name}
                    </span>
                    {isOwner && (
                      <span className="border border-red-300 text-red-500 bg-red-50/60 text-[11px] px-1.5 py-0.5 rounded leading-none shrink-0 font-normal">
                        群主
                      </span>
                    )}
                    {member.role === 'admin' && (
                      <span className="border border-slate-300 text-slate-500 bg-slate-100/70 text-[11px] px-1.5 py-0.5 rounded leading-none shrink-0 font-normal">
                        管理员
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Status: Online / Offline matching Image 1 */}
                <div className="flex items-center gap-1.5 shrink-0 pl-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  <span
                    className={`text-[13px] font-normal ${
                      isOnline ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {isOnline ? '在线' : '离线'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Select Mode Bottom Bar matching Image 2 */}
      {isSelectMode && (
        <div className="shrink-0 bg-white border-t border-slate-100/90 px-5 py-3.5 flex items-center justify-between z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <div className="text-[15px] text-slate-700 font-normal">
            已选择:{' '}
            <span className="text-[#0058BD] font-bold text-[17px] mx-1">
              {selectedMemberIds.length}
            </span>{' '}
            人
          </div>

          <button
            onClick={() => {
              if (selectedMemberIds.length === 0) {
                triggerToast('请先勾选要移除的人员');
                return;
              }
              setShowBatchRemoveConfirm(true);
            }}
            disabled={selectedMemberIds.length === 0}
            className={`px-7 py-2 rounded-full text-[15px] font-medium border transition-all cursor-pointer active:scale-95 ${
              selectedMemberIds.length > 0
                ? 'border-red-500 text-red-600 bg-white hover:bg-red-50/50 shadow-xs'
                : 'border-slate-200 text-slate-300 bg-white cursor-not-allowed opacity-60'
            }`}
          >
            移除
          </button>
        </div>
      )}

      {/* Batch Remove Confirmation Modal */}
      <AnimatePresence>
        {showBatchRemoveConfirm && (
          <div className="absolute inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-2xl max-w-[320px] w-full p-5 shadow-2xl border border-slate-200 text-center"
            >
              <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-[16px] font-bold text-slate-900 mb-1">
                批量移出群聊确认
              </h3>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-5">
                确定要将选中的 <span className="font-semibold text-slate-800">{selectedMemberIds.length}</span> 位成员移出群聊吗？
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBatchRemoveConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmBatchRemove}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
                >
                  确认移除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Member Profile Screen (Image 3) */}
      <AnimatePresence>
        {selectedMemberForDetail && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 w-full h-full"
          >
            <MemberProfileScreen
              member={selectedMemberForDetail}
              groupName={groupName}
              isCurrentUserOwner={isCurrentUserOwner}
              onBack={() => setSelectedMemberForDetail(null)}
              onUpdateMember={(up) => handleUpdateSingleMember(selectedMemberForDetail.id, up)}
              onRemoveMember={handleSingleRemove}
              onDirectChat={onDirectChat}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
