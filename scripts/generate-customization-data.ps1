# Scanne assets/tags, assets/logos et assets/backgrounds/<categorie>, et
# regenere les listes TAGS, LOGOS et BACKGROUNDS dans
# js/customization-data.js. La liste FONTS de ce meme fichier n'est PAS
# touchee (elle reste a editer a la main) - ce script la relit telle quelle
# et la reinsere dans le fichier regenere.
#
# Pour ajouter un tag ou un logo : depose une image dans assets/tags/ ou
# assets/logos/, puis relance scripts/build.bat. Le nom affiche vient du nom
# du fichier (sans l'extension). Pour un tag, la couleur de texte par
# defaut est #14336b, sauf si tu ajoutes un fichier texte du meme nom a cote
# de l'image (ex: MonTag.txt a cote de MonTag.png) contenant une couleur hex
# (ex: #1a2b3c).
#
# Pour ajouter un background : depose une image dans
# assets/backgrounds/<tumbler|tasse|etui>/, puis relance scripts/build.bat.

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$imageExtensions = @(".png", ".jpg", ".jpeg", ".webp")
$categories = @("tumbler", "tasse", "etui")

function Js-String($s) {
    return $s -replace '\\', '\\\\' -replace '"', '\"'
}

function Get-Slug($name) {
    $slug = ($name -replace '[^a-zA-Z0-9]+', '-').ToLower().Trim('-')
    if ([string]::IsNullOrEmpty($slug)) { return "item" }
    return $slug
}

function Get-ImageFiles($dir) {
    if (-not (Test-Path $dir)) { return @() }
    return Get-ChildItem -Path $dir -File |
        Where-Object { $imageExtensions -contains $_.Extension.ToLower() } |
        Sort-Object Name
}

# --- TAGS (assets/tags/) ---
$tagsDir = Join-Path $root "assets\tags"
$tagEntries = New-Object System.Collections.Generic.List[string]
foreach ($f in (Get-ImageFiles $tagsDir)) {
    $name = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
    $id = Get-Slug $name
    $colorFile = Join-Path $tagsDir "$name.txt"
    $color = "#14336b"
    if (Test-Path $colorFile) {
        $c = Get-Content $colorFile -Raw -ErrorAction SilentlyContinue
        if ($c -and $c.Trim()) { $color = $c.Trim() }
    }
    $imgPath = "assets/tags/$($f.Name)" -replace " ", "%20"
    $tagEntries.Add("  { id: `"$id`", name: `"$(Js-String $name)`", image: `"$imgPath`", color: `"$color`" }")
}

# --- LOGOS (assets/logos/) ---
$logosDir = Join-Path $root "assets\logos"
$logoEntries = New-Object System.Collections.Generic.List[string]
foreach ($f in (Get-ImageFiles $logosDir)) {
    $name = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
    $id = Get-Slug $name
    $imgPath = "assets/logos/$($f.Name)" -replace " ", "%20"
    $logoEntries.Add("  { id: `"$id`", name: `"$(Js-String $name)`", image: `"$imgPath`" }")
}

# --- BACKGROUNDS (assets/backgrounds/<categorie>/) ---
$backgroundsLines = New-Object System.Collections.Generic.List[string]
foreach ($cat in $categories) {
    $catDir = Join-Path $root "assets\backgrounds\$cat"
    $catEntries = New-Object System.Collections.Generic.List[string]
    foreach ($f in (Get-ImageFiles $catDir)) {
        $name = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
        $id = Get-Slug $name
        $imgPath = "assets/backgrounds/$cat/$($f.Name)" -replace " ", "%20"
        $catEntries.Add("    { id: `"$id`", name: `"$(Js-String $name)`", image: `"$imgPath`" }")
    }
    if ($catEntries.Count -eq 0) {
        $backgroundsLines.Add("  $cat`: []")
    } else {
        $inner = [string]::Join(",`r`n", $catEntries)
        $backgroundsLines.Add("  $cat`: [`r`n$inner`r`n  ]")
    }
}

