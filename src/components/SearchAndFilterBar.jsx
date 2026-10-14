import React from "react";
import { Search, X, Flame, Leaf, WheatOff, Award, CornerDownLeft } from "lucide-react";

const DIETARY_TAGS = [
  { id: "ALL", label: "Todo el menú", icon: null },
  { id: "Recomendado", label: "Especialidades", icon: Award },
  { id: "Vegetariano", label: "Vegetariano", icon: Leaf },
  { id: "Sin Gluten", label: "Sin Gluten / Celiaco", icon: WheatOff },
  { id: "Picante", label: "Toque Picante", icon: Flame }
];

export function SearchAndFilterBar({
  searchInputRef,
  searchTerm,
  onSearchChange,
  onClearSearch,
  selectedDietTag,
  onSelectDietTag,
  totalResults
}) {
  const handleDirectFocus = () => {
    // Uso directo de useRef para manipular el nodo del DOM sin re-renderizar
    searchInputRef.current?.focus();
  };

  return (
    <div className="search-filter-section">
      <div className="search-main-row">
        {/* Input con referencia DOM (useRef) */}
        <div className="search-input-wrapper">
          <Search size={19} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Buscar por plato, ingrediente (lomo, trufa, ceviche)..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
          />

          {searchTerm ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={onClearSearch}
              aria-label="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          ) : (
            <div className="search-kbd-hint" onClick={handleDirectFocus} title="Atajo de teclado">
              <span>/</span>
            </div>
          )}
        </div>

        {/* Botón de acceso rápido al buscador mediante ref */}
        <button
          type="button"
          className="focus-shortcut-btn"
          onClick={handleDirectFocus}
          title="Enfoca el buscador directamente usando useRef sin provocar re-render"
        >
          <CornerDownLeft size={15} />
          <span>Buscar plato</span>
        </button>
      </div>

      {/* Filtros de preferencia dietaria / especialidad */}
      <div className="dietary-tags-row">
        <span className="tags-label">Filtros rápidos:</span>
        <div className="tags-list">
          {DIETARY_TAGS.map(tag => {
            const Icon = tag.icon;
            const isActive = selectedDietTag === tag.id;

            return (
              <button
                key={tag.id}
                type="button"
                className={`diet-tag-btn ${isActive ? "active" : ""}`}
                onClick={() => onSelectDietTag(tag.id)}
              >
                {Icon && <Icon size={14} className="tag-icon" />}
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>

        <div className="results-counter">
          <span>{totalResults} {totalResults === 1 ? "plato" : "platos"} disponibles</span>
        </div>
      </div>
    </div>
  );
}
