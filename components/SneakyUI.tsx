
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Heart, ShoppingBag, Home, Search, User, ArrowRight, Sun, Moon, Newspaper, ShoppingCart, Trash2, Plus, Minus, X, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { cn } from '../utils/cn';
import { supabase } from '../services/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// --- Toast Context ---
interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border animate-in slide-in-from-right-full fade-in duration-300 max-w-[300px]",
              toast.type === 'success' 
                ? "bg-white dark:bg-dark-surface border-green-500 text-stone-900 dark:text-white" 
                : "bg-white dark:bg-dark-surface border-red-500 text-stone-900 dark:text-white"
            )}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
            <p className="text-sm font-bold">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

// --- Auth Context ---
interface AuthContextType {
  user: SupabaseUser | null;
  isGuest: boolean;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: any; data?: any }>;
  signUp: (email: string, pass: string) => Promise<{ error: any; data?: any }>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isGuest: false,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  continueAsGuest: () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsGuest(false); // If user is logged in, they are not a guest
        setLoading(false);
      } else {
        // 2. If no Supabase session, check for Guest Session
        const guestSession = localStorage.getItem('sneaky_guest');
        if (guestSession) {
            setIsGuest(true);
        }
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsGuest(false); // User logged in, clear guest mode internally
        localStorage.removeItem('sneaky_guest'); // Clean up guest storage
      } else {
        setUser(null);
      }
      // We don't set loading false here to avoid flash, handled by initial check mostly
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return { data, error };
  };

  const signUp = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password: pass });
    return { data, error };
  };

  const continueAsGuest = () => {
      const sessionData = { guest: true, createdAt: Date.now() };
      localStorage.setItem('sneaky_guest', JSON.stringify(sessionData));
      setIsGuest(true);
  };

  const signOut = async () => {
    if (isGuest) {
        setIsGuest(false);
        localStorage.removeItem('sneaky_guest');
    } else {
        await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isGuest, loading, signIn, signUp, continueAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// --- Theme Context ---
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => {} });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className="w-[38px] h-[38px] rounded-full bg-white/80 dark:bg-dark-surface border border-stone-200 dark:border-dark-border shadow-md flex items-center justify-center transition-all hover:scale-105 z-50"
    >
      <div className="relative w-4 h-4">
        <Sun className={cn("absolute inset-0 w-4 h-4 text-orange-400 transition-all duration-500 rotate-0 dark:-rotate-90 dark:opacity-0", theme === 'light' ? 'opacity-100 scale-100' : 'opacity-0 scale-50')} />
        <Moon className={cn("absolute inset-0 w-4 h-4 text-neon-cyan transition-all duration-500 rotate-90 dark:rotate-0", theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-50')} />
      </div>
    </button>
  );
};

// --- Cart Context ---
export interface CartItem extends ProductProps {
  cartId: string; // unique id for cart item (product id + size)
  quantity: number;
  selectedSize: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: ProductProps, size: number) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  total: 0,
  itemCount: 0,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: ProductProps, size: number) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => 
          item.cartId === existing.cartId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, cartId: `${product.id}-${size}`, quantity: 1, selectedSize: size }];
    });
  };

  const removeFromCart = (cartId: string) => {
    setItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

// --- Navigation ---
interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { itemCount } = useCart();
  
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'shop', icon: ShoppingBag, label: 'Shop' },
    { id: 'news', icon: Newspaper, label: 'News' },
    { id: 'cart', icon: ShoppingCart, label: 'Cart', badge: itemCount },
    { id: 'orders', icon: Package, label: 'Orders' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-lg border-t border-stone-100 dark:border-dark-border py-4 px-4 flex justify-between items-end z-40 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transition-colors duration-300">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={cn(
            "relative flex flex-col items-center gap-1 transition-all duration-300 flex-1",
            activeTab === item.id 
              ? "text-stone-900 dark:text-neon-cyan -translate-y-1" 
              : "text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
          )}
        >
          <div className="relative">
            <item.icon 
              className={cn("w-6 h-6", activeTab === item.id && "fill-current")} 
              strokeWidth={activeTab === item.id ? 2.5 : 2} 
            />
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-bounce">
                {item.badge}
              </span>
            )}
          </div>
          <span className={cn("text-[10px] font-bold tracking-wide", activeTab === item.id ? "opacity-100" : "opacity-0")}>
            {item.label.toUpperCase()}
          </span>
        </button>
      ))}
    </div>
  );
};

