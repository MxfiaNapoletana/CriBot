//Plugin fatto da Gabs333 x Staff ChatUnity
// mute-listener.js - Listener per eliminare messaggi di utenti mutati
import fs from 'fs'

const DB_PATH = './data/muted_users.json'

function loadDB() {
  try {
    if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true })
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({}))
      return {}
    }
    const data = fs.readFileSync(DB_PATH, 'utf8')
    return JSON.parse(data)
  } catch (e) {
    console.error('❌ Errore nel caricare il database:', e)
    return {}
  }
}

function isMuted(userId, chatId) {
  const db = loadDB()
  const key = `${chatId}_${userId}`
  return db[key]?.muto === true
}

// Questo viene eseguito per OGNI messaggio
export async function all(m) {
  try {
    // Ignora messaggi dal bot stesso
    if (m.fromMe) return
    
    // Solo nei gruppi
    if (!m.isGroup) return
    
    // Ignora se non c'è un sender valido
    if (!m.sender) return
    
    // Verifica se l'utente è mutato in questo gruppo
    if (isMuted(m.sender, m.chat)) {
      console.log('🔇 [MUTE-LISTENER] Utente mutato rilevato! Eliminazione in corso...')
      
      try {
        // Elimina il messaggio
        await this.sendMessage(m.chat, { delete: m.key })
        console.log('✅ [MUTE-LISTENER] Messaggio eliminato con successo')
        
        // Avvisa l'utente (solo una volta al minuto per non spammare)
        const now = Date.now()
        if (!global.muteWarnings) global.muteWarnings = {}
        const warningKey = `${m.chat}_${m.sender}`
        const lastWarning = global.muteWarnings[warningKey] || 0
        
        if (now - lastWarning > 60000) { // 60 secondi
          global.muteWarnings[warningKey] = now
          
          const warning = await this.sendMessage(m.chat, {
            text: '🔇 @' + m.sender.split('@')[0] + ' 𝐬𝐞𝐢 𝐦𝐮𝐭𝐚𝐭𝐨/𝐚, 𝐢 𝐭𝐮𝐨𝐢 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐯𝐞𝐫𝐫𝐚𝐧𝐧𝐨 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐢 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐞',
            mentions: [m.sender]
          })
          
          // Elimina l'avviso dopo 5 secondi
          setTimeout(async () => {
            try {
              await this.sendMessage(m.chat, { delete: warning.key })
            } catch (e) {
              console.error('⚠️ [MUTE-LISTENER] Errore eliminazione avviso:', e)
            }
          }, 5000)
        }
      } catch (e) {
        console.error('❌ [MUTE-LISTENER] Errore nell\'eliminare il messaggio:', e)
      }
    }
  } catch (e) {
    console.error('❌ [MUTE-LISTENER] Errore nella funzione all:', e)
  }
}