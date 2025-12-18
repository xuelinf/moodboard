import { useState } from 'react';
import { ChevronUp, ChevronDown, Calendar, Clock, Film, LayoutTemplate, Palette, Eye } from 'lucide-react';
import { cn, getRandomEmoji } from '../lib/utils';
import type { Stage, ProjectInfo, User } from '../types';
import { GanttChart } from './GanttChart';

interface BottomBarProps {
    overallProgress: number;
    stages: Stage[];
    projectInfo: ProjectInfo;
    users: User[];
    onProjectInfoChange: (info: ProjectInfo) => void;
    onAddUserClick: () => void;
}

export function BottomBar({
    overallProgress,
    stages,
    projectInfo,
    users,
    onProjectInfoChange,
    onAddUserClick
}: BottomBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const director = users.find(u => u.id === projectInfo.directorId);

    const handleInfoChange = (field: keyof ProjectInfo, value: string) => {
        onProjectInfoChange({ ...projectInfo, [field]: value });
    };

    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-all duration-500 ease-in-out",
                isExpanded ? "h-[500px]" : "h-16" // Increased height to accommodate content
            )}
        >
            {/* Toggle Button */}
            <div
                className="absolute -top-5 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#050505] border-t border-l border-r border-border rounded-t-xl flex items-center justify-center cursor-pointer hover:bg-[#0a0a0c] transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-primary" />
                ) : (
                    <ChevronUp className="w-4 h-4 text-primary animate-bounce" />
                )}
            </div>

            {/* Collapsed Content */}
            {!isExpanded && (
                <div className="h-full px-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <h2 className="text-sm font-bold text-white tracking-wide truncate max-w-[300px]">{projectInfo.name}</h2>
                        <div className="h-4 w-px bg-white/10 hidden md:block"></div>
                        <div className="hidden md:flex items-center gap-2 text-xs text-textSub">
                            <Clock className="w-3 h-3" />
                            <span>交付倒计时: <span className="text-white font-mono">12</span> 天</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 min-w-[300px]">
                        <span className="text-xs text-textSub">总体进度</span>
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-primary transition-all duration-500"
                                style={{ width: `${overallProgress}%` }}
                            ></div>
                        </div>
                        <span className="text-xs font-bold text-primary">{overallProgress}%</span>
                    </div>
                </div>
            )}

            {/* Expanded Content */}
            {isExpanded && (
                <div className="h-full p-8 grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Left: Project Info Form */}
                    <div className="col-span-4 space-y-5 border-r border-white/5 pr-8 overflow-y-auto">
                        <h3 className="text-xs font-bold text-textSub uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Film className="w-4 h-4" /> 项目详情
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-textSub uppercase block mb-1">项目名称</label>
                                <input
                                    value={projectInfo.name}
                                    onChange={(e) => handleInfoChange('name', e.target.value)}
                                    className="w-full bg-transparent border-b border-white/10 py-1 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-textSub uppercase block mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> 影片长度</label>
                                    <input
                                        value={projectInfo.duration}
                                        onChange={(e) => handleInfoChange('duration', e.target.value)}
                                        className="w-full bg-[#18181b] rounded px-2 py-1.5 text-xs text-white border border-transparent focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-textSub uppercase block mb-1 flex items-center gap-1"><LayoutTemplate className="w-3 h-3" /> 画面比例</label>
                                    <input
                                        value={projectInfo.aspectRatio}
                                        onChange={(e) => handleInfoChange('aspectRatio', e.target.value)}
                                        className="w-full bg-[#18181b] rounded px-2 py-1.5 text-xs text-white border border-transparent focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-textSub uppercase block mb-1 flex items-center gap-1"><Palette className="w-3 h-3" /> 视觉风格</label>
                                <input
                                    value={projectInfo.style}
                                    onChange={(e) => handleInfoChange('style', e.target.value)}
                                    className="w-full bg-[#18181b] rounded px-2 py-1.5 text-xs text-white border border-transparent focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-textSub uppercase block mb-1 flex items-center gap-1"><Eye className="w-3 h-3" /> 概念创意</label>
                                <textarea
                                    value={projectInfo.concept}
                                    onChange={(e) => handleInfoChange('concept', e.target.value)}
                                    className="w-full bg-[#18181b] rounded px-2 py-1.5 text-xs text-white border border-transparent focus:border-primary focus:outline-none resize-none h-16"
                                />
                            </div>

                            {/* Project Director Selector */}
                            <div className="pb-4"> {/* Added padding bottom to prevent clipping */}
                                <label className="text-[10px] text-textSub uppercase block mb-2">项目总监</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative group/director shrink-0">
                                        {director?.avatar ? (
                                            <img src={director.avatar} className="w-10 h-10 rounded-full border border-border" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg">
                                                {getRandomEmoji()}
                                            </div>
                                        )}

                                        {/* Simple dropdown for director switch */}
                                        <select
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            value={projectInfo.directorId}
                                            onChange={(e) => {
                                                if (e.target.value === 'ADD_NEW') {
                                                    onAddUserClick();
                                                } else {
                                                    handleInfoChange('directorId', e.target.value);
                                                }
                                            }}
                                        >
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                            <option value="ADD_NEW">+ 新建人员...</option>
                                        </select>
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-sm font-bold text-white truncate">{director?.name || 'Unassigned'}</div>
                                        <div className="text-[10px] text-textSub">点击头像切换</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right: Gantt Chart */}
                    <div className="col-span-8 flex flex-col h-full">
                        <h3 className="text-xs font-bold text-textSub uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> 项目排期甘特图
                        </h3>
                        <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-xl p-4 overflow-hidden">
                            <GanttChart stages={stages} />
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
