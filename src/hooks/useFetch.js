import { useState, useEffect, useCallback } from "react";
import { INITIAL_MENU } from "../data/mockMenu";

/**
 * Hook Personalizado: useFetch
 * 
 * Cumple con las Reglas de Hooks:
 * 1. Declarado en el nivel superior del componente/hook.
 * 2. Nunca se ejecuta dentro de condicionales (if), bucles (for/while) ni funciones anidadas.
 * 
 * Explicación técnica de StrictMode:
 * En React.StrictMode (entorno de desarrollo), React deliberadamente monta, desmonta 
 * y vuelve a montar el componente (double-invoke). Por esta razón, un useEffect con [] 
 * se ejecuta 2 veces en desarrollo. El uso de AbortController y su función de cleanup 
 * garantiza que la primera petición abortada no cause memory leaks ni asigne estado 
 * a un componente desmontado.
 * 
 * IA: [peticiones colgadas y memory leak al desmontar] → Solución manual: [incorporar AbortController y cleanup en useEffect]
 */
export function useFetch(endpoint, simulatedDelay = 600) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [triggerCount, setTriggerCount] = useState(0);

  const refetch = useCallback(() => {
    setTriggerCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    // 1. Instanciamos el controlador de cancelación
    const controller = new AbortController();
    const { signal } = controller;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const executeFetch = async () => {
      try {
        // Simulación de latencia de red para demostrar estados de carga asíncrona real
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(resolve, simulatedDelay);
          signal.addEventListener("abort", () => {
            clearTimeout(timeout);
            reject(new DOMException("Aborted by user or unmount", "AbortError"));
          });
        });

        if (signal.aborted) return;

        // Si se pide un endpoint de error intencional para testear estados
        if (endpoint === "/api/error") {
          throw new Error("No se pudo conectar con el servidor de comandas (503 Service Unavailable)");
        }

        // Endpoint de platillos del menú del restaurante
        if (endpoint === "/api/menu" || !endpoint) {
          if (isMounted) {
            setData(INITIAL_MENU);
          }
        } else {
          // Soporta fetch real si se envía una URL HTTP completa
          const response = await fetch(endpoint, { credentials: "same-origin", signal });
          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
          }
          const json = await response.json();
          if (isMounted) {
            setData(json);
          }
        }
      } catch (err) {
        // Ignoramos AbortError intencionalmente ya que corresponde al ciclo normal de cleanup
        if (err.name === "AbortError") {
          return;
        }
        if (isMounted) {
          setError(err.message || "Error al sincronizar datos del menú");
        }
      } finally {
        if (isMounted && !signal.aborted) {
          setLoading(false);
        }
      }
    };

    executeFetch();

    // Función de limpieza obligatoria para cancelar peticiones pendientes
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [endpoint, simulatedDelay, triggerCount]);

  return { data, loading, error, refetch };
}
