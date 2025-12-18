import { useState, useMemo } from 'react';
import { BottomBar } from './components/BottomBar';
import { StageCard } from './components/StageCard';
import { UserModal } from './components/UserModal';
import type { Stage, User, ProjectInfo } from './types';

const INITIAL_USERS: User[] = [
  { id: 'u1', name: '李雅', avatar: 'https://i.pravatar.cc/150?u=2' }, // Leah
  { id: 'u2', name: '陈麦克', avatar: 'https://i.pravatar.cc/150?u=3' }, // Mike Chen
  { id: 'u3', name: '吴安娜', avatar: 'https://i.pravatar.cc/150?u=4' }, // Anna Wu
  { id: 'u4', name: '大卫', avatar: undefined }, // David K. (Emoji fallback)
  { id: 'u5', name: '李阿力', avatar: 'https://i.pravatar.cc/150?u=1' }, // Alex Li
  { id: 'u6', name: '声波工作室', avatar: undefined }, // Sonic Studio
  { id: 'u7', name: '剪辑师X', avatar: undefined } // Editor X
];

const INITIAL_PROJECT_INFO: ProjectInfo = {
  name: "赛博深空 (The Deep Void)",
  duration: "15 分钟",
  style: "Cyberpunk / Noir",
  concept: "一个被AI统治的未来都市，人类为了寻找最后的真实情感而展开的冒险。",
  aspectRatio: "2.39:1",
  eta: "2025-12-30",
  directorId: "u5"
};

const INITIAL_STAGES: Stage[] = [
  {
    title: "策划与立项",
    desc: "确定核心创意、视觉风格、完成故事脚本大纲与分场。",
    icon: "ph-lightbulb",
    startDate: "2025-11-01",
    endDate: "2025-11-05",
    ownerIds: ['u1'],
    tasks: [
      { name: "核心创意 Logline 确认", done: true },
      { name: "视觉风格参考板 (Moodboard)", done: true },
      { name: "文字脚本 (Script) 定稿", done: true }
    ]
  },
  {
    title: "AI 基础资产构建",
    desc: "准备核心角色与道具资产。",
    icon: "ph-cube",
    startDate: "2025-11-06",
    endDate: "2025-11-15",
    ownerIds: ['u2'],
    tasks: [
      { name: "角色四视图 (正/背/侧/特写)", done: true },
      { name: "服装/配饰设定", done: true },
      { name: "核心道具资产准备", done: false }
    ]
  },
  {
    title: "分镜脚本 (Storyboard)",
    desc: "根据文字脚本生成静态关键帧，确认构图与光影。",
    icon: "ph-image",
    startDate: "2025-11-16",
    endDate: "2025-11-20",
    ownerIds: ['u3'],
    tasks: [
      { name: "分镜头 Prompt 编写", done: false },
      { name: "关键帧首图生成", done: false },
      { name: "导演画面审核", done: false }
    ],
    stats: {
      label: "分镜头画面",
      total: 150,
      completed: 120
    }
  },
  {
    title: "动态生成 (Motion)",
    desc: "图生视频 (I2V)，控制运镜、动态幅度与物理规律。",
    icon: "ph-film-strip",
    startDate: "2025-11-21",
    endDate: "2025-11-30",
    ownerIds: ['u4'],
    tasks: [
      { name: "运镜 Zoom/Pan 修正", done: false },
      { name: "表情崩坏检查", done: false },
      { name: "镜头调度连贯性检查", done: false }
    ],
    stats: {
      label: "分镜视频",
      total: 120,
      completed: 45
    }
  },
  {
    title: "资产盘点与审核",
    desc: "剔除废片，确保分镜完整性与一致性。",
    icon: "ph-magnifying-glass",
    startDate: "2025-12-01",
    endDate: "2025-12-03",
    ownerIds: ['u5'],
    tasks: [
      { name: "分镜头画面完整性盘点", done: false },
      { name: "废片剔除 (Pass Rate > 80%)", done: false },
      { name: "一致性检查", done: false }
    ]
  },
  {
    title: "声音工程",
    desc: "配音生成、口型同步、音效与BGM。",
    icon: "ph-speaker-high",
    startDate: "2025-12-05",
    endDate: "2025-12-07",
    ownerIds: ['u6'],
    tasks: [
      { name: "AI 配音生成 (TTS)", done: false },
      { name: "口型同步 (Lip-Sync)", done: false },
      { name: "环境音效与配乐合成", done: false }
    ]
  },
  {
    title: "最终剪辑与交付",
    desc: "剪辑合成、调色、字幕制作与最终渲染。",
    icon: "ph-scissors",
    startDate: "2025-12-08",
    endDate: "2025-12-10",
    ownerIds: ['u7'],
    tasks: [
      { name: "粗剪 (Rough Cut)", done: false },
      { name: "调色 (Color Grading)", done: false },
      { name: "成片渲染导出", done: false }
    ]
  }
];

function App() {
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(INITIAL_PROJECT_INFO);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Calculate progress
  const overallProgress = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    stages.forEach(stage => {
      totalTasks += stage.tasks.length;
      completedTasks += stage.tasks.filter(t => t.done).length;
    });
    return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  }, [stages]);

  const handleToggleTask = (stageIndex: number, taskIndex: number) => {
    const newStages = [...stages];
    newStages[stageIndex].tasks[taskIndex].done = !newStages[stageIndex].tasks[taskIndex].done;
    setStages(newStages);
  };

  const handleDateChange = (stageIndex: number, field: 'startDate' | 'endDate', value: string) => {
    const newStages = [...stages];
    if (field === 'startDate') newStages[stageIndex].startDate = value;
    if (field === 'endDate') newStages[stageIndex].endDate = value;
    setStages(newStages);
  };

  const handleOwnerChange = (stageIndex: number, userId: string) => {
    const newStages = [...stages];
    newStages[stageIndex].ownerIds = [userId];
    setStages(newStages);
  };

  const handleCreateUser = (name: string, avatar?: string) => {
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      avatar
    };
    setUsers([...users, newUser]);
  };

  const handleStatsChange = (stageIndex: number, field: 'total' | 'completed', value: number) => {
    const newStages = [...stages];
    if (newStages[stageIndex].stats) {
      newStages[stageIndex].stats![field] = value;
    }
    setStages(newStages);
  };

  return (
    <div className="pb-32">

      <main className="max-w-5xl mx-auto pt-16 px-6 relative">

        <div className="absolute left-[54px] top-16 bottom-0 w-0.5 bg-border z-0"></div>

        {stages.map((stage, index) => (
          <StageCard
            key={index}
            stage={stage}
            index={index}
            users={users}
            onToggleTask={handleToggleTask}
            onDateChange={handleDateChange}
            onOwnerChange={handleOwnerChange}
            onAddUserClick={() => setIsUserModalOpen(true)}
            onStatsChange={handleStatsChange}
          />
        ))}

        <div className="h-20 flex items-center justify-center text-textSub text-xs">
          - END OF WORKFLOW -
        </div>

      </main>

      <BottomBar
        overallProgress={overallProgress}
        stages={stages}
        projectInfo={projectInfo}
        users={users}
        onProjectInfoChange={setProjectInfo}
        onAddUserClick={() => setIsUserModalOpen(true)}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  );
}

export default App;
