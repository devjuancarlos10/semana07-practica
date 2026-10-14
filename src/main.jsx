import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { RestaurantProvider } from './context/RestaurantContext';

/**
 * Punto de entrada con React.StrictMode habilitado según especificación de la práctica.
 * En desarrollo, StrictMode provoca double-invoke de render y useEffect para validar
 * que no existan efectos secundarios no limpiados (memory leaks).
 * 
 * Se proveen dos contextos independientes por dominio (ThemeContext y RestaurantContext)
 * para evitar el patrón de 'God Context' (contexto monolítico gigante).
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <RestaurantProvider>
        <App />
      </RestaurantProvider>
    </ThemeProvider>
  </StrictMode>
);
