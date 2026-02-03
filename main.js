import { EventEmitter } from 'events';
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, rmSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { tmpdir } from 'os';
import { format } from 'util';
import pino from 'pino';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import readline from 'readline';
import NodeCache from 'node-cache';

// ============================================================================
// OTTIMIZZAZIONE 1: Event Emitter configurato
// ============================================================================
EventEmitter.defaultMaxListeners = 20

const sessionFolder = path.join(process.cwd(), global.authFile || 'sessioni');

// ============================================================================
// OTTIMIZZAZIONE 2: Debounced cleanup
// ============================================================================
let cleanupTimer = null;
let isCleaningUp = false;

function clearSessionFolderSelective(dir = sessionFolder) {
  if (isCleaningUp) return;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return;
  }
  
  if (cleanupTimer) return;
  cleanupTimer = setTimeout(() => { cleanupTimer = null; }, 10000);
  
  isCleaningUp = true;
  try {
    const entries = fs.readdirSync(dir);
    const toDelete = [];
    
    for (const entry of entries) {
      if (entry === 'creds.json') continue;
      
      const fullPath = path.join(dir, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          clearSessionFolderSelective(fullPath);
          toDelete.push({ path: fullPath, isDir: true });
        } else if (!entry.startsWith('pre-key')) {
          toDelete.push({ path: fullPath, isDir: false });
        }
      } catch {}
    }
    
    toDelete.forEach(({ path, isDir }) => {
      try {
        isDir ? fs.rmdirSync(path) : fs.unlinkSync(path);
      } catch {}
    });
  } finally {
    isCleaningUp = false;
  }
}

// ============================================================================
// OTTIMIZZAZIONE 3: Batch purge
// ============================================================================
function purgeSessionBatch(sessionDirs, cleanPreKeys = false) {
  const now = Date.now();
  const oldFileThreshold = cleanPreKeys ? 86400000 : 0;
  
  sessionDirs.forEach(sessionDir => {
    if (!existsSync(sessionDir)) return;
    
    try {
      const files = readdirSync(sessionDir);
      const filesToDelete = [];
      
      files.forEach(file => {
        if (file === 'creds.json') return;
        
        const filePath = path.join(sessionDir, file);
        try {
          const stats = statSync(filePath);
          const fileAge = now - stats.mtimeMs;
          
          if (file.startsWith('pre-key') && cleanPreKeys && fileAge > oldFileThreshold) {
            filesToDelete.push({ path: filePath, isDir: false });
          } else if (!file.startsWith('pre-key')) {
            filesToDelete.push({ path: filePath, isDir: stats.isDirectory() });
          }
        } catch {}
      });
      
      filesToDelete.forEach(({ path, isDir }) => {
        try {
          isDir ? rmSync(path, { recursive: true, force: true }) : unlinkSync(path);
        } catch {}
      });
    } catch {}
  });
}

function cleanCorruptedSession(sessionDir) {
  if (!existsSync(sessionDir)) return;
  
  try {
    const files = readdirSync(sessionDir);
    files.forEach(file => {
      if (file === 'creds.json') return;
      
      const filePath = path.join(sessionDir, file);
      try {
        const stats = statSync(filePath);
        stats.isDirectory() 
          ? rmSync(filePath, { recursive: true, force: true })
          : unlinkSync(filePath);
      } catch {}
    });
  } catch (e) {
    console.error(chalk.red(`Errore pulizia ${sessionDir}:`, e.message));
  }
}

// ============================================================================
// OTTIMIZZAZIONE 4: UN SOLO cleanup interval intelligente
// ============================================================================
setInterval(() => {
  try {
    if (stopped === 'close' || !conn?.user) return
    
    const now = Date.now()
    const uptime = now - global.timestamp.start.getTime()
    
    // Pulizia leggera ogni 3h
    if (uptime % (3 * 60 * 60 * 1000) < 60000) {
      clearSessionFolderSelective()
      console.log(chalk.gray('🧹 Pulizia sessioni leggera'))
    }
    
    // Pulizia pre-key ogni 6h
    if (uptime % (6 * 60 * 60 * 1000) < 60000) {
      const dirs = [`./sessioni`]
      const subBotDir = `./${global.authFileJB}`
      
      if (existsSync(subBotDir)) {
        const subBotFolders = readdirSync(subBotDir)
          .filter(file => statSync(join(subBotDir, file)).isDirectory())
          .map(folder => join(subBotDir, folder))
        dirs.push(...subBotFolders)
      }
      
      purgeSessionBatch(dirs, true)
      console.log(chalk.gray('🧹 Pulizia pre-key completa'))
    }
  } catch (error) {
    console.error(chalk.red('Errore pulizia:'), error.message)
  }
}, 60 * 1000) // Check ogni minuto

