//Plugin fatto da Gabs333 x Staff ChatUnity
import { quizzes } from './quiz-category.js'

let handler = async (m, { conn }) => {
    const chatId = m.chat
    const userId = m.sender

    // Se c'è già un quiz attivo
    if (global.activeQuizzes && global.activeQuizzes[`${chatId}_${userId}`]) {
        return m.reply('❌ Hai già un quiz attivo! Rispondi prima alla domanda corrente.')
    }

    // Menu selezione categoria (versione compatta)
    const categoryText = `🎯 *QUIZ - SCEGLI CATEGORIA*

🌍 Geografia - Capitali, fiumi, montagne
🎬 Cinema - Film, serie TV, attori
🎮 Videogiochi - Console, giochi famosi
🎵 Musica - Cantanti, band, canzoni
🔬 Scienza - Spazio, fisica, natura
⚽ Sport - Calcio, basket, olimpiadi
💻 Tecnologia - Social, aziende, tech

💰 *+50 XP* per risposta corretta!

> \`cri bot\``.trim()

    const buttons = [
        { 
            buttonId: '.quizcat geografia', 
            buttonText: { displayText: '🌍 Geografia' }, 
            type: 1 
        },
        { 
            buttonId: '.quizcat cinema', 
            buttonText: { displayText: '🎬 Cinema' }, 
            type: 1 
        },
        { 
            buttonId: '.quizcat videogiochi', 
            buttonText: { displayText: '🎮 Videogiochi' }, 
            type: 1 
        },
        { 
            buttonId: '.quizcat musica', 
            buttonText: { displayText: '🎵 Musica' }, 
            type: 1 
        },
        { 
            buttonId: '.quizcat scienza', 
            buttonText: { displayText: '🔬 Scienza' }, 
            type: 1 
        },
        { 
            buttonId: '.quizcat sport', 
            buttonText: { displayText: '⚽ Sport' }, 
            type: 1 
        },
        { 
            buttonId: '.quizcat tecnologia', 
            buttonText: { displayText: '💻 Tecnologia' }, 
            type: 1 
        }
    ]

    const buttonMessage = {
        text: categoryText,
        footer: 'CriBot Quiz 🎮',
        buttons: buttons,
        headerType: 1
    }

    await conn.sendMessage(chatId, buttonMessage, { quoted: m })
}

handler.command = /^(quiz|trivia)$/i
handler.tags = ['game']
handler.help = ['quiz']
handler.group = false

export default handler