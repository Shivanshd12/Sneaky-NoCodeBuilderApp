
import React, { useState, useEffect } from 'react';
import { LandingScreen, HomeScreen, ShopScreen, NewsScreen, ProductDetailScreen, LoginScreen, ProfileScreen, CartScreen, CheckoutScreen, OrderSuccessScreen, OrdersScreen } from './components/SneakyScreens';
import { BottomNav, ProductProps, ThemeProvider, ThemeToggle, CartProvider, useCart, AuthProvider, useAuth, ToastProvider } from './components/SneakyUI';

// --- REAL SNEAKER DATABASE (Verified Single Source of Truth) ---
const RAW_SNEAKER_DATA = [
  {
    "brand": "Jordan",
    "model": "Air Jordan 1 Low 'Bred Toe'",
    "price": "11995",
    "image_url": "https://images.stockx.com/images/Air-Jordan-1-Low-Bred-Toe-Product.jpg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&q=90"
  },
  {
    "brand": "Jordan",
    "model": "Air Jordan 4 'Military Black'",
    "price": "15995",
    "image_url": "https://images.stockx.com/images/Air-Jordan-4-Retro-Military-Black-Product.jpg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&q=90"
  },
  {
    "brand": "Jordan",
    "model": "Air Jordan 3 'White Cement Reimagined'",
    "price": "17995",
    "image_url": "https://images.stockx.com/images/Air-Jordan-3-Retro-White-Cement-Reimagined-Product.jpg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&q=90"
  },
  {
    "brand": "Jordan",
    "model": "Air Jordan 1 'Lost and Found'",
    "price": "13995",
    "image_url": "https://images.stockx.com/images/Air-Jordan-1-Retro-High-OG-Chicago-Lost-and-Found-Product.jpg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&q=90"
  },
  {
    "brand": "Jordan",
    "model": "Air Jordan 5 'UNC'",
    "price": "14995",
    "image_url": "https://images.stockx.com/images/Air-Jordan-5-Retro-UNC-University-Blue-Product.jpg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&q=90"
  },
  {
    "brand": "Nike",
    "model": "Nike Dunk Low 'Panda'",
    "price": "7999",
    "image_url": "https://images.stockx.com/images/Nike-Dunk-Low-Retro-White-Black-2021-Product.jpg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&q=90"
  },
  {
    "brand": "Nike",
    "model": "Nike Air Force 1 'White'",
    "price": "7499",
    "image_url": "https://images.stockx.com/images/Nike-Air-Force-1-Low-White-07_V2-Product.jpg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&q=90"
  },
  {
    "brand": "Adidas",
    "model": "Adidas Superstar 'White Black'",
    "price": "6999",
    "image_url": "https://images.stockx.com/images/adidas-Superstar-Cloud-White-Core-Black-Product.jpg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&q=90"
  },
  {
    "brand": "Yeezy",
    "model": "Yeezy Foam Runner 'Sand'",
    "price": "9999",
    "image_url": "https://images.stockx.com/images/adidas-Yeezy-Foam-RNNR-Sand-Product.jpg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&q=90"
  },
  {
    "brand": "Yeezy",
    "model": "Yeezy Boost 350 V2 'Static'",
    "price": "16999",
    "image_url": "https://images.stockx.com/images/adidas-Yeezy-Boost-350-V2-Static-Reflective-Product.jpg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&q=90"
  },
  {
    "brand": "New Balance",
    "model": "New Balance 550 White Green",
    "price": "10999",
    "image_url": "https://images.stockx.com/images/New-Balance-550-White-Green-Product.jpg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&q=90"
  },
  {
    "brand": "New Balance",
    "model": "New Balance 530 White Silver",
    "price": "9999",
    "image_url": "https://images.stockx.com/images/New-Balance-530-White-Silver-Navy-Product.jpg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&q=90"
  },
  {
    "brand": "New Balance",
    "model": "New Balance 9060 Black",
    "price": "14999",
    "image_url": "https://images.stockx.com/images/New-Balance-9060-Black-Castlerock-Grey-Product.jpg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&q=90"
  }
];

