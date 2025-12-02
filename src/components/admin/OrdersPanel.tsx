import { useState } from 'react';
import { 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Eye,
  Printer,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Order, OrderStatus } from '@/types/order';

// Demo orders for development
const demoOrders: Order[] = [
  {
    id: 'order-1',
    restaurantId: 'demo',
    tableNumber: '5',
    items: [
      { id: '1', menuItemId: '1', name: 'Truffle Burger', price: 24.99, quantity: 2, status: 'pending' },
      { id: '2', menuItemId: '4', name: 'Chocolate Lava Cake', price: 10.99, quantity: 1, status: 'pending' },
    ],
    subtotal: 60.97,
    tax: 5.18,
    total: 66.15,
    status: 'pending',
    paymentStatus: 'pending',
    notes: 'No onions on the burgers please',
    createdAt: { seconds: Date.now() / 1000 - 300, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000 - 300, nanoseconds: 0 } as any,
  },
  {
    id: 'order-2',
    restaurantId: 'demo',
    tableNumber: '3',
    items: [
      { id: '3', menuItemId: '3', name: 'Pasta Carbonara', price: 22.99, quantity: 1, status: 'preparing' },
      { id: '4', menuItemId: '2', name: 'Garden Salad', price: 12.99, quantity: 1, status: 'ready' },
    ],
    subtotal: 35.98,
    tax: 3.06,
    total: 39.04,
    status: 'preparing',
    paymentStatus: 'pending',
    createdAt: { seconds: Date.now() / 1000 - 600, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000 - 300, nanoseconds: 0 } as any,
  },
  {
    id: 'order-3',
    restaurantId: 'demo',
    tableNumber: '8',
    items: [
      { id: '5', menuItemId: '5', name: 'Grilled Ribeye', price: 42.99, quantity: 1, status: 'ready' },
    ],
    subtotal: 42.99,
    tax: 3.65,
    total: 46.64,
    status: 'ready',
    paymentStatus: 'pending',
    createdAt: { seconds: Date.now() / 1000 - 900, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000 - 120, nanoseconds: 0 } as any,
  },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: CheckCircle2 },
  preparing: { label: 'Preparing', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300', icon: ChefHat },
  ready: { label: 'Ready', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: CheckCircle2 },
  served: { label: 'Served', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: XCircle },
};

export const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  const getTimeAgo = (timestamp: any) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp.seconds);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow: Record<string, OrderStatus> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'served',
      served: 'completed',
    };
    return flow[currentStatus] || null;
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status);
    return order.status === activeTab;
  });

  const OrderCard = ({ order }: { order: Order }) => {
    const config = statusConfig[order.status];
    const StatusIcon = config.icon;
    const nextStatus = getNextStatus(order.status);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-sm">
                #{order.tableNumber}
              </div>
              <div>
                <p className="font-medium text-sm">Table {order.tableNumber}</p>
                <p className="text-xs text-slate-500">{getTimeAgo(order.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={config.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Printer className="w-4 h-4 mr-2" />
                    Print Order
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="w-4 h-4 mr-2" />
                    Notify Customer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-1 mb-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg mb-3">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <span className="font-medium">Note:</span> {order.notes}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
            </div>
            {nextStatus && (
              <Button
                size="sm"
                onClick={() => updateOrderStatus(order.id, nextStatus)}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                Mark as {statusConfig[nextStatus].label}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Orders</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage incoming orders and update their status</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
          <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            All
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            Active
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            Pending
          </TabsTrigger>
          <TabsTrigger value="preparing" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            Preparing
          </TabsTrigger>
          <TabsTrigger value="ready" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            Ready
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {filteredOrders.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <p className="text-slate-500">No orders found</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Table {selectedOrder?.tableNumber} • {selectedOrder && getTimeAgo(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={statusConfig[selectedOrder.status].color}>
                  {statusConfig[selectedOrder.status].label}
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Items</h4>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.quantity}x {item.name}</p>
                      {item.notes && <p className="text-xs text-slate-500">{item.notes}</p>}
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {selectedOrder.notes && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <span className="font-medium">Special Instructions:</span> {selectedOrder.notes}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax</span>
                  <span>${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                {getNextStatus(selectedOrder.status) && (
                  <Button 
                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600"
                    onClick={() => {
                      const next = getNextStatus(selectedOrder.status);
                      if (next) {
                        updateOrderStatus(selectedOrder.id, next);
                        setSelectedOrder(null);
                      }
                    }}
                  >
                    Mark as {statusConfig[getNextStatus(selectedOrder.status)!].label}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
