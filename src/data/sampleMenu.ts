import { MenuItem, Category } from '@/types/menu';
import heroBurger from '@/assets/hero-burger.jpg';
import pastaDish from '@/assets/pasta-dish.jpg';
import dessert from '@/assets/dessert.jpg';
import salad from '@/assets/salad.jpg';

export const categories: Category[] = [
  { id: 'specials', name: 'Today\'s Specials', order: 0, active: true },
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
    image: heroBurger,
    categoryId: 'specials',
    available: true,
    isSpecial: true,
  },
  {
    id: '2',
    name: 'Garden Fresh Salad',
    description: 'Mixed greens, heirloom tomatoes, cucumber, radish, house vinaigrette',
    price: 12.99,
    image: salad,
    categoryId: 'starters',
    available: true,
    isSpecial: false,
  },
  {
    id: '3',
    name: 'Handmade Pasta Carbonara',
    description: 'Fresh egg pasta, pancetta, parmesan, black pepper, egg yolk',
    price: 22.99,
    image: pastaDish,
    categoryId: 'mains',
    available: true,
    isSpecial: false,
  },
  {
    id: '4',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center, vanilla bean ice cream, fresh berries',
    price: 10.99,
    image: dessert,
    categoryId: 'desserts',
    available: true,
    isSpecial: false,
  },
  {
    id: '5',
    name: 'Grilled Ribeye',
    description: '12oz prime ribeye, herb butter, roasted vegetables, truffle mash',
    price: 42.99,
    image: heroBurger,
    categoryId: 'mains',
    available: true,
    isSpecial: true,
  },
];
