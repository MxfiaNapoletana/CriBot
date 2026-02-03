//Codice partita.js - Ottimizzato per API gratuita

import fetch from 'node-fetch'

const API_KEY = '85a609d694a44a699ad17238060be1e6' 
const SERIE_A_LEAGUE_ID = 'SA'
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

global.matchFollowers = global.matchFollowers || {}

const handler = async (m, { conn, command, usedPrefix }) => {
  try {
    if (command === 'partita') {
      await m.reply('🔄 *Caricamento partite Serie A...*')
      
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      const dateFrom = yesterday.toISOString().split('T')[0]
      const dateTo = today.toISOString().split('T')[0]
      
      const response = await fetch(`https://api.football-data.org/v4/competitions/${SERIE_A_LEAGUE_ID}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`, {
        headers: { 'X-Auth-Token': API_KEY }
      })
      
      const data = await response.json()
      
      if (data.message) {
        return m.reply(`❌ *Errore API*\n\n${data.message}`)
      }
      
      if (!data.matches || data.matches.length === 0) {
        return m.reply('❌ *Nessuna partita di Serie A trovata*')
      }
      
      const todayStr = today.toISOString().split('T')[0]
      const matches = data.matches.filter(match => {
        const matchDateStr = new Date(match.utcDate).toISOString().split('T')[0]
        return matchDateStr === todayStr
      }).sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
      
      if (matches.length === 0) {
        return m.reply('❌ *Nessuna partita di Serie A oggi*')
      }
      
      const buttons = matches.slice(0, 10).map(match => ({
        buttonId: `${usedPrefix}segui ${match.id}`,
        buttonText: { displayText: `${match.homeTeam.name} vs ${match.awayTeam.name}` },
        type: 1
      }))
      
      let message = '*⚽ SERIE A - PARTITE DI OGGI ⚽*\n\n'
      matches.forEach((match, index) => {
        const status = getMatchStatus(match.status)
        
        if (match.status === 'FINISHED') {
          message += `${index + 1}. 🏁 *${match.homeTeam.name} ${match.score.fullTime.home}-${match.score.fullTime.away} ${match.awayTeam.name}*\n`
          message += `   ✅ Finita | `
        } else if (match.status === 'IN_PLAY' || match.status === 'PAUSED') {
          const score = `${match.score.fullTime.home || 0}-${match.score.fullTime.away || 0}`
          message += `${index + 1}. 🔴 ${match.homeTeam.name} ${score} ${match.awayTeam.name}\n`
          message += `   ${status} | `
        } else {
          message += `${index + 1}. ${match.homeTeam.name} vs ${match.awayTeam.name}\n`
          message += `   ${status} | `
        }
        
        message += `🕐 ${new Date(match.utcDate).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}\n`
        message += `   📋 ID: \`${match.id}\`\n\n`
      })
      
      message += '👇 *Clicca su una partita per ricevere notifiche live*\n'
      message += '📊 *Usa `.dettagli ID` per vedere i dettagli completi*'
      
      await conn.sendMessage(m.chat, {
        text: message,
        footer: 'Rub by ✧˚🩸 cri 🕊️˚✧',
        buttons: buttons,
        headerType: 1
      })
      
    } else if (command === 'segui') {
      const matchId = m.text.split(' ')[1]
      
      if (!matchId) {
        return m.reply('❌ *ID partita non valido*')
      }
      
      const response = await fetch(`https://api.football-data.org/v4/matches/${matchId}`, {
        headers: { 'X-Auth-Token': API_KEY }
      })
      
      const match = await response.json()
      
      if (!match || match.message) {
        return m.reply('❌ *Partita non trovata*')
      }
      
      if (!global.matchFollowers[matchId]) {
        global.matchFollowers[matchId] = {
          users: new Set(),
          chat: m.chat,
          lastUpdate: null,
          interval: null,
          startTimeout: null,
          matchData: match,
          hasStarted: false
        }
      }
      
      global.matchFollowers[matchId].users.add(m.sender)
      
      const kickoffTime = new Date(match.utcDate)
      const now = new Date()
      const timeUntilKickoff = kickoffTime - now
      
      let replyMessage = '✅ *Notifiche attivate!*\n\n'
      replyMessage += `⚽ ${match.homeTeam.name} vs ${match.awayTeam.name}\n`
      replyMessage += `📍 Serie A\n\n`
      
      if ((match.status === 'SCHEDULED' || match.status === 'TIMED') && timeUntilKickoff > 0) {
        const hours = Math.floor(timeUntilKickoff / (1000 * 60 * 60))
        const minutes = Math.floor((timeUntilKickoff % (1000 * 60 * 60)) / (1000 * 60))
        
        replyMessage += `🕐 Orario inizio: ${kickoffTime.toLocaleString('it-IT', { 
          hour: '2-digit', 
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        })}\n`
        replyMessage += `⏳ Tempo rimanente: ${hours}h ${minutes}min\n\n`
        replyMessage += `🔔 Ti avviserò quando la partita inizierà!\n\n`
        
        if (!global.matchFollowers[matchId].startTimeout) {
          global.matchFollowers[matchId].startTimeout = setTimeout(() => {
            notifyMatchStart(conn, matchId)
          }, timeUntilKickoff)
        }
      } else if (match.status === 'IN_PLAY' || match.status === 'PAUSED') {
        replyMessage += '🔴 *PARTITA IN CORSO*\n\n'
        
        const homeScore = match.score.fullTime.home || match.score.halfTime.home || 0
        const awayScore = match.score.fullTime.away || match.score.halfTime.away || 0
        replyMessage += `📊 Punteggio attuale: ${match.homeTeam.name} ${homeScore}-${awayScore} ${match.awayTeam.name}\n\n`
        
        if (match.status === 'IN_PLAY') {
          replyMessage += `⏱️ Partita in corso\n\n`
        } else if (match.status === 'PAUSED') {
          replyMessage += `⏸️ Intervallo\n`
          if (match.score.halfTime.home !== null) {
            replyMessage += `📊 Primo Tempo: ${match.score.halfTime.home}-${match.score.halfTime.away}\n\n`
          }
        }
        
        if (!global.matchFollowers[matchId].interval) {
          startMatchMonitoring(conn, matchId)
        }
      } else if (match.status === 'FINISHED') {
        replyMessage += '✅ *PARTITA TERMINATA*\n\n'
        replyMessage += `🏁 Risultato Finale: ${match.homeTeam.name} ${match.score.fullTime.home}-${match.score.fullTime.away} ${match.awayTeam.name}\n`
        if (match.score.halfTime.home !== null) {
          replyMessage += `📊 Primo Tempo: ${match.score.halfTime.home}-${match.score.halfTime.away}\n`
        }
        replyMessage += '\n⚠️ La partita è già finita.\n\n'
      }
      
      if (match.status !== 'FINISHED') {
        replyMessage += 'Riceverai notifiche per:\n'
        replyMessage += '• ⚽ Gol e cambio punteggio\n'
        replyMessage += '• ⏸️ Fine primo tempo\n'
        replyMessage += '• ▶️ Inizio secondo tempo\n'
        replyMessage += '• 🏁 Fine partita\n\n'
        replyMessage += '⚠️ *Nota*: Aggiornamenti ogni 60 secondi\n\n'
        replyMessage += 'Usa `.stoppartita` per disattivare'
      }
      
      await m.reply(replyMessage)
      
    } else if (command === 'stoppartita') {
      let stopped = false
      for (const matchId in global.matchFollowers) {
        if (global.matchFollowers[matchId].users.has(m.sender)) {
          global.matchFollowers[matchId].users.delete(m.sender)
          stopped = true
          
          if (global.matchFollowers[matchId].users.size === 0) {
            if (global.matchFollowers[matchId].interval) {
              clearInterval(global.matchFollowers[matchId].interval)
            }
            if (global.matchFollowers[matchId].startTimeout) {
              clearTimeout(global.matchFollowers[matchId].startTimeout)
            }
            delete global.matchFollowers[matchId]
          }
        }
      }
      
      if (stopped) {
        await m.reply('✅ *Notifiche disattivate*\n\nNon riceverai più aggiornamenti.')
      } else {
        await m.reply('❌ *Non stai seguendo nessuna partita*\n\nUsa `.partita` per vedere le partite disponibili.')
      }
    }
    
  } catch (e) {
    console.error(e)
    return m.reply(`*❌ ERRORE*\n━━━━━━━━━━━━━━━━\n\n*⚠️ ${e.message}*`)
  }
}

