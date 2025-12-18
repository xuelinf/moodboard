import type { Stage } from '../types';
import { cn } from '../lib/utils';

interface GanttChartProps {
    stages: Stage[];
}

export function GanttChart({ stages }: GanttChartProps) {
    // Calculate global start/end for scaling
    const dates = stages.flatMap(s => [new Date(s.startDate).getTime(), new Date(s.endDate).getTime()]).filter(d => !isNaN(d));
    if (dates.length === 0) return <div className="text-textSub text-xs">暂无排期数据</div>;

    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const totalDuration = maxDate - minDate;

    // Buffer for display 
    const startOffset = minDate; // - (totalDuration * 0.05);
    // const endOffset = maxDate; // + (totalDuration * 0.05);
    const displayDuration = totalDuration || 1; // avoid divide by zero

    const getPosition = (dateStr: string) => {
        const t = new Date(dateStr).getTime();
        return ((t - startOffset) / displayDuration) * 100;
    };

    const getWidth = (start: string, end: string) => {
        const s = new Date(start).getTime();
        const e = new Date(end).getTime();
        return ((e - s) / displayDuration) * 100;
    };

    return (
        <div className="w-full h-full overflow-y-auto pr-2">
            <div className="relative min-h-[200px] py-4">
                {/* Grid lines could go here */}

                <div className="space-y-3">
                    {stages.map((stage, i) => {
                        const left = getPosition(stage.startDate);
                        const width = getWidth(stage.startDate, stage.endDate);

                        return (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-24 text-[10px] text-textSub text-right truncate shrink-0">{stage.title}</div>
                                <div className="flex-1 relative h-6 bg-[#18181b] rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "absolute top-1 bottom-1 rounded-full transition-all hover:brightness-110 cursor-pointer",
                                            "bg-gradient-to-r from-blue-600 to-blue-400 opacity-80"
                                        )}
                                        style={{
                                            left: `${left}%`,
                                            width: `${Math.max(width, 1)}%` // min width for visibility
                                        }}
                                        title={`${stage.startDate} ~ ${stage.endDate}`}
                                    ></div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Time Axis Labels (Simple) */}
                <div className="flex justify-between mt-6 text-[10px] text-textSub border-t border-white/5 pt-2">
                    <span>{new Date(minDate).toLocaleDateString()}</span>
                    <span>{new Date(maxDate).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}
