//Plugin fatto da Gabs333 x Staff ChatUnity
import { performance } from 'perf_hooks';
import fetch from 'node-fetch';
import '../lib/language.js';

const handler = async (message, { conn, usedPrefix }) => {
    const userId = message.sender;
    const groupId = message.isGroup ? message.chat : null;
    const botName = global.db.data.nomedelbot || 'ChatUnity';
    const menuText = generateMenuText(usedPrefix, botName, userId, groupId);
    const imagePath = './media/ia.jpeg';

    await conn.sendMessage(message.chat, {
        image: { url: imagePath },
        caption: menuText,
        footer: global.t('chooseMenu', userId, groupId) || 'Scegli un menu:',
        buttons: [
            { buttonId: `${usedPrefix}menu`, buttonText: { displayText: global.t('mainMenuButton', userId, groupId) || "🏠 Menu Principale" }, type: 1 },
            { buttonId: `${usedPrefix}menuadmin`, buttonText: { displayText: global.t('menuAdmin', userId, groupId) || "🛡️ Menu Admin" }, type: 1 },
            { buttonId: `${usedPrefix}menuowner`, buttonText: { displayText: global.t('menuOwner', userId, groupId) || "👑 Menu Owner" }, type: 1 },
            { buttonId: `${usedPrefix}menugruppo`, buttonText: { displayText: global.t('menuGroup', userId, groupId) || "👥 Menu Gruppo" }, type: 1 },
            { buttonId: `${usedPrefix}menusicurezza`, buttonText: { displayText: global.t('menuSecurity', userId, groupId) || "🚨 Menu Sicurezza" }, type: 1 }
        ],
        viewOnce: true,
        headerType: 4,
    }, { quoted: message });
};

handler.help = ['menuia', 'menuai'];
handler.tags = ['menu'];
handler.command = /^(menuia|menuai)$/i;

export default handler;

function generateMenuText(prefix, botName, userId, groupId) {
    const vs = global.vs || '8.0';
    const menuTitle = global.t('aiMenuTitle', userId, groupId) || '𝗠𝗘𝗡𝗨 𝗜𝗔';
    const versionText = global.t('versionLabel', userId, groupId) || '𝗩𝗘𝗥𝗦𝗜𝗢𝗡𝗘';

    const commandList = `
• 🤖 *${prefix}ai / ia / bot / ask / chiedi* - Ai di cri
• 🤖 *${prefix}gemini* - Google Gemini
• 🤖 *${prefix}geminipro* - Gemini Pro
• 🤖 *${prefix}chatgpt* - ChatGPT
• 🤖 *${prefix}deepseek* - DeepSeek AI
• 🤖 *${prefix}sora* - Sora AI

• 🎨 *${prefix}fluxai / flux / immagine* - Genera immagini AI
• 🎨 *${prefix}stablediffusion / sdiffusion / immagine2* - Stable Diffusion
• 🎨 *${prefix}stabilityai / stability / immagine3* - Stability AI
• 📷 *${prefix}migliora / hd / enhance* - Migliora immagine

• 🎤 *${prefix}vocale / aivoice / vai / voicex / voiceai* - Voce AI
• 📝 *${prefix}trascrivi / transcribe / totext / audio2text* - Trascrivi audio

• 🎵 *${prefix}shazam* - Riconosci canzone
• 📋 *${prefix}quoted / riassunto* - Riassunto AI

• 🐾 *${prefix}infoanimale* - Info animali
• 🍔 *${prefix}kcal* - Calcola calorie
• 🍳 *${prefix}ricetta* - Ricette AI

• 💡 *${prefix}supporto / aiuto* - Supporto AI
    `.trim();

    return `
⋆ ︵︵ ★ ${menuTitle} ★ ︵︵ ⋆

*${global.t('generalCommands', userId, groupId) || '𝗖𝗢𝗠𝗔𝗡𝗗𝗜 𝗜𝗡𝗧𝗘𝗟𝗟𝗜𝗚𝗘𝗡𝗭𝗔 𝗔𝗥𝗧𝗜𝗙𝗜𝗖𝗜𝗔𝗟𝗘'}*

꒷꒦ ✦ ˚ ·︶ : ︶ ꒷꒦ ‧₊ ˚
${commandList.split('\n').map(line => `˚ ${line.trim()}`).join('\n')}
꒷꒦ ✦ ˚ ·︶ : ︶ ꒷꒦ ‧₊ ˚

╰♡꒷ ፧ ⋆˚₊⋆───ʚ˚ɞ───⋆˚₊⋆ ፧ ⪩
  ˚ ·*${versionText}:* ${vs}
  ˚ ·*${global.t('supportLabel', userId, groupId) || '𝗦𝗨𝗣𝗣𝗢𝗥𝗧𝗢'}:* (.supporto)
╰♡꒷ ፧ ⋆˚₊⋆───ʚ˚ɞ───⋆˚₊⋆ ፧ ⪩
`.trim();
}