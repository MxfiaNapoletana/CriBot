//Plugin fatto da Gabs333 x Staff ChatUnity
//Plugin fatto da Gabs333 x Staff ChatUnity
//Plugin fatto da Gabs333 x Staff ChatUnity
//Codice di menu-sicurezza.js
//Plugin fatto da Gabs333 x Staff ChatUnity
import 'os';
import 'util';
import 'human-readable';
import '@realvare/based';
import 'fs';
import 'perf_hooks';
import path from 'path';
import { fileURLToPath } from 'url';
import '../lib/language.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handler = async (m, { conn, usedPrefix, command }) => {
    const userId = m.sender;
    const groupId = m.isGroup ? m.chat : null;
    const chat = global.db.data.chats[m.chat] || {};
    const menuText = generateMenuText(chat, userId, groupId);
    const imagePath = path.join(__dirname, '../media/sicurezza.jpeg');
    const adminMenuText = global.t('menuAdmin', userId, groupId) || '🛡️ Menu Admin'
    
    await conn.sendMessage(m.chat, {
        image: { url: imagePath },
        caption: menuText,
        footer: global.t('chooseMenu', userId, groupId) || 'Scegli un menu:',
        buttons: [
            { buttonId: `${usedPrefix}menu`, buttonText: { displayText: global.t('mainMenuButton', userId, groupId) || "🏠 Menu Principale" }, type: 1 },
            { buttonId: `${usedPrefix}menuadmin`, buttonText: { displayText: adminMenuText }, type: 1 },
            { buttonId: `${usedPrefix}menuowner`, buttonText: { displayText: global.t('ownerMenuButton', userId, groupId) || "👑 Menu Owner" }, type: 1 },
            { buttonId: `${usedPrefix}menugruppo`, buttonText: { displayText: global.t('groupMenuButton', userId, groupId) || "👥 Menu Gruppo" }, type: 1 },
            { buttonId: `${usedPrefix}menuia`, buttonText: { displayText: global.t('aiMenuButton', userId, groupId) || "🤖 Menu IA" }, type: 1 }
        ],
        headerType: 4
    });
};

handler.help = ["menusicurezza", "funzioni"];
handler.tags = ["menu"];
handler.command = /^(menusicurezza|funzioni)$/i;

export default handler;

function generateMenuText(chat, userId, groupId) {
    const functions = {
        'Anti Link': !!chat?.antiLink,
        'Anti Link Hard': !!chat?.antiLinkHard,
        'Anti Visual': !!chat?.antivisual,
        'Anti LinkWs': !!chat?.antilinkws,
        'AntiTag': !!chat?.antitag,
        'Anti Spam': !!chat?.antispam,
        'Anti Trava': !!chat?.antitrava,
        'Benvenuto': !!chat?.welcome,
        'Anti Nuke': !!chat?.antinuke,
        'Anti Bestemmie': !!chat?.antibestemmie,
        'Solo Gruppo': !!chat?.sologruppo,
        'Solo Privato': !!chat?.soloprivato,
        'Solo Admin': !!chat?.soloadmin,
        'Anti Porno': !!chat?.antiporno,
        'Anti Call': !!chat?.antiCall,
        'Anti Virus': !!chat?.antivirus,
        'Anti Bot': !!chat?.antibot,
        'Anti Voip': !!chat?.antivoip,
        'Anti Sondaggi': !!chat?.antisondaggi,
        'Anti TikTok': !!chat?.antitiktok,
        'Anti Instagram': !!chat?.antiinsta,
    };
    
    const infoSection = `
═════•⊰✦⊱•═════
> ⓘ Info sulle funzioni
> 🟢 » Funzione attivata
> 🔴 » Funzione disabilitata
═════•⊰✦⊱•═════
    `.trim();
    
    const usageSection = `
═════•⊰✦⊱•═════
> ⓘ Info sullo stato
> .infostato
> ⓘ Uso del comando
> .attiva antilinkgp
> .disabilita antilinkgp
═════•⊰✦⊱•═════
    `.trim();
    
    const statusList = Object.entries(functions)
        .map(([name, state]) => `${name} » ${state ? '🟢' : '🔴'}`)
        .join('\n');
    
    return `
═════•⊰✦⊱•═════
${statusList}
═════•⊰✦⊱•═════
${infoSection}
${usageSection}
`.trim();
}