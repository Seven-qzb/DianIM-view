import React, { useState } from 'react';
import {
  X,
  Languages,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  Search,
  Filter,
  Copy,
  Check,
  Smile,
  User,
  Wifi,
  Battery,
} from 'lucide-react';

interface PropagationH5ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  source?: string;
  publishTime?: string;
}

export const PropagationH5Modal: React.FC<PropagationH5ModalProps> = ({
  isOpen,
  onClose,
  title,
  source,
  publishTime,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'all_data'>('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState<'all' | 'neutral' | 'positive' | 'negative'>('all');

  if (!isOpen) return null;

  const handleCopyAuthor = (id: string, text: string) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  const feedList = [
    {
      id: 'feed_1',
      sentiment: '中性',
      time: '1分钟前',
      content: '绝大多数人对运动员的培养机制存在误解。实际上，在市体校训练和学习是完全...',
      source: '新浪微博',
      sourceType: 'weibo',
      author: '小米的baba',
    },
    {
      id: 'feed_2',
      sentiment: '中性',
      time: '1分钟前',
      content: '我们可以给刘翔算笔账。1993年，刘翔10岁进入上海普陀区少体校，属于地方基...',
      highlightWord: '刘翔',
      source: '新浪微博',
      sourceType: 'weibo',
      author: '老裘1969',
    },
    {
      id: 'feed_3',
      sentiment: '中性',
      time: '1分钟前',
      content: '刘翔退役安置引热议',
      highlightWord: '刘翔',
      source: '今日头条',
      sourceType: 'toutiao',
      author: '八钻人生——赵振之',
    },
    {
      id: 'feed_4',
      sentiment: '中性',
      time: '2分钟前',
      content: '上海市体育局召开退役运动员职业转型与保障机制研讨会，重点推进体教融合机制...',
      source: '上海体育局官网',
      sourceType: 'web',
      author: '官方政务发布',
    },
    {
      id: 'feed_5',
      sentiment: '中性',
      time: '5分钟前',
      content: '回顾雅典奥运会夺冠历程：从上海普陀少体校走出的跨栏飞人，体教协同育人标杆深度剖析。',
      highlightWord: '上海普陀少体校',
      source: '微信公众号',
      sourceType: 'wechat',
      author: '体育深度研判',
    },
  ];

  const filteredFeed = feedList.filter((item) => {
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      return (
        item.content.toLowerCase().includes(kw) ||
        item.author.toLowerCase().includes(kw) ||
        item.source.toLowerCase().includes(kw)
      );
    }
    return true;
  });

  return (
    <div
      id="propagation-h5-overlay"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Mobile Phone Mockup Frame Container */}
      <div
        id="propagation-h5-container"
        className="bg-[#f8f9fa] rounded-[36px] shadow-2xl w-full max-w-[420px] h-[92vh] max-h-[860px] overflow-hidden border-[6px] border-[#1e232a] animate-in zoom-in-95 duration-150 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic Watermark Background */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden opacity-[0.035] flex flex-wrap gap-x-14 gap-y-16 -rotate-12 select-none -m-10">
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i} className="text-xs font-mono font-bold text-gray-900 whitespace-nowrap">
              2026-08-31 15:42:41
            </span>
          ))}
        </div>

        {/* 1. Top Phone Status Bar (iOS Style matching Screenshot) */}
        <div className="bg-white pt-2.5 px-6 pb-1 flex items-center justify-between text-xs text-gray-900 font-semibold shrink-0 z-30">
          <div className="flex items-center gap-1 font-mono text-[13px] tracking-tight">
            <span>15:42</span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-0.5" />
          </div>

          <div className="flex items-center gap-1.5 text-gray-800">
            <span className="text-[10px] font-mono font-bold">5G</span>
            <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
            <div className="flex items-center gap-0.5 ml-1">
              <span className="text-[11px] font-mono">30</span>
              <Battery className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            </div>
          </div>
        </div>

        {/* 2. Top H5 Navigation Bar: [✕] [全文翻译 >] [•••] */}
        <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-gray-100 shrink-0 z-30">
          <button
            id="h5-btn-close"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-800 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            title="关闭"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>

          <button
            id="h5-btn-translate"
            onClick={() => {
              setIsTranslating(!isTranslating);
            }}
            className="flex items-center gap-1 text-[13px] text-gray-800 hover:text-blue-600 font-normal cursor-pointer py-1 px-2 rounded hover:bg-gray-50 transition-colors"
          >
            <Languages className="w-4 h-4 text-gray-700" />
            <span>全文翻译</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          </button>

          <button
            id="h5-btn-more"
            onClick={() => alert('更多操作：刷新、分享、在浏览器中打开')}
            className="w-7 h-7 flex items-center justify-center text-gray-800 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            title="更多"
          >
            <MoreHorizontal className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* 3. Header Topic Banner (Warm Creamy Yellow/Orange Gradient matching Screenshot) */}
        <div className="bg-gradient-to-b from-[#fef5e7] via-[#fef2e4] to-[#fdeddb] px-4 pt-3.5 pb-3 shrink-0 border-b border-[#faecd8] z-30">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              {/* 自建 Yellow Tag */}
              <span className="bg-[#fef0cd] text-[#d97706] border border-[#fde68a] text-[11px] font-bold px-1.5 py-0.5 rounded leading-none shrink-0 shadow-2xs">
                自建
              </span>
              {/* Title */}
              <h1 className="text-base font-bold text-gray-900 truncate tracking-tight">
                {title || '刘翔 上海体育局'}
              </h1>
            </div>

            {/* 更新中 Green Pill Tag */}
            <span className="bg-[#059669] text-white text-[11px] font-medium px-2 py-0.5 rounded-sm shrink-0 shadow-2xs">
              更新中
            </span>
          </div>

          {/* Date Range Subtitle */}
          <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-mono mt-1">
            <Clock className="w-3 h-3 text-gray-400 shrink-0" />
            <span>2026-08-15 00:00:00 ~ 2026-09-01 00:00:00</span>
          </div>
        </div>

        {/* 4. Tab Navigation Bar: 统计概览 | 全部数据 */}
        <div className="bg-white border-b border-gray-100 flex items-center justify-around shrink-0 z-30">
          <button
            id="h5-tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 text-center transition-all cursor-pointer relative ${
              activeTab === 'overview'
                ? 'text-gray-900 font-bold text-sm'
                : 'text-gray-500 hover:text-gray-800 text-sm font-normal'
            }`}
          >
            <span>统计概览</span>
            {activeTab === 'overview' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-[#9c532b] rounded-full" />
            )}
          </button>

          <button
            id="h5-tab-all-data"
            onClick={() => setActiveTab('all_data')}
            className={`flex-1 py-3 text-center transition-all cursor-pointer relative ${
              activeTab === 'all_data'
                ? 'text-gray-900 font-bold text-sm'
                : 'text-gray-500 hover:text-gray-800 text-sm font-normal'
            }`}
          >
            <span>全部数据</span>
            {activeTab === 'all_data' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-[#9c532b] rounded-full" />
            )}
          </button>
        </div>

        {/* 5. Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-3.5 custom-scrollbar bg-[#f8f9fa] relative z-20">
          {activeTab === 'overview' ? (
            /* Tab 1: 统计概览 View (Matching Screenshot 1) */
            <div className="space-y-3.5 pb-6">
              {/* Card 1: 事件概述 */}
              <div
                id="card-event-summary"
                className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100/90 relative"
              >
                {/* Title with yellow brush marker effect under '概述' */}
                <div className="mb-2.5 flex items-center">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center">
                    <span>事件</span>
                    <span className="relative ml-0.5 inline-block">
                      概述
                      <span className="absolute bottom-0.5 left-0 right-0 h-2 bg-[#fde047]/70 -z-10 rounded-xs" />
                    </span>
                  </h3>
                </div>

                {/* Body Text */}
                <p className="text-xs text-gray-800 leading-[1.75] text-justify font-normal">
                  事件“#刘翔 上海体育局#”，截至{' '}
                  <span className="text-[#f43f5e] font-semibold font-mono">
                    2026-09-01 00:00:00
                  </span>
                  ，共扩散信息
                  <span className="text-[#f43f5e] font-bold font-mono">65232</span>
                  条，事件“刘翔 上海体育局”，截至 2026-08-31 15:42:45，共扩散信息 65232 条，其中：媒体环节分类统计：APP26967条，互动栏目239条，广播8条，短视频1430条，社交媒体31538条，纸媒13条，网站4869条，长视频168条
                </p>
              </div>

              {/* Card 2: 数据统计 65232 */}
              <div
                id="card-data-statistics"
                className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100/90 relative min-h-[300px]"
              >
                {/* Title */}
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-bold text-gray-900">数据统计</h3>
                  <span className="text-sm font-bold text-gray-900 font-mono">65232</span>
                </div>

                {/* Donut Chart SVG Container */}
                <div className="relative flex items-center justify-center my-3">
                  <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 160 160">
                    {/* Background track */}
                    <circle
                      cx="80"
                      cy="80"
                      r="58"
                      stroke="#f1f5f9"
                      strokeWidth="24"
                      fill="transparent"
                    />

                    {/* Segment 1: 社交媒体 (Royal Blue 48.33%) */}
                    <circle
                      cx="80"
                      cy="80"
                      r="58"
                      stroke="#4169e1"
                      strokeWidth="24"
                      strokeDasharray="176 364"
                      strokeDashoffset="0"
                      fill="transparent"
                      className="transition-all duration-700"
                    />

                    {/* Segment 2: APP (Sky Blue 41.34%) */}
                    <circle
                      cx="80"
                      cy="80"
                      r="58"
                      stroke="#5bc2e7"
                      strokeWidth="24"
                      strokeDasharray="150 364"
                      strokeDashoffset="-180"
                      fill="transparent"
                      className="transition-all duration-700"
                    />

                    {/* Segment 3: 视频/短视频 (Coral Orange 2.19%) */}
                    <circle
                      cx="80"
                      cy="80"
                      r="58"
                      stroke="#ff7a45"
                      strokeWidth="24"
                      strokeDasharray="24 364"
                      strokeDashoffset="-332"
                      fill="transparent"
                    />

                    {/* Segment 4: 网站 (Teal 7.46%) */}
                    <circle
                      cx="80"
                      cy="80"
                      r="58"
                      stroke="#36cfc9"
                      strokeWidth="24"
                      strokeDasharray="8 364"
                      strokeDashoffset="-356"
                      fill="transparent"
                    />

                    {/* Segment 5: 纸媒/广播 (Rose Red 0.01%) */}
                    <circle
                      cx="80"
                      cy="80"
                      r="58"
                      stroke="#f43f5e"
                      strokeWidth="24"
                      strokeDasharray="4 364"
                      strokeDashoffset="-364"
                      fill="transparent"
                    />
                  </svg>

                  {/* Center of Donut: 总计 65232 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] text-gray-400 font-normal">总计</span>
                    <span className="text-xl font-bold text-gray-900 font-mono tracking-tight">
                      65232
                    </span>
                  </div>

                  {/* Floating '返回' Button Matching Screenshot 1 */}
                  <button
                    id="btn-chart-return"
                    onClick={() => setActiveTab('all_data')}
                    className="absolute right-0 bottom-2 bg-[#6e7d91] hover:bg-[#5b6a7e] text-white w-11 h-11 rounded-full flex flex-col items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    title="查看全部数据"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mb-0.5 stroke-[2.5]" />
                    <span className="text-[9px] font-medium leading-none">返回</span>
                  </button>
                </div>

                {/* Bottom Metric Percentages */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-center">
                  <div>
                    <div className="text-xs font-bold text-gray-900 font-mono">41.34%</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">APP客户端</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 font-mono">0.37%</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">互动与栏目</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 font-mono">0.01%</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">广播与纸媒</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: 全部数据 View (Matching Screenshot 2) */
            <div className="space-y-3 pb-20">
              {filteredFeed.map((item) => (
                <div
                  key={item.id}
                  id={`feed-item-${item.id}`}
                  className="bg-white rounded-2xl p-3.5 shadow-2xs border border-gray-100/90 relative overflow-hidden transition-all hover:border-blue-200"
                >
                  {/* Top Sentiment Badge & Time */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {/* Emoji + 中性 Badge */}
                    <div className="flex items-center gap-1 bg-[#e6f4ff] text-[#1677ff] text-[11px] font-medium px-2 py-0.5 rounded-full">
                      <Smile className="w-3.5 h-3.5 text-[#1677ff]" />
                      <span>{item.sentiment}</span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono">
                      <Clock className="w-3 h-3 text-gray-300" />
                      <span>{item.time}</span>
                    </div>
                  </div>

                  {/* Content / Title */}
                  <p className="text-xs text-gray-900 font-medium leading-relaxed mb-3">
                    {item.content.includes('刘翔') ? (
                      <>
                        {item.content.split('刘翔').map((part, index, arr) => (
                          <React.Fragment key={index}>
                            {part}
                            {index < arr.length - 1 && (
                              <span className="text-[#f43f5e] font-bold">刘翔</span>
                            )}
                          </React.Fragment>
                        ))}
                      </>
                    ) : (
                      item.content
                    )}
                  </p>

                  {/* Source & Author Row */}
                  <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
                    {/* Left Source */}
                    <div className="flex items-center gap-1.5 font-normal">
                      {item.sourceType === 'weibo' ? (
                        <div className="w-3.5 h-3.5 rounded-full bg-[#f43f5e] flex items-center justify-center text-[8px] text-white font-bold shrink-0">
                          微
                        </div>
                      ) : item.sourceType === 'toutiao' ? (
                        <div className="w-3.5 h-3.5 rounded bg-[#f43f5e] flex items-center justify-center text-[7px] text-white font-bold shrink-0">
                          条
                        </div>
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white font-bold shrink-0">
                          网
                        </div>
                      )}
                      <span className="text-gray-700">{item.source}</span>
                    </div>

                    {/* Right Author + Copy Button */}
                    <div className="flex items-center gap-1 text-gray-500">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="truncate max-w-[120px]">{item.author}</span>
                      <button
                        onClick={() => handleCopyAuthor(item.id, item.author)}
                        className="p-0.5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="复制作者"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Tab 2 Sticky Bottom Search & Filter Bar (Only visible when on '全部数据') */}
        {activeTab === 'all_data' && (
          <div className="bg-white/95 backdrop-blur-xs border-t border-gray-100 px-3.5 py-2 flex items-center gap-2 z-30 shrink-0">
            <div className="flex-1 bg-[#f4f6f8] rounded-full px-3 py-1.5 flex items-center gap-2 border border-gray-200/70">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="请按标题、正文、作者、来源搜索"
                className="bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none w-full"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              id="btn-feed-filter"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 px-1 py-0.5 cursor-pointer shrink-0"
              title="筛选"
            >
              <Filter className="w-3.5 h-3.5 mb-0.5 text-amber-700" />
              <span className="text-[10px] font-normal leading-none">筛选</span>
            </button>
          </div>
        )}

        {/* 7. Bottom H5 Browser Navigation Bar: [<] [>] and iOS Home Indicator */}
        <div className="bg-white border-t border-gray-100 px-8 py-2 flex flex-col items-center justify-center shrink-0 z-30">
          <div className="flex items-center justify-around w-full max-w-[200px] text-gray-500 mb-1">
            <button
              onClick={() => setActiveTab('overview')}
              className="p-1 hover:text-gray-900 transition-colors cursor-pointer"
              title="后退"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2]" />
            </button>
            <button
              onClick={() => setActiveTab('all_data')}
              className="p-1 hover:text-gray-900 transition-colors cursor-pointer"
              title="前进"
            >
              <ChevronRight className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          {/* iOS Bottom Home Bar */}
          <div className="w-28 h-1 bg-gray-900 rounded-full" />
        </div>
      </div>
    </div>
  );
};
