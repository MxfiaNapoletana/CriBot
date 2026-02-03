import chalk from 'chalk'
import { watchFile } from 'fs'
import { fileURLToPath } from 'url'

const nameCache = new Map()
const CACHE_TTL = 300000 // 5 minuti

// Tipi completi di stub message
const WAMessageStubType = {
  0: 'SCONOSCIUTO',
  20: 'GRUPPO_CREATO',
  21: 'SOGGETTO_CAMBIATO',
  22: 'ICONA_CAMBIATA',
  27: 'PARTECIPANTE_AGGIUNTO',
  28: 'PARTECIPANTE_RIMOSSO',
  29: 'PROMOSSO_ADMIN',
  30: 'RIMOSSO_ADMIN',
  32: 'PARTECIPANTE_USCITO',
  74: 'VIEWED_ONCE',
  113: 'CHIAMATA_PERSA',
  114: 'VIDEOCHIAMATA_PERSA'
}

// Contatore errori di sessione
if (!global.sessionErrorStats) {
  global.sessionErrorStats = {
    count: 0,
    lastReset: Date.now(),
    errors: new Map()
  }
}

async function getCachedName(conn, jid) {
  if (!jid) return null
  const cached = nameCache.get(jid)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.name
  }
  try {
    let name = null
    
    try {
      name = await conn.getName(jid)
    } catch {}
    
    if (!name && conn.contacts && conn.contacts[jid]) {
      name = conn.contacts[jid].name || conn.contacts[jid].notify || conn.contacts[jid].verifiedName
    }
    
    if (!name && global.store) {
      const contact = global.store.contacts?.[jid]
      name = contact?.name || contact?.notify || contact?.verifiedName
    }
    
    if (!name && conn.chats) {
      const chat = Object.values(conn.chats).find(c => 
        c.messages && Object.values(c.messages).some(msg => 
          (msg.key?.participant === jid || msg.key?.remoteJid === jid) && msg.pushName
        )
      )
      if (chat) {
        const msg = Object.values(chat.messages).find(msg => 
          (msg.key?.participant === jid || msg.key?.remoteJid === jid) && msg.pushName
        )
        name = msg?.pushName
      }
    }
    
    if (name) {
      nameCache.set(jid, { name, timestamp: Date.now() })
    }
    return name
  } catch (e) {
    return null
  }
}

function safeDecodeJid(conn, jid) {
  if (!jid) return null
  try {
    return conn.decodeJid?.(jid) || jid
  } catch {
    return jid
  }
}

// Trova il vero numero da un LID
async function findRealNumberFromLid(conn, lidJid, groupJid) {
  try {
    if (global.resolveLid) {
      const resolved = global.resolveLid(lidJid)
      if (resolved && resolved !== lidJid && !/@lid/.test(resolved)) {
        return resolved
      }
    }
    
    if (groupJid) {
      try {
        const freshMetadata = await conn.groupMetadata(groupJid)
        if (freshMetadata && freshMetadata.participants) {
          for (const participant of freshMetadata.participants) {
            if (participant.lid === lidJid && participant.jid) {
              const realJid = conn.decodeJid(participant.jid)
              if (!/@lid/.test(realJid)) {
                if (global.updateLidMapping) {
                  global.updateLidMapping(lidJid, realJid)
                }
                return realJid
              }
            }
          }
        }
      } catch (e) {}
    }
    
    if (groupJid && global.groupCache) {
      const cachedMetadata = global.groupCache.get(groupJid)
      if (cachedMetadata && cachedMetadata.participants) {
        for (const participant of cachedMetadata.participants) {
          if (participant.lid === lidJid && participant.jid) {
            const realJid = conn.decodeJid(participant.jid)
            if (!/@lid/.test(realJid)) {
              if (global.updateLidMapping) {
                global.updateLidMapping(lidJid, realJid)
              }
              return realJid
            }
          }
        }
      }
    }
    
    if (groupJid && conn.chats && conn.chats[groupJid]) {
      const metadata = conn.chats[groupJid].metadata
      if (metadata && metadata.participants) {
        for (const participant of metadata.participants) {
          if (participant.lid === lidJid && participant.jid) {
            const realJid = conn.decodeJid(participant.jid)
            if (!/@lid/.test(realJid)) {
              if (global.updateLidMapping) {
                global.updateLidMapping(lidJid, realJid)
              }
              return realJid
            }
          }
        }
      }
    }
    
    if (global.store && global.store.contacts) {
      for (const [jid, contact] of Object.entries(global.store.contacts)) {
        if (contact.lid === lidJid && !/@lid/.test(jid)) {
          if (global.updateLidMapping) {
            global.updateLidMapping(lidJid, jid)
          }
          return jid
        }
      }
    }
  } catch (e) {}
  return null
}

