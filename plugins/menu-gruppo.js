//Plugin fatto da Gabs333 x Staff ChatUnity
//Plugin fatto da Gabs333 x Staff ChatUnity
//Plugin fatto da Gabs333 x Staff ChatUnity
import { performance } from 'perf_hooks';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import '../lib/language.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (message, { conn, usedPrefix, command }) => {
    const userId = message.sender;
    const groupId = message.isGroup ? message.chat : null;
    const adminMenuText = global.t('menuAdmin', userId, groupId) || '🛡️ Menu Admin'

    const menuText = generateMenuText(usedPrefix, userId, groupId);
    const imagePath = path.join(__dirname, '../media/gruppo.jpeg');

    await conn.sendMessage(message.chat, {
        image: { url: imagePath },
        caption: menuText,
        footer: global.t('chooseMenu', userId, groupId) || 'Scegli un menu:',
        buttons: [
            { buttonId: `${usedPrefix}menu`, buttonText: { displayText: global.t('mainMenuButton', userId, groupId) || "🏠 Menu Principale" }, type: 1 },
            { buttonId: `${usedPrefix}menuadmin`, buttonText: { displayText: adminMenuText }, type: 1 },
            { buttonId: `${usedPrefix}menuowner`, buttonText: { displayText: global.t('ownerMenuButton', userId, groupId) || "👑 Menu Owner" }, type: 1 },
            { buttonId: `${usedPrefix}menusicurezza`, buttonText: { displayText: global.t('securityMenuButton', userId, groupId) || "🚨 Menu Sicurezza" }, type: 1 },
            { buttonId: `${usedPrefix}menuia`, buttonText: { displayText: global.t('aiMenuButton', userId, groupId) || "🤖 Menu IA" }, type: 1 }
        ],
        viewOnce: true,
        headerType: 4
    });
};

handler.help = ['menugruppo'];
handler.tags = ['menugruppo'];
handler.command = /^(gruppo|menugruppo)$/i;

export default handler;

