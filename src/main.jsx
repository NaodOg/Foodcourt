import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import MenuView from './menu/MenuView.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import LoginPage from './admin/LoginPage.jsx'
import Dashboard from './admin/Dashboard.jsx'
import DishesManager from './admin/DishesManager.jsx'
import CategoriesManager from './admin/CategoriesManager.jsx'
import SettingsManager from './admin/SettingsManager.jsx'
import WaiterScanner from './waiter/WaiterScanner.jsx'
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from './cart/CartContext.jsx';

const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://placeholder-url.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <CartProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/menu/:houseSlug" element={<MenuView />} />
          <Route path="/waiter" element={<WaiterScanner />} />
          <Route path="/waiter/:houseSlug" element={<WaiterScanner />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path=":houseSlug/dashboard" element={<Dashboard />} />
            <Route path=":houseSlug/dishes" element={<DishesManager />} />
            <Route path=":houseSlug/categories" element={<CategoriesManager />} />
            <Route path=":houseSlug/settings" element={<SettingsManager />} />
          </Route>
        </Routes>
      </CartProvider>
      </BrowserRouter>
    </ConvexProvider>
  </StrictMode>,
)
