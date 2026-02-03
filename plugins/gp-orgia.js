// Plugin WhatsApp Bot - Storia epica con tag integrati
// Basato su @real-jiakai/wa-multi-device

let handler = async (m, { conn, text, participants }) => {
  if (!m.isGroup) throw '❌ Questo comando funziona solo nei gruppi!'
  
  let membri = []
  
  // Controlla se l'utente ha taggato delle persone
  let mentions = m.mentionedJid || []
  
  if (mentions.length > 0) {
    // Modalità CUSTOM: l'utente ha taggato delle persone
    if (mentions.length !== 10) {
      throw `⚠️ Devi taggare esattamente 10 persone! (Hai taggato: ${mentions.length})`
    }
    membri = mentions
  } else {
    // Modalità CASUALE: prendi 10 membri a caso
    let tuttiMembri = participants
      .map(u => u.id)
      .filter(v => v !== conn.user.jid && v !== m.sender)
    
    if (tuttiMembri.length < 10) {
      throw `⚠️ Servono almeno 10 membri nel gruppo! (Trovati: ${tuttiMembri.length})`
    }
    
    // Shuffle e prendi i primi 10
    membri = tuttiMembri
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
  }
  
  // Costruisci i tag per inserirli nella storia
  let tags = membri.map(m => `@${m.split('@')[0]}`).join(' ')
  
  // Storia epica con tag integrati
  let storia = `𝐈𝐧 𝐮𝐧𝐚 𝐬𝐞𝐫𝐚𝐭𝐚 𝐝'𝐞𝐬𝐭𝐚𝐭𝐞 𝐜𝐚𝐥𝐝𝐢𝐬𝐬𝐢𝐦𝐚, 𝐝𝐢𝐞𝐜𝐢 𝐚𝐦𝐢𝐜𝐢 𝐬𝐢 𝐫𝐢𝐭𝐫𝐨𝐯𝐚𝐧𝐨 𝐬𝐮𝐥𝐥𝐚 𝐬𝐩𝐢𝐚𝐠𝐠𝐢𝐚, 𝐬𝐭𝐚𝐧𝐜𝐡𝐢 𝐝𝐞𝐥𝐥𝐚 𝐬𝐨𝐥𝐢𝐭𝐚 𝐫𝐨𝐮𝐭𝐢𝐧𝐞. 𝐋'𝐚𝐫𝐢𝐚 è 𝐜𝐚𝐫𝐢𝐜𝐚 𝐝𝐢 𝐚𝐭𝐭𝐞𝐬𝐚, 𝐢 𝐝𝐫𝐢𝐧𝐤 𝐬𝐜𝐨𝐫𝐫𝐨𝐧𝐨 𝐚 𝐟𝐢𝐮𝐦𝐢 𝐞 𝐥𝐚 𝐦𝐮𝐬𝐢𝐜𝐚 𝐝𝐞𝐥 𝐛𝐚𝐫 𝐬𝐮𝐥𝐥𝐚 𝐫𝐢𝐯𝐚 𝐩𝐮𝐥𝐬𝐚 𝐜𝐨𝐧 𝐫𝐢𝐭𝐦𝐨 𝐢𝐩𝐧𝐨𝐭𝐢𝐜𝐨. 𝐔𝐧𝐨 𝐝𝐢 𝐥𝐨𝐫𝐨, 𝐨𝐫𝐦𝐚𝐢 𝐛𝐫𝐢𝐥𝐥𝐨 𝐝𝐢 𝐭𝐫𝐨𝐩𝐩𝐢 𝐬𝐡𝐨𝐭, 𝐥𝐚𝐧𝐜𝐢𝐚 𝐮𝐧𝐚 𝐩𝐫𝐨𝐩𝐨𝐬𝐭𝐚 𝐚𝐬𝐬𝐮𝐫𝐝𝐚: "𝐑𝐚𝐠𝐚𝐳𝐳𝐢, 𝐩𝐫𝐞𝐧𝐝𝐢𝐚𝐦𝐨 𝐮𝐧𝐚 𝐛𝐚𝐫𝐜𝐚 𝐞 𝐟𝐚𝐜𝐜𝐢𝐚𝐦𝐨 𝐮𝐧 𝐩𝐚𝐫𝐭𝐲 𝐢𝐧 𝐦𝐞𝐳𝐳𝐨 𝐚𝐥 𝐦𝐚𝐫𝐞!" 𝐆𝐥𝐢 𝐚𝐥𝐭𝐫𝐢, 𝐩𝐫𝐞𝐬𝐢 𝐝𝐚𝐥𝐥𝐚 𝐟𝐨𝐥𝐥𝐢𝐚 𝐝𝐞𝐥 𝐦𝐨𝐦𝐞𝐧𝐭𝐨, 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐧𝐨 𝐬𝐞𝐧𝐳𝐚 𝐞𝐬𝐢𝐭𝐚𝐫𝐞. 𝐃𝐨𝐩𝐨 𝐦𝐞𝐳𝐳'𝐨𝐫𝐚 𝐬𝐨𝐧𝐨 𝐠𝐢à 𝐬𝐮 𝐮𝐧𝐨 𝐲𝐚𝐜𝐡𝐭 𝐧𝐨𝐥𝐞𝐠𝐠𝐢𝐚𝐭𝐨, 𝐜𝐨𝐧 𝐜𝐚𝐬𝐬𝐞 𝐝𝐢 𝐛𝐢𝐫𝐫𝐚 𝐞 𝐩𝐥𝐚𝐲𝐥𝐢𝐬𝐭 𝐚 𝐩𝐚𝐥𝐥𝐚. 𝐋𝐚 𝐛𝐚𝐫𝐜𝐚 𝐩𝐚𝐫𝐭𝐞 𝐯𝐞𝐫𝐬𝐨 𝐢𝐥 𝐥𝐚𝐫𝐠𝐨, 𝐥𝐞 𝐥𝐮𝐜𝐢 𝐝𝐞𝐥𝐥𝐚 𝐜𝐨𝐬𝐭𝐚 𝐬𝐯𝐚𝐧𝐢𝐬𝐜𝐨𝐧𝐨 𝐥𝐞𝐧𝐭𝐚𝐦𝐞𝐧𝐭𝐞. 𝐀 𝐮𝐧 𝐜𝐞𝐫𝐭𝐨 𝐩𝐮𝐧𝐭𝐨, 𝐜𝐢𝐫𝐜𝐨𝐧𝐝𝐚𝐭𝐢 𝐬𝐨𝐥𝐨 𝐝𝐚𝐥 𝐛𝐮𝐢𝐨 𝐝𝐞𝐥𝐥'𝐨𝐜𝐞𝐚𝐧𝐨 𝐞 𝐝𝐚𝐥𝐥𝐞 𝐬𝐭𝐞𝐥𝐥𝐞, ${tags} 𝐝𝐞𝐜𝐢𝐝𝐨𝐧𝐨 𝐜𝐡𝐞 è 𝐚𝐫𝐫𝐢𝐯𝐚𝐭𝐨 𝐢𝐥 𝐦𝐨𝐦𝐞𝐧𝐭𝐨 𝐝𝐢 𝐭𝐮𝐟𝐟𝐚𝐫𝐬𝐢 𝐭𝐮𝐭𝐭𝐢 𝐢𝐧 𝐚𝐜𝐪𝐮𝐚 𝐧𝐮𝐝𝐢. 𝐈𝐥 𝐦𝐚𝐫𝐞 𝐧𝐨𝐭𝐭𝐮𝐫𝐧𝐨 𝐝𝐢𝐯𝐞𝐧𝐭𝐚 𝐢𝐥 𝐥𝐨𝐫𝐨 𝐩𝐚𝐫𝐜𝐨 𝐠𝐢𝐨𝐜𝐡𝐢 𝐩𝐫𝐢𝐯𝐚𝐭𝐨, 𝐭𝐫𝐚 𝐬𝐜𝐡𝐢𝐳𝐳𝐢 𝐝'𝐚𝐜𝐪𝐮𝐚, 𝐫𝐢𝐬𝐚𝐭𝐞 𝐢𝐬𝐭𝐞𝐫𝐢𝐜𝐡𝐞 𝐞 𝐦𝐨𝐦𝐞𝐧𝐭𝐢 𝐜𝐡𝐞 𝐧𝐞𝐬𝐬𝐮𝐧𝐨 𝐨𝐬𝐞𝐫𝐞𝐛𝐛𝐞 𝐦𝐚𝐢 𝐫𝐚𝐜𝐜𝐨𝐧𝐭𝐚𝐫𝐞. 𝐀𝐥𝐥'𝐚𝐥𝐛𝐚, 𝐞𝐬𝐚𝐮𝐬𝐭𝐢 𝐦𝐚 𝐟𝐞𝐥𝐢𝐜𝐢, 𝐫𝐢𝐞𝐧𝐭𝐫𝐚𝐧𝐨 𝐚 𝐫𝐢𝐯𝐚 𝐜𝐨𝐧 𝐥𝐚 𝐜𝐨𝐧𝐬𝐚𝐩𝐞𝐯𝐨𝐥𝐞𝐳𝐳𝐚 𝐝𝐢 𝐚𝐯𝐞𝐫 𝐯𝐢𝐬𝐬𝐮𝐭𝐨 𝐮𝐧𝐚 𝐧𝐨𝐭𝐭𝐞 𝐜𝐡𝐞 𝐧𝐞𝐬𝐬𝐮𝐧𝐨 𝐝𝐢 𝐥𝐨𝐫𝐨 𝐝𝐢𝐦𝐞𝐧𝐭𝐢𝐜𝐡𝐞𝐫à 𝐦𝐚𝐢. 🌊🔥`
  
  // Invia il messaggio con tutte le menzioni
  await conn.sendMessage(m.chat, { 
    text: storia, 
    mentions: membri 
  }, { quoted: m })
}

handler.help = ['orgia', 'orgia @user1 @user2 ... (10 persone)']
handler.tags = ['group']
handler.command = /^(orgia|tagall|tag10)$/i
handler.group = true

export default handler