'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface EventCalendar {
  id: string
  name: string
  description: string
  color: string
}

interface CreateEventModalProps {
  onClose: () => void
  onSuccess: () => void
}

type TabType = 'event' | 'details' | 'notifications' | 'schedule' | 'registration'

export default function CreateEventModalEnhanced({ onClose, onSuccess }: CreateEventModalProps) {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('event')
  const [calendars, setCalendars] = useState<EventCalendar[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    // Event Tab
    title: '',
    calendar_id: '',
    author_id: profile?.id || '',
    start_date: '',
    end_date: '',
    is_all_day: false,
    
    // Details Tab
    description: '',
    location: '',
    event_url: '',
    
    // Schedule Tab
    is_recurring: false,
    recurrence_pattern: 'weekly' as 'daily' | 'weekly' | 'monthly',
    recurrence_end_date: '',
    
    // Registration Tab
    registration_enabled: true,
    registration_deadline: '',
    max_participants: undefined as number | undefined,
    min_participants: 1,
    
    // Additional fields
    event_type_id: '',
    visibility: 'public' as const,
    status: 'scheduled' as const,
  })

  useEffect(() => {
    fetchCalendars()
    
    // Establecer fechas por defecto
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(20, 0, 0, 0)
    
    const endDate = new Date(tomorrow)
    endDate.setHours(22, 0, 0, 0)
    
    setFormData(prev => ({
      ...prev,
      start_date: tomorrow.toISOString(),
      end_date: endDate.toISOString(),
      author_id: profile?.id || '',
    }))
  }, [profile])

  const fetchCalendars = async () => {
    try {
      const { data, error } = await supabase
        .from('event_calendars')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setCalendars(data || [])
      
      // Seleccionar el calendario por defecto
      const defaultCalendar = data?.find(c => c.is_default)
      if (defaultCalendar) {
        setFormData(prev => ({ ...prev, calendar_id: defaultCalendar.id }))
      }
    } catch (error) {
      console.error('Error fetching calendars:', error)
    }
  }

  const formatDateTimeLocal = (isoString: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.start_date || !formData.end_date) {
      toast.error('Por favor completa los campos obligatorios')
      return
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio')
      return
    }

    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('flight_events_calendar')
        .insert([{
          title: formData.title,
          description: formData.description || null,
          calendar_id: formData.calendar_id || null,
          event_type_id: formData.event_type_id || null,
          start_date: formData.start_date,
          end_date: formData.end_date,
          is_all_day: formData.is_all_day,
          location: formData.location || null,
          event_url: formData.event_url || null,
          organizer_id: profile?.id,
          status: formData.status,
          visibility: formData.visibility,
          registration_enabled: formData.registration_enabled,
          registration_deadline: formData.registration_deadline || null,
          max_participants: formData.max_participants || null,
          min_participants: formData.min_participants,
          is_recurring: formData.is_recurring,
          recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : null,
          recurrence_end_date: formData.is_recurring && formData.recurrence_end_date ? formData.recurrence_end_date : null,
        }])

      if (error) throw error
      
      toast.success('Evento creado exitosamente')
      onSuccess()
    } catch (error: any) {
      console.error('Error creating event:', error)
      toast.error(error.message || 'Error al crear el evento')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'event' as TabType, label: 'Event' },
    { id: 'details' as TabType, label: 'Details' },
    { id: 'notifications' as TabType, label: 'Notifications' },
    { id: 'schedule' as TabType, label: 'Schedule' },
    { id: 'registration' as TabType, label: 'Registration' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Create Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50 px-6">
          <nav className="flex -mb-px space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* EVENT TAB */}
            {activeTab === 'event' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="The name of the event."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calendar
                    </label>
                    <select
                      value={formData.calendar_id}
                      onChange={(e) => setFormData({ ...formData, calendar_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select an option...</option>
                      {calendars.map((calendar) => (
                        <option key={calendar.id} value={calendar.id}>
                          {calendar.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">The calendar the event belongs to.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      value={profile?.full_name || profile?.email || 'Admin'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">The author of the event.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Starts <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formatDateTimeLocal(formData.start_date)}
                      onChange={(e) => setFormData({ ...formData, start_date: new Date(e.target.value).toISOString() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">The date and time the event starts.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ends <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formatDateTimeLocal(formData.end_date)}
                      onChange={(e) => setFormData({ ...formData, end_date: new Date(e.target.value).toISOString() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">The date and time the event ends.</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="all-day"
                    checked={formData.is_all_day}
                    onChange={(e) => setFormData({ ...formData, is_all_day: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="all-day" className="ml-2 block text-sm text-gray-700">
                    All day
                  </label>
                  <p className="ml-4 text-xs text-gray-500">
                    Check if the event does not have a start and end time.
                  </p>
                </div>
              </div>
            )}

            {/* DETAILS TAB */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={10}
                    placeholder="The description of the event."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">The description of the event.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="The location of the event."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">The location of the event.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.event_url}
                    onChange={(e) => setFormData({ ...formData, event_url: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">A link related to the event.</p>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg font-medium mb-2">Notificaciones</p>
                  <p className="text-sm">Esta funcionalidad estará disponible próximamente.</p>
                  <p className="text-sm mt-2">Podrás configurar recordatorios y notificaciones automáticas para los participantes.</p>
                </div>
              </div>
            )}

            {/* SCHEDULE TAB */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="is-recurring"
                        checked={formData.is_recurring}
                        onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is-recurring" className="text-sm font-medium text-gray-900">
                        Recurring Event
                      </label>
                    </div>
                    <p className="text-xs text-gray-600">
                      Enable this to create a recurring event that repeats on a schedule
                    </p>
                  </div>
                </div>

                {formData.is_recurring && (
                  <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recurrence Pattern
                      </label>
                      <select
                        value={formData.recurrence_pattern}
                        onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        How often should this event repeat?
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recurrence Ends
                      </label>
                      <input
                        type="datetime-local"
                        value={formatDateTimeLocal(formData.recurrence_end_date)}
                        onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        When should the recurrence stop? Leave empty for no end date.
                      </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs text-yellow-800">
                        <strong>Note:</strong> Recurring events will create multiple instances based on the pattern selected.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* REGISTRATION TAB */}
            {activeTab === 'registration' && (
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="relative inline-block w-11 h-6">
                    <input
                      type="checkbox"
                      id="registration-enabled"
                      checked={formData.registration_enabled}
                      onChange={(e) => setFormData({ ...formData, registration_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <label
                      htmlFor="registration-enabled"
                      className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition-colors peer-checked:bg-blue-600"
                    >
                      <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
                    </label>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="registration-enabled" className="text-sm font-medium text-gray-900 block mb-1">
                      Enabled
                    </label>
                    <p className="text-xs text-gray-600">
                      Whether registration is enabled for the event.
                    </p>
                  </div>
                </div>

                {formData.registration_enabled && (
                  <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Min Participants
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.min_participants}
                          onChange={(e) => setFormData({ ...formData, min_participants: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum number of participants required
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Participants
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.max_participants || ''}
                          onChange={(e) => setFormData({ ...formData, max_participants: e.target.value ? parseInt(e.target.value) : undefined })}
                          placeholder="Unlimited"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum allowed (leave empty for unlimited)
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Deadline
                      </label>
                      <input
                        type="datetime-local"
                        value={formatDateTimeLocal(formData.registration_deadline)}
                        onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Last date/time to register (leave empty for no deadline)
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800">
                        <strong>Tip:</strong> Users will be able to register for this event through the calendar interface. You'll receive notifications when users sign up.
                      </p>
                    </div>
                  </div>
                )}

                {!formData.registration_enabled && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-600">
                      Registration is disabled. Users will see the event but cannot register to participate.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-6 bg-gray-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

