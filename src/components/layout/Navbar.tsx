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
        className={`sticky top-0 z-40 w-full transition-all duration-500 ${
          isScrolled 
            ? "bg-brand-black/95 backdrop-blur-xl border-b border-white/5 shadow-2xl" 
            : "bg-brand-black border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 h-24 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="Fly and Chill Logo" 
                className="h-20 w-auto object-contain transition-all group-hover:scale-110 duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-20 h-20 rounded-none bg-brand-primary flex items-center justify-center group-hover:bg-brand-secondary transition-colors duration-500">
                <span className="text-brand-black font-heading font-black text-4xl italic">F&C</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav - Bold & Spaced */}
          <nav className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-heading font-black uppercase tracking-[0.2em] text-xs transition-all hover:text-brand-primary relative group ${
                  location.pathname === link.path ? "text-brand-primary" : "text-white"
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-brand-primary transition-all duration-300 group-hover:w-full ${location.pathname === link.path ? "w-full" : ""}`} />
              </Link>
            ))}
          </nav>

          {/* Icons - Clean & Minimal */}
          <div className="flex items-center gap-8">
            <button className="text-white hover:text-brand-primary transition-colors hidden sm:block">
              <Search className="w-6 h-6" />
            </button>
            <Link to="/cart" className="relative text-white hover:text-brand-primary transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-3 -right-3 bg-brand-primary text-brand-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-brand-black">
                  {totalItems}
                </span>
              )}
            </Link>
            <button className="text-white hover:text-brand-primary transition-colors hidden sm:block">
              <User className="w-6 h-6" />
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-white hover:text-brand-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
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
