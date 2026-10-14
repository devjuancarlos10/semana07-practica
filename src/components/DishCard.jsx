import React, { memo } from "react";
import { Plus, Clock, Star, Flame, Check } from "lucide-react";

/**
 * DishCard memoizado con React.memo.
 * Al combinarse con un callback estable generado por useCallback en el componente padre,
 * evita re-renders innecesarios cuando cambia el texto del buscador o el estado del tema.
 * 
 * IA: [re-render innecesario de 12 platos al tipear en el buscador] → Solución manual: [React.memo en DishCard + useCallback en onAddToCart]
 */
export const DishCard = memo(function DishCard({ dish, onAddToCart, inCartQuantity = 0 }) {
  return (
    <article className="dish-card">
      <div className="dish-media">
        <img
          src={dish.image}
          alt={dish.name}
          className="dish-image"
          loading="lazy"
        />
        
        {/* Badges superiores */}
        <div className="dish-badges-overlay">
          {dish.spicy && (
            <span className="badge badge-spicy" title="Plato con picante">
              <Flame size={12} /> Picante
            </span>
          )}
          {dish.tags.includes("Recomendado") && (
            <span className="badge badge-featured">
              <Star size={12} fill="currentColor" /> Chef Pick
            </span>
          )}
          {inCartQuantity > 0 && (
            <span className="badge badge-in-cart">
              <Check size={12} /> {inCartQuantity} en orden
            </span>
          )}
        </div>

        {/* Tiempo estimado */}
        <div className="prep-time-tag">
          <Clock size={12} />
          <span>{dish.prepTime}</span>
        </div>
      </div>

      <div className="dish-content">
        <div className="dish-header-info">
          <span className="dish-category-label">{dish.category}</span>
          <div className="dish-rating">
            <Star size={13} className="star-icon" fill="currentColor" />
            <span>{dish.rating}</span>
          </div>
        </div>

        <h3 className="dish-title">{dish.name}</h3>
        <p className="dish-description">{dish.description}</p>

        {/* Tags nutricionales / dietarios */}
        <div className="dish-diet-tags">
          {dish.tags.map(t => (
            <span key={t} className="tag-chip">{t}</span>
          ))}
          <span className="tag-chip tag-calories">{dish.calories}</span>
        </div>

        <div className="dish-footer">
          <div className="dish-price-block">
            <span className="currency-symbol">S/</span>
            <span className="price-value">{dish.price.toFixed(2)}</span>
          </div>

          <button
            type="button"
            className="add-to-cart-btn"
            onClick={() => onAddToCart(dish)}
            aria-label={`Agregar ${dish.name} a la comanda`}
          >
            <Plus size={17} />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </article>
  );
});
