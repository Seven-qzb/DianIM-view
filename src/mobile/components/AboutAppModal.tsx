import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AboutAppModalProps {
  onClose: () => void;
}

export const AboutAppModal: React.FC<AboutAppModalProps> = ({ onClose }) => {
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

  const handleCheckUpdate = () => {
    triggerToast('当前已是最新版本 V1.0.1.0003');
  };

  const handlePrivacyPolicy = () => {
    triggerToast('已加载《点点密信隐私政策》');
  };

  const handleUserAgreement = () => {
    triggerToast('已加载《点点密信用户协议》');
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#F4F6F9] text-slate-900 flex flex-col max-w-[430px] w-full mx-auto overflow-hidden select-none font-sans">
      {/* Toast Notice */}
      <AnimatePresence>
        {toastNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 z-60 max-w-[370px] mx-auto bg-slate-900/95 text-white py-2.5 px-4 rounded-xl shadow-xl flex items-center justify-between text-xs font-medium backdrop-blur-xs"
          >
            <span>{toastNotice}</span>
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-12 bg-[#F4F6F9] px-3 flex items-center justify-between sticky top-0 z-30">
        <button
          id="back-to-profile-from-about-btn"
          onClick={onClose}
          className="p-1.5 -ml-1 text-slate-800 hover:bg-slate-200/60 rounded-full transition-colors active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
        <h1 className="font-bold text-[17px] text-slate-900 tracking-tight">
          关于点点密信
        </h1>
        <div className="w-8" />
      </header>

      {/* About Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Single Group */}
        <div className="bg-white border-t border-b border-slate-100/90">
          {/* Row 1: 当前版本 V1.0.1.0003 */}
          <button
            id="check-update-btn"
            type="button"
            onClick={handleCheckUpdate}
            className="w-full h-[54px] px-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
          >
            <span className="text-[15px] text-slate-900 font-normal">
              当前版本 V1.0.1.0003
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[14px] text-slate-400 font-normal">
                检查更新
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 stroke-[1.8]" />
            </div>
          </button>

          <div className="border-b border-[#F0F0F0] ml-4" />

          {/* Row 2: 隐私政策 */}
          <button
            id="privacy-policy-btn"
            type="button"
            onClick={handlePrivacyPolicy}
            className="w-full h-[54px] px-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
          >
            <span className="text-[15px] text-slate-900 font-normal">
              隐私政策
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 stroke-[1.8]" />
          </button>

          <div className="border-b border-[#F0F0F0] ml-4" />

          {/* Row 3: 用户协议 */}
          <button
            id="user-agreement-btn"
            type="button"
            onClick={handleUserAgreement}
            className="w-full h-[54px] px-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
          >
            <span className="text-[15px] text-slate-900 font-normal">
              用户协议
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 stroke-[1.8]" />
          </button>
        </div>
      </div>
    </div>
  );
};
