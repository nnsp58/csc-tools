$directory = "D:\tools-hub\Tool-fixed"
$files = Get-ChildItem -Path $directory -Filter *.html | Where-Object { $_.Name -notin @('footer.html', 'google1c013f134b4f04d7.html') }
$insertLines = @(
    '    <link rel="preconnect" href="https://cdnjs.cloudflare.com">',
    '    <link rel="preconnect" href="https://jsdelivr.net">',
    '    <link rel="preconnect" href="https://pagead2.googlesyndication.com">',
    '    <link rel="dns-prefetch" href="https://www.google-analytics.com">'
)
$updatedCount = 0
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    if ($content -like '*cdnjs.cloudflare.com*') {
        Write-Host "Skipping $($file.Name) - already contains preconnect tags"
        continue
    }
    $lines = Get-Content -Path $file.FullName
    $newLines = @()
    $inserted = $false
    foreach ($line in $lines) {
        $newLines += $line
        if (-not $inserted -and $line -match 'meta[^>]*viewport') {
            $newLines += $insertLines
            $inserted = $true
        }
    }
    if ($inserted) {
        $newLines | Set-Content -Path $file.FullName -Encoding UTF8
        $updatedCount++
        Write-Host "Updated $($file.Name)"
    } else {
        Write-Host "Warning: No viewport meta found in $($file.Name)"
    }
}
Write-Output "Updated $updatedCount files"
