import React, { useRef, useEffect } from "react";
import { CheckCircle2, Printer, X, ChefHat, Clock, AlertTriangle, MessageSquare } from "lucide-react";
import { useRestaurant } from "../context/RestaurantContext";

export function OrderTicketModal({
  isOpen,
  onClose,
  items,
  totals,
  generalNotes,
  onConfirmSend
}) {
  const { selectedTable, activeWaiter, serviceType, dinerCount } = useRestaurant();
  const ticketNotesRef = useRef(null);

  // Demostración de useRef: enfocar notas automáticamente al montar sin disparar re-render
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        ticketNotesRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const ticketNumber = `CMD-${Math.floor(1000 + Math.random() * 9000)}`;
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSendOrder = () => {
    const newOrder = {
      ticketNumber,
      table: serviceType === "mesa" ? selectedTable.label : "Para Llevar",
      waiter: activeWaiter.name,
      itemsCount: totals.itemsCount,
      total: totals.total,
      status: "en_preparacion",
      createdAt: currentTime,
      estimatedMinutes: 20
    };
    onConfirmSend(newOrder);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="ticket-modal-card" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="ticket-modal-header">
          <div className="ticket-badge-header">
            <CheckCircle2 size={24} className="text-success" />
            <h3>Confirmación de Comanda</h3>
          </div>
          <button type="button" className="modal-close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Formato Ticket Térmico de Restaurante */}
        <div className="thermal-ticket-view">
          <div className="ticket-header-text">
            <h4>FUEGO & BRASA</h4>
            <p className="ticket-sub">Cocina Gourmet & Cortes al Carbón</p>
            <div className="ticket-divider">--------------------------------</div>
            <div className="ticket-meta-grid">
              <div><strong>Ticket:</strong> {ticketNumber}</div>
              <div><strong>Hora:</strong> {currentTime}</div>
              <div><strong>Servicio:</strong> {serviceType.toUpperCase()}</div>
              <div><strong>Mesa:</strong> {selectedTable.label.split("-")[0]}</div>
              <div><strong>Mozo:</strong> {activeWaiter.name}</div>
              <div><strong>Personas:</strong> {dinerCount} comensales</div>
            </div>
            <div className="ticket-divider">--------------------------------</div>
          </div>

          <div className="ticket-items-table">
            <div className="ticket-table-head">
              <span className="col-cant">CANT</span>
              <span className="col-desc">DESCRIPCIÓN</span>
              <span className="col-sub">SUBTOTAL</span>
            </div>
            <div className="ticket-items-body">
              {items.map(item => (
                <div key={item.dish.id} className="ticket-item-entry">
                  <div className="ticket-item-line">
                    <span className="col-cant">{item.quantity}x</span>
                    <span className="col-desc">{item.dish.name}</span>
                    <span className="col-sub">S/ {(item.dish.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.specialInstructions && (
                    <div className="ticket-dish-instruction">
                      * Nota: {item.specialInstructions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="ticket-divider">--------------------------------</div>

          <div className="ticket-totals-section">
            <div className="ticket-total-row">
              <span>SUBTOTAL:</span>
              <span>S/ {totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="ticket-total-row text-success">
                <span>DESCUENTO:</span>
                <span>- S/ {totals.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="ticket-total-row">
              <span>I.G.V. (18%):</span>
              <span>S/ {totals.taxAmount.toFixed(2)}</span>
            </div>
            <div className="ticket-total-row final-bold">
              <span>TOTAL COMANDA:</span>
              <span>S/ {totals.total.toFixed(2)}</span>
            </div>
          </div>

          {generalNotes && (
            <div className="ticket-general-note">
              <strong>INDICACIONES DE COCINA:</strong>
              <p>{generalNotes}</p>
            </div>
          )}

          <div className="ticket-divider">--------------------------------</div>
          <div className="ticket-footer-text">
            <p className="ticket-status-pill">
              <ChefHat size={14} /> Estado Inicial: EN COLA DE COCINA
            </p>
            <p className="ticket-time-estimate">
              <Clock size={13} /> Tiempo estimado de despacho: 15-25 min
            </p>
          </div>
        </div>

        {/* Input con useRef para confirmación o notas finales */}
        <div className="ticket-quick-note-box">
          <label htmlFor="finalNotes">
            <MessageSquare size={14} /> Observación final de entrega (enfocada con useRef):
          </label>
          <input
            id="finalNotes"
            ref={ticketNotesRef}
            type="text"
            className="quick-note-input"
            placeholder="Ej: Avisar al capitán cuando salgan las entradas..."
          />
        </div>

        <div className="ticket-modal-actions">
          <button 
            type="button" 
            className="secondary-btn"
            onClick={() => window.print()}
          >
            <Printer size={16} /> Imprimir Comanda
          </button>
          <button 
            type="button" 
            className="primary-btn-accent"
            onClick={handleSendOrder}
          >
            <CheckCircle2 size={16} /> Enviar a Cocina
          </button>
        </div>
      </div>
    </div>
  );
}
