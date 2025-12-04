import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';
import { filterValidImages } from './MenuImage';

interface ImageLightboxProps {
  images?: string[] | null;
  fallbackImage?: string | null;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLightbox = ({ 
  images, 
  fallbackImage,
  initialIndex = 0, 
  isOpen, 
  onClose 
}: ImageLightboxProps) => {
  // Filter to only valid images
  const validImages = filterValidImages(images, fallbackImage);
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const minSwipeDistance = 50;

  useEffect(() => {
    // Reset to initial index when opened, but clamp to valid range
    const maxIndex = Math.max(0, validImages.length - 1);
    setCurrentIndex(Math.min(initialIndex, maxIndex));
    setIsLoaded(false);
    setHasError(false);
  }, [initialIndex, isOpen, validImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, validImages.length]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const goToPrevious = () => {
    if (validImages.length <= 1) return;
    setIsLoaded(false);
    setHasError(false);
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    if (validImages.length <= 1) return;
    setIsLoaded(false);
    setHasError(false);
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) goToNext();
    else if (isRightSwipe) goToPrevious();
  };

  if (!isOpen) return null;

  // No valid images
  if (validImages.length === 0) {
    return (
      <div 
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>
        <div className="flex flex-col items-center gap-2 text-white/60">
          <ImageIcon className="w-16 h-16" />
          <span>No image available</span>
        </div>
      </div>
    );
  }

  const currentImage = validImages[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Image Counter */}
      {validImages.length > 1 && (
        <div className="absolute top-4 left-4 text-white/80 text-sm">
          {currentIndex + 1} / {validImages.length}
        </div>
      )}

      {/* Main Image */}
      <div
        className="w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Loading indicator */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        
        <img
          src={hasError ? currentImage : getOptimizedImageUrl(currentImage, 'hero')}
          alt={`Image ${currentIndex + 1}`}
          className={cn(
            'max-w-full max-h-full object-contain transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
        />
      </div>

      {/* Navigation Arrows */}
      {validImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </>
      )}

      {/* Dot Indicators */}
      {validImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setIsLoaded(false);
                setHasError(false);
                setCurrentIndex(index);
              }}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all',
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/75'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};
