# Petit serveur web local, sans dépendance externe (juste PowerShell/.NET),
# pour prévisualiser le site sur http://localhost au lieu de l'ouvrir en
# double-clic (file://).
#
# Pourquoi c'est nécessaire : Chrome bloque la lecture des pixels d'une image
# locale dans un <canvas> quand la page est ouverte en file:// ("canvas
# tainted by cross-origin data"). Or c'est exactement ce que fait le preview
# 360° pour fusionner ton design avec les photos de assets/base/ (tumbler.jpg,
# bouchon.jpg, etc.) — sans serveur, cette fusion échoue silencieusement et
# le preview retombe sur l'apparence par défaut, même si tes photos sont bien
# au bon endroit.

$port = 8080
$root = Split-Path -Parent $PSScriptRoot

$mimeTypes = @{
  ".html" = "text/html"; ".js" = "application/javascript"; ".css" = "text/css";
  ".png"  = "image/png"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg";
  ".webp" = "image/webp"; ".svg" = "image/svg+xml"; ".txt" = "text/plain";
  ".json" = "application/json"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
} catch {
    Write-Host "Impossible de demarrer le serveur sur le port $port (deja utilise ?)."
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "Site disponible sur http://localhost:$port/"
Write-Host "Laisse cette fenetre ouverte pendant que tu regardes le site."
Write-Host "Ferme cette fenetre (ou Ctrl+C) pour arreter le serveur."
Write-Host ""

Start-Process "http://localhost:$port/index.html"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    try {
        $relPath = [Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart('/'))
        if ([string]::IsNullOrEmpty($relPath)) { $relPath = "index.html" }
        $filePath = Join-Path $root $relPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = $mimeTypes[$ext]
            if (-not $contentType) { $contentType = "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
    } catch {
        $response.StatusCode = 500
    } finally {
        $response.OutputStream.Close()
    }
}
