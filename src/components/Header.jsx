import React from "react";
import { UtensilsCrossed, Sun, Moon, ShoppingBag, Clock, Users, MapPin, ChefHat } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useRestaurant } from "../context/RestaurantContext";

export function Header({
  cartCount,
  onOpenCart,
  onOpenActiveOrders,
  onOpenTableModal,
  onFocusSearch
}) {
  // Consumo directo de ThemeContext sin prop drilling
  const { theme, toggleTheme, isDark } = useTheme();

  // Consumo directo de RestaurantContext sin prop drilling
  const { selectedTable, serviceType, activeWaiter, activeOrders } = useRestaurant();

  const activeOrdersCount = activeOrders.filter(
    ord => ord.status !== "listo_para_servir"
  ).length;

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Brand & Logo */}
        <div className="brand-group">
          <div className="brand-icon">
            <UtensilsCrossed size={26} strokeWidth={2.2} />
          </div>
          <div className="brand-text">
            <h1 className="restaurant-name">Fuego & Brasa</h1>
            <span className="restaurant-tagline">Bistró & Cocina de Autor</span>
          </div>
        </div>

        {/* Operational Indicators (Table, Waiter, Service) */}
        <div className="operational-bar">
          <button 
            type="button" 
            className="op-chip"
            onClick={onOpenTableModal}
            title="Cambiar mesa o mesero"
          >
            <MapPin size={15} className="chip-icon text-accent" />
            <span className="chip-label">
              {serviceType === "mesa" ? selectedTable.label.split("-")[0].trim() : "Para Llevar"}
            </span>
          </button>

          <button 
            type="button" 
            className="op-chip"
            onClick={onOpenTableModal}
            title="Mozo asignado"
          >
            <ChefHat size={15} className="chip-icon text-accent" />
            <span className="chip-label">{activeWaiter.name.split(" ")[0]}</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          {/* Active Kitchen Orders */}
          <button
            type="button"
            className="header-btn orders-status-btn"
            onClick={onOpenActiveOrders}
            title="Ver comandas enviadas a cocina"
          >
            <Clock size={19} />
            <span className="btn-text">Cocina</span>
            {activeOrdersCount > 0 && (
              <span className="status-badge pulse">{activeOrdersCount}</span>
            )}
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <button
            type="button"
            className="header-btn theme-toggle-btn"
            onClick={toggleTheme}
            title={`Cambiar a modo ${isDark ? "claro (Terraza)" : "oscuro (Noche)"}`}
            aria-label="Alternar tema de la aplicación"
          >
            {isDark ? <Sun size={19} className="sun-icon" /> : <Moon size={19} className="moon-icon" />}
          </button>

          {/* Cart / Comanda Drawer Button */}
          <button
            type="button"
            className="cart-trigger-btn"
            onClick={onOpenCart}
            aria-label="Abrir comanda"
          >
            <div className="cart-icon-wrapper">
              <ShoppingBag size={21} />
              {cartCount > 0 && (
                <span className="cart-badge-bounce">{cartCount}</span>
              )}
            </div>
            <span className="cart-btn-label">Comanda</span>
          </button>
        </div>
      </div>
    </header>
  );
}
