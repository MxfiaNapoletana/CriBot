// Plugin WhatsApp Bot - Classifiche
// Basato su @real-jiakai/wa-multi-device

let handler = async (m, { conn, participants, command }) => {
  if (!m.isGroup) throw '❌ Questo comando funziona solo nei gruppi!'
  
  // Se digita solo .top mostra il menu
  if (command === 'top') {
    let menu = `📊 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐇𝐄 𝐃𝐈𝐒𝐏𝐎𝐍𝐈𝐁𝐈𝐋𝐈* 📊\n\n`
    menu += `Usa uno di questi comandi:\n\n`
    menu += `🐒 .topscimmie\n`
    menu += `🐀 .topratti\n`
    menu += `🏳️‍🌈 .toplesbiche\n`
    menu += `🖤 .topneri\n`
    menu += `🌈 .topgay\n`
    menu += `💩 .topcacche\n`
    
    await conn.sendMessage(m.chat, { text: menu }, { quoted: m })
    return
  }
  
  // Prendi membri casuali del gruppo (escluso il bot)
  let membri = participants
    .map(u => u.id)
    .filter(v => v !== conn.user.jid)
  
  // Limita a 10 persone casuali
  let top10 = membri.sort(() => Math.random() - 0.5).slice(0, 10)
  
  if (top10.length < 10) {
    throw `⚠️ Servono almeno 10 membri nel gruppo! (Trovati: ${top10.length})`
  }
  
  // Genera percentuali decrescenti casuali
  let percentuali = []
  let basePercent = 100
  for (let i = 0; i < 10; i++) {
    percentuali.push(basePercent)
    basePercent -= Math.floor(Math.random() * 15 + 5) // Decremento tra 5-20%
    if (basePercent < 10) basePercent = Math.floor(Math.random() * 10 + 1)
  }
  
  // Titoli delle classifiche
  const titoli = {
    'topscimmie': '🐒 𝐓𝐎𝐏 𝟏𝟎 𝐒𝐂𝐈𝐌𝐌𝐈𝐄 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐏𝐎 🐒',
    'topratti': '🐀 𝐓𝐎𝐏 𝟏𝟎 𝐑𝐀𝐓𝐓𝐈 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐏𝐎 🐀',
    'toplesbiche': '🏳️‍🌈 𝐓𝐎𝐏 𝟏𝟎 𝐋𝐄𝐒𝐁𝐈𝐂𝐇𝐄 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐏𝐎 🏳️‍🌈',
    'topneri': '🖤 𝐓𝐎𝐏 𝟏𝟎 𝐍𝐄𝐑𝐈 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐏𝐎 🖤',
    'topgay': '🌈 𝐓𝐎𝐏 𝟏𝟎 𝐆𝐀𝐘 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐏𝐎 🌈',
    'topcacche': '💩 𝐓𝐎𝐏 𝟏𝟎 𝐂𝐀𝐂𝐂𝐇𝐄 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐏𝐎 💩'
  }
  
  let classifica = `${titoli[command]}\n\n`
  
  for (let i = 0; i < top10.length; i++) {
    classifica += `${i + 1}. @${top10[i].split('@')[0]} ${percentuali[i]}%\n`
  }
  
  await conn.sendMessage(m.chat, { 
    text: classifica, 
    mentions: top10 
  }, { quoted: m })
}

handler.help = ['top', 'topscimmie', 'topratti', 'toplesbiche', 'topneri', 'topgay', 'topcacche']
handler.tags = ['group', 'fun']
handler.command = /^(top|topscimmie|topratti|toplesbiche|topneri|topgay|topcacche)$/i
handler.group = true

export default handler