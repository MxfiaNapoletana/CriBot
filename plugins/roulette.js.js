/*
  =============================================================
  PLUGIN: roulette.js (Corretto con logica pizza.js)
  
  Logica:
  - L'handler principale cattura sia il comando (.roulette) sia i click dei pulsanti.
  - I pulsanti sono formattati per inviare un comando completo (es. .roulette SPIN)
  - L'argomento (SPIN, SHOOT_SELF, ecc.) viene estratto e usato per il routing.
  - Rimosso headerType: 1 per massima compatibilità.
  =============================================================
*/

import { randomInt } from 'crypto'

// Definisce lo stato della partita e le probabilità
class RouletteGame {
    constructor(playerX) {
        // ID dei giocatori
        this.playerX = playerX
        this.playerO = ''

        // Stato del gioco
        this.bullet = randomInt(1, 7) // La pallottola è in una posizione casuale (1 a 6)
        this.chamber = 1 // La camera da cui si spara (1 a 6)
        this.turn = playerX // Inizia il giocatore che ha creato la stanza
        this.shotsFired = 0 // Colpi sparati in questo round
        this.history = []
    }

    // Gira il tamburo
    spin(times = 1) {
        if (this.chamber !== 1) {
            this.chamber = 1
        }
        this.bullet = randomInt(1, 7)
        this.shotsFired = 0
    }

    // Sparo!
    shoot(target) {
        const isHit = this.chamber === this.bullet
        const targetId = target === 'self' ? this.turn : (this.turn === this.playerX ? this.playerO : this.playerX)
        this.shotsFired++

        if (isHit) {
            this.history.push({ player: targetId, action: 'HIT', chamber: this.chamber })
            return { hit: true, winner: this.getOtherPlayerId(targetId) }
        } else {
            this.history.push({ player: targetId, action: 'MISS', chamber: this.chamber })
            this.chamber = (this.chamber % 6) + 1 
            this.turn = this.getOtherPlayerId(this.turn)
            return { hit: false }
        }
    }

    getOtherPlayerId(id) {
        return id === this.playerX ? this.playerO : this.playerX
    }

    get currentPlayer() {
        return this.turn
    }
}

