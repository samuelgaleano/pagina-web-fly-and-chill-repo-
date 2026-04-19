import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, query, doc, updateDoc, increment, writeBatch, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { Product } from '@/types';
import { products as staticProducts } from '@/data/products';

interface ShopContextType {
  products: Product[];
  loading: boolean;
  user: User | null;
  isAuthReady: boolean;
  isAdmin: boolean;
  isOffline: boolean;
  placeOrder: (items: { id: string; quantity: number; price: number }[]) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    // Try to load from localStorage on initial boot
    const cached = localStorage.getItem('elite_vape_products_cache');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Error parsing cached products:", e);
      }
    }
    return staticProducts;
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Network Status Listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
      if (user) {
        // Simple admin check based on email for now
        const ADMIN_EMAILS = ["samuel.galeano.alvis@gmail.com", "dbonilla131369@gmail.com"];
        setIsAdmin(user.email ? ADMIN_EMAILS.includes(user.email) : false);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Products Listener (Real-time)
  useEffect(() => {
    if (!isAuthReady) return;

    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // If Firestore is empty, we still keep the cache or fallback to static
        if (products.length === 0) setProducts(staticProducts);
      } else {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        setProducts(productsData);
        // Update local cache for offline access
        localStorage.setItem('elite_vape_products_cache', JSON.stringify(productsData));
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      // If Firestore fails (e.g. offline), we keep the current state (which was loaded from cache)
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  const placeOrder = async (items: { id: string; quantity: number; price: number }[]) => {
    if (!user) throw new Error("Debes iniciar sesión para comprar.");

    const batch = writeBatch(db);
    const orderRef = doc(collection(db, 'orders'));
    
    const orderData = {
      userId: user.uid,
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      createdAt: serverTimestamp()
    };

    batch.set(orderRef, orderData);

    // Update stock for each item
    items.forEach(item => {
      const productRef = doc(db, 'products', item.id);
      batch.update(productRef, {
        stock: increment(-item.quantity)
      });
    });

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'orders/products');
    }
  };

  return (
    <ShopContext.Provider value={{
      products, loading, user, isAuthReady, isAdmin, isOffline, placeOrder
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
