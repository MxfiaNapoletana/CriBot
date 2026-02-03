//Codice stoppartita.js

const handler = async (m, { conn }) => {
  try {
    let stopped = false
    
    for (const matchId in global.matchFollowers) {
      if (global.matchFollowers[matchId].users.has(m.sender)) {
        global.matchFollowers[matchId].users.delete(m.sender)
        stopped = true
        
        // Se non ci sono più follower, ferma tutto
        if (global.matchFollowers[matchId].users.size === 0) {
          if (global.matchFollowers[matchId].interval) {
            clearInterval(global.matchFollowers[matchId].interval)
          }
          if (global.matchFollowers[matchId].startTimeout) {
            clearTimeout(global.matchFollowers[matchId].startTimeout)
          }
          delete global.matchFollowers[matchId]
        }
      }
    }
    
    if (stopped) {
      await m.reply('✅ *Notifiche disattivate*\n\nNon riceverai più aggiornamenti sulle partite.')
    } else {
      await m.reply('❌ *Non stai seguendo nessuna partita*\n\nUsa `.partita` per vedere le partite disponibili.')
    }
    
  } catch (e) {
    console.error(e)
    return m.reply(`*❌ ERRORE*\n━━━━━━━━━━━━━━━━\n\n*⚠️ ${e.message}*`)
  }
}

handler.help = ['stoppartita']
handler.tags = ['sport']
handler.command = /^stoppartita$/i

export default handler