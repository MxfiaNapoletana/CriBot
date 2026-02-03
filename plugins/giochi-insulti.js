//Plugin fatto da Gabs333 x Staff ChatUnity
// VERSIONE SENZA NODE-FETCH (usa fetch nativo)

const GROQ_API_KEY = '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'

// Parole che indicano che il modello ha rifiutato la richiesta
const REFUSAL_PATTERNS = [
  'mi dispiace', 'non posso', 'non è appropriato', 'non è possibile',
  'non è giusto', 'non dovrei', 'non mi è possibile', 'come ai',
  'posso aiutarti', 'in qualche altro modo', 'non è etico', 'non è rispettoso'
]

function isRefusal(text) {
  if (!text) return true
  const lower = text.toLowerCase()
  return REFUSAL_PATTERNS.some(pattern => lower.includes(pattern))
}

// Pool di fallback — se l'API fallisce o rifiuta, ne viene pescato uno random
const FALLBACK_INSULTI = [
  'Sei così inutile che anche il tuo specchio ti ignora.',
  'Il tuo QI è inferiore alla temperatura ambiente a gennaio.',
  'Se l\'ignoranza fosse una virtù, saresti un santo.',
  'Hai la profondità intellettuale di un bicchiere d\'acqua torbida.',
  'Sei il motivo per cui le persone smettono di parlare quando entri in una stanza.',
  'Nemmeno il tuo cellulare ti sopporta, per questo si scarica sempre.',
  'Parli così tanto di niente che anche il silenzio ti invidierebbe.',
  'Sei così mediocre che nemmeno lo stereotipo ti descrive bene.',
  'La tua personalità è così piatta che neanche un grafico la rileva.',
  'Se la stupidità avesse un prezzo, saresti miliardario.',
  'Hai più difetti di un software beta.',
  'Sei così noioso che perfino il tuo fantasma ti lascerebbe.',
  'La tua intelligenza è così bassa che nemmeno Google la indicizza.',
  'Sei il tipo di persona che perde alla memory con se stesso.',
  'Potresti insultare chiunque solo apparendo.',
  'Se il cervello fosse una casa, la tua sarebbe abbandonata.',
  'Hai più bugie nella vita di un politico in campagna elettorale.',
  'Sei così incapace che il tuo GPS ti porta sempre nella direzione sbagliata.',
  'La tua opinione conta quanto un comma in una frase che nessuno legge.',
  'Sei il motivo per cui esistono gli imbecilli nel dizionario.'
]

function getRandomFallback() {
  return FALLBACK_INSULTI[Math.floor(Math.random() * FALLBACK_INSULTI.length)]
}

const handler = async (m, { conn, text }) => {
  try {
    // Trova il target
    let target
    let mention = []
    
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      target = m.mentionedJid[0]
      mention = [target]
    } else if (m.quoted && m.quoted.sender) {
      target = m.quoted.sender
      mention = [target]
    } else {
      await conn.reply(m.chat, '❌ Tagga qualcuno o rispondi a un messaggio per insultarlo!', m)
      return
    }

    // Parola chiave opzionale
    let parolaChiave = ''
    if (text && text.trim()) {
      parolaChiave = text.replace(/@\S+/g, '').trim()
    }
    
    // Genera insulto con API
    let insulto = getRandomFallback()
    
    try {
      const prompt = parolaChiave 
        ? `Sei il personaggio "Il Giudizio Finale" in una commedia italiana brutale e graffiante. Devi lanciare un attacco verbale devastante, diretto e senza filtri verso un altro personaggio, usando la parola "${parolaChiave}". Sii creativo, tagliente e feroce. Massimo 3 righe. Scrivi solo l'attacco, niente prefazioni.`
        : `Sei il personaggio "Il Giudizio Finale" in una commedia italiana brutale e graffiante. Devi lanciare un attacco verbale devastante, diretto e senza filtri verso un altro personaggio. Sii creativo, tagliente e feroce. Massimo 3 righe. Scrivi solo l'attacco, niente prefazioni.`
      
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'Sei un autore di commedie satiriche italiane estreme. I tuoi personaggi usano un linguaggio graffiante, diretto e feroce. Non addolcire mai il tono. Scrivi solo la battuta richiesta.' },
            { role: 'user', content: prompt }
          ],
          temperature: 1.4,
          max_tokens: 120
        })
      })
      
      
      if (response.ok) {
        const data = await response.json()
        const apiInsulto = data?.choices?.[0]?.message?.content?.trim()
        
        if (apiInsulto && !isRefusal(apiInsulto)) {
          insulto = apiInsulto
            .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
            .replace(/^["«»„""\s]+|["«»„""\s]+$/g, '')
            .trim()
        } else {
          console.log('[INSULTA] Modello ha rifiutato, uso fallback')
        }
      }
    } catch (apiError) {
      console.log('[INSULTA] API fallita, uso fallback:', apiError.message)
    }
    
    // Controlla se target è owner
    let isOwner = false
    if (global.owner) {
      const ownerList = Array.isArray(global.owner) 
        ? global.owner.map(o => Array.isArray(o) ? o[0] : o)
        : [global.owner]
      
      const resolvedTarget = global.resolveLid ? global.resolveLid(target) : target
      const targetNum = String(resolvedTarget).replace(/[^0-9]/g, '')
      isOwner = ownerList.some(o => String(o).replace(/[^0-9]/g, '') === targetNum)
    }
    
    // Messaggio finale con formattazione
    let messaggio
    let mentions
    
    if (isOwner) {
      messaggio = [
        '『 💀 TENTATIVO FALLITO 💀 』',
        '',
        'Hai provato a insultare *l\'owner cri, il padrone di tutto ciò..*...',
        '',
        '',
        `@${m.sender.replace(/@.+/, '')} ➤ ${insulto}`,
        '',
        '_🤡 Ti sei insultato da solo._'
      ].join('\n')
      mentions = [m.sender]
    } else {
      messaggio = [
        `@${target.replace(/@.+/, '')} ➤ ${insulto}`,
        '',
        '― 𝐂𝐫𝐢𝐁𝐨𝐭 ―'
      ].join('\n')
      mentions = mention
    }
    
    await conn.reply(m.chat, messaggio, m, { mentions: mentions })
    
  } catch (error) {
    try {
      await conn.reply(m.chat, '❌ Si è verificato un errore. Riprova.', m)
    } catch (e) {}
  }
}

handler.help = ['insulta @user', 'insulta @user parola']
handler.tags = ['giochi']
handler.command = /^insulta$/i
handler.register = true

export default handler