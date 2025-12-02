import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, QrCode, Smartphone, ChefHat } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6 animate-fade-in">
              <UtensilsCrossed className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-in">
              La Maison
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
              Experience dining reimagined. Browse our menu, order seamlessly, and enjoy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/menu?table=1">
                  <Smartphone className="w-5 h-5 mr-2" />
                  View Menu
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <Link to="/dashboard">
                  <ChefHat className="w-5 h-5 mr-2" />
                  Staff Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12">
            Modern Dining Experience
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Scan & Order</h3>
              <p className="text-muted-foreground">
                Simply scan the QR code at your table to start ordering
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Beautiful Menu</h3>
              <p className="text-muted-foreground">
                Browse our elegant digital menu with stunning food photography
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-muted-foreground">
                Track your order status from kitchen to table in real-time
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
