//Plugin fatto da Gabs333 x Staff ChatUnity
// Plugin WhatsApp Bot - Muta/Smuta + Auto Delete
// Basato su @real-jiakai/wa-multi-device

import fetch from 'node-fetch'
import fs from 'fs'

// Database separato per utenti mutati
const DB_PATH = './data/muted_users.json'

// Funzioni per gestire il database
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

function saveDB(data) {
  try {
    if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true })
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('❌ Errore nel salvare il database:', e)
  }
}

function isMuted(userId, chatId) {
  const db = loadDB()
  const key = `${chatId}_${userId}`
  return db[key]?.muto === true
}

function setMuted(userId, chatId, value) {
  const db = loadDB()
  const key = `${chatId}_${userId}`
  if (!db[key]) db[key] = {}
  db[key].muto = value
  db[key].timestamp = Date.now()
  saveDB(db)
}

// AUTO DELETE - Questo viene eseguito PRIMA di tutti i comandi
export async function before(m) {
  try {
    // Ignora messaggi dal bot stesso
    if (m.fromMe) return true
    
    // Solo nei gruppi
    if (!m.isGroup) return true
    
    // Ignora se non c'è un sender valido
    if (!m.sender) return true
    
    // Verifica se l'utente è mutato in questo gruppo
    if (isMuted(m.sender, m.chat)) {
      console.log('🔇 [MUTE] Tentativo di eliminare messaggio da ' + m.sender)
      
      try {
        // Elimina il messaggio
        await this.sendMessage(m.chat, { delete: m.key })
        console.log('✅ [MUTE] Messaggio eliminato con successo')
        
        // Avvisa l'utente (solo una volta al minuto per non spammare)
        const now = Date.now()
        if (!global.muteWarnings) global.muteWarnings = {}
        const warningKey = `${m.chat}_${m.sender}`
        const lastWarning = global.muteWarnings[warningKey] || 0
        
        if (now - lastWarning > 60000) { // 60 secondi
          global.muteWarnings[warningKey] = now
          
          const warning = await this.sendMessage(m.chat, {
            text: `🔇 @${m.sender.split('@')[0]} 𝐬𝐞𝐢 𝐦𝐮𝐭𝐚𝐭𝐨/𝐚, 𝐢 𝐭𝐮𝐨𝐢 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐯𝐞𝐫𝐫𝐚𝐧𝐧𝐨 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐢 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐞`,
            mentions: [m.sender]
          })
          
          // Elimina l'avviso dopo 5 secondi
          setTimeout(async () => {
            try {
              await this.sendMessage(m.chat, { delete: warning.key })
            } catch (e) {
              console.error('⚠️ [MUTE] Errore eliminazione avviso:', e)
            }
          }, 5000)
        }
        
        return false // Blocca l'elaborazione del messaggio
      } catch (e) {
        console.error('❌ [MUTE] Errore nell\'eliminare il messaggio:', e)
        return false
      }
    }
    
    return true // Continua con l'elaborazione normale
  } catch (e) {
    console.error('❌ [MUTE] Errore nella funzione before:', e)
    return true
  }
}

