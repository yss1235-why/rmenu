import { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Eye,
  Printer,
  Bell,
  ShoppingBag,
  RefreshCw
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
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import { useNotification } from '@/hooks/useNotification';

const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID || 'demo';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-info/10 text-info dark:bg-info/20 dark:text-info', icon: CheckCircle2 },
  preparing: { label: 'Preparing', color: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary', icon: ChefHat },
  ready: { label: 'Ready', color: 'bg-success/10 text-success dark:bg-success/20 dark:text-success', icon: Bell },
  completed: { label: 'Completed', color: 'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive', icon: XCircle },
};

export const OrdersPanel = () => {
  const { toast } = useToast();
  const { orders, loading, error, updateOrderStatus, removeOrderItem } = useOrders({ restaurantId: RESTAURANT_ID });
  const { permission, requestPermission, sendNotification, isSupported } = useNotification();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
  const prevOrderCountRef = useRef<number>(0);

  // Request notification permission on mount
  useEffect(() => {
    if (isSupported && permission === 'default') {
      requestPermission();
    }
  }, [isSupported, permission, requestPermission]);

  // Watch for new orders and send notification
  useEffect(() => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const currentCount = pendingOrders.length;

    if (prevOrderCountRef.current > 0 && currentCount > prevOrderCountRef.current) {
      const newOrdersCount = currentCount - prevOrderCountRef.current;
      const latestOrder = pendingOrders[0];
      
      sendNotification('🍽️ New Order!', {
        body: `Table ${latestOrder?.tableNumber || 'Unknown'} - ${newOrdersCount} new order${newOrdersCount > 1 ? 's' : ''}`,
        tag: 'new-order',
        requireInteraction: true,
      });

      toast({
        title: '🍽️ New Order!',
        description: `Table ${latestOrder?.tableNumber || 'Unknown'} placed an order`,
      });
    }

    prevOrderCountRef.current = currentCount;
  }, [orders, sendNotification, toast]);

  // Handle removing item from order
  const handleRemoveItem = async (orderId: string, itemId: string, itemName: string) => {
    try {
      await removeOrderItem(orderId, itemId);
      toast({
        title: 'Item Removed',
        description: `${itemName} has been removed from the order.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove item from order.',
      });
    }
  };

  const filteredOrders = activeFilter === 'all'
    ? orders 
    : orders.filter(order => order.status === activeFilter);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast({
        title: 'Order Updated',
        description: `Order status changed to ${statusConfig[newStatus].label}`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update order status',
      });
    }
  };

  const getTimeAgo = (timestamp: { seconds: number; nanoseconds: number }) => {
    const now = Date.now();
    const orderTime = timestamp.seconds * 1000;
    const diff = now - orderTime;
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
        <span className="ml-2 text-slate-500">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="text-red-600">Failed to load orders</p>
        <p className="text-sm text-slate-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {(['pending', 'confirmed', 'preparing', 'ready', 'completed'] as OrderStatus[]).map((status) => {
          const config = statusConfig[status];
          const count = orders.filter(o => o.status === status).length;
          const Icon = config.icon;
          return (
            <Card 
              key={status}
              className={`cursor-pointer transition-all ${activeFilter === status ? 'ring-2 ring-violet-500' : ''}`}
              onClick={() => setActiveFilter(activeFilter === status ? 'all' : status)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm text-slate-500 capitalize">{status}</span>
                </div>
                <p className="text-2xl font-bold">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-600">No Orders</h3>
          <p className="text-slate-500">
            {activeFilter === 'all' 
              ? 'No orders have been placed yet.' 
              : `No ${activeFilter} orders at the moment.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status];
            const StatusIcon = config.icon;
            
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold">Table {order.tableNumber}</span>
                        <Badge className={config.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          {order.createdAt && getTimeAgo(order.createdAt)}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-slate-600">
                            {item.quantity}x {item.name}
                            {item.customizations && item.customizations.length > 0 && (
                              <span className="text-slate-400 ml-1">
                                ({item.customizations.join(', ')})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {order.notes && (
                        <p className="text-sm text-amber-600 mt-2 italic">
                          Note: {order.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-violet-600">
                        ₹{order.total.toFixed(2)}
                      </p>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="mt-2">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {order.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'confirmed')}>
                              <CheckCircle2 className="w-4 h-4 mr-2 text-blue-500" />
                              Confirm Order
                            </DropdownMenuItem>
                          )}
                          {order.status === 'confirmed' && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'preparing')}>
                              <ChefHat className="w-4 h-4 mr-2 text-violet-500" />
                              Start Preparing
                            </DropdownMenuItem>
                          )}
                          {order.status === 'preparing' && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'ready')}>
                              <Bell className="w-4 h-4 mr-2 text-emerald-500" />
                              Mark Ready
                            </DropdownMenuItem>
                          )}
                          {order.status === 'ready' && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'completed')}>
                              <CheckCircle2 className="w-4 h-4 mr-2 text-slate-500" />
                              Complete Order
                            </DropdownMenuItem>
                          )}
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                              className="text-red-600"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Order
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Table {selectedOrder?.tableNumber} • {selectedOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
             <div className="space-y-2">
                <h4 className="font-semibold">Items</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm py-1">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      {selectedOrder.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveItem(selectedOrder.id, item.id, item.name)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₹{selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <strong>Note:</strong> {selectedOrder.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                <Button variant="outline" className="flex-1">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
