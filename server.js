const http = require('http');
const fs = require('fs');
const path = require('path');
const { validateRegistration } = require('./src/validator');
const { EventEmitter } = require('events');
const { pipeline } = require('stream');

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const LOG_FILE = path.join(DATA_DIR, 'requests.log');
fs.mkdirSync(DATA_DIR, { recursive: true });

const appEvents = new EventEmitter();
appEvents.on('registration:accepted', (record) => {
  const line = JSON.stringify({ event: 'registration:accepted', email: record.email, at: new Date().toISOString() }) + '\n';
  // A stream writes each audit entry to disk.
  const output = fs.createWriteStream(LOG_FILE, { flags: 'a' });
  output.end(line);
});

function send(res, status, body) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' });
  res.end(payload);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 100_000) { reject(new Error('Request body too large')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/') {
    return send(res, 200, { message: 'NodeJS Server-Side Validation API', endpoints: { health: 'GET /api/health', register: 'POST /api/register', logs: 'GET /api/logs' } });
  }
  if (req.method === 'GET' && url.pathname === '/api/health') {
    return send(res, 200, { status: 'ok', service: 'registration-api', node: process.version });
  }
  if (req.method === 'POST' && url.pathname === '/api/register') {
    let input;
    try { input = await readJson(req); }
    catch (error) { return send(res, 400, { success: false, message: error.message }); }
    const result = validateRegistration(input);
    if (!result.valid) return send(res, 422, { success: false, message: 'Validation failed', errors: result.errors });
    const record = { name: input.name.trim(), email: input.email.trim().toLowerCase(), age: Number(input.age), createdAt: new Date().toISOString() };
    appEvents.emit('registration:accepted', record);
    return send(res, 201, { success: true, message: 'Registration accepted', data: record });
  }
  if (req.method === 'GET' && url.pathname === '/api/logs') {
    if (!fs.existsSync(LOG_FILE)) return send(res, 200, { count: 0, entries: [] });
    // Read audit log with a stream, then return parsed entries.
    const chunks = [];
    const input = fs.createReadStream(LOG_FILE);
    input.on('data', chunk => chunks.push(chunk));
    input.on('error', () => send(res, 500, { error: 'Unable to read log file' }));
    input.on('end', () => {
      const entries = Buffer.concat(chunks).toString('utf8').split('\n').filter(Boolean).map(line => {
        try { return JSON.parse(line); } catch { return null; }
      }).filter(Boolean);
      send(res, 200, { count: entries.length, entries });
    });
    return;
  }
  return send(res, 404, { success: false, message: 'Route not found' });
});

server.listen(PORT, '0.0.0.0', () => console.log(`Server-side validation API running on port ${PORT}`));
