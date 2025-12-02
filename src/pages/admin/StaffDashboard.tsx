import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getRoleDisplayName, getRoleColor } from '@/types/staff';
import { OrdersPanel } from '@/components/admin/OrdersPanel';
import { TablesPanel } from '@/components/admin/TablesPanel';
import { MenuManagementPanel } from '@/components/admin/MenuManagementPanel';
import { StaffManagementPanel } from '@/components/admin/StaffManagementPanel';
import { TableLinksPanel } from '@/components/admin/TableLinksPanel';

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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  // Demo stats (in production, fetch from Firestore)
  const stats = {
    pendingOrders: 5,
    preparingOrders: 3,
    readyOrders: 2,
    completedToday: 47,
    totalRevenue: 2847.50,
    occupiedTables: 8,
    totalTables: 12,
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-between px-4 h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-violet-600" />
            <span className="font-serif font-semibold">Dashboard</span>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={photoURL} />
            <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
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
        fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-serif font-semibold text-lg">Restaurant</h1>
                  <p className="text-xs text-muted-foreground">Staff Dashboard</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={photoURL} />
                <AvatarFallback className="bg-violet-100 text-violet-700">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{displayName}</p>
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
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
            <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-slate-900 dark:text-white">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'orders' && 'Order Management'}
              {activeTab === 'tables' && 'Table Management'}
              {activeTab === 'table-links' && 'Table QR Links'}
              {activeTab === 'menu' && 'Menu Management'}
              {activeTab === 'staff' && 'Staff Management'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Welcome back, {displayName.split(' ')[0]}!
            </p>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.pendingOrders}</p>
                      </div>
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Preparing</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.preparingOrders}</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Ready</p>
                        <p className="text-2xl font-bold text-emerald-600">{stats.readyOrders}</p>
                      </div>
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Today</p>
                        <p className="text-2xl font-bold text-violet-600">{stats.completedToday}</p>
                      </div>
                      <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-violet-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue & Tables */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Today's Revenue</CardTitle>
                    <CardDescription>Total earnings from completed orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-emerald-600">
                      ₹{stats.totalRevenue.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Table Occupancy</CardTitle>
                    <CardDescription>Current seating status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <p className="text-3xl font-bold">
                        {stats.occupiedTables}/{stats.totalTables}
                      </p>
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-violet-600 h-3 rounded-full transition-all"
                          style={{ width: `${(stats.occupiedTables / stats.totalTables) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {visibleNavItems.filter(item => item.id !== 'overview').map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.id}
                          variant="outline"
                          className="h-auto py-4 flex flex-col items-center gap-2"
                          onClick={() => setActiveTab(item.id)}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm">{item.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other Tabs */}
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
