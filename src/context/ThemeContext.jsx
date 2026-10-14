import { createContext, useContext, useState, useEffect } from "react";

// Contexto separado exclusivamente para la apariencia visual (Dominio: UI / Theme)
// IA: [re-render innecesario al mezclar datos de negocio con UI] → Solución manual: [separar ThemeContext de RestaurantContext]
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("restaurant_theme");
    return saved ? saved : "dark"; // Modo noche elegante por defecto
  });

  useEffect(() => {
    localStorage.setItem("restaurant_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe utilizarse dentro de un ThemeProvider");
  }
  return context;
}