// Map raw data to app internal product interface
const PRODUCTS: ProductProps[] = RAW_SNEAKER_DATA.map((item, index) => {
  // Logic to determine categories based on brand
  let categories = [item.brand];
  
  if (item.brand === 'Yeezy') {
    categories = ['Adidas', 'Yeezy'];
  }
  
  // Optional: You could add other overlap logic here, e.g. Jordan -> ['Nike', 'Jordan']
  
  return {
    id: `sneaker-${index}`,
    brand: item.brand,
    name: item.model,
    price: parseInt(item.price, 10), // Convert string price to number
    image: item.image_url,
    categories: categories, // Add categories to product
    onPress: () => {} // Placeholder, handled in App component
  };
});

function AppContent() {
  const [screen, setScreen] = useState<'landing' | 'login' | 'app' | 'checkout' | 'success'>('landing');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<ProductProps | null>(null);
  const { total, clearCart } = useCart();
  const { user, isGuest, loading } = useAuth();

  // Sync auth state with screen
  useEffect(() => {
    if (!loading) {
        if (user || isGuest) {
            if (screen === 'landing' || screen === 'login') {
                setScreen('app');
            }
        } else {
             // If user logs out (and not guest), reset to landing
             if (screen !== 'login' && screen !== 'landing') {
                 setScreen('landing');
                 setActiveTab('home');
             }
        }
    }
  }, [user, isGuest, loading, screen]);

  const handleProductClick = (product: ProductProps) => {
    setSelectedProduct(product);
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };

  const handleCheckout = () => {
      setScreen('checkout');
  };

  const handlePlaceOrder = () => {
      setScreen('success');
      clearCart();
  };

  const handleSuccessContinue = () => {
      setScreen('app');
      setActiveTab('home');
  };

  if (loading) {
      return <div className="flex items-center justify-center h-screen bg-cream-light dark:bg-dark-bg"><div className="animate-spin w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-cream-light dark:bg-dark-bg relative shadow-2xl shadow-black/50 overflow-hidden transition-colors duration-500">
      {screen === 'landing' && (
        <LandingScreen onGetStarted={() => setScreen('login')} />
      )}

      {screen === 'login' && (
        <LoginScreen onLogin={() => setScreen('app')} />
      )}

      {(screen === 'app' || screen === 'checkout' || screen === 'success') && (
        <>
          <div className="flex-1 overflow-hidden relative">
             {selectedProduct ? (
                <ProductDetailScreen product={selectedProduct} onBack={handleBack} />
             ) : screen === 'checkout' ? (
                <CheckoutScreen total={total} onBack={() => setScreen('app')} onPlaceOrder={handlePlaceOrder} />
             ) : screen === 'success' ? (
                <OrderSuccessScreen onContinue={handleSuccessContinue} />
             ) : activeTab === 'home' ? (
                <HomeScreen products={PRODUCTS} onProductClick={handleProductClick} onNewsClick={() => setActiveTab('news')} />
             ) : activeTab === 'shop' ? (
                <ShopScreen products={PRODUCTS} onProductClick={handleProductClick} />
             ) : activeTab === 'cart' ? (
                <CartScreen onCheckout={handleCheckout} onShopNow={() => setActiveTab('shop')} />
             ) : activeTab === 'orders' ? (
                <OrdersScreen />
             ) : activeTab === 'news' ? (
                <NewsScreen />
             ) : activeTab === 'profile' ? (
                <ProfileScreen />
             ) : (
                <HomeScreen products={PRODUCTS} onProductClick={handleProductClick} onNewsClick={() => setActiveTab('news')} />
             )}
          </div>
          {!selectedProduct && screen === 'app' && (
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          )}
        </>
      )}
    </div>
  );
}

function App() {
    return (
        <ThemeProvider>
            <ToastProvider>
                <AuthProvider>
                    <CartProvider>
                        <AppContent />
                    </CartProvider>
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    )
}

export default App;
