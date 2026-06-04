import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, query, doc, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { Product } from '@/types';
import { products as staticProducts } from '@/data/products';

// El catálogo cambia muy poco. En vez de un listener en tiempo real
// (onSnapshot) que factura lecturas de Firestore de forma continua por cada
// visitante, leemos UNA vez y cacheamos en localStorage con un TTL. Así, las
// visitas repetidas dentro de la ventana NO generan ninguna lectura.
const PRODUCTS_CACHE_KEY = 'elite_vape_products_cache';
const PRODUCTS_CACHE_TS_KEY = 'elite_vape_products_cache_ts';
const PRODUCTS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

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
    const cached = localStorage.getItem(PRODUCTS_CACHE_KEY);
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
    // BYPASS SOLO EN DESARROLLO: con `npm run dev` (import.meta.env.DEV === true)
    // se concede acceso de admin para poder revisar /admin en localhost sin
    // iniciar sesión. En el build de producción import.meta.env.DEV es false,
    // así que este bloque NUNCA se activa en producción.
    if (import.meta.env.DEV) {
      setIsAuthReady(true);
      setIsAdmin(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
      if (user) {
        // Simple admin check based on email for now
        const ADMIN_EMAILS = ["flyandchill0@gmail.com", "danysanty451@gmail.com", "samuel.galeano.alvis@gmail.com"];
        setIsAdmin(user.email ? ADMIN_EMAILS.includes(user.email) : false);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Products (lectura única con caché + TTL en lugar de listener en tiempo real)
  useEffect(() => {
    if (!isAuthReady) return;

    let cancelled = false;

    const cachedTs = Number(localStorage.getItem(PRODUCTS_CACHE_TS_KEY) || 0);
    const cacheFresh = cachedTs > 0 && (Date.now() - cachedTs) < PRODUCTS_CACHE_TTL_MS;

    // Si la caché aún está fresca, no consultamos Firestore (cero lecturas).
    if (cacheFresh && products.length > 0) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'products')));
        if (cancelled) return;

        if (snapshot.empty) {
          if (products.length === 0) setProducts(staticProducts);
        } else {
          const productsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];

          setProducts(productsData);
          localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(productsData));
          localStorage.setItem(PRODUCTS_CACHE_TS_KEY, String(Date.now()));
        }
      } catch (error) {
        // Sin conexión / sin permisos: conservamos lo que ya teníamos (caché o estático).
        handleFirestoreError(error, OperationType.LIST, 'products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
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
