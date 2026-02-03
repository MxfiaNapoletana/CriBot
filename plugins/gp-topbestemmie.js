//Plugin creato da Gab333 - Velocizzato e ottimizzato
let handler = async (m, { conn }) => {
    // Verifica che sia un gruppo
    if (!m.isGroup) {
        return m.reply('⚠️ Questo comando funziona solo nei gruppi!')
    }
    
    try {
        // Prendi tutti gli utenti del database che hanno bestemmie E sono in questo gruppo
        let groupUsers = Object.keys(global.db.data.users)
            .map(userId => {
                let user = global.db.data.users[userId]
                return {
                    id: userId,
                    bestemmie: user?.blasphemy || 0,
                    groupIds: user?.groupIds || []
                }
            })
            .filter(u => u.bestemmie > 0 && u.groupIds.includes(m.chat))
            .sort((a, b) => b.bestemmie - a.bestemmie)
            .slice(0, 10)
        
        groupUsers.forEach(u => console.log(`- ${u.id}: ${u.bestemmie} bestemmie`))
        
        // Crea il testo del messaggio
        let text = ''
        if (groupUsers.length > 0) {
            text = `🏆 *Top 10 Bestemmiatori del Gruppo* 🏆\n\n`
            
            groupUsers.forEach((user, i) => {
                let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
                text += `${medal} @${user.id.split('@')[0]} - *${user.bestemmie}* ${user.bestemmie === 1 ? 'bestemmia' : 'bestemmie'}\n`
            })
        } else {
            text = "😇 *Nessuno ha bestemmiato in questo gruppo!*\n\nChe gruppo benedetto! 🙏"
        }
        
        // Invia il messaggio con le menzioni
        await conn.sendMessage(m.chat, { 
            text, 
            mentions: groupUsers.map(u => u.id) 
        }, { quoted: m })
        
    } catch (error) {
        console.error('Errore nel comando topbestemmie:', error)
        m.reply('❌ Si è verificato un errore nel recuperare la classifica.')
    }
}

handler.help = ['topbestemmie']
handler.tags = ['group']
handler.command = /^(topbestemmie|bestemmietop|classifica(bestemmie)?)$/i
handler.group = true

export default handler