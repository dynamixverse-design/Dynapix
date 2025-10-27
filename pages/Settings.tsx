import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import SettingsRow from '../components/SettingsRow';
import ThemeToggle from '../components/ThemeToggle';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { getCurrentUser, updateUserProfile, uploadProfileImage, deleteAccount } from '../services/firebaseService';
import type { User, View } from '../types';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import EditIcon from '../components/icons/EditIcon';
import CameraIcon from '../components/icons/CameraIcon';
import TrashIcon from '../components/icons/TrashIcon';
import BookmarkIcon from '../components/icons/BookmarkIcon';

interface SettingsProps {
  onLogout: () => void;
  setView: (view: View) => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout, setView }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setDisplayName(currentUser?.displayName || '');
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !displayName) return;
    setIsSaving(true);
    try {
      const updatedUser = await updateUserProfile({ displayName });
      setUser(updatedUser);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      onLogout(); // This will navigate to auth screen
    } catch (error) {
      console.error("Failed to delete account", error);
      alert("Failed to delete account. Please try again.");
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setIsSaving(true);
        try {
            const photoURL = await uploadProfileImage(file);
            const updatedUser = await updateUserProfile({ photoURL });
            setUser(updatedUser);
        } catch (error) {
            console.error("Failed to upload image", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }
  }

  if (!user) {
    return (
      <div className="animate-fade-in-up">
        <Header title="Profile" />
        <div className="p-4 text-center">Loading user profile...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <Header title="Profile" />
      <div className="p-4 space-y-6">
        <GlassCard className="flex flex-col items-center text-center">
            <div className="relative mb-4">
                <Avatar src={user.photoURL} name={user.displayName} size={128}>
                    <button onClick={handleAvatarClick} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full">
                        <CameraIcon className="w-8 h-8 text-white" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </Avatar>
            </div>
            <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold font-display">{user.displayName}</h2>
                <button onClick={() => setIsEditModalOpen(true)} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
                    <EditIcon className="w-5 h-5 text-gray-400" />
                </button>
            </div>
            <p className="text-gray-400">{user.email}</p>
        </GlassCard>

        <GlassCard>
            <SettingsRow 
                icon={<span className="text-2xl">🎨</span>}
                label="Theme"
                action={<ThemeToggle />}
            />
            <div className="my-2 border-t border-white/10"></div>
             <SettingsRow 
                icon={<BookmarkIcon className="w-6 h-6" />}
                label="My Prompts"
                onClick={() => setView('myPrompts')}
                action={<ChevronRightIcon className="w-6 h-6 text-gray-500" />}
            />
            <div className="my-2 border-t border-white/10"></div>
            <SettingsRow 
                icon={<span className="text-2xl">🔔</span>}
                label="Notifications"
                onClick={() => alert("Notification settings coming soon!")}
                action={<ChevronRightIcon className="w-6 h-6 text-gray-500" />}
            />
            <div className="my-2 border-t border-white/10"></div>
            <SettingsRow 
                icon={<span className="text-2xl">🛡️</span>}
                label="Privacy Policy"
                onClick={() => alert("Privacy Policy coming soon!")}
                action={<ChevronRightIcon className="w-6 h-6 text-gray-500" />}
            />
        </GlassCard>
        
        <GlassCard className="border-red-500/30">
            <h3 className="text-xl font-bold text-red-400 mb-2 font-display">Danger Zone</h3>
            <SettingsRow 
                icon={<TrashIcon className="w-6 h-6 text-red-400" />}
                label={<span className="text-red-400 font-semibold">Delete Account</span>}
                onClick={() => setIsDeleteModalOpen(true)}
                className="!p-3 !bg-transparent hover:!bg-red-500/20"
                action={<ChevronRightIcon className="w-6 h-6 text-red-500" />}
            />
        </GlassCard>

        <button onClick={onLogout} className="w-full bg-red-600/50 border border-red-500/80 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-red-600/70 transition-all duration-300">
          Log Out
        </button>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile">
        <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                <input 
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-3 bg-black/40 border border-white/20 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                    required
                />
            </div>
            <button type="submit" disabled={isSaving} className="w-full bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-bold py-3 px-4 rounded-xl text-lg disabled:opacity-60">
                {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
      </Modal>
      
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Account Deletion">
        <div className="space-y-6">
            <p className="text-gray-300">
                Are you absolutely sure? This action cannot be undone. This will permanently delete your account and all associated data.
            </p>
            <div className="flex justify-end gap-4">
                <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="bg-gray-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-gray-500 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleDeleteAccount}
                    className="bg-red-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-red-500 transition-colors"
                >
                    Delete Account
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
