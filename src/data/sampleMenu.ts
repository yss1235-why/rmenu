import { MenuItem, Category } from '@/types/menu';

// Using placeholder images for now - will be replaced with Cloudinary URLs
const PLACEHOLDER_IMAGES = {
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
  pasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
  dessert: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&h=600&fit=crop',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
  steak: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop',
  soup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
};

export const categories: Category[] = [
  { id: 'specials', name: "Today's Specials", order: 0, active: true },
  { id: 'starters', name: 'Starters', order: 1, active: true },
  { id: 'mains', name: 'Main Courses', order: 2, active: true },
  { id: 'desserts', name: 'Desserts', order: 3, active: true },
];

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Truffle Burger',
    description: 'Wagyu beef patty, caramelized onions, aged cheddar, truffle aioli on brioche',
    price: 24.99,
    image: PLACEHOLDER_IMAGES.burger,
    categoryId: 'mains',
    available: true,
    isSpecial: true,
  },
  {
    id: '2',
    name: 'Garden Fresh Salad',
    description: 'Mixed greens, heirloom tomatoes, cucumber, radish, house vinaigrette',
    price: 12.99,
    image: PLACEHOLDER_IMAGES.salad,
    categoryId: 'starters',
    available: true,
    isSpecial: false,
  },
  {
    id: '3',
    name: 'Handmade Pasta Carbonara',
    description: 'Fresh egg pasta, pancetta, parmesan, black pepper, egg yolk',
    price: 22.99,
    image: PLACEHOLDER_IMAGES.pasta,
    categoryId: 'mains',
    available: true,
    isSpecial: false,
  },
  {
    id: '4',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center, vanilla bean ice cream, fresh berries',
    price: 10.99,
    image: PLACEHOLDER_IMAGES.dessert,
    categoryId: 'desserts',
    available: true,
    isSpecial: false,
  },
  {
    id: '5',
    name: 'Grilled Ribeye',
    description: '12oz prime ribeye, herb butter, roasted vegetables, truffle mash',
    price: 42.99,
    image: PLACEHOLDER_IMAGES.steak,
    categoryId: 'mains',
    available: true,
    isSpecial: true,
  },
  {
    id: '6',
    name: 'Tomato Basil Soup',
    description: 'Creamy roasted tomato soup with fresh basil and garlic croutons',
    price: 8.99,
    image: PLACEHOLDER_IMAGES.soup,
    categoryId: 'starters',
    available: true,
    isSpecial: false,
  },
];
