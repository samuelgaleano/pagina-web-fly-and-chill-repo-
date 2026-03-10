import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
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

  const navLinks = [
    { name: "Inicio", path: "/" },
    { name: "Tienda", path: "/shop" },
    { name: "Comunidad", path: "/community" },
    { name: "Nosotros", path: "/about" },
    { name: "Contacto", path: "/contact" },
  ];

  return (
    <>
      {/* Promo Banner */}
      <div className="bg-brand-gold text-brand-black text-xs font-bold text-center py-2 px-4 tracking-wider uppercase">
        10% de descuento en tu primer pedido - ¡Regístrate ahora!
      </div>

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled 
            ? "bg-brand-black/95 backdrop-blur-md border-b border-brand-gold/20 shadow-lg shadow-brand-amber/5" 
            : "bg-brand-black border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Fly and Chill Logo" 
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                // Fallback to text if image is not found
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-dark flex items-center justify-center border border-brand-gold/30 group-hover:border-brand-amber transition-colors">
                <span className="text-brand-gold font-heading font-black text-xl italic">F&C</span>
              </div>
              <span className="font-heading font-black text-2xl tracking-tighter text-white group-hover:text-brand-gold transition-colors">
                FLY AND CHILL
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-heading font-bold uppercase tracking-wider text-sm transition-colors hover:text-brand-gold ${
                  location.pathname === link.path ? "text-brand-amber" : "text-gray-300"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button className="text-gray-300 hover:text-brand-gold transition-colors hidden sm:block">
              <Search className="w-5 h-5" />
            </button>
            <Link to="/cart" className="relative text-gray-300 hover:text-brand-gold transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-amber text-brand-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button className="text-gray-300 hover:text-brand-gold transition-colors hidden sm:block">
              <User className="w-5 h-5" />
            </button>
            <a 
              href="https://wa.me/1234567890?text=Hola,%20quiero%20hacer%20un%20pedido%20rápido" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-primary hover:text-brand-secondary transition-colors hidden sm:block"
              title="Chat with us for quick purchases"
            >
              <MessageCircle className="w-5 h-5" />
            </a>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-gray-300 hover:text-brand-gold"
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
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`font-heading font-black text-3xl uppercase tracking-widest ${
                    location.pathname === link.path ? "text-brand-amber" : "text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex gap-6 mt-8">
                <button className="w-12 h-12 rounded-full bg-brand-dark flex items-center justify-center text-brand-gold">
                  <Search className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 rounded-full bg-brand-dark flex items-center justify-center text-brand-gold">
                  <User className="w-5 h-5" />
                </button>
                <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green">
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
