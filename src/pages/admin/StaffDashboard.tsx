import { useState } from 'react';
import { 
  UtensilsCrossed, 
  ShoppingBag, 
  Users, 
  QrCode, 
  Settings,
  ChefHat,
  Bell,
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
import { useDemoAuth } from '@/hooks/useAuth';
import { StaffRole, getRoleDisplayName, getRoleColor } from '@/types/staff';
import { OrdersPanel } from '@/components/admin/OrdersPanel';
import { TablesPanel } from '@/components/admin/TablesPanel';
import { MenuManagementPanel } from '@/components/admin/MenuManagementPanel';
import { StaffManagementPanel } from '@/components/admin/StaffManagementPanel';
import { TableLinksPanel } from '@/components/admin/TableLinksPanel';

const StaffDashboard = () => {
  const { staff, role, checkPermission, switchRole, signOut } = useDemoAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Demo stats
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold text-lg">La Maison</span>
          </div>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
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
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50
          transform transition-transform duration-300 ease-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <UtensilsCrossed className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-serif font-bold text-xl">La Maison</h1>
                  <p className="text-xs text-slate-500">Staff Dashboard</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.id === 'orders' && stats.pendingOrders > 0 && (
                      <Badge 
                        variant="secondary" 
                        className={`ml-auto ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}
                      >
                        {stats.pendingOrders}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Demo Role Switcher */}
            <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
              <p className="text-xs font-medium text-slate-500 mb-3">Demo: Switch Role</p>
              <div className="grid grid-cols-2 gap-2">
                {(['admin', 'manager', 'kitchen', 'waiter'] as StaffRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    className={`
                      px-3 py-2 text-xs rounded-lg font-medium transition-all
                      ${role === r 
                        ? 'bg-violet-500 text-white shadow-md' 
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                      }
                    `}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={staff?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm">
                  {staff?.name ? getInitials(staff.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{staff?.name || 'Staff'}</p>
                <Badge className={`text-xs ${getRoleColor(role || 'waiter')}`}>
                  {getRoleDisplayName(role || 'waiter')}
                </Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-4 lg:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                    Welcome back, {staff?.name?.split(' ')[0] || 'Staff'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Here's what's happening at your restaurant today
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50 dark:border-amber-800/50">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-amber-600 dark:text-amber-400">Pending</p>
                        <p className="text-2xl lg:text-3xl font-bold text-amber-700 dark:text-amber-300 mt-1">{stats.pendingOrders}</p>
                      </div>
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50 dark:border-blue-800/50">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-blue-600 dark:text-blue-400">Preparing</p>
                        <p className="text-2xl lg:text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">{stats.preparingOrders}</p>
                      </div>
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                        <ChefHat className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200/50 dark:border-emerald-800/50">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-emerald-600 dark:text-emerald-400">Ready</p>
                        <p className="text-2xl lg:text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{stats.readyOrders}</p>
                      </div>
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50 dark:border-violet-800/50">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm font-medium text-violet-600 dark:text-violet-400">Revenue</p>
                        <p className="text-2xl lg:text-3xl font-bold text-violet-700 dark:text-violet-300 mt-1">${stats.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-violet-500/10 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-violet-600 dark:text-violet-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tables Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Table Status</CardTitle>
                  <CardDescription>
                    {stats.occupiedTables} of {stats.totalTables} tables occupied
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.occupiedTables / stats.totalTables) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {Math.round((stats.occupiedTables / stats.totalTables) * 100)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
                    {Array.from({ length: stats.totalTables }, (_, i) => (
                      <div
                        key={i}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all
                          ${i < stats.occupiedTables 
                            ? 'bg-violet-500 text-white shadow-md shadow-violet-500/25' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }
                        `}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setActiveTab('orders')}
                >
                  <ShoppingBag className="w-6 h-6 text-violet-500" />
                  <span>View Orders</span>
                </Button>
                {checkPermission('canManageTables') && (
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setActiveTab('table-links')}
                  >
                    <QrCode className="w-6 h-6 text-violet-500" />
                    <span>Table Links</span>
                  </Button>
                )}
                {checkPermission('canManageMenu') && (
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setActiveTab('menu')}
                  >
                    <UtensilsCrossed className="w-6 h-6 text-violet-500" />
                    <span>Edit Menu</span>
                  </Button>
                )}
                {checkPermission('canManageStaff') && (
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setActiveTab('staff')}
                  >
                    <Users className="w-6 h-6 text-violet-500" />
                    <span>Manage Staff</span>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && <OrdersPanel />}

          {/* Tables Tab */}
          {activeTab === 'tables' && <TablesPanel />}

          {/* Table Links Tab */}
          {activeTab === 'table-links' && <TableLinksPanel />}

          {/* Menu Tab */}
          {activeTab === 'menu' && <MenuManagementPanel />}

          {/* Staff Tab */}
          {activeTab === 'staff' && <StaffManagementPanel />}
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
