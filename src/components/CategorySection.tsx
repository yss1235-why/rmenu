import { Category, MenuItem } from '@/types/menu';
import { MenuItemCard } from './MenuItemCard';

interface CategorySectionProps {
  category: Category;
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}

// Categories that should display items full-width (one per row) on mobile
const FEATURED_CATEGORIES = ['specials', 'hero', 'featured', 'discount', 'deals'];

export const CategorySection = ({ category, items, onAddToCart }: CategorySectionProps) => {
  if (items.length === 0) return null;

  // Check if this is a featured category (specials, hero, discount, etc.)
  const isFeaturedCategory = FEATURED_CATEGORIES.some(
    (featured) => category.id.toLowerCase().includes(featured) || 
                  category.name.toLowerCase().includes(featured)
  );

  return (
    <section id={`category-${category.id}`} className="mb-8 animate-fade-in">
      {/* Category Header */}
      <div className="mb-4 px-1">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {category.name}
        </h2>
        <div className="h-0.5 w-12 bg-primary rounded-full mt-2" />
      </div>
      
      {/* Menu Items Grid 
          - Featured categories (specials/hero/discount): 1 item per row on mobile
          - Regular categories: 2 items per row on mobile
          - Tablet: 2 columns, Desktop: 3 columns for all
      */}
      <div className={`grid gap-4 ${
        isFeaturedCategory 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {items.map((item) => (
          <MenuItemCard 
            key={item.id} 
            item={item} 
            onAddToCart={onAddToCart}
            variant={isFeaturedCategory ? 'featured' : 'compact'}
          />
        ))}
      </div>
    </section>
  );
};
