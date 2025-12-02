import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UtensilsCrossed, Users, ShoppingBag, Settings } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <UtensilsCrossed className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">La Maison</h1>
                <p className="text-sm text-muted-foreground">Staff Dashboard</p>
              </div>
            </div>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Orders Card */}
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Orders</h3>
                <p className="text-sm text-muted-foreground">Manage incoming orders</p>
              </div>
            </div>
            <Button className="w-full">View Orders</Button>
          </Card>

          {/* Menu Management Card */}
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Menu</h3>
                <p className="text-sm text-muted-foreground">Edit menu items</p>
              </div>
            </div>
            <Button className="w-full">Manage Menu</Button>
          </Card>

          {/* Staff Management Card */}
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Staff</h3>
                <p className="text-sm text-muted-foreground">Manage team</p>
              </div>
            </div>
            <Button className="w-full">View Staff</Button>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <h2 className="font-serif text-2xl font-bold mb-4">Today's Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Active Orders</p>
              <p className="font-serif text-4xl font-bold text-primary">12</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Completed Today</p>
              <p className="font-serif text-4xl font-bold text-foreground">48</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Revenue</p>
              <p className="font-serif text-4xl font-bold text-foreground">$1,240</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
