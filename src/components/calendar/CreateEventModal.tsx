import { useState } from 'react';
import { X, Calendar, Clock, Users, MapPin, Plane, FileText } from 'lucide-react';
import { CalendarService, CreateEventData, EventType } from '../../services/calendarService';

interface CreateEventModalProps {
  eventTypes: EventType[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEventModal({ eventTypes, onClose, onSuccess }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    event_type_id: '',
    start_date: '',
    end_date: '',
    timezone: 'UTC',
    is_all_day: false,
    server_name: '',
    server_password: '',
    voice_channel: '',
    max_participants: undefined,
    min_participants: 1,
    status: 'scheduled',
    visibility: 'public',
    required_aircraft: [],
    required_certifications: [],
    difficulty_level: 'beginner',
    briefing_notes: '',
    external_links: null,
  });

  const [aircraftInput, setAircraftInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.start_date || !formData.end_date) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      setLoading(true);
      await CalendarService.createEvent(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateEventData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAircraft = () => {
    if (aircraftInput.trim() && !formData.required_aircraft?.includes(aircraftInput.trim())) {
      setFormData(prev => ({
        ...prev,
        required_aircraft: [...(prev.required_aircraft || []), aircraftInput.trim()]
      }));
      setAircraftInput('');
    }
  };

  const removeAircraft = (aircraft: string) => {
    setFormData(prev => ({
      ...prev,
      required_aircraft: prev.required_aircraft?.filter(a => a !== aircraft) || []
    }));
  };

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Establecer fecha por defecto (mañana a las 20:00)
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() + 1);
  defaultStartDate.setHours(20, 0, 0, 0);
  
  const defaultEndDate = new Date(defaultStartDate);
  defaultEndDate.setHours(22, 0, 0, 0);

  if (!formData.start_date) {
    setFormData(prev => ({
      ...prev,
      start_date: defaultStartDate.toISOString(),
      end_date: defaultEndDate.toISOString()
    }));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Evento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información Básica
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del Evento *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Operación Tormenta del Desierto"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción detallada del evento..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Evento
                </label>
                <select
                  value={formData.event_type_id}
                  onChange={(e) => handleInputChange('event_type_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar tipo</option>
                  {eventTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dificultad
                </label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                  <option value="expert">Experto</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Fecha y Hora
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora de Inicio *
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date ? formatDateTimeLocal(new Date(formData.start_date)) : ''}
                  onChange={(e) => handleInputChange('start_date', new Date(e.target.value).toISOString())}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora de Fin *
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date ? formatDateTimeLocal(new Date(formData.end_date)) : ''}
                  onChange={(e) => handleInputChange('end_date', new Date(e.target.value).toISOString())}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="all-day"
                checked={formData.is_all_day}
                onChange={(e) => handleInputChange('is_all_day', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="all-day" className="text-sm text-gray-700">
                Evento de todo el día
              </label>
            </div>
          </div>

          {/* Configuración del servidor */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Configuración del Servidor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Servidor
                </label>
                <input
                  type="text"
                  value={formData.server_name}
                  onChange={(e) => handleInputChange('server_name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: RavenLog Training Server"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Canal de Voz
                </label>
                <input
                  type="text"
                  value={formData.voice_channel}
                  onChange={(e) => handleInputChange('voice_channel', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Discord - Canal Operaciones"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña del Servidor
              </label>
              <input
                type="password"
                value={formData.server_password}
                onChange={(e) => handleInputChange('server_password', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contraseña opcional"
              />
            </div>
          </div>

          {/* Participantes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participantes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mínimo de Participantes
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.min_participants}
                  onChange={(e) => handleInputChange('min_participants', parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de Participantes
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_participants || ''}
                  onChange={(e) => handleInputChange('max_participants', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sin límite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibilidad
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) => handleInputChange('visibility', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Público</option>
                  <option value="unit_only">Solo Unidad</option>
                  <option value="private">Privado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Aeronaves requeridas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Aeronaves Requeridas
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={aircraftInput}
                onChange={(e) => setAircraftInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAircraft())}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: F/A-18C Hornet"
              />
              <button
                type="button"
                onClick={addAircraft}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Agregar
              </button>
            </div>

            {formData.required_aircraft && formData.required_aircraft.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.required_aircraft.map((aircraft, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {aircraft}
                    <button
                      type="button"
                      onClick={() => removeAircraft(aircraft)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Briefing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Briefing
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas del Briefing
              </label>
              <textarea
                value={formData.briefing_notes}
                onChange={(e) => handleInputChange('briefing_notes', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Instrucciones, objetivos, procedimientos, etc..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
