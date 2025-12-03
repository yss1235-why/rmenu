import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuIcon } from 'lucide-react';
import { LoadingScreen } from '@/components/LoadingScreen';
import { 
  UtensilsCrossed, 
  ShoppingBag, 
  Users, 
  QrCode, 
  LogOut,
  Menu as MenuIcon,
  X,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getRoleDisplayName, getRoleColor } from '@/types/staff';
import { OrdersPanel } from '@/components/admin/OrdersPanel';
import { TablesPanel } from '@/components/admin/TablesPanel';
import { MenuManagementPanel } from '@/components/admin/MenuManagementPanel';
import { StaffManagementPanel } from '@/components/admin/StaffManagementPanel';
import { TableLinksPanel } from '@/components/admin/TableLinksPanel';
import { useOrders } from '@/hooks/useOrders';
import { useTables } from '@/hooks/useTables';

const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID || 'demo';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    user, 
    staff, 
    role, 
    loading, 
    isAuthenticated, 
    checkPermission, 
    signOut 
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real-time data from Firebase
  const { orders, loading: ordersLoading } = useOrders({ restaurantId: RESTAURANT_ID });
  const { tables, loading: tablesLoading } = useTables({ restaurantId: RESTAURANT_ID });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  // Calculate real stats from Firebase data
  const stats = {
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    preparingOrders: orders.filter(o => o.status === 'preparing').length,
    readyOrders: orders.filter(o => o.status === 'ready').length,
    completedToday: orders.filter(o => {
      if (o.status !== 'completed') return false;
      const orderDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : null;
      if (!orderDate) return false;
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    }).length,
    totalRevenue: orders
      .filter(o => {
        if (o.paymentStatus !== 'paid') return false;
        const orderDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : null;
        if (!orderDate) return false;
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      })
      .reduce((sum, o) => sum + (o.total || 0), 0),
    occupiedTables: tables.filter(t => t.status === 'occupied').length,
    totalTables: tables.length,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      navigate('/login');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
      });
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, permission: null },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, permission: 'canManageOrders' as const },
    { id: 'tables', label: 'Tables', icon: QrCode, permission: 'canManageTables' as const },
    { id: 'table-links', label: 'Table Links', icon: QrCode, permission: 'canManageTables' as const },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed, permission: 'canManageMenu' as const },
    { id: 'staff', label: 'Staff', icon: Users, permission: 'canManageStaff' as const },
  ];

  const visibleNavItems = navItems.filter(
    (item) => !item.permission || checkPermission(item.permission)
  );

  // Show loading state
  if (loading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !staff) {
    return null;
  }

  // Get display name from staff record or Firebase user
  const displayName = staff.name || user?.displayName || 'Staff Member';
  const displayEmail = staff.email || user?.email || '';
  const photoURL = user?.photoURL || undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/20 dark:from-background dark:via-card dark:to-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-card/80 dark:bg-card/80 backdrop-blur-xl border-b border-border/50 dark:border-border/50">
        <div className="flex items-center justify-between px-4 h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-serif font-semibold">Dashboard</h1>
          <Avatar className="w-8 h-8">
            <AvatarImage src={photoURL} />
            <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary text-xs">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-card dark:bg-card border-r border-border dark:border-border
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
         <div className="p-6 border-b border-border dark:border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-semibold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                Restaurant
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
             <Avatar className="w-10 h-10">
                <AvatarImage src={photoURL} />
                <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{displayName}</p>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getRoleColor(role!)}`}
                  >
                    {getRoleDisplayName(role!)}
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 truncate">{displayEmail}</p>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-colors
                     ${isActive 
                        ? 'bg-primary/10 dark:bg-primary/20 text-primary' 
                        : 'text-muted-foreground hover:bg-muted/50 dark:hover:bg-muted/20'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border dark:border-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-foreground">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'orders' && 'Order Management'}
              {activeTab === 'tables' && 'Table Management'}
              {activeTab === 'table-links' && 'Table QR Links'}
              {activeTab === 'menu' && 'Menu Management'}
              {activeTab === 'staff' && 'Staff Management'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {displayName.split(' ')[0]}!
            </p>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Loading indicator */}
              {(ordersLoading || tablesLoading) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading real-time data...
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-warning/10 dark:bg-warning/5 border-warning/20 dark:border-warning/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-warning">Pending</p>
                        <p className="text-3xl font-bold text-warning mt-1">
                          {stats.pendingOrders}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-warning/50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-info/10 dark:bg-info/5 border-info/20 dark:border-info/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-info">Preparing</p>
                        <p className="text-3xl font-bold text-info mt-1">
                          {stats.preparingOrders}
                        </p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-info/50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-success/10 dark:bg-success/5 border-success/20 dark:border-success/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-success">Ready</p>
                        <p className="text-3xl font-bold text-success mt-1">
                          {stats.readyOrders}
                        </p>
                      </div>
                      <CheckCircle2 className="w-8 h-8 text-success/50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-violet-50 dark:bg-violet-950/30 border-violet-200/50 dark:border-violet-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-violet-600 dark:text-violet-400">Today's Revenue</p>
                        <p className="text-3xl font-bold text-violet-700 dark:text-violet-300 mt-1">
                          ₹{stats.totalRevenue.toFixed(2)}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-violet-500/50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Table Status</CardTitle>
                    <CardDescription>Current occupancy overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tables.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No tables configured yet</p>
                        <p className="text-sm">Add tables in the Tables section</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Occupied</span>
                          <span className="font-semibold">{stats.occupiedTables} / {stats.totalTables}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-violet-500 to-purple-600 h-3 rounded-full transition-all"
                            style={{ width: stats.totalTables > 0 ? `${(stats.occupiedTables / stats.totalTables) * 100}%` : '0%' }}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-2">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-600">{tables.filter(t => t.status === 'available').length}</p>
                            <p className="text-xs text-slate-500">Available</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-violet-600">{stats.occupiedTables}</p>
                            <p className="text-xs text-slate-500">Occupied</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-amber-600">{tables.filter(t => t.status === 'reserved').length}</p>
                            <p className="text-xs text-slate-500">Reserved</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Today's Summary</CardTitle>
                    <CardDescription>Orders completed today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No orders yet</p>
                        <p className="text-sm">Orders will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Completed Orders</span>
                          <span className="font-semibold text-success">{stats.completedToday}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Active Orders</span>
                          <span className="font-semibold text-info">
                            {stats.pendingOrders + stats.preparingOrders + stats.readyOrders}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-muted-foreground font-medium">Total Revenue</span>
                          <span className="font-bold text-lg text-primary">₹{stats.totalRevenue.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'orders' && <OrdersPanel />}
          {activeTab === 'tables' && <TablesPanel />}
          {activeTab === 'table-links' && <TableLinksPanel />}
          {activeTab === 'menu' && <MenuManagementPanel />}
          {activeTab === 'staff' && <StaffManagementPanel />}
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
