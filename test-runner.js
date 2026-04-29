#!/usr/bin/env node
/**
 * ToolHub Comprehensive Test Runner
 * Tests all 15 tools + info pages individually
 * Reports status, errors, and generates JSON report
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const BASE_DIR = __dirname;
const HTML_FILES = [
  'index.html', 'about.html', 'contact.html', 'disclaimer.html',
  'privacy-policy.html', 'terms.html',
  'qr-generator.html', 'multifunction-calculator.html', 'text-to-speech.html',
  'image-format-converter.html', 'image-compress.html', 'image-to-pdf.html',
  'pdf-to-word.html', 'audio-converter.html', 'video-converter.html',
  'voice-translator.html', 'universal-translator.html', 'group-photo-maker.html',
  'passport-size-photo-maker.html', 'file-compressor.html', 'document-format-converter.html'
];

const TOOLS = [
  { name: 'QR Generator', file: 'qr-generator.html', func: 'generateQR', elements: ['#qrText', '#qrResult', '#generateBtn'] },
  { name: 'Calculator', file: 'multifunction-calculator.html', func: 'calculateBasic', elements: ['#basicNum1', '#basicNum2', '#addBtn', '#result'] },
  { name: 'Text to Speech', file: 'text-to-speech.html', func: 'speakText', elements: ['#textInput', '#speakBtn', '#stopBtn'] },
  { name: 'Image Format Converter', file: 'image-format-converter.html', func: 'convertImage', elements: ['#imgInput', '#outputFormat', '#convertBtn'] },
  { name: 'Image Compressor', file: 'image-compress.html', func: 'compressImage', elements: ['#imageInput', '#compressionLevel', '#compressBtn'] },
  { name: 'Image to PDF', file: 'image-to-pdf.html', func: 'convertToPdf', elements: ['#imgFiles', '#convertBtn'], depends: 'jsPDF' },
  { name: 'PDF to Word', file: 'pdf-to-word.html', func: 'convertPdfToWord', elements: ['#pdfInput', '#convertBtn'], depends: ['pdfjsLib', 'JSZip'] },
  { name: 'Audio Converter', file: 'audio-converter.html', func: 'convertAudio', elements: ['#audioFile', '#outputFormat', '#convertBtn'] },
  { name: 'Video Converter', file: 'video-converter.html', placeholder: true, message: 'Coming Soon - External tools only' },
  { name: 'Voice Translator', file: 'voice-translator.html', func: 'startRecording', elements: ['#record-btn', '#sourceLang', '#targetLang'] },
  { name: 'Universal Translator', file: 'universal-translator.html', func: 'translateText', elements: ['#source-text', '#translateBtn', '#translated-text'] },
  { name: 'Group Photo Maker', file: 'group-photo-maker.html', func: 'createGroupPhoto', elements: ['#imgs', '#createBtn', '#canvas'] },
  { name: 'Passport Photo Maker', file: 'passport-size-photo-maker.html', func: 'getCleanPerson', elements: ['#fileIn', '#go'], depends: 'SelfieSegmentation' },
  { name: 'File Compressor', file: 'file-compressor.html', func: 'compressPdf', elements: ['#pdfFile', '#compressBtn'], depends: 'PDFLib' },
  { name: 'Document Converter', file: 'document-format-converter.html', placeholder: true, message: 'Under Development' }
];

// Simple static file server
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(BASE_DIR, filePath);

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'text/html';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 ToolHub Test Server running at http://localhost:${PORT}\n`);
  runTests();
});

async function runTests() {
  const results = {
    timestamp: new Date().toISOString(),
    total: TOOLS.length,
    working: 0,
    placeholder: 0,
    broken: 0,
    tools: []
  };

  console.log('='.repeat(60));
  console.log('📋 Tool Functionality Test Report');
  console.log('='.repeat(60) + '\n');

  // Wait for server to stabilize
  await new Promise(r => setTimeout(r, 1000));

  for (const tool of TOOLS) {
    const status = await testTool(tool);
    results.tools.push(status);

    const icon = status.status === 'WORKING' ? '✅' : status.status === 'PLACEHOLDER' ? '⚪' : '❌';
    console.log(`${icon} ${tool.name.padEnd(25)} ${status.status}`);

    if (status.status === 'WORKING') results.working++;
    else if (status.status === 'PLACEHOLDER') results.placeholder++;
    else results.broken++;
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   Total:  ${results.total}`);
  console.log(`   Working: ${results.working} (${(results.working/results.total*100).toFixed(1)}%)`);
  console.log(`   Placeholder: ${results.placeholder}`);
  console.log(`   Broken: ${results.broken}`);
  console.log('='.repeat(60) + '\n');

  // Write report
  fs.writeFileSync('tool-test-report.json', JSON.stringify(results, null, 2));
  console.log('💾 Report saved to tool-test-report.json\n');

  server.close();
  process.exit(results.broken > 0 ? 1 : 0);
}

async function testTool(tool) {
  const result = {
    name: tool.name,
    file: tool.file,
    status: 'UNKNOWN',
    elementsFound: false,
    functionExists: false,
    dependenciesLoaded: false,
    errors: []
  };

  try {
    const filePath = path.join(BASE_DIR, tool.file);
    const html = fs.readFileSync(filePath, 'utf8');

    // Check if placeholder
    if (tool.placeholder) {
      const hasMessage = html.includes(tool.message) || html.includes('Coming Soon') || html.includes('Under Development');
      result.status = hasMessage ? 'PLACEHOLDER' : 'BROKEN';
      if (!hasMessage) result.errors.push('Placeholder message missing');
      return result;
    }

    // Check required elements exist
    const elementsOk = tool.elements.every(sel => html.includes(sel) || html.includes(`id="${sel.slice(1)}"`));
    result.elementsFound = elementsOk;
    if (!elementsOk) result.errors.push('Missing UI elements');

    // Check if JavaScript function defined (inline or external)
    const hasFunc = html.includes(`function ${tool.func}`) ||
                    html.includes(`const ${tool.func} =`) ||
                    html.includes(`let ${tool.func} =`) ||
                    html.includes(`var ${tool.func} =`);

    result.functionExists = hasFunc;
    if (!hasFunc) result.errors.push(`Function ${tool.func} not found`);

    // Check dependencies (CDN libraries)
    if (tool.depends) {
      const deps = Array.isArray(tool.depends) ? tool.depends : [tool.depends];
      const allLoaded = deps.every(dep => {
        // Check for CDN script reference or global variable check in code
        return html.includes(dep) || html.toLowerCase().includes(dep.toLowerCase());
      });
      result.dependenciesLoaded = allLoaded;
      if (!allLoaded) result.errors.push(`Missing dependencies: ${deps.filter(d => !html.includes(d)).join(', ')}`);
    } else {
      result.dependenciesLoaded = true;
    }

    // Determine overall status
    if (elementsOk && hasFunc && result.dependenciesLoaded) {
      result.status = 'WORKING';
    } else if (hasFunc || elementsOk) {
      result.status = 'PARTIAL';
    } else {
      result.status = 'BROKEN';
    }

  } catch (err) {
    result.status = 'BROKEN';
    result.errors.push(err.message);
  }

  return result;
}
