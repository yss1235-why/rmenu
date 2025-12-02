import { useState } from 'react';
import { CartItem } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Minus, Plus, X, Send, ChevronDown } from 'lucide-react';
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
      <button
        onClick={() => setIsOpen(true)}
        className="fab w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center touch-btn"
      >
        <ShoppingBag className="w-6 h-6" />
        <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs font-bold">
          {totalItems}
        </Badge>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bottom Sheet Cart */}
      {isOpen && (
        <div className="cart-sheet" onClick={(e) => e.stopPropagation()}>
          {/* Handle */}
          <div className="cart-handle" onClick={() => setIsOpen(false)} />
          
          {/* Header */}
          <div className="px-5 pb-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">Your Order</h2>
              <p className="text-sm text-muted-foreground">Table {tableNumber}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="touch-btn rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <ChevronDown className="w-6 h-6" />
            </Button>
          </div>

          {/* Items */}
          <ScrollArea className="flex-1 max-h-[40vh]">
            <div className="p-5 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-4 border-b last:border-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-primary font-semibold mb-2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    
                    {/* Quantity Stepper */}
                    <div className="qty-stepper">
                      <button
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Special Instructions */}
              <div className="pt-2">
                <label className="text-sm font-semibold mb-2 block text-foreground">
                  Special Instructions
                </label>
                <Textarea
                  placeholder="Any allergies or special requests?"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="resize-none rounded-xl"
                  rows={2}
                />
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-5 border-t bg-card">
            <div className="flex justify-between items-center mb-4">
              <span className="font-serif text-lg font-bold">Total</span>
              <span className="font-serif text-2xl font-bold text-primary">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full touch-btn rounded-xl font-semibold"
              size="lg"
            >
              <Send className="w-5 h-5 mr-2" />
              Place Order
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
