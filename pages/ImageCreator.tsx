import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { generateImage } from '../services/geminiService';
import { saveGeneratedImage, saveUserPrompt, getEditingSession, saveEditingSession, clearEditingSession } from '../services/firebaseService';
import { CREATIVE_LOADING_MESSAGES } from '../constants';
import type { Prompt, EditingSession } from '../types';
import DownloadIcon from '../components/icons/DownloadIcon';
import ShareIcon from '../components/icons/ShareIcon';
import SaveIcon from '../components/icons/SaveIcon';
import EditIcon from '../components/icons/EditIcon';
import FilterPreview from '../components/FilterPreview';
import UndoIcon from '../components/icons/UndoIcon';
import RedoIcon from '../components/icons/RedoIcon';
import HistoryPreview from '../components/HistoryPreview';
import BookmarkIcon from '../components/icons/BookmarkIcon';
import TrashIcon from '../components/icons/TrashIcon';

interface ImageCreatorProps {
  initialPrompt?: Prompt | null;
}

const FILTERS = [
    { name: 'Normal', value: 'none' },
    { name: 'Vintage', value: 'sepia(0.6) contrast(0.75) brightness(1.25) saturate(1.25)' },
    { name: 'Grayscale', value: 'grayscale(1)' },
    { name: 'Sepia', value: 'sepia(1)' },
    { name: 'Crimson', value: 'sepia(0.35) hue-rotate(-10deg) saturate(1.5)' },
    { name: 'Cyberpunk', value: 'contrast(1.2) hue-rotate(20deg) saturate(1.8)' },
];


