import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react';
import { CalendarService, FlightEvent, EventType } from '../../services/calendarService';
// import { usePermissions } from '../../hooks/usePermissions';
import PermissionGuard from '../auth/PermissionGuard';
import { EventCard } from './EventCard';
import CreateEventModalEnhanced from './CreateEventModalEnhanced';

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
      console.log('📅 CalendarView.loadData: Iniciando carga de datos');
      setLoading(true);
      setError(null);

      // Calcular rango de fechas basado en la vista actual
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();
      
      console.log('📅 CalendarView.loadData: Rango de fechas:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        viewMode,
        currentDate
      });

      console.log('📅 CalendarView.loadData: Filtros aplicados:', selectedFilters);

      try {
        console.log('📅 CalendarView.loadData: Cargando tipos de eventos...');
        const eventTypesData = await CalendarService.getEventTypes();
        console.log('📅 CalendarView.loadData: Tipos de eventos cargados:', eventTypesData.length);
        setEventTypes(eventTypesData);

        console.log('📅 CalendarView.loadData: Cargando eventos...');
        const eventsData = await CalendarService.getEvents({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: selectedFilters.status,
        });
        console.log('📅 CalendarView.loadData: Eventos cargados:', eventsData.length);
        setEvents(eventsData);

        console.log('✅ CalendarView.loadData: Carga completada exitosamente');
      } catch (serviceError) {
        console.error('❌ CalendarView.loadData: Error en servicio:', serviceError);
        throw serviceError;
      }
    } catch (err: any) {
      console.error('💥 CalendarView.loadData: Error crítico:', err);
      console.error('💥 CalendarView.loadData: Error stack:', err.stack);
      
      let errorMessage = 'Error al cargar los eventos del calendario';
      if (err.message?.includes('Calendar table not accessible')) {
        errorMessage = 'Las tablas del calendario no están disponibles. Contacta al administrador.';
      } else if (err.message?.includes('permission denied')) {
        errorMessage = 'No tienes permisos para acceder al calendario.';
      } else if (err.code === 'PGRST106' || err.message?.includes('relation') || err.message?.includes('does not exist')) {
        errorMessage = 'El módulo de calendario no está configurado. Ejecuta el script de migración SQL.';
      }
      
      setError(errorMessage);
    } finally {
      console.log('🏁 CalendarView.loadData: Finalizando, estableciendo loading=false');
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
          className={`min-h-[120px] border border-border p-2 ${
            isCurrentMonth ? 'bg-card' : 'bg-muted/30'
          } ${isToday ? 'bg-primary/10 border-primary' : ''}`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
          } ${isToday ? 'text-primary' : ''}`}>
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
              <div className="text-xs text-muted-foreground">
                +{dayEvents.length - 3} más
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
        {/* Encabezados de días */}
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="bg-muted p-3 text-center text-sm font-medium text-muted-foreground border-b border-border">
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
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No hay eventos</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {eventTypes.length === 0 
              ? 'El módulo de calendario no está configurado. Ejecuta el script SQL de migración.'
              : 'No se encontraron eventos para el período seleccionado.'
            }
          </p>
          {eventTypes.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-yellow-600">
                <strong>Instrucciones:</strong><br/>
                1. Ve al SQL Editor de Supabase<br/>
                2. Ejecuta el script <code>create_calendar_tables_simple.sql</code><br/>
                3. Recarga esta página
              </p>
            </div>
          )}
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-destructive mb-2">⚠️</div>
        <h3 className="text-lg font-medium text-foreground mb-2">Error</h3>
        <p className="text-muted-foreground">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
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
          <h1 className="text-2xl font-bold text-foreground">Calendario de Eventos</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-medium text-foreground min-w-[200px] text-center">
              {getDateTitle()}
            </h2>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtros */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedFilters.status || ''}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
              className="text-sm border border-input rounded-md px-2 py-1 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
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
              className="text-sm border border-input rounded-md px-2 py-1 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              {eventTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          {/* Selector de vista */}
          <div className="flex border border-input rounded-md overflow-hidden">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm transition-colors ${
                  viewMode === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {mode === 'month' ? 'Mes' : mode === 'week' ? 'Semana' : 'Día'}
              </button>
            ))}
          </div>

          {/* Botón crear evento */}
          <PermissionGuard permission="events.create">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
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
        <CreateEventModalEnhanced
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