// --- Product Card ---
export interface ProductProps {
  id: string;
  brand: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  tag?: string;
  releaseDate?: string;
  categories: string[];
  onPress: () => void;
}

export const formatINR = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

export const ProductCard: React.FC<ProductProps> = ({ brand, name, price, originalPrice, image, tag, onPress }) => {
  const [imgSrc, setImgSrc] = useState(image);
  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1552346154-21d32810aba3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

  useEffect(() => { setImgSrc(image); }, [image]);
  const handleError = () => { if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE); };

  return (
    <div 
      onClick={onPress}
      className="group relative min-w-[180px] bg-white dark:bg-dark-surface rounded-3xl p-4 shadow-lg shadow-stone-200/50 dark:shadow-black/50 hover:shadow-xl hover:shadow-stone-200/80 dark:hover:shadow-black/80 transition-all duration-300 cursor-pointer border border-stone-50 dark:border-dark-border overflow-hidden"
    >
      {/* Tag */}
      {tag && (
        <div className="absolute top-4 left-4 bg-stone-900 dark:bg-neon-cyan text-white dark:text-black text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-md">
          {tag}
        </div>
      )}
      
      {/* Favorite Button */}
      <button className="absolute top-4 right-4 w-8 h-8 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors z-10 shadow-sm">
        <Heart className="w-4 h-4" />
      </button>

      {/* Image */}
      <div className="aspect-square w-full mb-4 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-stone-50 dark:bg-stone-800/50 rounded-2xl transform rotate-3 scale-90 transition-transform group-hover:rotate-0 group-hover:scale-95" />
        <img 
          src={imgSrc} 
          alt={name}
          onError={handleError}
          className="w-[120%] max-w-none relative z-10 transform -rotate-12 group-hover:-rotate-6 group-hover:scale-110 transition-all duration-500 drop-shadow-2xl mix-blend-multiply dark:mix-blend-normal" 
        />
      </div>

      {/* Details */}
      <div className="space-y-1">
        <p className="text-stone-500 dark:text-stone-400 text-[10px] font-bold uppercase tracking-wider">{brand}</p>
        <h3 className="text-stone-900 dark:text-white font-bold text-sm leading-tight line-clamp-1">{name}</h3>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-stone-900 dark:text-white font-extrabold text-base">{formatINR(price)}</span>
          {originalPrice && (
            <span className="text-stone-400 dark:text-stone-600 text-xs line-through decoration-2">{formatINR(originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Trending Row ---
export const TrendingSection: React.FC<{ products: ProductProps[], onProductClick: (p: ProductProps) => void }> = ({ products, onProductClick }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-6">
        <h2 className="text-xl font-black tracking-tight text-stone-900 dark:text-white">Trending Right Now</h2>
        <button className="text-blue-600 dark:text-neon-cyan text-sm font-bold flex items-center gap-1">
            See All <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto px-6 pb-8 no-scrollbar snap-x">
        {products.map((product) => (
            <div key={product.id} className="snap-center">
                <ProductCard {...product} onPress={() => onProductClick(product)} />
            </div>
        ))}
      </div>
    </div>
  );
};

// --- News Card ---
interface NewsCardProps {
  title: string;
  subtitle: string;
  image: string;
  category: string;
  date: string;
  featured?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({ title, subtitle, image, category, date, featured }) => {
  if (featured) {
    return (
      <div className="relative w-full aspect-[4/5] rounded-[32px] overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow duration-500 border border-transparent dark:border-dark-border">
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        
        <div className="absolute top-6 left-6">
           <span className="bg-blue-600 dark:bg-neon-cyan text-white dark:text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">FEATURED</span>
        </div>

        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center gap-2 text-stone-300 text-xs font-medium mb-2">
            <span>{category}</span>
            <span className="w-1 h-1 bg-stone-300 rounded-full" />
            <span>{date}</span>
          </div>
          <h3 className="text-3xl font-black leading-none mb-2">{title}</h3>
          <p className="text-stone-200 text-sm line-clamp-2 opacity-90">{subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-4 bg-white dark:bg-dark-surface rounded-2xl shadow-sm dark:shadow-none border border-stone-100 dark:border-dark-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-stone-200 dark:bg-stone-800">
            <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                <span className="text-blue-600 dark:text-neon-cyan">{category}</span>
                <span>•</span>
                <span>{date}</span>
            </div>
            <h4 className="font-bold text-stone-900 dark:text-white leading-tight mb-1">{title}</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">{subtitle}</p>
        </div>
    </div>
  );
};
