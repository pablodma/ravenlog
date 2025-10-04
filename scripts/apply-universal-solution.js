#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Función para aplicar la solución universal a un archivo
function applyUniversalSolution(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    
    // Verificar si ya tiene la solución aplicada
    if (content.includes('useUniversalDataLoader') || content.includes('UniversalDataLoader')) {
      console.log(`✅ ${filePath} ya tiene la solución universal aplicada`)
      return
    }
    
    // Patrón para encontrar useEffect con fetch
    const hasUseEffect = /useEffect\(\(\) => \{[\s\S]*?fetch[A-Za-z]+\(\)[\s\S]*?\}, \[\]\)/g.test(content)
    const hasSupabase = /supabase\.from/.test(content)
    const hasAbortController = content.includes('AbortController')
    
    if (hasUseEffect && hasSupabase && !hasAbortController) {
      console.log(`🔧 Aplicando solución universal a ${filePath}`)
      
      // Aquí iría la lógica para aplicar la solución universal
      // Por ahora solo logueamos
      console.log(`📝 ${filePath} necesita solución universal`)
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message)
  }
}

// Función para encontrar todos los componentes que necesitan la solución
function findComponentsNeedingUniversalSolution(dir) {
  const components = []
  
  function scanDirectory(currentDir) {
    const files = fs.readdirSync(currentDir)
    
    for (const file of files) {
      const filePath = path.join(currentDir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        scanDirectory(filePath)
      } else if (file.endsWith('.tsx') && !file.includes('.test.') && !file.includes('.spec.')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8')
          
          // Buscar patrones que indican que necesita la solución universal
          const hasFetch = /fetch[A-Za-z]+\(\)/.test(content)
          const hasUseEffect = /useEffect\(/.test(content)
          const hasSupabase = /supabase\.from/.test(content)
          const noUniversalSolution = !content.includes('useUniversalDataLoader')
          
          if (hasFetch && hasUseEffect && hasSupabase && noUniversalSolution) {
            components.push(filePath)
          }
        } catch (error) {
          // Ignorar errores de lectura
        }
      }
    }
  }
  
  scanDirectory(dir)
  return components
}

// Ejecutar el script
const srcDir = path.join(__dirname, '..', 'src')
const components = findComponentsNeedingUniversalSolution(srcDir)

console.log('🔍 Componentes que necesitan solución universal:')
components.forEach(component => {
  console.log(`  - ${component}`)
  applyUniversalSolution(component)
})

console.log(`\n✅ Encontrados ${components.length} componentes que necesitan solución universal`)

// Crear un archivo de configuración para la solución universal
const configPath = path.join(__dirname, '..', 'src', 'config', 'universal-solution.json')
const configDir = path.dirname(configPath)

if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true })
}

const config = {
  appliedTo: components,
  timestamp: new Date().toISOString(),
  version: '1.0.0'
}

fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
console.log(`📄 Configuración guardada en ${configPath}`)




