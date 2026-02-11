// Marisol Code file for image upload handling 1/28/26 =====================
'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  currentImage: string | null;
  onImageUpdate: (imageUrl: string | null) => void;
  type?: 'profile' | 'banner';
  userEmail: string;
  username: string;
}

export default function ImageUpload({ 
  currentImage,
  onImageUpdate,
  type = 'profile',
  userEmail,
  username
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

// Added by Marisol for Dark Mode - 2/8/2026 Start
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);
// Added by Marisol for Dark Mode - 2/8/2026 End

  // Update preview when currentImage prop changes (e.g., after login)
  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);


  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    formData.append('email', userEmail);

    try {
      const response = await fetch('http://localhost:4000/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      onImageUpdate(data.imageUrl);
      setError('');
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
      setPreview(currentImage);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async () => {
    if (!window.confirm('Are you sure you want to remove this image? Your default image will be restored.')) {
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/remove-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          type: type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove image');
      }

      setPreview(null);
      onImageUpdate(null);
    } catch (error) {
      console.error('Remove error:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove image');
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'UN';
  };

  const isProfile = type === 'profile';
  const hasCustomImage = preview !== null;
  
  return (
    <div className="space-y-2">
      <div className={`relative ${isProfile ? 'w-20 h-20' : 'w-full h-32'}`}>
        <div 
          className={`relative overflow-hidden ${
            isProfile 
              ? 'rounded-full' 
              : 'rounded-lg'
          } w-full h-full border-2`}
          style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgb(243, 244, 246)' }} // Changed by Marisol for Dark Mode - 2/8/2026
        >
          {hasCustomImage ? (
            <img
              src={preview}
              alt={isProfile ? 'Profile' : 'Banner'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${
              isProfile 
                ? 'from-[#FFA239] to-[#FF5656]' 
                : 'from-[#8CE4FF] via-[#FEEE91] to-[#FFA239]'
            } flex items-center justify-center`}>
              {isProfile ? (
                <span className="text-2xl font-bold text-white">
                  {getInitials(username)}
                </span>
              ) : (
                <Camera className="w-8 h-8 text-white/40" />
              )}
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {!isUploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`absolute ${
              isProfile ? 'bottom-0 right-0' : 'bottom-2 right-2'
            } bg-[#8CE4FF] text-gray-900 p-2 rounded-full hover:bg-[#6DD5FF] transition-colors shadow-lg disabled:opacity-50`}
            title={hasCustomImage ? `Change ${isProfile ? 'profile photo' : 'cover image'}` : `Upload ${isProfile ? 'profile photo' : 'cover image'}`}
          >
            <Camera className="w-4 h-4" />
          </button>
        )}

        {hasCustomImage && !isUploading && (
          <button
            onClick={removeImage}
            className={`absolute ${
              isProfile ? 'top-0 right-0' : 'top-2 right-2'
            } bg-[#FF5656] text-white p-2 rounded-full hover:bg-[#FF3838] transition-colors shadow-lg`}
            title="Remove image and restore default"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-sm text-[#FF5656]">{error}</p>
      )}
    </div>
  );
}