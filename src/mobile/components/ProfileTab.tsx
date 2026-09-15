import React, { useState, useRef } from 'react';
import { UserProfile, Institution } from '../types';
import { 
  Settings, Info, ChevronRight, Calendar, ArrowLeftRight, 
  Phone, Check, LogOut, Camera, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GeneralSettingsModal } from './GeneralSettingsModal';
import { AboutAppModal } from './AboutAppModal';

interface ProfileTabProps {
  user: UserProfile;
  institutions: Institution[];
  onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
  onSwitchInstitution: () => void;
  onLogout: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  institutions,
  onUpdateUser,
  onSwitchInstitution,
  onLogout,
}) => {
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateUser({ avatar: reader.result });
          triggerToast('头像修改成功');
          setShowAvatarModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-gradient-to-b from-[#EAF3FF] via-[#F4F8FE] to-[#F3F7FC] text-slate-900 select-none font-sans w-full max-w-[430px] mx-auto relative justify-between no-scrollbar">
      {/* Toast Notice */}
      <AnimatePresence>
        {toastNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-3 left-4 right-4 z-50 max-w-[390px] mx-auto bg-slate-900 text-white p-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-medium"
          >
            <span>{toastNotice}</span>
            <Check className="w-4 h-4 text-emerald-400" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Background Watermark */}
      <div className="absolute top-10 right-4 text-blue-200/30 text-5xl font-extrabold tracking-widest pointer-events-none select-none">
        JOIN
      </div>

      {/* Top Header */}
      <header className="pt-4 pb-2 px-4 flex items-center justify-center relative z-10">
        <h1 className="font-bold text-lg text-slate-900 tracking-tight">
          我的
        </h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 flex flex-col justify-between pt-1 pb-4 relative z-10">
        <div className="space-y-3.5">
          {/* User Profile Main Card */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100/90">
            {/* Upper User Info Row */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <h2 className="font-bold text-xl text-slate-900 mb-3 tracking-tight truncate">
                  {user.name}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                  <span className="font-bold text-slate-900">IP</span>
                  <span className="text-slate-500">124.89.90.2...</span>
                  <span className="text-slate-300">|</span>
                  <Phone className="w-3 h-3 text-slate-500 shrink-0 inline-block -mt-0.5" />
                  <span className="text-slate-500">
                    {user.phone ? `${user.phone.slice(0, 3)}****${user.phone.slice(7)}` : '156****7630'}
                  </span>
                </div>
              </div>

              {/* Right Avatar & Change Button */}
              <div className="flex flex-col items-center shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="mt-1.5 text-[11px] font-normal text-[#1677FF] bg-[#EDF4FF] hover:bg-blue-100 px-3 py-0.5 rounded-full transition-colors active:scale-95 cursor-pointer"
                >
                  修改头像
                </button>
              </div>
            </div>

            {/* Light Blue Institution Box */}
            <div className="bg-[#E5EFFF] rounded-xl p-3.5 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 truncate pr-2">
                  {user.institutionName}
                </span>
                <button
                  type="button"
                  onClick={onSwitchInstitution}
                  className="bg-[#1677FF] hover:bg-[#005FE6] text-white text-xs font-normal px-3 py-1 rounded-md flex items-center gap-1 shrink-0 shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>切换机构</span>
                </button>
              </div>

              <div className="mt-2.5">
                <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-xs text-slate-500 text-xs px-2.5 py-1 rounded-full border border-blue-100/50">
                  <Calendar className="w-3.5 h-3.5 text-[#1677FF]" />
                  <span>服务期限：{user.certExpireDate || '2026-09-20'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items Card */}
          <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden">
            {/* 1. 通用设置 */}
            <button
              type="button"
              onClick={() => setShowGeneralSettings(true)}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-slate-700 stroke-[1.8]" />
                <span className="text-sm font-normal text-slate-900">
                  通用设置
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <div className="border-b border-slate-100 mx-4" />

            {/* 2. 关于点点密信 */}
            <button
              type="button"
              onClick={() => setShowAboutModal(true)}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-slate-700 stroke-[1.8]" />
                <span className="text-sm font-normal text-slate-900">
                  关于点点密信
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Bottom Logout Button */}
        <div className="pt-6">
          <button
            id="logout-btn"
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3 rounded-full border border-[#EF4444] text-[#EF4444] bg-white hover:bg-red-50 text-base font-normal flex items-center justify-center transition-colors shadow-2xs active:scale-98 cursor-pointer"
          >
            退出登录
          </button>
        </div>
      </main>

      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      {/* Avatar Change Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-3xl sm:rounded-2xl max-w-[430px] w-full p-5 shadow-xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  更换个人头像
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-2 font-medium">从相册上传或拍照</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-[#1677FF] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-blue-200/60"
                  >
                    <Camera className="w-4 h-4" />
                    <span>上传自定义照片</span>
                  </button>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-2 font-medium">推荐官方预设头像</p>
                  <div className="grid grid-cols-4 gap-2.5">
                    {presetAvatars.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          onUpdateUser({ avatar: url });
                          triggerToast('头像已更新');
                          setShowAvatarModal(false);
                        }}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-transform active:scale-95 ${
                          user.avatar === url ? 'border-[#1677FF]' : 'border-slate-200'
                        }`}
                      >
                        <img src={url} alt="Preset" className="w-full h-full object-cover" />
                        {user.avatar === url && (
                          <div className="absolute inset-0 bg-[#1677FF]/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* General Settings Modal */}
      <AnimatePresence>
        {showGeneralSettings && (
          <GeneralSettingsModal onClose={() => setShowGeneralSettings(false)} />
        )}
      </AnimatePresence>

      {/* About DianDian Modal */}
      <AnimatePresence>
        {showAboutModal && (
          <AboutAppModal onClose={() => setShowAboutModal(false)} />
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-[320px] w-full p-5 text-center shadow-xl border border-slate-200"
            >
              <LogOut className="w-9 h-9 text-[#EF4444] mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">确定退出登录？</h4>
              <p className="text-xs text-slate-500 mb-4">退出后将返回点点密信登录首页，需重新验证身份。</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="flex-1 py-2 bg-[#EF4444] hover:bg-red-600 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  确认退出
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

