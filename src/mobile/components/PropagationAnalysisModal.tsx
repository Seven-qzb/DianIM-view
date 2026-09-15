import React, { useState } from 'react';
import { PropagationTopicItem, PropagationFeedItem } from '../types';
import { PROPAGATION_TOPIC_LIST } from '../data/mockData';
import { 
  ChevronLeft, Search, X, Clock, FileText, TrendingUp, 
  PieChart, SlidersHorizontal, Bell, MoreVertical, 
  Undo2, BarChart2, User, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PropagationAnalysisModalProps {
  onClose: () => void;
  institutionName?: string;
}

export const PropagationAnalysisModal: React.FC<PropagationAnalysisModalProps> = ({
  onClose,
}) => {
  const [topicList] = useState<PropagationTopicItem[]>(PROPAGATION_TOPIC_LIST);
  const [selectedTopic, setSelectedTopic] = useState<PropagationTopicItem | null>(null);

  // List filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'全部' | '自建话题' | '专家话题'>('全部');

  // Detail view state
  const [detailTab, setDetailTab] = useState<'overview' | 'allData'>('allData');
  const [feedSearchQuery, setFeedSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | '负面' | '正面' | '中性'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Filter topics for list view
  const filteredTopics = topicList.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeCategory === '自建话题') return t.topicType === '自建话题';
    if (activeCategory === '专家话题') return t.topicType === '专家话题';
    return true;
  });

  const totalCount = topicList.length;
  const selfCreatedCount = topicList.filter((t) => t.topicType === '自建话题').length;
  const expertCount = topicList.filter((t) => t.topicType === '专家话题').length;

  // Render highlighted text for feed titles
  const renderHighlightedTitle = (text: string, keywords?: string[]) => {
    if (!keywords || keywords.length === 0) return <span>{text}</span>;
    const regex = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          keywords.includes(part) ? (
            <span key={i} className="text-[#FF4D4F] font-bold">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#F4F6F9] text-slate-900 flex flex-col max-w-[430px] w-full mx-auto overflow-hidden select-none font-sans">
      <AnimatePresence mode="wait">
        {!selectedTopic ? (
          /* ========================================================================= */
          /* 1. TOPIC LIST VIEW (Matches Image 1)                                      */
          /* ========================================================================= */
          <motion.div
            key="topic-list"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex flex-col h-full bg-[#F4F6F9]"
          >
            {/* Header */}
            <header className="h-12 bg-white px-3 flex items-center justify-between sticky top-0 z-30 border-b border-slate-100">
              <button
                id="back-to-services-from-list-btn"
                onClick={onClose}
                className="p-1.5 -ml-1 text-slate-800 hover:bg-slate-100 rounded-full transition-colors active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
              </button>
              <h1 className="font-bold text-[17px] text-slate-900 tracking-tight">
                传播分析
              </h1>
              <div className="w-8" />
            </header>

            {/* Top Search Bar (Image 1) */}
            <div className="px-3.5 pt-3 pb-2 bg-white">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="topic-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="输入话题名称搜索"
                  className="w-full bg-[#F0F2F5] rounded-full pl-9 pr-8 py-2 text-[13px] text-slate-800 placeholder-slate-400 outline-none border border-transparent focus:border-[#1677FF]/40 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills (Image 1) */}
              <div className="flex items-center gap-2 pt-3 pb-1">
                <button
                  id="filter-all-topics-btn"
                  type="button"
                  onClick={() => setActiveCategory('全部')}
                  className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                    activeCategory === '全部'
                      ? 'bg-[#EBF3FF] text-[#1677FF] font-medium'
                      : 'bg-[#F4F6F9] text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  全部({totalCount})
                </button>

                <button
                  id="filter-self-topics-btn"
                  type="button"
                  onClick={() => setActiveCategory('自建话题')}
                  className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                    activeCategory === '自建话题'
                      ? 'bg-[#EBF3FF] text-[#1677FF] font-medium'
                      : 'bg-[#F4F6F9] text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  自建话题({selfCreatedCount})
                </button>

                <button
                  id="filter-expert-topics-btn"
                  type="button"
                  onClick={() => setActiveCategory('专家话题')}
                  className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                    activeCategory === '专家话题'
                      ? 'bg-[#EBF3FF] text-[#1677FF] font-medium'
                      : 'bg-[#F4F6F9] text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  专家话题({expertCount})
                </button>
              </div>
            </div>

            {/* Topic Cards List */}
            <div className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-3 pb-12">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  id={`topic-card-${topic.id}`}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setDetailTab('allData'); // Default or view
                  }}
                  className="bg-white rounded-xl p-3.5 shadow-2xs border border-[#DCE9F6] text-left relative overflow-hidden cursor-pointer hover:border-[#1677FF]/40 active:scale-[0.99] transition-all"
                >
                  {/* Top Right Status Badge */}
                  <div
                    className={`absolute top-0 right-0 px-2.5 py-0.5 rounded-bl-lg text-[11px] font-medium text-white ${
                      topic.statusText === '更新中'
                        ? 'bg-[#00B578]'
                        : 'bg-[#6E8294]'
                    }`}
                  >
                    {topic.statusText}
                  </div>

                  {/* Title */}
                  <h2 className="font-bold text-[15px] text-slate-900 tracking-tight pr-14 leading-snug mb-3">
                    {topic.title}
                  </h2>

                  {/* Stat Row: Total Data & Topic Category */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-1.5">
                      {/* Orange bar chart icon */}
                      <span className="w-4 h-4 rounded bg-[#FF7A45] text-white flex items-center justify-center text-[10px]">
                        <BarChart2 className="w-3 h-3" />
                      </span>
                      <span className="text-slate-500">总数据量</span>
                      <span className="font-bold text-slate-900 ml-1">
                        {topic.dataTotal}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-600">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{topic.topicType}</span>
                    </div>
                  </div>

                  {/* Time Row */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500 shrink-0">起止时间</span>
                    <span className="font-mono text-slate-600 text-[11px] truncate">
                      {topic.startTime} ~ {topic.endTime || '至今'}
                    </span>
                  </div>
                </div>
              ))}

              {filteredTopics.length === 0 && (
                <div className="text-center py-16 text-slate-400 text-xs">
                  未找到符合条件的话题
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* 2. TOPIC DETAIL VIEW (Matches Image 2 & Image 3)                           */
          /* ========================================================================= */
          <motion.div
            key="topic-detail"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex flex-col h-full bg-[#F4F6F9] relative"
          >
            {/* Top Navigation Bar: 详情 */}
            <header className="h-11 bg-white px-3 flex items-center justify-between sticky top-0 z-30 border-b border-slate-100">
              <button
                id="back-to-topic-list-btn"
                onClick={() => setSelectedTopic(null)}
                className="p-1.5 -ml-1 text-slate-800 hover:bg-slate-100 rounded-full transition-colors active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
              </button>
              <h1 className="font-bold text-[17px] text-slate-900 tracking-tight">
                详情
              </h1>
              <div className="w-8" />
            </header>

            {/* Topic Info Header (Light Blue Banner with Badge and Time) */}
            <div className="bg-gradient-to-b from-[#EBF3FF] to-[#E3EFFF] p-3.5 relative border-b border-blue-100/60">
              {/* Status Badge in Top Right */}
              <div
                className={`absolute top-0 right-0 px-2.5 py-0.5 rounded-bl-lg text-[11px] font-medium text-white ${
                  selectedTopic.statusText === '更新中'
                    ? 'bg-[#00B578]'
                    : 'bg-[#6E8294]'
                }`}
              >
                {selectedTopic.statusText}
              </div>

              {/* Title & Tag */}
              <div className="flex items-center gap-2 pr-14 mb-2">
                <span className="bg-white/85 text-[#1677FF] border border-[#1677FF]/35 px-1.5 py-0.2 rounded text-[11px] font-medium shrink-0">
                  {selectedTopic.topicType === '自建话题' ? '自建' : '专家'}
                </span>
                <h2 className="font-bold text-[16px] text-slate-900 tracking-tight leading-snug">
                  {selectedTopic.title}
                </h2>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-[11px] text-slate-600">
                  {selectedTopic.detailTimeRange || `${selectedTopic.startTime} - ${selectedTopic.endTime || '至今'}`}
                </span>
              </div>
            </div>

            {/* Sub-tabs: 统计概览 / 全部数据 */}
            <div className="bg-white flex items-center justify-around border-b border-slate-200/80 sticky top-11 z-20">
              <button
                id="detail-tab-overview-btn"
                type="button"
                onClick={() => setDetailTab('overview')}
                className={`flex-1 py-3 text-[14px] font-medium text-center relative transition-colors cursor-pointer ${
                  detailTab === 'overview'
                    ? 'text-[#1677FF] font-bold'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                统计概览
                {detailTab === 'overview' && (
                  <motion.div
                    layoutId="detailActiveTabUnderline"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#1677FF] rounded-full"
                  />
                )}
              </button>

              <button
                id="detail-tab-all-data-btn"
                type="button"
                onClick={() => setDetailTab('allData')}
                className={`flex-1 py-3 text-[14px] font-medium text-center relative transition-colors cursor-pointer ${
                  detailTab === 'allData'
                    ? 'text-[#1677FF] font-bold'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                全部数据
                {detailTab === 'allData' && (
                  <motion.div
                    layoutId="detailActiveTabUnderline"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#1677FF] rounded-full"
                  />
                )}
              </button>
            </div>

            {/* TAB 1: 统计概览 (Matches Image 3) */}
            {detailTab === 'overview' && (
              <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 pb-20">
                {/* 1. 事件概述 */}
                <div className="bg-white rounded-xl p-4 shadow-2xs border border-slate-100">
                  <div className="flex items-center gap-2 mb-2.5">
                    <FileText className="w-4 h-4 text-[#1677FF]" />
                    <h3 className="font-bold text-[15px] text-slate-800">
                      事件概述
                    </h3>
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed text-justify">
                    {selectedTopic.overviewSummary ||
                      '推广志愿服务活动，招募合适志愿者推广志愿服务活动招募合适志愿者推广志愿服务活动，招募合适志愿者推广志愿服务活动，招募合适志愿者推广志愿服务活动，招募合适志愿者推广志愿服务活动，招募合适志愿者推广志愿服务活动，招募合适志愿者。'}
                  </p>
                </div>

                {/* 2. 事件趋势 (Image 3) */}
                <div className="bg-white rounded-xl p-4 shadow-2xs border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#1677FF]" />
                      <h3 className="font-bold text-[15px] text-slate-800">
                        事件趋势
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#1677FF]">
                      <span className="w-1.5 h-1.5 rotate-45 bg-[#1677FF]" />
                      <span>全量</span>
                    </div>
                  </div>

                  {/* SVG Line / Area Chart */}
                  <div className="w-full pt-2">
                    <div className="relative h-44 w-full">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-mono">
                        {[80, 60, 40, 20, 0].map((val) => (
                          <div key={val} className="flex items-center gap-2 w-full">
                            <span className="w-4 text-right">{val}</span>
                            <div className="flex-1 border-b border-dashed border-slate-100" />
                          </div>
                        ))}
                      </div>

                      {/* SVG Curves */}
                      <svg
                        className="absolute inset-0 w-full h-full pl-6 pb-4"
                        viewBox="0 0 300 140"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2E75E6" stopOpacity="0.32" />
                            <stop offset="100%" stopColor="#2E75E6" stopOpacity="0.01" />
                          </linearGradient>
                        </defs>

                        {/* Area Fill */}
                        <polygon
                          points="15,48 65,54 120,62 175,70 230,78 285,86 285,135 15,135"
                          fill="url(#trendGradient)"
                        />

                        {/* Stroke line */}
                        <polyline
                          fill="none"
                          stroke="#2E75E6"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="15,48 65,54 120,62 175,70 230,78 285,86"
                        />

                        {/* Points */}
                        {[
                          { x: 15, y: 48 },
                          { x: 65, y: 54 },
                          { x: 120, y: 62 },
                          { x: 175, y: 70 },
                          { x: 230, y: 78 },
                          { x: 285, y: 86 },
                        ].map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={pt.x}
                            cy={pt.y}
                            r="3.5"
                            fill="#2E75E6"
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                          />
                        ))}
                      </svg>
                    </div>

                    {/* X-axis Timestamps */}
                    <div className="flex justify-between pl-6 text-[10px] text-slate-400 font-mono pt-1">
                      <span>09:00</span>
                      <span>03:00</span>
                      <span>04:00</span>
                      <span>06:00</span>
                      <span>07:00</span>
                      <span>08:00</span>
                    </div>
                  </div>
                </div>

                {/* 3. 倾向性分布 (Image 3) */}
                <div className="bg-white rounded-xl p-4 shadow-2xs border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-[#1677FF]" />
                      <h3 className="font-bold text-[15px] text-slate-800">
                        倾向性分布
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500">
                      {selectedTopic.sentimentDistribution?.total || selectedTopic.dataTotal} 条
                    </span>
                  </div>

                  {/* Horizontal Segmented Bar */}
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 mb-3">
                    <div
                      style={{ width: selectedTopic.sentimentDistribution?.negative.percent || '29.4%' }}
                      className="bg-[#FF4D4F] h-full"
                    />
                    <div
                      style={{ width: selectedTopic.sentimentDistribution?.neutral.percent || '52.4%' }}
                      className="bg-[#1890FF] h-full"
                    />
                    <div
                      style={{ width: selectedTopic.sentimentDistribution?.positive.percent || '18.2%' }}
                      className="bg-[#52C41A] h-full"
                    />
                  </div>

                  {/* Legend Counts */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-red-50/70 p-2 rounded-lg border border-red-100/60">
                      <div className="flex items-center justify-center gap-1 text-[#FF4D4F] font-medium mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D4F]" />
                        <span>负面</span>
                      </div>
                      <div className="font-bold text-slate-800">
                        {selectedTopic.sentimentDistribution?.negative.percent || '29.4%'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {selectedTopic.sentimentDistribution?.negative.count || 699} 条
                      </div>
                    </div>

                    <div className="bg-blue-50/70 p-2 rounded-lg border border-blue-100/60">
                      <div className="flex items-center justify-center gap-1 text-[#1890FF] font-medium mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1890FF]" />
                        <span>中性</span>
                      </div>
                      <div className="font-bold text-slate-800">
                        {selectedTopic.sentimentDistribution?.neutral.percent || '52.4%'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {selectedTopic.sentimentDistribution?.neutral.count || 1246} 条
                      </div>
                    </div>

                    <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-100/60">
                      <div className="flex items-center justify-center gap-1 text-[#52C41A] font-medium mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#52C41A]" />
                        <span>正面</span>
                      </div>
                      <div className="font-bold text-slate-800">
                        {selectedTopic.sentimentDistribution?.positive.percent || '18.2%'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {selectedTopic.sentimentDistribution?.positive.count || 433} 条
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 全部数据 (Matches Image 2) */}
            {detailTab === 'allData' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search and More Filter Row */}
                <div className="px-3.5 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2 relative">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      id="feed-search-input"
                      type="text"
                      value={feedSearchQuery}
                      onChange={(e) => setFeedSearchQuery(e.target.value)}
                      placeholder="请按标题、正文、作者、来源搜索"
                      className="w-full bg-[#F0F2F5] rounded-full pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none border border-transparent focus:border-[#1677FF]/40"
                    />
                    {feedSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setFeedSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* 更多筛选 Button */}
                  <div className="relative">
                    <button
                      id="more-filters-btn"
                      type="button"
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className="bg-[#F0F2F5] hover:bg-[#E5E8ED] text-slate-700 px-2.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-all"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      <span>更多筛选</span>
                    </button>

                    {showFilterDropdown && (
                      <div className="absolute right-0 top-9 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-40 text-xs">
                        {(['all', '负面', '正面', '中性'] as const).map((sent) => (
                          <button
                            key={sent}
                            type="button"
                            onClick={() => {
                              setSentimentFilter(sent);
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors ${
                              sentimentFilter === sent
                                ? 'text-[#1677FF] font-bold bg-blue-50/50'
                                : 'text-slate-700'
                            }`}
                          >
                            {sent === 'all' ? '全部情绪' : sent}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Feed Items List */}
                <div className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-3 pb-24">
                  {(selectedTopic.feedItems || []).filter((item) => {
                    const matchesQuery = 
                      (item.title || item.content).toLowerCase().includes(feedSearchQuery.toLowerCase()) ||
                      item.author.toLowerCase().includes(feedSearchQuery.toLowerCase()) ||
                      item.source.toLowerCase().includes(feedSearchQuery.toLowerCase());
                    const matchesSentiment = sentimentFilter === 'all' || item.sentiment === sentimentFilter;
                    return matchesQuery && matchesSentiment;
                  }).map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl p-3.5 shadow-2xs border border-slate-100/90 text-left space-y-2.5"
                    >
                      {/* Tag Row & Time */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Sentiment Tag */}
                          {item.sentiment === '负面' && (
                            <span className="bg-[#FFF1F0] text-[#FF4D4F] border border-[#FFA39E]/60 text-[11px] px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D4F]" />
                              负面
                            </span>
                          )}
                          {item.sentiment === '正面' && (
                            <span className="bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F] text-[11px] px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#52C41A]" />
                              正面
                            </span>
                          )}
                          {item.sentiment === '中性' && (
                            <span className="bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF] text-[11px] px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1890FF]" />
                              中性
                            </span>
                          )}

                          {/* Level Tag (e.g. 央级) */}
                          {item.level && (
                            <span className="bg-[#FFFBE6] text-[#FA8C16] border border-[#FFE58F] text-[11px] px-1.5 py-0.5 rounded font-medium">
                              {item.level}
                            </span>
                          )}

                          {/* Warning Tag */}
                          {item.isWarning && (
                            <span className="bg-[#FFF1F0] text-[#FF4D4F] border border-[#FFA39E]/60 text-[11px] px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                              <Bell className="w-3 h-3 text-[#FF4D4F]" />
                              已预警
                            </span>
                          )}
                        </div>

                        {/* Created Time */}
                        <div className="flex items-center gap-1 text-slate-400 text-xs font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{item.createdAt || item.timeAgo}</span>
                        </div>
                      </div>

                      {/* Content & Images */}
                      {item.images && item.images.length === 1 ? (
                        /* Single image layout (Image 2 Card 2: text left, image right) */
                        <div className="flex items-start gap-3">
                          <p className="flex-1 text-[14px] text-slate-900 font-medium leading-snug">
                            {renderHighlightedTitle(item.title || item.content, item.highlightKeywords)}
                          </p>
                          <div className="w-24 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                            <img
                              src={item.images[0]}
                              alt="thumb"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      ) : (
                        /* Multi-image or text-only layout */
                        <div className="space-y-2">
                          <p className="text-[14px] text-slate-900 font-medium leading-snug">
                            {renderHighlightedTitle(item.title || item.content, item.highlightKeywords)}
                          </p>

                          {item.images && item.images.length > 1 && (
                            <div className="grid grid-cols-3 gap-2 pt-0.5">
                              {item.images.map((imgUrl, imgIdx) => (
                                <div
                                  key={imgIdx}
                                  className="relative h-18 rounded-lg overflow-hidden bg-slate-100 border border-slate-100"
                                >
                                  <img
                                    src={imgUrl}
                                    alt="thumb"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bottom Platform & Author Row */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                          {/* Platform Icon & Name */}
                          <div className="flex items-center gap-1">
                            {item.sourceIcon === 'weibo' ? (
                              <span className="w-4 h-4 rounded-full bg-[#EA3838] flex items-center justify-center shrink-0">
                                <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 24 24">
                                  <path d="M10.15 17.55c-3.15.35-5.85-1.15-6.05-3.35-.2-2.15 2.15-4.2 5.3-4.55 3.15-.35 5.8 1.15 6 3.3.2 2.2-2.1 4.25-5.25 4.6zm-1.1-2.9c-.3.1-.55 0-.6-.2-.05-.2.15-.4.45-.45.3-.05.55 0 .6.2.05.2-.15.4-.45.45zm1.1-.95c-.75.25-1.4-.05-1.5-.7-.1-.6.4-1.3 1.15-1.5.7-.2 1.35.1 1.45.7.1.6-.4 1.25-1.1 1.5zm6.55-5.85c-.45-.15-.75-.05-.8.15-.1.35.15.55.6.7.85.3 1.4.95 1.5 1.8.1.75-.25 1.55-.95 2.15-.25.2-.25.5 0 .7.25.15.5.15.75-.05.95-.8 1.4-1.9 1.25-2.95-.15-1.25-.9-2.15-2.35-2.5zm1.6-1.85c-1.15-.45-2.45-.25-3.4.4-.3.2-.35.5-.15.75.2.25.5.3.75.1.65-.45 1.55-.6 2.35-.3.75.3 1.3.85 1.55 1.6.1.3.4.45.7.35.3-.1.45-.4.35-.7-.35-1.05-1.1-1.85-2.15-2.2z"/>
                                </svg>
                              </span>
                            ) : item.sourceIcon === 'ximalaya' ? (
                              <span className="w-4 h-4 rounded-full bg-[#FF5000] flex items-center justify-center shrink-0">
                                <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 24 24">
                                  <path d="M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h2a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H5v-2a7 7 0 1 1 14 0v2h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z"/>
                                </svg>
                              </span>
                            ) : (
                              <span className="w-4 h-4 rounded-full bg-[#1677FF] text-white flex items-center justify-center text-[9px]">
                                <FileText className="w-2.5 h-2.5" />
                              </span>
                            )}
                            <span className="text-slate-700 font-medium">{item.source}</span>
                          </div>

                          {/* Author & UID */}
                          <div className="flex items-center gap-1 text-slate-400">
                            <User className="w-3.5 h-3.5" />
                            <span className="text-slate-600">{item.author}</span>
                            {item.authorUid && (
                              <span className="text-slate-400 ml-1">
                                UID: {item.authorUid}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* More Action */}
                        <button
                          type="button"
                          className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!selectedTopic.feedItems || selectedTopic.feedItems.length === 0) && (
                    <div className="text-center py-16 text-slate-400 text-xs">
                      暂无全部数据明细记录
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Floating Back Button (Image 2 & Image 3) */}
            <button
              id="detail-floating-return-btn"
              type="button"
              onClick={() => setSelectedTopic(null)}
              className="fixed bottom-6 right-6 z-60 w-12 h-12 rounded-full bg-[#80878E]/90 hover:bg-[#687078] text-white flex flex-col items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer"
            >
              <Undo2 className="w-4 h-4 stroke-[2.2]" />
              <span className="text-[10px] font-medium leading-tight">返回</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
