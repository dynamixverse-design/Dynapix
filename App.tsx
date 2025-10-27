import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
import Auth from './pages/Auth';
import PromptBuilder from './pages/PromptBuilder';
import ImageCreator from './pages/ImageCreator';
import Gallery from './pages/Gallery';
import Explore from './pages/Explore';
import Settings from './pages/Settings';
import MyPrompts from './pages/MyPrompts';
import AIdeator from './pages/AIdeator';
import BottomNav from './components/BottomNav';
import type { View, User, Prompt } from './types';
import { getCurrentUser, onAuthStateChanged, signOut } from './services/firebaseService';

const AppContent: React.FC = () => {
    const [view, setView] = useState<View>('splash');
    const [user, setUser] = useState<User | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged((user) => {
            setUser(user);
            if (initialLoading) {
                 setTimeout(() => {
                    const hasSeenOnboarding = localStorage.getItem('onboarding_complete');
                    if (!user) {
                        setView(hasSeenOnboarding ? 'auth' : 'onboarding');
                    } else {
                        setView('promptBuilder');
                    }
                    setInitialLoading(false);
                }, 3500); // Extended splash screen duration for new animation
            } else {
                if(!user) setView('auth');
            }
        });
        
        // Initial check
        setUser(getCurrentUser());

        return () => {
            // In a real Firebase app, you would call unsubscribe() here
        };
    }, [initialLoading]);

    const handleOnboardingComplete = () => {
        localStorage.setItem('onboarding_complete', 'true');
        setView('auth');
    };

    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
        setView('promptBuilder');
    };

    const handleLogout = async () => {
        await signOut();
        setUser(null);
        setView('auth');
    };

    const navigateToImageCreator = useCallback((prompt: Prompt) => {
        setActivePrompt(prompt);
        setView('imageCreator');
    }, []);
    
    const navigateToImageCreatorFromGallery = useCallback((promptText: string) => {
        const newPrompt: Prompt = {
            id: `prompt_${Date.now()}`,
            userId: user?.uid ?? 'mock_user',
            text: promptText,
            category: 'From Gallery',
            style: 'Custom',
            createdAt: Date.now(),
        };
        setActivePrompt(newPrompt);
        setView('imageCreator');
    }, [user]);


    const renderView = () => {
        if (initialLoading || view === 'splash') return <SplashScreen />;
        if (view === 'onboarding') return <Onboarding onComplete={handleOnboardingComplete} />;
        if (view === 'auth' || !user) return <Auth onLogin={handleLogin} />;
        
        // Add a key to force re-mount and trigger animations on view change
        const pageKey = view + (activePrompt ? activePrompt.id : '');

        switch (view) {
            case 'promptBuilder':
                return <PromptBuilder key={pageKey} onUsePrompt={navigateToImageCreator} />;
            case 'AIdeator':
                return <AIdeator key={pageKey} onUsePrompt={navigateToImageCreator} />;
            case 'imageCreator':
                return <ImageCreator key={pageKey} initialPrompt={activePrompt} />;
            case 'gallery':
                return <Gallery key={pageKey} onUsePrompt={navigateToImageCreatorFromGallery} />;
            case 'explore':
                return <Explore key={pageKey} onUsePrompt={navigateToImageCreator} />;
            case 'myPrompts':
                return <MyPrompts key={pageKey} onUsePrompt={navigateToImageCreator} />;
            case 'settings':
                return <Settings key={pageKey} onLogout={handleLogout} setView={setView} />;
            default:
                return <PromptBuilder key={pageKey} onUsePrompt={navigateToImageCreator} />;
        }
    };
    
    const showNav = user && !['splash', 'onboarding', 'auth'].includes(view);

    return (
        <div className="font-sans text-gray-200 min-h-screen">
          <main className={`transition-opacity duration-500 ${showNav ? 'pb-24' : ''}`}>
            {renderView()}
          </main>
          {showNav && <BottomNav currentView={view} setView={setView} />}
        </div>
    );
};

const App: React.FC = () => (
    <ThemeProvider>
        <AppContent />
    </ThemeProvider>
);

export default App;