const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { PuppeteerServer } = require('@modelcontextprotocol/server-puppeteer');

const server = new PuppeteerServer({
  launchOptions: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process'
    ]
  },
  timeout: 30000
});

server.start()
  .then(() => {
    console.log('🎭 Puppeteer MCP Server connected and ready');
    console.log('Waiting for Kilo commands...');
  })
  .catch(err => {
    console.error('❌ MCP Server error:', err);
    process.exit(1);
  });

process.on('SIGINT', () => {
  server.stop();
  process.exit(0);
});
