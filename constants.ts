import React from 'react';
import type { CreativeSpark } from './types';

export const PROMPT_CATEGORIES = [
    "Photography", "Design", "Business", "Art", "Logos", 
    "Fashion", "Architecture", "Lifestyle", "Technology", "Nature"
];

export const PROMPT_STYLES = [
    "Photorealistic", "Minimalist", "Cyberpunk", "Vintage", "Abstract",
    "Surreal", "Impressionistic", "Art Deco", "Vaporwave", "Cinematic"
];

export const PROMPT_MOODS = [
    "Default", "Cinematic", "Dramatic", "Ethereal", "Gloomy", "Joyful", "Mysterious", "Ominous", "Peaceful", "Energetic",
];

export const PROMPT_COMPOSITIONS = [
    "Default", "Close-up", "Wide Shot", "Portrait", "Landscape", "Dutch Angle", "Symmetrical", "Rule of Thirds", "Birds-eye View"
];

export const PROMPT_LIGHTING = [
    "Default", "Golden Hour", "Blue Hour", "Neon Glow", "Backlighting", "Soft Light", "Studio Lighting", "Moonlight", "High-contrast"
];

export const CREATIVE_LOADING_MESSAGES = [
    "Sketching with stardust...",
    "Consulting the digital muse...",
    "Painting with pixels...",
    "Weaving light and shadow...",
    "Translating dreams into data...",
    "Reticulating splines...",
    "Conjuring algorithms of art...",
    "Tuning the quantum easel...",
    "Polishing the final masterpiece...",
    "Unleashing creative energy...",
];

export const CREATIVE_SPARKS: CreativeSpark[] = [
    {
        title: 'Character Design',
        description: 'Create a unique character',
        icon: '🧑‍🚀',
        prompt: 'I want to design a new character.',
    },
    {
        title: 'Surreal Landscape',
        description: 'Imagine a dreamlike world',
        icon: '🏞️',
        prompt: 'Help me create a surreal landscape.',
    },
    {
        title: 'Sci-Fi Concept',
        description: 'Invent futuristic technology',
        icon: '🤖',
        prompt: 'Let\'s brainstorm a sci-fi concept.',
    },
    {
        title: 'Start from Scratch',
        description: 'Begin with your own idea',
        icon: '✍️',
        prompt: '', // This will just focus the input
    }
];
