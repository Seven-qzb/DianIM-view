/**
 * [MiniProgramShareModal]
 * 小程序转发给朋友 / 分享到聊天面板
 */

import React, { useState } from 'react';
import { X, Search, Check, Send, Link, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MiniProgramShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmShare: (targetName: string) => void;
}

export const MiniProgramShareModal: React.FC<MiniProgramShareModalProps> = ({
  isOpen,
  onClose,
  onConfirmShare,
}) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>(['史乐乐']);
  const [shareText, setShareText] = useState('这是点点密信国密企业小程序，请点击进入协同沟通。');
  const [copied, setCopied] = useState(false);

  const mockContacts = [
    { name: '史乐乐', dept: '研发架构师', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
    { name: '马言言', dept: '产品经理', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' },
    { name: '何坤', dept: '安全专家', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    { name: '马宸卓', dept: '前端技术骨干', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    { name: '网络应急防线突击组', dept: '17人加密群聊', isGroup: true, avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100' },
  ];

  const handleCopyLink = () => {
    navigator.clipboard?.writeText('https://dianim.internal.sec/mp?entry=share');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    onConfirmShare(selectedContacts.join('、'));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 select-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="relative w-full max-w-[340px] bg-white rounded-2xl p-5 shadow-2xl z-10 border border-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>转发小程序卡片</span>
              </h3>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Share Card Preview */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-3 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-[#28211b] text-white flex items-center justify-center text-xs font-bold">
                  点
                </div>
                <span className="text-xs font-bold text-slate-800">点点密信</span>
                <span className="text-[10px] text-slate-400">小程序</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {shareText}
              </p>
            </div>

            {/* Target Select */}
            <div className="text-left mb-3">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                选择发送对象
              </span>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto no-scrollbar">
                {mockContacts.map((contact) => {
                  const isSelected = selectedContacts.includes(contact.name);
                  return (
                    <div
                      key={contact.name}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedContacts(selectedContacts.filter((c) => c !== contact.name));
                        } else {
                          setSelectedContacts([...selectedContacts, contact.name]);
                        }
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-800">
                            {contact.name}
                          </span>
                          <span className="text-[10px] text-slate-400">{contact.dept}</span>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Link className="w-3.5 h-3.5" />
                <span>{copied ? '已复制' : '复制链接'}</span>
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={selectedContacts.length === 0}
                className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                发送 ({selectedContacts.length})
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
