import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, MessageCircle, LogOut, LogIn, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useShop } from "@/context/ShopContext";
import { signInWithGoogle, logout } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAuthReady, isAdmin } = useShop();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const leftLinks = [
    { name: "Inicio", path: "/" },
    { name: "Tienda", path: "/shop" },
    { name: "Comunidad", path: "/community" },
  ];

  const rightLinks = [
    { name: "Contacto", path: "/contact" },
    { name: "us", path: "/about" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 z-40 w-full transition-all duration-500 group/header ${
          isScrolled 
            ? "bg-brand-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl" 
            : "bg-transparent border-b border-transparent hover:bg-brand-black/40 hover:backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4 h-24 flex items-center justify-between relative">
          {/* Left Nav - Undergold Style */}
          <nav className="hidden md:flex items-center gap-8">
            {leftLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-heading font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:text-brand-primary ${
                  location.pathname === link.path ? "text-brand-primary" : "text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`font-heading font-black uppercase tracking-[0.2em] text-[10px] transition-all text-brand-primary hover:text-white flex items-center gap-2 ${
                  location.pathname === "/admin" ? "underline underline-offset-4" : ""
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                Admin
              </Link>
            )}
          </nav>

          {/* Centered Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="Fly and Chill Logo" 
                  className="h-[70px] w-auto object-contain transition-all group-hover:scale-110 duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-16 h-16 rounded-none bg-brand-primary flex items-center justify-center group-hover:bg-brand-secondary transition-colors duration-500">
                  <span className="text-brand-black font-heading font-black text-2xl italic">F&C</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Icons - Right Aligned */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              {rightLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`font-heading font-black tracking-[0.2em] transition-all hover:text-brand-primary ${
                    link.name === "us" ? "lowercase text-[9px]" : "uppercase text-[10px]"
                  } ${
                    location.pathname === link.path ? "text-brand-primary" : "text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            
            {isAuthReady && (
              <div className="hidden sm:flex items-center gap-4">
                {user ? (
                  <button 
                    onClick={logout}
                    className="text-white hover:text-brand-secondary transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Salir
                  </button>
                ) : (
                  <button 
                    onClick={signInWithGoogle}
                    className="text-white hover:text-brand-primary transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </button>
                )}
              </div>
            )}

            <button className="text-white hover:text-brand-primary transition-colors hidden sm:block text-[10px] font-black uppercase tracking-widest">
              SALE
            </button>
            <Link to="/cart" className="relative text-white hover:text-brand-primary transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-primary text-brand-black text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-brand-black">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-white hover:text-brand-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 pt-32 bg-brand-black/95 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col items-center gap-8 p-8">
              {[...leftLinks, ...rightLinks].map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`font-heading font-black text-3xl tracking-widest ${
                    link.name === "us" ? "lowercase" : "uppercase"
                  } ${
                    location.pathname === link.path ? "text-brand-amber" : "text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex gap-6 mt-8">
                <Link to="/cart" className="w-12 h-12 rounded-full bg-brand-dark flex items-center justify-center text-brand-gold relative">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 bg-brand-primary text-brand-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-brand-black">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <a href="https://wa.me/573019202618" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
