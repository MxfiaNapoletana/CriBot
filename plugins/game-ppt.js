let handler = async (m, { conn, text, usedPrefix, command }) => {
    // punti per vittoria/perdita
    let punti = 300
    // assicurati che l'utente esista nel db
    let user = global.db.data.users[m.sender]
    if (!user) throw new Error('Utente non trovato nel database')

    // normalizza input
    text = (text || '').toLowerCase().trim()

    const opzioni = ['pietra', 'carta', 'forbici']

    // bottoni rapidi (id inviano il comando con l'argomento)
    const buttons = [
        { buttonId: `${usedPrefix + command} pietra`, buttonText: { displayText: '🪨 Pietra' }, type: 1 },
        { buttonId: `${usedPrefix + command} carta`, buttonText: { displayText: '📄 Carta' }, type: 1 },
        { buttonId: `${usedPrefix + command} forbici`, buttonText: { displayText: '✂️ Forbici' }, type: 1 }
    ]

    // se nessun argomento: mostra i bottoni per iniziare
    if (!text) {
        return conn.sendMessage(m.chat, {
            text: 'Scegli un\'opzione per giocare a Sasso/Carta/Forbici:',
            buttons,
            headerType: 1
        }, { quoted: m })
    }

    // se opzione non valida: mostra nuovamente i bottoni
    if (!opzioni.includes(text)) {
        return conn.sendMessage(m.chat, {
            text: 'Opzione non valida. Usa uno dei bottoni qui sotto o scrivi pietra/carta/forbici.',
            buttons,
            headerType: 1
        }, { quoted: m })
    }

    // scelta del bot (casuale)
    let botChoice = opzioni[Math.floor(Math.random() * opzioni.length)]

    // calcola risultato
    let risultato = ''
    let puntiOttenuti = 0

    if (text === botChoice) {
        risultato = `[ ✿ ] Pareggio!! Ricevi *100 💶 Unitycoins* come ricompensa`
        puntiOttenuti = 100
    } else if (
        (text === 'pietra' && botChoice === 'forbici') ||
        (text === 'forbici' && botChoice === 'carta') ||
        (text === 'carta' && botChoice === 'pietra')
    ) {
        risultato = `[ ✰ ] HAI VINTO!! Hai guadagnato *300 💶 Unitycoins*`
        puntiOttenuti = punti
    } else {
        risultato = `[ ✿ ] HAI PERSO!! Hai perso *300 💶 Unitycoins*`
        puntiOttenuti = -punti
    }

    // aggiorna il conto dell'utente
    user.limit = (user.limit || 0) + puntiOttenuti

    // invia il risultato e ripropone i bottoni per giocare di nuovo
    await conn.sendMessage(m.chat, {
        text: `${risultato}\n\nLa mia scelta: *${botChoice.toUpperCase()}*`,
        buttons,
        headerType: 1
    }, { quoted: m })
}

handler.help = ['scf']
handler.tags = ['game']
handler.command = ['scf', 'sassocartaforbici']

export default handler
