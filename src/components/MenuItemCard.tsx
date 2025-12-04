import { MenuItem } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/cloudinary';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onView?: (item: MenuItem) => void;
  variant?: 'featured' | 'compact';
}

export const MenuItemCard = ({ item, onAddToCart, onView, variant = 'featured' }: MenuItemCardProps) => {
  // Get optimized image URL from Cloudinary (only if image exists)
  const imageUrl = item.image ? getOptimizedImageUrl(item.image, variant === 'featured' ? 'menuCard' : 'thumbnail') : '';
  const hasImage = !!item.image && item.image.trim() !== '';

  // Compact variant for 2-per-row grid on mobile
  if (variant === 'compact') {
    return (
      <div className="menu-card no-select cursor-pointer" onClick={() => onView?.(item)}>
        {/* Image Container - Square aspect ratio for compact */}
        <div className="relative">
          {hasImage ? (
            <img
              src={imageUrl}
              alt={item.name}
              className="aspect-square w-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = item.image;
              }}
            />
          ) : (
            <div className="aspect-square w-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xs">No image</span>
            </div>
          )}
          {item.isSpecial && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
              Special
            </Badge>
          )}
          {!item.available && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-muted-foreground text-sm font-medium">Unavailable</span>
            </div>
          )}
        </div>

        {/* Compact Content */}
        <div className="p-2.5">
          <h3 className="font-serif text-sm font-semibold text-foreground leading-tight line-clamp-2 mb-1">
            {item.name}
          </h3>
          <p className="text-muted-foreground text-xs mb-2 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="font-serif text-sm text-primary font-bold">
              ${item.price.toFixed(2)}
            </span>
            <Button
              onClick={() => onAddToCart(item)}
              disabled={!item.available}
              className="rounded-full p-0 w-8 h-8 min-w-0"
              size="icon"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Featured variant (full-width) - original design
 return (
    <div className="menu-card no-select cursor-pointer" onClick={() => onView?.(item)}>
      {/* Image Container */}
      <div className="relative">
        {hasImage ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="menu-card-image"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = item.image;
            }}
          />
        ) : (
          <div className="menu-card-image bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
        {item.isSpecial && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2 py-1">
            Special
          </Badge>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-muted-foreground font-medium">Unavailable</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-serif text-lg font-semibold text-foreground leading-tight">
            {item.name}
          </h3>
          <span className="font-serif text-lg text-primary font-bold whitespace-nowrap">
            ${item.price.toFixed(2)}
          </span>
        </div>

        <p className="text-muted-foreground text-sm mb-3 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-muted/50 text-muted-foreground rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Button
          onClick={() => onAddToCart(item)}
          disabled={!item.available}
          className="w-full touch-btn rounded-xl font-semibold"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          {item.available ? 'Add to Order' : 'Unavailable'}
        </Button>
      </div>
    </div>
  );
};
