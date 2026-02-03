//Plugin fatto da Gabs333 x Staff ChatUnity
import fetch from 'node-fetch';

function expPerLivello(livello) {
  return 2000 * livello;
}

function calcolaLivello(exp) {
  let livello = 1;
  while (exp >= expPerLivello(livello)) {
    livello++;
  }
  return livello - 1;
}

function formatNumber(num) {
  return num.toLocaleString('it-IT');
}

let handler = async (m, { conn, args }) => {
  await m.reply('⏳ *Generazione classifica in corso...*');
  
  // Recupera tutti gli utenti dal database
  let users = Object.entries(global.db.data.users).map(([jid, data]) => ({
    jid,
    exp: Number(data.exp) || 0,
    messaggi: Number(data.messaggi) || 0,
    livello: calcolaLivello(Number(data.exp) || 0)
  }));

  // Ordina per EXP
  users.sort((a, b) => b.exp - a.exp);

  const limit = parseInt(args[0]) || 10;
  const displayUsers = users.slice(0, Math.min(limit, 10));
  const userPosition = users.findIndex(u => u.jid === m.sender) + 1;
  const userData = users.find(u => u.jid === m.sender);

  try {
    // Prepara i dati
    let leaderboardData = [];
    
    for (let i = 0; i < Math.min(displayUsers.length, 5); i++) {
      const user = displayUsers[i];
      let name;
      try {
        name = await conn.getName(user.jid);
      } catch {
        name = user.jid.split('@')[0];
      }

      let profilePic;
      try {
        profilePic = await conn.profilePictureUrl(user.jid, 'image');
      } catch {
        profilePic = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg';
      }

      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`;
      
      leaderboardData.push({
        medal,
        name: name.substring(0, 15),
        level: user.livello,
        exp: formatNumber(user.exp),
        avatar: profilePic,
        jid: user.jid
      });
    }

    // Crea immagine usando solo i top 5 con popcat
    const backgroundUrl = 'https://i.imgur.com/DTf69H5.jpeg';
    const text1 = '🏆 TOP LIVELLI 🏆';
    const text2 = leaderboardData.map(u => `${u.medal} ${u.name} Lv${u.level}`).join(' • ');
    const text3 = `Totale ${displayUsers.length} utenti`;
    
    const apiUrl = `https://api.popcat.xyz/welcomecard?background=${encodeURIComponent(backgroundUrl)}&text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}&text3=${encodeURIComponent(text3)}&avatar=${encodeURIComponent(leaderboardData[0].avatar)}`;

    // Caption COMPLETO con TUTTI i 10 utenti
    let caption = `╔═══════════════════════════╗
║  🏆 TOP ${displayUsers.length} LIVELLI  🏆  ║
╚═══════════════════════════╝\n\n`;

    for (let i = 0; i < displayUsers.length; i++) {
      const user = displayUsers[i];
      let name;
      try {
        name = await conn.getName(user.jid);
      } catch {
        name = user.jid.split('@')[0];
      }

      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      const marker = user.jid === m.sender ? '➤ ' : '';
      
      caption += `${marker}${medal} *${name}*\n`;
      caption += `   ├ 📊 Livello: *${user.livello}*\n`;
      caption += `   ├ ✨ EXP: *${formatNumber(user.exp)}*\n`;
      caption += `   └ 💬 Messaggi: *${formatNumber(user.messaggi)}*\n\n`;
    }

    if (userPosition > displayUsers.length) {
      caption += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      caption += `📍 *La tua posizione:* #${userPosition}\n`;
      caption += `📊 Livello: *${userData.livello}*\n`;
      caption += `✨ EXP: *${formatNumber(userData.exp)}*\n`;
    }

    caption += `\n╰─────────────────────╯`;

    // Invia immagine + caption completo
    await conn.sendMessage(m.chat, {
      image: { url: apiUrl },
      caption: caption,
      mentions: displayUsers.map(u => u.jid)
    }, { quoted: m });

  } catch (error) {
    console.error('Errore nel comando toplivello:', error);
    
    // FALLBACK: Solo testo ben formattato
    let fallbackText = `╔═══════════════════════════╗
║  🏆 TOP ${displayUsers.length} LIVELLI  🏆  ║
╚═══════════════════════════╝\n\n`;
    
    for (let i = 0; i < displayUsers.length; i++) {
      const user = displayUsers[i];
      let name;
      try {
        name = await conn.getName(user.jid);
      } catch {
        name = user.jid.split('@')[0];
      }

      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      const marker = user.jid === m.sender ? '➤ ' : '';
      
      fallbackText += `${marker}${medal} *${name}*\n`;
      fallbackText += `   ├ 📊 Livello: *${user.livello}*\n`;
      fallbackText += `   ├ ✨ EXP: *${formatNumber(user.exp)}*\n`;
      fallbackText += `   └ 💬 Messaggi: *${formatNumber(user.messaggi)}*\n\n`;
    }

    if (userPosition > displayUsers.length) {
      fallbackText += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      fallbackText += `📍 *La tua posizione:* #${userPosition}\n`;
      fallbackText += `📊 Livello: *${userData.livello}*\n`;
      fallbackText += `✨ EXP: *${formatNumber(userData.exp)}*\n`;
    }

    fallbackText += `\n╰─────────────────────╯`;

    await m.reply(fallbackText);
  }
};

handler.help = ['toplivello'];
handler.tags = ['rpg'];
handler.command = ['toplivello', 'toplevel', 'leaderboard', 'classifica'];
handler.register = true;

export default handler;