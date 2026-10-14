import { VALID_COUPONS } from "../data/mockMenu";

export const INITIAL_ORDER_STATE = {
  items: [],
  couponCode: "",
  discountPercent: 0,
  couponMessage: null,
  generalNotes: "",
  isDrawerOpen: false
};

// IA: [lógica compleja dispersa con múltiples useStates propensa a bugs] → Solución manual: [centralizar transiciones de estado en orderReducer]
export function orderReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const { dish } = action.payload;
      const existingIndex = state.items.findIndex(item => item.dish.id === dish.id);

      if (existingIndex >= 0) {
        const updatedItems = state.items.map((item, index) => {
          if (index === existingIndex) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
        return {
          ...state,
          items: updatedItems,
          isDrawerOpen: true // Abre la comanda para ver el añadido
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            dish,
            quantity: 1,
            specialInstructions: ""
          }
        ],
        isDrawerOpen: true
      };
    }

    case "REMOVE_ITEM": {
      const { dishId } = action.payload;
      return {
        ...state,
        items: state.items.filter(item => item.dish.id !== dishId)
      };
    }

    case "UPDATE_QUANTITY": {
      const { dishId, delta } = action.payload;
      const updatedItems = state.items
        .map(item => {
          if (item.dish.id === dishId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);

      return {
        ...state,
        items: updatedItems
      };
    }

    case "SET_ITEM_NOTE": {
      const { dishId, note } = action.payload;
      return {
        ...state,
        items: state.items.map(item =>
          item.dish.id === dishId ? { ...item, specialInstructions: note } : item
        )
      };
    }

    case "SET_GENERAL_NOTES": {
      return {
        ...state,
        generalNotes: action.payload
      };
    }

    case "APPLY_COUPON": {
      const code = (action.payload || "").trim().toUpperCase();
      const coupon = VALID_COUPONS[code];

      if (coupon) {
        return {
          ...state,
          couponCode: code,
          discountPercent: coupon.discountPercent,
          couponMessage: { type: "success", text: `¡Cupón ${code} aplicado! ${coupon.label}` }
        };
      } else {
        return {
          ...state,
          couponCode: "",
          discountPercent: 0,
          couponMessage: { type: "error", text: "Código de descuento inválido o expirado" }
        };
      }
    }

    case "REMOVE_COUPON": {
      return {
        ...state,
        couponCode: "",
        discountPercent: 0,
        couponMessage: null
      };
    }

    case "TOGGLE_DRAWER": {
      return {
        ...state,
        isDrawerOpen: action.payload !== undefined ? action.payload : !state.isDrawerOpen
      };
    }

    case "CLEAR_ORDER": {
      return {
        ...INITIAL_ORDER_STATE,
        isDrawerOpen: false
      };
    }

    default:
      return state;
  }
}
