import { Sticker } from 'wa-sticker-formatter'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    // Controlla se ha risposto a uno sticker
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (mime !== 'image/webp') {
      return m.reply(`❌ Rispondi a uno sticker con il comando!

💡 *Uso:* ${usedPrefix}${command} <nuovo autore>

📝 *Esempio:* Rispondi a uno sticker e scrivi
${usedPrefix}${command} Mario Rossi`)
    }
    
    if (!text || !text.trim()) {
      return m.reply(`❌ Inserisci il nuovo nome autore!

💡 *Uso:* ${usedPrefix}${command} <nuovo autore>`)
    }
    
    const newAuthor = text.trim()
    
    // Scarica lo sticker
    let img = await q.download()
    
    // Crea lo sticker con wa-sticker-formatter direttamente
    const stiker = new Sticker(img, {
      pack: global.packname || '',
      author: newAuthor,
      type: 'full',
      quality: 50
    })
    
    const buffer = await stiker.toBuffer()
    
    await conn.sendFile(m.chat, buffer, 'sticker.webp', '', m, { asSticker: true })
    
  } catch (e) {
    console.error(e)
    m.reply(`❌ Errore: ${e}`)
  }
}

handler.help = ['wa <autore>']
handler.tags = ['sticker']
handler.command = /^(wa)$/i

export default handler