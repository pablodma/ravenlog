import { supabase } from '../lib/supabase';

export interface AdminStats {
  activePersonnel: number;
  totalCertifications: number;
  certificationCategories: number;
  totalMedals: number;
  newMedals: number;
  pendingCandidates: number;
  totalEvents: number;
  upcomingEvents: number;
}

export class AdminService {
  static async getAdminStats(): Promise<AdminStats> {
    try {
      // Obtener personal activo (usuarios con role personnel o admin)
      const { count: activePersonnel } = await (supabase as any)
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['personnel', 'admin']);

      // Obtener total de certificaciones
      const { count: totalCertifications } = await (supabase as any)
        .from('certifications')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      // Obtener categorías únicas de certificaciones
      const { data: certCategories } = await (supabase as any)
        .from('certifications')
        .select('category')
        .eq('active', true);
      
      const certificationCategories = new Set(certCategories?.map((c: any) => c.category) || []).size;

      // Obtener total de medallas
      const { count: totalMedals } = await (supabase as any)
        .from('medals')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      // Obtener medallas creadas en el último mes
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const { count: newMedals } = await (supabase as any)
        .from('medals')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)
        .gte('created_at', lastMonth.toISOString());

      // Obtener candidatos pendientes
      const { count: pendingCandidates } = await (supabase as any)
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'under_review']);

      // Obtener eventos (si la tabla existe)
      let totalEvents = 0;
      let upcomingEvents = 0;
      
      try {
        const { count: eventsCount } = await (supabase as any)
          .from('flight_events_calendar')
          .select('*', { count: 'exact', head: true });
        
        totalEvents = eventsCount || 0;

        const { count: upcomingCount } = await (supabase as any)
          .from('flight_events_calendar')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'scheduled')
          .gte('start_date', new Date().toISOString());
        
        upcomingEvents = upcomingCount || 0;
      } catch (error) {
        // Tabla de eventos no existe aún
        console.log('Events table not found, using default values');
      }

      return {
        activePersonnel: activePersonnel || 0,
        totalCertifications: totalCertifications || 0,
        certificationCategories,
        totalMedals: totalMedals || 0,
        newMedals: newMedals || 0,
        pendingCandidates: pendingCandidates || 0,
        totalEvents,
        upcomingEvents
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Devolver valores por defecto en caso de error
      return {
        activePersonnel: 0,
        totalCertifications: 0,
        certificationCategories: 0,
        totalMedals: 0,
        newMedals: 0,
        pendingCandidates: 0,
        totalEvents: 0,
        upcomingEvents: 0
      };
    }
  }

  static async getUserStats(userId: string) {
    try {
      // Obtener medallas del usuario
      const { count: userMedals } = await (supabase as any)
        .from('personnel_medals')
        .select('*', { count: 'exact', head: true })
        .eq('personnel_id', userId);

      // Obtener certificaciones del usuario
      const { count: userCertifications } = await (supabase as any)
        .from('personnel_certifications')
        .select('*', { count: 'exact', head: true })
        .eq('personnel_id', userId);

      // Obtener estadísticas DCS del usuario
      const { data: dcsStats } = await (supabase as any)
        .from('user_statistics')
        .select('total_flights')
        .eq('user_id', userId)
        .maybeSingle();

      return {
        medals: userMedals || 0,
        certifications: userCertifications || 0,
        dcsFlights: dcsStats?.total_flights || 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        medals: 0,
        certifications: 0,
        dcsFlights: 0
      };
    }
  }
}
