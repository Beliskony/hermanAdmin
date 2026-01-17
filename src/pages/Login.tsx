import { useState } from 'react';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type ILogin } from '../interfaces/ILogin';

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: {
      _id: string;
      email: string;
      role: string;
    };
  };
}


// Fonction pour configurer fetch avec le token
const configureFetchDefaults = (token: string) => {
  // Sauvegarder l'original fetch
  const originalFetch = window.fetch;
  
  // Override de fetch pour ajouter automatiquement le token
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Cloner les options
    const options = init ? { ...init } : {};
    
    // Ajouter les headers
    const headers = new Headers(options.headers);
    
    // Ajouter le token aux headers
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Si c'est une requête POST/PUT/PATCH sans Content-Type, ajouter JSON par défaut
    const method = options.method || 'GET';
    if (!headers.has('Content-Type') && 
        (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      headers.set('Content-Type', 'application/json');
    }
    
    options.headers = headers;
    
    // Utiliser le fetch original avec les nouvelles options
    return originalFetch(input, options);
  };
};

// Fonction utilitaire pour stocker le token
const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
  sessionStorage.setItem('authToken', token);
};

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ILogin>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      
      // Appel API pour l'authentification
      const response = await fetch('https://hermanbackend.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      // Vérifier si la réponse est OK
      if (!response.ok) {
        // Essayer de récupérer le message d'erreur du backend
        let errorMessage = `Erreur ${response.status}`;
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

      const data: LoginResponse = await response.json();
      console.log("LOGIN RESPONSE =", data);
      
      if (data.success && data.data?.token) {
      const { token, user } = data.data;

      console.log("NAVIGATION TO /Polls");

      setAuthToken(token);
      configureFetchDefaults(token);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

       navigate("/Polls", { replace: true });
    }

    } catch (error: any) {
      console.error('Login error:', error);
      setError(
        error.message.includes('Failed to fetch') || error.message.includes('NetworkError')
          ? 'Impossible de se connecter au serveur'
          : error.message || 'Une erreur est survenue lors de la connexion'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de l'entrée avec la touche Entrée
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Connexion Admin</h1>
          <p className="text-gray-600">Accédez à votre espace d'administration</p>
        </div>

        <form onSubmit={handleSubmit} onKeyPress={handleKeyPress}>
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="admin@exemple.com"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors font-medium text-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>

            {/* Lien de démo (optionnel) */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Accès administrateur requis
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;