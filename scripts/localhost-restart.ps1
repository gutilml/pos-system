<#
.SYNOPSIS
  Stop and/or clean-start all localhost services for this POS system.

.DESCRIPTION
  Manages:
    - Docker Compose Postgres (pos-postgres on host :5433)
    - Spring Boot backend (http://localhost:8080)
    - Vite frontend (http://localhost:5173)

  By default: stop anything already running for this repo, then start a fresh set.
  Backend and frontend open in new PowerShell windows so logs stay visible.

.PARAMETER StopOnly
  Only stop services; do not start them again.

.PARAMETER StartOnly
  Only start services (still waits for Postgres). Does not kill existing listeners first.

.PARAMETER ResetDb
  After Postgres is healthy, re-apply docs/database-schema.sql and docs/seed-data.sql.
  Destructive for demo data; leaves the Docker volume in place unless you remove it manually.

.EXAMPLE
  .\scripts\localhost-restart.ps1

.EXAMPLE
  .\scripts\localhost-restart.ps1 -StopOnly

.EXAMPLE
  .\scripts\localhost-restart.ps1 -ResetDb
#>
[CmdletBinding()]
param(
  [switch]$StopOnly,
  [switch]$StartOnly,
  [switch]$ResetDb
)

$ErrorActionPreference = 'Stop'

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$BackendDir = Join-Path $RepoRoot 'backend'
$FrontendDir = Join-Path $RepoRoot 'frontend'
$SchemaSql = Join-Path $RepoRoot 'docs\database-schema.sql'
$SeedSql = Join-Path $RepoRoot 'docs\seed-data.sql'

function Write-Step([string]$Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Get-Listeners([int[]]$Ports) {
  Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
    Where-Object { $Ports -contains $_.LocalPort } |
    Select-Object -Property LocalPort, OwningProcess -Unique
}

function Stop-PortListeners([int[]]$Ports) {
  $listeners = Get-Listeners -Ports $Ports
  foreach ($row in $listeners) {
    $proc = Get-Process -Id $row.OwningProcess -ErrorAction SilentlyContinue
    if (-not $proc) { continue }
    Write-Host "  Stopping PID $($row.OwningProcess) ($($proc.ProcessName)) on port $($row.LocalPort)"
    Stop-Process -Id $row.OwningProcess -Force -ErrorAction SilentlyContinue
  }
}

function Stop-PosJava {
  Get-CimInstance Win32_Process -Filter "Name = 'java.exe'" -ErrorAction SilentlyContinue |
    Where-Object {
      $_.CommandLine -and (
        $_.CommandLine -match [regex]::Escape($RepoRoot) -or
        $_.CommandLine -match 'pos-system' -or
        $_.CommandLine -match 'spring-boot:run' -or
        $_.CommandLine -match 'PosApplication'
      )
    } |
    ForEach-Object {
      Write-Host "  Stopping Java PID $($_.ProcessId)"
      Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
}

function Stop-PosNode {
  Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
    Where-Object {
      $_.CommandLine -and (
        $_.CommandLine -match [regex]::Escape((Join-Path $RepoRoot 'frontend')) -or
        ($_.CommandLine -match 'vite' -and $_.CommandLine -match 'pos-system')
      )
    } |
    ForEach-Object {
      Write-Host "  Stopping Node PID $($_.ProcessId)"
      Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
}

function Stop-All {
  Write-Step 'Stopping backend / frontend listeners'
  Stop-PortListeners -Ports @(8080, 5173)
  Stop-PosJava
  Stop-PosNode

  Write-Step 'Stopping Docker Postgres (pos-postgres)'
  docker stop pos-postgres 2>$null | Out-Null
  Push-Location $RepoRoot
  try {
    docker compose stop 2>$null | Out-Null
  } finally {
    Pop-Location
  }
}

function Start-Postgres {
  $existing = docker ps -aq --filter 'name=^pos-postgres$' 2>$null
  if ($existing) {
    Write-Host '  Starting existing container pos-postgres'
    docker start pos-postgres | Out-Null
    return
  }

  Write-Host '  Creating pos-postgres via docker compose'
  Push-Location $RepoRoot
  try {
    docker compose up -d
  } finally {
    Pop-Location
  }
}

function Wait-PostgresHealthy([int]$TimeoutSec = 90) {
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  do {
    $running = docker inspect -f '{{.State.Running}}' pos-postgres 2>$null
    $status = docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' pos-postgres 2>$null
    if ($running -eq 'true' -and ($status -eq 'healthy' -or $status -eq 'none')) {
      # Confirm accept connections even if health is still starting
      $ready = docker exec pos-postgres pg_isready -U pos -d pos 2>$null
      if ($LASTEXITCODE -eq 0) {
        Write-Host '  Postgres is ready'
        return
      }
    }
    Start-Sleep -Seconds 2
  } while ((Get-Date) -lt $deadline)

  throw "Postgres did not become ready within ${TimeoutSec}s (running=$running health=$status)"
}

function Invoke-SqlFile([string]$Path, [string]$Label) {
  if (-not (Test-Path $Path)) {
    throw "Missing SQL file: $Path"
  }
  Write-Host "  Applying $Label ($Path)"
  Get-Content -Raw $Path | docker exec -i pos-postgres psql -U pos -d pos | Out-Null
}

function Start-All {
  Write-Step 'Starting Docker Postgres'
  Start-Postgres
  Wait-PostgresHealthy

  if ($ResetDb) {
    Write-Step 'Resetting demo DB (schema + seed)'
    Invoke-SqlFile -Path $SchemaSql -Label 'schema'
    Invoke-SqlFile -Path $SeedSql -Label 'seed'
  }

  Write-Step 'Starting Spring Boot (new window) -> http://localhost:8080'
  Start-Process powershell -WorkingDirectory $BackendDir -ArgumentList @(
    '-NoExit',
    '-Command',
    "Write-Host 'POS backend - http://localhost:8080' -ForegroundColor Green; .\mvnw.cmd spring-boot:run"
  )

  Write-Step 'Starting Vite (new window) -> http://localhost:5173'
  Start-Process powershell -WorkingDirectory $FrontendDir -ArgumentList @(
    '-NoExit',
    '-Command',
    "Write-Host 'POS frontend - http://localhost:5173' -ForegroundColor Green; npm run dev"
  )

  Write-Host ''
  Write-Host 'Local stack starting:' -ForegroundColor Green
  Write-Host '  Postgres  http://localhost:5433  (container pos-postgres)'
  Write-Host '  Backend   http://localhost:8080'
  Write-Host '  Frontend  http://localhost:5173'
  Write-Host '  Login     admin/admin or cashier/cashier'
}

if ($StopOnly -and $StartOnly) {
  throw 'Use only one of -StopOnly or -StartOnly (or neither for full restart).'
}

if (-not $StartOnly) {
  Stop-All
}

if (-not $StopOnly) {
  Start-All
}

Write-Host ''
Write-Host 'Done.' -ForegroundColor Green