// Funzione per rilevare errori di sessione
function detectSessionError(m, error) {
  const sessionErrorPatterns = [
    'invalid pre key',
    'prekey',
    'pre-key',
    'no session record',
    'invalid session',
    'session error',
    'bad mac',
    'decryption error',
    'failed to decrypt',
    'decrypt'
  ]
  
  let errorType = null
  let errorMsg = ''
  
  if (m.error || m.decryptionError || m.sessionError) {
    errorType = 'MESSAGE_ERROR'
    errorMsg = m.error?.message || m.decryptionError?.message || m.sessionError?.message || 'Errore sconosciuto'
  }
  
  if (error && error.message) {
    const msg = error.message.toLowerCase()
    if (sessionErrorPatterns.some(pattern => msg.includes(pattern))) {
      errorType = 'SESSION_ERROR'
      errorMsg = error.message
    }
  }
  
  if (m.messageStubType === 0 && !m.message) {
    errorType = 'STUB_ERROR'
    errorMsg = 'Messaggio stub senza contenuto (probabile errore sessione)'
  }
  
  if (errorType) {
    const now = Date.now()
    
    if (now - global.sessionErrorStats.lastReset > 3600000) {
      global.sessionErrorStats.count = 0
      global.sessionErrorStats.errors.clear()
      global.sessionErrorStats.lastReset = now
    }
    
    global.sessionErrorStats.count++
    
    const errorKey = `${errorType}:${errorMsg.slice(0, 50)}`
    const current = global.sessionErrorStats.errors.get(errorKey) || 0
    global.sessionErrorStats.errors.set(errorKey, current + 1)
  }
  
  return { errorType, errorMsg }
}

// FUNZIONE MIGLIORATA: Gestisci LID meglio
function extractCleanNumber(jid, fallbackName = '', isLid = false) {
  if (!jid) return 'Sconosciuto'
  
  // Se è un LID non risolto, mostra solo le ultime 8 cifre come ID
  if (isLid) {
    const lidNumbers = jid.replace(/[^0-9]/g, '')
    return lidNumbers.slice(-8) || 'Unknown'
  }
  
  // Step 1: Pulisci il JID
  let cleaned = jid
    .replace('@s.whatsapp.net', '')
    .replace('@lid', '')
    .replace('@g.us', '')
    .split(':')[0] // Rimuovi tutto dopo ":"
  
  // Step 2: Estrai solo numeri
  const numbersOnly = cleaned.replace(/\D/g, '')
  
  // Step 3: Se è già valido (8-15 cifre), restituiscilo
  if (/^\d{8,15}$/.test(numbersOnly)) {
    return numbersOnly
  }
  
  // Step 4: Se è troppo lungo, prendi SOLO gli ultimi 12 numeri
  if (numbersOnly.length > 15) {
    return numbersOnly.slice(-12)
  }
  
  // Step 5: Se è troppo corto ma > 0, restituiscilo comunque
  if (numbersOnly.length > 0) {
    return numbersOnly
  }
  
  // Step 6: ULTIMO FALLBACK - cerca nel nome
  if (fallbackName) {
    const phoneMatch = fallbackName.match(/\+?(\d[\d\s-]{7,14}\d)/)
    if (phoneMatch) {
      const extracted = phoneMatch[1].replace(/[\s-]/g, '')
      if (extracted.length >= 8 && extracted.length <= 15) {
        return extracted
      }
    }
  }
  
  return 'Sconosciuto'
}

