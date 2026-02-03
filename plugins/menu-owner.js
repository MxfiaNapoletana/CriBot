//Plugin fatto da Gabs333 x Staff ChatUnity
//Plugin fatto da Gabs333 x Staff ChatUnity
import { performance } from 'perf_hooks';
import fetch from 'node-fetch';
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
    const imagePath = path.join(__dirname, '../media/owner.jpeg');

    await conn.sendMessage(message.chat, {
        image: { url: imagePath },
        caption: menuText,
        footer: global.t('chooseMenu', userId, groupId) || 'Scegli un menu:',
        buttons: [
            { buttonId: `${usedPrefix}menu`, buttonText: { displayText: global.t('mainMenuButton', userId, groupId) || "🏠 Menu Principale" }, type: 1 },
            { buttonId: `${usedPrefix}menuadmin`, buttonText: { displayText: adminMenuText }, type: 1 },
            { buttonId: `${usedPrefix}menusicurezza`, buttonText: { displayText: global.t('securityMenuButton', userId, groupId) || "🚨 Menu Sicurezza" }, type: 1 },
            { buttonId: `${usedPrefix}menugruppo`, buttonText: { displayText: global.t('groupMenuButton', userId, groupId) || "👥 Menu Gruppo" }, type: 1 },
            { buttonId: `${usedPrefix}menuia`, buttonText: { displayText: global.t('aiMenuButton', userId, groupId) || "🤖 Menu IA" }, type: 1 }
        ],
        viewOnce: true,
        headerType: 4
    });
};

handler.help = ['menuowner'];
handler.tags = ['menu'];
handler.command = /^(menuowner)$/i;

export default handler;

function generateMenuText(prefix, userId, groupId) {
    const vs = global.vs || '8.0';
    const menuTitle = global.t('ownerMenuTitle', userId, groupId) || '𝗠𝗘𝗡𝗨 𝗢𝗪𝗡𝗘𝗥';
    const versionText = global.t('versionLabel', userId, groupId) || '𝗩𝗘𝗥𝗦𝗜𝗢𝗡𝗘';

    const commandList = `
• 🔐 *${prefix}accendibot* - Accendi bot
• 🔐 *${prefix}spegnibot* - Spegni bot
• 🔐 *${prefix}riavvia / reiniciar* - Riavvia bot
• 🔐 *${prefix}aggiorna / update / aggiornabot* - Aggiorna bot
• 🔐 *${prefix}system / sistema* - Info sistema
• 🔐 *${prefix}godmode* - Auto admin
• 🔐 *${prefix}banuser* - Ban utente globale
• 🔐 *${prefix}unbanuser / unban* - Sbanna utente
• 🔐 *${prefix}banchat / bangp* - Ban gruppo
• 🔐 *${prefix}unbanchat / unbangp* - Sbanna gruppo
• 🔐 *${prefix}kickall* - Kicka tutti gli utenti del gruppo
• 🔐 *${prefix}banlistned / bannedlist* - Lista ban
• 🔐 *${prefix}blacklist* - Blacklist
• 🔐 *${prefix}block / unblock* - Blocca/sblocca
• 🔐 *${prefix}blocklist / listblock* - Lista bloccati
• 🔐 *${prefix}join* + link - Entra in gruppo
• 🔐 *${prefix}out / leavegc / leave* - Esci da gruppo
• 🔐 *${prefix}listgruppi* - Lista gruppi bot
• 🔐 *${prefix}groups* - Lista gruppi del bot
• 🔐 *${prefix}everygroup* - Podcast gruppi
• 🔐 *${prefix}ds / deletesession* - Pulisci sessioni
• 🔐 *${prefix}cleartmp / cleartemp* - Pulisci temp
• 🔐 *${prefix}file* - Leggi file
• 🔐 *${prefix}getplugin / file* - Ottieni plugin
• 🔐 *${prefix}saveplugin / salvar* - Salva plugin
• 🔐 *${prefix}deleteplugin / dp* - Elimina plugin
• 🔐 *${prefix}editplugin* - Modifica plugin
• 🔐 *${prefix}editfile* - Modifica file
• 🔐 *${prefix}impostanome* - Imposta nome bot
• 🔐 *${prefix}prefisso* - Cambia prefisso
• 🔐 *${prefix}resetprefix / resettaprefisso* - Reset prefisso
• 🔐 *${prefix}aggiungi* (num) @ - Aggiungi messaggi
• 🔐 *${prefix}rimuovi* (num) @ - Rimuovi messaggi
• 🔐 *${prefix}adduc* - Aggiungi UnityCoins
• 🔐 *${prefix}salvamedia / savemedia* - Salva una foto / video nella cartella del bot
• 🔐 *${prefix}azzerabestemmie* @ - Azzera bestemmie
• 🔐 *${prefix}vedimapping* @ - Vedi le persone mappate
• 🔐 *${prefix}scangroup* @ - Scanna e mappa il gruppo
• 🔐 *${prefix}listprem / premlist* - Lista premium
• 🔐 *${prefix}listamuti* - Lista muti
• 🔐 *${prefix}offscript / onscript* - On/Off script
• 🔐 *${prefix}server / cmd / exec* - Comandi server
• 🔐 *${prefix}zip* - Comprimi file
    `.trim();

    return `
⋆ ︵︵ ★ ${menuTitle} ★ ︵︵ ⋆

*${global.t('ownerReservedCommands', userId, groupId) || '𝗖𝗢𝗠𝗔𝗡𝗗𝗜 𝗥𝗜𝗦𝗘𝗥𝗩𝗔𝗧𝗜 𝗔𝗟𝗟\'𝗢𝗪𝗡𝗘𝗥'}*

꒷꒦ ✦ ˚ ·︶ : ︶ ꒷꒦ ‧₊ ˚
${commandList.split('\n').map(line => `˚ ${line.trim()}`).join('\n')}
꒷꒦ ✦ ˚ ·︶ : ︶ ꒷꒦ ‧₊ ˚

╰♡꒷ ፧ ⋆˚₊⋆───ʚ˚ɞ───⋆˚₊⋆ ፧ ⪩
  ˚ ·*${versionText}:* ${vs}
╰♡꒷ ፧ ⋆˚₊⋆───ʚ˚ɞ───⋆˚₊⋆ ፧ ⪩
`.trim();
}