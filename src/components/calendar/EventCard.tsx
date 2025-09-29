import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Headphones, 
  Shield, 
  Plane,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  MessageSquare
} from 'lucide-react';
import { FlightEvent, CalendarService } from '../../services/calendarService';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionGuard } from '../auth/PermissionGuard';

interface EventCardProps {
  event: FlightEvent;
  onUpdate: () => void;
  compact?: boolean;
}

export function EventCard({ event, onUpdate, compact = false }: EventCardProps) {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { user, profile } = useAuth();
  const { hasPermission } = usePermissions();

  const isOrganizer = profile?.id === event.organizer_id;
  const isParticipant = event.participants?.some(p => p.user_id === profile?.id);
  const canEdit = isOrganizer || hasPermission('events.edit_all');
  const canDelete = isOrganizer || hasPermission('events.delete_all');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleJoinEvent = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await CalendarService.registerForEvent(event.id);
      onUpdate();
    } catch (error) {
      console.error('Error joining event:', error);
      alert('Error al unirse al evento');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await CalendarService.cancelParticipation(event.id);
      onUpdate();
    } catch (error) {
      console.error('Error leaving event:', error);
      alert('Error al salir del evento');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return;
    
    try {
      setLoading(true);
      await CalendarService.deleteEvent(event.id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error al eliminar el evento');
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div 
        className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: event.event_type?.color || '#3B82F6' }}
            />
            <div>
              <h3 className="font-medium text-gray-900">{event.title}</h3>
              <p className="text-sm text-gray-500">
                {formatTime(event.start_date)} - {formatTime(event.end_date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
              {event.status === 'scheduled' ? 'Programado' : 
               event.status === 'active' ? 'Activo' :
               event.status === 'completed' ? 'Completado' : 'Cancelado'}
            </span>
            {event.participant_count !== undefined && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Users className="h-4 w-4" />
                {event.participant_count}
                {event.max_participants && `/${event.max_participants}`}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 border-l-4"
        style={{ borderLeftColor: event.event_type?.color || '#3B82F6' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                {event.status === 'scheduled' ? 'Programado' : 
                 event.status === 'active' ? 'Activo' :
                 event.status === 'completed' ? 'Completado' : 'Cancelado'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(event.difficulty_level)}`}>
                {event.difficulty_level === 'beginner' ? 'Principiante' :
                 event.difficulty_level === 'intermediate' ? 'Intermedio' :
                 event.difficulty_level === 'advanced' ? 'Avanzado' : 'Experto'}
              </span>
            </div>
            
            {event.event_type && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: event.event_type.color }}
                />
                {event.event_type.name}
              </div>
            )}

            {event.description && (
              <p className="text-gray-600 mb-3">{event.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            <PermissionGuard permission="events.edit_own">
              {canEdit && (
                <button
                  onClick={() => {/* TODO: Implementar edición */}}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                  title="Editar evento"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </PermissionGuard>
            
            <PermissionGuard permission="events.delete_own">
              {canDelete && (
                <button
                  onClick={handleDeleteEvent}
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                  title="Eliminar evento"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </PermissionGuard>
          </div>
        </div>

        {/* Información del evento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              {formatDate(event.start_date)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {formatTime(event.start_date)} - {formatTime(event.end_date)}
            </div>
            {event.organizer && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                Organizado por {event.organizer.full_name || event.organizer.email}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {event.server_name && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {event.server_name}
              </div>
            )}
            {event.voice_channel && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Headphones className="h-4 w-4" />
                {event.voice_channel}
              </div>
            )}
            {event.required_aircraft && event.required_aircraft.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Plane className="h-4 w-4" />
                {event.required_aircraft.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Participantes */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {event.participants?.length || 0} participantes
              {event.max_participants && ` / ${event.max_participants} máximo`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {event.status === 'scheduled' && (
              <>
                {isParticipant ? (
                  <button
                    onClick={handleLeaveEvent}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
                  >
                    <UserMinus className="h-4 w-4" />
                    Salir
                  </button>
                ) : (
                  <button
                    onClick={handleJoinEvent}
                    disabled={loading || (event.max_participants && (event.participants?.length || 0) >= event.max_participants)}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 disabled:opacity-50"
                  >
                    <UserPlus className="h-4 w-4" />
                    Unirse
                  </button>
                )}
              </>
            )}
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <MessageSquare className="h-4 w-4" />
              Detalles
            </button>
          </div>
        </div>
      </div>

      {/* Detalles expandidos */}
      {showDetails && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          {event.briefing_notes && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Briefing</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.briefing_notes}</p>
            </div>
          )}

          {event.participants && event.participants.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Participantes</h4>
              <div className="space-y-2">
                {event.participants.map(participant => (
                  <div key={participant.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {participant.user?.full_name || participant.user?.email}
                      </span>
                      {participant.role !== 'participant' && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {participant.role === 'flight_lead' ? 'Líder de vuelo' :
                           participant.role === 'instructor' ? 'Instructor' : 'Observador'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      {participant.aircraft && (
                        <span>{participant.aircraft}</span>
                      )}
                      {participant.callsign && (
                        <span>({participant.callsign})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.debrief_notes && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Debrief</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.debrief_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
