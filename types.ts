import type { ReactNode } from 'react';

export type View = 'splash' | 'onboarding' | 'auth' | 'promptBuilder' | 'imageCreator' | 'gallery' | 'explore' | 'settings' | 'myPrompts' | 'AIdeator';

export type Theme = 'light' | 'dark';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface Prompt {
    id: string;
    userId: string;
    text: string;
    category: string;
    style: string;
    createdAt: number;
    sharerDisplayName?: string;
}

export interface PromptGenerationParams {
    category: string;
    style: string;
    subject?: string;
    mood?: string;
    composition?: string;
    lighting?: string;
}

export interface GeneratedImage {
    id: string;
    userId: string;
    promptId: string;
    promptText: string;
    imageUrl: string;
    createdAt: number;
}

export interface EditingSession {
  promptId: string;
  history: string[];
  historyIndex: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface CreativeSpark {
  title: string;
  description: string;
  icon: ReactNode;
  prompt: string;
}