// COMANDI MUTA/SMUTA
const handler = async (m, { conn, command, text, isAdmin, isBotAdmin }) => {
  // Verifica che il bot sia admin
  if (!isBotAdmin) throw '⚠️ 𝐈𝐥 𝐛𝐨𝐭 𝐝𝐞𝐯𝐞 𝐞𝐬𝐬𝐞𝐫𝐞 𝐚𝐦𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐞 𝐩𝐞𝐫 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐫𝐞 𝐢 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢'
  
  if (command === 'muta') {
    if (!isAdmin) throw '❌ 𝐒𝐨𝐥𝐨 𝐮𝐧 𝐚𝐦𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐞 𝐩𝐮𝐨̀ 𝐞𝐬𝐞𝐠𝐮𝐢𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 👮'
    
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupOwner = groupMetadata.owner || m.chat.split('-')[0] + '@s.whatsapp.net'
    const participants = groupMetadata.participants
    
    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
    
    if (!user || !user.includes('@')) {
      return conn.reply(m.chat, '⚠️ 𝐓𝐚𝐠𝐠𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐝𝐚 𝐦𝐮𝐭𝐚𝐫𝐞 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐥 𝐬𝐮𝐨 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 👤', m)
    }
    
    // Normalizza il numero
    if (!user.endsWith('@s.whatsapp.net')) {
      user = user.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }
    
    console.log('🔍 [MUTE] User da mutare:', user)
    console.log('🔍 [MUTE] Chat:', m.chat)
    
    if (user === groupOwner) throw '⛔ 𝐈𝐥 𝐜𝐫𝐞𝐚𝐭𝐨𝐫𝐞 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐧𝐨𝐧 𝐩𝐮𝐨̀ 𝐞𝐬𝐬𝐞𝐫𝐞 𝐦𝐮𝐭𝐚𝐭𝐨'
    
    if (user === conn.user.jid) throw '⛔ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐦𝐮𝐭𝐚𝐫𝐞 𝐢𝐥 𝐛𝐨𝐭 🤖'
    
    // Verifica se l'utente da mutare è admin
    const targetParticipant = participants.find(p => p.id === user)
    if (targetParticipant && targetParticipant.admin) {
      throw '⚠️ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐦𝐮𝐭𝐚𝐫𝐞 𝐮𝐧 𝐚𝐦𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐞 👮'
    }
    
    if (isMuted(user, m.chat)) {
      throw '🔇 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 𝐞̀ 𝐠𝐢𝐚̀ 𝐬𝐭𝐚𝐭𝐨 𝐦𝐮𝐭𝐚𝐭𝐨/𝐚'
    }
    
    setMuted(user, m.chat, true)
    
    console.log('✅ [MUTE] Database salvato - User:', user, 'Chat:', m.chat)
    console.log('✅ [MUTE] Verifica mute:', isMuted(user, m.chat))
    
    let fakeContact = {
      'key': {
        'participants': '0@s.whatsapp.net',
        'fromMe': false,
        'id': 'Halo'
      },
      'message': {
        'locationMessage': {
          'name': '𝐔𝐭𝐞𝐧𝐭𝐞 𝐦𝐮𝐭𝐚𝐭𝐨/𝐚',
          'jpegThumbnail': await (await fetch('https://telegra.ph/file/f8324d9798fa2ed2317bc.png')).buffer(),
          'vcard': 'BEGIN:VCARD\nVERSION:3.0\nN:;ChatUnity;;;\nFN:ChatUnity\nORG:ChatUnity\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:ChatUnity\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:ChatUnity\nEND:VCARD'
        }
      },
      'participant': '0@s.whatsapp.net'
    }
    
    conn.reply(m.chat, `🔇 @${user.split('@')[0]} 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐦𝐮𝐭𝐚𝐭𝐨 (𝐠𝐨𝐝𝐨)\n\n𝐈 𝐬𝐮𝐨𝐢 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐯𝐞𝐫𝐫𝐚𝐧𝐧𝐨 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐢 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐞 ✨`, fakeContact, null, { mentions: [user] })
    
    console.log(`✅ [MUTE] Utente ${user} mutato in ${m.chat}`)
  }
  
  if (command === 'smuta') {
    if (!isAdmin) throw '❌ 𝐒𝐨𝐥𝐨 𝐮𝐧 𝐚𝐦𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐞 𝐩𝐮𝐨̀ 𝐞𝐬𝐞𝐠𝐮𝐢𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 👮'
    
    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
    
    if (!user || !user.includes('@')) {
      return conn.reply(m.chat, '⚠️ 𝐓𝐚𝐠𝐠𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐝𝐚 𝐬𝐦𝐮𝐭𝐚𝐫𝐞 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐥 𝐬𝐮𝐨 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 👤', m)
    }
    
    // Normalizza il numero
    if (!user.endsWith('@s.whatsapp.net')) {
      user = user.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }
    
    if (!isMuted(user, m.chat)) {
      throw '🔊 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐞̀ 𝐦𝐮𝐭𝐚𝐭𝐨'
    }
    
    setMuted(user, m.chat, false)
    
    let fakeContact = {
      'key': {
        'participants': '0@s.whatsapp.net',
        'fromMe': false,
        'id': 'Halo'
      },
      'message': {
        'locationMessage': {
          'name': '𝐔𝐭𝐞𝐧𝐭𝐞 𝐬𝐦𝐮𝐭𝐚𝐭𝐨/𝐚',
          'jpegThumbnail': await (await fetch('https://telegra.ph/file/aea704d0b242b8c41bf15.png')).buffer(),
          'vcard': 'BEGIN:VCARD\nVERSION:3.0\nN:;ChatUnity;;;\nFN:ChatUnity\nORG:ChatUnity\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:ChatUnity\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:ChatUnity\nEND:VCARD'
        }
      },
      'participant': '0@s.whatsapp.net'
    }
    
    conn.reply(m.chat, `🔊 @${user.split('@')[0]} 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐬𝐦𝐮𝐭𝐚𝐭𝐨 (𝐬𝐢 𝐬𝐭𝐚𝐯𝐚 𝐜𝐨𝐬𝐢̀ 𝐛𝐞𝐧𝐞)\n\n𝐈 𝐬𝐮𝐨𝐢 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐧𝐨𝐧 𝐯𝐞𝐫𝐫𝐚𝐧𝐧𝐨 𝐩𝐢𝐮̀ 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐢`, fakeContact, null, { mentions: [user] })
    
    console.log(`✅ [MUTE] Utente ${user} smutato in ${m.chat}`)
  }
}

handler.command = /^(muta|smuta)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
