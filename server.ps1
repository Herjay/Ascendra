# Minimal zero-dependency local static file server for Windows PowerShell
param(
    [int]$Port = 8080,
    [string]$Directory = $PSScriptRoot
)

if (-not $Directory) { $Directory = Get-Location }

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host "  Ascendra - Local Offline Server" -ForegroundColor Green
    Write-Host "  URL: $prefix" -ForegroundColor Yellow
    Write-Host "  Serving files from: $Directory" -ForegroundColor Gray
    Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host "========================================================" -ForegroundColor Cyan
} catch {
    Write-Error "Failed to start listener on $prefix : $_"
    exit 1
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".ico"  = "image/x-icon"
    ".webp" = "image/webp"
    ".webmanifest" = "application/manifest+json"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawPath = $request.Url.AbsolutePath

        if ($request.HttpMethod -eq "POST" -and $rawPath -eq "/save_test_result") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $postData = $reader.ReadToEnd()
            [System.IO.File]::WriteAllText((Join-Path $Directory "test_run_result.txt"), $postData, [System.Text.Encoding]::UTF8)
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.StatusCode = 200
            $okBytes = [System.Text.Encoding]::UTF8.GetBytes("OK")
            $response.OutputStream.Write($okBytes, 0, $okBytes.Length)
            $response.OutputStream.Close()
            continue
        }

        $localPath = $rawPath.TrimStart('/') -replace '/', '\'
        if ([string]::IsNullOrWhiteSpace($localPath)) {
            $localPath = "index.html"
        }

        $filePath = Join-Path $Directory $localPath

        # Add CORS and PWA friendly headers
        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Service-Worker-Allowed", "/")
        $response.Headers.Add("Cache-Control", "no-cache")

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "application/octet-stream"
            if ($mimeTypes.ContainsKey($ext)) {
                $contentType = $mimeTypes[$ext]
            }
            $response.ContentType = $contentType

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawPath")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # ignore client disconnects
    }
}
