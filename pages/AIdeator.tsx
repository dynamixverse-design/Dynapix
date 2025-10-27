import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import type { Prompt, ChatMessage, CreativeSpark } from '../types';
import { IDEATOR_SYSTEM_INSTRUCTION } from '../services/geminiService';
import { CREATIVE_SPARKS } from '../constants';

interface AIdeatorProps {
    onUsePrompt: (prompt: Prompt) => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CreativeSparkCard: React.FC<{ spark: CreativeSpark, onClick: () => void }> = ({ spark, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-6 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg hover:border-brand-cyan/50 hover:-translate-y-1 hover:shadow-glow-cyan transition-all duration-300 group"
    >
        <div className="flex items-center gap-4">
            <div className="text-4xl">{spark.icon}</div>
            <div>
                <h3 className="text-xl font-bold font-display text-white group-hover:text-brand-cyan transition-colors">{spark.title}</h3>
                <p className="text-gray-400">{spark.description}</p>
            </div>
        </div>
    </button>
);

const AIdeator: React.FC<AIdeatorProps> = ({ onUsePrompt }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const initChat = () => {
            const chatSession = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: IDEATOR_SYSTEM_INSTRUCTION,
                },
            });
            setChat(chatSession);
        };
        initChat();
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);
    
    const startConversation = async (startMessage: string) => {
        if (!chat) return;
        setHasStarted(true);
        setIsLoading(true);

        const initialResponse = await chat.sendMessage({ message: startMessage || "Hello!" });
        const firstBotMessage: ChatMessage = { role: 'model', text: initialResponse.text };
        
        if (startMessage) {
            const userMessage: ChatMessage = { role: 'user', text: startMessage };
            setMessages([userMessage, firstBotMessage]);
        } else {
            setMessages([firstBotMessage]);
        }
        setIsLoading(false);
    };

    const handleSparkClick = (spark: CreativeSpark) => {
        if (spark.prompt) {
            startConversation(spark.prompt);
        } else {
            // "Start from Scratch"
            setHasStarted(true);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !chat || isLoading) return;
        
        const textToSend = input;
        const userMessage: ChatMessage = { role: 'user', text: textToSend };
        setInput('');

        // Handle first user message if they didn't use a spark
        if (messages.length === 0) {
            setMessages([userMessage]);
            setIsLoading(true);
            try {
                const initialResponse = await chat.sendMessage({ message: textToSend });
                setMessages([userMessage, { role: 'model', text: initialResponse.text }]);
            } catch (error) {
                 console.error("Error sending message:", error);
                 const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again." };
                 setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const result = await chat.sendMessageStream({ message: textToSend });
            let responseText = '';
            // Set up a temporary message to stream into
            const modelMessageIndex = messages.length + 1;
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of result) {
                responseText += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[modelMessageIndex] = { role: 'model', text: responseText };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const extractPromptFromCodeBlock = (text: string): string | null => {
        const match = text.match(/```([\s\S]*?)```/);
        return match ? match[1].trim() : null;
    }

    const renderMessage = (msg: ChatMessage, index: number) => {
        const isUser = msg.role === 'user';
        const finalPrompt = !isUser ? extractPromptFromCodeBlock(msg.text) : null;

        return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md md:max-w-lg p-4 rounded-3xl mb-4 animate-fade-in-up ${isUser ? 'bg-brand-purple/80 text-white rounded-br-lg' : 'bg-gray-800/60 text-gray-200 rounded-bl-lg'}`}>
                    {finalPrompt ? (
                        <div className="space-y-4">
                            <p>Here is the final prompt we've crafted. How does it look?</p>
                            <GlassCard className="!p-4 bg-black/40">
                                <p className="font-mono text-gray-300">{finalPrompt}</p>
                            </GlassCard>
                            <button
                                onClick={() => onUsePrompt({
                                    id: `prompt_${Date.now()}`, userId: 'mock_user', text: finalPrompt,
                                    category: 'AIdeator', style: 'Custom', createdAt: Date.now()
                                })}
                                className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-green-600 transition-colors duration-300 transform hover:scale-105"
                            >
                                ✨ Use This Prompt
                            </button>
                        </div>
                    ) : (
                        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen">
            <Header title="AI Creative Director" />
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                {!hasStarted ? (
                    <div className="flex flex-col justify-center items-center h-full animate-fade-in-up p-4">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-extrabold font-display mb-2 text-white">Spark Your Creativity</h2>
                            <p className="text-lg text-gray-400">Choose a starting point or begin with your own idea.</p>
                        </div>
                        <div className="w-full max-w-md space-y-4">
                            {CREATIVE_SPARKS.map(spark => (
                                <CreativeSparkCard key={spark.title} spark={spark} onClick={() => handleSparkClick(spark)} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map(renderMessage)}
                        {isLoading && messages.length > 0 && (
                            <div className="flex justify-start">
                                <div className="max-w-sm p-4 rounded-3xl mb-4 bg-gray-800/60 rounded-bl-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2.5 h-2.5 bg-brand-cyan rounded-full animate-pulse"></div>
                                        <div className="w-2.5 h-2.5 bg-brand-cyan rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                        <div className="w-2.5 h-2.5 bg-brand-cyan rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            {hasStarted && (
                <div className="p-4 bg-black/20 backdrop-blur-lg border-t border-white/10">
                    <form onSubmit={handleSendMessage}>
                        <GlassCard className="!p-0 flex items-center">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Tell Dyna your idea..."
                                className="flex-1 w-full p-4 bg-transparent text-white focus:outline-none placeholder-gray-400"
                                disabled={isLoading}
                            />
                            <button type="submit" disabled={isLoading || !input.trim()} className="p-4 text-brand-cyan disabled:text-gray-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            </button>
                        </GlassCard>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AIdeator;
