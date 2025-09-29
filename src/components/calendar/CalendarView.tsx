import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react';
import { CalendarService, FlightEvent, EventType } from '../../services/calendarService';
// import { usePermissions } from '../../hooks/usePermissions';
import PermissionGuard from '../auth/PermissionGuard';
import { EventCard } from './EventCard';
import { CreateEventModal } from './CreateEventModal';

interface CalendarViewProps {
  className?: string;
}

export function CalendarView({ className = '' }: CalendarViewProps) {
  const [events, setEvents] = useState<FlightEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    status?: string;
    eventType?: string;
  }>({});

  // const { hasPermission } = usePermissions();

  useEffect(() => {
    loadData();
  }, [currentDate, selectedFilters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calcular rango de fechas basado en la vista actual
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();

      const [eventsData, eventTypesData] = await Promise.all([
        CalendarService.getEvents({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: selectedFilters.status,
        }),
        CalendarService.getEventTypes(),
      ]);

      setEvents(eventsData);
      setEventTypes(eventTypesData);
    } catch (err) {
      console.error('Error loading calendar data:', err);
      setError('Error al cargar los eventos del calendario');
    } finally {
      setLoading(false);
    }
  };

  const getViewStartDate = (): Date => {
    const date = new Date(currentDate);
    switch (viewMode) {
      case 'month':
        date.setDate(1);
        date.setDate(date.getDate() - date.getDay()); // Inicio de la semana del primer día
        break;
      case 'week':
        date.setDate(date.getDate() - date.getDay()); // Inicio de la semana
        break;
      case 'day':
        // Ya es el día actual
        break;
    }
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getViewEndDate = (): Date => {
    const date = new Date(currentDate);
    switch (viewMode) {
      case 'month':
        date.setMonth(date.getMonth() + 1, 0); // Último día del mes
        date.setDate(date.getDate() + (6 - date.getDay())); // Fin de la semana del último día
        break;
      case 'week':
        date.setDate(date.getDate() - date.getDay() + 6); // Fin de la semana
        break;
      case 'day':
        // Ya es el día actual
        break;
    }
    date.setHours(23, 59, 59, 999);
    return date;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const getDateTitle = (): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
    };

    switch (viewMode) {
      case 'month':
        return currentDate.toLocaleDateString('es-ES', options);
      case 'week':
        const weekStart = getViewStartDate();
        const weekEnd = getViewEndDate();
        return `${weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      case 'day':
        return currentDate.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      default:
        return '';
    }
  };

  const getEventsForDate = (date: Date): FlightEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const renderMonthView = () => {
    const startDate = getViewStartDate();
    const days = [];
    const currentMonth = currentDate.getMonth();

    for (let i = 0; i < 42; i++) { // 6 semanas × 7 días
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayEvents = getEventsForDate(date);
      const isCurrentMonth = date.getMonth() === currentMonth;
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={i}
          className={`min-h-[120px] border border-gray-200 p-2 ${
            isCurrentMonth ? 'bg-white' : 'bg-gray-50'
          } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
          } ${isToday ? 'text-blue-600' : ''}`}>
            {date.getDate()}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map(event => (
              <div
                key={event.id}
                className="text-xs p-1 rounded truncate"
                style={{ backgroundColor: event.event_type?.color + '20', color: event.event_type?.color }}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 3} más
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {/* Encabezados de días */}
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="bg-gray-100 p-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderListView = () => {
    const filteredEvents = events.filter(event => {
      if (selectedFilters.eventType && event.event_type_id !== selectedFilters.eventType) {
        return false;
      }
      return true;
    });

    if (filteredEvents.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay eventos</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron eventos para el período seleccionado.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onUpdate={loadData}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-600 mb-2">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Eventos</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-medium text-gray-900 min-w-[200px] text-center">
              {getDateTitle()}
            </h2>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtros */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedFilters.status || ''}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="">Todos los estados</option>
              <option value="scheduled">Programado</option>
              <option value="active">Activo</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <select
              value={selectedFilters.eventType || ''}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, eventType: e.target.value || undefined }))}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="">Todos los tipos</option>
              {eventTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          {/* Selector de vista */}
          <div className="flex border border-gray-300 rounded-md">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${mode === 'month' ? 'rounded-l-md' : mode === 'day' ? 'rounded-r-md' : ''}`}
              >
                {mode === 'month' ? 'Mes' : mode === 'week' ? 'Semana' : 'Día'}
              </button>
            ))}
          </div>

          {/* Botón crear evento */}
          <PermissionGuard permission="events.create">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Nuevo Evento
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Vista del calendario */}
      {viewMode === 'month' ? renderMonthView() : renderListView()}

      {/* Modal de crear evento */}
      {showCreateModal && (
        <CreateEventModal
          eventTypes={eventTypes}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
