import React, { useState } from 'react';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { PROMPT_CATEGORIES, PROMPT_STYLES, PROMPT_MOODS, PROMPT_COMPOSITIONS, PROMPT_LIGHTING } from '../constants';
import { generatePrompt } from '../services/geminiService';
import { sharePrompt } from '../services/firebaseService';
import type { Prompt, PromptGenerationParams } from '../types';

const PromptBuilder: React.FC<{ onUsePrompt: (prompt: Prompt) => void; }> = ({ onUsePrompt }) => {
  const [category, setCategory] = useState(PROMPT_CATEGORIES[0]);
  const [style, setStyle] = useState(PROMPT_STYLES[0]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isShared, setIsShared] = useState(false);
  
  // Advanced options
  const [subject, setSubject] = useState('');
  const [mood, setMood] = useState('Default');
  const [composition, setComposition] = useState('Default');
  const [lighting, setLighting] = useState('Default');
  const [showAdvanced, setShowAdvanced] = useState(false);


  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedPrompt('');
    setIsShared(false);
    try {
      const params: PromptGenerationParams = { category, style, subject, mood, composition, lighting };
      const promptText = await generatePrompt(params);
      setGeneratedPrompt(promptText);
    } catch (error) {
      console.error(error);
      setGeneratedPrompt("Sorry, couldn't generate a prompt. The creative circuits are buzzing too loudly. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUsePrompt = () => {
    if (!generatedPrompt) return;
    onUsePrompt({
        id: `prompt_${Date.now()}`, userId: 'mock_user', text: generatedPrompt,
        category, style, createdAt: Date.now()
    });
  }

  const handleRandomize = () => {
    setCategory(PROMPT_CATEGORIES[Math.floor(Math.random() * PROMPT_CATEGORIES.length)]);
    setStyle(PROMPT_STYLES[Math.floor(Math.random() * PROMPT_STYLES.length)]);
    setSubject('');
    setMood(PROMPT_MOODS[Math.floor(Math.random() * PROMPT_MOODS.length)]);
    setComposition(PROMPT_COMPOSITIONS[Math.floor(Math.random() * PROMPT_COMPOSITIONS.length)]);
    setLighting(PROMPT_LIGHTING[Math.floor(Math.random() * PROMPT_LIGHTING.length)]);
  };

  const handleSharePrompt = async () => {
    if (!generatedPrompt) return;
    try {
        await sharePrompt({ text: generatedPrompt, category, style });
        setIsShared(true);
        setTimeout(() => setIsShared(false), 3000);
    } catch(e) {
        console.error("Failed to share prompt", e);
        alert("Could not share prompt. Please try again.");
    }
  }

  const CustomSelect = ({ label, value, onChange, options }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[] }) => (
    <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-200">{label}</h3>
        <div className="relative">
            <select value={value} onChange={onChange} className="w-full appearance-none p-4 bg-black/30 border border-white/20 rounded-xl focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan focus:outline-none">
                {options.map(o => <option key={o} value={o} className="bg-gray-800">{o}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <Header title="Prompt Builder" />
      <div className="p-4 space-y-6">
        <GlassCard>
            <CustomSelect label="1. Choose a Category" value={category} onChange={(e) => setCategory(e.target.value)} options={PROMPT_CATEGORIES} />
        </GlassCard>
        
        <GlassCard>
            <CustomSelect label="2. Pick a Style" value={style} onChange={(e) => setStyle(e.target.value)} options={PROMPT_STYLES} />
        </GlassCard>

        <GlassCard>
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
                <h3 className="text-lg font-semibold text-gray-200">3. Fine-Tune Details (Optional)</h3>
                <svg className={`w-6 h-6 text-brand-cyan transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {showAdvanced && (
                <div className="mt-6 space-y-4 border-t border-white/10 pt-6 animate-fade-in-up">
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-200">Subject</h3>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g., a lone wolf, futuristic city"
                            className="w-full p-3 bg-black/30 border border-white/20 rounded-xl focus:ring-2 focus:ring-brand-cyan focus:outline-none placeholder-gray-500"
                        />
                    </div>
                    <CustomSelect label="Mood" value={mood} onChange={(e) => setMood(e.target.value)} options={PROMPT_MOODS} />
                    <CustomSelect label="Composition" value={composition} onChange={(e) => setComposition(e.target.value)} options={PROMPT_COMPOSITIONS} />
                    <CustomSelect label="Lighting" value={lighting} onChange={(e) => setLighting(e.target.value)} options={PROMPT_LIGHTING} />
                </div>
            )}
        </GlassCard>

        <div className="grid grid-cols-2 gap-4">
            <button onClick={handleRandomize} className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <span>🎲</span> Randomize
            </button>
            <button onClick={handleGenerate} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-glow-purple transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:scale-100 disabled:shadow-none">
              {isLoading ? 'Generating...' : <>✨ Generate</>}
            </button>
        </div>

        {(isLoading || generatedPrompt) && (
          <GlassCard className="animate-fade-in-up">
            {isLoading && !generatedPrompt && <p className="text-center text-gray-400 animate-pulse">The AI is thinking...</p>}
            {generatedPrompt && (
                <>
                <h3 className="text-lg font-semibold mb-3">Your Generated Prompt:</h3>
                <textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  rows={6}
                  className="w-full p-3 bg-black/20 border border-white/20 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:outline-none text-gray-300"
                />
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button onClick={handleSharePrompt} disabled={isShared} className={`w-full font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${isShared ? 'bg-green-600 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                        {isShared ? '✅ Shared!' : '🌍 Share'}
                    </button>
                    <button onClick={handleUsePrompt} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-green-600 transition-colors duration-300 transform hover:scale-105">
                        Create Image
                    </button>
                </div>
                </>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default PromptBuilder;