//Plugin fatto da Gabs333 x Staff ChatUnity
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handler = async (m, { conn, participants, text }) => {
    if (!m.isGroup) return m.reply('⚠️ Questo comando può essere usato solo nei gruppi!');
    
    let targetPerson;
    
    // Se c'è un messaggio quotato
    if (m.quoted) {
        targetPerson = { id: m.quoted.sender };
    }
    // Se c'è una menzione (@tag)
    else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetPerson = { id: m.mentionedJid[0] };
    }
    // Altrimenti usa chi ha fatto il comando
    else {
        targetPerson = { id: m.sender };
    }
    
    const person = targetPerson;
    
    // Calcola la percentuale di napoletanità
    const percentage = Math.floor(Math.random() * 101);
    
    // Frasi simpatiche basate sulla percentuale
    let message = '';
    let emoji = '';
    
    if (percentage >= 90) {
        const frasi = [
            "𝐄̀ 𝐩𝐢𝐮̀ 𝐧𝐚𝐩𝐨𝐥𝐞𝐭𝐚𝐧𝐨 𝐝𝐢 𝐆𝐞𝐨𝐥𝐢𝐞𝐫 𝐜𝐡𝐞 𝐟𝐚 𝐟𝐫𝐞𝐞𝐬𝐭𝐲𝐥𝐞 𝐚 𝐒𝐜𝐚𝐦𝐩𝐢𝐚! 🎤🔥",
            "𝐌𝐚𝐧𝐜𝐨 𝐌𝐚𝐫𝐚𝐝𝐨𝐧𝐚 𝐞𝐫𝐚 𝐜𝐨𝐬𝐢̀ 𝐧𝐚𝐩𝐨𝐥𝐞𝐭𝐚𝐧𝐨! ⚽👑",
            "𝐇𝐚 𝐥𝐚 𝐦𝐨𝐳𝐳𝐚𝐫𝐞𝐥𝐥𝐚 𝐧𝐞𝐥 𝐬𝐚𝐧𝐠𝐮𝐞 𝐞 𝐢𝐥 𝐜𝐚𝐟𝐟𝐞̀ 𝐧𝐞𝐥𝐥𝐞 𝐯𝐞𝐧𝐞! ☕🧀",
            "𝐄̀ 𝐧𝐚𝐭𝐨 𝐜𝐨𝐧 𝐥𝐚 𝐦𝐚𝐠𝐥𝐢𝐚 𝐝𝐞𝐥 𝐍𝐚𝐩𝐨𝐥𝐢 𝐚𝐝𝐝𝐨𝐬𝐬𝐨! 💙⚽",
            "𝐏𝐚𝐫𝐥𝐚 𝐧𝐚𝐩𝐨𝐥𝐞𝐭𝐚𝐧𝐨 𝐩𝐮𝐫𝐞 𝐦𝐞𝐧𝐭𝐫𝐞 𝐝𝐨𝐫𝐦𝐞! 😴🗣️"
        ];
        message = frasi[Math.floor(Math.random() * frasi.length)];
        emoji = '👑💙';
    } else if (percentage >= 70) {
        const frasi = [
            "𝐒𝐚 𝐜𝐚𝐧𝐭𝐚𝐫𝐞 '𝐎 𝐒𝐨𝐥𝐞 𝐌𝐢𝐨 𝐦𝐞𝐠𝐥𝐢𝐨 𝐝𝐢 𝐆𝐞𝐨𝐥𝐢𝐞𝐫! 🎵",
            "𝐂𝐨𝐧𝐨𝐬𝐜𝐞 𝐭𝐮𝐭𝐭𝐢 𝐢 𝐯𝐢𝐜𝐨𝐥𝐢 𝐝𝐢 𝐒𝐩𝐚𝐜𝐜𝐚𝐧𝐚𝐩𝐨𝐥𝐢! 🏛️",
            "𝐇𝐚 𝐯𝐢𝐬𝐭𝐨 𝐢𝐥 𝐍𝐚𝐩𝐨𝐥𝐢 𝐯𝐢𝐧𝐜𝐞𝐫𝐞 𝐥𝐨 𝐬𝐜𝐮𝐝𝐞𝐭𝐭𝐨 𝐞 𝐡𝐚 𝐩𝐢𝐚𝐧𝐭𝐨! 🏆😭",
            "𝐌𝐚𝐧𝐠𝐢𝐚 𝐥𝐚 𝐩𝐢𝐳𝐳𝐚 𝐚 𝐩𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨 𝐨𝐠𝐧𝐢 𝐠𝐢𝐨𝐫𝐧𝐨! 🍕",
            "𝐃𝐢𝐜𝐞 '𝐮𝐚𝐠𝐥𝐢𝐨̀' 𝐚𝐧𝐜𝐡𝐞 𝐪𝐮𝐚𝐧𝐝𝐨 𝐨𝐫𝐝𝐢𝐧𝐚 𝐚𝐥 𝐌𝐜𝐃𝐨𝐧𝐚𝐥𝐝'𝐬! 🍔"
        ];
        message = frasi[Math.floor(Math.random() * frasi.length)];
        emoji = '💙⚡';
    } else if (percentage >= 50) {
        const frasi = [
            "𝐕𝐚 𝐚 𝐯𝐞𝐝𝐞𝐫𝐞 𝐢𝐥 𝐍𝐚𝐩𝐨𝐥𝐢 𝐚𝐥𝐦𝐞𝐧𝐨 𝐮𝐧𝐚 𝐯𝐨𝐥𝐭𝐚 𝐚𝐥 𝐦𝐞𝐬𝐞! ⚽",
            "𝐂𝐨𝐧𝐨𝐬𝐜𝐞 𝐭𝐮𝐭𝐭𝐞 𝐥𝐞 𝐜𝐚𝐧𝐳𝐨𝐧𝐢 𝐝𝐢 𝐆𝐞𝐨𝐥𝐢𝐞𝐫 𝐚 𝐦𝐞𝐦𝐨𝐫𝐢𝐚! 🎤",
            "𝐇𝐚 𝐚𝐥𝐦𝐞𝐧𝐨 𝟑 𝐦𝐚𝐠𝐥𝐢𝐞 𝐝𝐞𝐥 𝐍𝐚𝐩𝐨𝐥𝐢 𝐧𝐞𝐥𝐥'𝐚𝐫𝐦𝐚𝐝𝐢𝐨! 👕",
            "𝐒𝐚 𝐟𝐚𝐫𝐞 𝐥𝐚 𝐩𝐚𝐬𝐭𝐚 𝐞 𝐩𝐚𝐭𝐚𝐭𝐞 𝐚𝐥𝐥𝐚 𝐩𝐞𝐫𝐟𝐞𝐳𝐢𝐨𝐧𝐞! 🍝🥔",
            "𝐃𝐢𝐜𝐞 '𝐚𝐦𝐦𝐚 𝐟𝐚𝐭𝐢𝐜𝐚̀' 𝐪𝐮𝐚𝐧𝐝𝐨 𝐝𝐞𝐯𝐞 𝐥𝐚𝐯𝐨𝐫𝐚𝐫𝐞! 💪"
        ];
        message = frasi[Math.floor(Math.random() * frasi.length)];
        emoji = '💙';
    } else if (percentage >= 30) {
        const frasi = [
            "𝐇𝐚 𝐯𝐢𝐬𝐢𝐭𝐚𝐭𝐨 𝐍𝐚𝐩𝐨𝐥𝐢 𝐚𝐥𝐦𝐞𝐧𝐨 𝐮𝐧𝐚 𝐯𝐨𝐥𝐭𝐚! 🚆",
            "𝐂𝐨𝐧𝐨𝐬𝐜𝐞 𝐪𝐮𝐚𝐥𝐜𝐡𝐞 𝐜𝐚𝐧𝐳𝐨𝐧𝐞 𝐝𝐢 𝐆𝐞𝐨𝐥𝐢𝐞𝐫... 𝐟𝐨𝐫𝐬𝐞! 🎵❓",
            "𝐇𝐚 𝐩𝐫𝐨𝐯𝐚𝐭𝐨 𝐥𝐚 𝐯𝐞𝐫𝐚 𝐩𝐢𝐳𝐳𝐚 𝐧𝐚𝐩𝐨𝐥𝐞𝐭𝐚𝐧𝐚! 🍕",
            "𝐒𝐚 𝐝𝐢𝐫𝐞 '𝐠𝐮𝐚𝐠𝐥𝐢𝐨̀' 𝐬𝐞𝐧𝐳𝐚 𝐬𝐞𝐦𝐛𝐫𝐚𝐫𝐞 𝐫𝐢𝐝𝐢𝐜𝐨𝐥𝐨! 😅",
            "𝐓𝐢𝐟𝐚 𝐍𝐚𝐩𝐨𝐥𝐢 𝐬𝐨𝐥𝐨 𝐪𝐮𝐚𝐧𝐝𝐨 𝐯𝐢𝐧𝐜𝐞! ⚽😏"
        ];
        message = frasi[Math.floor(Math.random() * frasi.length)];
        emoji = '🤔';
    } else {
        const frasi = [
            "𝐍𝐨𝐧 𝐬𝐚 𝐦𝐚𝐧𝐜𝐨 𝐝𝐨𝐯𝐞 𝐬𝐭𝐚 𝐍𝐚𝐩𝐨𝐥𝐢 𝐬𝐮𝐥𝐥𝐚 𝐜𝐚𝐫𝐭𝐢𝐧𝐚! 🗺️❌",
            "𝐏𝐞𝐧𝐬𝐚 𝐜𝐡𝐞 𝐆𝐞𝐨𝐥𝐢𝐞𝐫 𝐬𝐢𝐚 𝐮𝐧 𝐭𝐢𝐩𝐨 𝐝𝐢 𝐟𝐨𝐫𝐦𝐚𝐠𝐠𝐢𝐨! 🧀😂",
            "𝐇𝐚 𝐦𝐚𝐧𝐠𝐢𝐚𝐭𝐨 𝐥𝐚 𝐩𝐢𝐳𝐳𝐚 𝐜𝐨𝐧 𝐥'𝐚𝐧𝐚𝐧𝐚𝐬! 🍕🍍💀",
            "𝐂𝐡𝐢𝐚𝐦𝐚 '𝐩𝐚𝐧𝐢𝐧𝐨' 𝐥𝐚 𝐩𝐢𝐳𝐳𝐚 𝐚 𝐩𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨! 🥪❌",
            "𝐓𝐢𝐟𝐚 𝐉𝐮𝐯𝐞𝐧𝐭𝐮𝐬... 𝐦𝐚𝐝𝐨𝐧𝐧𝐚 𝐜𝐡𝐞 𝐯𝐞𝐫𝐠𝐨𝐠𝐧𝐚! ⚫⚪😱",
            "𝐍𝐨𝐧 𝐜𝐨𝐧𝐨𝐬𝐜𝐞 𝐥𝐚 𝐝𝐢𝐟𝐟𝐞𝐫𝐞𝐧𝐳𝐚 𝐭𝐫𝐚 𝐫𝐚𝐠𝐮̀ 𝐞 𝐬𝐮𝐠𝐨! 🍝❓"
        ];
        message = frasi[Math.floor(Math.random() * frasi.length)];
        emoji = '🚫😂';
    }
    
    // Crea la barra di napoletanità
    const barLength = 10;
    const filledBars = Math.floor((percentage / 100) * barLength);
    const emptyBars = barLength - filledBars;
    const napoletanitaBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
    
    const responseMessage = `
𝐒𝐜𝐚𝐧𝐧𝐞𝐫 𝐍𝐚𝐩𝐨𝐥𝐞𝐭𝐚𝐧𝐢𝐭𝐚̀ 𝐀𝐭𝐭𝐢𝐯𝐨
𝐜𝐚𝐫𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...

━━━━━━☆ﾟ.*･｡ﾟ━━━━━━

@${person.id.split('@')[0]} 👑 𝐞̀ 𝐧𝐚𝐩𝐨𝐥𝐞𝐭𝐚𝐧𝐨 𝐚𝐥 *${percentage}%!*

━━━━━━☆ﾟ.*･｡ﾟ━━━━━━

${message}

━━━━━━☆ﾟ.*･｡ﾟ━━━━━━
`.trim();

    await conn.sendMessage(m.chat, {
        text: responseMessage,
        mentions: [person.id]
    });
};

handler.help = ['napoletano'];
handler.tags = ['fun'];
handler.command = /^(napoletano|napoliscanner)$/i;
handler.group = true;

export default handler;