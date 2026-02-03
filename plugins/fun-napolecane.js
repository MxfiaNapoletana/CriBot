const handler = async (m, { conn }) => {
  // Prendi l'utente menzionato o, se è una risposta, prendi l'utente del messaggio citato
  const who = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : m.sender);
  const percentuale = Math.floor(Math.random() * 101);

  let frase = "";
  if (percentuale >= 75) {
    frase = "𝐏𝐎𝐑𝐂𝐎𝐃𝐈𝐎 𝐂𝐇𝐄 𝐒𝐂𝐇𝐈𝐅𝐎 𝐔𝐍 𝐍𝐀𝐏𝐎𝐋𝐄𝐂𝐀𝐍𝐄 𝐕𝐄𝐑𝐎 𝐕𝐀𝐓𝐓𝐄𝐍𝐄 𝐕𝐈𝐀 𝐃𝐀 𝐐𝐔𝐈̀ 𝐁𝐀𝐒𝐓𝐀𝐑𝐃𝐎 𝐃𝐈 𝐌𝐄𝐑𝐃𝐀!";
  } else if (percentuale >= 50) {
    frase = "𝐩𝐨𝐫𝐜𝐨𝐝𝐝𝐢𝐨 𝐬𝐞𝐢 𝐪𝐮𝐚𝐬𝐢 𝐧𝐚𝐩𝐨𝐥𝐞𝐭𝐚𝐧𝐨 𝐝𝐨𝐜 𝐚𝐦𝐦𝐦𝐚𝐳𝐳𝐚𝐭𝐢";
  } else if (percentuale >= 11) {
    frase = "𝐧𝐨𝐧 𝐬𝐞𝐢 𝐝𝐢 𝐧𝐚𝐩𝐨𝐥𝐢 𝐦𝐚 𝐬𝐨 𝐜𝐡𝐞 𝐚𝐬𝐜𝐨𝐥𝐭𝐢 𝐠𝐞𝐨𝐥𝐢𝐞𝐫 𝐪𝐮𝐢𝐧𝐝𝐢 𝐬𝐩𝐚𝐫𝐚𝐭𝐢 𝐜𝐨𝐠𝐥𝐢𝐨𝐧𝐞!";
  } else if (percentuale <= 10) {
    frase = "𝐧𝐨𝐧 𝐬𝐞𝐢 𝐧𝐚𝐩𝐨𝐥𝐞𝐭𝐚𝐧𝐨 𝐦𝐚 𝐪𝐮𝐞𝐥𝐥𝐚 𝐩𝐢𝐜𝐜𝐨𝐥𝐚 𝐩𝐞𝐫𝐜𝐞𝐧𝐭𝐮𝐚𝐥𝐞 𝐭𝐢 𝐫𝐨𝐯𝐢𝐧𝐚!";
  } else {
    frase = "𝐚 𝐟𝐫𝐚 𝐧𝐨𝐧 𝐬𝐞𝐢 𝐮𝐧 𝐧𝐚𝐩𝐨𝐥𝐞𝐭𝐚𝐧𝐨 𝐩𝐞𝐧𝐭𝐢𝐭𝐨 𝐨𝐭𝐭𝐢𝐦𝐨 𝐜𝐨𝐬𝐢̀!!";
  }

  // Crea il messaggio da inviare
  const testo = 
`*𝐒𝐜𝐚𝐧𝐧𝐞𝐫 𝐍𝐚𝐩𝐨𝐥𝐞𝐭𝐚𝐧𝐢𝐭𝐚̀ 𝐀𝐭𝐭𝐢𝐯𝐨*
𝐜𝐚𝐫𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...
═════ ೋೋ═════
@${who.split("@")[0]} 𝐞̀ 𝐧𝐚𝐩𝐨𝐥𝐞𝐭𝐚𝐧𝐨 𝐚𝐥 *${percentuale}%*!
═════ ೋೋ═════
${frase}
═════ ೋೋ═════`;

  // Rispondi taggando l'utente corretto
  conn.reply(m.chat, testo, m, { mentions: [who] });
};

handler.command = /^napoli$/i;

export default handler;