// Lista di numeri autorizzati
const whitelist = [
  '393517339218', // Giada
  '393534330369', // Altro numero esempio
]

let handler = async (m, { conn, text, participants, isAdmin, isOwner }) => {
  // Estrai il numero del mittente
  const senderNumber = m.sender.split('@')[0]
  
  // Controlla se è admin, owner o nella whitelist
  if (!(isAdmin || isOwner || whitelist.includes(senderNumber))) {
    return m.reply('❌ Non hai i permessi per usare questo comando')
  }
  
  try {
    const users = participants.map(u => u.id)
    const quoted = m.quoted
    
    if (quoted) {
      if (quoted.mtype === 'imageMessage') {
        const media = await quoted.download()
        await conn.sendMessage(m.chat, {
          image: media,
          caption: text || quoted.text || '',
          mentions: users
        })
      }
      else if (quoted.mtype === 'videoMessage') {
        const media = await quoted.download()
        await conn.sendMessage(m.chat, {
          video: media,
          caption: text || quoted.text || '',
          mentions: users
        })
      }
      else if (quoted.mtype === 'audioMessage') {
        const media = await quoted.download()
        await conn.sendMessage(m.chat, {
          audio: media,
          mimetype: 'audio/mp4',
          mentions: users
        })
      }
      else if (quoted.mtype === 'documentMessage') {
        const media = await quoted.download()
        await conn.sendMessage(m.chat, {
          document: media,
          mimetype: quoted.mimetype,
          fileName: quoted.fileName,
          caption: text || quoted.text || '',
          mentions: users
        })
      }
      else if (quoted.mtype === 'stickerMessage') {
        const media = await quoted.download()
        await conn.sendMessage(m.chat, {
          sticker: media,
          mentions: users
        })
      }
      else {
        await conn.sendMessage(m.chat, {
          text: quoted.text || text || '',
          mentions: users
        })
      }
    }
    else if (text) {
      await conn.sendMessage(m.chat, {
        text: text,
        mentions: users
      })
    }
    else {
      return m.reply('❌ *Inserisci un testo o rispondi a un messaggio/media*')
    }
    
  } catch (e) {
    console.error('Errore tag/hidetag:', e)
    m.reply(global.errore || '❌ Si è verificato un errore')
  }
}

handler.help = ['tag']
handler.tags = ['gruppo']
handler.command = /^(tag)$/i
handler.group = true
// NON mettere handler.admin (né true né false)

export default handler