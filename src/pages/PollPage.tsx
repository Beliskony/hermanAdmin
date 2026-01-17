// src/pages/admin/PollPage.tsx
import { useState, useEffect } from 'react';
import PollHeader from '../components/polls/PollHeader';
import CreatePollModal from '../components/polls/CreatePollModal';
import EventsList from '../components/polls/EventsList';
import VotesList from '../components/polls/VotesList';
import PollStats from '../components/polls/PollStats';

interface Event {
  _id: string;
  name: string;
  voteCount: number;
  lastVote?: string;
}

interface Vote {
  _id: string;
  eventName: {
    _id: string;
    EventName: string;  // Le nom réel de l'événement
  } | string;
  name: string;
  phone: string;
  rating: number;
  feedback?: string;
  submittedAt: string;
}

function PollPage() {
  // États pour les événements
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // États pour les votes
  const [votes, setVotes] = useState<Vote[]>([]);
  const [allVotes, setAllVotes] = useState<Vote[]>([]);
  
  // États de chargement
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVotes, setIsLoadingVotes] = useState(false);
  
  // Statistiques calculées
  const [stats, setStats] = useState({
    averageRating: '0.0',
    totalVotes: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0
  });

// Récupérer tous les événements
const fetchEvents = async () => {
  try {
    setIsLoading(true);
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    const response = await fetch('https://hermanbackend.onrender.com/admin/events', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      setEvents(data.data);
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  } finally {
    setIsLoading(false);
  }
};

// Récupérer tous les votes
const fetchAllVotes = async () => {
  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    const response = await fetch('https://hermanbackend.onrender.com/admin/votes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      setAllVotes(data.data);
    }
  } catch (error) {
    console.error('Error fetching all votes:', error);
  }
};

// Récupérer les votes d'un événement spécifique
const fetchEventVotes = async (eventId: string) => {
  try {
    setIsLoadingVotes(true);
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    
    const response = await fetch(`https://hermanbackend.onrender.com/admin/votes/event/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      setVotes(data.data);
      if (data.stats) {
        setStats(data.stats);
      }
    }
  } catch (error) {
    console.error('Error fetching event votes:', error);
  } finally {
    setIsLoadingVotes(false);
  }
};

// Créer un nouveau sondage
const handleCreatePoll = async (eventName: string) => {
  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    const response = await fetch('https://hermanbackend.onrender.com/admin/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ eventName }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      await fetchEvents();
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error creating poll:', error);
    throw error;
  }
};

// Supprimer un événement
const handleDeleteEvent = async (eventName: string) => {
  if (!window.confirm(`Voulez-vous vraiment supprimer l'événement "${eventName}" et tous ses votes ?`)) {
    return;
  }

  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const encodedName = encodeURIComponent(eventName);
    
    const response = await fetch(`https://hermanbackend.onrender.com/admin/events/${encodedName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (selectedEvent && selectedEvent.name === eventName) {
        setSelectedEvent(null);
        setVotes([]);
      }
      await fetchEvents();
      await fetchAllVotes();
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    alert('Erreur lors de la suppression');
  }
};

// Supprimer un vote
const handleDeleteVote = async (voteId: string) => {
  if (!window.confirm('Voulez-vous vraiment supprimer ce vote ?')) {
    return;
  }

  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    const response = await fetch(`https://hermanbackend.onrender.com/admin/votes/${voteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (selectedEvent) {
        await fetchEventVotes(selectedEvent?._id);
      }
      await fetchAllVotes();
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error deleting vote:', error);
    alert('Erreur lors de la suppression');
  }
};

  // Sélectionner un événement
  const handleSelectEvent = (eventId: string) => {
    const event = events.find(e => e._id === eventId);
  if (!event) return;
  setSelectedEvent(event);           // stocke l'objet complet
  fetchEventVotes(event._id);
  };

  // Initialisation
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchEvents(), fetchAllVotes()]);
    };
    loadInitialData();
  }, []);

  // Calcul des statistiques globales
  useEffect(() => {
    if (allVotes.length > 0) {
      const average = allVotes.reduce((sum, vote) => sum + vote.rating, 0) / allVotes.length;
      setStats({
        averageRating: average.toFixed(1),
        totalVotes: allVotes.length,
        positiveCount: allVotes.filter(v => v.rating >= 7).length,
        neutralCount: allVotes.filter(v => v.rating >= 4 && v.rating <= 6).length,
        negativeCount: allVotes.filter(v => v.rating <= 3).length
      });
    }
  }, [allVotes]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <PollHeader
          title="Administration des Sondages"
          onRefresh={() => {
            fetchEvents();
            if (selectedEvent) {
              fetchEventVotes(selectedEvent?._id);
            }
            fetchAllVotes();
          }}
          onCreateNew={() => setIsCreateModalOpen(true)}
        />

        {/* Statistiques globales */}
        <PollStats stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des événements */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <EventsList
                events={events}
                onSelectEvent={(eventId) => handleSelectEvent(eventId)}
                onDeleteEvent={handleDeleteEvent}
              />
              {isLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement...</p>
                </div>
              )}
            </div>
          </div>

          {/* Liste des votes */}
          <div className="lg:col-span-2">
            {selectedEvent ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Votes pour "{selectedEvent?.name}"
                    </h2>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Voir tous les événements
                    </button>
                  </div>
                </div>
                {isLoadingVotes ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Chargement des votes...</p>
                  </div>
                ) : (
                  <VotesList
                    votes={votes}
                    eventName={selectedEvent?.name}
                    onDeleteVote={handleDeleteVote}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Sélectionnez un sondage</h3>
                <p className="text-gray-500">
                  Sélectionnez un sondage dans la liste de gauche pour voir ses votes
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de création */}
        <CreatePollModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePoll}
        />
      </div>
    </div>
  );
}

export default PollPage;