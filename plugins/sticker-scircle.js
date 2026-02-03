import { sticker } from '../lib/sticker.js'
import sharp from 'sharp'

let handler = async (m, { conn, text }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime.startsWith('image/')) throw '❌ Rispondi a un\'immagine con il comando'
    
    let img = await q.download()
    
    // Elabora l'immagine con sharp
    const size = 512
    const circleBuffer = await sharp(img)
      .resize(size, size, { fit: 'cover' })
      .composite([{
        input: Buffer.from(
          `<svg width="${size}" height="${size}">
            <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
          </svg>`
        ),
        blend: 'dest-in'
      }])
      .png()
      .toBuffer()
    
    // Crea lo sticker
    let stiker = await sticker(circleBuffer, false, global.packname, global.author)
    
    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, { asSticker: true })
    } else {
      throw 'Errore nella creazione dello sticker'
    }
  } catch (e) {
    console.error(e)
    m.reply(`❌ Errore: ${e}`)
  }
}

handler.command = /^scircle|circle$/i
export default handler