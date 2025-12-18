import { useState, useRef, useEffect } from 'react';
import {
    Check,
    Loader2,
    Clock,
    Lightbulb,
    Box,
    Image as ImageIcon,
    Film,
    Search,
    Volume2,
    Scissors,
    UserPlus,
    ChevronDown
} from 'lucide-react';
import { cn, getRandomEmoji } from '../lib/utils';
import type { Stage, StageStatus, User } from '../types';

interface StageCardProps {
    stage: Stage;
    index: number;
    users: User[];
    onToggleTask: (stageIndex: number, taskIndex: number) => void;
    onDateChange: (stageIndex: number, field: 'startDate' | 'endDate', value: string) => void;
    onOwnerChange: (stageIndex: number, userId: string) => void;
    onAddUserClick: () => void;
    onStatsChange: (stageIndex: number, field: 'total' | 'completed', value: number) => void;
}

const iconMap: Record<string, React.ElementType> = {
    'ph-lightbulb': Lightbulb,
    'ph-cube': Box,
    'ph-image': ImageIcon,
    'ph-film-strip': Film,
    'ph-magnifying-glass': Search,
    'ph-speaker-high': Volume2,
    'ph-scissors': Scissors,
};

export function StageCard({
    stage,
    index,
    users,
    onToggleTask,
    onDateChange,
    onOwnerChange,
    onAddUserClick,
    onStatsChange
}: StageCardProps) {
    const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOwnerDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getStageStatus = (stage: Stage): StageStatus => {
        const total = stage.tasks.length;
        const done = stage.tasks.filter(t => t.done).length;
        if (done === 0) return 'pending';
        if (done === total) return 'completed';
        return 'processing';
    };

    const status = getStageStatus(stage);

    const calculateProgress = (stage: Stage) => {
        const total = stage.tasks.length;
        const done = stage.tasks.filter(t => t.done).length;
        return total === 0 ? 0 : (done / total) * 100;
    };

    const calculateDuration = (start: string, end: string) => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1;
    };

    const statusLabel = {
        'pending': '未开始',
        'processing': '进行中',
        'completed': '已完成'
    }[status];

    const IconComponent = iconMap[stage.icon] || Lightbulb;
    const currentOwner = users.find(u => u.id === stage.ownerIds[0]);

    return (
        <div className="relative pl-24 pb-12 group">

            {/* Status Icon Marker */}
            <div className="absolute left-6 top-0 -translate-x-1/2 flex flex-col items-center z-10">
                <div className={cn(
                    "w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-500 shadow-lg z-20",
                    status === 'pending' && "border-border text-textSub bg-card",
                    status === 'processing' && "border-processing text-processing bg-card shadow-glow-blue scale-110",
                    status === 'completed' && "border-success text-success bg-card shadow-glow-green"
                )}>
                    {status === 'completed' ? (
                        <Check className="text-2xl" />
                    ) : status === 'processing' ? (
                        <Loader2 className="animate-spin text-2xl" />
                    ) : (
                        <IconComponent className="text-2xl" />
                    )}
                </div>
            </div>

            {/* Main Card Container */}
            <div className={cn(
                "glass-card rounded-xl p-6 relative group isolate",
                status === 'pending' && "border border-border",
                // For processing, we remove the standard border to let SVG handle it (or layer it)
                status === 'processing' && "shadow-glow-blue border-transparent",
                status === 'completed' && "border border-success/50 shadow-glow-green"
            )}>

                {/* SVG Moving Border Animation for Processing State */}
                {status === 'processing' && (
                    <div className="absolute inset-0 z-0 pointer-events-none rounded-xl overflow-hidden">
                        <svg className="absolute inset-0 w-full h-full" width="100%" height="100%">
                            <defs>
                                <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                                    <stop offset="50%" stopColor="#60a5fa" stopOpacity="1" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {/* Base border (dim) */}
                            <rect
                                x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)"
                                rx="11" ry="11"
                                fill="none"
                                stroke="rgba(59, 130, 246, 0.3)"
                                strokeWidth="1"
                            />
                            {/* Moving light beam */}
                            <rect
                                x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)"
                                rx="11" ry="11"
                                fill="none"
                                stroke={`url(#grad-${index})`}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeDasharray="50 150" /* Short beam, long gap. Adjust based on preference. Using percentage via pathLength below. */
                                pathLength="200"
                                className="animate-border-trace"
                            />
                        </svg>
                    </div>
                )}

                {/* Content wrapper */}
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-xs font-mono text-textSub opacity-50">NO.0{index + 1}</span>
                                <h2 className="text-lg font-bold text-white tracking-wide">{stage.title}</h2>
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border transition-colors duration-300",
                                    status === 'pending' && "bg-gray-800 border-gray-700 text-gray-500",
                                    status === 'processing' && "bg-processing/10 border-processing/30 text-processing",
                                    status === 'completed' && "bg-success/10 border-success/30 text-success"
                                )}>
                                    {statusLabel}
                                </span>
                            </div>
                            <p className="text-xs text-textSub">{stage.desc}</p>
                        </div>

                        {/* Owner Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <div
                                className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/20 transition-colors cursor-pointer"
                                onClick={() => setIsOwnerDropdownOpen(!isOwnerDropdownOpen)}
                            >
                                <span className="text-[10px] text-textSub">负责人</span>
                                <div className="flex items-center gap-2">
                                    {currentOwner?.avatar ? (
                                        <img src={currentOwner.avatar} className="w-6 h-6 rounded-full" alt={currentOwner.name} />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                                            {getRandomEmoji()}
                                        </div>
                                    )}
                                    <span className="text-xs text-white font-medium">{currentOwner?.name || 'Unknown'}</span>
                                    <ChevronDown className="w-3 h-3 text-textSub" />
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            {isOwnerDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0c] border border-border rounded-lg shadow-xl z-50 overflow-hidden max-h-60 flex flex-col">
                                    <div className="overflow-y-auto flex-1">
                                        {users.map(user => (
                                            <div
                                                key={user.id}
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 cursor-pointer"
                                                onClick={() => {
                                                    onOwnerChange(index, user.id);
                                                    setIsOwnerDropdownOpen(false);
                                                }}
                                            >
                                                {user.avatar ? (
                                                    <img src={user.avatar} className="w-6 h-6 rounded-full" alt={user.name} />
                                                ) : (
                                                    <span className="text-sm">👤</span>
                                                )}
                                                <span className="text-xs text-white">{user.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-border p-2 bg-[#0a0a0c]">
                                        <div
                                            className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded cursor-pointer text-primary"
                                            onClick={() => {
                                                onAddUserClick();
                                                setIsOwnerDropdownOpen(false);
                                            }}
                                        >
                                            <UserPlus className="w-3 h-3" />
                                            <span className="text-xs font-bold">新建人员</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-2">

                        <div className="lg:col-span-7 space-y-3">
                            <h3 className="text-[10px] font-bold text-textSub uppercase tracking-wider mb-2">任务检查清单</h3>
                            {stage.tasks.map((task, tIndex) => (
                                <div
                                    key={tIndex}
                                    className="checkbox-wrapper flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:bg-white/5 transition-all cursor-pointer group/item"
                                    onClick={() => onToggleTask(index, tIndex)}
                                >
                                    <input type="checkbox" className="hidden" checked={task.done} readOnly />
                                    <div className="w-5 h-5 rounded border border-gray-600 bg-gray-900 flex items-center justify-center transition-all group-hover/item:border-gray-400">
                                        {task.done && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        )}
                                    </div>

                                    <span className={cn(
                                        "text-sm transition-colors",
                                        task.done ? 'text-gray-500 line-through' : 'text-gray-200'
                                    )}>
                                        {task.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-5 flex flex-col h-full bg-[#020203] rounded-lg border border-white/5 p-4">
                            <h3 className="text-[10px] font-bold text-textSub uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Clock className="w-3 h-3" /> 排期设置
                            </h3>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="block text-[10px] text-textSub mb-1">开始日期</label>
                                    <input
                                        type="date"
                                        value={stage.startDate}
                                        onChange={(e) => onDateChange(index, 'startDate', e.target.value)}
                                        className="w-full bg-[#18181b] border border-border rounded px-2 py-1.5 text-xs text-white focus:border-primary focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-textSub mb-1">结束日期</label>
                                    <input
                                        type="date"
                                        value={stage.endDate}
                                        onChange={(e) => onDateChange(index, 'endDate', e.target.value)}
                                        className="w-full bg-[#18181b] border border-border rounded px-2 py-1.5 text-xs text-white focus:border-primary focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {stage.stats && (
                                <div className="mb-4 pt-4 border-t border-white/5">
                                    <label className="block text-[10px] font-bold text-textSub mb-2 uppercase tracking-wider">{stage.stats.label}统计</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] text-textSub mb-1">已完成</label>
                                            <input
                                                type="number"
                                                value={stage.stats.completed}
                                                onChange={(e) => onStatsChange(index, 'completed', parseInt(e.target.value) || 0)}
                                                className="w-full bg-[#18181b] border border-border rounded px-2 py-1.5 text-xs text-white focus:border-success/50 focus:outline-none transition-colors text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-textSub mb-1">总量预估</label>
                                            <input
                                                type="number"
                                                value={stage.stats.total}
                                                onChange={(e) => onStatsChange(index, 'total', parseInt(e.target.value) || 0)}
                                                className="w-full bg-[#18181b] border border-border rounded px-2 py-1.5 text-xs text-textSub focus:border-border focus:outline-none transition-colors text-center"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-300"
                                            style={{ width: `${Math.min((stage.stats.completed / stage.stats.total) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto">
                                <div className="flex justify-between items-center text-[10px] mb-1">
                                    <span className="text-textSub">预估工期</span>
                                    <span className="text-white font-mono font-bold">{calculateDuration(stage.startDate, stage.endDate)} 天</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden flex">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-500",
                                            status === 'processing' ? 'bg-processing' : 'bg-primary'
                                        )}
                                        style={{ width: `${calculateProgress(stage)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