export default async function (m, conn = { user: {} }) {
  if (!m || m.message?.protocolMessage) return
  
  const { errorType, errorMsg } = detectSessionError(m)
  
  if (errorType) {
    const now = new Date().toLocaleString("it-IT", {
      timeZone: "Europe/Rome",
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    const errorCount = global.sessionErrorStats.count
    const errorIcon = errorType === 'SESSION_ERROR' ? '🔐' : errorType === 'MESSAGE_ERROR' ? '⚠️' : '❌'
    
    console.log(chalk.red('┏━━━━━━━━━━━━━━━') + chalk.bold.yellow('⚠️ PROBLEMA SESSIONE') + chalk.red('━━━━━━━━━━━━━━━━━━━━━━━┓'))
    console.log(chalk.red('┃ ') + chalk.yellow(`${errorIcon} Tipo: `) + chalk.white(errorType))
    console.log(chalk.red('┃ ') + chalk.gray('⏰ Ora: ' + now))
    console.log(chalk.red('┃ ') + chalk.yellow('📊 Errori (ultima ora): ') + chalk.white(errorCount))
    console.log(chalk.red('┃ ') + chalk.yellow('💬 Chat: ') + chalk.white(m.chat || 'Sconosciuta'))
    
    const shortError = errorMsg.slice(0, 60) + (errorMsg.length > 60 ? '...' : '')
    console.log(chalk.red('┃ ') + chalk.yellow('📝 Dettaglio: ') + chalk.gray(shortError))
    
    console.log(chalk.red('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'))
    console.log()
    
    return
  }
  
  try {
    let sender = m.key?.participant || m.sender || m.key?.remoteJid
    if (!sender) return

    let resolvedSender = safeDecodeJid(conn, sender)

    // GESTIONE NUMERI LID
    if (/@lid/.test(resolvedSender)) {
      const quickResolved = global.resolveLid?.(resolvedSender)
      if (quickResolved && quickResolved !== resolvedSender && !/@lid/.test(quickResolved)) {
        resolvedSender = quickResolved
      } else {
        const realJid = await findRealNumberFromLid(conn, resolvedSender, m.chat)
        if (realJid && !/@lid/.test(realJid)) {
          resolvedSender = realJid
          if (global.updateLidMapping) {
            global.updateLidMapping(sender, realJid)
          }
        }
      }
    }

    let isUnresolvedLid = /@lid/.test(resolvedSender)
    
    if (resolvedSender === conn.user?.jid) return
    
    let senderName = await getCachedName(conn, resolvedSender)
    
    if (!senderName && m.pushName) {
      senderName = m.pushName
      nameCache.set(resolvedSender, { name: senderName, timestamp: Date.now() })
    }
    
    if (!senderName && global.db?.data?.users?.[resolvedSender]) {
      senderName = global.db.data.users[resolvedSender].name
    }
    
    const chatName = await getCachedName(conn, m.chat)
    
    // USA LA FUNZIONE CORRETTA CON FLAG LID
    const senderNum = extractCleanNumber(resolvedSender, senderName || m.pushName, isUnresolvedLid)
    
    // Display diverso per LID vs numero normale
    const displaySender = isUnresolvedLid 
      ? chalk.yellow('LID-') + chalk.gray(senderNum) + (senderName ? chalk.gray(' ~ ') + chalk.white(senderName) : '')
      : chalk.cyan('+' + senderNum) + (senderName ? chalk.gray(' ~ ') + chalk.white(senderName) : '')
    
    const botNum = '+' + extractCleanNumber(conn.user?.jid || '', '', false)
    const userName = conn.user?.name || conn.user?.verifiedName || "CriBot"
    
    const messageDate = new Date(
      m.messageTimestamp 
        ? 1000 * (m.messageTimestamp.low || m.messageTimestamp) 
        : Date.now()
    ).toLocaleString("it-IT", {
      timeZone: "Europe/Rome",
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    const stubType = WAMessageStubType[m.messageStubType] || 'MESSAGGIO'
    
    let messageType = 'Testo'
    let viewOnceInfo = ''
    
    if (m.message?.viewOnceMessageV2 || m.message?.viewOnceMessage) {
      const viewOnceMsg = m.message.viewOnceMessageV2?.message || m.message.viewOnceMessage?.message
      viewOnceInfo = `🔒 VIEWONCE RILEVATO`
      
      if (viewOnceMsg?.imageMessage) messageType = '🔒 Immagine ViewOnce'
      else if (viewOnceMsg?.videoMessage) messageType = '🔒 Video ViewOnce'
      else messageType = '🔒 ViewOnce Sconosciuto'
    } else if (m.message?.buttonsResponseMessage) {
      messageType = 'Bottone'
    } else if (m.message?.listResponseMessage) {
      messageType = 'Lista'
    } else if (m.message?.templateButtonReplyMessage) {
      messageType = 'Template'
    } else if (m.message?.interactiveResponseMessage) {
      messageType = 'Bottone Nativo'
    } else if (m.mtype) {
      messageType = m.mtype
        .replace(/message$/i, '')
        .replace('audio', m.msg?.ptt ? 'Vocale' : 'Audio')
        .replace('conversation', 'Testo')
        .replace('extendedText', 'Testo')
    }
    
    console.log(chalk.cyan('┏━━━━━━━━━━━━━━━') + chalk.bold.magenta('𝐂𝐫𝐢𝐁𝐨𝐭') + chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'))
    console.log(chalk.cyan('┃ ') + chalk.magenta('📱 Bot: ') + chalk.green(botNum + ' ~ ' + userName))
    console.log(chalk.cyan('┃ ') + chalk.gray('⏰ Data: ' + messageDate))
    console.log(chalk.cyan('┃ ') + chalk.yellow('📂 Tipo: ') + stubType + chalk.gray(' | ') + messageType)
    
    if (isUnresolvedLid) {
      console.log(chalk.cyan('┃ ') + chalk.yellow('⚠️  LID non risolto (numero privato)'))
    }
    
    if (viewOnceInfo) {
      console.log(chalk.cyan('┃ ') + chalk.red(viewOnceInfo))
    }
    
    console.log(chalk.cyan('┃ ') + chalk.blue('👤 Da: ') + displaySender)
    console.log(chalk.cyan('┃ ') + chalk.green('💬 Chat: ') + (chatName || m.chat) + (m.isGroup ? ' (Gruppo)' : ' (Privato)'))
    
    // ESTRAZIONE CONTENUTO
    let displayText = ''
    let hasContent = false
    
    if (m.body && typeof m.body === 'string' && m.body.trim()) {
      displayText = m.body
      hasContent = true
    }
    else if (m.text && typeof m.text === 'string' && m.text.trim()) {
      displayText = m.text
      hasContent = true
    }
    else if (m.message?.interactiveResponseMessage) {
      const nativeFlow = m.message.interactiveResponseMessage.nativeFlowResponseMessage
      if (nativeFlow?.paramsJson) {
        try {
          const params = JSON.parse(nativeFlow.paramsJson)
          displayText = params.id || params.display_text || params.name || 'Bottone nativo premuto'
          hasContent = true
        } catch (e) {
          displayText = nativeFlow.paramsJson || 'Bottone nativo (errore parsing)'
          hasContent = true
        }
      }
    }
    else if (m.message?.buttonsResponseMessage) {
      displayText = m.message.buttonsResponseMessage.selectedDisplayText || 
                    m.message.buttonsResponseMessage.selectedButtonId
      hasContent = true
    } 
    else if (m.message?.listResponseMessage) {
      displayText = m.message.listResponseMessage.title ||
                    m.message.listResponseMessage.singleSelectReply?.selectedRowId
      hasContent = true
    } 
    else if (m.message?.templateButtonReplyMessage) {
      displayText = m.message.templateButtonReplyMessage.selectedDisplayText ||
                    m.message.templateButtonReplyMessage.selectedId
      hasContent = true
    } 
    else if (m.message?.conversation) {
      displayText = m.message.conversation
      hasContent = true
    } else if (m.message?.extendedTextMessage?.text) {
      displayText = m.message.extendedTextMessage.text
      hasContent = true
    } else if (m.message?.imageMessage?.caption) {
      displayText = m.message.imageMessage.caption
      hasContent = true
    } else if (m.message?.videoMessage?.caption) {
      displayText = m.message.videoMessage.caption
      hasContent = true
    } else if (m.message?.documentMessage?.caption) {
      displayText = m.message.documentMessage.caption
      hasContent = true
    }
    
    const hasMedia = /document|audio|video|image|sticker/i.test(m.mtype)
    
    // MOSTRA IL TESTO SE PRESENTE
    if (displayText && displayText.trim()) {
      const textColor = m.isCommand ? chalk.yellow : chalk.white
      const maxLen = 70
      const lines = displayText.match(new RegExp(`.{1,${maxLen}}`, 'g')) || [displayText]
      lines.forEach((line, i) => {
        if (i === 0) {
          console.log(chalk.cyan('┃ ') + chalk.gray('💭 ') + textColor(line))
        } else {
          console.log(chalk.cyan('┃ ') + chalk.gray('   ') + textColor(line))
        }
      })
    } else if (!hasMedia) {
      console.log(chalk.cyan('┃ ') + chalk.yellow('⚠️  Messaggio vuoto (possibile errore)'))
    }
    
    // Allegati
    if (/document/i.test(m.mtype)) {
      console.log(chalk.cyan('┃ ') + chalk.cyan('📄 ' + (m.msg?.fileName || 'Documento')))
    } else if (/audio/i.test(m.mtype)) {
      const duration = m.msg?.seconds || 0
      console.log(chalk.cyan('┃ ') + chalk.cyan(`${m.msg?.ptt ? '🎤' : '🎵'} ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`))
    } else if (/video/i.test(m.mtype)) {
      console.log(chalk.cyan('┃ ') + chalk.cyan('🎥 Video'))
    } else if (/image/i.test(m.mtype)) {
      console.log(chalk.cyan('┃ ') + chalk.cyan('🖼️ Immagine'))
    } else if (/sticker/i.test(m.mtype)) {
      console.log(chalk.cyan('┃ ') + chalk.cyan('🎭 Sticker'))
    }
    
    console.log(chalk.cyan('┗━━━━━━━━━━━━━━━') + chalk.bold.magenta('𝐂𝐫𝐢𝐁𝐨𝐭') + chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'))
    console.log()
    
  } catch (e) {
    const { errorType: catchErrorType, errorMsg: catchErrorMsg } = detectSessionError(m, e)
    
    if (catchErrorType) {
      const now = new Date().toLocaleString("it-IT", {
        timeZone: "Europe/Rome",
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      
      console.log(chalk.red('┏━━━━━━━━━━━━━━━') + chalk.bold.yellow('⚠️ ERRORE SESSIONE') + chalk.red('━━━━━━━━━━━━━━━━━━━━━━━━┓'))
      console.log(chalk.red('┃ ') + chalk.yellow('🔐 Tipo: ') + chalk.white(catchErrorType))
      console.log(chalk.red('┃ ') + chalk.gray('⏰ Ora: ' + now))
      console.log(chalk.red('┃ ') + chalk.yellow('💬 Chat: ') + chalk.white(m.chat || 'Sconosciuta'))
      console.log(chalk.red('┃ ') + chalk.yellow('📝 Errore: ') + chalk.gray(catchErrorMsg.slice(0, 60)))
      console.log(chalk.red('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'))
      console.log()
    } else {
      console.error(chalk.red('❌ Errore log:'), e.message)
    }
  }
}

const __filename = fileURLToPath(import.meta.url)
watchFile(__filename, () => {
  console.log(chalk.magenta("♻️ Ricaricato print.js"))
  nameCache.clear()
})
