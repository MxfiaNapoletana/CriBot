/*
Plugin: .visual on/off con BEL FONT
- Comando: .visual on  -> abilita la cancellazione automatica di media "view-once" (immagini/video view-once)
- Comando: .visual off -> disabilita
- Il nome della chat e il messaggio di notifica useranno un BEL FONT fullwidth.
*/

const stylizeFullwidth = (str = '') => {
  return [...String(str)].map(ch => {
    const code = ch.charCodeAt(0)
    if (code >= 0x41 && code <= 0x5A) return String.fromCodePoint(0xFF21 + (code - 0x41)) // A-Z
    if (code >= 0x61 && code <= 0x7A) return String.fromCodePoint(0xFF41 + (code - 0x61)) // a-z
    if (code >= 0x30 && code <= 0x39) return String.fromCodePoint(0xFF10 + (code - 0x30)) // 0-9
    return ch
  }).join('')
}

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const chatId = m.chat
  if (!global.db) global.db = { data: { chats: {} } }
  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {}

  const arg = (args && args[0]) ? args[0].toLowerCase() : (text || '').trim().toLowerCase()
  if (!arg || !['on', 'off'].includes(arg)) {
    const stato = global.db.data.chats[chatId].visual ? 'ＯＮ' : 'ＯＦＦ'
    return conn.reply(m.chat, `使用: ${usedPrefix}${command} on | off\n狀態: ${stato}`, m)
  }

  if (arg === 'on') {
    global.db.data.chats[chatId].visual = true
    await conn.reply(m.chat, '✅ ＢＥＬ ＦＯＮＴ: Ｍｏｄａｌｉｔà *ＶＩＳＵＡＬ* Ａｔｔｉｖａｔａ! Cancellerò automaticamente i view-once.', m)
  } else {
    global.db.data.chats[chatId].visual = false
    await conn.reply(m.chat, '🛑 ＢＥＬ ＦＯＮＴ: Ｍｏｄａｌｉｔà *ＶＩＳＵＡＬ* Ｄｉｓａｔｔｉｖａｔａ! Non cancellerò più i view-once.', m)
  }
}

handler.command = ['visual']
handler.tags = ['owner', 'admin']
handler.help = ['visual on', 'visual off']

handler.before = async function (message, { conn }) {
  try {
    const m = message
    if (!m) return
    const chatId = m.key?.remoteJid || m.chat || null
    if (!chatId) return

    if (!global.db) global.db = { data: { chats: {} } }
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {}

    const enabled = !!global.db.data.chats[chatId].visual
    if (!enabled) return
    if (m.key?.fromMe) return

    const msg = m.message || m.msg || null
    if (!msg) return

    let viewOnce = msg.viewOnceMessage || msg.message?.viewOnceMessage || msg.ephemeralMessage?.message?.viewOnceMessage
    if (!viewOnce) return

    const inner = viewOnce.message || viewOnce
    const isImage = inner?.imageMessage
    const isVideo = inner?.videoMessage
    if (!isImage && !isVideo) return

    try {
      if (conn?.sendMessage) await conn.sendMessage(chatId, { delete: m.key })
      else if (typeof conn?.deleteMessage === 'function') {
        try { await conn.deleteMessage(chatId, m.key.id, { remoteJid: chatId, fromMe: false }) } 
        catch { try { await conn.deleteMessage(chatId, m.key.id, {}) } catch {} }
      }

      try {
        const who = m.key?.participant || m.participant || null
        const mention = who ? [who] : []
        const belloChat = stylizeFullwidth(chatId.split('@')[0])
        await conn.sendMessage(chatId, { text: `⚠️ ＢＥＬ ＦＯＮＴ: Ho cancellato un media view-once in ${belloChat} inviato da ${who ? `@${who.split('@')[0]}` : 'un utente'}.`, mentions: mention })
      } catch {}

    } catch (err) {
      console.error('[visual-plugin] impossibile cancellare view-once:', err?.toString?.() || err)
    }

  } catch (e) {
    console.error('[visual-plugin] errore in before hook:', e?.toString?.() || e)
  }
}

export default handler