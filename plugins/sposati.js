// ===== COMANDO .sposati =====
let handler = async (m, { conn }) => {
    let users = global.db.data.users
    if (!users) throw new Error('Database utenti non disponibile')

    let sposati = Object.entries(users)
        .filter(([jid, data]) => data.sposato && data.coniuge)
        .map(([jid, data]) => ({ a: jid, b: data.coniuge }))

    if (sposati.length === 0) {
        return conn.sendMessage(m.chat, { 
            text: '💍 𝑁𝑒𝑠𝑠𝑢𝑛𝑜 𝑒̀ 𝑠𝑝𝑜𝑠𝑎𝑡𝑜 𝑛𝑒𝑙 𝑠𝑖𝑠𝑡𝑒𝑚𝑎!' 
        })
    }

    let visti = new Set()
    let lista = ''

    for (let coppia of sposati) {
        let k = [coppia.a, coppia.b].sort().join('_')
        if (visti.has(k)) continue
        visti.add(k)
        lista += `💖 @${coppia.a.split('@')[0]}  ❤️  @${coppia.b.split('@')[0]}\n`
    }

    let testo = `
╔══════════════════════════════╗
║ 💍 𝓒𝓸𝓹𝓹𝓲𝓮 𝓢𝓹𝓸𝓼𝓪𝓽𝓮 💍
╚══════════════════════════════╝

${lista}
`.trim()

    await conn.sendMessage(
        m.chat,
        { text: testo, mentions: [...visti].flatMap(k => k.split('_')) },
        { quoted: m }
    )
}

handler.command = ['sposati']
handler.group = true
export default handler
