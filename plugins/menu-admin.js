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

    const menuText = generateMenuText(usedPrefix, userId, groupId);
    const imagePath = path.join(__dirname, '../media/admin.jpeg');

    await conn.sendMessage(message.chat, {
        image: { url: imagePath },
        caption: menuText,
        footer: global.t('chooseMenu', userId, groupId) || 'Scegli un menu:',
        buttons: [
            { buttonId: `${usedPrefix}menu`, buttonText: { displayText: global.t('mainMenuButton', userId, groupId) || "🏠 Menu Principale" }, type: 1 },
            { buttonId: `${usedPrefix}menuowner`, buttonText: { displayText: global.t('ownerMenuButton', userId, groupId) || "👑 Menu Owner" }, type: 1 },
            { buttonId: `${usedPrefix}menusicurezza`, buttonText: { displayText: global.t('securityMenuButton', userId, groupId) || "🚨 Menu Sicurezza" }, type: 1 },
            { buttonId: `${usedPrefix}menugruppo`, buttonText: { displayText: global.t('groupMenuButton', userId, groupId) || "👥 Menu Gruppo" }, type: 1 },
            { buttonId: `${usedPrefix}menuia`, buttonText: { displayText: global.t('aiMenuButton', userId, groupId) || "🤖 Menu IA" }, type: 1 }
        ],
        viewOnce: true,
        headerType: 4
    });
};

handler.help = ['menuadmin'];
handler.tags = ['menuadmin'];
handler.command = /^(menuadmin)$/i;

export default handler;

function generateMenuText(prefix, userId, groupId) {
    const menuTitle = global.t('adminMenuTitle', userId, groupId) || '𝗠𝗘𝗡𝗨 𝗔𝗗𝗠𝗜𝗡';

    const commandList = `
• 👑 *${prefix}admins / @admins* - Tagga admin
• 👑 *${prefix}p / promuovi / mettiadmin* - Promuovi admin
• 👑 *${prefix}r / d / retrocedi / togliadmin* - Retrocedi da admin
• 👑 *${prefix}kick / ban / sparisci / puffo* - Espelli utente
• 👑 *${prefix}muta / smuta* - Muta/smuta utente
• 👑 *${prefix}warn / ammonisci / avvertimento* - Avvisa utente
• 👑 *${prefix}delwarn / unwarn* - Rimuovi avviso
• 👑 *${prefix}listawarn / listwarn* - Lista avvisi
• 👑 *${prefix}pin / unpin* - Fissa/sfissa messaggi
• 👑 *${prefix}pin1d / pin7d / pin30d* - Fissa con durata
• 👑 *${prefix}delete* - Elimina messaggio
• 👑 *${prefix}linkqrgroup / linkqr* - QR code gruppo
• 👑 *${prefix}pic* - Cambia foto profilo
• 👑 *${prefix}accettarichieste* - Accetta richieste
• 👑 *${prefix}accetta39* - Accetta +39
• 👑 *${prefix}rifiutarichieste* - Rifiuta richieste
• 👑 *${prefix}setorario* - Imposta orario
• 👑 *${prefix}setnome / setname* - Cambia nome gruppo
• 👑 *${prefix}hidetag* - Tag nascosto
• 👑 *${prefix}tagall / tag* - Tagga tutti
• 👑 *${prefix}aperto / chiuso* - Apri/chiudi gruppo
• 👑 *${prefix}setwelcome / setbenvenuto* - Msg benvenuto
• 👑 *${prefix}setbye* - Messaggio addio
• 👑 *${prefix}inattivi / viainattivi* - Rimuovi inattivi
• 👑 *${prefix}listanum + prefisso* - Lista numeri
• 👑 *${prefix}pulizia + prefisso* - Pulisci numeri
• 👑 *${prefix}clearplay* - Reset playlist
• 👑 *${prefix}regole / setregole* - Gestisci regole
• 👑 *${prefix}ds* - Pulisci sessioni
• 👑 *${prefix}link / linkgroup* - Link gruppo
• 👑 *${prefix}richieste* - Richieste pendenti
    `.trim();

    return `
⋆ ︵︵ ★ ${menuTitle} ★ ︵︵ ⋆

*${global.t('adminCommands', userId, groupId) || '𝗖𝗢𝗠𝗔𝗡𝗗𝗜 𝗔𝗗𝗠𝗜𝗡'} 👑*

꒷꒦ ✦ ˚ ·︶ : ︶ ꒷꒦ ‧₊ ˚
${commandList.split('\n').map(line => `˚ ${line.trim()}`).join('\n')}
꒷꒦ ✦ ˚ ·︶ : ︶ ꒷꒦ ‧₊ ˚

> © ${global.t('poweredBy', userId, groupId) || 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ'} 𝐂𝐡𝐚𝐭𝐔𝐧𝐢𝐭𝐲
`.trim();
}