
import React, { useState, useEffect } from 'react';
import { ArrowRight, Search, SlidersHorizontal, Star, ChevronLeft, Minus, Plus, Check, Settings, Package, CreditCard, MapPin, Bell, LogOut, ChevronRight, User as UserIcon, ShoppingBag, Trash2, Smartphone, Banknote, Loader2, Heart, X, Footprints, Shield, Flame, Share2, Mail } from 'lucide-react';
import { ProductCard, TrendingSection, NewsCard, ProductProps, formatINR, ThemeToggle, useCart, useAuth, useToast } from './SneakyUI';
import { cn } from '../utils/cn';
import { saveUserProfile } from '../lib/userProfile';
import { placeOrder, getUserOrders } from '../lib/orders';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../services/supabase';

// --- Landing Screen ---
export const LandingScreen: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <div className="h-full w-full flex flex-col items-center relative overflow-hidden transition-colors duration-500 bg-gradient-to-b from-cream-light to-cream-dark dark:from-dark-bg dark:to-[#1C1C1C]">
      
      {/* Theme Toggle - Absolute Top Right */}
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      {/* Grain Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" 
        style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` 
        }}
      />

      {/* Soft Spotlight Glow - Light Mode */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-white/60 blur-[80px] rounded-full pointer-events-none dark:opacity-0 transition-opacity" />
      
      {/* Soft Spotlight Glow - Dark Mode */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-neon-cyan/10 blur-[100px] rounded-full pointer-events-none opacity-0 dark:opacity-100 transition-opacity" />

      {/* Top Title */}
      <h1 className="font-black italic text-[48px] tracking-tighter text-[#1A1A1A] dark:text-white mt-[60px] z-10 drop-shadow-sm transform -rotate-2 transition-colors duration-500">
          SNEAKY
      </h1>

      {/* Hero Sneaker */}
      <div className="mt-[40px] z-10 animate-float relative">
        <img 
            src="https://nb.scene7.com/is/image/NB/bb550wt1_nb_02_i?$pdpflexf2$&wid=880&hei=880" 
            alt="Hero Sneaker" 
            className="w-[280px] h-[200px] object-contain -rotate-[10deg] mix-blend-multiply dark:mix-blend-normal relative z-10 transition-all duration-500"
            style={{ 
                filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.25))' 
            }}
        />
      </div>

      {/* Tagline - Dynamic Font Mix */}
      <div className="mt-[50px] z-10 text-center leading-[0.9]">
          <span className="block font-serif text-[42px] text-[#1A1A1A] dark:text-white transition-colors">Show</span>
          <span className="block font-sans font-black text-[46px] text-[#1A1A1A] dark:text-neon-cyan tracking-tighter uppercase transform -rotate-1 transition-colors">your style</span>
      </div>

      {/* CTA Button */}
      <button 
          onClick={onGetStarted}
          className="mt-[40px] w-[220px] h-[60px] bg-[#1A1A1A] dark:bg-white rounded-full flex items-center justify-center gap-3 shadow-[0_15px_35px_rgba(26,26,26,0.3)] dark:shadow-[0_0_20px_rgba(154,226,255,0.4)] hover:scale-105 transition-all duration-300 z-10 border-2 border-white/10 dark:border-transparent group"
      >
          <span className="text-white dark:text-[#0F0F0F] font-black tracking-wider text-[16px] uppercase">Get Started</span>
          <div className="bg-white dark:bg-[#0F0F0F] rounded-full p-1 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4 text-[#1A1A1A] dark:text-white" />
          </div>
      </button>
    </div>
  );
};

