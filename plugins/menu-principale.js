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
    const userId = message.sender
    const groupId = message.isGroup ? message.chat : null
    
    const userCount = Object.keys(global.db.data.users).length;
    const botName = global.db.data.nomedelbot || 'ChatUnity';


    const menuText = generateMenuText(usedPrefix, botName, userCount, userId, groupId);


    const imagePath = path.join(__dirname, '../media/principale.jpeg'); 
    
    const footerText = global.t('menuFooter', userId, groupId) || 'Premi un bottone per accedere alla categoria'
    const groupMenuText = global.t('menuGroup', userId, groupId) || '👥 Gruppo'
    const aiMenuText = global.t('menuAI', userId, groupId) || '🤖 IA'
    const securityMenuText = global.t('menuSecurity', userId, groupId) || '🚨 Sicurezza'
    const adminMenuText = global.t('menuAdmin', userId, groupId) || '🛠️ Admin'
    const ownerMenuText = global.t('menuOwner', userId, groupId) || '👑 Owner'
    
    await conn.sendMessage(
        message.chat,
        {
            image: { url: imagePath },
            caption: menuText,
            footer: footerText,
            buttons: [
                { buttonId: `${usedPrefix}menugruppo`, buttonText: { displayText: groupMenuText }, type: 1 },
                { buttonId: `${usedPrefix}menuia`, buttonText: { displayText: aiMenuText }, type: 1 },
                { buttonId: `${usedPrefix}menusicurezza`, buttonText: { displayText: securityMenuText }, type: 1 },
                { buttonId: `${usedPrefix}menuadmin`, buttonText: { displayText: adminMenuText }, type: 1 },
                { buttonId: `${usedPrefix}menuowner`, buttonText: { displayText: ownerMenuText }, type: 1 }
            ],
            viewOnce: true,
            headerType: 4
        }
    );
};


handler.help = ['menu'];
handler.tags = ['menu'];
handler.command = /^(menu|comandi)$/i;


export default handler;


function generateMenuText(prefix, botName, userCount, userId, groupId) {
    const userName = global.db.data.users[userId]?.name || 'Utente'
    
    return `
『 █░░░░░░░░░░░░░░░░░░░░░░░░░░░█ 』
    ⚡️ CONSOLE PRINCIPALE ⚡️
      Accesso Eseguito: ${userName} 
『 █░░░░░░░░░░░░░░░░░░░░░░░░░░░█ 』

╭─「 🌐 𝐒𝐄𝐋𝐄𝐙𝐈𝐎𝐍𝐀 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐈𝐀 」
│
│ › 👥 𝙂𝙧𝙪𝙥𝙥𝙤 — Comandi per i membri
│ › 🤖 𝙄𝘼 — Comandi per AI
│ › 🚨 𝙎𝙞𝙘𝙪𝙧𝙚𝙯𝙯𝙖 — Funzioni di sicurezza
│ › 🛠️ 𝘼𝙙𝙢𝙞𝙣 — Comandi riservati agli Amministratori
│ › 👑 𝙊𝙬𝙣𝙚𝙧 — Comandi riservati agli Owner
│
╰─────────────────────────────
`.trim();
}