const DisconnectReason = {
  connectionClosed: 428,
  connectionLost: 408,
  connectionReplaced: 440,
  timedOut: 408,
  loggedOut: 401,
  badSession: 500,
  restartRequired: 515,
  multideviceMismatch: 411,
  forbidden: 403,
  unavailableService: 503
};

const { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser, getPerformanceConfig, setPerformanceConfig, getCacheStats, clearCache, Logger, makeInMemoryStore } = await import('@realvare/based');
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

protoType();
serialize();

global.isLogoPrinted = false;
global.qrGenerated = false;
global.connectionMessagesPrinted = {};

let methodCodeQR = process.argv.includes("qr");
let methodCode = process.argv.includes("code");
let MethodMobile = process.argv.includes("mobile");
let phoneNumber = global.botNumberCode;

// ============================================================================
// OTTIMIZZAZIONE 5: Filtro log compilato
// ============================================================================
const filterStrings = [
  "Q2xvc2luZyBzdGFsZSBvcGVu",
  "Q2xvc2luZyBvcGVuIHNlc3Npb24=",
  "RmFpbGVkIHRvIGRlY3J5cHQ=",
  "U2Vzc2lvbiBlcnJvcg==",
  "RXJyb3I6IEJhZCBNQUM=",
  "RGVjcnlwdGVkIG1lc3NhZ2U="
].map(s => atob(s));

function redefineConsoleMethod(methodName, filterStrings) {
  const originalConsoleMethod = console[methodName];
  console[methodName] = function () {
    const message = arguments[0];
    if (typeof message === 'string' && filterStrings.some(filterString => message.includes(filterString))) {
      return;
    }
    originalConsoleMethod.apply(console, arguments);
  };
}

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};

global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};

global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '');
global.timestamp = { start: new Date };

const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts['prefix'] || '*/!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@').replace(/[|\\{}()[\]^$+*\.\-\^]/g, '\\$&') + ']');
global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('database.json'));
global.DATABASE = global.db;

// ============================================================================
// OTTIMIZZAZIONE 6: Caricamento DB con retry
// ============================================================================
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => {
      const interval = setInterval(async function () {
        if (!global.db.READ) {
          clearInterval(interval);
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
        }
      }, 300);
    });
  }
  
  if (global.db.data !== null) return;
  global.db.READ = true;
  
  let retries = 0;
  const maxRetries = 3;
  
  while (retries < maxRetries) {
    try {
      await global.db.read();
      global.db.data = {
        users: {},
        chats: {},
        stats: {},
        msgs: {},
        sticker: {},
        settings: {},
        ...(global.db.data || {}),
      };
      global.db.chain = chain(global.db.data);
      break;
    } catch (error) {
      retries++;
      console.error(`Errore caricamento database (tentativo ${retries}/${maxRetries}):`, error.message);
      if (retries >= maxRetries) {
        console.error('ERRORE CRITICO: impossibile caricare il database');
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  }
  
  global.db.READ = null;
};

loadDatabase();

global.conns = global.conns instanceof Array ? global.conns : [];
global.creds = 'creds.json';
global.authFile = 'sessioni';
global.authFileJB = 'chatunity-sub';

// ============================================================================
// OTTIMIZZAZIONE 7: Performance config ottimale
// ============================================================================
setPerformanceConfig({
  performance: {
    enableCache: true,
    enableMetrics: false,
  },
  debug: {
    enableLidLogging: false,
    logLevel: 'silent'
  }
});

const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const msgRetryCounterCache = new NodeCache({ 
  stdTTL: 3600, 
  checkperiod: 900,
  useClones: false,
  maxKeys: 1000
});

const { version } = await fetchLatestBaileysVersion();

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

const question = (t) => {
  rl.clearLine(rl.input, 0);
  return new Promise((resolver) => {
    rl.question(t, (r) => {
      rl.clearLine(rl.input, 0);
      resolver(r.trim());
    });
  });
};

let opzione;
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
  do {
    const menu = `╭★────★────★────★────★────★
│      ꒰ ¡METODO DI COLLEGAMENTO! ꒱
│
│  👾  Opzione 1: Codice QR
│  ☁️  Opzione 2: Codice 8 caratteri
│
╰★────★────★────★────★────★
               ꒷꒦ ✦ ChatUnity ✦ ꒷꒦
╰♡꒷ ๑ ⋆˚₊⋆───ʚ˚ɞ───⋆˚₊⋆ ๑ ⪩﹐
`;
    opzione = await question(menu + '\nInserisci la tua scelta ---> ');
    if (!/^[1-2]$/.test(opzione)) {
      console.log('Opzione non valida, inserisci 1 o 2');
    }
  } while ((opzione !== '1' && opzione !== '2') || fs.existsSync(`./${authFile}/creds.json`));
}

