'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { CartItem, Product } from '@/lib/types';

// ─── Cart Context ─────────────────────────────────────────────────────────────
interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.productId === action.product.id);
      if (existing) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map(i =>
            i.productId === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        ...state,
        isOpen: true,
        items: [
          ...state.items,
          { productId: action.product.id, product: action.product, quantity: 1, price: action.product.price },
        ],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.productId !== action.productId) };
    case 'UPDATE_QTY':
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.productId !== action.productId) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.productId === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  total: number;
  itemCount: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <Providers>');
  return ctx;
}

// ─── Providers ────────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 2 },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  const addItem    = useCallback((product: Product) => dispatch({ type: 'ADD_ITEM', product }), []);
  const removeItem = useCallback((productId: string) => dispatch({ type: 'REMOVE_ITEM', productId }), []);
  const updateQty  = useCallback((productId: string, quantity: number) => dispatch({ type: 'UPDATE_QTY', productId, quantity }), []);
  const clearCart  = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const toggleCart = useCallback(() => dispatch({ type: 'TOGGLE_CART' }), []);
  const openCart   = useCallback(() => dispatch({ type: 'OPEN_CART' }), []);
  const closeCart  = useCallback(() => dispatch({ type: 'CLOSE_CART' }), []);

  const total     = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <QueryClientProvider client={queryClient}>
      <CartContext.Provider value={{
        items: state.items,
        isOpen: state.isOpen,
        total,
        itemCount,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
      }}>
        {children}
      </CartContext.Provider>
    </QueryClientProvider>
  );
}
