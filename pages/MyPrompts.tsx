import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import { getUserPrompts, deleteUserPrompt } from '../services/firebaseService';
import type { Prompt } from '../types';
import TrashIcon from '../components/icons/TrashIcon';
import BookmarkIcon from '../components/icons/BookmarkIcon';

interface MyPromptsProps {
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
            <div className="h-10 w-36 bg-white/10 rounded-xl"></div>
        </div>
    </GlassCard>
);

const MyPrompts: React.FC<MyPromptsProps> = ({ onUsePrompt }) => {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);

    useEffect(() => {
        const fetchPrompts = async () => {
            setIsLoading(true);
            try {
                await new Promise(res => setTimeout(res, 750)); 
                const userPrompts = await getUserPrompts();
                setPrompts(userPrompts);
            } catch (error) {
                console.error("Failed to fetch saved prompts:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrompts();
    }, []);

    const filteredPrompts = useMemo(() => {
        if (!searchTerm) return prompts;
        return prompts.filter(p => p.text.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [prompts, searchTerm]);
    
    const handleDeleteConfirm = async () => {
        if (!promptToDelete) return;
        try {
            await deleteUserPrompt(promptToDelete.id);
            setPrompts(prev => prev.filter(p => p.id !== promptToDelete.id));
            setPromptToDelete(null);
        } catch (error) {
            console.error("Failed to delete prompt", error);
            alert("Failed to delete prompt. Please try again.");
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            );
        }

        if (prompts.length === 0) {
            return (
                <GlassCard>
                    <div className="text-center py-20 flex flex-col items-center">
                        <BookmarkIcon className="w-16 h-16 text-brand-cyan mb-6 opacity-50" />
                        <h2 className="text-3xl font-bold font-display mb-2">No Saved Prompts</h2>
                        <p className="text-gray-400 max-w-sm">
                            Save prompts from the Image Creator to see them here. Your personal library of ideas awaits!
                        </p>
                    </div>
                </GlassCard>
            );
        }
        
        if (filteredPrompts.length === 0) {
            return (
                <GlassCard>
                    <div className="text-center py-10">
                        <h2 className="text-2xl font-bold font-display mb-2">No Results Found</h2>
                        <p className="text-gray-400">Try adjusting your search term.</p>
                    </div>
                </GlassCard>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPrompts.map(prompt => (
                    <GlassCard key={prompt.id} className="space-y-4 flex flex-col justify-between transition-all duration-300 hover:border-brand-cyan/50 hover:-translate-y-1 hover:shadow-glow-cyan">
                        <div>
                            <p className="text-gray-200 text-lg leading-relaxed line-clamp-4">{prompt.text}</p>
                            <div className="flex flex-wrap gap-2 text-sm mt-4">
                                <span className="bg-brand-purple/50 text-white px-3 py-1 rounded-full font-medium">{prompt.category}</span>
                                <span className="bg-brand-cyan/50 text-white px-3 py-1 rounded-full font-medium">{prompt.style}</span>
                            </div>
                        </div>
                        <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                             <p className="text-xs text-gray-400">Saved: {new Date(prompt.createdAt).toLocaleDateString()}</p>
                             <div className="flex gap-2">
                                <button onClick={() => setPromptToDelete(prompt)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-300 transition-colors">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => onUsePrompt(prompt)} className="bg-green-600 text-white font-bold py-2 px-5 rounded-xl shadow-lg hover:bg-green-500 transition-colors text-sm transform hover:scale-105">
                                    Use
                                </button>
                             </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        );
    };

    return (
        <div className="animate-fade-in-up">
            <Header title="My Prompts" />
            <div className="p-4 space-y-4">
                {!isLoading && prompts.length > 0 && (
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search your prompts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-4 pl-12 bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-cyan focus:outline-none placeholder-gray-500"
                        />
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                )}
                {renderContent()}
            </div>

            {promptToDelete && (
                <Modal isOpen={!!promptToDelete} onClose={() => setPromptToDelete(null)} title="Delete Prompt">
                    <div className="space-y-6">
                        <p className="text-gray-300">
                            Are you sure you want to permanently delete this prompt?
                        </p>
                        <p className="bg-black/20 p-3 rounded-lg text-gray-400 border border-white/10">
                           "{promptToDelete.text}"
                        </p>
                        <div className="flex justify-end gap-4">
                            <button 
                                onClick={() => setPromptToDelete(null)}
                                className="bg-gray-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-gray-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteConfirm}
                                className="bg-red-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-red-500 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default MyPrompts;
