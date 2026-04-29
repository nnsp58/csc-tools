const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runFullTestSuite() {
  console.log('🧪 ToolHub Automated Test Suite Started\n');
  console.log('=' .repeat(60));

  // Ensure screenshots folder
  const screenshotDir = './test-screenshots';
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();

  // Collect all console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const tools = [
    { name: 'Home', path: 'index.html', test: async (p) => await testHomePage(p) },
    { name: 'QR Generator', path: 'qr-generator.html', test: async (p) => await testQRGenerator(p) },
    { name: 'Calculator', path: 'multifunction-calculator.html', test: async (p) => await testCalculator(p) },
    { name: 'Text to Speech', path: 'text-to-speech.html', test: async (p) => await testTextToSpeech(p) },
    { name: 'Image Compressor', path: 'image-compress.html', test: async (p) => await testImageCompressor(p) },
    { name: 'Image to PDF', path: 'image-to-pdf.html', test: async (p) => await testImageToPDF(p) },
    { name: 'PDF to Word', path: 'pdf-to-word.html', test: async (p) => await testPDFToWord(p) },
    { name: 'Audio Converter', path: 'audio-converter.html', test: async (p) => await testAudioConverter(p) },
    { name: 'Video Converter', path: 'video-converter.html', test: async (p) => await testVideoConverter(p) },
    { name: 'Voice Translator', path: 'voice-translator.html', test: async (p) => await testVoiceTranslator(p) },
    { name: 'Universal Translator', path: 'universal-translator.html', test: async (p) => await testUniversalTranslator(p) },
    { name: 'Group Photo Maker', path: 'group-photo-maker.html', test: async (p) => await testGroupPhotoMaker(p) },
    { name: 'Passport Photo Maker', path: 'passport-size-photo-maker.html', test: async (p) => await testPassportPhotoMaker(p) },
    { name: 'Image Format Converter', path: 'image-format-converter.html', test: async (p) => await testImageFormatConverter(p) },
    { name: 'File Compressor', path: 'file-compressor.html', test: async (p) => await testFileCompressor(p) },
    { name: 'Document Converter', path: 'document-format-converter.html', test: async (p) => await testDocumentConverter(p) }
  ];

  const results = [];
  const baseURL = 'http://localhost:8000';

  for (const tool of tools) {
    console.log(`\n🔍 Testing: ${tool.name} (${tool.path})`);
    const result = {
      name: tool.name,
      path: tool.path,
      passed: false,
      errors: [],
      screenshots: [],
      details: {}
    };

    try {
      const url = `${baseURL}/${tool.path}`;
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

      // Wait for page load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear previous errors
      consoleErrors.length = 0;

      // Run tool-specific test
      const testResult = await tool.test(page);
      result.details = testResult;
      result.passed = testResult.overallPass;

      if (testResult.errors) result.errors.push(...testResult.errors);
      if (testResult.message) console.log(`   ${testResult.message}`);

      // Take screenshot
      const screenshotPath = path.join(screenshotDir, `${tool.name.replace(/\s+/g, '_')}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      result.screenshots.push(screenshotPath);
      console.log(`   📸 Screenshot: ${screenshotPath}`);

      // Report console errors
      if (consoleErrors.length > 0) {
        result.errors.push(...consoleErrors);
        console.log(`   ⚠️  ${consoleErrors.length} console errors detected`);
      }

    } catch (error) {
      result.passed = false;
      result.errors.push(error.message);
      console.log(`   ❌ ERROR: ${error.message}`);
    }

    results.push(result);
  }

  await browser.close();

  // Generate Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL TEST REPORT');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`\nTotal Tools: ${tools.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed/tools.length)*100).toFixed(1)}%\n`);

  results.forEach(r => {
    const status = r.passed ? '✅' : '❌';
    console.log(`${status} ${r.name.padEnd(25)} ${r.passed ? 'OK' : 'ISSUES'}`);
    if (r.errors.length > 0) {
      r.errors.slice(0, 3).forEach(err => console.log(`   └─ ${err}`));
      if (r.errors.length > 3) console.log(`   └─ ...and ${r.errors.length - 3} more`);
    }
  });

  // Save detailed JSON report
  fs.writeFileSync('test-report.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Detailed report saved: test-report.json');
  console.log('📁 Screenshots folder: test-screenshots/');

  return results;
}

// ─────────────────────────────────────────────
// Individual Tool Test Functions
// ─────────────────────────────────────────────

async function testHomePage(page) {
  const checks = [];
  const errors = [];

  // Check title
  const title = await page.title();
  checks.push({ test: 'Title', pass: title.includes('ToolHub') });

  // Check tool cards count
  const cardCount = await page.$$('.tool-card').then(c => c.length);
  checks.push({ test: '16 tool cards', pass: cardCount === 16 });

  // Check chatbot exists
  const chatbotExists = await page.$('#chat-toggle') !== null;
  checks.push({ test: 'Chatbot button', pass: chatbotExists });

  // Check footer loaded
  const footerText = await page.$eval('#footer', el => el.innerText).catch(() => null);
  checks.push({ test: 'Footer loaded', pass: footerText && footerText.includes('ToolHub') });

  const passed = checks.every(c => c.pass);
  checks.forEach(c => {
    if (!c.pass) errors.push(`Check failed: ${c.test}`);
  });

  return { overallPass: passed, errors, message: passed ? '✅ Home page OK' : `❌ ${errors[0]}` };
}

async function testQRGenerator(page) {
  const errors = [];

  // Fill input
  await page.fill('#qrText', 'Test QR Code');
  
  // Click generate
  await page.click('#generateBtn');
  
  // Wait for result
  await page.waitForSelector('#qrResult img', { timeout: 5000 });
  
  // Check download link
  const downloadExists = await page.$('#qrResult a[download]') !== null;
  
  if (!downloadExists) errors.push('Download link not found');

  return { 
    overallPass: downloadExists, 
    errors,
    message: downloadExists ? '✅ QR generated and download available' : '❌ QR generation failed'
  };
}

async function testCalculator(page) {
  const errors = [];

  // Test basic addition
  await page.fill('#num1', '10');
  await page.fill('#num2', '5');
  await page.click('#addBtn');
  const result = await page.$eval('#result', el => el.innerText);
  if (result !== '15') errors.push(`Basic math: expected 15, got ${result}`);

  // Test currency (use static rate)
  await page.selectOption('#fromCurrency', { value: 'USD' });
  await page.selectOption('#toCurrency', { value: 'INR' });
  await page.fill('#amount', '100');
  await page.click('#convertCurrency');
  await new Promise(resolve => setTimeout(resolve, 500));
  const currencyResult = await page.$eval('#currencyResult', el => el.innerText);
  if (!currencyResult.includes('8300')) errors.push('Currency conversion incorrect');

  return {
    overallPass: errors.length === 0,
    errors,
    message: errors.length === 0 ? '✅ Calculator all tabs work' : `❌ ${errors[0]}`
  };
}

async function testImageCompressor(page) {
  const errors = [];

  // Check UI elements
  const hasInput = await page.$('#imageInput') !== null;
  const hasSlider = await page.$('#compressionLevel') !== null;
  const hasButton = await page.$('button[onclick="compressImage()"]') !== null;

  if (!hasInput || !hasSlider || !hasButton) {
    errors.push('Missing UI elements');
  }

  return {
    overallPass: hasInput && hasSlider && hasButton,
    errors,
    message: (hasInput && hasSlider && hasButton) ? '✅ Image Compressor UI complete' : '❌ UI incomplete'
  };
}

async function testFileCompressor(page) {
  const errors = [];

  const hasInput = await page.$('#fileInput') !== null;
  const hasSlider = await page.$('#compressionLevel') !== null;
  const hasButton = await page.$('#compressBtn') !== null;

  // Check pdf-lib loaded
  const pdfLibLoaded = await page.evaluate(() => typeof PDFLib !== 'undefined');

  if (!pdfLibLoaded) errors.push('pdf-lib library not loaded');

  return {
    overallPass: hasInput && hasSlider && hasButton && pdfLibLoaded,
    errors,
    message: pdfLibLoaded ? '✅ File Compressor ready (pdf-lib loaded)' : '❌ Missing pdf-lib'
  };
}

async function testImageToPDF(page) {
  const errors = [];

  const hasInput = await page.$('#imgFile') !== null;
  const hasButton = await page.$('#convertBtn') !== null;
  const jsPDFLoaded = await page.evaluate(() => typeof jsPDF !== 'undefined');

  if (!jsPDFLoaded) errors.push('jsPDF library not loaded');

  return {
    overallPass: hasInput && hasButton && jsPDFLoaded,
    errors,
    message: jsPDFLoaded ? '✅ Image to PDF ready (jsPDF loaded)' : '❌ Missing jsPDF'
  };
}

async function testPDFToWord(page) {
  const errors = [];

  const hasInput = await page.$('#pdfInput') !== null;
  const hasButton = await page.$('#convertButton') !== null;
  
  // Check pdf.js loaded
  const pdfjsLoaded = await page.evaluate(() => typeof pdfjsLib !== 'undefined');
  
  // Check docx library
  const docxLoaded = await page.evaluate(() => typeof docxtemplater !== 'undefined');

  if (!pdfjsLoaded) errors.push('pdf.js not loaded');
  if (!docxLoaded) errors.push('docxtemplater not loaded');

  return {
    overallPass: hasInput && hasButton && pdfjsLoaded && docxLoaded,
    errors,
    message: (pdfjsLoaded && docxLoaded) ? '✅ PDF to Word ready (libs loaded)' : `⚠️  ${errors[0] || 'Missing libs'}`
  };
}

async function testAudioConverter(page) {
  const errors = [];

  const hasInput = await page.$('#audioFile') !== null;
  const hasButton = await page.$('#convertBtn') !== null;

  return {
    overallPass: hasInput && hasButton,
    errors,
    message: (hasInput && hasButton) ? '✅ Audio Converter UI ready' : '❌ UI incomplete'
  };
}

async function testVideoConverter(page) {
  const errors = [];

  const hasInput = await page.$('#videoFile') !== null;
  const hasButton = await page.$('#processBtn') !== null;

  // Check if it says "conversion not available"
  const pageText = await page.content();
  const isPlaceholder = pageText.includes('conversion is not available') || 
                        pageText.includes('Due to browser limitations');

  return {
    overallPass: hasInput && hasButton,
    errors: isPlaceholder ? ['Placeholder message - no actual conversion'] : [],
    message: isPlaceholder ? '⚠️  Placeholder only (no FFmpeg)' : '✅ Video Converter UI ready'
  };
}

async function testVoiceTranslator(page) {
  const errors = [];

  const hasRecordBtn = await page.$('#record-btn') !== null;
  const hasSourceLang = await page.$('#sourceLang') !== null;
  const hasTargetLang = await page.$('#targetLang') !== null;

  // Check SpeechRecognition API availability
  const speechRecAvailable = await page.evaluate(() => 
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );

  if (!speechRecAvailable) errors.push('SpeechRecognition API not available (Chrome only)');

  return {
    overallPass: hasRecordBtn && hasSourceLang && hasTargetLang,
    errors,
    message: speechRecAvailable ? '✅ Voice Translator ready' : '⚠️  Web Speech API not supported'
  };
}

async function testUniversalTranslator(page) {
  const errors = [];

  const hasSource = await page.$('#source-text') !== null;
  const hasButton = await page.$('#translateBtn') !== null;
  const hasOutput = await page.$('#translated-text') !== null;

  return {
    overallPass: hasSource && hasButton && hasOutput,
    errors,
    message: (hasSource && hasButton && hasOutput) ? '✅ Universal Translator ready' : '❌ UI incomplete'
  };
}

async function testGroupPhotoMaker(page) {
  const errors = [];

  const hasInput = await page.$('#imageInput') !== null;
  const hasButton = await page.$('#createBtn') !== null;
  const hasCanvas = await page.$('#canvas') !== null;

  return {
    overallPass: hasInput && hasButton && hasCanvas,
    errors,
    message: (hasInput && hasButton && hasCanvas) ? '✅ Group Photo Maker ready' : '❌ UI incomplete'
  };
}

async function testPassportPhotoMaker(page) {
  const errors = [];

  const hasImgInput = await page.$('#mainImg') !== null;
  const hasGoBtn = await page.$('#go') !== null;
  const hasColorSelect = await page.$('#pColor') !== null;

  // Check MediaPipe loaded
  const mediaPipeLoaded = await page.evaluate(() => typeof ai !== 'undefined');

  if (!mediaPipeLoaded) errors.push('MediaPipe library not loaded');

  return {
    overallPass: hasImgInput && hasGoBtn && hasColorSelect,
    errors,
    message: mediaPipeLoaded ? '✅ Passport Photo Maker ready (MediaPipe loaded)' : '⚠️  MediaPipe not loaded'
  };
}

async function testImageFormatConverter(page) {
  const errors = [];

  const hasInput = await page.$('#fileInput') !== null;
  const hasSelect = await page.$('#outputFormat') !== null;
  const hasButton = await page.$('#convertBtn') !== null;

  return {
    overallPass: hasInput && hasSelect && hasButton,
    errors,
    message: (hasInput && hasSelect && hasButton) ? '✅ Image Format Converter ready' : '❌ UI incomplete'
  };
}

async function testDocumentConverter(page) {
  const errors = [];

  // Should show "Under Development"
  const content = await page.content();
  const isUnderDev = content.includes('Under Development') || content.includes('coming soon');

  return {
    overallPass: isUnderDev,
    errors: !isUnderDev ? ['No under development message found'] : [],
    message: isUnderDev ? '✅ Shows under development' : '❌ Missing placeholder message'
  };
}

// Run
runFullTestSuite()
  .then(() => {
    console.log('\n✅ All tests completed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  });
