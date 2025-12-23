import React from 'react';
import { clsx } from 'clsx';

interface FeatureRowProps {
    number: string;
    title: React.ReactNode;
    description: string;
    imageSrc: string;
    isReverse?: boolean;
}

export const FeatureRow = ({ number, title, description, imageSrc, isReverse }: FeatureRowProps) => {
    return (
        <div className={clsx(
            "flex items-center justify-between max-w-[1280px] mx-auto py-[80px] px-[5%] gap-[60px] fade-in-up",
            "max-[900px]:flex-col max-[900px]:gap-[30px] max-[900px]:py-[50px] max-[900px]:px-[20px]",
            isReverse ? "flex-row-reverse" : "flex-row"
        )}>
            {/* Text Info */}
            <div className="flex-[0.8] w-full relative">
                {/* Large Background Number */}
                <span className="absolute -top-20 -left-4 text-[12rem] font-bold text-white/[0.03] select-none -z-10 leading-none font-sans">
                    {number.split(' ')[0]}
                </span>

                <span className="font-mono text-accent text-[0.9rem] mb-[15px] block tracking-[2px]">{number}</span>
                <h2 className="text-[2.2rem] mb-[20px] leading-[1.2] max-[900px]:text-[1.8rem] relative z-10">{title}</h2>
                <p className="text-text-sub text-[1rem] leading-[1.7] text-justify whitespace-pre-wrap relative z-10">
                    {description}
                </p>
            </div>

            {/* Visual */}
            <div className="flex-[1.2] h-[400px] relative w-full group max-[900px]:h-[300px]">
                <div className="w-full h-full bg-[#111] rounded-lg overflow-hidden relative border border-border-light transition-all duration-500 group-hover:scale-[1.02] group-hover:border-[rgba(99,102,241,0.3)]">
                    <img
                        src={imageSrc}
                        alt="Feature Visual"
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-1000"
                    />
                </div>
            </div>
        </div>
    );
};
