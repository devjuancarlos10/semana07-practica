import React from "react";
import { CATEGORIES } from "../data/mockMenu";
import { Utensils, Flame, Sparkles, Cake, Wine, Compass } from "lucide-react";

const CATEGORY_ICONS = {
  "Todos": Compass,
  "Entradas & Marinos": Sparkles,
  "Cortes & Carnes": Flame,
  "Pastas & Risottos": Utensils,
  "Postres de Autor": Cake,
  "Bebidas & Coctelería": Wine
};

export function CategoryFilter({ selectedCategory, onSelectCategory, categoryCounts }) {
  return (
    <nav className="category-nav" aria-label="Categorías del Menú">
      <div className="category-scroll-container">
        {CATEGORIES.map(category => {
          const Icon = CATEGORY_ICONS[category] || Utensils;
          const isSelected = selectedCategory === category;
          const count = categoryCounts[category] || 0;

          return (
            <button
              key={category}
              type="button"
              className={`category-pill ${isSelected ? "active" : ""}`}
              onClick={() => onSelectCategory(category)}
            >
              <Icon size={17} className="pill-icon" />
              <span className="pill-text">{category}</span>
              <span className="pill-badge">{count}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
