import { Category, MenuItem } from '@/types/menu';
import { MenuItemCard } from './MenuItemCard';

interface CategorySectionProps {
  category: Category;
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}

export const CategorySection = ({ category, items, onAddToCart }: CategorySectionProps) => {
  if (items.length === 0) return null;

  return (
    <section id={`category-${category.id}`} className="mb-8 animate-fade-in">
      {/* Category Header */}
      <div className="mb-4 px-1">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {category.name}
        </h2>
        <div className="h-0.5 w-12 bg-primary rounded-full mt-2" />
      </div>
      
      {/* Menu Items Grid - Single column on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
};