// --- Login Screen ---
export const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [wantsNews, setWantsNews] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const { signIn, continueAsGuest } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!email || !password) {
        showToast("Please enter email and password.", "error");
        setIsLoading(false);
        return;
    }

    if (mode === 'signup' && !name) {
        showToast("Please enter your name.", "error");
        setIsLoading(false);
        return;
    }

    try {
        if (mode === 'login') {
            const { error } = await signIn(email, password);
            if (error) {
                showToast(error.message, "error");
            } else {
                showToast("Welcome back!", "success");
                // App.tsx auth listener handles navigation
            }
        } else {
            // --- SIGNUP FLOW ---
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: name },
                    emailRedirectTo: null
                }
            });
            
            if (error) {
                showToast(error.message, "error");
                setIsLoading(false);
                return;
            }

            if (data.user) {
                const { error: profileError } = await saveUserProfile(data.user.id, email, name, wantsNews);
                if (profileError) {
                    console.error("Profile Save Error:", profileError);
                }
            }

            showToast("Welcome to Sneaky 😎", "success");

            if (!data.session) {
                const { error: signInError } = await signIn(email, password);
                if (!signInError) {
                    onLogin();
                }
            } else {
                onLogin();
            }
        }
    } catch (err) {
        console.error("Unexpected Auth Error:", err);
        showToast("An unexpected error occurred.", "error");
    } finally {
        setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
        showToast("Please enter your email", "error");
        return;
    }

    setIsResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
    setIsResetting(false);

    if (error) {
        showToast("Invalid email or something went wrong", "error");
    } else {
        showToast("Reset link sent to your email", "success");
        setShowForgotModal(false);
        setResetEmail('');
    }
  };

  const handleGuestAccess = () => {
      continueAsGuest();
      showToast("Welcome, Guest!", "success");
      onLogin();
  };
  
  return (
    <div className="h-full w-full bg-cream-light dark:bg-dark-bg p-8 flex flex-col transition-colors duration-500 relative">
      {/* Theme Toggle */}
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      <div className="pt-8 pb-12">
        <h1 className="text-4xl font-black text-[#1A1A1A] dark:text-white mb-2">SNEAKY</h1>
        <p className="text-stone-500 dark:text-stone-400 font-medium">Get ready to be cultured.</p>
      </div>

      <div className="bg-stone-100 dark:bg-dark-surface p-1 rounded-xl flex mb-8 transition-colors">
        <button 
            onClick={() => setMode('login')}
            className={cn("flex-1 py-3 rounded-lg text-sm font-bold transition-all", mode === 'login' ? "bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-white" : "text-stone-400")}
        >
            Log In
        </button>
        <button 
             onClick={() => setMode('signup')}
            className={cn("flex-1 py-3 rounded-lg text-sm font-bold transition-all", mode === 'signup' ? "bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-white" : "text-stone-400")}
        >
            Create Account
        </button>
      </div>

      <div className="space-y-4 flex-1">
        {mode === 'signup' && (
             <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wide">Full Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name" 
                    className="w-full bg-white dark:bg-dark-surface border-2 border-stone-100 dark:border-dark-border rounded-2xl px-4 py-4 text-stone-900 dark:text-white font-medium outline-none focus:border-blue-500 dark:focus:border-neon-cyan transition-colors placeholder-stone-400 dark:placeholder-stone-600" 
                />
            </div>
        )}
        <div className="space-y-2">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wide">Email</label>
            <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hypebeast@sneaky.com" 
                className="w-full bg-white dark:bg-dark-surface border-2 border-stone-100 dark:border-dark-border rounded-2xl px-4 py-4 text-stone-900 dark:text-white font-medium outline-none focus:border-blue-500 dark:focus:border-neon-cyan transition-colors placeholder-stone-400 dark:placeholder-stone-600" 
            />
        </div>
        <div className="space-y-2">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wide">Password</label>
            <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-white dark:bg-dark-surface border-2 border-stone-100 dark:border-dark-border rounded-2xl px-4 py-4 text-stone-900 dark:text-white font-medium outline-none focus:border-blue-500 dark:focus:border-neon-cyan transition-colors placeholder-stone-400 dark:placeholder-stone-600" 
            />
        </div>
        
        {/* Forgot Password Link */}
        {mode === 'login' && (
            <div className="text-center pt-2">
                <button 
                    onClick={() => setShowForgotModal(true)}
                    className="text-sm text-[#6B6B6B] font-bold hover:underline cursor-pointer transition-colors hover:text-stone-900 dark:hover:text-white"
                >
                    Forgot Password?
                </button>
            </div>
        )}

        {mode === 'signup' && (
             <div 
                className="flex items-center gap-3 py-2 cursor-pointer group"
                onClick={() => setWantsNews(!wantsNews)}
             >
                <div className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200",
                    wantsNews 
                        ? "border-blue-500 dark:border-neon-cyan bg-blue-500/10 dark:bg-neon-cyan/10" 
                        : "border-stone-200 dark:border-dark-border bg-transparent"
                )}>
                    <Check className={cn(
                        "w-4 h-4 text-blue-500 dark:text-neon-cyan transition-transform duration-200",
                        wantsNews ? "scale-100 opacity-100" : "scale-50 opacity-0"
                    )} />
                </div>
                <p className="text-xs text-stone-500 font-medium group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors select-none">
                    Send me exclusive drops & news.
                </p>
             </div>
        )}
      </div>

      <div className="mt-8">
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-[#1A1A1A] dark:bg-white text-white dark:text-black font-bold text-lg py-5 rounded-2xl shadow-lg hover:scale-[1.02] transition-all dark:shadow-[0_0_15px_rgba(154,226,255,0.3)] flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (mode === 'login' ? 'Log In' : 'Join the Club')}
          </button>

          <button 
            onClick={handleGuestAccess}
            className="mt-4 mx-auto block px-8 py-3 rounded-xl border-2 border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white font-bold text-sm bg-transparent hover:bg-black/5 dark:hover:bg-white/10 transition-all"
          >
            Log in as Guest
          </button>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-dark-surface rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-stone-100 dark:border-dark-border animate-in zoom-in-95 duration-300 relative">
                <button 
                    onClick={() => setShowForgotModal(false)}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 dark:hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
                
                <h2 className="text-xl font-black text-stone-900 dark:text-white mb-2 text-center">Reset Password</h2>
                <p className="text-stone-500 dark:text-stone-400 text-center text-sm mb-6">Enter your email to receive a reset link.</p>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wide">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <input 
                                type="email" 
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="hypebeast@sneaky.com" 
                                className="w-full bg-stone-50 dark:bg-stone-800 rounded-xl pl-11 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-neon-cyan text-stone-900 dark:text-white" 
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleResetPassword}
                        disabled={isResetting}
                        className="w-full bg-stone-900 dark:bg-neon-cyan text-white dark:text-black font-bold py-3.5 rounded-xl shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        {isResetting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// --- Home Screen ---
