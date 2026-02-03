// Keep-Alive MINIMAL - Solo per evitare disconnessioni
// NON invia presence update per non interferire con crittografia

let keepAliveInterval = null;
let lastActivity = Date.now();

export async function before(m, { conn }) {
    // Aggiorna timestamp attività
    lastActivity = Date.now();
    
    // Inizializza keep-alive MINIMAL
    if (!keepAliveInterval) {
        console.log('╔════════════════════════════════════╗');
        console.log('║   🔵 KEEP-ALIVE MINIMAL           ║');
        console.log('║   Zero interferenza crittografia  ║');
        console.log('╚════════════════════════════════════╝');
        
        // Keep-alive SOLO ogni 15 minuti e SOLO se inattivo >10 minuti
        keepAliveInterval = setInterval(async () => {
            try {
                const inactiveMinutes = Math.floor((Date.now() - lastActivity) / 60000);
                
                // Solo se MOLTO inattivo
                if (inactiveMinutes > 10) {
                    // Ping minimale senza presence update
                    await conn.query({
                        tag: 'iq',
                        attrs: {
                            type: 'get',
                            xmlns: 'w:p',
                            to: '@s.whatsapp.net'
                        }
                    }).catch(() => {});
                    
                    console.log(`[KEEP-ALIVE] Ping ${new Date().toLocaleTimeString()} (${inactiveMinutes}min inattivo)`);
                }
                
            } catch (e) {
                // Ignora errori
            }
        }, 15 * 60 * 1000); // Ogni 15 minuti
        
        // NO presence interval - lascia gestire a WhatsApp
        
        process.on('exit', () => {
            if (keepAliveInterval) clearInterval(keepAliveInterval);
        });
    }
    
    // NO presenza nei gruppi - causa conflitti con crittografia
    
    return true;
}

export function __esModule() {
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
    }
}