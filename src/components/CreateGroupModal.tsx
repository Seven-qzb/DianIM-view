import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupName: string) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setGroupName('');
      setErrorMsg('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length <= 15) {
      setGroupName(val);
      if (errorMsg) setErrorMsg('');
    }
  };

  const handleConfirm = () => {
    const trimmed = groupName.trim();
    if (!trimmed) {
      setErrorMsg('群组名称不能为空');
      inputRef.current?.focus();
      return;
    }
    if (trimmed.length > 15) {
      setErrorMsg('群组名称不可超过15个字符');
      return;
    }
    onCreateGroup(trimmed);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      id="create-group-modal-overlay"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="create-group-modal-dialog"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden border border-gray-100/80 animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 leading-none">创建群组</h2>
          <button
            id="btn-close-create-group-modal"
            onClick={onClose}
            className="w-7 h-7 -mr-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            title="关闭"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 space-y-2">
          {/* Input Box matching Screenshot */}
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              id="input-create-group-name"
              type="text"
              value={groupName}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              maxLength={15}
              placeholder="请输入不超过15个字符"
              className="w-full bg-white text-gray-900 placeholder-gray-400 text-sm rounded-xl pl-3.5 pr-16 py-2.5 outline-none border border-[#2979ff] shadow-xs focus:ring-2 focus:ring-[#2979ff]/20 transition-all font-normal"
            />
            {/* Character counter (0 / 15) */}
            <span className="absolute right-3 text-xs text-gray-400 font-mono pointer-events-none select-none">
              {groupName.length} / 15
            </span>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-500 pl-1">{errorMsg}</p>
          )}
        </div>

        {/* Footer Buttons matching Screenshot */}
        <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-3">
          <button
            id="btn-cancel-create-group"
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 transition-colors cursor-pointer shadow-2xs active:scale-95"
          >
            取消
          </button>
          <button
            id="btn-confirm-create-group"
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2 rounded-xl text-sm font-medium text-white bg-[#2979ff] hover:bg-[#1e6bf0] transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
};
