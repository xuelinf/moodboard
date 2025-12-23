import React, { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeatureRow } from './components/FeatureRow';
import { Footer } from './components/Footer';

function App() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      number: "01 / ORDER",
      title: <>确立结构化表格的<br />工业秩序</>,
      description: "超越无限画布的混乱连线。43 LENS 采用动态交互分镜表（Dynamic Interactive Storyboard）形态。每一行分镜都是一个独立闭环的控制台，支持从绘图提示词优化到视频渲染的全流程线性操作。",
      imageSrc: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2574&auto=format&fit=crop"
    },
    {
      number: "02 / CONSISTENCY",
      title: <>精准资产注入<br />解决“不连戏”痛点</>,
      description: "支持“项目资产库”与分镜表深度绑定。用户可一键调用特定的角色、场景、道具资产作为参考。在长内容生成中，确保主角脸部稳定、环境统一，消除 AI 视频生成的随机幻觉。",
      imageSrc: "https://images.unsplash.com/photo-1597223590951-15aae38fa05b?q=80&w=2574&auto=format&fit=crop",
      isReverse: true
    },
    {
      number: "03 / FISSION",
      title: <>九宫格灵感裂变<br />一境九观</>,
      description: "提供非线性的创意探索能力。针对特定镜头，AI 可基于同一描述裂变出 9 种不同景别与运镜的方案。创作者可在确定性中快速延展创意，高效筛选最佳镜头。",
      imageSrc: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop"
    },
    {
      number: "04 / INTELLIGENCE",
      title: <>影视级提示词<br />意图识别引擎</>,
      description: "内置专家级知识库，支持“四视图法”精准锁定角色三维特征，“空间布局法”重构景深逻辑。系统自动将模糊的创意发散收束为严谨的工程化提示词，辅助专业创作。",
      imageSrc: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop",
      isReverse: true
    },
    {
      number: "05 / ARCHITECTURE",
      title: <>模型聚合路由<br />多任务并发</>,
      description: "后端采用模型解耦设计，兼容主流闭源/开源模型（文生图/图生视频）。通过统一接口灵活切换，支持多任务并行计算与异步消息队列，最大化生产效率。",
      imageSrc: "https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=2574&auto=format&fit=crop"
    },
  ];

  return (
    <div className="min-h-screen text-text-main font-sans selection:bg-accent selection:text-white relative">
      <div className="fixed inset-0 bg-bg-deep" style={{ zIndex: -50 }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1b2e] via-[#050505] to-[#000000] opacity-100" />
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      </div>

      <Navbar />
      <Hero />
      <main className="relative z-20 pb-[100px]">
        {features.map((feature, idx) => (
          <React.Fragment key={idx}>
            <FeatureRow {...feature} />
            {idx < features.length - 1 && (
              <div className="w-full h-[1px] bg-[linear-gradient(90deg,transparent,#222,transparent)] my-0" />
            )}
          </React.Fragment>
        ))}
      </main>
      <Footer />
    </div>
  )
}

export default App
