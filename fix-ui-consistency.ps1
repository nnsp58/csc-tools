# ToolHub UI Consistency Fixer
# Replaces all inline header styles with standard class-based approach

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
    "password-generator.html",
    "pdf-to-word.html",
    "qr-generator.html",
    "text-to-speech.html",
    "universal-translator.html",
    "video-converter.html",
    "voice-translator.html",
    "about.html",
    "contact.html",
    "privacy-policy.html",
    "terms.html",
    "disclaimer.html"
)

# Standard nav HTML block
$standardNav = @'
    <header class="header">
        <nav class="nav">
            <a href="index.html" class="logo" style="text-decoration:none;color:white;">ToolHub</a>
            <div class="nav-links">
                <a href="index.html">Home</a>
                <a href="index.html#tools">Tools</a>
                <a href="about.html">About</a>
                <a href="contact.html">Contact</a>
                <a href="privacy-policy.html">Privacy</a>
                <a href="terms.html">Terms</a>
            </div>
        </nav>
    </header>
'@

foreach ($page in $toolPages) {
    if (Test-Path $page) {
        $content = Get-Content $page -Raw -Encoding UTF8
        
        # Fix inline header gradient overrides (orange-teal already in styles.css now)
        # Remove any inline style on .header that overrides our CSS variable
        $content = $content -replace '\.header \{ background: linear-gradient\(120deg, #ff6b6b, #4ecdc4\)[^}]*\}', ''
        $content = $content -replace '\.header \{ background: linear-gradient\(120deg, #1e3c72, #2a5298\)[^}]*\}', ''
        
        # Fix inline footer overrides (footer.html is shared, so just keep the div)
        $content = $content -replace 'background: linear-gradient\(120deg, #ff6b6b, #4ecdc4\)', 'background: var(--brand-gradient)'
        $content = $content -replace 'background: linear-gradient\(120deg, #1e3c72, #2a5298\)', 'background: var(--brand-gradient)'
        
        Set-Content $page -Value $content -Encoding UTF8
        Write-Host "Fixed: $page" -ForegroundColor Green
    } else {
        Write-Host "Not found: $page" -ForegroundColor Yellow
    }
}

Write-Host "`nAll pages updated!" -ForegroundColor Cyan
