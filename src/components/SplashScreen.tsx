import { UtensilsCrossed } from 'lucide-react';

interface SplashScreenProps {
  restaurantName?: string;
}

export const SplashScreen = ({ restaurantName = "Flavor Haven" }: SplashScreenProps) => {
  return (
    <div className="splash-screen">
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Logo */}
        <div className="splash-logo w-24 h-24 bg-primary-foreground/20 rounded-3xl flex items-center justify-center">
          <UtensilsCrossed className="w-14 h-14 text-primary-foreground" />
        </div>
        
        {/* Restaurant Name */}
        <div className="splash-text text-center">
          <h1 className="font-serif text-4xl font-bold text-primary-foreground tracking-wide">
            {restaurantName}
          </h1>
          <p className="text-primary-foreground/70 text-sm mt-2 font-medium">
            Digital Menu
          </p>
        </div>
      </div>
    </div>
  );
};
