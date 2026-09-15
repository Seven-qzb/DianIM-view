import React, { useState } from 'react';
import { X, Search, ChevronRight, Check, Calendar, Clock, UserCheck } from 'lucide-react';
import { ChatSession, UserMember, GroupTask } from '../types/chat';

interface CreateGroupTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession;
  onSubmit: (data: {
    title: string;
    content: string;
    assigneeName: string;
    assigneeId: string;
    assigneeAvatar?: string;
    deadline?: string;
    isPublic: boolean;
  }) => void;
}

export const CreateGroupTaskModal: React.FC<CreateGroupTaskModalProps> = ({
  isOpen,
  onClose,
  session,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<UserMember | null>(null);
  const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  if (!isOpen) return null;

  // 严格限制：任务处理人仅群内人员可选择
  const groupMembers = session.members || [];
  const filteredMembers = groupMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.department && m.department.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedAssignee) return;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      assigneeName: selectedAssignee.name,
      assigneeId: selectedAssignee.id,
      assigneeAvatar: selectedAssignee.avatar,
      deadline: deadline || '今天 18:00',
      isPublic,
    });

    // Reset and close
    setTitle('');
    setContent('');
    setDeadline('');
    setSelectedAssignee(null);
    setIsPublic(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[1px]">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">新建任务</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* 主题 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">主题</label>
            <div className="relative bg-[#f8f9fc] border border-gray-200/80 rounded-xl p-3 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 25))}
                placeholder="请输入任务主题"
                maxLength={25}
                className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-hidden pr-12"
              />
              <span className="text-[11px] text-gray-400 absolute right-3 bottom-2.5 select-none font-mono">
                {title.length}/25
              </span>
            </div>
          </div>

          {/* 内容 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">内容</label>
            <div className="relative bg-[#f8f9fc] border border-gray-200/80 rounded-xl p-3 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 200))}
                placeholder="请输入任务内容"
                maxLength={200}
                rows={4}
                className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-hidden resize-none pb-4"
              />
              <span className="text-[11px] text-gray-400 absolute right-3 bottom-2.5 select-none font-mono">
                {content.length}/200
              </span>
            </div>
          </div>

          {/* 要求时间 */}
          <div>
            <div
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="bg-[#f8f9fc] border border-gray-200/80 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100/70 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-800">要求时间</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className={deadline ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                  {deadline || '请选择'}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Quick time picker dropdown */}
            {showDatePicker && (
              <div className="mt-2 p-2.5 bg-white border border-gray-200 rounded-xl shadow-lg space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[11px] font-medium text-gray-400 px-2">快捷时限设定</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {['2小时后', '今天 18:00', '明天 12:00', '本周五 18:00'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setDeadline(preset);
                        setShowDatePicker(false);
                      }}
                      className="text-left px-2.5 py-1.5 text-xs text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg border border-gray-100 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <div className="pt-1.5 border-t border-gray-100 flex items-center gap-2">
                  <input
                    type="datetime-local"
                    onChange={(e) => {
                      if (e.target.value) {
                        const d = new Date(e.target.value);
                        const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                        setDeadline(formatted);
                        setShowDatePicker(false);
                      }
                    }}
                    className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2 py-1 flex-1 outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 是否全员可见 */}
          <div className="bg-[#f8f9fc] border border-gray-200/80 rounded-xl p-3.5 flex items-center justify-between">
            <div className="pr-4">
              <div className="text-sm font-semibold text-gray-800">是否全员可见</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-normal">
                打开后新建任务全员可见，关闭后仅处理人可见。
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer p-0.5 ${
                isPublic ? 'bg-[#2979ff]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 任务处理人 */}
          <div className="bg-[#f8f9fc] border border-gray-200/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-800">任务处理人</span>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm">
                  群内限定
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMemberSearch('');
                  setIsMemberPickerOpen(true);
                }}
                className="text-xs font-semibold text-[#2979ff] hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
              >
                + 添加人员
              </button>
            </div>

            {selectedAssignee ? (
              <div className="flex items-center justify-between bg-white border border-blue-200/80 rounded-lg px-3 py-2 shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={selectedAssignee.avatar}
                    alt={selectedAssignee.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-100"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">
                      {selectedAssignee.name}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">
                      {selectedAssignee.department || session.name}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAssignee(null)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                  title="移除"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-xs text-gray-400 py-1">
                请在群内人员中指定任务责任人（点击右上角添加人员）
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!title.trim() || !selectedAssignee}
              className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all shadow-xs ${
                title.trim() && selectedAssignee
                  ? 'bg-[#2979ff] hover:bg-blue-600 text-white cursor-pointer active:scale-[0.99]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              提交
            </button>
          </div>
        </form>

        {/* 群内人员选择子弹窗 (仅群内成员可选) */}
        {isMemberPickerOpen && (
          <div className="absolute inset-0 z-20 bg-white flex flex-col animate-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMemberPickerOpen(false)}
                  className="text-xs text-blue-600 hover:underline cursor-pointer"
                >
                  取消
                </button>
                <h4 className="text-sm font-bold text-gray-800">
                  选择任务处理人 ({groupMembers.length}人)
                </h4>
              </div>
              <span className="text-[11px] text-gray-400">仅本群成员</span>
            </div>

            {/* 群成员搜索 */}
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2.5 py-1.5 text-xs text-gray-700">
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="搜索群内人员姓名或职位..."
                  className="bg-transparent outline-hidden w-full text-xs"
                />
                {memberSearch && (
                  <button
                    type="button"
                    onClick={() => setMemberSearch('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* 群内成员列表 */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 p-2">
              {filteredMembers.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">未找到匹配的群成员</div>
              ) : (
                filteredMembers.map((member) => {
                  const isSelected = selectedAssignee?.id === member.id;
                  return (
                    <div
                      key={member.id}
                      onClick={() => {
                        setSelectedAssignee(member);
                        setIsMemberPickerOpen(false);
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/80' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-gray-900 truncate">
                              {member.name}
                            </span>
                            {member.role === 'owner' && (
                              <span className="text-[10px] bg-amber-100 text-amber-700 px-1 rounded-sm font-medium">
                                群主
                              </span>
                            )}
                            {member.role === 'admin' && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded-sm font-medium">
                                管理员
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate">
                            {member.department || '研发部'}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
