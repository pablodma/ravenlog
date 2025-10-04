#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Función para aplicar AbortController a un archivo
function applyAbortController(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    
    // Verificar si ya tiene AbortController
    if (content.includes('AbortController') || content.includes('abortSignal')) {
      console.log(`✅ ${filePath} ya tiene AbortController`)
      return
    }
    
    // Patrón para encontrar useEffect con fetch
    const useEffectPattern = /useEffect\(\(\) => \{[\s\S]*?fetch[A-Za-z]+\(\)[\s\S]*?\}, \[\]\)/g
    
    if (useEffectPattern.test(content)) {
      console.log(`🔧 Aplicando AbortController a ${filePath}`)
      
      // Aquí iría la lógica para aplicar AbortController
      // Por ahora solo logueamos
      console.log(`📝 ${filePath} necesita AbortController`)
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message)
  }
}

// Función para encontrar todos los componentes que necesitan AbortController
function findComponentsNeedingAbortController(dir) {
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
          
          // Buscar patrones que indican que necesita AbortController
          const hasFetch = /fetch[A-Za-z]+\(\)/.test(content)
          const hasUseEffect = /useEffect\(/.test(content)
          const hasSupabase = /supabase\.from/.test(content)
          const noAbortController = !content.includes('AbortController')
          
          if (hasFetch && hasUseEffect && hasSupabase && noAbortController) {
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
const components = findComponentsNeedingAbortController(srcDir)

console.log('🔍 Componentes que necesitan AbortController:')
components.forEach(component => {
  console.log(`  - ${component}`)
  applyAbortController(component)
})

console.log(`\n✅ Encontrados ${components.length} componentes que necesitan AbortController`)