async function notifyMatchStart(conn, matchId) {
  const followerData = global.matchFollowers[matchId]
  if (!followerData) return
  
  const match = followerData.matchData
  
  const message = `🔴 *PARTITA INIZIATA!*\n━━━━━━━━━━━━━━━━\n\n⚽ ${match.homeTeam.name} vs ${match.awayTeam.name}\n📍 Serie A\n\n⏱️ Fischio d'inizio!\n\n📊 Monitoraggio attivo...`
  
  for (const user of followerData.users) {
    await conn.sendMessage(followerData.chat, {
      text: message,
      mentions: [user]
    })
    await delay(500)
  }
  
  followerData.hasStarted = true
  startMatchMonitoring(conn, matchId)
}

async function startMatchMonitoring(conn, matchId) {
  const followerData = global.matchFollowers[matchId]
  if (!followerData) return
  
  followerData.interval = setInterval(async () => {
    try {
      const response = await fetch(`https://api.football-data.org/v4/matches/${matchId}`, {
        headers: { 'X-Auth-Token': API_KEY }
      })
      
      const match = await response.json()
      
      if (!match || match.message) {
        clearInterval(followerData.interval)
        if (followerData.startTimeout) clearTimeout(followerData.startTimeout)
        delete global.matchFollowers[matchId]
        return
      }
      
      const oldData = followerData.matchData
      followerData.matchData = match
      
      // Controlla cambio punteggio
      if (oldData.score && match.score) {
        const oldHome = oldData.score.fullTime.home || 0
        const oldAway = oldData.score.fullTime.away || 0
        const newHome = match.score.fullTime.home || 0
        const newAway = match.score.fullTime.away || 0
        
        if (newHome > oldHome || newAway > oldAway) {
          const goalMessage = `⚽ *GOL!*\n━━━━━━━━━━━━━━━━\n\n📊 ${match.homeTeam.name} ${newHome}-${newAway} ${match.awayTeam.name}\n\n🎉 Punteggio aggiornato!`
          
          for (const user of followerData.users) {
            await conn.sendMessage(followerData.chat, {
              text: goalMessage,
              mentions: [user]
            })
            await delay(500)
          }
        }
      }
      
      // Fine primo tempo
      if (match.status === 'PAUSED' && !followerData.notifiedHT) {
        const htMessage = `⏸️ *FINE PRIMO TEMPO*\n━━━━━━━━━━━━━━━━\n\n📊 ${match.homeTeam.name} ${match.score.halfTime.home || 0}-${match.score.halfTime.away || 0} ${match.awayTeam.name}\n\n⏱️ Intervallo`
        
        for (const user of followerData.users) {
          await conn.sendMessage(followerData.chat, {
            text: htMessage,
            mentions: [user]
          })
          await delay(500)
        }
        followerData.notifiedHT = true
      }
      
      // Inizio secondo tempo
      if (match.status === 'IN_PLAY' && followerData.notifiedHT && !followerData.notified2H) {
        const secondHalfMessage = `▶️ *SECONDO TEMPO*\n━━━━━━━━━━━━━━━━\n\n📊 ${match.homeTeam.name} ${match.score.halfTime.home || 0}-${match.score.halfTime.away || 0} ${match.awayTeam.name}\n\n⏱️ Si riprende!`
        
        for (const user of followerData.users) {
          await conn.sendMessage(followerData.chat, {
            text: secondHalfMessage,
            mentions: [user]
          })
          await delay(500)
        }
        followerData.notified2H = true
      }
      
      // Partita finita
      if (match.status === 'FINISHED') {
        const finalMessage = `🏁 *PARTITA TERMINATA*\n━━━━━━━━━━━━━━━━\n\n📊 ${match.homeTeam.name} ${match.score.fullTime.home}-${match.score.fullTime.away} ${match.awayTeam.name}\n📍 Serie A\n\n✅ Risultato finale`
        
        for (const user of followerData.users) {
          await conn.sendMessage(followerData.chat, {
            text: finalMessage,
            mentions: [user]
          })
          await delay(500)
        }
        
        clearInterval(followerData.interval)
        if (followerData.startTimeout) clearTimeout(followerData.startTimeout)
        delete global.matchFollowers[matchId]
      }
      
    } catch (e) {
      console.error('Errore monitoraggio:', e)
    }
  }, 60000) // Ogni 60 secondi
}

function getMatchStatus(status) {
  const statuses = {
    'SCHEDULED': '🔜 Da iniziare',
    'TIMED': '🔜 Da iniziare',
    'IN_PLAY': '🔴 LIVE',
    'PAUSED': '⏸️ Intervallo',
    'FINISHED': '✅ Finita',
    'SUSPENDED': '⏸️ Sospesa',
    'POSTPONED': '📅 Rinviata',
    'CANCELLED': '❌ Annullata'
  }
  return statuses[status] || status
}

handler.help = ['partita', 'segui', 'stoppartita']
handler.tags = ['sport']
handler.command = /^(partita|segui|stoppartita)$/i

export default handler