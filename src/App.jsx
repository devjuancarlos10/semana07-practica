import React, { useState, useReducer, useMemo, useCallback, useRef } from "react";
import { Header } from "./components/Header";
import { CategoryFilter } from "./components/CategoryFilter";
import { SearchAndFilterBar } from "./components/SearchAndFilterBar";
import { DishCard } from "./components/DishCard";
import { OrderDrawer } from "./components/OrderDrawer";
import { OrderTicketModal } from "./components/OrderTicketModal";
import { ActiveOrdersModal } from "./components/ActiveOrdersModal";
import { TableSelectorModal } from "./components/TableSelectorModal";
import { useFetch } from "./hooks/useFetch";
import { useKeyboardShortcut } from "./hooks/useKeyboardShortcut";
import { orderReducer, INITIAL_ORDER_STATE } from "./reducers/orderReducer";
import { useRestaurant } from "./context/RestaurantContext";
import { CATEGORIES } from "./data/mockMenu";
import { 
  Sparkles, RefreshCw, AlertCircle, ChefHat, 
  UtensilsCrossed, CheckCircle2, SearchX 
} from "lucide-react";
import "./App.css";

export default function App() {
  // =========================================================================
  // 1. GESTIÓN DE DATOS ASÍNCRONOS CON CUSTOM HOOK (useFetch + AbortController)
  // =========================================================================
  // IA: [fugas de memoria en peticiones asíncronas no canceladas] → Solución manual: [useFetch con AbortController y cleanup]
  const { data: menuData, loading, error, refetch } = useFetch("/api/menu");

  // =========================================================================
  // 2. ESTADO COMPLEJO CON useReducer (Comanda / Carrito de restaurante)
  // =========================================================================
  // IA: [inconsistencias al actualizar múltiples estados del pedido] → Solución manual: [centralizar con orderReducer]
  const [orderState, dispatchOrder] = useReducer(orderReducer, INITIAL_ORDER_STATE);

  // =========================================================================
  // 3. ESTADOS LOCALES DE INTERFAZ CON useState (Render cycle & UI State)
  // =========================================================================
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDietTag, setSelectedDietTag] = useState("ALL");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isActiveOrdersModalOpen, setIsActiveOrdersModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Consumo del contexto de operaciones del restaurante
  const { addActiveOrder } = useRestaurant();

  // =========================================================================
  // 4. REFERENCIAS MUTABLES CON useRef (Manipulación DOM sin provocar re-render)
  // =========================================================================
  const searchInputRef = useRef(null);
  const renderCountRef = useRef(0);
  renderCountRef.current += 1; // Contador silencioso de ciclos de render para validación con Profiler

  // Atajo de teclado global: Presionar "/" enfoca el buscador instantáneamente
  useKeyboardShortcut("/", () => {
    searchInputRef.current?.focus();
  });

  // =========================================================================
  // 5. CALLBACKS ESTABLES CON useCallback (Evitan invalidación de React.memo)
  // =========================================================================
  // IA: [re-render innecesario de DishCard por recreación de funciones] → Solución manual: [estabilizar handlers con useCallback]
  const handleAddToCart = useCallback((dish) => {
    dispatchOrder({ type: "ADD_ITEM", payload: { dish } });
  }, []);

  const handleUpdateQuantity = useCallback((dishId, delta) => {
    dispatchOrder({ type: "UPDATE_QUANTITY", payload: { dishId, delta } });
  }, []);

  const handleRemoveItem = useCallback((dishId) => {
    dispatchOrder({ type: "REMOVE_ITEM", payload: { dishId } });
  }, []);

  const handleSetItemNote = useCallback((dishId, note) => {
    dispatchOrder({ type: "SET_ITEM_NOTE", payload: { dishId, note } });
  }, []);

  const handleSetGeneralNotes = useCallback((notes) => {
    dispatchOrder({ type: "SET_GENERAL_NOTES", payload: notes });
  }, []);

  const handleApplyCoupon = useCallback((code) => {
    dispatchOrder({ type: "APPLY_COUPON", payload: code });
  }, []);

  const handleRemoveCoupon = useCallback(() => {
    dispatchOrder({ type: "REMOVE_COUPON" });
  }, []);

  const handleClearOrder = useCallback(() => {
    dispatchOrder({ type: "CLEAR_ORDER" });
  }, []);

  const handleOpenDrawer = useCallback(() => {
    dispatchOrder({ type: "TOGGLE_DRAWER", payload: true });
  }, []);

  const handleCloseDrawer = useCallback(() => {
    dispatchOrder({ type: "TOGGLE_DRAWER", payload: false });
  }, []);

  // =========================================================================
  // 6. CÁLCULOS OPTIMIZADOS CON useMemo (Filtrado de menú y resumen financiero)
  // =========================================================================
  // A) Conteo de platillos por categoría
  const categoryCounts = useMemo(() => {
    if (!menuData) return {};
    const counts = { Todos: menuData.length };
    CATEGORIES.forEach(cat => {
      if (cat !== "Todos") {
        counts[cat] = menuData.filter(d => d.category === cat).length;
      }
    });
    return counts;
  }, [menuData]);

  // B) Filtrado de platos según categoría, texto y tags dietarios
  // IA: [recalculo computacional pesado en cada render] → Solución manual: [memoizar filteredDishes con useMemo]
  const filteredDishes = useMemo(() => {
    if (!menuData) return [];

    const query = searchTerm.trim().toLowerCase();

    return menuData.filter(dish => {
      // Filtro por categoría
      const matchesCategory =
        selectedCategory === "Todos" || dish.category === selectedCategory;

      // Filtro por búsqueda de texto
      const matchesSearch =
        query === "" ||
        dish.name.toLowerCase().includes(query) ||
        dish.description.toLowerCase().includes(query) ||
        dish.tags.some(tag => tag.toLowerCase().includes(query));

      // Filtro dietario / especialidad
      let matchesDiet = true;
      if (selectedDietTag === "Picante") {
        matchesDiet = dish.spicy === true;
      } else if (selectedDietTag !== "ALL") {
        matchesDiet = dish.tags.includes(selectedDietTag);
      }

      return matchesCategory && matchesSearch && matchesDiet;
    });
  }, [menuData, selectedCategory, searchTerm, selectedDietTag]);

  // C) Mapa de cantidades en carrito para consulta O(1) en DishCard
  const inCartQuantitiesMap = useMemo(() => {
    const map = {};
    orderState.items.forEach(item => {
      map[item.dish.id] = item.quantity;
    });
    return map;
  }, [orderState.items]);

  // D) Resumen financiero en tiempo real
  const totals = useMemo(() => {
    const itemsCount = orderState.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = orderState.items.reduce(
      (sum, item) => sum + item.dish.price * item.quantity,
      0
    );

    const discountAmount = subtotal * (orderState.discountPercent / 100);
    const taxableBase = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxableBase * 0.18; // I.G.V. 18%
    const tipAmount = taxableBase * 0.10; // 10% Propina sugerida

    const totalWithoutTip = taxableBase + taxAmount;
    const total = totalWithoutTip + tipAmount;

    return {
      itemsCount,
      subtotal,
      discountAmount,
      taxAmount,
      tipAmount,
      totalWithoutTip,
      total
    };
  }, [orderState.items, orderState.discountPercent]);

  // =========================================================================
  // 7. ENVÍO DE COMANDA A COCINA
  // =========================================================================
  const handleProceedToTicket = () => {
    handleCloseDrawer();
    setIsTicketModalOpen(true);
  };

  const handleConfirmOrder = (newOrder) => {
    addActiveOrder(newOrder);
    setIsTicketModalOpen(false);
    handleClearOrder();

    setToastMessage({
      title: `¡Comanda ${newOrder.ticketNumber} enviada a Cocina!`,
      subtitle: `${newOrder.table} • ${newOrder.itemsCount} platos • Estimado: ${newOrder.estimatedMinutes} min`
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div className="restaurant-app">
      {/* Notificación Toast flotante */}
      {toastMessage && (
        <aside className="app-toast-alert" role="status">
          <CheckCircle2 size={22} className="toast-icon text-success" />
          <div className="toast-text">
            <strong>{toastMessage.title}</strong>
            <span>{toastMessage.subtitle}</span>
          </div>
        </aside>
      )}

      {/* Header con indicadores de mesa, mozo, tema y comanda */}
      <Header
        cartCount={totals.itemsCount}
        onOpenCart={handleOpenDrawer}
        onOpenActiveOrders={() => setIsActiveOrdersModalOpen(true)}
        onOpenTableModal={() => setIsTableModalOpen(true)}
        onFocusSearch={() => searchInputRef.current?.focus()}
      />

      <main className="main-content-layout">
        {/* Banner de Presentación Gastronómica */}
        <section className="hero-culinary-banner">
          <div className="hero-content">
            <span className="hero-tag">
              <Sparkles size={14} /> Experiencia Gastronómica en Vivo
            </span>
            <h2 className="hero-title">Carta Seleccionada de Temporada</h2>
            <p className="hero-description">
              Ingredientes frescos de origen, cortes madurados al fuego de leña y pastas artesanales.
              Arma tu comanda y envíala directamente a nuestra estación de cocina en tiempo real.
            </p>
          </div>
        </section>

        {/* Barra de Filtros por Categoría */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
        />

        {/* Buscador y Filtros Dietarios con useRef y useMemo */}
        <SearchAndFilterBar
          searchInputRef={searchInputRef}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearSearch={() => setSearchTerm("")}
          selectedDietTag={selectedDietTag}
          onSelectDietTag={setSelectedDietTag}
          totalResults={filteredDishes.length}
        />

        {/* Estado de Carga (Loading) con Skeleton Grid */}
        {loading && (
          <section className="loading-state-view">
            <div className="loading-spinner-wrapper">
              <RefreshCw size={32} className="spinner-icon" />
              <h3>Sincronizando Carta del Menú...</h3>
              <p>Cargando disponibilidad de platos e ingredientes en tiempo real</p>
            </div>
          </section>
        )}

        {/* Estado de Error */}
        {error && !loading && (
          <section className="error-state-view">
            <AlertCircle size={44} className="error-icon" />
            <h3>No se pudo cargar la carta</h3>
            <p>{error}</p>
            <button type="button" className="retry-btn" onClick={refetch}>
              <RefreshCw size={16} /> Reintentar Carga
            </button>
          </section>
        )}

        {/* Grilla de Platillos del Restaurante */}
        {!loading && !error && (
          <>
            {filteredDishes.length === 0 ? (
              <div className="no-results-view">
                <SearchX size={54} strokeWidth={1.5} />
                <h3>No encontramos platos que coincidan</h3>
                <p>Intenta con otro término o desmarca los filtros rápidos.</p>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDietTag("ALL");
                    setSelectedCategory("Todos");
                  }}
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <section className="dishes-grid" aria-label="Catálogo de platos">
                {filteredDishes.map(dish => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    onAddToCart={handleAddToCart}
                    inCartQuantity={inCartQuantitiesMap[dish.id] || 0}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </main>

      {/* Drawer Lateral de la Comanda Activa */}
      <OrderDrawer
        isOpen={orderState.isDrawerOpen}
        onClose={handleCloseDrawer}
        items={orderState.items}
        couponCode={orderState.couponCode}
        couponMessage={orderState.couponMessage}
        generalNotes={orderState.generalNotes}
        totals={totals}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onSetItemNote={handleSetItemNote}
        onSetGeneralNotes={handleSetGeneralNotes}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        onClearOrder={handleClearOrder}
        onProceedToTicket={handleProceedToTicket}
      />

      {/* Modal de Ticket y Confirmación de Pedido a Cocina */}
      <OrderTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        items={orderState.items}
        totals={totals}
        generalNotes={orderState.generalNotes}
        onConfirmSend={handleConfirmOrder}
      />

      {/* Monitor de Comandas en Cocina */}
      <ActiveOrdersModal
        isOpen={isActiveOrdersModalOpen}
        onClose={() => setIsActiveOrdersModalOpen(false)}
      />

      {/* Selector de Mesa y Mozo Responsable */}
      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />
    </div>
  );
}
