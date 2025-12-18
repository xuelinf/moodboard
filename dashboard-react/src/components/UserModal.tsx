import React, { useState } from 'react';
import { X, Link as LinkIcon } from 'lucide-react';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, avatar?: string) => void;
}

const EMOJI_LIST = [
    '👨‍💻', '👩‍💻', '🤵', '👷', '🤴', '🦸', '🦹', '🧙',
    '🧟', '🧛', '🧞', '🧝', '🧚', '👼', '👽', '🤖',
    '🦁', '🐯', '🐺', '🦊', '🐻', '🐨', '🐼', '🐸',
    '🦄', '🐲', '🦖', '🐙', '🦋', '🐝', '🐞', '🦀'
];

export function UserModal({ isOpen, onClose, onSubmit }: UserModalProps) {
    const [name, setName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_LIST[0]);
    const [customAvatarUrl, setCustomAvatarUrl] = useState('');
    const [useCustomAvatar, setUseCustomAvatar] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            let avatarFinal = '';
            if (useCustomAvatar && customAvatarUrl.trim()) {
                avatarFinal = customAvatarUrl.trim();
            } else {
                avatarFinal = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${selectedEmoji}</text></svg>`;
            }

            onSubmit(name.trim(), avatarFinal);

            // Reset
            setName('');
            setSelectedEmoji(EMOJI_LIST[0]);
            setCustomAvatarUrl('');
            setUseCustomAvatar(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#0a0a0c] border border-border rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200 h-[600px] flex flex-col">

                <button onClick={onClose} className="absolute right-4 top-4 text-textSub hover:text-white z-10">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">添加新人员</h2>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-2">

                    {/* Avatar Preview */}
                    <div className="flex flex-col items-center gap-4 shrink-0">
                        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-5xl ring-2 ring-border overflow-hidden relative">
                            {useCustomAvatar && customAvatarUrl ? (
                                <img src={customAvatarUrl} className="w-full h-full object-cover" onError={() => setUseCustomAvatar(false)} />
                            ) : (
                                <img src={`data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${selectedEmoji}</text></svg>`} className="w-full h-full object-cover" />
                            )}
                        </div>

                        {/* Toggle between Emoji and Custom URL */}
                        <div className="flex gap-2 p-1 bg-[#18181b] rounded-lg">
                            <button
                                type="button"
                                onClick={() => setUseCustomAvatar(false)}
                                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${!useCustomAvatar ? 'bg-primary text-white shadow' : 'text-textSub hover:text-white'}`}
                            >
                                Emoji 表情
                            </button>
                            <button
                                type="button"
                                onClick={() => setUseCustomAvatar(true)}
                                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${useCustomAvatar ? 'bg-primary text-white shadow' : 'text-textSub hover:text-white'}`}
                            >
                                自定义图片
                            </button>
                        </div>
                    </div>

                    {/* Emoji Grid */}
                    {!useCustomAvatar && (
                        <div className="grid grid-cols-8 gap-2 p-2 bg-[#18181b] rounded-lg max-h-40 overflow-y-auto w-full shrink-0">
                            {EMOJI_LIST.map(emoji => (
                                <button
                                    type="button"
                                    key={emoji}
                                    onClick={() => setSelectedEmoji(emoji)}
                                    className={`w-8 h-8 flex items-center justify-center text-xl rounded hover:bg-white/10 transition-colors ${selectedEmoji === emoji ? 'bg-primary/20 ring-1 ring-primary' : ''}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Custom Avatar Input */}
                    {useCustomAvatar && (
                        <div className="bg-[#18181b] p-4 rounded-lg space-y-3 animate-in fade-in duration-200">
                            <label className="block text-xs font-bold text-textSub uppercase">图片链接 (URL)</label>
                            <div className="flex items-center gap-2 border border-border rounded px-3 py-2 focus-within:border-primary transition-colors">
                                <LinkIcon className="w-4 h-4 text-textSub" />
                                <input
                                    type="text"
                                    value={customAvatarUrl}
                                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                                    className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>
                            <p className="text-[10px] text-textSub">输入有效的图片地址，预览将自动更新。</p>
                        </div>
                    )}

                    <div className="pt-2">
                        <label className="block text-xs font-bold text-textSub uppercase mb-2">姓名</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#18181b] border border-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                            placeholder="输入人员姓名"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-colors mt-auto"
                    >
                        确认添加
                    </button>

                </form>
            </div>
        </div>
    );
}
