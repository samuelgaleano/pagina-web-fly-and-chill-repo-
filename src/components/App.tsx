/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AgeVerificationModal } from "@/components/ui/AgeVerificationModal";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { CartProvider } from "@/context/CartContext";
import { ShopProvider } from "@/context/ShopContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Cada página se carga bajo demanda (code-splitting). Así el visitante solo
// descarga el JS de la ruta que visita: la página de inicio no arrastra el
// peso del panel de Admin, del Checkout (Firestore), etc. Reduce mucho el
// tamaño del bundle inicial y el ancho de banda servido.
const Home = lazy(() => import("@/pages/Home").then(m => ({ default: m.Home })));
const Shop = lazy(() => import("@/pages/Shop").then(m => ({ default: m.Shop })));
const ProductDetail = lazy(() => import("@/pages/ProductDetail").then(m => ({ default: m.ProductDetail })));
const Cart = lazy(() => import("@/pages/Cart").then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import("@/pages/Checkout").then(m => ({ default: m.Checkout })));
const CheckoutConfirmation = lazy(() => import("@/pages/CheckoutConfirmation").then(m => ({ default: m.CheckoutConfirmation })));
const Community = lazy(() => import("@/pages/Community").then(m => ({ default: m.Community })));
const About = lazy(() => import("@/pages/About").then(m => ({ default: m.About })));
const Contact = lazy(() => import("@/pages/Contact").then(m => ({ default: m.Contact })));
const Admin = lazy(() => import("@/pages/Admin").then(m => ({ default: m.Admin })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Cargando">
      <div className="w-10 h-10 border-4 border-brand-mint/30 border-t-brand-mint rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ShopProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-brand-black text-white flex flex-col font-sans">
              <AgeVerificationModal />
              <Navbar />

              <main className="flex-grow">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/shop/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/checkout/confirmation" element={<CheckoutConfirmation />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/admin" element={<Admin />} />
                  </Routes>
                </Suspense>
              </main>

              <Footer />
              <WhatsAppButton />
            </div>
          </Router>
        </CartProvider>
      </ShopProvider>
    </ErrorBoundary>
  );
}