console.info = () => { };
console.debug = () => { };
['log', 'warn', 'error'].forEach(methodName => redefineConsoleMethod(methodName, filterStrings));

// ============================================================================
// OTTIMIZZAZIONE 8: Cache ottimizzate
// ============================================================================
const groupMetadataCache = new NodeCache({ 
  stdTTL: 900,
  checkperiod: 180,
  useClones: false,
  maxKeys: 300
});
global.groupCache = groupMetadataCache;

const logger = pino({ level: 'silent' });

global.jidCache = new NodeCache({ 
  stdTTL: 2400,
  checkperiod: 600, 
  useClones: false,
  maxKeys: 800
});

global.store = makeInMemoryStore({ 
  logger,
  maxMessagesPerChat: 40
});

// ============================================================================
// OTTIMIZZAZIONE 9: decodeJid con LRU cache
// ============================================================================
const jidDecodeCache = new Map();
const MAX_JID_CACHE = 400;

function decodeJidOptimized(jid) {
  if (!jid) return jid;
  
  if (jidDecodeCache.has(jid)) {
    return jidDecodeCache.get(jid);
  }
  
  let decoded = jid;
  if (/:\d+@/gi.test(jid)) {
    decoded = jidNormalizedUser(jid);
  }
  if (typeof decoded === 'object' && decoded.user && decoded.server) {
    decoded = `${decoded.user}@${decoded.server}`;
  }
  if (typeof decoded === 'string' && decoded.endsWith('@lid')) {
    decoded = decoded.replace('@lid', '@s.whatsapp.net');
  }
  
  if (jidDecodeCache.size >= MAX_JID_CACHE) {
    const firstKey = jidDecodeCache.keys().next().value;
    jidDecodeCache.delete(firstKey);
  }
  
  jidDecodeCache.set(jid, decoded);
  return decoded;
}

// ============================================================================
// OTTIMIZZAZIONE 10: Connection options ottimizzate
// ============================================================================
const connectionOptions = {
  logger: logger,
  mobile: MethodMobile,
  browser: opzione === '1' ? Browsers.windows('Chrome') : methodCodeQR ? Browsers.windows('Chrome') : Browsers.macOS('Safari'),
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger),
  },
  decodeJid: decodeJidOptimized,
  markOnlineOnConnect: false,
  generateHighQualityLinkPreview: false,
  syncFullHistory: false,
  downloadHistory: false,
  shouldSyncHistory: false,
  defaultQueryTimeoutMs: 120000,
  connectTimeoutMs: 120000,
  keepAliveIntervalMs: 30000,
  printQRInTerminal: true,
  
  cachedGroupMetadata: async (jid) => {
    const cached = global.groupCache.get(jid);
    if (cached) return cached;
    
    try {
      const metadata = await global.conn.groupMetadata(decodeJidOptimized(jid));
      if (!metadata || !metadata.participants) return null;
      
      global.groupCache.set(jid, metadata);
      return metadata;
    } catch (err) {
      return null;
    }
  },
  
  getMessage: async (key) => {
    try {
      const jid = decodeJidOptimized(key.remoteJid);
      const msg = await global.store.loadMessage(jid, key.id);
      return msg?.message || undefined;
    } catch {
      return undefined;
    }
  },
  
  msgRetryCounterCache,
  retryRequestDelayMs: 500,
  maxMsgRetryCount: 1,
  shouldIgnoreJid: jid => false,
  emitOwnEvents: false,
  fireInitQueries: false,
  patchMessageBeforeSending: (message) => message,
};

