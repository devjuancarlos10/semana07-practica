import { useEffect } from "react";

/**
 * Hook para atajos de teclado globales
 * Permite enfocar inputs o abrir modales sin provocar re-renders innecesarios
 */
export function useKeyboardShortcut(targetKey, callback, modifier = null) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isModifierActive = modifier === "ctrl" ? (event.ctrlKey || event.metaKey) : true;
      
      // No activar si el usuario ya está escribiendo en un input o textarea (salvo atajo con Ctrl)
      const isTyping = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
      if (isTyping && !modifier) return;

      if (event.key.toLowerCase() === targetKey.toLowerCase() && isModifierActive) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [targetKey, callback, modifier]);
}