const ImageCreator: React.FC<ImageCreatorProps> = ({ initialPrompt }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generatedImage, setGeneratedImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(CREATIVE_LOADING_MESSAGES[0]);
  const [isSaved, setIsSaved] = useState(false);
  const [isPromptSaved, setIsPromptSaved] = useState(false);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [activeFilter, setActiveFilter] = useState(FILTERS[0].value);
  const [activeTab, setActiveTab] = useState<'filters' | 'history'>('filters');
  
  // Undo/Redo state
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyRef = useRef<HTMLDivElement>(null);
  
  // Auto-save State
  const [loadedSession, setLoadedSession] = useState<EditingSession | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);


  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt.text);
    }
  }, [initialPrompt]);

  // Check for saved session on mount
  useEffect(() => {
    const checkForSession = async () => {
        if (initialPrompt?.id) {
            const session = await getEditingSession();
            // Check if session is for the current prompt and has actual edits
            if (session && session.promptId === initialPrompt.id && session.history.length > 1) {
                setLoadedSession(session);
                setShowResumePrompt(true);
            }
        }
    };
    checkForSession();
  }, [initialPrompt]);


  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessage(prev => {
            const currentIndex = CREATIVE_LOADING_MESSAGES.indexOf(prev);
            const nextIndex = (currentIndex + 1) % CREATIVE_LOADING_MESSAGES.length;
            return CREATIVE_LOADING_MESSAGES[nextIndex];
        });
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Scroll to the end of history timeline on update
  useEffect(() => {
    if (isEditing && activeTab === 'history' && historyRef.current) {
      historyRef.current.scrollLeft = historyRef.current.scrollWidth;
    }
  }, [history, isEditing, activeTab]);
  
  // Auto-save edits to local storage
  useEffect(() => {
    const autoSave = async () => {
      if (initialPrompt?.id && history.length > 1) {
        await saveEditingSession({
          promptId: initialPrompt.id,
          history,
          historyIndex,
        });
      }
    };
    
    // Only run save if there's history to prevent saving on initial load
    if(history.length > 0) {
      autoSave();
    }
  }, [history, historyIndex, initialPrompt?.id]);

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt to begin.');
      return;
    }
    // Clear any previous session before generating a new image
    await clearEditingSession();
    setShowResumePrompt(false);
    setLoadedSession(null);

    setIsLoading(true);
    setError('');
    setGeneratedImage('');
    setIsSaved(false);
    setIsEditing(false);
    setActiveFilter(FILTERS[0].value);
    try {
      const imageUrl = await generateImage(prompt, aspectRatio);
      setGeneratedImage(imageUrl);
      // Initialize history for undo/redo
      setHistory([imageUrl]);
      setHistoryIndex(0);
    } catch (err) {
      setError((err as Error).message || "Failed to generate image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `dynapix-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleShare = async () => {
    if(!generatedImage) return;
    try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], `dynapix-image.jpg`, { type: 'image/jpeg' });
        if(navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'AI Image by Dynapix',
                text: `Created with Dynapix: "${prompt}"`,
                files: [file]
            });
        } else {
            alert("Web Share API is not available on your browser.");
        }
    } catch(e) {
        console.error('Share failed', e);
        alert("Sharing failed. You can download the image and share it manually.");
    }
  }

  const handleSaveToGallery = async () => {
    if (!generatedImage || !prompt) return;
    try {
        await saveGeneratedImage({
            promptText: prompt,
            imageUrl: generatedImage,
        });
        setIsSaved(true);
    } catch (error) {
        console.error("Failed to save image", error);
        alert("Could not save image to gallery. Please try again.");
    }
  };
  
    const handleSavePrompt = async () => {
        if (!prompt) return;
        try {
            await saveUserPrompt({
                text: prompt,
                category: initialPrompt?.category || 'Custom',
                style: initialPrompt?.style || 'Custom',
            });
            setIsPromptSaved(true);
            setTimeout(() => setIsPromptSaved(false), 3000);
        } catch (error) {
            console.error("Failed to save prompt", error);
            alert("Could not save prompt. Please try again.");
        }
    };

  const handleApplyEdit = () => {
    if (!generatedImage || activeFilter === 'none') {
        setIsEditing(false);
        setActiveTab('filters');
        return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    // Use the base image from the current history point for applying filters
    img.src = history[historyIndex];

    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.filter = activeFilter;
            ctx.drawImage(img, 0, 0);
            const editedImageUrl = canvas.toDataURL('image/jpeg');
            
            // Update history stack
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(editedImageUrl);
            setHistory(newHistory);
            const newIndex = newHistory.length - 1;
            setHistoryIndex(newIndex);
            
            setGeneratedImage(editedImageUrl);
        }
        setIsEditing(false);
        setActiveFilter(FILTERS[0].value);
        setActiveTab('filters');
    };
    img.onerror = () => {
        alert("Could not apply edit. Please try again.");
        setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
      setIsEditing(false);
      setActiveFilter(FILTERS[0].value);
      setActiveTab('filters');
  };
  
  const handleUndo = () => {
    if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setGeneratedImage(history[newIndex]);
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setGeneratedImage(history[newIndex]);
    }
  };

  const handleHistoryClick = (index: number) => {
    setHistoryIndex(index);
    setGeneratedImage(history[index]);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setActiveTab('filters'); // Default to filters tab when opening
  };
  
  const handleResumeEditing = () => {
    if (loadedSession) {
      setHistory(loadedSession.history);
      setHistoryIndex(loadedSession.historyIndex);
      setGeneratedImage(loadedSession.history[loadedSession.historyIndex]);
      setIsEditing(true);
      setShowResumePrompt(false);
      setLoadedSession(null);
    }
  };
  
  const handleDiscardSession = async () => {
    await clearEditingSession();
    setShowResumePrompt(false);
    setLoadedSession(null);
  };

  const handleClearHistory = () => {
    if (history.length > 1) {
        const originalImage = history[0];
        setHistory([originalImage]);
        setHistoryIndex(0);
        setGeneratedImage(originalImage);
        // Also clear the auto-saved session
        clearEditingSession(); 
    }
  };

  return (
    <div className="animate-fade-in-up">
      <Header title="Image Creator" />
      {showResumePrompt && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-40 animate-fade-in-up">
            <GlassCard className="!p-4 flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-gray-200">Resume previous edit?</p>
                <div className="flex gap-2">
                    <button onClick={handleDiscardSession} className="bg-red-600/80 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-500 transition-colors text-xs">Discard</button>
                    <button onClick={handleResumeEditing} className="bg-green-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-green-500 transition-colors text-xs">Resume</button>
                </div>
            </GlassCard>
        </div>
      )}
      <div className="p-4 space-y-6">
        <GlassCard>
          <textarea
            value={prompt}
            onChange={(e) => {
                setPrompt(e.target.value);
                setIsPromptSaved(false);
            }}
            rows={5}
            placeholder="Describe your vision... a futuristic cityscape at dawn, a mystical forest creature..."
            className="w-full p-3 bg-black/20 border-0 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:outline-none text-gray-200 placeholder-gray-500"
          />
          <div className="mt-3 flex justify-end">
            <button
                onClick={handleSavePrompt}
                disabled={!prompt || isPromptSaved}
                className={`flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-xl text-sm transition-all transform hover:scale-105 disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed ${isPromptSaved ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
            >
                <BookmarkIcon className="w-5 h-5" />
                <span>{isPromptSaved ? 'Saved!' : 'Save Prompt'}</span>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <h3 className="text-md font-semibold mb-3">Aspect Ratio</h3>
            <div className="flex bg-black/20 p-1 rounded-full">
              {['1:1', '16:9', '9:16'].map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`w-full py-2 text-sm font-bold rounded-full transition-all duration-300 ${aspectRatio === ratio ? 'bg-brand-cyan text-gray-900' : 'text-gray-300'}`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg hover:shadow-glow-purple transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:scale-100">
          {isLoading ? 'Creating Magic...' : '🎨 Generate Image'}
        </button>
        
        {error && <p className="text-red-400 text-center font-semibold">{error}</p>}

        {isLoading && (
            <GlassCard className="flex flex-col items-center justify-center p-8 space-y-6">
                 <div className="w-28 h-28 relative">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-purple to-brand-cyan animate-pulse-glow"></div>
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple absolute top-0 left-0 animate-pulse-glow opacity-70" style={{animationDelay: '1.5s'}}></div>
                 </div>
                 <div className="text-center h-8">
                    <p key={loadingMessage} className="text-lg text-gray-300 animate-text-fade-in">{loadingMessage}</p>
                 </div>
            </GlassCard>
        )}

        {generatedImage && (
          <GlassCard className="animate-fade-in-up space-y-4">
            <img 
                src={generatedImage} 
                alt="Generated by AI" 
                className="w-full rounded-lg shadow-2xl border-2 border-white/10 transition-all duration-300" 
                style={{ filter: isEditing ? activeFilter : 'none' }}
            />
            {isEditing ? (
                <div className="space-y-4 animate-fade-in-up">
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleUndo} disabled={historyIndex <= 0} className="flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <UndoIcon className="w-5 h-5" />
                            <span>Undo</span>
                        </button>
                        <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <RedoIcon className="w-5 h-5" />
                            <span>Redo</span>
                        </button>
                    </div>

                    <div className="flex bg-black/20 p-1 rounded-full mt-2">
                        {(['filters', 'history'] as const).map(tab => (
                            <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full py-2 text-sm font-bold rounded-full transition-all duration-300 capitalize ${activeTab === tab ? 'bg-brand-cyan text-gray-900' : 'text-gray-300'}`}
                            >
                            {tab}
                            </button>
                        ))}
                    </div>
                    
                    <div className="min-h-[160px] py-2">
                      {activeTab === 'filters' && (
                        <div className="animate-fade-in-up">
                          <h3 className="text-md font-semibold text-gray-300 mb-2">Apply a Filter</h3>
                          <div className="flex justify-center items-center gap-2 overflow-x-auto p-2 -mx-2 custom-scrollbar">
                              {FILTERS.map(filter => (
                                <FilterPreview
                                  key={filter.name}
                                  imageSrc={history[historyIndex]} // Preview on current history state
                                  filter={filter}
                                  isActive={activeFilter === filter.value}
                                  onClick={() => setActiveFilter(filter.value)}
                                />
                              ))}
                          </div>
                        </div>
                      )}
                      {activeTab === 'history' && (
                        <div className="animate-fade-in-up">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-md font-semibold text-gray-300">Select a Previous State</h3>
                            {history.length > 1 && (
                                <button 
                                    onClick={handleClearHistory}
                                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold transition-colors p-1 rounded-md hover:bg-red-500/10"
                                    aria-label="Clear edit history"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    Clear History
                                </button>
                            )}
                          </div>
                          <div ref={historyRef} className="flex items-center gap-3 overflow-x-auto pb-3 -mx-2 px-2 custom-scrollbar">
                              {history.map((histItem, index) => (
                                  <HistoryPreview
                                      key={`${index}-${histItem.slice(-10)}`}
                                      imageSrc={histItem}
                                      isActive={index === historyIndex}
                                      onClick={() => handleHistoryClick(index)}
                                      isOriginal={index === 0}
                                  />
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                        <button onClick={handleCancelEdit} className="bg-gray-600 text-white font-bold py-3 rounded-xl hover:bg-gray-500 transition-colors">Cancel</button>
                        <button onClick={handleApplyEdit} className="bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-500 transition-colors">Apply Changes</button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button onClick={handleSaveToGallery} disabled={isSaved} className={`flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all transform hover:scale-105 ${isSaved ? 'bg-green-600 text-white cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                        <SaveIcon className="w-5 h-5" />
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                    <button onClick={handleDownload} className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors transform hover:scale-105">
                        <DownloadIcon className="w-5 h-5" />
                        <span>Download</span>
                    </button>
                    <button onClick={handleShare} className="flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-500 transition-colors transform hover:scale-105">
                        <ShareIcon className="w-5 h-5" />
                        <span>Share</span>
                    </button>
                    <button onClick={handleStartEditing} className="flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-3 rounded-xl hover:bg-gray-500 transition-colors transform hover:scale-105">
                        <EditIcon className="w-5 h-5" />
                        <span>Edit</span>
                    </button>
                </div>
            )}
          </GlassCard>
        )}
      </div>
       <style>{`
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px 5px rgba(139, 92, 246, 0.4), 0 0 20px 5px rgba(34, 211, 238, 0.4); transform: scale(1); }
            50% { box-shadow: 0 0 40px 15px rgba(139, 92, 246, 0.6), 0 0 40px 15px rgba(34, 211, 238, 0.6); transform: scale(1.05); }
        }
        .animate-pulse-glow {
            animation: pulse-glow 3s infinite ease-in-out;
        }
        @keyframes text-fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-text-fade-in {
            animation: text-fade-in 0.5s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
            height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
            border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: var(--brand-purple);
            border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: var(--brand-cyan);
        }
        @keyframes fade-in-up {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ImageCreator;