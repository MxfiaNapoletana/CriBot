const handler = async (m, { conn }) => {
  // Ottiene l'utente menzionato o quotato, altrimenti l'autore del messaggio
  const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender);
  
  const user = global.db.data.users[who];
  
  if (!user) return m.reply('Inserisci la menzione nel comando!');
  
  // Estrae il numero dal testo del messaggio
  const match = m.text.match(/\d+/);
  const amount = match ? parseInt(match[0]) : 0;
  
  if (amount <= 0) 
    return m.reply('Inserisci un numero valido di messaggi da rimuovere!', m);
  
  if (!user.messaggi || user.messaggi < amount) 
    return m.reply(`L'utente @${who.split('@')[0]} non ha abbastanza messaggi da rimuovere.`, null, {'mentions': [who]});
  
  // Rimuove i messaggi
  user.messaggi -= amount;
  
  let fakeQuote = {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: 'Halo'
    },
    message: {
      extendedTextMessage: {
        text: '𝐄𝐬𝐞𝐠𝐮𝐢𝐭𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨 ✓',
        vcard: 'BEGIN:VCARD\nVERSION:5.0\n...'
      }
    },
    participant: '0@s.whatsapp.net'
  };
  
  conn.reply(m.chat, `𝐇𝐨 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 *${amount}* 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐚 𝐪𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞!`, null, {'quoted': fakeQuote});
};

handler.command = /^(rimuovi)$/i;

export default handler;