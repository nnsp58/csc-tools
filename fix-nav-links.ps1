# Fix all tool pages to have a consistent nav with About + Contact links
$toolPages = @(
    "audio-converter.html",
    "document-format-converter.html",
    "file-compressor.html",
    "group-photo-maker.html",
    "image-compress.html",
    "image-format-converter.html",
    "image-to-pdf.html",
    "multifunction-calculator.html",
    "passport-size-photo-maker.html",
    "pdf-to-word.html",
    "qr-generator.html",
    "text-to-speech.html",
    "video-converter.html",
    "voice-translator.html"
)

# Standard nav-links block to find and replace
$oldNavPatterns = @(
    '<a href="index.html">Home</a>\s*<a href="index.html#tools">Tools</a>\s*<a href="index.html#about">About</a>\s*<a href="privacy-policy.html">Privacy Policy</a>\s*<a href="terms.html">Terms of Service</a>',
    '<a href="index.html">Home</a>\s*<a href="index.html#tools">Tools</a>\s*<a href="index.html#about">About</a>\s*<a href="index.html#contact">Contact</a>\s*<a href="privacy-policy.html">Privacy Policy</a>\s*<a href="terms.html">Terms of Service</a>',
    '<a href="index.html">Home</a>\s*<a href="index.html#tools">Tools</a>\s*<a href="privacy-policy.html">Privacy Policy</a>\s*<a href="terms.html">Terms</a>',
    '<a href="index.html">Home</a>\s*<a href="index.html#tools">Tools</a>\s*<a href="index.html#about">About</a>\s*<a href="index.html#contact">Contact</a>'
)

$standardNavLinks = @'
                <a href="index.html">Home</a>
                <a href="index.html#tools">Tools</a>
                <a href="about.html">About</a>
                <a href="contact.html">Contact</a>
                <a href="privacy-policy.html">Privacy</a>
                <a href="terms.html">Terms</a>
'@

foreach ($page in $toolPages) {
    if (Test-Path $page) {
        $content = Get-Content $page -Raw -Encoding UTF8
        $original = $content
        
        foreach ($pattern in $oldNavPatterns) {
            if ($content -match $pattern) {
                $content = $content -replace $pattern, $standardNavLinks
            }
        }
        
        if ($content -ne $original) {
            Set-Content $page -Value $content -Encoding UTF8
            Write-Host "Nav updated: $page" -ForegroundColor Green
        } else {
            Write-Host "No change needed: $page" -ForegroundColor Gray
        }
    }
}

Write-Host "`nNav links standardized!" -ForegroundColor Cyan
