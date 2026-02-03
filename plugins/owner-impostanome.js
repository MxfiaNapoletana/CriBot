// Handler per il comando che imposta il nome del bot
const handler = async (message, { conn, usedPrefix }) => {
  // Estrae il testo dopo il comando, rimuovendo spazi iniziali/finali
  const newBotName = message.text
    .trim()
    .split(' ')
    .slice(1)
    .join(' ');
  
  // Verifica se è stato fornito un nome valido
  if (newBotName !== '' && newBotName !== 'nomedelbot') {
    // Imposta il nuovo nome del bot nel database globale
    global.db.data.nomedelbot = newBotName;
    
    // Conferma l'operazione
    message.reply('ⓘ 𝐈𝐥 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥 𝐛𝐨𝐭 𝐞\' 𝐬𝐭𝐚𝐭𝐨 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐨 𝐢𝐧 ' + newBotName);
  } else {
    // Se non è stato fornito un nome, mostra un messaggio di aiuto
    return message.reply(
      'ⓘ 𝐈𝐦𝐩𝐨𝐬𝐭𝐚 𝐢𝐥 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥 𝐛𝐨𝐭 𝐝𝐨𝐩𝐨 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨',
      null,
      message
    );
  }
};

// Configurazione del comando
handler.command = /^(impostanome)$/i; // Regex per il comando "impostanome"
handler.rowner = true; // Solo il proprietario del bot può usare questo comando

export default handler;