global.conn = makeWASocket(connectionOptions);
try { global.store.bind(global.conn.ev); } catch {}

// ============================================================================
// FIX CRITICO: Gestione riconnessione CORRETTA
// ============================================================================
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
const BASE_RECONNECT_DELAY = 5000;
let lastReconnectTime = 0;
const MIN_RECONNECT_INTERVAL = 10000;

const SESSION_ERROR_PATTERNS = [
  'invalid pre key id',
  'prekey',
  'pre-key',
  'no session record',
  'invalid session',
  'session error',
  'bad mac',
  'decryption error',
  'failed to decrypt',
  'restore session'
];

const SKIP_RECONNECT_CODES = [428, 440, 500, 411, 401, 503];

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin, qr } = update;
  global.stopped = connection;
  
  if (isNewLogin) conn.isInit = true;
  
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
  const error = lastDisconnect?.error;
  
  // Ignora errori sessione non critici
  if (error) {
    const errorMessage = (error.message || error.toString() || '').toLowerCase();
    const isSessionError = SESSION_ERROR_PATTERNS.some(pattern => errorMessage.includes(pattern));
    
    if (isSessionError) {
      return;
    }
  }
  
  const now = Date.now();
  const timeSinceLastReconnect = now - lastReconnectTime;
  
  // ⚠️ CODICI CHE NON DEVONO MAI RICONNETTERE
  if (code === 401 || code === 500) {
    console.log(chalk.red(`⛔ Sessione terminata (${code}) - Elimina ./sessioni e riavvia`));
    process.exit(1);
  }
  
  // ⚠️ RATE LIMITING RICONNESSIONI
  if (code && SKIP_RECONNECT_CODES.includes(code) && code !== 503) {
    console.log(chalk.yellow(`⚠️ Codice ${code} - Attesa ${Math.round(MIN_RECONNECT_INTERVAL/1000)}s`));
    await new Promise(resolve => setTimeout(resolve, MIN_RECONNECT_INTERVAL));
    return;
  }
  
  // 503 - Backoff esponenziale
  if (code === DisconnectReason.unavailableService) {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1);
      
      console.log(chalk.bold.yellowBright(`\n⚠️ 503 Service Unavailable - Tentativo ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} - Attesa ${Math.round(delay/1000)}s`));
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      lastReconnectTime = Date.now();
      await global.reloadHandler(true).catch(console.error);
      global.timestamp.connect = new Date;
      return;
    } else {
      console.log(chalk.bold.redBright(`\n⚠️ SERVIZIO INDISPONIBILE - Aspetto 60s`));
      reconnectAttempts = 0;
      await new Promise(resolve => setTimeout(resolve, 60000));
      return;
    }
  }
  
  if (connection === 'open') {
    reconnectAttempts = 0;
    lastReconnectTime = 0;
  }
  
  // Rate limiting generale
  if (code && !SKIP_RECONNECT_CODES.includes(code)) {
    if (timeSinceLastReconnect < MIN_RECONNECT_INTERVAL) {
      const waitTime = MIN_RECONNECT_INTERVAL - timeSinceLastReconnect;
      console.log(chalk.gray(`⏳ Rate limit - Attesa ${Math.round(waitTime/1000)}s`));
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    console.log(chalk.blue(`🔄 Riconnessione per codice ${code}`));
    lastReconnectTime = Date.now();
    await global.reloadHandler(true).catch(console.error);
    global.timestamp.connect = new Date;
  }
  
  if (global.db.data == null) loadDatabase();

  if (qr && (opzione === '1' || methodCodeQR) && !global.qrGenerated) {
    console.log(chalk.bold.yellow(`\n┊ SCANSIONA IL CODICE QR (scade in 45s)\n`));
    global.qrGenerated = true;
  }

  if (connection === 'open') {
    global.qrGenerated = false;
    global.connectionMessagesPrinted = {};
    
    if (!global.isLogoPrinted) {
      const cribot = chalk.hex('#3b0d95')(` ██████╗██████╗ ██╗██████╗  ██████╗ ████████╗
██╔════╝██╔══██╗██║██╔══██╗██╔═══██╗╚══██╔══╝
██║     ██████╔╝██║██████╔╝██║   ██║   ██║   
██║     ██╔══██╗██║██╔══██╗██║   ██║   ██║   
╚██████╗██║  ██║██║██████╔╝╚██████╔╝   ██║   
 ╚═════╝╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝    ╚═╝   `);
      console.log(cribot);
      global.isLogoPrinted = true;
      await chatunityedition();
    }
  }

  if (connection === 'close') {
    const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
    
    if (reason === DisconnectReason.badSession && !global.connectionMessagesPrinted.badSession) {
      console.log(chalk.bold.redBright(`\n⚠️ SESSIONE NON VALIDA - Elimina ${global.authFile} e riconnetti`));
      global.connectionMessagesPrinted.badSession = true;
    } else if (reason === DisconnectReason.connectionLost && !global.connectionMessagesPrinted.connectionLost) {
      console.log(chalk.bold.blueBright(`\n⚠️ CONNESSIONE PERSA - Riconnessione...`));
      global.connectionMessagesPrinted.connectionLost = true;
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      lastReconnectTime = Date.now();
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionReplaced && !global.connectionMessagesPrinted.connectionReplaced) {
      console.log(chalk.bold.yellowBright(`\n⚠️ CONNESSIONE SOSTITUITA - Chiudi l'altra sessione`));
      global.connectionMessagesPrinted.connectionReplaced = true;
    } else if (reason === DisconnectReason.loggedOut && !global.connectionMessagesPrinted.loggedOut) {
      console.log(chalk.bold.redBright(`\n⚠️ DISCONNESSO - Elimina ${global.authFile} e riconnetti`));
      global.connectionMessagesPrinted.loggedOut = true;
    } else if (reason === DisconnectReason.restartRequired && !global.connectionMessagesPrinted.restartRequired) {
      console.log(chalk.bold.magentaBright(`\n✅ CONNESSO CON SUCCESSO`));
      global.connectionMessagesPrinted.restartRequired = true;
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.timedOut && !global.connectionMessagesPrinted.timedOut) {
      console.log(chalk.bold.yellowBright(`\n⌛ TIMEOUT - Riconnessione...`));
      global.connectionMessagesPrinted.timedOut = true;
      await new Promise(resolve => setTimeout(resolve, 3000));
      lastReconnectTime = Date.now();
      await global.reloadHandler(true).catch(console.error);
    }
  }
}