// Handler principale del gioco (Stile pizza.js)
let handler = async (m, { conn, usedPrefix, command }) => {
    conn.game = conn.game ? conn.game : {}
    const sender = m.sender

    // 1. Parsing dell'input (esattamente come in pizza.js)
    // Cattura sia il comando digitato (.roulette sala1) sia il click del pulsante (.roulette SPIN)
    const btnId = m?.message?.buttonsResponseMessage?.selectedButtonId || "";
    const text = m.text || btnId || "";
    
    // Estrae l'azione (es. SPIN, SHOOT_SELF) o il nome della stanza (es. sala1)
    const arg = text.replace(usedPrefix, "").trim().split(/\s+/)[1] || ""; 
    
    // 2. Controllo se l'utente è in una partita E sta eseguendo un'azione
    let room = Object.values(conn.game).find(room => 
        room.id.startsWith('roulette') && [room.game.playerX, room.game.playerO].includes(sender)
    )

    // Se la stanza esiste, è in gioco E l'argomento è un'azione di gioco
    if (room && room.state === 'PLAYING' && (arg.startsWith('SHOOT_') || arg.startsWith('SPIN'))) {
        
        if (room.game.currentPlayer !== sender) {
            return m.reply('❌ Aspetta il tuo turno!')
        }
        
        const action = arg; // L'argomento è l'azione (es. SPIN_COUNT_1)
        const value = arg.split('_')[2] || null; // '1' o '2' per lo spin

        // 3. Gestione delle azioni di gioco
        switch (action) {
            case 'SHOOT_SELF':
            case 'SHOOT_ENEMY':
                const target = action === 'SHOOT_SELF' ? 'self' : 'enemy'
                const result = room.game.shoot(target)
                
                let message = `*--- 💥 ROUND SPARO! 💥 ---\n\n*`

                if (result.hit) {
                    // Partita Finita
                    const loserTag = '@' + (target === 'self' ? sender : room.game.getOtherPlayerId(sender)).split('@')[0]
                    const winnerTag = '@' + result.winner.split('@')[0]
                    message += `*CAMERA ${room.game.chamber === 1 ? 6 : room.game.chamber - 1}... 💥 BUM! 🔫*\n\n${loserTag} è stato ELIMINATO!\n\n🏆 *VINCITORE: ${winnerTag}* 🏆\n\n_Scrivi .roulette per iniziare una nuova partita._`
                    
                    delete conn.game[room.id]
                    return conn.sendMessage(m.chat, { text: message, mentions: conn.parseMention(message) }, { quoted: m })

                } else {
                    // A vuoto! Passa il turno
                    message += `*CAMERA ${room.game.chamber === 1 ? 6 : room.game.chamber - 1} | 💨 CLICK!* (A vuoto)\n\nLa pistola è passata a @${room.game.currentPlayer.split('@')[0]}\n\n_È rimasta ${6 - room.game.shotsFired} colpi da sparare prima di ricaricare!_`
                    
                    // Invia il menu per il nuovo turno (passando 'm' per il quoted)
                    return sendRouletteMenu(conn, m, room, message, usedPrefix, command)
                }

            case 'SPIN':
                // Mostra il sottomenu per girare
                const spinText = `*🔄 QUANTE VOLTE VUOI GIRARE IL TAMBURO?*\n\nSe scegli 1 o 2, la camera si resetta alla posizione iniziale, ma la pallottola viene rimescolata!`
                
                // I pulsanti del sottomenu DEVONO inviare un comando completo
                const spinButtons = [
                    { buttonId: `${usedPrefix}${command} SPIN_COUNT_1`, buttonText: { displayText: "1️⃣ Gira una volta" }, type: 1 },
                    { buttonId: `${usedPrefix}${command} SPIN_COUNT_2`, buttonText: { displayText: "2️⃣ Gira due volte" }, type: 1 }
                ]
                // Rimosso headerType: 1
                await conn.sendMessage(m.chat, { text: spinText, buttons: spinButtons }, { quoted: m })
                break;
            
            case 'SPIN_COUNT_1':
            case 'SPIN_COUNT_2':
                // Azione Gira Effettiva
                const times = parseInt(action.split('_')[2]) // 1 o 2
                room.game.spin(times)
                
                const spinMessage = `*TAMBURO GIRATO ${times} VOLT${times > 1 ? 'E' : 'A'}!*\n\nLa pistola è passata a @${room.game.currentPlayer.split('@')[0]} e la camera è stata resettata. Buona fortuna!`
                
                // Rimanda al menu principale dopo il giro
                return sendRouletteMenu(conn, m, room, spinMessage, usedPrefix, command)

            default:
                break; // L'utente era in gioco ma ha scritto un comando non di azione (es. .roulette sala2)
        }
        return // Termina l'esecuzione se è stata gestita un'azione
    }

    // 4. Logica di Inizio Partita (Se non era un'azione di gioco)
    
    // Se l'utente è già in una stanza E l'input non era un'azione (es. .roulette), bloccagli l'avvio di una nuova partita.
    if (room) {
        return m.reply('*[❗] _STAI GIA GIOCANDO CON QUALCUNO_*\n(Se vuoi uscire, usa .esciroulette - non incluso in questo file)')
    }

    // L'argomento è il nome della stanza
    const roomName = arg || 'roulette-default'
    let existingRoom = Object.values(conn.game).find(r => r.name === roomName && r.state === 'WAITING' && r.id.startsWith('roulette'))

    if (existingRoom) {
        // 🤝 Unisciti alla stanza
        if (existingRoom.game.playerX === sender) {
            return m.reply('❌ Non puoi unirti alla tua stessa partita! Aspetta un avversario.')
        }

        existingRoom.o = m.chat
        existingRoom.game.playerO = sender
        existingRoom.state = 'PLAYING'
        
        await m.reply('*[🔫] 𝐋𝐀 𝐏𝐀𝐑𝐓𝐈𝐓𝐀 𝐒𝐓𝐀 𝐈𝐍𝐈𝐙𝐈𝐀𝐍𝐃𝐎!* Un giocatore si è unito alla roulette.\n\n_Il tamburo è stato caricato e girato._')
        
        // Invia il menu al giocatore X (se il chat è diverso da O)
        if (existingRoom.x !== existingRoom.o) {
            await sendRouletteMenu(conn, m, existingRoom, `*Il tuo avversario si è unito!* Tocca a te, @${existingRoom.game.currentPlayer.split('@')[0]}.`, usedPrefix, command)
        }
        
        // Invia il menu al giocatore O (il nuovo arrivato)
        await sendRouletteMenu(conn, m, existingRoom, `*Sei entrato!* Tocca a @${existingRoom.game.currentPlayer.split('@')[0]}.`, usedPrefix, command)

    } else {
        // 🎲 Crea la stanza
        room = {
            id: 'roulette-' + (+new Date),
            name: roomName,
            x: m.chat,
            o: '',
            game: new RouletteGame(sender),
            state: 'WAITING'
        }
        conn.game[room.id] = room

        conn.reply(m.chat, `*🔫 ROULETTE RUSSA - SALA: ${roomName.toUpperCase()} 🎲*

*𝐀𝐭𝐭𝐞𝐧𝐝𝐞𝐧𝐝𝐨 𝐠𝐢𝐨𝐜𝐚𝐭𝐨𝐫𝐢...*
══════════════
*(comando fatto da +393516612216)*
🕹️ 𝐏𝐞𝐫 𝐩𝐚𝐫𝐭𝐞𝐜𝐢𝐩𝐚𝐫𝐞 𝐝𝐢𝐠𝐢𝐭𝐚:
*${usedPrefix + command} ${roomName}*
══════════════
⛔ 𝐏𝐞𝐫 𝐮𝐬𝐜𝐢𝐫𝐞 𝐝𝐢𝐠𝐢𝐭𝐚 *${usedPrefix}esciroulette*
*(plugin creato da +393516612216)*\n_La pistola è stata caricata con 1 proiettile su 6._`, null, m)
    }
}