# --- FONTS : preserve la section existante telle quelle ---
$outFile = Join-Path $root "js\customization-data.js"
$defaultFonts = @"
const FONTS = [
  { id: "barlow-condensed", label: "Barlow Condensed", family: "'Barlow Condensed', sans-serif", weight: 700 },
  { id: "anton", label: "Anton", family: "'Anton', sans-serif", weight: 400 },
  { id: "oswald", label: "Oswald", family: "'Oswald', sans-serif", weight: 700 },
  { id: "archivo-black", label: "Archivo Black", family: "'Archivo Black', sans-serif", weight: 400 },
  { id: "teko", label: "Teko", family: "'Teko', sans-serif", weight: 700 },
  { id: "bebas-neue", label: "Bebas Neue", family: "'Bebas Neue', sans-serif", weight: 400 },
  { id: "roboto-condensed", label: "Roboto Condensed", family: "'Roboto Condensed', sans-serif", weight: 700 },
  { id: "montserrat", label: "Montserrat", family: "'Montserrat', sans-serif", weight: 700 },
  { id: "black-ops-one", label: "Black Ops One", family: "'Black Ops One', sans-serif", weight: 400 },
  { id: "russo-one", label: "Russo One", family: "'Russo One', sans-serif", weight: 400 }
];
"@

$fontsBlock = $defaultFonts
if (Test-Path $outFile) {
    $existing = Get-Content $outFile -Raw
    $match = [regex]::Match($existing, "const FONTS = \[[\s\S]*?\];")
    if ($match.Success) { $fontsBlock = $match.Value }
}

$header = @"
/*
  Ce fichier est en partie genere automatiquement par
  scripts/generate-customization-data.ps1 (lance via scripts/build.bat) :
  les listes BACKGROUNDS, TAGS et LOGOS viennent des dossiers
  assets/backgrounds/<categorie>/, assets/tags/ et assets/logos/ - NE LES
  EDITE PAS A LA MAIN, tes changements seraient ecrases. Pour en ajouter ou
  en retirer, depose/supprime simplement le fichier image correspondant et
  relance scripts/build.bat.

  La liste FONTS ci-dessous N'EST PAS generee - modifie-la ici directement.
  Ajoute une entree avec un nom Google Fonts valide (voir fonts.google.com)
  et son family CSS correspondant, puis ajoute aussi le lien Google Fonts
  dans index.html pour inclure la nouvelle police.

  Le tag et le logo sont deux elements graphiques DISTINCTS sur le site : le
  client peut activer l'un, l'autre, les deux ou aucun des deux, chacun avec
  sa propre position et sa propre taille (curseurs sur le site).

  Pour un tag, la couleur de texte par defaut vient d'un fichier texte de
  meme nom a cote de l'image (ex: MonTag.txt pour MonTag.png) contenant une
  couleur hex ; sans ce fichier, #14336b est utilise.
*/
"@

$content = $header + "`r`n"
$content += "const BACKGROUNDS = {`r`n" + [string]::Join(",`r`n", $backgroundsLines) + "`r`n};`r`n`r`n"
if ($tagEntries.Count -eq 0) {
    $content += "const TAGS = [`r`n];`r`n`r`n"
} else {
    $content += "const TAGS = [`r`n" + [string]::Join(",`r`n", $tagEntries) + "`r`n];`r`n`r`n"
}
if ($logoEntries.Count -eq 0) {
    $content += "const LOGOS = [`r`n];`r`n`r`n"
} else {
    $content += "const LOGOS = [`r`n" + [string]::Join(",`r`n", $logoEntries) + "`r`n];`r`n`r`n"
}
$content += $fontsBlock + "`r`n"

Set-Content -Path $outFile -Value $content -Encoding UTF8

Write-Host "Tags : $($tagEntries.Count), Logos : $($logoEntries.Count)"
foreach ($cat in $categories) {
    $catDir = Join-Path $root "assets\backgrounds\$cat"
    $count = (Get-ImageFiles $catDir).Count
    Write-Host "Backgrounds [$cat] : $count"
}
Write-Host "Fichier ecrit : $outFile"
