//Codice di sticker-sticker.js

import uploadFile from '../lib/uploadFile.js'
import { webp2png } from '../lib/webp2mp4.js'
import { promises as fs } from 'fs'
import path from 'path'
import { fileTypeFromBuffer } from 'file-type'
import fetch from 'node-fetch'
import FormData from 'form-data'
import sharp from 'sharp'

let processing = false

// Funzione per creare sticker usando sharp
async function createSticker(input, packname = 'ChatUnity', author = 'Bot') {
  try {
    let buffer
    
    // Ottieni il buffer
    if (Buffer.isBuffer(input)) {
      buffer = input
    } else if (typeof input === 'string' && input.startsWith('http')) {
      const response = await fetch(input)
      buffer = await response.arrayBuffer()
      buffer = Buffer.from(buffer)
    } else {
      throw new Error('Input non valido')
    }
    
    // Converti in sticker con sharp
    const stickerBuffer = await sharp(buffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 100 })
      .toBuffer()
    
    return stickerBuffer
  } catch (e) {
    console.error('Errore sharp:', e.message)
    throw e
  }
}

// Upload alternativo
async function uploadImageAlternative(buffer) {
  try {
    const { ext, mime } = await fileTypeFromBuffer(buffer)
    const form = new FormData()
    form.append('file', buffer, { filename: `image.${ext}`, contentType: mime })
    
    const res = await fetch('https://qu.ax/upload.php', {
      method: 'POST',
      body: form
    })
    
    const data = await res.json()
    if (data.success && data.files && data.files[0]) {
      return data.files[0].url
    }
    throw new Error('Upload fallito')
  } catch (e) {
    console.error('Upload alternativo fallito:', e.message)
    try {
      const form2 = new FormData()
      form2.append('files[]', buffer, 'image.jpg')
      const res2 = await fetch('https://pomf2.lain.la/upload.php', {
        method: 'POST',
        body: form2
      })
      const data2 = await res2.json()
      if (data2.success && data2.files && data2.files[0]) {
        return data2.files[0].url
      }
    } catch (e2) {
      console.error('Pomf2 fallito:', e2.message)
    }
    throw new Error('Tutti gli upload falliti')
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (processing) {
    return m.reply('⏳ Attendi, sto elaborando un altro sticker...')
  }
  
  processing = true
  let stiker = false
  
  try {
    const tmpDir = path.join(process.cwd(), 'tmp')
    try {
      await fs.mkdir(tmpDir, { recursive: true }).catch(() => {})
      const files = await fs.readdir(tmpDir).catch(() => [])
      const now = Date.now()
      for (const file of files) {
        try {
          const filePath = path.join(tmpDir, file)
          const stats = await fs.stat(filePath)
          if (now - stats.mtimeMs > 3600000) {
            await fs.unlink(filePath).catch(() => {})
          }
        } catch (e) {}
      }
    } catch (e) {
      console.log('Pulizia tmp:', e.message)
    }
    
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    
    if (/webp|image|video/g.test(mime)) {
      let fileSize = (q.msg || q).fileLength || 0
      if (fileSize > 10 * 1024 * 1024) {
        processing = false
        return m.reply('ⓘ 𝐅𝐢𝐥𝐞 𝐭𝐫𝐨𝐩𝐩𝐨 𝐠𝐫𝐚𝐧𝐝𝐞 (𝐦𝐚𝐱 𝟏𝟎𝐌𝐁)')
      }
      
      if (/video/g.test(mime)) {
        if ((q.msg || q).seconds > 9) {
          processing = false
          return m.reply('ⓘ 𝐕𝐢𝐝𝐞𝐨 𝐭𝐫𝐨𝐩𝐩𝐨 𝐥𝐮𝐧𝐠𝐨 (𝐦𝐚𝐱 𝟗 𝐬𝐞𝐜)')
        }
        // Per video serve ffmpeg
        processing = false
        return m.reply('⚠️ 𝐕𝐢𝐝𝐞𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐫𝐢𝐜𝐡𝐢𝐞𝐝𝐞 𝐟𝐟𝐦𝐩𝐞𝐠. 𝐈𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐥𝐨 𝐜𝐨𝐧: apt install ffmpeg')
      }
      
      let img = await q.download?.()
      
      if (!img) {
        processing = false
        return m.reply('⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐝𝐞𝐥 𝐦𝐞𝐝𝐢𝐚')
      }
      
      if (!Buffer.isBuffer(img) || img.length === 0) {
        processing = false
        return m.reply('⚠️ 𝐃𝐚𝐭𝐢 𝐦𝐞𝐝𝐢𝐚 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐢')
      }
      
      console.log('📥 Download completato, size:', img.length, 'bytes')
      
      try {
        console.log('🔄 Creazione sticker con Sharp...')
        
        // CREA STICKER CON SHARP
        stiker = await createSticker(img, global.packname, global.author)
        
        console.log('✅ Sticker creato con successo, size:', stiker.length)
        
        img = null
        if (global.gc) global.gc()
        
      } catch (e) {
        console.error('❌ Errore conversione:', e.message)
        img = null
        if (global.gc) global.gc()
      }
      
    } else if (args[0]) {
      if (isUrl(args[0])) {
        console.log('🔗 Creazione sticker da URL:', args[0])
        stiker = await createSticker(args[0], global.packname, global.author)
      } else {
        processing = false
        return m.reply('⚠️ 𝐔𝐑𝐋 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨')
      }
    }
  } catch (e) {
    console.error('❌ Errore handler generale:', e)
    processing = false
    return m.reply('⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐜𝐫𝐞𝐚𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥𝐥𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫')
  } finally {
    processing = false
    
    if (stiker) {
      try {
        console.log('📤 Invio sticker...')
        
        await conn.sendMessage(m.chat, { 
          sticker: stiker 
        }, { 
          quoted: m 
        })
        
        console.log('✅ Sticker inviato con successo')
      } catch (e) {
        console.error('❌ Errore invio sticker:', e.message)
        m.reply('⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥\'𝐢𝐧𝐯𝐢𝐨 𝐝𝐞𝐥𝐥𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫')
      } finally {
        stiker = null
        if (global.gc) global.gc()
      }
    } else {
      console.log('⚠️ Nessuno sticker da inviare')
    }
  }
}

handler.help = ['stiker (caption|reply media)', 'stiker <url>', 'stikergif (caption|reply media)', 'stikergif <url>']
handler.tags = ['sticker']
handler.command = /^s(tic?ker)?(gif)?(wm)?$/i

export default handler

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))
}
