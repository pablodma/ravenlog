# Script de PowerShell para verificar Supabase
Write-Host "🔍 Verificando configuración de Supabase..." -ForegroundColor Cyan
Write-Host ""

# Verificar si el archivo .env.local existe
if (Test-Path ".env.local") {
    Write-Host "✅ Archivo .env.local encontrado" -ForegroundColor Green
    
    # Leer el archivo .env.local
    $envContent = Get-Content ".env.local"
    Write-Host "📋 Contenido del archivo .env.local:" -ForegroundColor Yellow
    foreach ($line in $envContent) {
        if ($line -match "NEXT_PUBLIC_SUPABASE") {
            if ($line -match "URL") {
                Write-Host "  NEXT_PUBLIC_SUPABASE_URL: ✅ Configurado" -ForegroundColor Green
                $url = $line -split "=" | Select-Object -Last 1
                Write-Host "    URL: $url" -ForegroundColor Gray
            }
            if ($line -match "ANON_KEY") {
                Write-Host "  NEXT_PUBLIC_SUPABASE_ANON_KEY: ✅ Configurado" -ForegroundColor Green
                $key = $line -split "=" | Select-Object -Last 1
                Write-Host "    Key: $($key.Substring(0, [Math]::Min(20, $key.Length)))..." -ForegroundColor Gray
            }
        }
    }
} else {
    Write-Host "❌ Archivo .env.local no encontrado" -ForegroundColor Red
    Write-Host "💡 Crea el archivo .env.local con las siguientes variables:" -ForegroundColor Yellow
    Write-Host "   NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui" -ForegroundColor Gray
    Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "🔗 Probando conexión con Supabase..." -ForegroundColor Cyan

# Cargar variables de entorno desde .env.local
$envContent = Get-Content ".env.local"
foreach ($line in $envContent) {
    if ($line -match "^([^#][^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

# Verificar que las variables estén cargadas
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY

if ($supabaseUrl -and $supabaseKey) {
    Write-Host "✅ Variables de entorno cargadas correctamente" -ForegroundColor Green
    
    # Probar conexión HTTP básica
    try {
        Write-Host "🌐 Probando conectividad HTTP..." -ForegroundColor Yellow
        $response = Invoke-WebRequest -Uri $supabaseUrl -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Servidor Supabase accesible" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Servidor respondió con código: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ No se pudo conectar al servidor Supabase" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Variables de entorno no cargadas correctamente" -ForegroundColor Red
}
