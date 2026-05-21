import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ClientRoute from "@/components/ClientRoute";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Branches, { BranchDetail } from "./pages/Branches";
import Panel from "./pages/Panel";
import AdminLogin from "./pages/AdminLogin";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound.tsx";
import CheckoutResult from "./pages/CheckoutResult.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalogo" element={<Catalog />} />
                  <Route path="/producto/:id" element={<ProductDetail />} />
                  <Route path="/sucursales" element={<Branches />} />
                  <Route path="/sucursales/:slug" element={<BranchDetail />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route element={<ClientRoute />}>
                    <Route path="/perfil" element={<Profile />} />
                    <Route path="/carrito" element={<Cart />} />
                    <Route path="/checkout/resultado" element={<CheckoutResult />} />
                  </Route>
                  <Route element={<ProtectedRoute />}>
                    <Route path="/panel" element={<Panel />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
