// DCS Log Parser - Extrae eventos relevantes de logs de DCS World
// Basado en el análisis del archivo dcs.log proporcionado

export interface DCSEvent {
  timestamp: Date;
  type: 'takeoff' | 'landing' | 'shot' | 'hit' | 'kill' | 'death' | 'mission_start' | 'mission_end' | 'connection' | 'spawn' | 'other';
  data: Record<string, any>;
}

export interface ParsedLogSummary {
  totalEvents: number;
  missions: number;
  takeoffs: number;
  landings: number;
  shots: number;
  hits: number;
  kills: number;
  deaths: number;
  flightTime: number; // en segundos
  weaponStats: Record<string, { shots: number; hits: number; kills: number }>;
  aircraftTypes: string[];
  serverName?: string;
  playerName?: string;
  errors: string[];
}

export class DCSLogParser {
  private events: DCSEvent[] = [];
  private errors: string[] = [];

  /**
   * Parsea un archivo de log de DCS y extrae eventos relevantes
   */
  public parseLogContent(content: string): ParsedLogSummary {
    this.events = [];
    this.errors = [];

    const lines = content.split('\n');
    let currentMission: string | null = null;
    let missionStartTime: Date | null = null;
    let playerSpawned = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const event = this.parseLine(line, i + 1);
        if (event) {
          this.events.push(event);

          // Trackear estado de misión
          if (event.type === 'mission_start') {
            currentMission = event.data.missionName || 'Unknown Mission';
            missionStartTime = event.timestamp;
            playerSpawned = false;
          } else if (event.type === 'spawn') {
            playerSpawned = true;
          }
        }
      } catch (error) {
        this.errors.push(`Línea ${i + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    return this.generateSummary();
  }

  /**
   * Parsea una línea individual del log
   */
  private parseLine(line: string, lineNumber: number): DCSEvent | null {
    // Extraer timestamp del formato: 2025-09-22 00:23:25.433
    const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/);
    if (!timestampMatch) {
      return null; // Líneas sin timestamp las ignoramos
    }

    const timestamp = new Date(timestampMatch[1]);
    const content = line.substring(timestampMatch[0].length).trim();

    // Detectar diferentes tipos de eventos

    // 1. Conexión a servidor
    if (content.includes('connected to server')) {
      const serverMatch = content.match(/Server name: (.+)/);
      return {
        timestamp,
        type: 'connection',
        data: {
          serverName: serverMatch ? serverMatch[1] : 'Unknown Server',
          action: 'connected'
        }
      };
    }

    // 2. Carga de misión
    if (content.includes('loadMission') || content.includes('loading mission')) {
      const missionMatch = content.match(/loading mission from: "(.+)"/);
      return {
        timestamp,
        type: 'mission_start',
        data: {
          missionName: missionMatch ? this.extractMissionName(missionMatch[1]) : 'Unknown Mission'
        }
      };
    }

    // 3. Spawn de jugador (inicio de vuelo)
    if (content.includes('MissionSpawn:spawnLocalPlayer')) {
      const aircraftMatch = content.match(/spawnLocalPlayer \d+,(.+)/);
      return {
        timestamp,
        type: 'spawn',
        data: {
          aircraftType: aircraftMatch ? aircraftMatch[1].replace(/_/g, '-') : 'Unknown Aircraft'
        }
      };
    }

    // 4. Eventos de vuelo (inferidos de logs de sistema)
    // En el log actual no hay eventos explícitos de takeoff/landing/combat
    // Pero podemos inferir algunos patrones

    // 5. Desconexión (fin de misión)
    if (content.includes('disconnected from server') || content.includes('Session was closed')) {
      return {
        timestamp,
        type: 'mission_end',
        data: {
          reason: 'disconnected'
        }
      };
    }

    // 6. Errores del sistema (pueden indicar crashes o problemas)
    if (content.includes('ERROR') && !content.includes('Can\'t open file') && !content.includes('texture')) {
      return {
        timestamp,
        type: 'other',
        data: {
          eventType: 'error',
          message: content
        }
      };
    }

    return null;
  }

  /**
   * Extrae el nombre de la misión del path del archivo
   */
  private extractMissionName(filePath: string): string {
    const parts = filePath.split(/[/\\]/);
    const fileName = parts[parts.length - 1];
    
    // Remover extensión y limpiar nombre
    return fileName
      .replace(/\.(trk|miz)$/i, '')
      .replace(/[-_]/g, ' ')
      .trim();
  }

  /**
   * Genera un resumen de todos los eventos parseados
   */
  private generateSummary(): ParsedLogSummary {
    const summary: ParsedLogSummary = {
      totalEvents: this.events.length,
      missions: 0,
      takeoffs: 0,
      landings: 0,
      shots: 0,
      hits: 0,
      kills: 0,
      deaths: 0,
      flightTime: 0,
      weaponStats: {},
      aircraftTypes: [],
      errors: this.errors
    };

    const aircraftSet = new Set<string>();
    let serverName: string | undefined;
    let missionCount = 0;
    let spawnCount = 0;

    for (const event of this.events) {
      switch (event.type) {
        case 'connection':
          if (event.data.serverName && !serverName) {
            serverName = event.data.serverName;
          }
          break;

        case 'mission_start':
          missionCount++;
          break;

        case 'spawn':
          spawnCount++;
          if (event.data.aircraftType) {
            aircraftSet.add(event.data.aircraftType);
          }
          break;

        case 'takeoff':
          summary.takeoffs++;
          break;

        case 'landing':
          summary.landings++;
          break;

        case 'shot':
          summary.shots++;
          if (event.data.weapon) {
            if (!summary.weaponStats[event.data.weapon]) {
              summary.weaponStats[event.data.weapon] = { shots: 0, hits: 0, kills: 0 };
            }
            summary.weaponStats[event.data.weapon].shots++;
          }
          break;

        case 'hit':
          summary.hits++;
          if (event.data.weapon && summary.weaponStats[event.data.weapon]) {
            summary.weaponStats[event.data.weapon].hits++;
          }
          break;

        case 'kill':
          summary.kills++;
          if (event.data.weapon && summary.weaponStats[event.data.weapon]) {
            summary.weaponStats[event.data.weapon].kills++;
          }
          break;

        case 'death':
          summary.deaths++;
          break;
      }
    }

    summary.missions = missionCount;
    summary.aircraftTypes = Array.from(aircraftSet);
    summary.serverName = serverName;

    // Para el log actual, inferimos que hubo al menos un vuelo si hay spawn
    if (spawnCount > 0) {
      // Estimamos takeoffs/landings basado en spawns y desconexiones
      summary.takeoffs = spawnCount;
      
      // Si hay desconexión normal, asumimos aterrizaje exitoso
      const normalDisconnects = this.events.filter(e => 
        e.type === 'mission_end' && e.data.reason === 'disconnected'
      ).length;
      summary.landings = Math.min(normalDisconnects, spawnCount);

      // Calcular tiempo de vuelo aproximado
      const firstSpawn = this.events.find(e => e.type === 'spawn');
      const lastDisconnect = this.events.filter(e => e.type === 'mission_end').pop();
      
      if (firstSpawn && lastDisconnect) {
        summary.flightTime = Math.floor((lastDisconnect.timestamp.getTime() - firstSpawn.timestamp.getTime()) / 1000);
      }
    }

    return summary;
  }

  /**
   * Calcula el hash SHA-256 del contenido del archivo para deduplicación
   */
  public static async calculateFileHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Valida si el contenido parece ser un log de DCS válido
   */
  public static validateDCSLog(content: string): { isValid: boolean; reason?: string } {
    if (!content || content.trim().length === 0) {
      return { isValid: false, reason: 'El archivo está vacío' };
    }

    // Buscar patrones típicos de DCS
    const dcsPatterns = [
      /DCS\/\d+\.\d+\.\d+/,  // Versión de DCS
      /EDCORE \(Main\)/,      // Logs del core de ED
      /APP \(Main\)/,         // Logs de la aplicación
      /ASYNCNET/,             // Logs de red
      /loadMission/,          // Carga de misión
      /spawnLocalPlayer/      // Spawn de jugador
    ];

    const hasValidPattern = dcsPatterns.some(pattern => pattern.test(content));
    
    if (!hasValidPattern) {
      return { 
        isValid: false, 
        reason: 'El archivo no parece ser un log de DCS World válido' 
      };
    }

    // Verificar formato de timestamp
    const timestampPattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/;
    if (!timestampPattern.test(content)) {
      return { 
        isValid: false, 
        reason: 'El formato de timestamps no es válido' 
      };
    }

    return { isValid: true };
  }
}

/**
 * Función utilitaria para formatear tiempo de vuelo
 */
export function formatFlightTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Función utilitaria para calcular accuracy
 */
export function calculateAccuracy(hits: number, shots: number): number {
  if (shots === 0) return 0;
  return Math.round((hits / shots) * 100 * 100) / 100; // 2 decimales
}
