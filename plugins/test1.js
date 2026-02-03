// Plugin WhatsApp Bot - Gay Meter
// Basato su @real-jiakai/wa-multi-device

import axios from 'axios'

let handler = async (m, { conn, command }) => {
  // Ottieni utente menzionato o citato o autore del messaggio
  let user = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  
  // Ottieni nome visibile
  let name = await conn.getName(user)
  let randomPercent = Math.floor(Math.random() * 100) + 1 // 1-100
  
  // Ottieni foto profilo
  let avatarUrl
  try {
    avatarUrl = await conn.profilePictureUrl(user, 'image').catch(_ => null)
    if (!avatarUrl) throw new Error('No avatar')
  } catch {
    avatarUrl = 'https://telegra.ph/file/6880771a42bad09dd6087.jpg' // fallback
  }
  
  // Prova diverse API funzionanti
  const apis = [
    `https://some-random-api.com/canvas/misc/gay?avatar=${encodeURIComponent(avatarUrl)}`,
    `https://api.popcat.xyz/gay?image=${encodeURIComponent(avatarUrl)}`,
    `https://luminai.my.id/gay?url=${encodeURIComponent(avatarUrl)}`
  ]
  
  let success = false
  
  for (let apiUrl of apis) {
    try {
      const response = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
        timeout: 10000
      })
      
      if (response.status === 200) {
        const buffer = Buffer.from(response.data, 'binary')
        
        await conn.sendMessage(m.chat, {
          image: buffer,
          caption: `🌈 @${user.split('@')[0]} è gay al ${randomPercent}% 🏳️‍🌈`,
          mentions: [user]
        }, { quoted: m })
        
        success = true
        break
      }
    } catch (e) {
      // Prova la prossima API
      continue
    }
  }
  
  // Se tutte le API falliscono, invia solo il testo
  if (!success) {
    await conn.sendMessage(m.chat, {
      text: `🌈 @${user.split('@')[0]} è gay al ${randomPercent}% 🏳️‍🌈`,
      mentions: [user]
    }, { quoted: m })
  }
}

handler.help = ['gay @utente']
handler.tags = ['fun']
handler.command = /^gay$/i

export default handler