import { useEffect, useRef } from 'react';
import { Circle } from 'lucide-react';

export const Hero = () => {
    const heroBgRef = useRef<HTMLDivElement>(null);
    const heroLayer2Ref = useRef<HTMLDivElement>(null);
    const heroOrbRef = useRef<HTMLDivElement>(null);
    const heroGradientRef = useRef<HTMLDivElement>(null);
    const heroVideoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.scrollY;
                    if (scrolled < window.innerHeight) {
                        if (heroBgRef.current) {
                            heroBgRef.current.style.transform = `translateY(${scrolled * 0.4}px)`;
                        }
                        if (heroLayer2Ref.current) {
                            heroLayer2Ref.current.style.transform = `translateY(${scrolled * 0.6}px) scale(1.1)`;
                        }
                        if (heroOrbRef.current) {
                            heroOrbRef.current.style.transform = `translateY(-${scrolled * 0.3}px)`;
                        }
                        if (heroGradientRef.current) {
                            heroGradientRef.current.style.transform = `translateY(${scrolled * 0.5}px) rotate(${scrolled * 0.02}deg)`;
                        }
                        if (heroVideoRef.current) {
                            heroVideoRef.current.style.transform = `translateY(${scrolled * 0.2}px) scale(${1 - scrolled * 0.0005})`;
                            heroVideoRef.current.style.opacity = `${1 - (scrolled * 0.0015)}`;
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className="relative min-h-screen flex flex-col items-center justify-center pt-[100px] overflow-hidden">
            {/* Parallax Background */}
            <div
                ref={heroBgRef}
                className="absolute top-0 left-0 w-full h-[120%] z-[-10] bg-[radial-gradient(circle_at_50%_30%,_#1a1b2e_0%,_#050505_60%)] will-change-transform translate-z-0"
            />
            <div
                ref={heroLayer2Ref}
                className="absolute top-[-20%] left-[-10%] w-[120%] h-[140%] z-[-10] bg-[linear-gradient(45deg,rgba(99,102,241,0.08)_0%,transparent_40%,rgba(139,92,246,0.08)_100%)] opacity-100 will-change-transform translate-z-0 pointer-events-none mix-blend-screen"
            />
            <div
                ref={heroOrbRef}
                className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] z-[-15] bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_70%)] rounded-full blur-3xl will-change-transform translate-z-0 pointer-events-none mix-blend-screen"
            />
            <div
                ref={heroGradientRef}
                className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] z-[-25] bg-[conic-gradient(from_0deg_at_50%_50%,_rgba(99,102,241,0.05)_0deg,_transparent_60deg,_rgba(139,92,246,0.05)_120deg,_transparent_180deg)] blur-3xl will-change-transform translate-z-0 pointer-events-none"
            />
            <div
                className="absolute inset-0 z-[-30] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"
            />

            {/* Video Stage */}
            <div
                ref={heroVideoRef}
                className="w-[95%] lg:w-[70%] max-w-[1200px] aspect-video bg-black rounded-xl shadow-[0_0_80px_rgba(99,102,241,0.15)] relative z-10 overflow-hidden border border-[rgba(255,255,255,0.08)] mb-[50px] [transform-style:preserve-3d]"
            >
                <img
                    src="https://images.unsplash.com/photo-1626544827763-d516dce335ca?q=80&w=2670&auto=format&fit=crop"
                    alt="43 LENS Dashboard Demo"
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute bottom-5 left-5 bg-black/60 px-2.5 py-1 rounded text-xs text-white font-mono flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-red-500 text-red-500 animate-pulse" /> LIVE PREVIEW
                </div>
            </div>

            {/* Text Content */}
            <div className="text-center z-10 max-w-[800px] px-5 pb-[60px] fade-in-up">
                <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.1] mb-5 bg-gradient-to-b from-white to-[#aaa] bg-clip-text text-transparent">
                    服务专业创作者的<br />AI 影视生产中台
                </h1>
                <p className="text-[1.1rem] text-text-sub font-[300]">
                    Man is the Director. AI is the Assistant.<br />
                    拒绝随机生成的惊喜，追求工业生产的精准。
                </p>
            </div>
        </header>
    );
};
