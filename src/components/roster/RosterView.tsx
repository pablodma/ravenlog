'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Shield, Star, Users, ChevronDown, ChevronUp } from 'lucide-react'

interface PersonnelMember {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  role: string
  rank?: {
    id: string
    name: string
    abbreviation: string
    order: number
    image_url?: string
  }
  unit?: {
    id: string
    name: string
    description: string
    unit_type: string
    callsign?: string
    group_id?: string
  }
  position?: {
    id: string
    name: string
    description?: string
    color: string
    is_leadership: boolean
  }
}

interface Group {
  id: string
  name: string
  description?: string
  color: string
  display_order: number
}

interface UnitGroup {
  unit: {
    id: string
    name: string
    description: string
    unit_type: string
    callsign?: string
    group_id?: string
  }
  members: PersonnelMember[]
}

export default function RosterView() {
  const [personnel, setPersonnel] = useState<PersonnelMember[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Obtener grupos
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (groupsError) throw groupsError
      setGroups(groupsData || [])
      
      // Establecer el primer grupo como activo si hay grupos
      if (groupsData && groupsData.length > 0) {
        setActiveGroup(groupsData[0].id)
      }

      // Obtener personal
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          role,
          rank:ranks!rank_id(id, name, abbreviation, order, image_url),
          unit:units!unit_id(id, name, description, unit_type, callsign, group_id),
          position:unit_positions!position_id(id, name, description, color, is_leadership)
        `)
        .eq('role', 'personnel')
        .order('full_name')

      if (error) throw error
      setPersonnel(data || [])
      
      // Expandir todas las unidades por defecto
      const unitIds = new Set(data?.filter(p => p.unit).map(p => p.unit!.id))
      setExpandedUnits(unitIds)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev)
      if (newSet.has(unitId)) {
        newSet.delete(unitId)
      } else {
        newSet.add(unitId)
      }
      return newSet
    })
  }

  // Filtrar personal por grupo activo (si hay grupos)
  const filteredPersonnel = groups.length > 0 && activeGroup
    ? personnel.filter(p => p.unit?.group_id === activeGroup || !p.unit?.group_id)
    : personnel

  // Agrupar personal por unidad
  const groupedByUnit: UnitGroup[] = []
  const unassigned: PersonnelMember[] = []

  filteredPersonnel.forEach(member => {
    if (member.unit) {
      let unitGroup = groupedByUnit.find(g => g.unit.id === member.unit!.id)
      if (!unitGroup) {
        unitGroup = {
          unit: member.unit,
          members: []
        }
        groupedByUnit.push(unitGroup)
      }
      unitGroup.members.push(member)
    } else {
      unassigned.push(member)
    }
  })

  // Ordenar unidades alfabéticamente
  groupedByUnit.sort((a, b) => a.unit.name.localeCompare(b.unit.name))

  // Ordenar miembros dentro de cada unidad por rango
  groupedByUnit.forEach(group => {
    group.members.sort((a, b) => {
      if (!a.rank || !b.rank) return 0
      return a.rank.order - b.rank.order
    })
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Roster de Personal</h1>
        <p className="text-gray-600">Listado completo del personal de la organización</p>
      </div>

      {/* Pestañas por grupo (solo si hay más de un grupo) */}
      {groups.length > 1 && (
        <div className="bg-white border rounded-lg">
          <div className="flex border-b">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeGroup === group.id
                    ? 'border-b-2 text-gray-900 bg-gray-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                style={{
                  borderBottomColor: activeGroup === group.id ? group.color : 'transparent',
                  borderBottomWidth: activeGroup === group.id ? '2px' : '0'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <span>{group.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {groupedByUnit.map((group) => {
          const isExpanded = expandedUnits.has(group.unit.id)
          
          return (
            <div key={group.unit.id} className="bg-white border rounded-lg overflow-hidden">
              {/* Encabezado de unidad */}
              <button
                onClick={() => toggleUnit(group.unit.id)}
                className="w-full px-6 py-4 bg-gray-800 text-white flex items-center justify-between hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">{group.unit.name}</h3>
                    {group.unit.callsign && (
                      <p className="text-sm text-gray-300">
                        Callsign: <span className="font-mono">{group.unit.callsign}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-300">{group.members.length} miembros</span>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </button>

              {/* Lista de miembros */}
              {isExpanded && (
                <div className="divide-y divide-gray-100">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        {/* Info del miembro */}
                        <div className="flex items-center gap-4 flex-1">
                          {/* Avatar/Rango */}
                          <div className="flex-shrink-0">
                            {member.rank?.image_url ? (
                              <img
                                src={member.rank.image_url}
                                alt={member.rank.name}
                                className="w-12 h-12 object-contain"
                                title={member.rank.name}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <Star className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                          </div>

                          {/* Nombre y rango */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {member.rank && (
                                <span className="text-sm font-medium text-gray-700">
                                  {member.rank.abbreviation}
                                </span>
                              )}
                              <h4 className="font-semibold text-gray-900 truncate">
                                {member.full_name}
                              </h4>
                            </div>
                            {member.rank && (
                              <p className="text-xs text-gray-500">{member.rank.name}</p>
                            )}
                          </div>

                          {/* Posición */}
                          <div className="flex-shrink-0 min-w-[200px] text-right">
                            {member.position ? (
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: member.position.color }}
                                />
                                {member.position.is_leadership && (
                                  <Shield className="h-3 w-3 text-yellow-600" />
                                )}
                                <span className="text-sm font-medium text-gray-800">
                                  {member.position.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Sin posición asignada</span>
                            )}
                          </div>

                          {/* Estado */}
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                              Active Duty
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Personal sin unidad asignada */}
        {unassigned.length > 0 && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-100 border-b">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Sin Unidad Asignada</h3>
                <span className="text-sm text-gray-500">({unassigned.length})</span>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {unassigned.map((member) => (
                <div
                  key={member.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{member.full_name}</h4>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {personnel.length === 0 && (
          <div className="bg-white border rounded-lg p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay personal activo
            </h3>
            <p className="text-gray-600">
              Aún no hay miembros del personal registrados en el sistema.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