function attachCoreHandlers(connInstance) {
  if (!connInstance.connectionUpdateHandler) connInstance.connectionUpdateHandler = connectionUpdate.bind(connInstance);
  if (!connInstance.credsUpdateHandler) connInstance.credsUpdateHandler = saveCreds.bind(connInstance);

  try { connInstance.ev.removeListener('connection.update', connInstance.connectionUpdateHandler); } catch {}
  try { connInstance.ev.removeListener('creds.update', connInstance.credsUpdateHandler); } catch {}

  connInstance.ev.on('connection.update', connInstance.connectionUpdateHandler);
  connInstance.ev.on('creds.update', connInstance.credsUpdateHandler);
}

// Codice pairing
if (!fs.existsSync(`./${authFile}/creds.json`)) {
  if (opzione === '2' || methodCode) {
    opzione = '2';
    if (!conn.authState.creds.registered) {
      let addNumber;
      if (phoneNumber) {
        addNumber = phoneNumber.replace(/[^0-9]/g, '');
      } else {
        phoneNumber = await question(chalk.bgBlack(chalk.bold.bgMagentaBright(`Inserisci il numero WhatsApp (es: +393471234567)`)));
        addNumber = phoneNumber.replace(/\D/g, '');
        if (!phoneNumber.startsWith('+')) phoneNumber = `+${phoneNumber}`;
        rl.close();
      }
      setTimeout(async () => {
        let codeBot = await conn.requestPairingCode(addNumber, 'unitybot');
        codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
        console.log(chalk.bold.white(chalk.bgBlueBright('🔑 CODICE:')), chalk.bold.white(codeBot));
      }, 3000);
    }
  }
}

