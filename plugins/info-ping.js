//Plugin fatto da Gabs333 x Staff ChatUnity
import speed from 'performance-now'
let handler = async (m, { conn }) => {
  let start = speed()
  await conn.readMessages([m.key])
  let end = speed()
  let latensi = (end - start).toFixed(2)
  let uptime = formatUptime(process.uptime() * 1000)
  const message = `ㅤㅤㅤㅤ⋆｡˚『🏓 \`PING\` 』˚｡⋆
╭
✦ 『🔌』 \`Attivo da:\` *${uptime}*
✧ 『✈️』 \`Latenza:\` *${latensi}* *ms*
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒
`.trim()
  const buttons = [
    { 
      buttonId: '.ping', 
      buttonText: { displayText: '🏓 Ping' }, 
      type: 1 
    },
    { 
      buttonId: '.ds', 
      buttonText: { displayText: '📊 Ds' }, 
      type: 1 
    },
    { 
      buttonId: '.cleartmp', 
      buttonText: { displayText: '🗑️ Cleartmp' }, 
      type: 1 
    }
  ]
  await conn.sendMessage(m.chat, {
    text: message,
    buttons: buttons,
    headerType: 1
  }, { quoted: m })
}
handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping']
export default handler
function formatUptime(ms) {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${d}g ${h}h ${m}m ${s}s`
}