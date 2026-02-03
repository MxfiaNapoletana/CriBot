import TicTacToe from '../lib/tictactoe.js'

const SYMBOLS = {
    X: '❌',
    O: '⭕',
    1: '1️⃣',
    2: '2️⃣',
    3: '3️⃣',
    4: '4️⃣',
    5: '5️⃣',
    6: '6️⃣',
    7: '7️⃣',
    8: '8️⃣',
    9: '9️⃣'
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
    conn.game = conn.game || {}

    // 🔸 Se comando è "gioca/tris/ttt/xo" → crea/entra stanza
    if (command.match(/gioca|tris|ttt|xo/i)) {
        return await handleCreateJoin(conn, m, text, usedPrefix)
    }

    // 🔸 Se è ".mossa 5"
    if (command === 'mossa') {
        if (!text) {
            return m.reply("┌─────────────────────┐\n│   ⚠️  ATTENZIONE   │\n└─────────────────────┘\n\n❌ Devi indicare una posizione!\n\n📝 Esempio: `.mossa 5`")
        }
        return await handleMove(conn, m, text, usedPrefix)
    }

    // 🔸 Se è un numero scritto da solo → mossa
    return await handleMove(conn, m, text, usedPrefix)
}

/* -------------------------------------------------------
    📌  CREAZIONE / JOIN STANZA
------------------------------------------------------- */
async function handleCreateJoin(conn, m, text, usedPrefix) {
    const existingGame = Object.values(conn.game).find(room =>
        room.id.startsWith('tictactoe') &&
        [room.game.playerX, room.game.playerO].includes(m.sender)
    )

    if (existingGame) {
        return conn.sendMessage(m.chat, {
            text: `┌──────────────────────────────┐
│   ⚠️  SEI GIÀ IN PARTITA!   │
└──────────────────────────────┘

🎮 Hai una partita in corso!

📍 Come giocare:
• Scrivi un numero da 1 a 9
• Oppure usa: \`.mossa [numero]\`

💡 Completa la partita in corso prima di iniziarne una nuova!`
        }, { quoted: m })
    }

    if (!text) {
        return m.reply(
            `┌──────────────────────────┐
│   🎮  CREA UNA STANZA   │
└──────────────────────────┘

❌ *Devi dare un nome alla stanza!*

📝 Esempi:
• ${usedPrefix}*gioca tris*
• ${usedPrefix}*tris porcoddio*
• ${usedPrefix}*xo ciao*

💡 Il nome serve per permettere ad altri di unirsi!`
        )
    }

    let room = Object.values(conn.game).find(r =>
        r.state === 'WAITING' && r.name === text
    )

    if (room) {
        return await startGame(conn, m, room)
    } else {
        return await createRoom(conn, m, text, usedPrefix)
    }
}

/* -------------------------------------------------------
    📌  MOSSA
------------------------------------------------------- */
async function handleMove(conn, m, text, usedPrefix) {
    let room = Object.values(conn.game).find(room =>
        room.id.startsWith('tictactoe') &&
        room.state === 'PLAYING' &&
        [room.game.playerX, room.game.playerO].includes(m.sender)
    )

    if (!room) return

    if (room.game.currentTurn !== m.sender) {
        return m.reply(`┌─────────────────────┐
│   ⏳  NON È IL TUO TURNO!   │
└─────────────────────┘

🔄 Aspetta che l'altro giocatore faccia la sua mossa!`)
    }

    let position = parseInt(text || m.text)

    if (isNaN(position) || position < 1 || position > 9) {
        return m.reply(
            `┌──────────────────────────┐
│   ❌  POSIZIONE NON VALIDA   │
└──────────────────────────┘

📍 Posizioni disponibili:
${room.game.getAvailablePositions().map(p => `• ${p}`).join('\n')}

💡 Scrivi un numero da 1 a 9!`
        )
    }

    const moveSuccess = room.game.move(m.sender, position)

    if (!moveSuccess) {
        return m.reply(`┌─────────────────────────┐
│   ❌  CASELLA OCCUPATA!   │
└─────────────────────────┘

⚠️ Quella casella è già stata presa!

📍 Prova con una di queste:
${room.game.getAvailablePositions().map(p => `• ${p}`).join('\n')}`)
    }

    if (room.game.winner) {
        return await handleGameEnd(conn, room, m)
    }

    return await sendBoardUpdate(conn, room, m)
}

/* -------------------------------------------------------
    📌  AVVIO PARTITA
------------------------------------------------------- */
async function startGame(conn, m, room) {
    room.o = m.chat
    room.game.playerO = m.sender
    room.state = 'PLAYING'

    const boardMessage = renderBoard(room.game)

    if (room.x !== room.o) {
        await conn.sendMessage(room.x, { text: boardMessage, mentions: [room.game.playerX, room.game.playerO] }, { quoted: m })
    }

    await conn.sendMessage(room.o, { text: boardMessage, mentions: [room.game.playerX, room.game.playerO] }, { quoted: m })
}