export const HomeScreen: React.FC<{ products: ProductProps[], onProductClick: (p: ProductProps) => void, onNewsClick: () => void }> = ({ products, onProductClick, onNewsClick }) => {
  const [segment, setSegment] = useState<'sneakers'>('sneakers');
  const heroProduct = products.find(p => p.name.includes('Jordan 4')) || products[0];

  return (
    <div className="h-full overflow-y-auto pb-24 bg-cream-light dark:bg-dark-bg no-scrollbar transition-colors duration-500">
      {/* Header */}
      <div className="sticky top-0 bg-cream-light/95 dark:bg-dark-bg/95 backdrop-blur-sm z-20 px-6 pt-12 pb-4 flex items-center justify-between transition-colors">
        <Search className="w-6 h-6 text-stone-900 dark:text-white" />
        <h1 className="text-2xl font-black tracking-tighter text-stone-900 dark:text-white animate-float-subtle">SNEAKY</h1>
        
        <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
                onClick={onNewsClick}
                className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center border border-stone-200 dark:border-stone-700 shadow-sm hover:scale-105 transition-transform active:scale-95"
                title="Latest News"
            >
                <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400 fill-orange-500/20" />
            </button>
        </div>
      </div>

      {/* Segment Control */}
      <div className="px-6 mb-6">
        <div className="flex gap-8 border-b border-stone-200 dark:border-dark-border">
            {['sneakers'].map((s) => (
                <button 
                    key={s}
                    className={cn(
                        "pb-3 text-sm font-bold uppercase tracking-wide transition-all relative text-stone-900 dark:text-white"
                    )}
                >
                    {s}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-900 dark:bg-neon-cyan rounded-t-full" />
                </button>
            ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="px-6 mb-8">
        <div className="relative w-full aspect-[16/9] bg-black rounded-3xl overflow-hidden group shadow-xl shadow-stone-900/10 dark:shadow-black/40 dark:border dark:border-dark-border">
            <img src="https://images.unsplash.com/photo-1600185365483-26d7a04afbce?q=80&w=2564&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" alt="Banner" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 max-w-[70%]">
                <span className="bg-[#D4AF37] text-black text-[10px] font-black px-2 py-1 rounded mb-2 inline-block">EXCLUSIVE DROP</span>
                <h2 className="text-2xl font-black text-white italic leading-none">{heroProduct?.name.split(' ').slice(0,3).join(' ')}</h2>
                <p className="text-stone-300 text-xs mt-2 font-medium">Starts at {formatINR(heroProduct ? heroProduct.price : 19295)}</p>
            </div>
        </div>
      </div>

      <TrendingSection products={products.slice(0, 6)} onProductClick={onProductClick} />

      {/* Grid Section */}
      <div className="px-6 mt-4">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black tracking-tight text-stone-900 dark:text-white">Just For You</h2>
            <SlidersHorizontal className="w-5 h-5 text-stone-400" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            {products.slice(6, 12).map((p) => (
                <ProductCard key={p.id} {...p} onPress={() => onProductClick(p)} />
            ))}
        </div>
      </div>
    </div>
  );
};

// --- Shop Screen ---
export const ShopScreen: React.FC<{ products: ProductProps[], onProductClick: (p: ProductProps) => void }> = ({ products, onProductClick }) => {
  const brands = ['All', 'Nike', 'Jordan', 'Adidas', 'Yeezy', 'New Balance'];
  const [activeBrand, setActiveBrand] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 30000 });
  
  // Temp state for modal
  const [tempBrand, setTempBrand] = useState('All');
  const [tempMin, setTempMin] = useState(0);
  const [tempMax, setTempMax] = useState(30000);

  const handleOpenFilters = () => {
    setTempBrand(activeBrand);
    setTempMin(priceRange.min);
    setTempMax(priceRange.max);
    setShowFilters(true);
  };

  const handleApplyFilters = () => {
    setActiveBrand(tempBrand);
    setPriceRange({ min: tempMin, max: tempMax });
    setShowFilters(false);
  };

  const filteredProducts = React.useMemo(() => {
    let items = [...products];
    if (activeBrand !== 'All') {
        // Updated filter logic to check categories array
        items = items.filter(p => p.categories && p.categories.includes(activeBrand));
    }
    items = items.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
    return items;
  }, [products, activeBrand, priceRange]);

  return (
    <div className="h-full overflow-y-auto pb-24 bg-cream-light dark:bg-dark-bg no-scrollbar transition-colors duration-500 relative">
      <div className="sticky top-0 bg-cream-light/95 dark:bg-dark-bg/95 backdrop-blur-sm z-20 px-6 pt-12 pb-4 space-y-4 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between">
             <h1 className="text-3xl font-black tracking-tighter text-stone-900 dark:text-white">SHOP</h1>
             <div className="flex items-center gap-3">
                 <ThemeToggle />
                 <Search className="w-6 h-6 text-stone-900 dark:text-white" />
             </div>
        </div>
        
        {/* Brand Tabs */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
            {brands.map(brand => (
                <button
                    key={brand}
                    onClick={() => setActiveBrand(brand)}
                    className={cn(
                        "px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0",
                        activeBrand === brand 
                            ? "bg-stone-900 dark:bg-neon-cyan text-white dark:text-black border-stone-900 dark:border-neon-cyan shadow-lg" 
                            : "bg-white dark:bg-dark-surface text-stone-500 dark:text-stone-400 border-stone-200 dark:border-dark-border hover:border-stone-400 dark:hover:border-stone-500"
                    )}
                >
                    {brand}
                </button>
            ))}
        </div>
      </div>

      {/* Results & Filter Button */}
      <div className="px-6 pb-4 flex items-center justify-between text-xs font-bold text-stone-400 dark:text-stone-500">
        <span>{filteredProducts.length} KICKS FOUND</span>
        <button 
            onClick={handleOpenFilters}
            className="flex items-center gap-2 text-stone-900 dark:text-white bg-white dark:bg-dark-surface px-4 py-2 rounded-xl shadow-sm border border-stone-100 dark:border-dark-border active:scale-95 transition-all"
        >
            Filters <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 px-6 pb-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
        {filteredProducts.map((p) => (
            <ProductCard key={p.id} {...p} onPress={() => onProductClick(p)} />
        ))}
        {filteredProducts.length === 0 && (
            <div className="col-span-2 text-center py-10 text-stone-400">
                No sneakers found in this range.
            </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
            <div className="bg-white dark:bg-dark-surface rounded-t-[30px] p-6 z-10 animate-in slide-in-from-bottom duration-300 shadow-2xl border-t border-stone-100 dark:border-dark-border">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-stone-900 dark:text-white">Filters</h2>
                    <button onClick={() => setShowFilters(false)} className="p-2 bg-stone-100 dark:bg-stone-800 rounded-full">
                        <X className="w-5 h-5 text-stone-900 dark:text-white" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Brand Filter */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-sm text-stone-500 dark:text-stone-400 uppercase">Brand</h3>
                        <div className="flex flex-wrap gap-2">
                            {brands.map(brand => (
                                <button
                                    key={brand}
                                    onClick={() => setTempBrand(brand)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-xs font-bold transition-all border",
                                        tempBrand === brand 
                                            ? "bg-stone-900 dark:bg-neon-cyan text-white dark:text-black border-stone-900 dark:border-neon-cyan" 
                                            : "bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-transparent"
                                    )}
                                >
                                    {brand}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-sm text-stone-500 dark:text-stone-400 uppercase">Price Range</h3>
                            <span className="text-xs font-bold text-stone-900 dark:text-white">
                                {formatINR(tempMin)} - {formatINR(tempMax)}
                            </span>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] text-stone-400 mb-1 block">Min Price</label>
                                <input 
                                    type="number" 
                                    value={tempMin}
                                    onChange={(e) => setTempMin(Number(e.target.value))}
                                    className="w-full bg-stone-50 dark:bg-stone-800 rounded-xl px-3 py-2 text-sm font-bold text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-neon-cyan"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] text-stone-400 mb-1 block">Max Price</label>
                                <input 
                                    type="number" 
                                    value={tempMax}
                                    onChange={(e) => setTempMax(Number(e.target.value))}
                                    className="w-full bg-stone-50 dark:bg-stone-800 rounded-xl px-3 py-2 text-sm font-bold text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-neon-cyan"
                                />
                            </div>
                        </div>
                         <input 
                            type="range" 
                            min="0" 
                            max="30000" 
                            step="1000"
                            value={tempMax} 
                            onChange={(e) => setTempMax(Number(e.target.value))}
                            className="w-full accent-stone-900 dark:accent-neon-cyan h-1 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer"
                         />
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button 
                        onClick={() => { setTempBrand('All'); setTempMin(0); setTempMax(30000); }}
                        className="flex-1 py-4 rounded-2xl font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                    >
                        Reset
                    </button>
                    <button 
                        onClick={handleApplyFilters}
                        className="flex-[2] py-4 rounded-2xl font-bold text-white dark:text-black bg-stone-900 dark:bg-neon-cyan shadow-lg hover:scale-[1.02] transition-all"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// --- Orders Screen ---
export const OrdersScreen: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    useEffect(() => {
        if (user) {
            getUserOrders(user.id).then(({ data }) => {
                if (data) setOrders(data);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [user]);

    if (selectedOrder) {
        return <OrderDetailsScreen order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
    }

    return (
        <div className="h-full overflow-y-auto pb-24 bg-cream-light dark:bg-dark-bg no-scrollbar transition-colors duration-500">
            <div className="sticky top-0 bg-cream-light/95 dark:bg-dark-bg/95 backdrop-blur-sm z-20 px-6 pt-12 pb-4 flex justify-between items-center border-b border-stone-100 dark:border-dark-border transition-colors">
                <h1 className="text-3xl font-black tracking-tighter text-stone-900 dark:text-white">MY ORDERS</h1>
                <ThemeToggle />
            </div>
            
            <div className="p-6 space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-stone-400">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-10 h-10 text-stone-300" />
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 dark:text-white">No orders yet</h3>
                        <p className="text-stone-500 text-sm mb-6">Looks like you haven't copped any kicks yet.</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div 
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className="bg-white dark:bg-dark-surface p-5 rounded-2xl shadow-sm border border-stone-100 dark:border-dark-border active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
                                        <Package className="w-5 h-5 text-stone-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-900 dark:text-white text-sm">Order #{order.id.slice(0,6).toUpperCase()}</h4>
                                        <p className="text-[10px] text-stone-500 dark:text-stone-400">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-stone-300" />
                            </div>
                            <div className="flex justify-between items-center pl-13">
                                <div className="flex -space-x-2 overflow-hidden">
                                    {order.order_items?.slice(0,3).map((item: any, i: number) => (
                                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-dark-surface bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt="" className="w-6 h-6 object-contain" />
                                            ) : (
                                                <ShoppingBag className="w-3 h-3 text-stone-400" />
                                            )}
                                        </div>
                                    ))}
                                    {order.order_items?.length > 3 && (
                                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-dark-surface bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-[10px] font-bold text-stone-600 dark:text-stone-300">
                                            +{order.order_items.length - 3}
                                        </div>
                                    )}
                                </div>
                                <span className="font-bold text-stone-900 dark:text-white text-sm">{formatINR(order.total)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- Order Details Screen ---
export const OrderDetailsScreen: React.FC<{ order: any, onBack: () => void }> = ({ order, onBack }) => {
    return (
        <div className="h-full overflow-y-auto pb-24 bg-cream-light dark:bg-dark-bg no-scrollbar transition-colors duration-500">
                <div className="sticky top-0 z-20 px-6 pt-12 pb-4 flex justify-between items-center bg-cream-light/90 dark:bg-dark-bg/90 backdrop-blur-md border-b border-stone-100 dark:border-dark-border">
                <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-dark-surface rounded-full flex items-center justify-center shadow-sm text-stone-900 dark:text-white">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-black text-stone-900 dark:text-white">ORDER #{order.id.slice(0, 6).toUpperCase()}</h1>
                <div className="w-10" />
            </div>
            
            <div className="p-6 space-y-6">
                <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-stone-100 dark:border-dark-border shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-stone-400 uppercase tracking-wider">Status</span>
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">Placed</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-stone-400 uppercase tracking-wider">Date</span>
                            <span className="text-stone-900 dark:text-white font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="h-px bg-stone-100 dark:bg-dark-border my-4" />
                        <div className="space-y-4">
                            {order.order_items.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-xl flex items-center justify-center shrink-0">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.product_name} className="w-14 h-14 object-contain" />
                                        ) : (
                                            <ShoppingBag className="w-6 h-6 text-stone-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-stone-900 dark:text-white text-sm line-clamp-1">{item.product_name}</h4>
                                        <p className="text-xs text-stone-500 dark:text-stone-400">Size: {item.size} | Qty: {item.quantity}</p>
                                    </div>
                                    <span className="font-bold text-stone-900 dark:text-white text-sm">{formatINR(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="h-px bg-stone-100 dark:bg-dark-border my-4" />
                        <div className="flex justify-between items-center">
                            <span className="text-base font-bold text-stone-900 dark:text-white">Total Amount</span>
                            <span className="text-xl font-black text-stone-900 dark:text-neon-cyan">{formatINR(order.total)}</span>
                        </div>
                </div>
                
                <div className="bg-stone-50 dark:bg-dark-surface p-4 rounded-2xl text-center">
                    <p className="text-xs text-stone-500 dark:text-stone-400">Need help with this order?</p>
                    <button className="text-blue-600 dark:text-neon-cyan text-sm font-bold mt-1">Contact Support</button>
                </div>
            </div>
        </div>
    );
};

// --- Cart Screen ---
export const CartScreen: React.FC<{ onCheckout: () => void, onShopNow: () => void }> = ({ onCheckout, onShopNow }) => {
  const { items, removeFromCart, updateQuantity, total, itemCount } = useCart();

  return (
    <div className="h-full flex flex-col bg-cream-light dark:bg-dark-bg transition-colors duration-500">
        <div className="px-6 pt-12 pb-4 flex justify-between items-center border-b border-stone-100 dark:border-dark-border">
             <h1 className="text-3xl font-black tracking-tighter text-stone-900 dark:text-white">MY BAG</h1>
             <ThemeToggle />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-stone-100 dark:bg-dark-surface rounded-full flex items-center justify-center mb-6">
                        <ShoppingBag className="w-10 h-10 text-stone-300" />
                    </div>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">Your bag is empty</h2>
                    <p className="text-stone-500 dark:text-stone-400 mb-8 max-w-[200px]">Looks like you haven't made your choice yet.</p>
                    <button 
                        onClick={onShopNow}
                        className="bg-stone-900 dark:bg-neon-cyan text-white dark:text-black font-bold py-4 px-10 rounded-2xl hover:scale-105 transition-transform shadow-lg"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                items.map((item) => (
                    <div key={item.cartId} className="flex gap-4 bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-stone-100 dark:border-dark-border animate-in slide-in-from-bottom-4 duration-500">
                        <div className="w-24 h-24 bg-stone-50 dark:bg-stone-800 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden">
                             <img src={item.image} alt={item.name} className="w-20 h-20 object-contain mix-blend-multiply dark:mix-blend-normal" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                             <div>
                                 <h3 className="font-bold text-stone-900 dark:text-white leading-tight mb-1 line-clamp-1">{item.name}</h3>
                                 <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">{item.brand} • Size {item.selectedSize}</p>
                             </div>
                             <div className="flex justify-between items-end">
                                 <span className="font-extrabold text-stone-900 dark:text-white">{formatINR(item.price)}</span>
                                 <div className="flex items-center gap-3 bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
                                     <button 
                                        onClick={() => item.quantity === 1 ? removeFromCart(item.cartId) : updateQuantity(item.cartId, -1)} 
                                        className="p-1 hover:bg-white dark:hover:bg-stone-700 rounded-md transition-colors active:scale-90"
                                     >
                                         {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3 text-stone-900 dark:text-white" />}
                                     </button>
                                     <span className="text-xs font-bold w-4 text-center text-stone-900 dark:text-white">{item.quantity}</span>
                                     <button onClick={() => updateQuantity(item.cartId, 1)} className="p-1 hover:bg-white dark:hover:bg-stone-700 rounded-md transition-colors active:scale-90">
                                         <Plus className="w-3 h-3 text-stone-900 dark:text-white" />
                                     </button>
                                 </div>
                             </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {items.length > 0 && (
            <div className="p-6 bg-white dark:bg-dark-surface border-t border-stone-100 dark:border-dark-border shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-24">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-stone-500 dark:text-stone-400 font-bold text-sm">Total ({itemCount} items)</span>
                    <span className="text-2xl font-black text-stone-900 dark:text-white">{formatINR(total)}</span>
                </div>
                <button 
                    onClick={onCheckout}
                    className="w-full bg-stone-900 dark:bg-neon-cyan text-white dark:text-black font-black text-lg py-5 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 dark:shadow-[0_0_20px_rgba(154,226,255,0.3)]"
                >
                    Checkout <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        )}
    </div>
  );
};

// --- Product Detail Screen ---
export const ProductDetailScreen: React.FC<{ product: ProductProps, onBack: () => void }> = ({ product, onBack }) => {
  const [selectedSize, setSelectedSize] = useState(9);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const sizes = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12];
  
  const handleAddToCart = () => {
      addToCart(product, selectedSize);
      showToast(`Added ${product.name} to bag`, 'success');
      onBack();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-bg transition-colors duration-500 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 p-6 pt-12 flex justify-between items-center z-20">
        <button onClick={onBack} className="w-10 h-10 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-stone-900 dark:text-white hover:scale-105 transition-transform">
            <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-3">
            <ThemeToggle />
            <button className="w-10 h-10 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-stone-900 dark:text-white hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Product Image Area */}
        <div className="h-[45%] bg-stone-100 dark:bg-stone-800 relative rounded-b-[40px] overflow-hidden">
            <img 
                src={product.image} 
                alt={product.name} 
                className="absolute inset-0 w-full h-full object-contain p-8 mix-blend-multiply dark:mix-blend-normal animate-in zoom-in-90 duration-700"
                onError={(e) => e.currentTarget.src = "https://images.unsplash.com/photo-1552346154-21d32810aba3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"}
            />
        </div>

        <div className="p-6 space-y-6 animate-in slide-in-from-bottom-10 duration-500">
            <div>
                <h2 className="text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider text-sm mb-1">{product.brand}</h2>
                <h1 className="text-2xl font-black text-stone-900 dark:text-white leading-tight mb-2">{product.name}</h1>
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-stone-900 dark:text-neon-cyan">{formatINR(product.price)}</span>
                    <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg">
                        <Star className="w-3 h-3 text-green-600 dark:text-green-400 fill-current" />
                        <span className="text-xs font-bold text-green-700 dark:text-green-400">4.8</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                     <h3 className="font-bold text-sm text-stone-900 dark:text-white">Select Size (US)</h3>
                     <span className="text-xs font-bold text-stone-400 cursor-pointer">Size Guide</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6">
                    {sizes.map(size => (
                        <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all flex-shrink-0 border-2",
                                selectedSize === size 
                                    ? "bg-stone-900 dark:bg-white text-white dark:text-black border-stone-900 dark:border-white shadow-lg scale-110" 
                                    : "bg-white dark:bg-dark-surface text-stone-400 dark:text-stone-500 border-stone-100 dark:border-dark-border hover:border-stone-300"
                            )}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">Description</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed line-clamp-3">
                    The {product.name} combines classic style with modern comfort. Featuring premium materials and the iconic {product.brand} cushioning technology for all-day wearability.
                </p>
            </div>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-dark-surface border-t border-stone-100 dark:border-dark-border">
        <button 
            onClick={handleAddToCart}
            className="w-full bg-stone-900 dark:bg-neon-cyan text-white dark:text-black font-black text-lg py-3 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
            <ShoppingBag className="w-5 h-5" />
            Add to Cart
        </button>
      </div>
    </div>
  );
};

// --- Checkout Screen ---
export const CheckoutScreen: React.FC<{ total: number, onBack: () => void, onPlaceOrder: () => void }> = ({ total, onBack, onPlaceOrder }) => {
  const [loading, setLoading] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const { items, clearCart } = useCart();
  const { isGuest, signOut } = useAuth();
  const { showToast } = useToast();

  const handleOrder = async () => {
    if (isGuest) {
        setShowGuestModal(true);
        return;
    }

    setLoading(true);
    try {
        const { data: session } = await getCurrentUser();
        if (!session?.user) {
             showToast("Please login to place order", "error");
             setLoading(false);
             return;
        }

        const userId = session.user.id;
        const { error } = await placeOrder(userId, items);

        if (error) {
             showToast("Failed to place order. Try again.", "error");
        } else {
             clearCart();
             onPlaceOrder(); // Navigate to success
             showToast("Order placed successfully!", "success");
        }
    } catch (err) {
        showToast("Something went wrong", "error");
    } finally {
        setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
      await signOut(); // This will redirect to Login screen
  };

  return (
    <div className="h-full flex flex-col bg-cream-light dark:bg-dark-bg transition-colors duration-500 relative">
       <div className="px-6 pt-12 pb-4 flex justify-between items-center border-b border-stone-100 dark:border-dark-border">
            <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-dark-surface rounded-full flex items-center justify-center shadow-sm text-stone-900 dark:text-white">
                <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-black tracking-tight text-stone-900 dark:text-white">CHECKOUT</h1>
            <div className="w-10" />
       </div>

       <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
           {/* Shipping Address */}
           <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl shadow-sm border border-stone-100 dark:border-dark-border">
               <div className="flex items-center gap-3 mb-4 text-stone-900 dark:text-white">
                   <MapPin className="w-5 h-5" />
                   <h3 className="font-bold text-sm uppercase tracking-wide">Shipping Address</h3>
               </div>
               <form className="space-y-3">
                   <input type="text" placeholder="Full Name" className="w-full bg-stone-50 dark:bg-stone-800 rounded-xl px-4 py-3 text-sm font-medium outline-none" />
                   <input type="text" placeholder="Street Address" className="w-full bg-stone-50 dark:bg-stone-800 rounded-xl px-4 py-3 text-sm font-medium outline-none" />
                   <div className="flex gap-3">
                       <input type="text" placeholder="City" className="w-full bg-stone-50 dark:bg-stone-800 rounded-xl px-4 py-3 text-sm font-medium outline-none" />
                       <input type="text" placeholder="Zip Code" className="w-full bg-stone-50 dark:bg-stone-800 rounded-xl px-4 py-3 text-sm font-medium outline-none" />
                   </div>
               </form>
           </div>

           {/* Payment Method */}
           <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl shadow-sm border border-stone-100 dark:border-dark-border">
               <div className="flex items-center gap-3 mb-4 text-stone-900 dark:text-white">
                   <CreditCard className="w-5 h-5" />
                   <h3 className="font-bold text-sm uppercase tracking-wide">Payment Method</h3>
               </div>
               <div className="space-y-2">
                   {['Credit Card', 'UPI', 'Cash on Delivery'].map((method, i) => (
                       <div key={i} className={cn("flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all", i === 0 ? "border-stone-900 dark:border-neon-cyan bg-stone-50 dark:bg-stone-800/50" : "border-stone-200 dark:border-dark-border hover:bg-stone-50 dark:hover:bg-stone-800")}>
                           <span className="text-sm font-bold text-stone-700 dark:text-stone-200">{method}</span>
                           <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", i === 0 ? "border-stone-900 dark:border-neon-cyan" : "border-stone-300")}>
                               {i === 0 && <div className="w-2 h-2 rounded-full bg-stone-900 dark:bg-neon-cyan" />}
                           </div>
                       </div>
                   ))}
               </div>
           </div>

           {/* Order Summary */}
           <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl shadow-sm border border-stone-100 dark:border-dark-border">
               <h3 className="font-bold text-sm uppercase tracking-wide mb-4 text-stone-900 dark:text-white">Order Summary</h3>
               <div className="space-y-2 text-sm">
                   <div className="flex justify-between text-stone-500 dark:text-stone-400">
                       <span>Subtotal</span>
                       <span>{formatINR(total)}</span>
                   </div>
                   <div className="flex justify-between text-stone-500 dark:text-stone-400">
                       <span>Shipping</span>
                       <span>{formatINR(0)}</span>
                   </div>
                   <div className="h-px bg-stone-100 dark:bg-dark-border my-2" />
                   <div className="flex justify-between font-black text-lg text-stone-900 dark:text-white">
                       <span>Grand Total</span>
                       <span>{formatINR(total)}</span>
                   </div>
               </div>
           </div>
       </div>

       <div className="p-6 bg-white dark:bg-dark-surface border-t border-stone-100 dark:border-dark-border">
            <button 
                onClick={handleOrder}
                disabled={loading}
                className="w-full bg-stone-900 dark:bg-neon-cyan text-white dark:text-black font-black text-lg py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 dark:shadow-[0_0_20px_rgba(154,226,255,0.3)] disabled:opacity-70"
            >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : `Pay ${formatINR(total)}`}
            </button>
       </div>

       {/* Guest Modal */}
       {showGuestModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-dark-surface rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-stone-100 dark:border-dark-border animate-in zoom-in-95 duration-300">
                <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-2 text-center">Create an account to continue</h2>
                <p className="text-stone-500 dark:text-stone-400 text-center mb-8">You need to be a member to place orders and track your kicks.</p>
                <div className="space-y-3">
                    <button 
                        onClick={handleCreateAccount}
                        className="w-full bg-stone-900 dark:bg-neon-cyan text-white dark:text-black font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
                    >
                        Create Account
                    </button>
                    <button 
                        onClick={() => setShowGuestModal(false)}
                        className="w-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-bold py-4 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
       )}
    </div>
  );
};

// --- Order Success Screen ---
export const OrderSuccessScreen: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-cream-light dark:bg-dark-bg p-8 text-center">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
            <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-black text-stone-900 dark:text-white mb-2 animate-in slide-in-from-bottom-4 delay-100">Order Placed!</h1>
        <p className="text-stone-500 dark:text-stone-400 mb-8 max-w-[250px] animate-in slide-in-from-bottom-4 delay-200">Your kicks are on the way. Get ready to flex.</p>
        
        <button 
            onClick={onContinue}
            className="w-full bg-stone-900 dark:bg-white text-white dark:text-black font-bold text-lg py-4 rounded-2xl shadow-lg hover:scale-[1.02] transition-all animate-in slide-in-from-bottom-4 delay-300"
        >
            Continue Shopping
        </button>
    </div>
  );
};

// --- Profile Screen ---
export const ProfileScreen: React.FC = () => {
  const { user, isGuest, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
      setLoading(true);
      await signOut();
      setLoading(false);
  };

  const menuItems = [
      { icon: Package, label: 'My Orders', disabled: isGuest },
      { icon: Heart, label: 'Wishlist', disabled: isGuest },
      { icon: MapPin, label: 'Shipping Address', disabled: isGuest },
      { icon: CreditCard, label: 'Payment Methods', disabled: isGuest },
      { icon: Settings, label: 'Settings' },
      { icon: Shield, label: 'Privacy Policy' },
  ];

  return (
    <div className="h-full overflow-y-auto pb-24 bg-cream-light dark:bg-dark-bg no-scrollbar transition-colors duration-500 relative">
       <div className="absolute top-5 right-5 z-50">
           <ThemeToggle />
       </div>

       <div className="pt-16 px-6 pb-8">
           <div className="flex flex-col items-center">
               <div className="w-24 h-24 bg-stone-200 dark:bg-stone-800 rounded-full mb-4 overflow-hidden border-4 border-white dark:border-dark-surface shadow-lg">
                   <div className="w-full h-full flex items-center justify-center text-stone-400 dark:text-stone-600">
                       <UserIcon className="w-12 h-12" />
                   </div>
               </div>
               <h1 className="text-2xl font-black text-stone-900 dark:text-white mb-1">
                   {isGuest ? 'Guest User' : (user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Sneakerhead')}
               </h1>
               <p className="text-sm font-bold text-stone-400 dark:text-stone-500">{user?.email || 'guest@sneaky.com'}</p>

               {isGuest && (
                   <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-2xl w-full text-center">
                       <p className="text-sm text-blue-800 dark:text-blue-200 font-bold mb-4 leading-relaxed">
                           You’re browsing as a guest — create an account to unlock orders, wishlist and drops.
                       </p>
                       <button 
                           onClick={handleSignOut}
                           className="w-full font-bold bg-blue-600 dark:bg-neon-cyan text-white dark:text-black py-3 rounded-xl shadow-md hover:scale-[1.02] transition-transform"
                       >
                           Create Account
                       </button>
                   </div>
               )}
           </div>
       </div>

       <div className="px-4 space-y-2">
           {menuItems.map((item, i) => (
               <button 
                   key={i}
                   disabled={item.disabled}
                   className={cn(
                       "w-full flex items-center gap-4 p-4 rounded-2xl transition-all",
                       item.disabled 
                        ? "opacity-50 cursor-not-allowed bg-stone-50 dark:bg-dark-surface/50" 
                        : "bg-white dark:bg-dark-surface hover:shadow-md active:scale-[0.98]"
                   )}
               >
                   <div className="w-10 h-10 rounded-full bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-stone-900 dark:text-white">
                       <item.icon className="w-5 h-5" />
                   </div>
                   <span className="flex-1 text-left font-bold text-stone-900 dark:text-white text-sm">{item.label}</span>
                   <ChevronRight className="w-5 h-5 text-stone-300" />
               </button>
           ))}

           <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 mt-6 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
           >
               <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                   <LogOut className="w-5 h-5" />
               </div>
               <span className="flex-1 text-left font-bold text-red-500 text-sm">
                   {loading ? 'Signing out...' : (isGuest ? 'Exit Guest Mode' : 'Log Out')}
               </span>
           </button>
       </div>
    </div>
  );
};

// --- News Screen ---
export const NewsScreen: React.FC = () => {
    const categories = ['All', 'Drops', 'Culture', 'Style', 'Interviews'];
    const [activeCategory, setActiveCategory] = useState('All');

    const news = [
        {
            id: 1,
            title: "Travis Scott x Jordan Cut The Check",
            subtitle: "First look at La Flame's first signature silhouette with Jordan Brand. The design features a mid-cut construction with the signature reverse swoosh.",
            image: "https://images.complex.com/complex/images/c_fill,dpr_auto,f_auto,q_auto,w_1400/fl_lossy,pg_1/proj/2023/11/travis-scott-jordan-cut-the-check-release-date/travis-scott-jordan-cut-the-check-release-date?fimg-ssr-default",
            category: "Drops",
            date: "2h ago",
            featured: true
        },
        {
            id: 2,
            title: "The Future of YEEZY",
            subtitle: "What happens to the remaining inventory? Adidas gives an update on future releases.",
            image: "https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2023%2F05%2Fadidas-yeezy-releases-restock-info-001.jpg?w=960&cbr=1&q=90&fit=max",
            category: "Culture",
            date: "5h ago"
        },
        {
            id: 3,
            title: "New Balance 550 'Hemp'",
            subtitle: "A sustainable take on the classic basketball silhouette.",
            image: "https://sneakernews.com/wp-content/uploads/2023/06/New-Balance-550-Hemp-Rattan-Sea-Salt-Black-BB550MDA-5.jpg",
            category: "Style",
            date: "1d ago"
        },
        {
            id: 4,
            title: "Kobe 8 Protro 'Halo'",
            subtitle: "Nike Basketball announces the return of the Kobe 8 in an all-white colorway.",
            image: "https://static.nike.com/a/images/f_auto/dpr_3.0,cs_srgb/w_411,c_limit/4f37fca2-6b75-4683-a32e-6a2840480884/nike-kobe-8-protro-halo-release-date.jpg",
            category: "Drops",
            date: "2d ago"
        }
    ];

    const filteredNews = activeCategory === 'All' ? news : news.filter(n => n.category === activeCategory);

    return (
        <div className="h-full overflow-y-auto pb-24 bg-cream-light dark:bg-dark-bg no-scrollbar transition-colors duration-500 relative">
             <div className="sticky top-0 bg-cream-light/95 dark:bg-dark-bg/95 backdrop-blur-sm z-20 px-6 pt-12 pb-4 space-y-4 transition-colors">
                <div className="flex justify-between items-center">
                     <h1 className="text-3xl font-black tracking-tighter text-stone-900 dark:text-white">NEWS</h1>
                     <ThemeToggle />
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0",
                                activeCategory === cat
                                    ? "bg-stone-900 dark:bg-neon-cyan text-white dark:text-black border-stone-900 dark:border-neon-cyan shadow-lg" 
                                    : "bg-white dark:bg-dark-surface text-stone-500 dark:text-stone-400 border-stone-200 dark:border-dark-border hover:border-stone-400 dark:hover:border-stone-500"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
             </div>

             <div className="px-6 space-y-6 pb-8 animate-in slide-in-from-bottom-4 duration-500">
                {activeCategory === 'All' && news[0] && (
                    <NewsCard {...news[0]} />
                )}
                <div className="space-y-4">
                    {filteredNews.filter(n => activeCategory !== 'All' || !n.featured).map(item => (
                        <NewsCard key={item.id} {...item} />
                    ))}
                </div>
             </div>
        </div>
    );
};
