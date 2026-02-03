const SYMBOLS = {
    X: '❎',
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

let moveHandler = async (m, { conn, text, usedPrefix }) => {
    conn.game = conn.game || {}
    
    // Trova la partita attiva del giocatore
    let room = Object.values(conn.game).find(r => 
        r.state === 'PLAYING' && 
        [r.game.playerX, r.game.playerO].includes(m.sender)
    )
    
    if (!room) {
        return conn.sendMessage(m.chat, {
            text: `╔═══════════════════════════╗
║  ⚠️  𝙉𝙀𝙎𝙎𝙐𝙉𝘼 𝙋𝘼𝙍𝙏𝙄𝙏𝘼  ⚠️  ║
╚═══════════════════════════╝

❌ *Non stai giocando!*

📋 *Per iniziare:*
${usedPrefix}gioca nome_stanza

━━━━━━━━━━━━━━━━━━━━━
    🎮 Crea una partita prima
━━━━━━━━━━━━━━━━━━━━━`,
            mentions: [m.sender]
        }, { quoted: m })
    }
    
    let pos = parseInt(text)
    
    if (!pos || pos < 1 || pos > 9) {
        // Usa il metodo se esiste, altrimenti mostra tutte le posizioni
        const available = room.game.getAvailablePositions ? 
            room.game.getAvailablePositions().join(', ') : 
            '1, 2, 3, 4, 5, 6, 7, 8, 9'
            
        return conn.sendMessage(m.chat, {
            text: `╔═════════════════════════════╗
║  ❌  𝙉𝙐𝙈𝙀𝙍𝙊 𝙄𝙉𝙑𝘼𝙇𝙄𝘿𝙊  ❌  ║
╚═════════════════════════════╝

⚠️ *Numero non valido!*

📍 *Usa numeri da 1 a 9*
💡 *Posizioni libere:* ${available}

━━━━━━━━━━━━━━━━━━━━━
    🎮 Riprova con un numero valido
━━━━━━━━━━━━━━━━━━━━━`,
            mentions: [m.sender]
        }, { quoted: m })
    }
    
    if (room.game.currentTurn !== m.sender) {
        return conn.sendMessage(m.chat, {
            text: `╔═══════════════════════╗
║  ⏳  𝙉𝙊𝙉 𝙏𝙐𝙊 𝙏𝙐𝙍𝙉𝙊  ⏳  ║
╚═══════════════════════╝

⚠️ *Non è il tuo turno!*

⏱️ *Turno di:* @${room.game.currentTurn.split('@')[0]}

━━━━━━━━━━━━━━━━━━━━━
    ⏳ Attendi...
━━━━━━━━━━━━━━━━━━━━━`,
            mentions: [room.game.currentTurn]
        }, { quoted: m })
    }
    
    // Esegui la mossa
    let ok = room.game.move(m.sender, pos)
    
    if (!ok) {
        return conn.sendMessage(m.chat, {
            text: `╔═══════════════════════╗
║  ❌  𝘾𝙀𝙇𝙇𝘼 𝙊𝘾𝘾𝙐𝙋𝘼𝙏𝘼  ❌  ║
╚═══════════════════════╝

⚠️ *Cella già occupata!*

💡 *Scegli un'altra posizione*

━━━━━━━━━━━━━━━━━━━━━
    🎮 Riprova
━━━━━━━━━━━━━━━━━━━━━`,
            mentions: [m.sender]
        }, { quoted: m })
    }
    
    // Controlla se c'è un vincitore
    if (room.game.winner) {
        await handleGameEnd(conn, room, m)
    } else {
        await sendBoardUpdate(conn, room, m)
    }
}

/**
 * Gestisce la fine della partita
 */
async function handleGameEnd(conn, room, m) {
    const arr = room.game.render().map(v => SYMBOLS[v])
    let resultMessage
    
    if (room.game.winner === 'DRAW') {
        resultMessage = `╔═══════════════════════════╗
║  🤝  𝙋𝘼𝙍𝙀𝙂𝙂𝙄𝙊  🤝  ║
╚═══════════════════════════╝

        ${arr.slice(0, 3).join(' ')}
        ${arr.slice(3, 6).join(' ')}
        ${arr.slice(6, 9).join(' ')}

━━━━━━━━━━━━━━━━━━━━━

🤝 *Pareggio!*

👥 *Giocatori:*
❎ @${room.game.playerX.split('@')[0]}
⭕ @${room.game.playerO.split('@')[0]}

━━━━━━━━━━━━━━━━━━━━━
    🎮 Partita terminata
━━━━━━━━━━━━━━━━━━━━━`
    } else {
        const winnerSymbol = room.game.winner === room.game.playerX ? '❎' : '⭕'
        resultMessage = `╔═══════════════════════════╗
║  🏆  𝙑𝙄𝙏𝙏𝙊𝙍𝙄𝘼  🏆  ║
╚═══════════════════════════╝

        ${arr.slice(0, 3).join(' ')}
        ${arr.slice(3, 6).join(' ')}
        ${arr.slice(6, 9).join(' ')}

━━━━━━━━━━━━━━━━━━━━━

🎉 *Vincitore:*
${winnerSymbol} @${room.game.winner.split('@')[0]}

👥 *Giocatori:*
❎ @${room.game.playerX.split('@')[0]}
⭕ @${room.game.playerO.split('@')[0]}

━━━━━━━━━━━━━━━━━━━━━
    🏆 Congratulazioni!
━━━━━━━━━━━━━━━━━━━━━`
    }
    
    const mentions = [room.game.playerX, room.game.playerO]
    
    // Invia a entrambi i giocatori
    await conn.sendMessage(room.x, {
        text: resultMessage,
        mentions: mentions
    }, { quoted: m })
    
    if (room.o !== room.x) {
        await conn.sendMessage(room.o, {
            text: resultMessage,
            mentions: mentions
        }, { quoted: m })
    }
    
    // Elimina la stanza
    delete conn.game[room.id]
}

/**
 * Invia aggiornamento del tabellone
 */
async function sendBoardUpdate(conn, room, m) {
    const arr = room.game.render().map(v => SYMBOLS[v])
    
    // Usa il metodo se esiste, altrimenti calcola manualmente
    const available = room.game.getAvailablePositions ? 
        room.game.getAvailablePositions().join(', ') : 
        room.game.board
            .map((cell, i) => cell === null ? i + 1 : null)
            .filter(p => p !== null)
            .join(', ')
    
    let str = `╔═══════════════════════════╗
║     🎮  𝙏𝙍𝙄𝙎 𝙂𝘼𝙈𝙀  🎮     ║
╚═══════════════════════════╝

👥 *Giocatori:*
❎ = @${room.game.playerX.split('@')[0]}
⭕ = @${room.game.playerO.split('@')[0]}

━━━━━━━━━━━━━━━━━━━━━

        ${arr.slice(0, 3).join(' ')}
        ${arr.slice(3, 6).join(' ')}
        ${arr.slice(6, 9).join(' ')}

━━━━━━━━━━━━━━━━━━━━━

⏱️ *Turno di:* @${room.game.currentTurn.split('@')[0]}

💡 *Posizioni libere:*
${available}

━━━━━━━━━━━━━━━━━━━━━
`.trim()
    
    const mentions = conn.parseMention(str)
    
    await conn.sendMessage(room.x, {
        text: str,
        mentions: mentions
    }, { quoted: m })
    
    if (room.o !== room.x) {
        await conn.sendMessage(room.o, {
            text: str,
            mentions: mentions
        }, { quoted: m })
    }
}

moveHandler.help = ['mossa']
moveHandler.tags = ['game']
moveHandler.command = /^mossa$/i

export default moveHandler