function generateMenuText(prefix, userId, groupId) {
    const menuTitle = global.t('groupMenuTitle', userId, groupId) || '𝗠𝗘𝗡𝗨 𝗚𝗥𝗨𝗣𝗣𝗢';
    
    const createSection = (title, commands) => {
        const commandLines = commands.trim().split('\n').map(c => `┃◈┃• ${c.trim()}`).join('\n');
        return `┃◈╭─✦ *${title}* ✦╌╗\n${commandLines}\n┃◈╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈⊷`;
    };

    const sections = [
        createSection('👥 GESTIONE GRUPPO', `
📋 *.infogruppo / infogp / gruppo* - Info gruppo
🔗 *.linkgroup / link* - Link gruppo
🆔 *.id / gpid / gcid* - ID gruppo
📝 *.setname / setnome* - Nome gruppo
📄 *.setdesk / setdescrizione* - Descrizione
📜 *.setrules / setregole* - Imposta regole
📖 *.rules / regole* - Mostra regole
🕐 *.setorario / #setorario* - Orario
👋 *.setwelcome / setbenvenuto* - Benvenuto
👋 *.setbye* - Addio
🔓 *.aperto / chiuso* - Apri/chiudi
🔄 *.reimposta / revoke* - Reset link
🚫 *.inattivi / viainattivi* - Rimuovi inattivi
📞 *.listanum / kicknum / pulizia* - Pulisci numeri
🔍 *.check / device / dispositivo* - Analizza
🛡️ *.checkscam* - Controlla spam
👥 *.staff / team* - Lista staff
🎭 *.sim / simula* - Simula evento
📊 *.topmessaggi* - Top messaggi
🙏 *.topbestemmie / classificabestemmie* - Top bestemmie
🗳️ *.candidati* - Candidati
📋 *.richieste* - Richieste
🔒 *.quarantena / lockgc* - Blocca gruppo
❄️ *.cold / freeze* - Congela gruppo
🏴 *.bandiera / skipbandiera* - Bandiera
📅 *.creaevento* - Crea evento
📖 *.guida* - Guida gruppo
💡 *.consiglia* - Suggerimenti
🎒 *.meme* - Manda un video divertente
        `),
        createSection('🎵 MUSICA & AUDIO', `
🎵 *.play* (canzone) - Scarica musica
🎥 *.playlist* - Gestisci playlist
🎥 *.ytsearch* - Cerca YouTube
🎶 *.shazam* (audio) - Riconosci canzone
📊 *.tomp3* (video) - Converti MP3
🎤 *.lyrics* (artista-titolo) - Testo canzone
🎤 *.trascrivi* - Trascrivi audio
💾 *.salva / elimina* - Salva/elimina playlist
🎬 *.video* - Scarica video YouTube
🎧 *.tovideo / tomp4 / mp4 / togif* - Converti video
        `),
        createSection('🖼️ IMMAGINI & EDIT', `
🛠️ *.sticker* - Foto a sticker
🖼️ *.png / toimg / jpg* - Sticker a foto
📷 *.hd / migliora / enhance* - Migliora qualità
🖼️ *.rimuovisfondo / removebg* - Rimuovi sfondo
🔍 *.rivela / readviewonce / viewonce* - Rivela visual
🤕 *.bonk* - Effetto bonk
📖 *.leggi / ocr* - Leggi testo immagine
🌀 *.blur / difuminar2* - Sfoca immagine
🖼️ *.pinterest* - Cerca Pinterest
🎴 *.hornycard* @ - Horny card
🧠 *.stupido/a* @ - Calcola stupidità
🌀 *.emojimix* - Mix emoji
🎯 *.wanted / wantededit* @ - Effetto wanted
🤡 *.scherzo / jokedit* @ - Effetto scherzo
📱 *.nokia / nokiaedit* @ - Effetto Nokia
🚓 *.carcere / jail* @ - Effetto carcere
📢 *.ads / ad / adedit* @ - Effetto pubblicità
⚫ *.grey / greyedit* @ - Scala grigi
🔄 *.invert / inverti* @ - Inverti colori
🔍 *.imgscan / scanimg* @ - Scansiona immagine
🎨 *.logo* - Crea logo
🎨 *.loli / neon / devil / wolf / pornhub* - Logo styles
        `),
        createSection('🎮 GIOCHI & POKÉMON', `
🥚 *.apripokemon* - Apri pacchetto
🛒 *.buypokemon* - Compra pokemon
🏆 *.classificapokemon* - Classifica
🎁 *.imieipacchetti / pacchetti* - Miei pacchetti
⚔️ *.combatti* - Combatti
🔄 *.evolvi* - Evolvi pokemon
🌑 *.darknessinfo* - Info darkness
🎒 *.inventariosd / inventario* - Inventario
🍀 *.pity* - Pity system
🔄 *.scambia / accetta* - Scambia items
📚 *.pokedex / pokemon* - Info Pokémon
🎮 *.tris / gioca / ttt / xo* - Tris
🚪 *.delttt / deltt / esci* - Esci tris
🎲 *.dado* - Lancia dado
🎰 *.slot* - Slot machine
🎰 *.scommetti / casinò / casino* - Casinò
💰 *.scommessa* - Scommessa
♠️ *.blackjack* - Blackjack
📝 *.wordle* - Wordle
🔫 *.roulette / russa* - Roulette russa
🪙 *.cf / flip / moneta* - Testa o croce
⚔️ *.adotta / abbandona /listaadozioni* - Adotta qualcuno / abbandona qualcuno / lista delle adozioni
🧮 *.mate* - Problema matematica
📈 *.scf / sassocartaforbici* - Sasso carta forbici
🏳️ *.bandiera* - Indovina bandiera
🎶 *.ic / indovinacanzone* - Indovina canzone
🤖 *.auto / skiplogo* - Auto skip
🎯 *.contaparole* - Conta parloe in un testo
⚽ *.partita* - Partite live
📋 *.dettagli* <id_match> - Dettagli partita
⏹️ *.stoppartita* - Ferma aggiornamenti
👁️ *.segui* <id_match> - Segui partita
🎯 *.missioni / missions / daily / weekly* - Missioni
🎮 *.minecraft / mc / eglercraft* - Minecraft
        `),
        createSection('💰 ECONOMIA & RPG', `
💰 *.soldi / wallet / portafoglio / uc / saldo / unitycoins* - Portafoglio
🏦 *.bank / banca* - Banca
💸 *.giornaliero / claim / daily* - Ricompensa giornaliera
💼 *.lavora / lavoro / w* - Lavora
⚒️ *.grinda / grind / g* - Grinda
⛏️ *.mina / miming / mine* - Mina
🤑 *.ruba / rapina* @ - Ruba
💳 *.daiUnitycoins / bonifico / trasferisci / donauc* @ - Dona UC
♾️ *.daixp / daiexp / donaxp* @ - Dona EXP
🎯 *.rubaxp* @ - Ruba EXP
📤 *.withdraw / retirar / ritira* - Ritira da banca
🏆 *.classifica / lb / leaderboard* - Classifica
📊 *.livello / level / lvl* - Livello e stats
🧪 *.provalivello / testlevel / testlivello* - Testa notifica
        `),
        createSection('💕 INTERAZIONI SOCIALI', `
💋 *.limone / bacio / kiss* @ - Bacia
🍑 *.incula* @ - Incula (18+)
🔞 *.stupra* @ - Stupra (18+)
💍 *.sposa / divorzia* - Sposa/divorzia
💑 *.coniuge* - Mostra coniuge
💏 *.sposati* - Stati sposati
💔 *.ex* - Ex partner
🥷 *.creagang / invitogang / accetta / rifiuta / lasciagang* - Gang
👥 *.amicizia / rimuoviamico* @ - Gestisci amici
📋 *.listamici* - Lista amici
💖 *.amore / love* @ - Compatibilità
🤗 *.abbraccio* @ - Abbraccio
😡 *.odio* @ - Odio
🗣️ *.rizz* @ - Fascino
☠️ *.minaccia* @ - Minaccia
🔥 *.zizzania* @ - Crea litigi
🚫 *.obbligo* - Obbligo o verità
💋 *.ditalino* @ - Ditalino
💋 *.sega* @ - Sega
💋 *.scopa* @ - Scopa
🖕 *.insulta* @ - Insulta
        `),
        createSection('📊 CALCOLATORI & STATS', `
🏳️‍🌈 *.gay* @ - Quanto gay
🏳️‍🌈 *.lesbica / puttana / prostituta* @ - Percentuale
♿ *.ritardato/a / down / disabile / mongoloide* @ - Disabilità
⚫ *.negro / nero* @ - Percentuale nero
🦌 *.cornuto / cornuta / corna* @ - Cornometro
🍑 *.ano / culometro* @ - Misura culo
🍑 *.figa* @ - Misura figa
🔥 *.horny / caldo* @ - Livello horny
🍺 *.alcolizzato / alcol* - Livello alcol
🌿 *.drogato* - Quanto drogato
😈 *.infame / quantosbirro / sbirrocheck* - Quanto infame
🧠 *.personalita* - Analisi personalità
🔮 *.zodiaco / segno / oroscopo* - Oroscopo
🏹 *.nomeninja* - Nome ninja
        `),
        createSection('🙏 BESTEMMIOMETRO', `
🙏 *.topbestemmie / bestemmietop / classificabestemmie* - Top bestemmie
⚙️ *.bestemmia / antibestemmia* - On/off bestemmie
📊 *.miebestemmie / bestemmie* - Mie bestemmie
🗑️ *.azzerabestemmie* @ - Azzera (OWNER)
        `),
        createSection('ℹ️ INFO & UTILITY', `
🌍 *.meteo* (città) - Previsioni meteo
🕐 *.orario / zona / horario* (città) - Fuso orario
🌐 *.traduci / translate / trad* - Traduci
📊 *.contaparole* - Conta parole
🧮 *.cal / calc / calcola / calcolatrice* - Calcolatrice
💱 *.cur* - Conversione valuta
📚 *.wikipedia / wiki* - Wikipedia
📰 *.lastampa* - Notizie
🎨 *.styletext* - Stilizza testo
🛡️ *.ofuscare / offuscare / offusca* - Offusca codice
🔍 *.ispeziona* - Ispeziona elemento
🐛 *.bughunt* - Trova bug
🌿 *.statoemotivo* - Analisi del gruppo
🔍 *.cercaimmagine / cercaimg* - Cerca immagine
        `),
        createSection('🔧 STICKER & TOOLS', `
🎭 *.cercasticker / searchsticker / stickersearch* - Cerca sticker
🌀 *.emojimix* - Mix emoji
🎨 *.stickergifwm* - Crea sticker
🏷️ *.robar / wm* - Watermark sticker
⭕ *.scircle / circle* - Sticker circolare
        `)
    ];

    return `
╭┃《 *⚡${menuTitle}⚡* 》┃┈⊷
┃◈╭┈┈┈┈┈┈┈┈┈┈┈┈┈·ಿ
┃◈┃• *${global.t('memberCommands', userId, groupId) || '𝗖𝗢𝗠𝗔𝗡𝗗𝗜 𝗣𝗘𝗥 𝗜 𝗠𝗘𝗠𝗕𝗥𝗜'}*
┃◈╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈⊷
┃◈
${sections.join('\n┃◈\n')}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈·ಿ
    `.trim();
}