// src/components/poll/CreatePollModal.tsx
import React, { useState } from 'react';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventName: string) => void;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose, onSubmit }) => {
  console.log(onSubmit);
  
  const [eventName, setEventName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // VÉRIFICATION AJOUTÉE ICI
  if (!eventName.trim()) {
    alert('Veuillez entrer un nom pour l\'événement');
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    // Récupérer le token d'authentification
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Vous devez être connecté pour créer un sondage');
    }

    // Appel API pour créer le sondage
    const response = await fetch('https://hermanbackend.onrender.com/newEvent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
        body: JSON.stringify({ EventName: eventName.trim() }), // Vérifie le nom du champ
    });

    // Vérifier la réponse
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Échec de la création du sondage');
    }

    // Succès !
    console.log('Sondage créé avec succès:', data);
    
    // Réinitialiser le formulaire
    setEventName('');
    
    // Fermer le modal
    onClose();
    
    // Afficher un message de succès (optionnel)
    alert(`Sondage "${eventName}" créé avec succès !`);
    
  } catch (error: any) {
    console.error('Error creating poll:', error);
    alert(error.message || 'Erreur lors de la création du sondage');
  } finally {
    setIsSubmitting(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-2xl bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Créer un nouveau sondage</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">
                Nom de l'événement *
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Ex: Conférence Tech 2024"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
                disabled={isSubmitting}
              />
              <p className="text-sm text-gray-500 mt-2">
                Ce nom sera utilisé pour identifier le sondage et sera visible par les votants.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!eventName.trim() || isSubmitting}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Création...
                  </>
                ) : (
                  'Créer le sondage'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePollModal;