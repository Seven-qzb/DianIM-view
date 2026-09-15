import React, { useState, useEffect } from 'react';
import {
  X,
  Link2,
  CheckCircle2,
  Shield,
  Users,
  AlertCircle,
  Sparkles,
  Send,
  Lock,
  Check,
} from 'lucide-react';
import { ChatSession } from '../types/chat';

interface JoinGroupByLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableSessions: ChatSession[];
  onJoinSession: (sessionId: string) => void;
}

export const JoinGroupByLinkModal: React.FC<JoinGroupByLinkModalProps> = ({
  isOpen,
  onClose,
  availableSessions,
  onJoinSession,
}) => {
  const [linkInput, setLinkInput] = useState('');
  const [parsedSession, setParsedSession] = useState<ChatSession | null>(null);
  const [needApproval, setNeedApproval] = useState<boolean>(false);
  const [applyReason, setApplyReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [step, setStep] = useState<'input' | 'approval_form' | 'applied_success' | 'joined_success'>('input');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLinkInput('https://dianim.cn/zzh5/groupCode?key=GRP5ED9N3XB&sec=sm4');
      const defaultGroup = availableSessions.find((s) => s.id === 'session_rd_test222') || availableSessions[0];
      setParsedSession(defaultGroup || null);
      setNeedApproval(false);
      setApplyReason('');
      setErrorMsg('');
      setStep('input');
    }
  }, [isOpen, availableSessions]);

  if (!isOpen) return null;

  const handleParseLink = (input: string) => {
    setLinkInput(input);
    setErrorMsg('');

    if (!input.trim()) {
      setParsedSession(null);
      return;
    }

    const clean = input.trim();
    let target: ChatSession | undefined;
    let requiresApproval = false;

    if (clean.includes('SZ_EMERGENCY') || clean.includes('涉深') || clean.includes('应急') || clean.includes('audit')) {
      target = availableSessions.find((s) => s.id === 'session_sz_hot') || availableSessions[0];
      requiresApproval = true;
    } else if (clean.includes('GRP5ED9N3XB') || clean.includes('222') || clean.includes('rd_test222') || clean.includes('研发测试')) {
      target = availableSessions.find((s) => s.id === 'session_rd_test222') || availableSessions[0];
      requiresApproval = false;
    } else if (clean.includes('xinmeng') || clean.includes('芯梦')) {
      target = availableSessions.find((s) => s.id === 'session_xinmeng') || availableSessions[0];
      requiresApproval = false;
    } else if (clean.includes('rd_product') || clean.includes('产品沟通')) {
      target = availableSessions.find((s) => s.id === 'session_rd_product') || availableSessions[0];
      requiresApproval = true;
    } else {
      // Find matching session by name or id, or fallback
      target = availableSessions.find((s) => s.name.toLowerCase().includes(clean.toLowerCase()) || s.id === clean);
      if (!target) {
        target = availableSessions.find((s) => s.isGroup) || availableSessions[0];
      }
      requiresApproval = false;
    }

    if (target) {
      setParsedSession(target);
      setNeedApproval(requiresApproval);
    } else {
      setErrorMsg('未能识别该邀请链接或该群组已失效');
    }
  };

  const handleImmediateJoin = () => {
    if (!parsedSession) {
      if (!linkInput.trim()) {
        setErrorMsg('请先粘贴群组邀请链接');
        return;
      }
      handleParseLink(linkInput);
      return;
    }

    // Branch 1: If requires approval -> Show approval form step with group avatar and group name
    if (needApproval) {
      setStep('approval_form');
      return;
    }

    // Branch 2: If no approval needed -> Automatically enter the group and start chatting
    setStep('joined_success');
    setTimeout(() => {
      onJoinSession(parsedSession.id);
      onClose();
    }, 800);
  };

  const handleSubmitApplication = () => {
    if (!applyReason.trim()) {
      setErrorMsg('请填写申请理由');
      return;
    }
    setStep('applied_success');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div
      id="join-group-by-link-overlay"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="join-group-by-link-dialog"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching requested text */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-snug">链接解析进群</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {step === 'input' && (
          <div className="p-5 space-y-3.5 text-xs">
            {/* Quick paste sample options */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 font-medium">粘贴群组邀请链接：</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleParseLink('https://dianim.cn/zzh5/groupCode?key=GRP5ED9N3XB&sec=sm4');
                  }}
                  className="text-[#2979ff] hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                  title="自动直接进群"
                >
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  <span>无需审批示例</span>
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => {
                    handleParseLink('https://dianim.cn/zzh5/groupCode?key=SZ_EMERGENCY_AUDIT&type=secure');
                  }}
                  className="text-amber-600 hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                  title="需要管理员审批"
                >
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>需审批示例</span>
                </button>
              </div>
            </div>

            {/* Input textarea */}
            <div className="relative">
              <textarea
                rows={2}
                placeholder="请输入或粘贴群组邀请链接，例如：https://dianim.cn/zzh5/groupCode?key=..."
                value={linkInput}
                onChange={(e) => handleParseLink(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:border-[#2979ff] focus:bg-white resize-none font-mono transition-colors"
              />
            </div>

            {/* Error notice */}
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Parsed Group Card Preview */}
            {parsedSession && (
              <div className="p-3.5 bg-[#f4f8fe] border border-blue-200/80 rounded-2xl flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-blue-600">
                    <Shield className="w-3.5 h-3.5" />
                    已识别有效群组
                  </span>
                  <div className="flex items-center gap-1.5">
                    {/* Toggle to let user easily test both branches */}
                    <button
                      type="button"
                      onClick={() => setNeedApproval(!needApproval)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
                        needApproval
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {needApproval ? '🔒 该群需审批' : '⚡ 免审批自动进群'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={parsedSession.avatar}
                    alt={parsedSession.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">
                      {parsedSession.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 text-[11px] mt-0.5">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        {parsedSession.memberCount || parsedSession.members?.length || 1} 人
                      </span>
                      <span>·</span>
                      <span className="text-emerald-600 font-medium">
                        在线 {parsedSession.onlineCount || 2} 人
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 bg-white/80 p-2 rounded-lg border border-blue-100/60 leading-relaxed truncate">
                  群公告：{parsedSession.announcement || '欢迎加入群聊，群内已开启密信加密流转。'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step: Need Approval -> Reason Form */}
        {step === 'approval_form' && parsedSession && (
          <div className="p-5 space-y-4 text-xs animate-in fade-in duration-150">
            {/* Group Header info */}
            <div className="flex items-center gap-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
              <img
                src={parsedSession.avatar}
                alt={parsedSession.name}
                className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-gray-900 text-sm truncate">
                    {parsedSession.name}
                  </h3>
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0">
                    需审批
                  </span>
                </div>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  该群组已开启进群验证，需管理员审核通过后方可入群
                </p>
              </div>
            </div>

            {/* Application Reason textarea */}
            <div className="space-y-1.5">
              <label className="text-gray-700 font-medium flex items-center justify-between text-xs">
                <span>申请理由：</span>
                <span className="text-[10px] text-gray-400 font-normal">必填</span>
              </label>
              <textarea
                rows={3}
                placeholder="请输入申请理由，如：我是研发部工程师，申请加入项目讨论..."
                value={applyReason}
                onChange={(e) => {
                  setApplyReason(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:border-[#2979ff] focus:bg-white resize-none"
              />
            </div>

            {errorMsg && (
              <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Step: Applied Success Notice */}
        {step === 'applied_success' && parsedSession && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900">入群申请已提交</h3>
              <p className="text-xs text-gray-500 max-w-xs">
                已向「{parsedSession.name}」群主及管理员发送申请，审核通过后系统将自动为您开启群聊。
              </p>
            </div>
          </div>
        )}

        {/* Step: Direct Joined Success Notice */}
        {step === 'joined_success' && parsedSession && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95">
            <img
              src={parsedSession.avatar}
              alt={parsedSession.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-md animate-pulse"
            />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>已成功加入「{parsedSession.name}」</span>
              </h3>
              <p className="text-xs text-gray-500">正在为您打开群聊窗口...</p>
            </div>
          </div>
        )}

        {/* Footer: Bottom buttons (取消 and 立即加入群组 / 提交申请) */}
        {step === 'input' && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-end gap-2">
            <button
              id="btn-cancel-join-by-link"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-200/60 rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              id="btn-confirm-join-by-link"
              onClick={handleImmediateJoin}
              disabled={!parsedSession}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                parsedSession
                  ? 'bg-[#2979ff] hover:bg-[#1e6bf0] text-white shadow-xs cursor-pointer active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>立即加入群组</span>
            </button>
          </div>
        )}

        {step === 'approval_form' && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setStep('input');
                setErrorMsg('');
              }}
              className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-200/60 rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              id="btn-submit-group-application"
              onClick={handleSubmitApplication}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-[#2979ff] hover:bg-[#1e6bf0] text-white shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>提交申请</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
