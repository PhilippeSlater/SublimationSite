# Scanne templates/tumbler, templates/tasse et templates/etui, et regenere
# js/products-data.js a partir des photos trouvees.
#
# Structure attendue par produit :
#   templates/<categorie>/<NomDuModele_Prix>/photos/0001.jpg, 0002.jpg, ...
#     (tes photos finies, deposees directement - aucun traitement)
#     Le dossier "photo" (singulier) fonctionne aussi, au cas ou.
#   templates/<categorie>/<NomDuModele_Prix>/wrap.*   (optionnel - le design
#     plat seul, ajoute tel quel en premiere image de la galerie)
#
# Convention de nommage du DOSSIER produit :
#   NomDuModele_Prix   ex: Vagues-Bleues_24.99
#   NomDuModele        (sans prix -> affichera "Prix sur demande")

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$categories = @("tumbler", "tasse", "etui")
$wrapExtensions = @(".jpg", ".jpeg", ".png", ".webp")

function Get-NameAndPrice($folderName) {
    $lastUnderscore = $folderName.LastIndexOf("_")
    if ($lastUnderscore -ge 0) {
        $possiblePrice = $folderName.Substring($lastUnderscore + 1)
        $price = $null
        if ([double]::TryParse($possiblePrice, [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$price)) {
            $namePart = $folderName.Substring(0, $lastUnderscore)
            $name = ($namePart -replace "[-_]", " ").Trim()
            return @{ name = $name; price = $price }
        }
    }
    $name = ($folderName -replace "[-_]", " ").Trim()
    return @{ name = $name; price = $null }
}

function Js-String($s) {
    return $s -replace '\\', '\\\\' -replace '"', '\"'
}

$entries = New-Object System.Collections.Generic.List[string]
$totalFound = 0

foreach ($cat in $categories) {
    $catDir = Join-Path $root "templates\$cat"
    if (-not (Test-Path $catDir)) { continue }

    $productDirs = Get-ChildItem -Path $catDir -Directory | Sort-Object Name
    $countThisCategory = 0

    $i = 0
    foreach ($productDir in $productDirs) {
        # Accepte le dossier "photos" (recommande) ou "photo" (au singulier,
        # une faute de frappe facile a faire) - les deux sont scannes.
        $photoFiles = @()
        foreach ($folderName in @("photos", "photo")) {
            $dir = Join-Path $productDir.FullName $folderName
            if (Test-Path $dir) {
                $filesHere = Get-ChildItem -Path $dir -File |
                    Where-Object { $wrapExtensions -contains $_.Extension.ToLower() } |
                    Sort-Object Name |
                    ForEach-Object { [PSCustomObject]@{ Name = $_.Name; Folder = $folderName } }
                $photoFiles += $filesHere
            }
        }

        $wrapFile = $null
        foreach ($ext in $wrapExtensions) {
            $candidate = Join-Path $productDir.FullName "wrap$ext"
            if (Test-Path $candidate) { $wrapFile = Get-Item $candidate; break }
        }

        if ($photoFiles.Count -eq 0 -and -not $wrapFile) {
            Write-Host "[$cat/$($productDir.Name)] pas encore de photos/ ni de wrap, ignore."
            continue
        }

        $i++
        $info = Get-NameAndPrice $productDir.Name
        $id = "$cat-$i-$(($info.name -replace '[^a-zA-Z0-9]+','-').ToLower().Trim('-'))"
        $priceJs = if ($null -ne $info.price) { $info.price.ToString([System.Globalization.CultureInfo]::InvariantCulture) } else { "null" }

        $imagePaths = @()
        $wrapJsPath = "null"
        if ($wrapFile) {
            $wrapRel = "templates/$cat/$($productDir.Name)/$($wrapFile.Name)" -replace " ", "%20"
            $imagePaths += $wrapRel
            $wrapJsPath = "`"$wrapRel`""
        }
        foreach ($f in $photoFiles) {
            $imagePaths += "templates/$cat/$($productDir.Name)/$($f.Folder)/$($f.Name)" -replace " ", "%20"
        }
        $photosJs = [string]::Join(",`r`n", ($imagePaths | ForEach-Object { "      `"$_`"" }))

        $entries.Add(@"
  {
    id: "$id",
    category: "$cat",
    name: "$(Js-String $info.name)",
    price: $priceJs,
    wrap: $wrapJsPath,
    photos: [
$photosJs
    ]
  }
"@)
        $countThisCategory++
        $totalFound++
    }

    Write-Host "[$cat] $countThisCategory produit(s) pret(s)"
}

$outFile = Join-Path $root "js\products-data.js"

$header = @"
/*
  Ce fichier est genere automatiquement par scripts/generate-catalog.ps1
  (lance via scripts/build.bat).

  NE PAS EDITER A LA MAIN - tes changements seraient ecrases
  au prochain lancement du script.

  Pour ajouter un produit :
    1. Cree templates/<categorie>/<NomDuModele_Prix>/photos/ et mets tes photos.
    2. (optionnel) Ajoute templates/<categorie>/<NomDuModele_Prix>/wrap.png
       pour montrer aussi le design plat seul.
    3. Lance scripts/build.bat (il regenere ce fichier).
  Voir README.md.
*/

const PRODUCTS = [
"@

$footer = @"

];
"@

if ($entries.Count -eq 0) {
    $body = ""
} else {
    $body = [string]::Join(",`r`n", $entries)
}

$content = $header + $body + $footer
Set-Content -Path $outFile -Value $content -Encoding UTF8

Write-Host ""
Write-Host "Catalogue regenere : $totalFound produit(s) au total."
Write-Host "Fichier ecrit : $outFile"
