import { useState } from 'react';
import { CartItem } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Minus, Plus, X, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onSubmitOrder: (notes: string) => void;
  tableNumber: string;
}

export const Cart = ({ items, onUpdateQuantity, onRemoveItem, onSubmitOrder, tableNumber }: CartProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = () => {
    onSubmitOrder(orderNotes);
    setOrderNotes('');
    setIsOpen(false);
  };

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full shadow-2xl h-16 w-16 p-0 relative"
        >
          <ShoppingBag className="w-6 h-6" />
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
            {totalItems}
          </Badge>
        </Button>
      </div>

      {/* Cart Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)}>
          <Card
            className="fixed right-0 top-0 h-full w-full md:w-96 shadow-2xl border-l animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-serif text-2xl font-bold">Your Order</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Table {tableNumber}</p>
              </div>

              {/* Items */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-4 border-b last:border-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                        <p className="text-sm text-primary font-semibold mb-2">
                          ${item.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 ml-auto"
                            onClick={() => onRemoveItem(item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="text-sm font-semibold mb-2 block">
                    Special Instructions (Optional)
                  </label>
                  <Textarea
                    placeholder="Any allergies or special requests?"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="p-6 border-t space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-serif text-xl font-bold">Total</span>
                  <span className="font-serif text-2xl font-bold text-primary">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  size="lg"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Place Order
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