// Funzione per inviare il menu di gioco con i pulsanti (Stile pizza.js)
// Abbiamo bisogno di 'm', 'usedPrefix' e 'command' per il quoting e per i buttonId
const sendRouletteMenu = async (conn, m, room, headerText, usedPrefix, command) => {
    const game = room.game
    const playerXTag = '@' + game.playerX.split('@')[0]
    const playerOTag = '@' + game.playerO.split('@')[0]
    const turnTag = '@' + game.currentPlayer.split('@')[0]

    const str = `${headerText}\n\n` +
                `*🫵 Turno:* ${turnTag}\n` +
                `*👤 Giocatori:*\n ${playerXTag} (X) vs ${playerOTag} (O)\n` +
                `*🕳️ Colpi Rimanenti:* ${6 - game.shotsFired}\n` +
                `*👁️ Camera Attuale:* ${game.chamber}\n\n` +
                `*Cosa vuoi fare?*`
    
    // I pulsanti DEVONO inviare un comando completo che l'handler può catturare
    const buttons = [
        { buttonId: `${usedPrefix}${command} SPIN`, buttonText: { displayText: "🔄 Gira il Tamburo" }, type: 1 },
        { buttonId: `${usedPrefix}${command} SHOOT_SELF`, buttonText: { displayText: "💀 Spara a Me" }, type: 1 },
        { buttonId: `${usedPrefix}${command} SHOOT_ENEMY`, buttonText: { displayText: "🎯 Spara al Nemico" }, type: 1 }
    ]

    // Rimosso headerType: 1 e il quoted complesso. Usiamo il quoted semplice di pizza.js
    await conn.sendMessage(m.chat, { text: str, buttons, mentions: conn.parseMention(str) }, { quoted: m })
}

handler.command = /^(roulette|russa)$/i
handler.group = true
handler.fail = null // Aggiunto per coerenza con l'esempio

export default handler