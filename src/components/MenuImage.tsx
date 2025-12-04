import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { getOptimizedImageUrl, ImagePreset } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';

interface MenuImageProps {
  src?: string | null;
  alt: string;
  preset?: ImagePreset;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'auto';
  showPlaceholder?: boolean;
  placeholderText?: string;
  onClick?: () => void;
}

/**
 * Unified image component for all menu item images.
 * Handles:
 * - Empty/null/undefined image URLs
 * - Cloudinary optimization
 * - Loading states
 * - Error fallbacks
 * - Placeholder display
 */
export const MenuImage = ({
  src,
  alt,
  preset = 'menuCard',
  className,
  aspectRatio = 'video',
  showPlaceholder = true,
  placeholderText = 'No image',
  onClick,
}: MenuImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Check if we have a valid image URL
  const hasValidImage = !!src && src.trim() !== '';
  
  // Get optimized URL only if we have a valid source
  const optimizedSrc = hasValidImage ? getOptimizedImageUrl(src, preset) : '';

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // Aspect ratio classes
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    auto: '',
  };

  // If no valid image, show placeholder
  if (!hasValidImage || hasError) {
    if (!showPlaceholder) return null;
    
    return (
      <div 
        className={cn(
          'bg-muted flex items-center justify-center',
          aspectClasses[aspectRatio],
          className
        )}
        onClick={onClick}
      >
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <ImageIcon className="w-8 h-8 opacity-50" />
          <span className="text-xs">{placeholderText}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectClasses[aspectRatio],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {/* Actual image */}
      <img
        src={hasError ? src : optimizedSrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

/**
 * Helper function to filter valid images from an array
 * Use this when passing images to ImageCarousel or ImageLightbox
 */
export const filterValidImages = (images?: string[] | null, fallbackImage?: string | null): string[] => {
  const validImages: string[] = [];
  
  // Add images from array if valid
  if (images && Array.isArray(images)) {
    images.forEach(img => {
      if (img && typeof img === 'string' && img.trim() !== '') {
        validImages.push(img);
      }
    });
  }
  
  // If no valid images in array, try fallback
  if (validImages.length === 0 && fallbackImage && fallbackImage.trim() !== '') {
    validImages.push(fallbackImage);
  }
  
  return validImages;
};

/**
 * Check if an image URL is valid (not empty, null, or whitespace)
 */
export const isValidImageUrl = (url?: string | null): boolean => {
  return !!url && typeof url === 'string' && url.trim() !== '';
};
