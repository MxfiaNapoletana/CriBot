import axios from 'axios'
import fs from 'fs'
import path from 'path'

function normalize(str) {
  if (!str) return ''
  str = str.split(/\s*[\(\[{](?:feat|ft|featuring).*$/i)[0]
    .split(/\s*(?:feat|ft|featuring)\.?\s+.*$/i)[0]
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
}

async function getRandomItalianTrackFromItunes() {
  const keywords = [ /* la tua lista di artisti */ "Lazza","Sfera Ebbasta","Ghali","Marracash","Salmo","Calcutta" ]
  let found = null, tentativi = 0
  while (!found && tentativi < 5) {
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]
    const res = await axios.get('https://itunes.apple.com/search', { params: { term: randomKeyword, country: 'IT', media: 'music', limit: 35 } })
    const valid = res.data.results.filter(b => b.previewUrl && b.trackName && b.artistName && b.artworkUrl100)
    if (valid.length) found = valid[Math.floor(Math.random() * valid.length)]
    tentativi++
  }
  if (!found) throw new Error('Errore ricerca brano')
  return {
    title: found.trackName,
    artist: found.artistName,
    preview: found.previewUrl,
    artwork: found.artworkUrl100.replace('100x100bb', '600x600bb')
  }
}

async function getRandomTrackByArtistFromItunes(artistQuery) {
  const res = await axios.get('https://itunes.apple.com/search', { params: { term: artistQuery, country: 'IT', media: 'music', limit: 50 } })
  const valid = res.data.results.filter(b => b.previewUrl && b.trackName && b.artistName && b.artworkUrl100)
  if (!valid.length) throw new Error('Nessun brano trovato per l\'artista indicato.')
  const found = valid[Math.floor(Math.random() * valid.length)]
  return {
    title: found.trackName,
    artist: found.artistName,
    preview: found.previewUrl,
    artwork: found.artworkUrl100.replace('100x100bb', '600x600bb')
  }
}

const activeGames = new Map()

async function startGame(m, conn, forcedArtist = null) {
  const chat = m.chat
  if (activeGames.has(chat)) return m.reply('『 ⚠️ 』- `C\'è già una partita in corso in questo gruppo!`')
  try {
    const track = forcedArtist ? await getRandomTrackByArtistFromItunes(forcedArtist) : await getRandomItalianTrackFromItunes()
    const audioRes = await axios.get(track.preview, { responseType: 'arraybuffer' })
    const tmpDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
    const audioPath = path.join(tmpDir, `song_${Date.now()}.mp3`)
    fs.writeFileSync(audioPath, Buffer.from(audioRes.data))

    const formatGameMessage = (timeLeft) => `
⋆｡˚『 ╭ \`INDOVINA CANZONE\` ╯ 』˚｡⋆
╭
┃ 『 ⏱️ 』 \`Tempo:\` *${timeLeft} secondi* 
┃ 『 👤 』 \`Artista:\` *${track.artist}* 
┃
┃ ➤  \`Scrivi il titolo!\`
╰⭒─ׄ─ׅ─ׄ─⭒`

    const buttons = [
      { buttonId: 'indovinacanzone_rigioca', buttonText: { displayText: '『 🎵 』 Rigioca' }, type: 1 }
    ]

    const gameMessage = await conn.sendMessage(m.chat, {
      text: formatGameMessage(30),
      buttons,
      headerType: 1,
      contextInfo: {
        externalAdReply: {
          title: 'indovina la canzone',
          body: `Artista: ${track.artist}`,
          thumbnailUrl: track.artwork,
          sourceUrl: '',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    const audioMessage = await conn.sendMessage(m.chat, { audio: fs.readFileSync(audioPath), mimetype: 'audio/mp4', ptt: true }, { quoted: m })
    fs.unlinkSync(audioPath)

    const game = { track, timeLeft: 30, message: gameMessage, audioMessage, interval: null }
    game.interval = setInterval(async () => {
      try {
        game.timeLeft -= 5
        if (game.timeLeft <= 0) {
          clearInterval(game.interval)
          activeGames.delete(chat)
          const timeoutButtons = [
            { buttonId: 'indovinacanzone_rigioca', buttonText: { displayText: '『 🎵 』 Rigioca' }, type: 1 }
          ]
          // Cancella audio
          await conn.sendMessage(m.chat, { delete: audioMessage.key }).catch(() => {})
          await conn.sendMessage(m.chat, {
            text: `ㅤ⋆｡˚『 ╭ \`TEMPO SCADUTO\` ╯ 』˚｡⋆\n\n➤ \`Nessuno ha indovinato!\`\n🎵 Titolo: *${track.title}*\n👤 Artista: *${track.artist}*`,
            buttons: timeoutButtons,
            headerType: 1
          }).catch(() => {})
          return
        }
        // Aggiorna il messaggio con il tempo rimanente (senza bottoni)
        await conn.sendMessage(m.chat, {
          text: formatGameMessage(game.timeLeft),
          edit: gameMessage.key
        }).catch(() => {})
      } catch (e) { console.error(e) }
    }, 5000)
    activeGames.set(chat, game)
  } catch (e) {
    console.error('Errore in startGame:', e)
    m.reply('Errore nella ricerca/avvio della partita.')
    activeGames.delete(chat)
  }
}

// handler principale
let handler = async (m, { conn, args, command }) => {
  const chat = m.chat
  
  // se chiamato con .icspecifico <artista>
  if (command === 'icspecifico' || command === 'indovinacanzone_specific') {
    const artistArg = args && args.length ? args.join(' ').trim() : ''
    if (!artistArg) {
      return m.reply('⚠️ Specifica un artista!\nEsempio: `.icspecifico Marracash`')
    }
    return startGame(m, conn, artistArg)
  }

  // se .indovinacanzone / .ic -> offri scelta casuale / specifico
  if (command === 'indovinacanzone' || command === 'ic') {
    // Solo bottone casuale, per specifico usare .icspecifico
    const mainButtons = [
      { buttonId: 'indovinacanzone_start', buttonText: { displayText: '『 🎲 』 Gioca' }, type: 1 }
    ]
    const sentMsg = await conn.sendMessage(chat, {
      text: '🎵 *Indovina la Canzone*\n\nClicca per giocare casuale o usa `.icspecifico <artista>` per scegliere un artista specifico.',
      buttons: mainButtons,
      headerType: 1
    }, { quoted: m })
    // Salva la key del messaggio per modificarlo dopo
    if (!global.menuMessages) global.menuMessages = new Map()
    global.menuMessages.set(chat, sentMsg.key)
    return
  }
}

// before: gestisce pressioni bottone, flusso "specifico" e risposte durante partita
handler.before = async (m, { conn }) => {
  const chat = m.chat
  // estrai testo in modo robusto
  const text = (m.text || (m.message && (m.message.conversation || m.message.extendedTextMessage?.text || '')) || '').trim()

  // 1) Se il messaggio è una risposta a un button (Baileys buttonsResponseMessage)
  const selectedButton = m.message?.buttonsResponseMessage?.selectedButtonId || m.message?.listResponseMessage?.singleSelectReply?.selectedId || null
  if (selectedButton === 'indovinacanzone_start' || selectedButton === 'indovinacanzone_rigioca') {
    // cancella dalla mappa e parte partita casuale
    if (global.menuMessages) global.menuMessages.delete(chat)
    return startGame(m, conn, null)
  }

  // Blocca il messaggio extendedText che arriva dopo il click del bottone
  if (text === '『 🎲 』 Gioca' || text === '『 🎵 』 Rigioca') {
    return true // ignora questi messaggi
  }

  // 2) Rimuovo tutta la logica di awaitingArtist perché ora usiamo .icspecifico

  // 3) gestione risposte durante partita attiva (normalissima logica di controllo risposta)
  if (!activeGames.has(chat)) return false // Lascia passare il comando al handler principale
  const game = activeGames.get(chat)
  const userAnswer = normalize(text)
  const correctAnswer = normalize(game.track.title)
  if (!userAnswer || userAnswer.length < 2) return true

  function similarity(str1, str2) {
    const words1 = str1.split(' ').filter(Boolean)
    const words2 = str2.split(' ').filter(Boolean)
    const matches = words1.filter(word => words2.some(w2 => w2.includes(word) || word.includes(w2)))
    return matches.length / Math.max(words1.length, words2.length)
  }

  const similarityScore = similarity(userAnswer, correctAnswer)
  const isCorrect =
    (userAnswer.length > 1) &&
    (userAnswer === correctAnswer ||
      (correctAnswer.includes(userAnswer) && userAnswer.length > correctAnswer.length * 0.5) ||
      (userAnswer.includes(correctAnswer) && userAnswer.length < correctAnswer.length * 1.5) ||
      similarityScore >= 0.7)

  if (isCorrect) {
    clearInterval(game.interval)
    activeGames.delete(chat)
    // Cancella audio
    await conn.sendMessage(m.chat, { delete: game.audioMessage.key }).catch(() => {})
    const reward = Math.floor(Math.random() * 100) + 50
    const exp = 500
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + reward
    global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + exp
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
    const successButtons = [
      { buttonId: 'indovinacanzone_rigioca', buttonText: { displayText: '『 🎵 』 Rigioca' }, type: 1 }
    ]
    await conn.sendMessage(m.chat, {
      text: `✅ Risposta corretta!\nTitolo: *${game.track.title}*\nArtista: *${game.track.artist}*\nVincite: ${reward} euro, ${exp} exp`,
      buttons: successButtons,
      headerType: 1
    }, { quoted: m }).catch(() => {})
    return true
  } else if (similarityScore >= 0.3) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
    await conn.reply(m.chat, '👀 *Ci sei quasi!* Riprova...', m)
    return true
  }
  return true
}

handler.help = ['indovinacanzone', 'ic', 'icspecifico']
handler.tags = ['giochi']
handler.command = ['indovinacanzone', 'ic', 'icspecifico', 'indovinacanzone_specific']
handler.register = true
handler.group = true

export default handler