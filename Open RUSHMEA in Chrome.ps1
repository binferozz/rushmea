$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npm) {
    throw "Node.js and npm are required. Install Node.js, then try again."
}
if (-not (Test-Path (Join-Path $projectRoot "node_modules\vite"))) {
    throw "Project dependencies are missing. Open this folder in a terminal and run: npm install"
}

$chromeCandidates = @(
    (Join-Path $env:ProgramFiles "Google\Chrome\Application\chrome.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "Google\Chrome\Application\chrome.exe"),
    (Join-Path $env:LOCALAPPDATA "Google\Chrome\Application\chrome.exe")
)
$chrome = $chromeCandidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $chrome) {
    throw "Google Chrome was not found. Install Chrome, then run this launcher again."
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
$listener.Start()
$port = $listener.LocalEndpoint.Port
$listener.Stop()
$url = "http://127.0.0.1:$port/"

$arguments = "run dev -- --host 127.0.0.1 --port $port --strictPort"
Start-Process -FilePath $npm.Source -ArgumentList $arguments -WorkingDirectory $projectRoot

$deadline = (Get-Date).AddSeconds(30)
$ready = $false
while ((Get-Date) -lt $deadline) {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200 -and $response.Content.Contains("RUSHMEA")) {
            $ready = $true
            break
        }
    } catch {
        Start-Sleep -Milliseconds 500
    }
}

if (-not $ready) {
    throw "The RUSHMEA server did not start within 30 seconds. Check Node.js and the project dependencies."
}

Start-Process -FilePath $chrome -ArgumentList $url
Write-Host "RUSHMEA is open in Chrome at $url"
