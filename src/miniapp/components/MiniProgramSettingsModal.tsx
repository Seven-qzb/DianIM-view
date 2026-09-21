/**
 * [MiniProgramSettingsModal]
 * 小程序系统权限与偏好设置面板
 */

import React, { useState } from 'react';
import { X, Mic, Camera, Bell, MapPin, Database, Check, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MiniProgramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MiniProgramSettingsModal: React.FC<MiniProgramSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [micPerm, setMicPerm] = useState(true);
  const [camPerm, setCamPerm] = useState(true);
  const [notifPerm, setNotifPerm] = useState(true);
  const [locPerm, setLocPerm] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
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
            className="relative w-full max-w-[340px] bg-white rounded-2xl p-5 shadow-2xl z-10 border border-slate-200 text-left"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                <h3 className="font-bold text-sm text-slate-900">小程序权限与设置</h3>
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              管理「点点密信」小程序在当前微信客户端下的硬件调用授权与运行环境
            </p>

            <div className="space-y-2.5 mb-4">
              {/* Mic */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800">麦克风对讲录音</span>
                    <span className="text-[10px] text-slate-400">支持语音消息录制与变声</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMicPerm(!micPerm)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    micPerm ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      micPerm ? 'left-[18px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Camera */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800">摄像头与相册取证</span>
                    <span className="text-[10px] text-slate-400">现场拍照存证与扫一扫</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCamPerm(!camPerm)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    camPerm ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      camPerm ? 'left-[18px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800">指令流转与待办推送</span>
                    <span className="text-[10px] text-slate-400">接收即时加密消息提醒</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifPerm(!notifPerm)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    notifPerm ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      notifPerm ? 'left-[18px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Cache Clear */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800">小程序本地存储</span>
                    <span className="text-[10px] text-slate-400">已使用 12.4 KB 缓存</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-medium cursor-pointer transition-colors"
                >
                  {cacheCleared ? '已清理' : '清理缓存'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              完成设置
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
