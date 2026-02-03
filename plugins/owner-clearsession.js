//Plugin fatto da Axtral_WiZaRd e modificato da dieh!
import { existsSync, promises as fsPromises } from 'fs';
import path from 'path';

const handler = async (message, { conn, usedPrefix }) => {
  if (global.conn.user.jid !== conn.user.jid) {
    return conn.sendMessage(message.chat, {
      text: "*🚨 𝐔𝐭𝐢𝐥𝐢𝐳𝐳𝐚 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐝𝐢𝐫𝐞𝐭𝐭𝐚𝐦𝐞𝐧𝐭𝐞 𝐧𝐞𝐥 𝐧𝐮𝐦𝐞𝐫𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭.*"
    }, { quoted: message });
  }
  
  try {
    const sessionFolder = "./tmp/";
    if (!existsSync(sessionFolder)) {
      return await conn.sendMessage(message.chat, {
        text: "*❌ 𝐋𝐚 𝐜𝐚𝐫𝐭𝐞𝐥𝐥𝐚 𝐝𝐞𝐥𝐥𝐞 𝐬𝐞𝐬𝐬𝐢𝐨𝐧𝐢 𝐞̀ 𝐯𝐮𝐨𝐭𝐚 𝐨𝐩𝐩𝐮𝐫𝐞 𝐧𝐨𝐧 𝐞𝐬𝐢𝐬𝐭𝐞.*"
      }, { quoted: message });
    }
    
    const sessionFiles = await fsPromises.readdir(sessionFolder);
    let deletedCount = 0;
    
    for (const file of sessionFiles) {
      if (file !== "creds.json") {
        await fsPromises.unlink(path.join(sessionFolder, file));
        deletedCount++;
      }
    }
    
    const responseText = deletedCount === 0
      ? "❗ 𝐋𝐞 𝐬𝐞𝐬𝐬𝐢𝐨𝐧𝐢 𝐬𝐨𝐧𝐨 𝐯𝐮𝐨𝐭𝐞"
      : `*🔥 𝐒𝐨𝐧𝐨 𝐬𝐭𝐚𝐭𝐢 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐢 ${deletedCount} 𝐚𝐫𝐜𝐡𝐢𝐯𝐢 𝐝𝐚𝐥𝐥𝐞 𝐬𝐞𝐬𝐬𝐢𝐨𝐧𝐢, 𝐆𝐫𝐚𝐳𝐢𝐞 𝐩𝐞𝐫 𝐚𝐯𝐞𝐫𝐦𝐢 𝐬𝐯𝐮𝐨𝐭𝐚𝐭𝐨!*`;
    
    // Bottoni interattivi funzionanti
    const buttonMessage = {
      text: responseText,
      footer: '🤖 Bot WhatsApp',
      buttons: [
        { buttonId: `${usedPrefix}ds`, buttonText: { displayText: '🔄 𝐒𝐯𝐮𝐨𝐭𝐚 𝐝𝐢 𝐧𝐮𝐨𝐯𝐨' }, type: 1 },
        { buttonId: `${usedPrefix}ping`, buttonText: { displayText: '📊 𝐏𝐢𝐧𝐠' }, type: 1 },
        { buttonId: `${usedPrefix}pong`, buttonText: { displayText: '⚡ 𝐏𝐨𝐧𝐠' }, type: 1 }
      ],
      headerType: 1
    };
    
    await conn.sendMessage(message.chat, buttonMessage, { quoted: message });
    
  } catch (error) {
    console.error('Errore:', error);
    await conn.sendMessage(message.chat, { 
      text: "❌ Errore durante l'eliminazione delle sessioni!" 
    }, { quoted: message });
  }
};

handler.help = ['del_reg_in_session_owner'];
handler.tags = ["owner"];
handler.command = ["ds", "deletesession", "svuotasessioni"];
handler.admin = true;

export default handler;