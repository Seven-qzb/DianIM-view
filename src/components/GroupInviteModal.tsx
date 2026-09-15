import React, { useState } from 'react';
import { X, Check, Copy } from 'lucide-react';
import { ChatSession } from '../types/chat';
import { GroupAvatar } from './GroupAvatar';

interface GroupInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession;
  onCopySuccess?: (msg: string) => void;
}

export const GroupInviteModal: React.FC<GroupInviteModalProps> = ({
  isOpen,
  onClose,
  session,
  onCopySuccess,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate deterministic invite key based on group session id
  const groupCode = `GRP${session.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase() || '5ED9N3XB'}`;
  const inviteLink = `https://dianim.cn/zzh5/groupCode?key=${groupCode}`;

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteLink);
      }
      setCopied(true);
      if (onCopySuccess) {
        onCopySuccess('邀请链接已复制到剪贴板 📋');
      }
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      id="group-invite-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="group-invite-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col relative animate-in zoom-in-95 duration-200 border border-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">群组邀请</h2>
          <button
            id="btn-close-invite-modal"
            onClick={onClose}
            className="w-7 h-7 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Group Header Info */}
        <div className="flex items-center gap-3.5 my-2">
          <GroupAvatar session={session} size="lg" className="rounded-xl shadow-xs" />
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-gray-400 font-normal leading-tight">群聊名称</span>
            <span className="text-sm font-bold text-gray-900 truncate mt-0.5">
              {session.name}
            </span>
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="border-t border-dashed border-gray-200 my-3" />

        {/* Section 1: 二维码邀请 */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-1 h-3.5 bg-[#2979ff] rounded-full" />
            <span className="text-xs font-bold text-gray-900">二维码邀请</span>
          </div>

          {/* QR Code Graphic Box */}
          <div className="flex justify-center">
            <div className="relative p-3.5 bg-white border border-gray-200/90 rounded-2xl shadow-xs flex items-center justify-center">
              {/* QR Code Grid SVG */}
              <svg
                width="160"
                height="160"
                viewBox="0 0 160 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-40 h-40"
              >
                {/* Background */}
                <rect width="160" height="160" fill="white" rx="8" />

                {/* Top-Left Position Detection Pattern */}
                <rect x="12" y="12" width="40" height="40" rx="4" fill="#1e293b" />
                <rect x="18" y="18" width="28" height="28" rx="2" fill="white" />
                <rect x="24" y="24" width="16" height="16" rx="2" fill="#1e293b" />

                {/* Top-Right Position Detection Pattern */}
                <rect x="108" y="12" width="40" height="40" rx="4" fill="#1e293b" />
                <rect x="114" y="18" width="28" height="28" rx="2" fill="white" />
                <rect x="120" y="24" width="16" height="16" rx="2" fill="#1e293b" />

                {/* Bottom-Left Position Detection Pattern */}
                <rect x="12" y="108" width="40" height="40" rx="4" fill="#1e293b" />
                <rect x="18" y="114" width="28" height="28" rx="2" fill="white" />
                <rect x="24" y="120" width="16" height="16" rx="2" fill="#1e293b" />

                {/* Timing patterns & Data modules */}
                <g fill="#1e293b">
                  {/* Top area */}
                  <rect x="58" y="14" width="6" height="6" rx="1" />
                  <rect x="70" y="14" width="6" height="6" rx="1" />
                  <rect x="82" y="14" width="6" height="6" rx="1" />
                  <rect x="94" y="14" width="6" height="6" rx="1" />

                  <rect x="58" y="26" width="6" height="6" rx="1" />
                  <rect x="82" y="26" width="6" height="6" rx="1" />
                  <rect x="94" y="26" width="6" height="6" rx="1" />

                  <rect x="58" y="38" width="6" height="6" rx="1" />
                  <rect x="70" y="38" width="6" height="6" rx="1" />
                  <rect x="94" y="38" width="6" height="6" rx="1" />

                  <rect x="14" y="58" width="6" height="6" rx="1" />
                  <rect x="26" y="58" width="6" height="6" rx="1" />
                  <rect x="38" y="58" width="6" height="6" rx="1" />
                  <rect x="50" y="58" width="6" height="6" rx="1" />
                  <rect x="62" y="58" width="6" height="6" rx="1" />
                  <rect x="74" y="58" width="6" height="6" rx="1" />
                  <rect x="86" y="58" width="6" height="6" rx="1" />
                  <rect x="98" y="58" width="6" height="6" rx="1" />
                  <rect x="110" y="58" width="6" height="6" rx="1" />
                  <rect x="122" y="58" width="6" height="6" rx="1" />
                  <rect x="134" y="58" width="6" height="6" rx="1" />

                  <rect x="14" y="70" width="6" height="6" rx="1" />
                  <rect x="38" y="70" width="6" height="6" rx="1" />
                  <rect x="110" y="70" width="6" height="6" rx="1" />
                  <rect x="134" y="70" width="6" height="6" rx="1" />

                  <rect x="14" y="82" width="6" height="6" rx="1" />
                  <rect x="26" y="82" width="6" height="6" rx="1" />
                  <rect x="50" y="82" width="6" height="6" rx="1" />
                  <rect x="110" y="82" width="6" height="6" rx="1" />
                  <rect x="122" y="82" width="6" height="6" rx="1" />
                  <rect x="134" y="82" width="6" height="6" rx="1" />

                  <rect x="14" y="94" width="6" height="6" rx="1" />
                  <rect x="38" y="94" width="6" height="6" rx="1" />
                  <rect x="50" y="94" width="6" height="6" rx="1" />
                  <rect x="98" y="94" width="6" height="6" rx="1" />
                  <rect x="122" y="94" width="6" height="6" rx="1" />

                  {/* Bottom area */}
                  <rect x="58" y="108" width="6" height="6" rx="1" />
                  <rect x="70" y="108" width="6" height="6" rx="1" />
                  <rect x="94" y="108" width="6" height="6" rx="1" />
                  <rect x="106" y="108" width="6" height="6" rx="1" />
                  <rect x="118" y="108" width="6" height="6" rx="1" />
                  <rect x="130" y="108" width="6" height="6" rx="1" />

                  <rect x="58" y="120" width="6" height="6" rx="1" />
                  <rect x="82" y="120" width="6" height="6" rx="1" />
                  <rect x="94" y="120" width="6" height="6" rx="1" />
                  <rect x="118" y="120" width="6" height="6" rx="1" />
                  <rect x="130" y="120" width="6" height="6" rx="1" />

                  <rect x="58" y="132" width="6" height="6" rx="1" />
                  <rect x="70" y="132" width="6" height="6" rx="1" />
                  <rect x="82" y="132" width="6" height="6" rx="1" />
                  <rect x="106" y="132" width="6" height="6" rx="1" />
                  <rect x="130" y="132" width="6" height="6" rx="1" />
                </g>
              </svg>

              {/* Center "KN" Logo Badge */}
              <div className="absolute inset-0 m-auto w-9 h-9 bg-[#2979ff] rounded-lg border-2 border-white flex items-center justify-center shadow-xs select-none">
                <span className="text-white text-xs font-black tracking-tighter font-sans">
                  KN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: 链接邀请 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-3.5 bg-[#2979ff] rounded-full" />
              <span className="text-xs font-bold text-gray-900">链接邀请</span>
            </div>
            <button
              id="btn-copy-invite-link"
              onClick={handleCopyLink}
              className="text-xs text-[#2979ff] hover:text-[#1e6bf0] font-medium flex items-center gap-1 transition-colors cursor-pointer select-none"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>复制链接</span>
                </>
              )}
            </button>
          </div>

          {/* Link Box */}
          <div
            onClick={handleCopyLink}
            className="w-full bg-[#f4f6f8] hover:bg-[#eef2f6] border border-gray-200/70 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 font-mono break-all cursor-pointer transition-colors leading-relaxed select-all"
            title="点击复制链接"
          >
            {inviteLink}
          </div>
        </div>
      </div>
    </div>
  );
};
