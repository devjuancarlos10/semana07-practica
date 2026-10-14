import { createContext, useContext, useState } from "react";
import { TABLES, WAITERS } from "../data/mockMenu";

// Contexto separado exclusivamente para el dominio de sesión y operaciones del restaurante
// IA: [evitar contextos monolíticos con prop drilling excesivo] → Solución manual: [separar dominio de mesas/servicio en RestaurantContext]
const RestaurantContext = createContext(null);

export function RestaurantProvider({ children }) {
  const [selectedTable, setSelectedTable] = useState(TABLES[0]);
  const [serviceType, setServiceType] = useState("mesa"); // "mesa" | "para_llevar" | "delivery"
  const [activeWaiter, setActiveWaiter] = useState(WAITERS[0]);
  const [dinerCount, setDinerCount] = useState(2);
  const [customerName, setCustomerName] = useState("Comensal de Salón");
  
  // Lista de comandas enviadas a cocina para seguimiento
  const [activeOrders, setActiveOrders] = useState([
    {
      ticketNumber: "CMD-1082",
      table: "Mesa 02",
      waiter: "Carlos Mendoza",
      itemsCount: 2,
      total: 94.00,
      status: "en_preparacion", // "recibido" | "en_preparacion" | "listo_para_servir"
      createdAt: "13:05",
      estimatedMinutes: 15
    }
  ]);

  const addActiveOrder = (newOrder) => {
    setActiveOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (ticketNumber, newStatus) => {
    setActiveOrders(prev =>
      prev.map(ord => (ord.ticketNumber === ticketNumber ? { ...ord, status: newStatus } : ord))
    );
  };

  const value = {
    selectedTable,
    setSelectedTable,
    serviceType,
    setServiceType,
    activeWaiter,
    setActiveWaiter,
    dinerCount,
    setDinerCount,
    customerName,
    setCustomerName,
    activeOrders,
    addActiveOrder,
    updateOrderStatus
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error("useRestaurant debe utilizarse dentro de un RestaurantProvider");
  }
  return context;
}
