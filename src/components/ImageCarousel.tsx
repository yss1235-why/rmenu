import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';
import { filterValidImages } from './MenuImage';

interface ImageCarouselProps {
  images?: string[] | null;
  fallbackImage?: string | null;
  alt: string;
  onImageClick?: (index: number) => void;
  className?: string;
}

export const ImageCarousel = ({ 
  images, 
  fallbackImage,
  alt, 
  onImageClick, 
  className 
}: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<number>>(new Set());

  // Filter to only valid images
  const validImages = filterValidImages(images, fallbackImage);

  const minSwipeDistance = 50;

  const goToPrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
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

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  };

  const handleImageError = (index: number) => {
    setErrorImages(prev => new Set(prev).add(index));
  };

  // No valid images - show placeholder
  if (validImages.length === 0) {
    return (
      <div className={cn('aspect-video bg-muted flex items-center justify-center', className)}>
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <ImageIcon className="w-8 h-8 opacity-50" />
          <span className="text-sm">No image</span>
        </div>
      </div>
    );
  }

  // Single image - no carousel needed
  if (validImages.length === 1) {
    const isLoaded = loadedImages.has(0);
    const hasError = errorImages.has(0);
    
    return (
      <div 
        className={cn('aspect-video overflow-hidden cursor-pointer relative bg-muted', className)}
        onClick={() => onImageClick?.(0)}
      >
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={hasError ? validImages[0] : getOptimizedImageUrl(validImages[0], 'menuCard')}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => handleImageLoad(0)}
          onError={() => handleImageError(0)}
        />
      </div>
    );
  }

  // Multiple images - show carousel
  return (
    <div className={cn('relative aspect-video overflow-hidden group bg-muted', className)}>
      {/* Images */}
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {validImages.map((image, index) => {
          const isLoaded = loadedImages.has(index);
          const hasError = errorImages.has(index);
          
          return (
            <div
              key={index}
              className="min-w-full h-full cursor-pointer relative"
              onClick={() => onImageClick?.(index)}
            >
              {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
              <img
                src={hasError ? image : getOptimizedImageUrl(image, 'menuCard')}
                alt={`${alt} ${index + 1}`}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-300',
                  isLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
              />
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
        onClick={goToPrevious}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
        onClick={goToNext}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Dot Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {validImages.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(index);
            }}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index === currentIndex
                ? 'bg-white w-4'
                : 'bg-white/50 hover:bg-white/75'
            )}
          />
        ))}
      </div>
    </div>
  );
};