conn.isInit = false;
conn.well = false;

async function chatunityedition() {
  try {
    const mainChannelId = global.IdCanale?.[0] || '120363259442839354@newsletter';
    await global.conn.newsletterFollow(mainChannelId);
  } catch {}
}

// ============================================================================
// OTTIMIZZAZIONE: Salvataggio DB meno frequente (5min)
// ============================================================================
if (!opts['test']) {
  if (global.db) setInterval(async () => {
    if (global.db.data) await global.db.write().catch(console.error);
    if (opts['autocleartmp'] && (global.support || {}).find) {
      const tmp = [tmpdir(), 'tmp', "chatunity-sub"];
      tmp.forEach(filename => spawn('find', [filename, '-amin', '10', '-type', 'f', '-delete']));
    }
  }, 5 * 60 * 1000); // 5 minuti
}

if (opts['server']) (await import('./server.js')).default(global.conn, PORT);

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// ============================================================================
// OTTIMIZZAZIONE: Sub-bot connection
// ============================================================================
async function connectSubBots() {
  const subBotDirectory = './chatunity-sub';
  
  if (!existsSync(subBotDirectory)) {
    try {
      mkdirSync(subBotDirectory, { recursive: true });
    } catch (err) {
      console.log(chalk.bold.red('❌ Errore creazione directory sub-bot:', err.message));
    }
    return;
  }

  try {
    const subBotFolders = readdirSync(subBotDirectory).filter(file =>
      statSync(join(subBotDirectory, file)).isDirectory()
    );

    if (subBotFolders.length === 0) {
      console.log(chalk.bold.magenta('Nessun sub-bot presente'));
      return;
    }

    const bots = [];
    const BATCH_SIZE = 2;
    
    for (let i = 0; i < subBotFolders.length; i += BATCH_SIZE) {
      const batch = subBotFolders.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (folder) => {
        const subAuthFile = join(subBotDirectory, folder);
        
        if (existsSync(join(subAuthFile, 'creds.json'))) {
          try {
            const { state: subState, saveCreds: subSaveCreds } = await useMultiFileAuthState(subAuthFile);
            const subConn = makeWASocket({
              ...connectionOptions,
              auth: {
                creds: subState.creds,
                keys: makeCacheableSignalKeyStore(subState.keys, logger),
              },
            });

            const subConnUpdateHandler = async (update) => {
              try {
                const { connection, lastDisconnect } = update;
                const error = lastDisconnect?.error;
                
                if (error) {
                  const errorMessage = (error.message || error.toString() || '').toLowerCase();
                  
                  if (SESSION_ERROR_PATTERNS.some(pattern => errorMessage.includes(pattern))) {
                    purgeSessionBatch([subAuthFile], true);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                  }
                }
                
                if (connection === 'close') {
                  await new Promise(resolve => setTimeout(resolve, 5000));
                }
              } catch {}
            };

            if (!subConn.connectionUpdateHandler) subConn.connectionUpdateHandler = subConnUpdateHandler.bind(subConn);
            if (!subConn.credsUpdateHandler) subConn.credsUpdateHandler = subSaveCreds.bind(subConn);
            
            try { subConn.ev.removeListener('connection.update', subConn.connectionUpdateHandler); } catch {}
            try { subConn.ev.removeListener('creds.update', subConn.credsUpdateHandler); } catch {}
            
            subConn.ev.on('connection.update', subConn.connectionUpdateHandler);
            subConn.ev.on('creds.update', subConn.credsUpdateHandler);

            bots.push(subConn);
          } catch (err) {
            console.log(chalk.bold.red(`❌ Errore sub-bot ${folder}:`, err.message));
          }
        }
      }));
      
      if (i + BATCH_SIZE < subBotFolders.length) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    global.conns = bots;
    if (bots.length > 0) {
      console.log(chalk.bold.magentaBright(`🌙 ${bots.length} sub-bot connessi`));
    }
  } catch (err) {
    console.log(chalk.bold.red('❌ Errore connessione sub-bot:', err.message));
  }
}

