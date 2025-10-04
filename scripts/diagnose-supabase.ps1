# Script de diagnóstico avanzado para Supabase
Write-Host "🔍 Diagnóstico Avanzado de Supabase" -ForegroundColor Cyan
Write-Host ""

# Cargar variables de entorno
$envContent = Get-Content ".env.local"
foreach ($line in $envContent) {
    if ($line -match "^([^#][^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY

Write-Host "📋 Configuración actual:" -ForegroundColor Yellow
Write-Host "  URL: $supabaseUrl" -ForegroundColor Gray
Write-Host "  Key: $($supabaseKey.Substring(0, [Math]::Min(30, $supabaseKey.Length)))..." -ForegroundColor Gray
Write-Host ""

# Test 1: Verificar estructura de la URL
Write-Host "🔍 Test 1: Verificando estructura de URL..." -ForegroundColor Yellow
if ($supabaseUrl -match "^https://([a-zA-Z0-9-]+)\.supabase\.co$") {
    $projectId = $matches[1]
    Write-Host "  ✅ URL válida de Supabase" -ForegroundColor Green
    Write-Host "  📝 Project ID: $projectId" -ForegroundColor Gray
} else {
    Write-Host "  ❌ URL no válida de Supabase" -ForegroundColor Red
    Write-Host "  💡 Debe ser: https://[project-id].supabase.co" -ForegroundColor Yellow
}

# Test 2: Probar diferentes endpoints
Write-Host ""
Write-Host "🔍 Test 2: Probando diferentes endpoints..." -ForegroundColor Yellow

$endpoints = @(
    @{ Name = "Base URL"; Url = $supabaseUrl },
    @{ Name = "Health Check"; Url = "$supabaseUrl/health" },
    @{ Name = "REST API"; Url = "$supabaseUrl/rest/v1/" },
    @{ Name = "Auth API"; Url = "$supabaseUrl/auth/v1/" },
    @{ Name = "Storage API"; Url = "$supabaseUrl/storage/v1/" }
)

foreach ($endpoint in $endpoints) {
    Write-Host "  🔗 Probando $($endpoint.Name): $($endpoint.Url)" -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method GET -TimeoutSec 10 -ErrorAction Stop
        Write-Host "    ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        if ($response.Headers.ContainsKey('X-Supabase-Project-Id')) {
            Write-Host "    📝 Project ID en headers: $($response.Headers['X-Supabase-Project-Id'])" -ForegroundColor Gray
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "    ❌ Error: $statusCode - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Probar con headers de autenticación
Write-Host ""
Write-Host "🔍 Test 3: Probando con autenticación..." -ForegroundColor Yellow
try {
    $headers = @{
        'apikey' = $supabaseKey
        'Authorization' = "Bearer $supabaseKey"
        'Content-Type' = 'application/json'
    }
    
    $response = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/" -Method GET -Headers $headers -TimeoutSec 10 -ErrorAction Stop
    Write-Host "  ✅ REST API accesible con autenticación" -ForegroundColor Green
    Write-Host "  📝 Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "  ❌ Error con autenticación: $statusCode" -ForegroundColor Red
    Write-Host "  💡 Detalles: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 4: Verificar si el proyecto está activo
Write-Host ""
Write-Host "🔍 Test 4: Verificando estado del proyecto..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/" -Method OPTIONS -TimeoutSec 10 -ErrorAction Stop
    Write-Host "  ✅ Proyecto parece estar activo" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Proyecto podría estar inactivo o suspendido" -ForegroundColor Red
    Write-Host "  💡 Verifica en el dashboard de Supabase si el proyecto está activo" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Resumen del diagnóstico:" -ForegroundColor Cyan
Write-Host "  • Si todos los tests fallan con 404, el proyecto podría estar suspendido" -ForegroundColor Yellow
Write-Host "  • Si solo algunos fallan, podría ser un problema de configuración" -ForegroundColor Yellow
Write-Host "  • Si el REST API funciona con autenticación, la conexión debería funcionar" -ForegroundColor Yellow
