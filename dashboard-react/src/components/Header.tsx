
import { Film, CalendarCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface HeaderProps {
    overallProgress: number;
}

export function Header({ overallProgress }: HeaderProps) {
    return (
        <header className="fixed top-0 w-full z-50 bg-[#050505]/90 backdrop-blur-md border-b border-border h-16 px-8 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple-700 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                    <Film className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-sm font-bold tracking-wide text-white">项目：赛博深空 (The Deep Void)</h1>
                    <div className="flex items-center gap-3 text-[10px] text-textSub mt-0.5">
                        <span className="flex items-center gap-1.5"><CalendarCheck className="w-3 h-3 text-primary" /> 截止日期: 2025-12-30</span>
                        <span className="w-px h-3 bg-white/10"></span>
                        <span className="text-gray-400">距离交付仅剩 <span className="text-white font-bold">12</span> 天</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="flex flex-col items-end gap-1 min-w-[200px]">
                    <div className="flex justify-between w-full text-xs font-medium">
                        <span className="text-textSub">项目总进度</span>
                        <span className={overallProgress === 100 ? 'text-success' : 'text-primary'}>{overallProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-700 ease-out",
                                overallProgress === 100 ? 'bg-success' : 'bg-gradient-to-r from-blue-600 to-primary'
                            )}
                            style={{ width: `${overallProgress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pl-6 border-l border-border">
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-white font-medium">李明 (Alex)</div>
                        <div className="text-[10px] text-textSub">项目总监</div>
                    </div>
                    <img src="https://i.pravatar.cc/150?u=admin" className="w-9 h-9 rounded-full border border-border cursor-pointer hover:border-primary transition-colors" alt="User Avatar" />
                </div>
            </div>
        </header>
    );
}
