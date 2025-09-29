import { supabase } from '../lib/supabase';

// Tipos para el módulo de calendario
export interface EventType {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  is_system_type: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlightEvent {
  id: string;
  title: string;
  description: string | null;
  event_type_id: string | null;
  start_date: string;
  end_date: string;
  timezone: string;
  is_all_day: boolean;
  server_name: string | null;
  server_password: string | null;
  voice_channel: string | null;
  organizer_id: string;
  max_participants: number | null;
  min_participants: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  visibility: 'public' | 'unit_only' | 'private';
  required_aircraft: string[] | null;
  required_certifications: string[] | null;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  briefing_notes: string | null;
  debrief_notes: string | null;
  external_links: any | null;
  created_at: string;
  updated_at: string;
  // Relaciones
  event_type?: EventType;
  organizer?: {
    id: string;
    full_name: string | null;
    email: string;
  };
  participants?: EventParticipant[];
  participant_count?: number;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: 'registered' | 'confirmed' | 'attended' | 'no_show' | 'cancelled';
  role: 'participant' | 'flight_lead' | 'instructor' | 'observer';
  aircraft: string | null;
  callsign: string | null;
  notes: string | null;
  registered_at: string;
  updated_at: string;
  // Relaciones
  user?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface EventComment {
  id: string;
  event_id: string;
  user_id: string;
  comment: string;
  is_briefing: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones
  user?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_type_id?: string;
  start_date: string;
  end_date: string;
  timezone?: string;
  is_all_day?: boolean;
  server_name?: string;
  server_password?: string;
  voice_channel?: string;
  max_participants?: number;
  min_participants?: number;
  status?: 'scheduled' | 'active' | 'completed' | 'cancelled';
  visibility?: 'public' | 'unit_only' | 'private';
  required_aircraft?: string[];
  required_certifications?: string[];
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  briefing_notes?: string;
  external_links?: any;
}

export class CalendarService {
  // TIPOS DE EVENTOS
  static async getEventTypes(): Promise<EventType[]> {
    const { data, error } = await (supabase as any)
      .from('event_types')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async createEventType(eventType: Omit<EventType, 'id' | 'created_at' | 'updated_at'>): Promise<EventType> {
    const { data, error } = await (supabase as any)
      .from('event_types')
      .insert([eventType])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateEventType(id: string, updates: Partial<EventType>): Promise<EventType> {
    const { data, error } = await (supabase as any)
      .from('event_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteEventType(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('event_types')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // EVENTOS
  static async getEvents(filters?: {
    start_date?: string;
    end_date?: string;
    status?: string;
    organizer_id?: string;
  }): Promise<FlightEvent[]> {
    let query = (supabase as any)
      .from('flight_events_calendar')
      .select(`
        *,
        event_type:event_types(*),
        organizer:profiles!organizer_id(id, full_name, email),
        participant_count:event_participants(count)
      `);

    if (filters?.start_date) {
      query = query.gte('start_date', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('start_date', filters.end_date);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.organizer_id) {
      query = query.eq('organizer_id', filters.organizer_id);
    }

    query = query.order('start_date');

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  static async getEvent(id: string): Promise<FlightEvent> {
    const { data, error } = await (supabase as any)
      .from('flight_events_calendar')
      .select(`
        *,
        event_type:event_types(*),
        organizer:profiles!organizer_id(id, full_name, email),
        participants:event_participants(
          *,
          user:profiles(id, full_name, email)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createEvent(eventData: CreateEventData): Promise<FlightEvent> {
    const { data, error } = await (supabase as any)
      .from('flight_events_calendar')
      .insert([{
        ...eventData,
        organizer_id: (await supabase.auth.getUser()).data.user?.id
      }])
      .select(`
        *,
        event_type:event_types(*),
        organizer:profiles!organizer_id(id, full_name, email)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateEvent(id: string, updates: Partial<CreateEventData>): Promise<FlightEvent> {
    const { data, error } = await (supabase as any)
      .from('flight_events_calendar')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        event_type:event_types(*),
        organizer:profiles!organizer_id(id, full_name, email)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteEvent(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('flight_events_calendar')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // PARTICIPANTES
  static async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    const { data, error } = await (supabase as any)
      .from('event_participants')
      .select(`
        *,
        user:profiles(id, full_name, email)
      `)
      .eq('event_id', eventId)
      .order('registered_at');

    if (error) throw error;
    return data || [];
  }

  static async registerForEvent(eventId: string, participantData?: {
    aircraft?: string;
    callsign?: string;
    notes?: string;
  }): Promise<EventParticipant> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await (supabase as any)
      .from('event_participants')
      .insert([{
        event_id: eventId,
        user_id: user.id,
        ...participantData
      }])
      .select(`
        *,
        user:profiles(id, full_name, email)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateParticipation(participantId: string, updates: Partial<EventParticipant>): Promise<EventParticipant> {
    const { data, error } = await (supabase as any)
      .from('event_participants')
      .update(updates)
      .eq('id', participantId)
      .select(`
        *,
        user:profiles(id, full_name, email)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async cancelParticipation(eventId: string): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await (supabase as any)
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // COMENTARIOS
  static async getEventComments(eventId: string): Promise<EventComment[]> {
    const { data, error } = await (supabase as any)
      .from('event_comments')
      .select(`
        *,
        user:profiles(id, full_name, email)
      `)
      .eq('event_id', eventId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  }

  static async addComment(eventId: string, comment: string, isBriefing = false): Promise<EventComment> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await (supabase as any)
      .from('event_comments')
      .insert([{
        event_id: eventId,
        user_id: user.id,
        comment,
        is_briefing: isBriefing
      }])
      .select(`
        *,
        user:profiles(id, full_name, email)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteComment(commentId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('event_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  }
}
