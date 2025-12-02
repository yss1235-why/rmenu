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
    <section className="mb-12 animate-fade-in">
      <div className="mb-6">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
          {category.name}
        </h2>
        <div className="h-1 w-20 bg-primary rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
};
