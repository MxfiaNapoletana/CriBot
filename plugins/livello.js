//Plugin fatto da Gabs333 x Staff ChatUnity
//Plugin fatto da Gabs333 x Staff ChatUnity
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

function expPerProssimoLivello(exp) {
  const livelloAttuale = calcolaLivello(exp);
  const expNecessaria = expPerLivello(livelloAttuale + 1);
  return expNecessaria - exp;
}

function calcolaProgresso(exp) {
  const livelloAttuale = calcolaLivello(exp);
  const expLivelloAttuale = expPerLivello(livelloAttuale);
  const expProssimoLivello = expPerLivello(livelloAttuale + 1);
  const expGuadagnataLivello = exp - expLivelloAttuale;
  const expTotaleLivello = expProssimoLivello - expLivelloAttuale;
  return Math.floor((expGuadagnataLivello / expTotaleLivello) * 100);
}

function formatNumber(num) {
  return num.toLocaleString('it-IT');
}

let handler = async (m, { conn, usedPrefix }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
  
  if (!(who in global.db.data.users)) {
    return m.reply(`*L'utente non è presente nel database.*`);
  }
  
  let user = global.db.data.users[who];
  user.exp = Number(user.exp) || 0;
  user.messaggi = Number(user.messaggi) || 0;
  
  const livelloAttuale = calcolaLivello(user.exp);
  const expMancante = expPerProssimoLivello(user.exp);
  const progresso = calcolaProgresso(user.exp);
  const messaggiMancanti = Math.ceil(expMancante / 5);
  
  let name = await conn.getName(who);
  let profilePic;
  try {
    profilePic = await conn.profilePictureUrl(who, 'image');
  } catch {
    profilePic = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg';
  }

  try {
    // FIX: Usa testo semplice senza caratteri speciali per evitare problemi di encoding
    // Sostituisci • con - e rimuovi caratteri unicode problematici
    const text1 = name;
    const text2 = `Livello ${livelloAttuale} - ${progresso}%`;
    const text3 = `EXP: ${user.exp}`;
    
    const backgroundUrl = 'https://i.imgur.com/DTf69H5.jpeg';
    const apiUrl = `https://api.popcat.xyz/welcomecard?background=${encodeURIComponent(backgroundUrl)}&text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}&text3=${encodeURIComponent(text3)}&avatar=${encodeURIComponent(profilePic)}`;
    
    const caption = `
ㅤㅤ⋆｡˚『 ╭ \`STATISTICHE\` ╯ 』˚｡⋆\n╭
│ 『 👤 』 \`Nome:\` @${who.split('@')[0]}
│ 『 📈 』 \`Livello:\` *${livelloAttuale}*
│ 『 ✨ 』 \`EXP:\` *${formatNumber(user.exp)}*
│ 『 💬 』 \`Messaggi:\` *${formatNumber(user.messaggi)}*
│
│ 『 📊 』 _*Progresso:*_
│ • \`Percentuale:\` *${progresso}%*
│ • \`Mancano:\` *${formatNumber(expMancante)} EXP*
│ • \`≈ ${messaggiMancanti} messaggi*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

    await conn.sendMessage(m.chat, {
      image: { url: apiUrl },
      caption: caption,
      mentions: [who]
    }, { quoted: m });

  } catch (error) {
    
    // Fallback testuale con barra ASCII
    const barraLunghezza = 10;
    const blocchiPieni = Math.floor((progresso / 100) * barraLunghezza);
    const barra = "█".repeat(blocchiPieni) + "░".repeat(barraLunghezza - blocchiPieni);
    
    const messaggio = `
👤 @${who.split('@')[0]}
⭐ Livello: *${livelloAttuale}*
✨ EXP: ${formatNumber(user.exp)}
💬 Messaggi: ${formatNumber(user.messaggi)}

📈 Progresso: [${barra}] ${progresso}%
⬆️ Mancano ${formatNumber(expMancante)} EXP (≈${messaggiMancanti} msg)
`.trim();

    await conn.sendMessage(m.chat, {
      text: messaggio,
      mentions: [who]
    }, { quoted: m });
  }
};

handler.help = ['livello'];
handler.tags = ['rpg'];
handler.command = ['livello', 'level', 'lvl'];
handler.register = true;

export default handler;

export async function provalivello(m, { conn }) {
  let user = global.db.data.users[m.sender];
  if (!user) {
    user = { exp: 5000, messaggi: 1000, money: 10000 };
  }
  
  const livelloTest = Math.floor(Math.random() * 20) + 1;
  const messaggiTest = user.messaggi || 1000;
  const testo = `Complimenti @${m.sender.split('@')[0]}!\nHai scritto *${messaggiTest}* messaggi e hai raggiunto il livello *${livelloTest}*`;
  
  try {
    let ppUser;
    try {
      ppUser = await conn.profilePictureUrl(m.sender, 'image');
    } catch {
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
  } catch (error) {
    await m.reply(testo);
  }
}

export const provaLivelloHandler = {
  help: ['provalivello'],
  tags: ['rpg'],
  command: ['provalivello', 'testlevel'],
  register: true,
  handler: provalivello
};