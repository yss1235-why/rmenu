import { MenuItem } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/cloudinary';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuItemCard = ({ item, onAddToCart }: MenuItemCardProps) => {
  // Get optimized image URL from Cloudinary
  const imageUrl = getOptimizedImageUrl(item.image, 'menuCard');

  return (
    <div className="menu-card no-select">
      {/* Image Container */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={item.name}
          className="menu-card-image"
          loading="lazy"
          onError={(e) => {
            // Fallback to original image if optimization fails
            (e.target as HTMLImageElement).src = item.image;
          }}
        />
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
