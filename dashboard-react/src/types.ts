export interface Task {
    name: string;
    done: boolean;
}

export type StageStatus = 'pending' | 'processing' | 'completed';

export interface User {
    id: string;
    name: string;
    avatar?: string;
}

export interface Stage {
    title: string;
    desc: string;
    icon: string;
    startDate: string;
    endDate: string;
    ownerIds: string[];
    tasks: Task[];
    stats?: {
        label: string;
        total: number;
        completed: number;
    };
}

export interface ProjectInfo {
    name: string;
    duration: string; // e.g. "120 mins"
    style: string;
    concept: string;
    aspectRatio: string; // e.g. "2.39:1"
    eta: string; // YYYY-MM-DD
    directorId: string;
}
