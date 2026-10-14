import React from "react";
import { X, Clock, ChefHat, CheckCircle, AlertCircle, ShoppingBag } from "lucide-react";
import { useRestaurant } from "../context/RestaurantContext";

export function ActiveOrdersModal({ isOpen, onClose }) {
  const { activeOrders, updateOrderStatus } = useRestaurant();

  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case "recibido":
        return { label: "Recibido", color: "status-orange", icon: Clock };
      case "en_preparacion":
        return { label: "En Preparación", color: "status-blue", icon: ChefHat };
      case "listo_para_servir":
        return { label: "Listo para Servir", color: "status-green", icon: CheckCircle };
      default:
        return { label: status, color: "status-gray", icon: Clock };
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="active-orders-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="title-with-badge">
            <ChefHat size={22} className="text-accent" />
            <h3>Monitor de Comandas en Cocina</h3>
            <span className="order-counter-badge">{activeOrders.length} activas</span>
          </div>
          <button type="button" className="modal-close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="orders-list-body">
          {activeOrders.length === 0 ? (
            <div className="empty-orders-view">
              <ShoppingBag size={42} strokeWidth={1.5} />
              <p>No hay comandas pendientes en cocina.</p>
            </div>
          ) : (
            <div className="orders-cards-grid">
              {activeOrders.map(order => {
                const badge = getStatusBadge(order.status);
                const StatusIcon = badge.icon;

                return (
                  <div key={order.ticketNumber} className="order-monitor-card">
                    <div className="card-top">
                      <span className="ticket-tag">{order.ticketNumber}</span>
                      <span className={`status-pill ${badge.color}`}>
                        <StatusIcon size={13} /> {badge.label}
                      </span>
                    </div>

                    <div className="order-details-meta">
                      <div className="meta-item">
                        <span className="meta-label">Mesa / Destino:</span>
                        <span className="meta-value">{order.table}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Mozo:</span>
                        <span className="meta-value">{order.waiter}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Hora Envío:</span>
                        <span className="meta-value">{order.createdAt}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Total:</span>
                        <span className="meta-value bold-price">S/ {order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Selector de cambio de estado de cocina */}
                    <div className="status-actions-bar">
                      <span className="status-label">Actualizar estado:</span>
                      <div className="status-buttons-row">
                        <button
                          type="button"
                          className={`btn-step ${order.status === "recibido" ? "active" : ""}`}
                          onClick={() => updateOrderStatus(order.ticketNumber, "recibido")}
                        >
                          Recibido
                        </button>
                        <button
                          type="button"
                          className={`btn-step ${order.status === "en_preparacion" ? "active" : ""}`}
                          onClick={() => updateOrderStatus(order.ticketNumber, "en_preparacion")}
                        >
                          En Cocina
                        </button>
                        <button
                          type="button"
                          className={`btn-step ${order.status === "listo_para_servir" ? "active" : ""}`}
                          onClick={() => updateOrderStatus(order.ticketNumber, "listo_para_servir")}
                        >
                          ¡Listo!
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
