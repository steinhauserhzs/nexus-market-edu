import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useTrackCartAdd } from '@/hooks/use-analytics';

interface CartItem {
  id: string;
  product_id: string;
  title: string;
  price_cents: number;
  thumbnail_url: string | null;
  type: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const OptimizedCartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  const { trackCartAdd } = useTrackCartAdd();

  // Load cart from localStorage on mount (memoized)
  useEffect(() => {
    const savedCart = localStorage.getItem('nexus-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('nexus-cart'); // Remove corrupted data
      }
    }
  }, []);

  // Debounced save to localStorage (evita saves excessivos)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('nexus-cart', JSON.stringify(items));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [items]);

  // Memoized calculations para evitar recálculos desnecessários
  const totalItems = useMemo(() => 
    items.reduce((sum, item) => sum + item.quantity, 0), 
    [items]
  );
  
  const totalAmount = useMemo(() => 
    items.reduce((sum, item) => sum + (item.price_cents * item.quantity), 0), 
    [items]
  );

  const addToCart = useCallback((product: Omit<CartItem, 'quantity'>) => {
    // Rastrear adição ao carrinho
    trackCartAdd(product.product_id, 1);
    
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.product_id === product.product_id);
      
      if (existingItem) {
        toast({
          title: "Produto já no carrinho",
          description: `${product.title} já está no seu carrinho.`,
        });
        return currentItems;
      }

      toast({
        title: "Adicionado ao carrinho!",
        description: `${product.title} foi adicionado ao carrinho.`,
      });

      return [...currentItems, { ...product, quantity: 1 }];
    });
  }, [trackCartAdd]);

  const removeFromCart = useCallback((productId: string) => {
    setItems(currentItems => {
      const item = currentItems.find(item => item.product_id === productId);
      if (item) {
        toast({
          title: "Removido do carrinho",
          description: `${item.title} foi removido do carrinho.`,
        });
      }
      return currentItems.filter(item => item.product_id !== productId);
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.product_id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    toast({
      title: "Carrinho limpo",
      description: "Todos os itens foram removidos do carrinho.",
    });
  }, []);

  const isInCart = useCallback((productId: string) => {
    return items.some(item => item.product_id === productId);
  }, [items]);

  // Memoize value para evitar re-renders desnecessários
  const value = useMemo(() => ({
    items,
    totalItems,
    totalAmount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
  }), [items, totalItems, totalAmount, addToCart, removeFromCart, updateQuantity, clearCart, isInCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};