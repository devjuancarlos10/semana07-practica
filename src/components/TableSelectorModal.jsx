import React from "react";
import { X, MapPin, Users, ChefHat, Check, Utensils } from "lucide-react";
import { useRestaurant } from "../context/RestaurantContext";
import { TABLES, WAITERS } from "../data/mockMenu";

export function TableSelectorModal({ isOpen, onClose }) {
  const {
    selectedTable,
    setSelectedTable,
    serviceType,
    setServiceType,
    activeWaiter,
    setActiveWaiter,
    dinerCount,
    setDinerCount
  } = useRestaurant();

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="table-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="title-with-badge">
            <MapPin size={22} className="text-accent" />
            <h3>Configuración de Servicio y Mesa</h3>
          </div>
          <button type="button" className="modal-close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="table-modal-body">
          {/* Tipo de servicio */}
          <div className="config-section">
            <label className="section-label">Tipo de Atención:</label>
            <div className="service-type-selector">
              <button
                type="button"
                className={`service-btn ${serviceType === "mesa" ? "active" : ""}`}
                onClick={() => setServiceType("mesa")}
              >
                <Utensils size={16} />
                <span>Consumo en Salón</span>
              </button>
              <button
                type="button"
                className={`service-btn ${serviceType === "para_llevar" ? "active" : ""}`}
                onClick={() => setServiceType("para_llevar")}
              >
                <span>Para Llevar / Takeout</span>
              </button>
            </div>
          </div>

          {/* Selector de mesas */}
          {serviceType === "mesa" && (
            <div className="config-section">
              <label className="section-label">Seleccionar Mesa:</label>
              <div className="tables-grid">
                {TABLES.map(table => {
                  const isSelected = selectedTable.id === table.id;
                  return (
                    <button
                      key={table.id}
                      type="button"
                      className={`table-card-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedTable(table)}
                    >
                      <div className="table-card-header">
                        <span className="table-num">Mesa {table.id}</span>
                        {isSelected && <Check size={16} className="text-accent" />}
                      </div>
                      <span className="table-zone">{table.zone}</span>
                      <span className="table-cap">Hasta {table.capacity} pers.</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mozo / Mesero asignado */}
          <div className="config-section">
            <label className="section-label">
              <ChefHat size={15} /> Mozo / Mesero Responsable:
            </label>
            <div className="waiters-list">
              {WAITERS.map(waiter => {
                const isSelected = activeWaiter.id === waiter.id;
                return (
                  <button
                    key={waiter.id}
                    type="button"
                    className={`waiter-pill-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => setActiveWaiter(waiter)}
                  >
                    <span className="waiter-avatar">{waiter.name[0]}</span>
                    <div className="waiter-meta">
                      <span className="waiter-name">{waiter.name}</span>
                      <span className="waiter-role">{waiter.role}</span>
                    </div>
                    {isSelected && <Check size={16} className="text-accent" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comensales */}
          {serviceType === "mesa" && (
            <div className="config-section">
              <label className="section-label">
                <Users size={15} /> Número de Comensales:
              </label>
              <div className="diners-counter-row">
                {[1, 2, 3, 4, 5, 6, 8].map(count => (
                  <button
                    key={count}
                    type="button"
                    className={`diner-num-btn ${dinerCount === count ? "active" : ""}`}
                    onClick={() => setDinerCount(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="primary-btn-accent w-full" onClick={onClose}>
            Guardar y Continuar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}
