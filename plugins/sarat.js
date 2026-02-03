let handler = async (m, { conn }) => {
    await m.react('💙')
    
    // Primo messaggio
    await conn.sendMessage(m.chat, {
        text: '*ti amo*',
        contextInfo: {
            ...global.fake,
            externalAdReply: {
                title: '💙 Messaggio Speciale 💙',
                body: 'Per qualcuno di speciale',
                thumbnailUrl: 'https://i.imgur.com/RncqmfH.jpeg',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    })
    
    // Aspetta un secondo prima del secondo messaggio
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Secondo messaggio
    await conn.sendMessage(m.chat, {
        text: '*io di più* 💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙',
        contextInfo: {
            ...global.fake,
            externalAdReply: {
                title: '💙💙💙 Ti amo infinito 💙💙💙',
                body: 'Più di quanto tu possa immaginare',
                thumbnailUrl: 'https://i.imgur.com/R1E3gEl.jpeg',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    })
    
    await m.react('❤️')
}

handler.help = ['sarat']
handler.tags = ['fun']
handler.command = /^(sarat)$/i

export default handler

