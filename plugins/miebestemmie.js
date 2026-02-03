let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    let bestemmie = user?.blasphemy || 0
    

    
    let text = `📊 *Le tue bestemmie*\n\n`
    
    if (bestemmie > 0) {
        text += `Hai bestemmiato *${bestemmie}* ${bestemmie === 1 ? 'volta' : 'volte'}! 😈`
    } else {
        text += `Non hai ancora bestemmiato! 😇`
    }
    
    m.reply(text)
}

handler.help = ['miebestemmie']
handler.tags = ['info']
handler.command = /^(miebestemmie|bestemmie)$/i

export default handler