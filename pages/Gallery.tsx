import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import GalleryIcon from '../components/icons/GalleryIcon';
import Modal from '../components/Modal';
import DownloadIcon from '../components/icons/DownloadIcon';
import ShareIcon from '../components/icons/ShareIcon';
import CreateIcon from '../components/icons/CreateIcon';
import { getUserImages } from '../services/firebaseService';
import type { GeneratedImage } from '../types';

interface GalleryProps {
  onUsePrompt: (promptText: string) => void;
}

const SkeletonImage: React.FC = () => (
    <div className="w-full aspect-square bg-white/10 rounded-lg animate-pulse"></div>
);

const Gallery: React.FC<GalleryProps> = ({ onUsePrompt }) => {
    const [images, setImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

    useEffect(() => {
        const fetchImages = async () => {
            setIsLoading(true);
            try {
                // Simulate network latency for a better loading experience
                await new Promise(res => setTimeout(res, 750));
                const userImages = await getUserImages();
                setImages(userImages);
            } catch (error) {
                console.error("Failed to fetch gallery images:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchImages();
    }, []);
    
    const handleDownload = () => {
        if (!selectedImage) return;
        const link = document.createElement('a');
        link.href = selectedImage.imageUrl;
        link.download = `dynapix-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async () => {
        if (!selectedImage) return;
        try {
            const response = await fetch(selectedImage.imageUrl);
            const blob = await response.blob();
            const file = new File([blob], `dynapix-image.jpg`, { type: 'image/jpeg' });
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'AI Image by Dynapix',
                    text: `Created with Dynapix: "${selectedImage.promptText}"`,
                    files: [file]
                });
            } else {
                alert("Web Share API is not available on your browser.");
            }
        } catch (e) {
            console.error('Share failed', e);
            alert("Sharing failed. You can download the image and share it manually.");
        }
    };

    const handleUsePromptClick = () => {
        if (!selectedImage) return;
        onUsePrompt(selectedImage.promptText);
        setSelectedImage(null); // Close modal after action
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <SkeletonImage key={i} />)}
                </div>
            );
        }

        if (images.length === 0) {
            return (
                <GlassCard>
                    <div className="text-center py-20 flex flex-col items-center">
                        <GalleryIcon className="w-16 h-16 text-brand-cyan mb-6 opacity-50" />
                        <h2 className="text-3xl font-bold font-display mb-2">Your Gallery is Empty</h2>
                        <p className="text-gray-400 max-w-sm">
                            Head over to the 'Create' tab to generate your first AI masterpiece and save it here!
                        </p>
                    </div>
                </GlassCard>
            );
        }

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map(image => (
                    <div 
                        key={image.id} 
                        onClick={() => setSelectedImage(image)}
                        className="group relative aspect-square overflow-hidden rounded-xl border-2 border-white/10 shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-glow-cyan cursor-pointer"
                    >
                        <img 
                            src={image.imageUrl} 
                            alt={image.promptText} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                         <div className="absolute inset-0 bg-black/70 p-3 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-white text-xs line-clamp-3">{image.promptText}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="animate-fade-in-up">
            <Header title="My Gallery" />
            <div className="p-4">
                {renderContent()}
            </div>

            {selectedImage && (
                <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} title="Image Details">
                    <div className="space-y-4">
                        <img src={selectedImage.imageUrl} alt={selectedImage.promptText} className="w-full rounded-lg shadow-lg" />
                        
                        <div>
                            <h3 className="text-lg font-bold text-brand-cyan mb-2">Prompt</h3>
                            <p className="text-gray-300 bg-black/20 p-3 rounded-lg max-h-32 overflow-y-auto">{selectedImage.promptText}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-400">Generated On</h3>
                            <p className="text-gray-200">{new Date(selectedImage.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
                            <button onClick={handleUsePromptClick} className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-500 transition-colors transform hover:scale-105">
                                <CreateIcon className="w-5 h-5" />
                                <span>Use Prompt</span>
                            </button>
                             <button onClick={handleDownload} className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors transform hover:scale-105">
                                <DownloadIcon className="w-5 h-5" />
                                <span>Download</span>
                            </button>
                            <button onClick={handleShare} className="flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-500 transition-colors transform hover:scale-105">
                                <ShareIcon className="w-5 h-5" />
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Gallery;