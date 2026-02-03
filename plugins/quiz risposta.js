if (!global.activeQuizzes) global.activeQuizzes = {}

let handler = async (m, { conn, args, text }) => {
    const answerIndex = parseInt(args[0] || text)
    const chatId = m.chat
    const userId = m.sender
    const quizKey = `${chatId}_${userId}`

    if (!global.activeQuizzes[quizKey]) {
        return m.reply('❌ Non hai nessun quiz attivo! Usa .quiz')
    }

    if (isNaN(answerIndex)) {
        return m.reply('❌ Risposta non valida!')
    }

    const quizData = global.activeQuizzes[quizKey]
    const quiz = quizData.quiz
    
    // Incrementa tentativi
    quizData.attempts++

    // Calcola il tempo impiegato
    const timeElapsed = Math.floor((Date.now() - quizData.startTime) / 1000)

    if (answerIndex === quiz.correct) {
        // Risposta corretta! 🎉
        const xpGain = Math.max(50 - (timeElapsed * 2), 20)
        
        // Aggiungi XP all'utente
        let user = global.db.data.users[userId]
        if (user) {
            user.exp += xpGain
        }

        const correctMsg = `
✅ *CORRETTO!* 🎉

${quiz.explanation}

⏱️ Tempo: ${timeElapsed}s
💰 XP guadagnati: +${xpGain}
🎯 Tentativi: ${quizData.attempts}

Usa .quiz per un'altra domanda!
`.trim()

        await conn.reply(chatId, correctMsg, m)
        delete global.activeQuizzes[quizKey]

    } else {
        // Risposta sbagliata 😢
        if (quizData.attempts >= 2) {
            const failMsg = `
❌ *SBAGLIATO!* 

La risposta corretta era: *${quiz.options[quiz.correct]}*

${quiz.explanation}

Usa .quiz per riprovare!
`.trim()
            await conn.reply(chatId, failMsg, m)
            delete global.activeQuizzes[quizKey]
        } else {
            await conn.reply(chatId, `❌ Sbagliato! Hai ancora ${2 - quizData.attempts} tentativo/i.`, m)
        }
    }
}

handler.command = /^quizanswer$/i
handler.help = ['quizanswer <numero>']
handler.tags = ['game']

export default handler
