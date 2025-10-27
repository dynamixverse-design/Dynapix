import type { User, Prompt, GeneratedImage, EditingSession } from '../types';

// MOCK DATABASE
let mockUser: User | null = JSON.parse(localStorage.getItem('dynapix_user') || 'null');
const mockSharedPrompts: Prompt[] = JSON.parse(localStorage.getItem('dynapix_shared_prompts') || '[]');
let mockUserPrompts: Prompt[] = JSON.parse(localStorage.getItem('dynapix_user_prompts') || '[]');
let mockGeneratedImages: GeneratedImage[] = JSON.parse(localStorage.getItem('dynapix_generated_images') || '[]');


const listeners: ((user: User | null) => void)[] = [];

const notifyListeners = () => {
  listeners.forEach(cb => cb(mockUser));
};

// MOCK FIREBASE AUTH FUNCTIONS
export const getCurrentUser = (): User | null => {
  return mockUser;
};

export const onAuthStateChanged = (callback: (user: User | null) => void): (() => void) => {
  listeners.push(callback);
  // initial call
  callback(mockUser);
  const unsubscribe = () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
  return unsubscribe;
};

export const signOut = async (): Promise<void> => {
  mockUser = null;
  localStorage.removeItem('dynapix_user');
  notifyListeners();
  return Promise.resolve();
};

export const signInWithGoogle = async (): Promise<User> => {
    const user: User = {
        uid: `google_${Date.now()}`,
        email: 'user@google.com',
        displayName: 'Google User',
        photoURL: 'https://i.pravatar.cc/150?u=google'
    };
    mockUser = user;
    localStorage.setItem('dynapix_user', JSON.stringify(mockUser));
    notifyListeners();
    return Promise.resolve(user);
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
    if (!email || !password) {
        throw new Error("Email and password are required.");
    }
    if (password === 'wrongpassword') {
        throw new Error("Invalid credentials.");
    }
    const user: User = {
        uid: `email_${Date.now()}`,
        email: email,
        displayName: email.split('@')[0],
        photoURL: `https://i.pravatar.cc/150?u=${email}`
    };
    mockUser = user;
    localStorage.setItem('dynapix_user', JSON.stringify(mockUser));
    notifyListeners();
    return Promise.resolve(user);
};

export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<User> => {
    if (!email || !password || !displayName) {
        throw new Error("Email, password, and name are required.");
    }
    const user: User = {
        uid: `email_${Date.now()}`,
        email: email,
        displayName: displayName,
        photoURL: `https://i.pravatar.cc/150?u=${email}`
    };
    mockUser = user;
    localStorage.setItem('dynapix_user', JSON.stringify(mockUser));
    notifyListeners();
    return Promise.resolve(user);
};

// MOCK FIRESTORE FUNCTIONS
export const saveUserPrompt = async (promptData: { text: string; category: string; style: string; }): Promise<void> => {
    if (!mockUser) throw new Error("User not authenticated");
    const newPrompt: Prompt = {
        id: `user_prompt_${Date.now()}`,
        userId: mockUser.uid,
        ...promptData,
        createdAt: Date.now(),
    };
    mockUserPrompts.unshift(newPrompt);
    localStorage.setItem('dynapix_user_prompts', JSON.stringify(mockUserPrompts));
    return Promise.resolve();
};

export const getUserPrompts = async (): Promise<Prompt[]> => {
    if (!mockUser) return Promise.resolve([]);
    // Ensure we only return prompts for the logged-in user
    const userPrompts = mockUserPrompts.filter(p => p.userId === mockUser?.uid);
    return Promise.resolve(userPrompts);
};

export const deleteUserPrompt = async (promptId: string): Promise<void> => {
    if (!mockUser) throw new Error("User not authenticated");
    mockUserPrompts = mockUserPrompts.filter(p => p.id !== promptId || p.userId !== mockUser?.uid);
    localStorage.setItem('dynapix_user_prompts', JSON.stringify(mockUserPrompts));
    return Promise.resolve();
};


export const sharePrompt = async (promptData: { text: string; category: string; style: string; }): Promise<void> => {
    if (!mockUser) throw new Error("User not authenticated");
    const newPrompt: Prompt = {
        id: `shared_${Date.now()}`,
        userId: mockUser.uid,
        ...promptData,
        createdAt: Date.now(),
        sharerDisplayName: mockUser.displayName || 'Anonymous'
    };
    mockSharedPrompts.unshift(newPrompt);
    localStorage.setItem('dynapix_shared_prompts', JSON.stringify(mockSharedPrompts));
    return Promise.resolve();
};


export const getSharedPrompts = async (): Promise<Prompt[]> => {
    return Promise.resolve(mockSharedPrompts);
};

export const updateUserProfile = async (updates: { displayName?: string; photoURL?: string; }): Promise<User> => {
    if (!mockUser) throw new Error("User not authenticated");
    mockUser = { ...mockUser, ...updates };
    localStorage.setItem('dynapix_user', JSON.stringify(mockUser));
    notifyListeners();
    return Promise.resolve(mockUser);
}

// This is a placeholder for a real implementation, e.g., using Firebase Storage
export const uploadProfileImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    });
};

export const deleteAccount = async (): Promise<void> => {
  console.log("Deleting account for user:", mockUser?.uid);
  mockUser = null;
  localStorage.removeItem('dynapix_user');
  // In a real app, you would also delete user data from Firestore/DB.
  // For this mock, we'll just clear the shared prompts as well for a full reset.
  localStorage.removeItem('dynapix_shared_prompts'); 
  localStorage.removeItem('dynapix_generated_images');
  localStorage.removeItem('dynapix_user_prompts');
  localStorage.removeItem('dynapix_editing_session');
  notifyListeners();
  return Promise.resolve();
};

// MOCK GALLERY/STORAGE FUNCTIONS
export const saveGeneratedImage = async (imageData: { promptText: string; imageUrl: string; }): Promise<void> => {
    if (!mockUser) throw new Error("User not authenticated");
    
    const newImage: GeneratedImage = {
        id: `image_${Date.now()}`,
        userId: mockUser.uid,
        promptId: `prompt_${Date.now()}`, // Could be linked to a real prompt if one was saved
        promptText: imageData.promptText,
        imageUrl: imageData.imageUrl,
        createdAt: Date.now(),
    };

    mockGeneratedImages.unshift(newImage); // Add to the beginning of the array
    localStorage.setItem('dynapix_generated_images', JSON.stringify(mockGeneratedImages));
    return Promise.resolve();
};

export const getUserImages = async (): Promise<GeneratedImage[]> => {
    if (!mockUser) {
        // Return empty array if no user is logged in, rather than throwing error
        return Promise.resolve([]);
    }
    const userImages = mockGeneratedImages.filter(image => image.userId === mockUser?.uid);
    return Promise.resolve(userImages);
};

// MOCK EDITING SESSION STORAGE
const getSessionKey = () => 'dynapix_editing_session';

export const saveEditingSession = async (session: EditingSession): Promise<void> => {
    localStorage.setItem(getSessionKey(), JSON.stringify(session));
    return Promise.resolve();
};

export const getEditingSession = async (): Promise<EditingSession | null> => {
    const sessionData = localStorage.getItem(getSessionKey());
    if (sessionData) {
        return Promise.resolve(JSON.parse(sessionData) as EditingSession);
    }
    return Promise.resolve(null);
};

export const clearEditingSession = async (): Promise<void> => {
    localStorage.removeItem(getSessionKey());
    return Promise.resolve();
};
