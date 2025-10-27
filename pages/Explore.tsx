import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { getSharedPrompts } from '../services/firebaseService';
import type { Prompt } from '../types';

interface ExploreProps {
  onUsePrompt: (prompt: Prompt) => void;
}

const SkeletonCard: React.FC = () => (
    <GlassCard className="space-y-4 animate-pulse">
        <div className="h-16 bg-white/10 rounded-lg"></div>
        <div className="flex gap-2">
            <div className="h-6 w-24 bg-white/10 rounded-full"></div>
            <div className="h-6 w-28 bg-white/10 rounded-full"></div>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
            <div className="h-4 w-40 bg-white/10 rounded-full"></div>
            <div className="h-10 w-24 bg-white/10 rounded-xl"></div>
        </div>
    </GlassCard>
);

const Explore: React.FC<ExploreProps> = ({ onUsePrompt }) => {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPrompts = async () => {
            setIsLoading(true);
            try {
                // Simulate network latency for skeleton loader
                await new Promise(res => setTimeout(res, 1000)); 
                const sharedPrompts = await getSharedPrompts();
                setPrompts(sharedPrompts);
            } catch (error) {
                console.error("Failed to fetch shared prompts:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrompts();
    }, []);

    return (
        <div className="animate-fade-in-up">
            <Header title="Explore Community Prompts" />
            <div className="p-4">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                ) : prompts.length === 0 ? (
                    <GlassCard>
                        <div className="text-center py-20 flex flex-col items-center">
                            <span className="text-5xl mb-6">🛰️</span>
                            <h2 className="text-3xl font-bold font-display mb-2">No Signals Yet...</h2>
                            <p className="text-gray-400">Be the first to share a prompt from the Home screen and inspire the community!</p>
                        </div>
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {prompts.map(prompt => (
                            <GlassCard key={prompt.id} className="space-y-4 flex flex-col justify-between transition-all duration-300 hover:border-brand-cyan/50 hover:-translate-y-1 hover:shadow-glow-cyan">
                                <p className="text-gray-200 text-lg leading-relaxed">{prompt.text}</p>
                                <div>
                                    <div className="flex flex-wrap gap-2 text-sm mb-4">
                                        <span className="bg-brand-purple/50 text-white px-3 py-1 rounded-full font-medium">{prompt.category}</span>
                                        <span className="bg-brand-cyan/50 text-white px-3 py-1 rounded-full font-medium">{prompt.style}</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                                        <p className="text-xs text-gray-400">By: {prompt.sharerDisplayName}</p>
                                        <button onClick={() => onUsePrompt(prompt)} className="bg-green-600 text-white font-bold py-2 px-5 rounded-xl shadow-lg hover:bg-green-500 transition-colors text-sm transform hover:scale-105">
                                            Create
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        ))
                    }
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;