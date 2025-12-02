import { MenuItem } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuItemCard = ({ item, onAddToCart }: MenuItemCardProps) => {
  return (
    <div className="menu-card no-select">
      {/* Image Container */}
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="menu-card-image"
          loading="lazy"
        />
        {item.isSpecial && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2 py-1">
            Special
          </Badge>
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
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        
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
