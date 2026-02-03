import { downloadContentFromMessage } from '@realvare/based'

let handler = async (m, { conn }) => {
    try {
        if (!m.quoted) {
            throw '『 ⚠️ 』- `Rispondi a un contenuto visualizzabile una volta`'
        }
        
        const msg = m.quoted
        

        
        // Controlla diverse possibili strutture per view once
        let messageContent = null
        let isViewOnce = false
        let contentType = null
        let content = null
        
        // Caso 1: messageContextInfo - usa mediaMessage
        if (msg.mtype === 'messageContextInfo' && msg.mediaMessage) {
            const mediaMsg = msg.mediaMessage
            
            if (mediaMsg.imageMessage?.viewOnce) {
                contentType = 'image'
                content = mediaMsg.imageMessage
                isViewOnce = true
            } else if (mediaMsg.videoMessage?.viewOnce) {
                contentType = 'video'
                content = mediaMsg.videoMessage
                isViewOnce = true
            } else if (mediaMsg.audioMessage?.viewOnce) {
                contentType = 'audio'
                content = mediaMsg.audioMessage
                isViewOnce = true
            }
            // Fallback: usa mediaType se disponibile
            else if (msg.mediaType && mediaMsg) {
                const type = msg.mediaType.toLowerCase()
                if (type.includes('image') && mediaMsg.imageMessage) {
                    contentType = 'image'
                    content = mediaMsg.imageMessage
                    isViewOnce = true
                } else if (type.includes('video') && mediaMsg.videoMessage) {
                    contentType = 'video'
                    content = mediaMsg.videoMessage
                    isViewOnce = true
                } else if (type.includes('audio') && mediaMsg.audioMessage) {
                    contentType = 'audio'
                    content = mediaMsg.audioMessage
                    isViewOnce = true
                }
            }
        }
        // Caso 2: messageContextInfo - il messaggio è in msg stesso
        else if (msg.mtype === 'messageContextInfo') {
            if (msg.imageMessage?.viewOnce) {
                contentType = 'image'
                content = msg.imageMessage
                isViewOnce = true
            } else if (msg.videoMessage?.viewOnce) {
                contentType = 'video'
                content = msg.videoMessage
                isViewOnce = true
            } else if (msg.audioMessage?.viewOnce) {
                contentType = 'audio'
                content = msg.audioMessage
                isViewOnce = true
            }
        }
        // Caso 3: viewOnceMessageV2 o viewOnceMessage
        else if (msg.mtype === 'viewOnceMessageV2' || msg.mtype === 'viewOnceMessage') {
            messageContent = msg.message?.viewOnceMessageV2?.message || msg.message?.viewOnceMessage?.message || msg.message
            isViewOnce = true
        }
        // Caso 4: messaggio con viewOnce flag
        else if (msg.message?.imageMessage?.viewOnce || 
                 msg.message?.videoMessage?.viewOnce || 
                 msg.message?.audioMessage?.viewOnce) {
            messageContent = msg.message
            isViewOnce = true
        }
        // Caso 5: viewOnceMessageV2Extension
        else if (msg.message?.viewOnceMessageV2Extension) {
            messageContent = msg.message.viewOnceMessageV2Extension.message
            isViewOnce = true
        }
        
        if (!isViewOnce) {
            console.log('isViewOnce:', isViewOnce)
            console.log('contentType:', contentType)
            console.log('content:', content)
            throw '『 ⚠️ 』- `Questo non è un contenuto visualizzabile una volta`'
        }
        
        const downloadFromStream = async (stream) => {
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
            return buffer
        }
        
        // Se abbiamo già content e contentType (caso messageContextInfo), salta questa parte
        if (!content && messageContent) {
            // Determina il tipo di contenuto per gli altri casi
            if (messageContent.imageMessage) {
                contentType = 'image'
                content = messageContent.imageMessage
            } else if (messageContent.videoMessage) {
                contentType = 'video'
                content = messageContent.videoMessage
            } else if (messageContent.audioMessage) {
                contentType = 'audio'
                content = messageContent.audioMessage
            }
        }
        
        if (!contentType || !content) {
            console.log('contentType:', contentType)
            console.log('content:', content)
            throw '❌ Formato non supportato o contenuto non trovato'
        }
        
        let buffer
        
        // Download del contenuto
        try {
            const stream = await downloadContentFromMessage(content, contentType)
            buffer = await downloadFromStream(stream)
        } catch (err) {
            console.warn('Fallback al metodo download() per ' + contentType + ':', err.message)
            buffer = await msg.download()
        }
        
        if (!buffer || buffer.length === 0) {
            throw '❌ Impossibile scaricare il contenuto'
        }
        
        const caption = content.caption || ''
        
        // Invia il file appropriato
        if (contentType === 'video') {
            await conn.sendFile(m.chat, buffer, 'video.mp4', caption, m)
        } else if (contentType === 'image') {
            await conn.sendFile(m.chat, buffer, 'image.jpg', caption, m)
        } else if (contentType === 'audio') {
            const isPTT = content.ptt || false
            
            if (isPTT) {
                // Messaggio vocale PTT
                await conn.sendMessage(m.chat, {
                    audio: buffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true,
                    waveform: content.waveform
                }, { quoted: m })
            } else {
                // Audio normale
                await conn.sendMessage(m.chat, {
                    audio: buffer,
                    mimetype: content.mimetype || 'audio/mpeg',
                    fileName: 'audio.mp3'
                }, { quoted: m })
            }
        }
        
    } catch (e) {
        console.error('Errore nel rivelare view once:', e)
        const errorMessage = typeof e === 'string' ? e : global.errore || '❌ Si è verificato un errore'
        await m.reply(errorMessage)
    }
}

handler.help = ['rivela']
handler.tags = ['strumenti']
handler.command = ['readviewonce', 'rivela', 'viewonce']
handler.group = true
handler.admin = true

export default handler