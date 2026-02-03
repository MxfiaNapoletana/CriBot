let handler = async (m, { conn, isOwner }) => {
    if (!m.isGroup) return m.reply('⚠️ Questo comando funziona solo nei gruppi!')
    
    try {
        // Recupera i metadati del gruppo
        const groupMetadata = await conn.groupMetadata(m.chat)
        
        if (!groupMetadata || !groupMetadata.participants) {
            return m.reply('❌ Impossibile recuperare i dati del gruppo')
        }
        
        // Inizializza il mapping se non esiste
        if (!global.userNumberMapping) global.userNumberMapping = {}
        
        let scanned = 0
        let mapped = 0
        let errors = 0
        
        m.reply('🔍 Scansione del gruppo in corso...')
        
        for (const participant of groupMetadata.participants) {
            scanned++
            
            try {
                // Decodifica il JID
                const userJid = conn.decodeJid(participant.id) || participant.jid || participant.id
                const userNumber = userJid.split('@')[0]
                
                // Verifica se è un ID interno (non numerico standard)
                // Gli ID interni di solito hanno lunghezze diverse dai numeri di telefono normali
                const isInternalId = userNumber.length < 10 || userNumber.length > 15
                
                if (!isInternalId) {
                    // È già un numero normale, salvalo comunque per sicurezza
                    global.userNumberMapping[userNumber] = userNumber
                    mapped++
                } else {
                    // È un ID interno, proviamo a recuperare il numero reale
                    try {
                        const contactInfo = await conn.onWhatsApp(userJid)
                        if (contactInfo && contactInfo[0] && contactInfo[0].jid) {
                            const realJid = contactInfo[0].jid
                            const realNumber = realJid.split('@')[0]
                            
                            global.userNumberMapping[userNumber] = realNumber
                            mapped++
                            console.log(`[SCAN] Mappato: ${userNumber} -> ${realNumber}`)
                        } else {
                            // Salva comunque l'ID interno
                            global.userNumberMapping[userNumber] = userNumber
                            mapped++
                        }
                    } catch (e) {
                        // In caso di errore, salva l'ID come se stesso
                        global.userNumberMapping[userNumber] = userNumber
                        mapped++
                    }
                }
            } catch (e) {
                errors++
                console.error(`[SCAN ERROR] Errore su partecipante:`, e)
            }
        }
        
        // Salva il mapping nel database per persistenza
        if (!global.db.data.mappings) global.db.data.mappings = {}
        global.db.data.mappings[m.chat] = global.userNumberMapping
        
        m.reply(
            `✅ *Scansione completata!*\n\n` +
            `👥 Partecipanti scansionati: ${scanned}\n` +
            `✅ Mapping salvati: ${mapped}\n` +
            `❌ Errori: ${errors}\n\n` +
            `Il bot ora può mostrare i numeri corretti per tutti gli utenti del gruppo!`
        )
        
    } catch (error) {
        console.error('[SCAN GROUP ERROR]:', error)
        m.reply(`❌ Errore durante la scansione: ${error.message}`)
    }
}

handler.help = ['scangroup']
handler.tags = ['owner']
handler.command = /^(scangroup|scangruppo)$/i
handler.owner = true
handler.group = true

export default handler