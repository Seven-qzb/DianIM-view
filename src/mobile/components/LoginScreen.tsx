import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Lock, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginScreenProps {
  onLoginSuccess: (phone: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('13812345678');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSendCode = () => {
    if (!phone || phone.trim().length !== 11) {
      setErrorMsg('请输入合规的11位手机号码');
      return;
    }
    setErrorMsg(null);
    setCountdown(60);
    const mockCode = '889966';
    setCode(mockCode);
    showToast(`【点点密信】动态验证码已发送至 ${phone.slice(0, 3)}****${phone.slice(7)}：${mockCode} (已自动填入)`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length !== 11) {
      setErrorMsg('请输入合规的11位手机号码');
      return;
    }
    if (!code || code.trim().length < 4) {
      setErrorMsg('请输入正确的6位动态短信验证码');
      return;
    }
    if (!agreed) {
      setErrorMsg('请勾选并同意《用户协议》和《隐私政策》');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(phone);
    }, 600);
  };

  return (
    <div className="h-full bg-[#F8F9FA] text-slate-900 flex flex-col justify-between px-6 py-8 relative w-full max-w-[430px] mx-auto select-none overflow-y-auto no-scrollbar">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-3 left-4 right-4 z-50 max-w-[390px] mx-auto bg-slate-900 text-white p-3.5 rounded-xl shadow-lg border border-slate-700 flex items-start gap-3"
          >
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed flex-1 font-medium">
              {toastMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Brand Logo Section */}
      <div className="flex-1 flex flex-col justify-center items-center pt-8 pb-6">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center mb-10 text-center"
        >
          {/* DianIM Logo */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-14 h-14 bg-[#0058BD] rounded-2xl p-2.5 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="w-full h-full border-2 border-white/90 rounded-lg flex flex-col justify-between p-1">
                <div className="w-4 h-1 bg-white/90 rounded-full mx-auto mt-0.5"></div>
                <div className="flex justify-center gap-1 mb-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
              </div>
            </div>
            
            <div className="text-left border-l border-slate-200 pl-3.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                点点密信
              </h1>
              <p className="text-xs text-blue-600 font-semibold tracking-wider">
                dianIM.cn
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full text-xs text-[#0058BD] font-medium border border-blue-100">
            <Shield className="w-3.5 h-3.5" />
            <span>加密网络应急指挥通信系统</span>
          </div>
        </motion.div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Phone Number Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              手机号码
            </label>
            <div className="flex items-center bg-white rounded-xl px-4 py-3 border border-slate-200 focus-within:border-[#0058BD] focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-xs">
              <span className="text-sm font-semibold text-slate-700 pr-3 border-r border-slate-200 mr-3">
                +86
              </span>
              <input
                id="phone-input"
                type="tel"
                maxLength={11}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="请输入您的手机号"
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
              />
              {phone.length === 11 && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
            </div>
          </div>

          {/* Verification Code Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              验证码
            </label>
            <div className="flex items-center bg-white rounded-xl px-4 py-2.5 border border-slate-200 focus-within:border-[#0058BD] focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-xs">
              <input
                id="code-input"
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="请输入验证码"
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium tracking-widest"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0}
                className={`text-xs font-semibold shrink-0 px-3 py-1.5 rounded-lg transition-all ${
                  countdown > 0
                    ? 'text-slate-400 bg-slate-100 cursor-not-allowed'
                    : 'text-[#0058BD] hover:bg-blue-50 active:scale-95'
                }`}
              >
                {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
              </button>
            </div>
          </div>

          {/* Error Message banner */}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#0058BD] hover:bg-[#004CB3] active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>立即登录</span>
            )}
          </button>

          {/* User Agreements */}
          <div className="flex items-start gap-2 pt-1 justify-center">
            <input
              id="agreement-checkbox"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-3.5 h-3.5 text-[#0058BD] rounded border-slate-300 focus:ring-[#0058BD] cursor-pointer"
            />
            <label htmlFor="agreement-checkbox" className="text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
              已阅读并同意 点点密信 的{' '}
              <span
                onClick={(e) => {
                  e.preventDefault();
                  setShowAgreementModal(true);
                }}
                className="text-[#0058BD] hover:underline"
              >
                用户协议
              </span>{' '}
              和{' '}
              <span
                onClick={(e) => {
                  e.preventDefault();
                  setShowPrivacyModal(true);
                }}
                className="text-[#0058BD] hover:underline"
              >
                隐私政策
              </span>
            </label>
          </div>
        </form>
      </div>

      {/* Footer Security Cert Note */}
      <div className="text-center text-[11px] text-slate-400 pb-2">
        <p>国密算法 SM2/SM3/SM4 端到端全链路加密保障</p>
      </div>

      {/* Agreement Modal */}
      {showAgreementModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-[360px] w-full p-6 max-h-[80vh] flex flex-col shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">点点密信 用户服务协议</h3>
            <div className="overflow-y-auto text-xs text-slate-600 space-y-3 pr-2 flex-1 leading-relaxed">
              <p>欢迎使用点点密信应急指挥通信平台。本应用为政企及应急系统提供加密通讯、跨部门指令调度及舆情分析服务。</p>
              <p>1. 用户必须通过实名认证并绑定合规机构后方可进入系统。</p>
              <p>2. 通讯全流程采用国家商用密码二级加密算法，保障指令与消息流转的合规性与可追溯性。</p>
              <p>3. 严禁在本平台发送违法涉密违规信息或进行非授权数据导出。</p>
            </div>
            <button
              onClick={() => setShowAgreementModal(false)}
              className="mt-4 w-full py-2.5 bg-[#0058BD] text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
            >
              已阅读并同意
            </button>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-[360px] w-full p-6 max-h-[80vh] flex flex-col shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">点点密信 隐私与安全规范</h3>
            <div className="overflow-y-auto text-xs text-slate-600 space-y-3 pr-2 flex-1 leading-relaxed">
              <p>我们严格保护机构用户与个人身份信息的安全：</p>
              <p>1. 仅在登录及身份核验流程中收集必要的手机号与机构证书。</p>
              <p>2. 会话记录与流转指令在客户端本地与专网服务器均执行高强度加密存储。</p>
              <p>3. 未经主管机构授权，绝不向任何第三方机构提供用户通讯数据。</p>
            </div>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="mt-4 w-full py-2.5 bg-[#0058BD] text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
