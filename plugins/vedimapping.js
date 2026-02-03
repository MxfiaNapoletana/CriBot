let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('⚠️ Questo comando funziona solo nei gruppi!')
    
    const groupMappings = global.db.data.mappings?.[m.chat] || {}
    const count = Object.keys(groupMappings).length
    
    if (count === 0) {
        return m.reply('📭 Nessun mapping salvato per questo gruppo.\n\nUsa `.scangroup` per scansionare il gruppo!')
    }
    
    let text = `📊 *Mapping salvati: ${count}*\n\n`
    
    for (const [internalId, realNumber] of Object.entries(groupMappings)) {
        if (internalId !== realNumber) {
            text += `• ${internalId} → ${realNumber}\n`
        }
    }
    
    m.reply(text)
}

handler.help = ['viewmappings']
handler.tags = ['owner']
handler.command = /^(viewmappings|vedimapping)$/i
handler.owner = true
handler.group = true

export default handler