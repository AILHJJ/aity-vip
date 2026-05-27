# AITY VIP Quick Start Script (Windows Version)
# For starting development environment frontend and backend services

$ErrorActionPreference = "Stop"

# Color output functions
function Write-Green {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Yellow {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Yellow
}

function Write-Red {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

# Check if port is occupied
function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new($Port)
        $listener.Start()
        $listener.Stop()
        return $false
    } catch {
        return $true
    }
}

# Kill process by port
function Kill-ProcessByPort {
    param([int]$Port)
    try {
        $processes = netstat -ano | findstr ":$Port"
        if ($processes) {
            foreach ($process in $processes) {
                $pid = $process.Split(' ')[-1]
                if ($pid -match '^\d+$') {
                    Write-Yellow "  Killing process $pid occupying port $Port..."
                    taskkill /PID $pid /F 2>$null
                }
            }
        }
        return $true
    } catch {
        Write-Red "  Error killing process: $($_.Exception.Message)"
        return $false
    }
}

# Wait for port to be free
function Wait-PortFree {
    param([int]$Port, [int]$Timeout = 10)
    $startTime = Get-Date
    while ((Get-Date) -lt $startTime.AddSeconds($Timeout)) {
        if (-not (Test-Port -Port $Port)) {
            return $true
        }
        Start-Sleep -Milliseconds 500
    }
    return $false
}

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Yellow "Starting AITY VIP development environment..."
Write-Yellow "Project path: $ProjectRoot"

# Define service ports
$BackendPort = 3001
$FrontendPort = 5173

# Check and kill processes occupying ports
Write-Yellow "`n[0/2] Checking port occupancy..."

# Check backend port
if (Test-Port -Port $BackendPort) {
    Write-Yellow "  Backend port $BackendPort is occupied, trying to kill process..."
    Kill-ProcessByPort -Port $BackendPort
    if (Wait-PortFree -Port $BackendPort) {
        Write-Green "  Backend port $BackendPort is now free!"
    } else {
        Write-Red "  Backend port $BackendPort could not be freed, please kill process manually!"
    }
} else {
    Write-Green "  Backend port $BackendPort is available"
}

# Check frontend port
if (Test-Port -Port $FrontendPort) {
    Write-Yellow "  Frontend port $FrontendPort is occupied, trying to kill process..."
    Kill-ProcessByPort -Port $FrontendPort
    if (Wait-PortFree -Port $FrontendPort) {
        Write-Green "  Frontend port $FrontendPort is now free!"
    } else {
        Write-Red "  Frontend port $FrontendPort could not be freed, please kill process manually!"
    }
} else {
    Write-Green "  Frontend port $FrontendPort is available"
}

# 1. Start backend service
Write-Yellow "`n[1/2] Starting backend service..."
$BackendDir = Join-Path $ProjectRoot "backend"
Set-Location $BackendDir

Write-Yellow "  Installing backend dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Red "Backend dependency installation failed!"
    exit 1
}
Write-Green "  Backend dependencies installed successfully!"

Write-Yellow "  Starting backend service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir'; npm run dev"
Write-Green "  Backend service started in new window!"

# Wait for backend to start
Write-Yellow "  Waiting for backend service to start..."
Start-Sleep -Seconds 3

# 2. Start frontend service
Write-Yellow "`n[2/2] Starting frontend service..."
$FrontendDir = Join-Path $ProjectRoot "frontend"
Set-Location $FrontendDir

Write-Yellow "  Installing frontend dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Red "Frontend dependency installation failed!"
    exit 1
}
Write-Green "  Frontend dependencies installed successfully!"

Write-Yellow "  Starting frontend service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendDir'; npm run dev"
Write-Green "  Frontend service started in new window!"

Write-Green "`n🎉 AITY VIP development environment started successfully!"
Write-Green "Frontend development server address: http://localhost:5173"
Write-Green "Backend development server address: http://localhost:3001"
Write-Yellow "`nNote: Closing this window will not stop the services, please close the frontend and backend service windows to stop the services"