// ============================================================================
// ReloadHandler
// ============================================================================
let isInit = true;
let handler = await import('./handler.js');

global.reloadHandler = async function (restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
    if (Object.keys(Handler || {}).length) handler = Handler;
  } catch (e) {
    console.error(e);
  }
  
  if (restatConn) {
    const oldChats = global.conn.chats;
    try {
      if (global.conn?.ws) global.conn.ws.close();
    } catch {}

    try { global.conn.ev.removeAllListeners(); } catch {}

    global.conn = makeWASocket(connectionOptions, { chats: oldChats });
    try { global.store.bind(global.conn.ev); } catch {}
    attachCoreHandlers(global.conn);
    isInit = true;
  }
  
  if (!isInit) {
    if (conn.handler) try { conn.ev.removeListener('messages.upsert', conn.handler); } catch {}
    if (conn.participantsUpdate) try { conn.ev.removeListener('group-participants.update', conn.participantsUpdate); } catch {}
    if (conn.groupsUpdate) try { conn.ev.removeListener('groups.update', conn.groupsUpdate); } catch {}
    if (conn.onDelete) try { conn.ev.removeListener('message.delete', conn.onDelete); } catch {}
    if (conn.onCall) try { conn.ev.removeListener('call', conn.onCall); } catch {}
    if (conn.connectionUpdate) try { conn.ev.removeListener('connection.update', conn.connectionUpdate); } catch {}
    if (conn.credsUpdate) try { conn.ev.removeListener('creds.update', conn.credsUpdate); } catch {}
  }

  conn.welcome = '@user benvenuto/a in @subject';
  conn.bye = '@user ha abbandonato il gruppo';
  conn.spromote = '@user è stato promosso';
  conn.sdemote = '@user non è più admin';
  conn.sIcon = 'immagine gruppo modificata';
  conn.sRevoke = 'link reimpostato: @revoke';

  conn.handler = handler.handler.bind(global.conn);
  conn.participantsUpdate = handler.participantsUpdate.bind(global.conn);
  conn.groupsUpdate = handler.groupsUpdate.bind(global.conn);
  conn.onDelete = handler.deleteUpdate.bind(global.conn);
  conn.onCall = handler.callUpdate.bind(global.conn);
  conn.connectionUpdate = connectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn, true);

  try { conn.ev.removeListener('messages.upsert', conn.handler); } catch {}
  try { conn.ev.removeListener('group-participants.update', conn.participantsUpdate); } catch {}
  try { conn.ev.removeListener('groups.update', conn.groupsUpdate); } catch {}
  try { conn.ev.removeListener('message.delete', conn.onDelete); } catch {}
  try { conn.ev.removeListener('call', conn.onCall); } catch {}
  try { conn.ev.removeListener('connection.update', conn.connectionUpdate); } catch {}
  try { conn.ev.removeListener('creds.update', conn.credsUpdate); } catch {}

  conn.ev.on('messages.upsert', conn.handler);
  conn.ev.on('group-participants.update', conn.participantsUpdate);
  conn.ev.on('groups.update', conn.groupsUpdate);
  conn.ev.on('message.delete', conn.onDelete);
  conn.ev.on('call', conn.onCall);
  conn.ev.on('connection.update', conn.connectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);
  
  isInit = false;
  return true;
};

// IIFE avvio
(async () => {
  global.conns = [];
  try {
    attachCoreHandlers(conn);
    console.log(chalk.bold.magenta(`\n★ ChatUnity connesso ★\n`));
    await connectSubBots();
  } catch (error) {
    console.error(chalk.bold.bgRedBright(`🥀 Errore avvio: `, error));
  }
})();

// ============================================================================
// Plugin loading
// ============================================================================
const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};

