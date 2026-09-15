import React, { useState } from 'react';
import {
  User,
  Settings,
  Info,
  ChevronRight,
  Minus,
  Square,
  X,
  CheckCircle2,
  FolderOpen,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Copy,
  ExternalLink,
  Lock,
  FileText,
  Radio,
} from 'lucide-react';
import { CURRENT_USER } from '../data/mockData';

export const SettingsView: React.FC = () => {
  const [cacheSize, setCacheSize] = useState<number>(112);
  const [isCleaningCache, setIsCleaningCache] = useState(false);
  const [filePath, setFilePath] = useState('D:\\点点密信\\点点密信\\cacheFiles\\prod\\user_276');
  
  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFilePathModalOpen, setIsFilePathModalOpen] = useState(false);
  const [isCheckUpdateModalOpen, setIsCheckUpdateModalOpen] = useState(false);
  const [isUserAgreementOpen, setIsUserAgreementOpen] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Profile Form
  const [profileData, setProfileData] = useState({
    name: CURRENT_USER.name,
    department: CURRENT_USER.department || '台湾省网信办',
    role: '涉密安全核心主管',
    phone: CURRENT_USER.phone || '138****7630',
    email: CURRENT_USER.email || 'qzb@knwl.cn',
    jobNumber: 'KN-7630',
    securityLevel: '绝密 (Top Secret - SM4)',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Clean Cache action
  const handleCleanCache = () => {
    if (cacheSize === 0) {
      showToast('缓存已经是最轻量状态，无需重复清理');
      return;
    }
    setIsCleaningCache(true);
    setTimeout(() => {
      setCacheSize(0);
      setIsCleaningCache(false);
      showToast('缓存清理成功！已释放 112 MB 磁盘空间');
    }, 1200);
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full select-none overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-xs transition-all animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Top Window Bar: Title & Desktop Window Controls */}
      <div className="px-6 pt-4 pb-4 flex items-center justify-between bg-white border-b border-gray-100/60">
        <h1 className="text-base font-bold text-gray-900 tracking-tight">系统设置</h1>

        {/* Windows Desktop Style Window Buttons */}
        <div className="flex items-center gap-1 text-gray-500">
          <button
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            title="最小化"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            title="最大化"
          >
            <Square className="w-3 h-3 stroke-[2]" />
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
            title="关闭"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Settings List Content Matching Screenshot 2 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
        <div className="max-w-5xl space-y-6">
          
          {/* Group 1: 账号信息 */}
          <div className="space-y-1">
            {/* Section Header */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-normal pb-1">
              <User className="w-3.5 h-3.5" />
              <span>账号信息</span>
            </div>

            {/* Item 1: 个人中心 */}
            <div
              id="settings-item-profile-center"
              className="flex items-center justify-between py-3 border-b border-gray-100 rounded-lg px-2 -mx-2 transition-colors cursor-default select-text"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">
                  个人中心
                </div>
                <div className="text-xs text-gray-400 mt-0.5 font-normal">
                  查看和编辑个人资料
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </div>
          </div>

          {/* Group 2: 通用设置 */}
          <div className="space-y-1">
            {/* Section Header */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-normal pb-1">
              <Settings className="w-3.5 h-3.5" />
              <span>通用设置</span>
            </div>

            {/* Item 2: 文件存储位置 */}
            <div
              id="settings-item-file-storage"
              className="flex items-center justify-between py-3 border-b border-gray-100 rounded-lg px-2 -mx-2 transition-colors cursor-default select-text"
            >
              <div className="min-w-0 pr-4">
                <div className="text-sm font-medium text-gray-900">
                  文件存储位置
                </div>
                <div className="text-xs text-gray-400 mt-0.5 font-normal truncate">
                  {filePath}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </div>

            {/* Item 3: 清理缓存 */}
            <div
              id="settings-item-clean-cache"
              className="flex items-center justify-between py-3 border-b border-gray-100 rounded-lg px-2 -mx-2 transition-colors cursor-default select-text"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">
                  清理缓存
                </div>
                <div className="text-xs text-gray-400 mt-0.5 font-normal">
                  已占用 {cacheSize} MB
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </div>
          </div>

          {/* Group 3: 关于 */}
          <div className="space-y-1">
            {/* Section Header */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-normal pb-1">
              <Info className="w-3.5 h-3.5" />
              <span>关于</span>
            </div>

            {/* Item 4: 版本信息 */}
            <div
              id="settings-item-version-info"
              className="flex items-center justify-between py-3 border-b border-gray-100 rounded-lg px-2 -mx-2 transition-colors cursor-default select-text"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">
                  版本信息
                </div>
                <div className="text-xs text-gray-400 mt-0.5 font-normal">
                  当前版本v1.1.0(1110)
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </div>

            {/* Item 5: 消息连接 */}
            <div
              id="settings-item-message-connection"
              className="flex items-center justify-between py-3 border-b border-gray-100 rounded-lg px-2 -mx-2 transition-colors cursor-default select-text"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">
                  消息连接
                </div>
                <div className="text-xs text-gray-400 mt-0.5 font-normal">
                  消息服务已连接
                </div>
              </div>
              {/* Green Badge matching Screenshot 2 */}
              <div className="bg-[#e8f8f2] text-[#10b981] px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 shrink-0 border border-[#bbf0da]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                <span>已连接</span>
              </div>
            </div>

            {/* Item 6: 用户协议 */}
            <div
              id="settings-item-user-agreement"
              className="flex items-center justify-between py-3 border-b border-gray-100 rounded-lg px-2 -mx-2 transition-colors cursor-default select-text"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">
                  用户协议
                </div>
                <div className="text-xs text-gray-400 mt-0.5 font-normal">
                  在浏览器中查看服务条款
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </div>

            {/* Item 7: 隐私政策 */}
            <div
              id="settings-item-privacy-policy"
              className="flex items-center justify-between py-3 border-b border-gray-100 rounded-lg px-2 -mx-2 transition-colors cursor-default select-text"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">
                  隐私政策
                </div>
                <div className="text-xs text-gray-400 mt-0.5 font-normal">
                  在浏览器中查看隐私政策
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: 个人中心 Modal */}
      {isProfileModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
              <h3 className="text-sm font-bold text-gray-900">个人资料与账号信息</h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center gap-3.5 pb-3 border-b border-gray-100">
                <img
                  src={CURRENT_USER.avatar}
                  alt={profileData.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-200 shadow-2xs"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{profileData.name}</h4>
                  <p className="text-gray-500 text-[11px] mt-0.5">{profileData.department} · {profileData.role}</p>
                  <span className="inline-block mt-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium border border-blue-100">
                    {profileData.securityLevel}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-gray-700">
                <div>
                  <label className="text-gray-400 block text-[11px] mb-1">姓名</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 block text-[11px] mb-1">手机号</label>
                    <input
                      type="text"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block text-[11px] mb-1">工号 / 密号</label>
                    <input
                      type="text"
                      value={profileData.jobNumber}
                      disabled
                      className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-1.5 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 block text-[11px] mb-1">电子邮箱</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-200/70 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  showToast('个人资料已成功更新并同步至本地国密节点');
                }}
                className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                保存更改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: 文件存储位置 Modal */}
      {isFilePathModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsFilePathModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
              <h3 className="text-sm font-bold text-gray-900">文件存储与缓存路径</h3>
              <button
                onClick={() => setIsFilePathModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-gray-600 leading-relaxed">
                当前客户端接收的加密文件、语音录音和离线缓存均存储在以下本地加密沙箱中：
              </p>
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px] text-gray-800 break-all select-all flex items-center justify-between">
                <span>{filePath}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(filePath);
                    showToast('存储路径已复制到剪贴板');
                  }}
                  className="flex-1 py-2 px-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制路径</span>
                </button>
                <button
                  onClick={() => {
                    showToast('已模拟打开本地沙箱目录');
                  }}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer shadow-2xs"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>打开目录</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: 版本信息与检查更新 Modal */}
      {isCheckUpdateModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsCheckUpdateModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 overflow-hidden text-center p-6 space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">当前已是最新版本</h3>
              <p className="text-xs text-gray-400 mt-1">点点密信桌面客户端 v1.1.0 (Build 1110)</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-600 text-left space-y-1">
              <div className="font-semibold text-gray-800">最新更新特性：</div>
              <div>• 全面升级国密 SM2/SM3/SM4 混合握手安全套件</div>
              <div>• 优化群聊复合头像与分时段智能温馨提示体验</div>
              <div>• 新增消息右键不显示该聊天与隐私隐藏保护能力</div>
            </div>
            <button
              onClick={() => setIsCheckUpdateModalOpen(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              完成
            </button>
          </div>
        </div>
      )}

      {/* Modal 4: 消息连接状态 Modal */}
      {isConnectionModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsConnectionModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
              <h3 className="text-sm font-bold text-gray-900">消息长连接与服务网关状态</h3>
              <button
                onClick={() => setIsConnectionModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-emerald-800">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span className="font-semibold">核心通信链路稳定连接中</span>
                </div>
                <span className="font-mono text-[11px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-700">RTT: 18ms</span>
              </div>

              <div className="space-y-2 text-gray-600 pt-1">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">接入网关节点</span>
                  <span className="font-mono text-gray-800">gw-secure-03.knwl.cn:443</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">传输加密协议</span>
                  <span className="font-medium text-blue-600">TLS 1.3 + 国密SM4-CBC</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">心跳保活间隔</span>
                  <span className="font-mono text-gray-800">15秒 / 周期</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">双因子证书有效状态</span>
                  <span className="font-medium text-emerald-600">已授权 (有效期至 2028-12)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: 用户协议 Modal */}
      {isUserAgreementOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsUserAgreementOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
              <h3 className="text-sm font-bold text-gray-900">点点密信用户服务协议</h3>
              <button
                onClick={() => setIsUserAgreementOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-xs text-gray-600 leading-relaxed overflow-y-auto custom-scrollbar space-y-3">
              <h4 className="font-bold text-gray-900">1. 服务宗旨与国密合规</h4>
              <p>点点密信系为企事业单位及政企协同设计的专用即时加密通信软件，严格遵循《中华人民共和国密码法》与《数据安全法》要求，保障全链路数据机密性与防篡改性。</p>
              <h4 className="font-bold text-gray-900">2. 账号与密级权限使用规范</h4>
              <p>用户须妥善保管个人密保介质与双因子凭证，不得向未经授权人员提供涉密会话导出记录或转借设备。</p>
              <h4 className="font-bold text-gray-900">3. 免责与不可抗力</h4>
              <p>因国家安全演练、应急网络切断或不可抗力导致的短期通信挂起，系统将自动进入本地沙箱离线模式。</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal 6: 隐私政策 Modal */}
      {isPrivacyPolicyOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsPrivacyPolicyOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
              <h3 className="text-sm font-bold text-gray-900">点点密信隐私政策与数据保护声明</h3>
              <button
                onClick={() => setIsPrivacyPolicyOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-xs text-gray-600 leading-relaxed overflow-y-auto custom-scrollbar space-y-3">
              <h4 className="font-bold text-gray-900">1. 数据零知识加密原则</h4>
              <p>所有会话文本、文件附件及多媒体通信均在终端设备由国密芯片或硬件模块加密后传输，服务端无法解密查看明文内容。</p>
              <h4 className="font-bold text-gray-900">2. 动态防泄密水印与审计留痕</h4>
              <p>为满足信息保密管理规定，客户端在涉密会话界面将默认渲染带时间戳与工号标记的微透明动态水印，仅用于泄密溯源。</p>
              <h4 className="font-bold text-gray-900">3. 用户个人控制权</h4>
              <p>用户随时可通过系统设置中的「清理缓存」或注销指令永久清除本地缓存密钥及会话留痕。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
