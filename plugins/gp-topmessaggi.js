let handler = async (m, { conn, args }) => {

  // Prendo TUTTI gli utenti dal database
  let allUsers = Object.entries(global.db.data.users)
    .map(([jid, user]) => {
      let messaggi = user?.messaggi || 0
      
      return {
        jid: jid,
        messaggi: messaggi,
        name: user?.name || 'Sconosciuto'
      }
    })
    .filter(u => u.messaggi > 0) // Solo utenti con almeno 1 messaggio

  // Ordina per numero di messaggi in modo decrescente
  let sorted = allUsers.sort((a, b) => b.messaggi - a.messaggi)

  let rankedIds = sorted.map(u => u.jid)

  // Numero utenti da mostrare (default 10, max 100)
  let limit = args[0] && args[0].length > 0
    ? Math.min(100, Math.max(parseInt(args[0]), 10))
    : 10

  if (limit > 100) {
    return conn.reply(
      m.chat,
      '⚠️ La classifica può mostrare al massimo i primi 100 utenti.',
      m
    )
  }

  // Se non ci sono utenti con messaggi
  if (sorted.length === 0) {
    return conn.reply(
      m.chat,
      '📊 Nessun utente ha ancora inviato messaggi!',
      m
    )
  }

  // Posizione dell'utente
  let myRank = rankedIds.indexOf(m.sender) + 1
  let totalUsers = sorted.length

  // Testo classifica
  let text =
    `📊 𝐓𝐨𝐩 *${limit}* utenti con più messaggi\n` +
    `👥 Totale utenti attivi: *${totalUsers}*\n\n` +
    sorted
      .slice(0, limit)
      .map(({ jid, messaggi, name }, i) =>
        `${getMedaglia(i + 1)} « *${messaggi}* » @${jid.split('@')[0]}`
      )
      .join('\n')

  // Aggiunge posizione personale
  if (myRank > 0) {
    let myMessages = global.db.data.users[m.sender]?.messaggi || 0
    text += `\n\n👤 𝐋𝐚 tua posizione: *${myRank}°* di *${totalUsers}*\n💬 Hai inviato *${myMessages}* ${myMessages === 1 ? 'messaggio' : 'messaggi'}`
  } else {
    text += `\n\n👤 Non hai ancora inviato messaggi!`
  }

  // Fetch thumbnail
  try {
    const thumbnailResponse = await fetch('https://telegra.ph/file/b311b1ffefcc34f681e36.png')
    const thumbnailArrayBuffer = await thumbnailResponse.arrayBuffer()
    const thumbnailBuffer = Buffer.from(thumbnailArrayBuffer)

    // Fake quoted (location + vcard)
    let fakeReply = {
      key: {
        participants: '0@s.whatsapp.net',
        fromMe: false,
        id: 'Halo'
      },
      message: {
        locationMessage: {
          name: '𝐂𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢',
          jpegThumbnail: thumbnailBuffer,
          vcard: `BEGIN:VCARD
VERSION:3.0
N:;Unlimited;;;
FN:Unlimited
ORG:Unlimited
END:VCARD`
        }
      },
      participant: '0@s.whatsapp.net'
    }

    await conn.reply(
      m.chat,
      text.trim(),
      fakeReply,
      {
        mentions: rankedIds.slice(0, limit)
      }
    )
  } catch (error) {
    // Se fallisce il fetch dell'immagine, invia comunque il messaggio
    await conn.reply(
      m.chat,
      text.trim(),
      m,
      {
        mentions: rankedIds.slice(0, limit)
      }
    )
  }
}

handler.help = ['topmessaggi']
handler.tags = ['gruppo']
handler.command = /^(topmessaggi)$/i
handler.group = true

export default handler

// Helper function per le medaglie
function getMedaglia(position) {
  switch(position) {
    case 1: return '🥇'
    case 2: return '🥈'
    case 3: return '🥉'
    case 4: return '4️⃣'
    case 5: return '5️⃣'
    case 6: return '6️⃣'
    case 7: return '7️⃣'
    case 8: return '8️⃣'
    case 9: return '9️⃣'
    case 10: return '🔟'
    default: return `${position}.`
  }
}