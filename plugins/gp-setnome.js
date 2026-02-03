//Plugin fatto da Gabs333 x Staff ChatUnity
// Definizione delle stringhe in italiano
const lenguajeIT = {
    smsNam2: () => "⚠️ Per favore inserisci il nuovo nome per il gruppo",
    smsNam1: () => "✅ Nome del gruppo modificato con successo!",
    smsNam3: () => "❌ Errore durante la modifica del nome del gruppo",
    smsConMenu: () => "🔙 Torna al Menu"
}

let handler = async (m, { conn, args, text }) => {
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || './media/chatunitybot.mp4'
    
    if (!text) return m.reply(lenguajeIT.smsNam2())
    
    try {
        let newName = args.join(' ')
        if (args && args[0]) {
            await conn.groupUpdateSubject(m.chat, newName)
        }
        
        await m.reply(lenguajeIT.smsNam1())
        
        // Alternativa con messaggio formattato:
        // await conn.sendMessage(m.chat, {
        //     text: lenguajeIT.smsNam1(),
        //     contextInfo: {
        //         externalAdReply: {
        //             title: 'Nome Gruppo Modificato',
        //             body: newName,
        //             thumbnailUrl: pp,
        //             mediaType: 1,
        //             renderLargerThumbnail: false
        //         }
        //     }
        // })
        
    } catch (e) {
        console.error('Errore nel comando setname:', e)
        await m.reply(lenguajeIT.smsNam3())
    }
}

handler.command = /^(setname|setnome)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler