// ==========================================
// FILE: plugins/provalivello.js
// Comando per testare la notifica di level-up
// ==========================================

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender];
  
  // Se l'utente non esiste nel database, crea dati fake per il test
  if (!user) {
    user = {
      exp: 5000,
      messaggi: 1000,
      money: 10000
    };
  }
  
  // Simula un livello casuale per il test (tra 1 e 20)
  const livelloTest = Math.floor(Math.random() * 20) + 1;
  const messaggiTest = user.messaggi || 1000;
  
  const testo = `Complimenti @${m.sender.split('@')[0]}!\nHai scritto *${messaggiTest}* messaggi e hai raggiunto il livello *${livelloTest}*`;
  
  try {
    // Ottieni la foto profilo dell'utente
    let ppUser;
    try {
      ppUser = await conn.profilePictureUrl(m.sender, 'image');
    } catch {
      // Se non ha foto profilo, usa l'immagine di default
      ppUser = 'https://i.imgur.com/AfFGxkr.jpg';
    }
    
    await conn.sendMessage(m.chat, {
      text: testo,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: '𝐍𝐮𝐨𝐯𝐨 𝐥𝐢𝐯𝐞𝐥𝐥𝐨 🎉',
          thumbnailUrl: ppUser,
        },
      },
    }, { quoted: null });
    
    console.log(`[PROVALIVELLO] ✅ Notifica test inviata - Livello ${livelloTest}`);
    
  } catch (error) {
    console.error('[PROVALIVELLO] ❌ Errore invio notifica test:', error);
    
    // Fallback senza thumbnail
    try {
      await conn.sendMessage(m.chat, {
        text: testo,
        mentions: [m.sender]
      });
      console.log(`[PROVALIVELLO] ✅ Fallback riuscito`);
    } catch (e) {
      console.error('[PROVALIVELLO] ❌ Errore fallback:', e);
      await m.reply('❌ Errore durante il test della notifica.');
    }
  }
};

handler.help = ['provalivello'];
handler.tags = ['rpg'];
handler.command = ['provalivello', 'testlevel', 'testlivello'];
handler.register = true;

export default handler;