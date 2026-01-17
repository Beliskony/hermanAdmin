import { useCallback, useState } from "react";

export const getAuthToken = (): string | null => {
  return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
};

// Fonction fetch avec token automatique
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  
  // Créer les headers avec le token
  const headers = new Headers(options.headers);
  
  // Assurer que Content-Type est JSON si non spécifié
  if (!headers.has('Content-Type') && 
      (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Ajouter le token d'authentification
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Créer la nouvelle configuration
  const newOptions: RequestInit = {
    ...options,
    headers
  };
  
  return fetch(url, newOptions);
};

// Wrapper pour authFetch qui gère les réponses JSON
export const authFetchJson = async <T = any>(url: string, options: RequestInit = {}): Promise<{
  data: T;
  response: Response;
}> => {
  const response = await authFetch(url, options);
  
  // Vérifier si la réponse est OK
  if (!response.ok) {
    // Si erreur 401, rediriger vers login
    if (response.status === 401) {

      window.location.href = '/login';
    }
    
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Si pas de JSON, utiliser le texte
      const text = await response.text();
      errorMessage = text || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  // Vérifier que la réponse est bien du JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    return { data, response };
  } else {
    throw new Error('La réponse n\'est pas au format JSON');
  }
};

// Hook React pour utiliser authFetch
export const useAuthFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const execute = useCallback(async <T = any>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await authFetchJson<T>(url, options);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { execute, loading, error };
};