async function filesInit() {
  const files = readdirSync(pluginFolder).filter(pluginFilter);
  
  let loaded = 0;
  let failed = 0;
  const failedPlugins = [];
  
  const BATCH_SIZE = 3;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (filename) => {
      try {
        const file = global.__filename(join(pluginFolder, filename));
        const module = await import(file);
        
        if (!module.default && !module.handler) {
          throw new Error('Plugin senza export default o handler');
        }
        
        global.plugins[filename] = module.default || module;
        loaded++;
      } catch (e) {
        failed++;
        failedPlugins.push({ filename, error: e.message });
        delete global.plugins[filename];
      }
    }));
  }
  
  console.log(chalk.bold.cyan(`\n📊 Caricamento completato:`));
  console.log(chalk.green(`   ✅ Caricati: ${loaded}`));
  console.log(chalk.yellow(`   📦 Totali: ${files.length}`));
  
  if (failedPlugins.length > 0) {
    console.log(chalk.bold.red(`\n⚠️  Plugin falliti: ${failedPlugins.length}`));
  }
  
  console.log();
}

filesInit().then((_) => {
  console.log(chalk.bold.green(`✅ Tutti i plugin processati`));
  console.log(chalk.gray(`   Plugin attivi: ${Object.keys(global.plugins).length}`));
}).catch(err => {
  console.error(chalk.bold.red(`❌ ERRORE CRITICO nel caricamento plugin:`));
  console.error(err);
});

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true);
    
    if (filename in global.plugins) {
      if (existsSync(dir)) {
        try { conn.logger.info(chalk.green(`✅ '${filename}' aggiornato`)); } catch {}
      } else {
        try { conn.logger.warn(`🗑️ '${filename}' eliminato`); } catch {}
        return delete global.plugins[filename];
      }
    } else {
      try { conn.logger.info(`🆕 '${filename}' rilevato`); } catch {}
    }
    
    const err = syntaxerror(fs.readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    
    if (err) {
      try { conn.logger.error(`❌ Errore in '${filename}'\n${format(err)}`); } catch {}
    } else {
      try {
        const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
        global.plugins[filename] = module.default || module;
      } catch (e) {
        try { conn.logger.error(`⚠️ Errore plugin '${filename}\n${format(e)}'`); } catch {}
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  }
};

Object.freeze(global.reload);

if (global.pluginWatcher) {
  try { global.pluginWatcher.close(); } catch {}
}
global.pluginWatcher = watch(pluginFolder, global.reload);
try { global.pluginWatcher.setMaxListeners(20); } catch {}

await global.reloadHandler();

async function _quickTest() {
  const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version']),
  ].map((p) => {
    return Promise.race([
      new Promise((resolve) => {
        p.on('close', (code) => {
          resolve(code !== 127);
        });
      }),
      new Promise((resolve) => {
        p.on('error', (_) => resolve(false));
      })
    ]);
  }));
  
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
  const s = global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find };
  Object.freeze(global.support);
}

function clearDirectory(dirPath) {
  if (!existsSync(dirPath)) {
    try {
      mkdirSync(dirPath, { recursive: true });
    } catch (e) {
      console.error(chalk.red(`Errore creazione ${dirPath}:`, e));
    }
    return;
  }
  
  const filenames = readdirSync(dirPath);
  filenames.forEach(file => {
    const filePath = join(dirPath, file);
    try {
      const stats = statSync(filePath);
      stats.isFile() 
        ? unlinkSync(filePath)
        : rmSync(filePath, { recursive: true, force: true });
    } catch {}
  });
}

function ripristinaTimer(conn) {
  if (conn.timerReset) clearInterval(conn.timerReset);
  
  conn.timerReset = setInterval(async () => {
    if (stopped === 'close' || !conn || !conn.user) return;
    clearDirectory(join(__dirname, 'tmp'));
    clearDirectory(join(__dirname, 'temp'));
  }, 1000 * 60 * 90);
}

_quickTest().then(() => conn.logger.info(chalk.bold.bgBlueBright(``)));

let filePath = fileURLToPath(import.meta.url);

if (global.mainWatcher) {
  try { global.mainWatcher.close(); } catch {}
}

global.mainWatcher = watch(filePath, async () => {
  console.log(chalk.bold.bgBlueBright("Main aggiornato"));
  await global.reloadHandler(true).catch(console.error);
});

try { global.mainWatcher.setMaxListeners(20); } catch {}