/* -------------------------------------------------------
    📌  CREAZIONE STANZA
------------------------------------------------------- */
async function createRoom(conn, m, roomName, usedPrefix) {
    const room = {
        id: 'tictactoe-' + Date.now(),
        x: m.chat,
        o: '',
        game: new TicTacToe(m.sender, 'o'),
        state: 'WAITING',
        name: roomName,
        createdAt: Date.now()
    }

    conn.game[room.id] = room

    await conn.sendMessage(m.chat, {
        text: `╔═══════════════════════════╗
║   🎮  STANZA CREATA!  🎮   ║
╚═══════════════════════════╝

📌 Nome stanza: *${roomName}*
👤 *Creatore*: @${m.sender.split('@')[0]}
⏳ *In attesa dell'avversario...*

━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Per unirti usa:
\`${usedPrefix}gioca ${roomName}\`

💡 Condividi questo messaggio con chi vuoi sfidare!`,
        mentions: [m.sender]
    }, { quoted: m })
}

/* -------------------------------------------------------
    📌  FINE PARTITA
------------------------------------------------------- */
async function handleGameEnd(conn, room, m) {
    const arr = room.game.render().map(v => SYMBOLS[v])

    let text = ""

    if (room.game.winner === "DRAW") {
        text = `╔═══════════════════════════╗
║   🤝  PAREGGIO!  🤝   ║
╚═══════════════════════════╝

┌─────────────┐
│ ${arr.slice(0,3).join(' │ ')} │
├─────────────┤
│ ${arr.slice(3,6).join(' │ ')} │
├─────────────┤
│ ${arr.slice(6,9).join(' │ ')} │
└─────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━

👥 Giocatori:
❌ @${room.game.playerX.split('@')[0]}
⭕ @${room.game.playerO.split('@')[0]}

🎲 Partita finita in pareggio!
Fate una rivincita! 🔄`
    } else {
        const winnerSymbol = room.game.winner === room.game.playerX ? '❌' : '⭕'
        text = `╔═══════════════════════════╗
║   🏆  VITTORIA!  🏆   ║
╚═══════════════════════════╝

┌─────────────┐
│ ${arr.slice(0,3).join(' │ ')} │
├─────────────┤
│ ${arr.slice(3,6).join(' │ ')} │
├─────────────┤
│ ${arr.slice(6,9).join(' │ ')} │
└─────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━

👥 Giocatori:
❌ @${room.game.playerX.split('@')[0]}
⭕ @${room.game.playerO.split('@')[0]}

🎉 Vincitore: ${winnerSymbol} @${room.game.winner.split('@')[0]}

🎊 Complimenti! 🎊`
    }

    await conn.sendMessage(room.x, { text, mentions: [room.game.playerX, room.game.playerO] })
    if (room.x !== room.o) {
        await conn.sendMessage(room.o, { text, mentions: [room.game.playerX, room.game.playerO] })
    }

    delete conn.game[room.id]
}

/* -------------------------------------------------------
    📌  UPDATE TABELLA
------------------------------------------------------- */
async function sendBoardUpdate(conn, room, m) {
    const text = renderBoard(room.game)
    const mentions = [room.game.playerX, room.game.playerO]

    if (room.x !== room.o) {
        await conn.sendMessage(room.x, { text, mentions }, { quoted: m })
    }

    await conn.sendMessage(room.o, { text, mentions }, { quoted: m })
}

/* -------------------------------------------------------
    📌  RENDER TABELLA
------------------------------------------------------- */
function renderBoard(game) {
    const arr = game.render().map(v => SYMBOLS[v])
    const available = game.getAvailablePositions().join(', ')
    const currentPlayer = game.currentTurn === game.playerX ? '❌' : '⭕'

    return `╔═══════════════════════════╗
║   🎮  TRIS IN CORSO  🎮   ║
╚═══════════════════════════╝

👥 *GIOCATORI*
❌ @${game.playerX.split('@')[0]}
⭕ @${game.playerO.split('@')[0]}

━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 *TABELLONE*

┌─────────────┐
│ ${arr.slice(0,3).join(' │ ')} │
├─────────────┤
│ ${arr.slice(3,6).join(' │ ')} │
├─────────────┤
│ ${arr.slice(6,9).join(' │ ')} │
└─────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━

⏳ *TURNO*: ${currentPlayer} @${game.currentTurn.split('@')[0]}

📍 *Posizioni libere*: ${available}

━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 *Come giocare*:
• Scrivi un numero (1-9)
• Oppure: \`.mossa [numero]\``
}

/* -------------------------------------------------------
    📌  EXPORT
------------------------------------------------------- */

handler.help = ['gioca', 'tris', 'ttt', 'xo', 'mossa']
handler.tags = ['game']
handler.command = /^(gioca|tris|ttt|xo|mossa|\d+)$/i

export default handler