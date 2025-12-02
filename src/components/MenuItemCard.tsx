import { MenuItem } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuItemCard = ({ item, onAddToCart }: MenuItemCardProps) => {
  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.isSpecial && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
            Special
          </Badge>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-xl font-semibold text-foreground">
            {item.name}
          </h3>
          <span className="font-serif text-lg text-primary font-semibold ml-2">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {item.description}
        </p>
        <Button
          onClick={() => onAddToCart(item)}
          disabled={!item.available}
          className="w-full group/btn"
          variant="default"
        >
          <Plus className="w-4 h-4 mr-2 group-hover/btn:rotate-90 transition-transform" />
          {item.available ? 'Add to Order' : 'Unavailable'}
        </Button>
      </div>
    </Card>
  );
};
