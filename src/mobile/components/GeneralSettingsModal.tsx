import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GeneralSettingsModalProps {
  onClose: () => void;
}

export const GeneralSettingsModal: React.FC<GeneralSettingsModalProps> = ({ onClose }) => {
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [soundAlert, setSoundAlert] = useState(true);
  const [bannerOption, setBannerOption] = useState('仅显示[你收到了1条消息]');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

  const handleClearCache = () => {
    triggerToast('已清理缓存 0.0 MB');
  };

  const handleStorageCheck = () => {
    triggerToast('点点密信已用存储空间：24.8 MB');
  };

  const handleToggleBanner = () => {
    if (bannerOption === '仅显示[你收到了1条消息]') {
      setBannerOption('显示发送人及消息摘要');
      triggerToast('横幅显示已切换为：显示发送人及消息摘要');
    } else {
      setBannerOption('仅显示[你收到了1条消息]');
      triggerToast('横幅显示已切换为：仅显示[你收到了1条消息]');
    }
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
          id="back-to-profile-from-settings-btn"
          onClick={onClose}
          className="p-1.5 -ml-1 text-slate-800 hover:bg-slate-200/60 rounded-full transition-colors active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
        <h1 className="font-bold text-[17px] text-slate-900 tracking-tight">
          通用设置
        </h1>
        <div className="w-8" />
      </header>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Group 1 */}
        <div className="bg-white border-t border-b border-slate-100/90">
          {/* Row 1: 接收消息通知 */}
          <div className="h-[54px] px-4 flex items-center justify-between">
            <span className="text-[15px] text-slate-900 font-normal">
              接收消息通知
            </span>
            <button
              id="toggle-notifications-btn"
              type="button"
              role="switch"
              aria-checked={allowNotifications}
              onClick={() => {
                const next = !allowNotifications;
                setAllowNotifications(next);
                triggerToast(next ? '已开启接收消息通知' : '已关闭接收消息通知');
              }}
              className={`relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                allowNotifications ? 'bg-[#2E75E6]' : 'bg-[#E5E5EA]'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  allowNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="border-b border-[#F0F0F0] ml-4" />

          {/* Row 2: 横幅显示选择 */}
          <button
            id="banner-display-option-btn"
            type="button"
            onClick={handleToggleBanner}
            className="w-full h-[54px] px-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
          >
            <span className="text-[15px] text-slate-900 font-normal">
              横幅显示选择
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[14px] text-slate-400 font-normal">
                {bannerOption}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 stroke-[1.8]" />
            </div>
          </button>

          <div className="border-b border-[#F0F0F0] ml-4" />

          {/* Row 3: 消息提示音 */}
          <div className="h-[54px] px-4 flex items-center justify-between">
            <span className="text-[15px] text-slate-900 font-normal">
              消息提示音
            </span>
            <button
              id="toggle-sound-alert-btn"
              type="button"
              role="switch"
              aria-checked={soundAlert}
              onClick={() => {
                const next = !soundAlert;
                setSoundAlert(next);
                triggerToast(next ? '已开启消息提示音' : '已关闭消息提示音');
              }}
              className={`relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                soundAlert ? 'bg-[#2E75E6]' : 'bg-[#E5E5EA]'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  soundAlert ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section Gap */}
        <div className="h-3" />

        {/* Group 2 */}
        <div className="bg-white border-t border-b border-slate-100/90">
          {/* Row 1: 清除缓存 */}
          <button
            id="clear-cache-btn"
            type="button"
            onClick={handleClearCache}
            className="w-full h-[54px] px-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
          >
            <span className="text-[15px] text-slate-900 font-normal">
              清除缓存
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 stroke-[1.8]" />
          </button>

          <div className="border-b border-[#F0F0F0] ml-4" />

          {/* Row 2: 存储空间 */}
          <button
            id="storage-space-btn"
            type="button"
            onClick={handleStorageCheck}
            className="w-full h-[54px] px-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
          >
            <span className="text-[15px] text-slate-900 font-normal">
              存储空间
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 stroke-[1.8]" />
          </button>
        </div>
      </div>
    </div>
  );
};
