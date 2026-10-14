import React, { useState } from "react";
import { 
  X, Plus, Minus, Trash2, Tag, Utensils, MessageSquare, 
  CheckCircle, AlertCircle, Send, Receipt, Sparkles 
} from "lucide-react";
import { useRestaurant } from "../context/RestaurantContext";

export function OrderDrawer({
  isOpen,
  onClose,
  items,
  couponCode,
  couponMessage,
  generalNotes,
  totals,
  onUpdateQuantity,
  onRemoveItem,
  onSetItemNote,
  onSetGeneralNotes,
  onApplyCoupon,
  onRemoveCoupon,
  onClearOrder,
  onProceedToTicket
}) {
  const [couponInput, setCouponInput] = useState("");
  const [includeTip, setIncludeTip] = useState(true);
  const { selectedTable, activeWaiter, serviceType } = useRestaurant();

  if (!isOpen) return null;

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      onApplyCoupon(couponInput);
      setCouponInput("");
    }
  };

  const finalTotal = includeTip ? totals.total : totals.totalWithoutTip;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside 
        className="order-drawer" 
        onClick={e => e.stopPropagation()} 
        aria-label="Comanda del restaurante"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <div className="drawer-icon-box">
              <Receipt size={22} />
            </div>
            <div>
              <h2 className="drawer-title">Comanda Activa</h2>
              <span className="drawer-subtitle">
                {serviceType === "mesa" ? selectedTable.label : "Orden Para Llevar"} • {activeWaiter.name}
              </span>
            </div>
          </div>
          <button 
            type="button" 
            className="drawer-close-btn" 
            onClick={onClose}
            aria-label="Cerrar comanda"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body / Items List */}
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="empty-cart-state">
              <div className="empty-cart-icon">
                <Utensils size={48} strokeWidth={1.5} />
              </div>
              <h3 className="empty-cart-title">No hay platos en la comanda</h3>
              <p className="empty-cart-text">
                Selecciona platillos del menú para armar el pedido de la mesa.
              </p>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map(item => {
                const itemTotal = (item.dish.price * item.quantity).toFixed(2);
                return (
                  <div key={item.dish.id} className="cart-item-card">
                    <div className="item-main-row">
                      <img 
                        src={item.dish.image} 
                        alt={item.dish.name} 
                        className="item-thumbnail" 
                      />
                      <div className="item-info">
                        <h4 className="item-name">{item.dish.name}</h4>
                        <span className="item-unit-price">S/ {item.dish.price.toFixed(2)} c/u</span>
                      </div>
                      <div className="item-total-price">
                        <span>S/ {itemTotal}</span>
                      </div>
                    </div>

                    {/* Quantity controls and removal */}
                    <div className="item-controls-row">
                      <div className="qty-selector">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.dish.id, -1)}
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="qty-number">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.dish.id, 1)}
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() => onRemoveItem(item.dish.id)}
                        title="Eliminar de la comanda"
                      >
                        <Trash2 size={16} />
                        <span>Quitar</span>
                      </button>
                    </div>

                    {/* Nota especial para la cocina */}
                    <div className="item-note-row">
                      <MessageSquare size={14} className="note-icon" />
                      <input
                        type="text"
                        className="item-note-input"
                        placeholder="Ej: Término medio, sin sal, hielo aparte..."
                        value={item.specialInstructions}
                        onChange={(e) => onSetItemNote(item.dish.id, e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cupones y notas de cocina si hay items */}
          {items.length > 0 && (
            <div className="order-extras-section">
              {/* Cupón promocional */}
              <div className="coupon-box">
                <form onSubmit={handleCouponSubmit} className="coupon-form">
                  <div className="coupon-input-wrapper">
                    <Tag size={16} className="coupon-icon" />
                    <input
                      type="text"
                      className="coupon-input"
                      placeholder="Cupón (ej: GOURMET10, CHEF20)"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    />
                  </div>
                  <button type="submit" className="coupon-apply-btn">
                    Aplicar
                  </button>
                </form>

                {couponMessage && (
                  <div className={`coupon-feedback ${couponMessage.type}`}>
                    {couponMessage.type === "success" ? (
                      <CheckCircle size={15} />
                    ) : (
                      <AlertCircle size={15} />
                    )}
                    <span>{couponMessage.text}</span>
                    {couponCode && (
                      <button 
                        type="button" 
                        className="remove-coupon-btn"
                        onClick={onRemoveCoupon}
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Notas generales para cocina */}
              <div className="kitchen-notes-box">
                <label className="notes-label">
                  <Sparkles size={14} /> Instrucciones generales para cocina:
                </label>
                <textarea
                  className="kitchen-notes-textarea"
                  rows={2}
                  placeholder="Ej: Servir todo al mismo tiempo, cliente festeja cumpleaños..."
                  value={generalNotes}
                  onChange={e => onSetGeneralNotes(e.target.value)}
                />
              </div>

              {/* Checkbox propina sugerida */}
              <label className="tip-toggle-label">
                <input
                  type="checkbox"
                  checked={includeTip}
                  onChange={e => setIncludeTip(e.target.checked)}
                />
                <span>Incluir propina voluntaria sugerida (10%) para mozos</span>
              </label>
            </div>
          )}
        </div>

        {/* Drawer Footer / Financial Summary (useMemo results) */}
        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="summary-breakdown">
              <div className="summary-row">
                <span>Subtotal ({totals.itemsCount} platos)</span>
                <span>S/ {totals.subtotal.toFixed(2)}</span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="summary-row discount-row">
                  <span>Descuento aplicado</span>
                  <span>- S/ {totals.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>I.G.V. (18% incluido)</span>
                <span>S/ {totals.taxAmount.toFixed(2)}</span>
              </div>

              {includeTip && (
                <div className="summary-row">
                  <span>Propina de servicio (10%)</span>
                  <span>S/ {totals.tipAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-row total-row">
                <span>Total a Pagar</span>
                <span className="total-amount">S/ {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="drawer-actions-row">
              <button
                type="button"
                className="clear-order-btn"
                onClick={onClearOrder}
                title="Limpiar comanda"
              >
                Limpiar
              </button>

              <button
                type="button"
                className="submit-kitchen-btn"
                onClick={() => onProceedToTicket(finalTotal)}
              >
                <Send size={18} />
                <span>Confirmar y Enviar a Cocina</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
