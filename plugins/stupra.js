// COMANDO .STUPRA CON MODIFICA PROGRESSIVA
let handler = async (m, { conn, command, text }) => {
    let user;
    
    // Se risponde a un messaggio
    if (m.quoted) {
        user = m.quoted.sender;
        text = `@${user.split('@')[0]}`;
    }
    // Se c'è una menzione
    else if (m.mentionedJid && m.mentionedJid.length > 0) {
        user = m.mentionedJid[0];
        if (!text) text = `@${user.split('@')[0]}`;
    }
    // Altrimenti richiede di taggare
    else {
        throw `Tagga qualcuno o rispondi a un messaggio! 🥵🤤`;
    }
    
    // Array di varianti per ogni parte del messaggio
    const aperture = [
        `*𝐒𝐓𝐀𝐈 𝐒𝐓𝐔𝐏𝐑𝐀𝐍𝐃𝐎 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐃𝐄𝐒𝐓𝐑𝐎𝐘𝐀𝐍𝐃𝐎 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐒𝐁𝐀𝐓𝐓𝐄𝐍𝐃𝐎 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐅𝐎𝐓𝐓𝐄𝐍𝐃𝐎 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐒𝐂𝐎𝐏𝐀𝐍𝐃𝐎 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐃𝐈𝐒𝐓𝐑𝐔𝐆𝐆𝐄𝐍𝐃𝐎 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐔𝐒𝐀𝐍𝐃𝐎 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐑𝐎𝐕𝐈𝐍𝐀𝐍𝐃𝐎 ${text}!*`
    ];
    
    const gemiti = [
        "𝐀𝐡𝐡𝐡.., 𝐀𝐚𝐚𝐚𝐡𝐡, 𝐬𝐢 𝐜𝐨𝐧𝐭𝐢𝐧𝐮𝐚, 𝐧𝐨𝐧 𝐟𝐞𝐫𝐦𝐚𝐫𝐭𝐢, 𝐧𝐨𝐧 𝐟𝐞𝐫𝐦𝐚𝐫𝐭𝐢",
        "𝐎𝐡 𝐝𝐢𝐨.., 𝐬𝐢𝐢𝐢, 𝐩𝐢𝐮̀ 𝐟𝐨𝐫𝐭𝐞, 𝐩𝐢𝐮̀ 𝐟𝐨𝐫𝐭𝐞, 𝐧𝐨𝐧 𝐬𝐦𝐞𝐭𝐭𝐞𝐫𝐞",
        "𝐀𝐡𝐡𝐡 𝐬𝐢.., 𝐜𝐨𝐬𝐢̀, 𝐩𝐫𝐨𝐩𝐫𝐢𝐨 𝐜𝐨𝐬𝐢̀, 𝐬𝐨𝐧𝐨 𝐭𝐮𝐭𝐭𝐚 𝐭𝐮𝐚",
        "𝐌𝐦𝐦𝐡.., 𝐀𝐡𝐡, 𝐝𝐚𝐦𝐦𝐢 𝐭𝐮𝐭𝐭𝐨, 𝐯𝐨𝐠𝐥𝐢𝐨 𝐭𝐮𝐭𝐭𝐨",
        "𝐒𝐢𝐢𝐢.., 𝐀𝐡𝐡𝐡, 𝐦𝐢 𝐟𝐚𝐢 𝐢𝐦𝐩𝐚𝐳𝐳𝐢𝐫𝐞, 𝐧𝐨𝐧 𝐟𝐞𝐫𝐦𝐚𝐫𝐭𝐢",
        "𝐌𝐦𝐦.., 𝐬𝐢 𝐜𝐨𝐬𝐢̀, 𝐩𝐫𝐞𝐧𝐝𝐢𝐦𝐢 𝐭𝐮𝐭𝐭𝐚, 𝐚𝐡𝐡𝐡",
        "𝐎𝐡𝐡.., 𝐦𝐚𝐝𝐨𝐧𝐧𝐚, 𝐦𝐢 𝐟𝐚𝐢 𝐢𝐦𝐩𝐚𝐳𝐳𝐢𝐫𝐞, 𝐬𝐢𝐢𝐢"
    ];
    
    const descrizioni = [
        "𝙡'𝙝𝙖𝙞 𝙨𝙩𝙪𝙥𝙧𝙖𝙩𝙖 𝙖 𝟵𝟬 𝙚 𝙡'𝙝𝙖𝙞 𝙩𝙧𝙖𝙩𝙩𝙖𝙩𝙖 𝙘𝙤𝙢𝙚 𝙪𝙣𝙖 𝙥𝙪𝙩𝙩𝙖𝙣𝙖 𝙙𝙞 𝙢𝙚𝙧𝙙𝙖",
        "𝙡'𝙝𝙖𝙞 𝙙𝙚𝙨𝙩𝙧𝙤𝙮𝙖𝙩𝙖 𝙘𝙤𝙢𝙥𝙡𝙚𝙩𝙖𝙢𝙚𝙣𝙩𝙚 𝙚 𝙡'𝙝𝙖𝙞 𝙪𝙨𝙖𝙩𝙖 𝙘𝙤𝙢𝙚 𝙪𝙣 𝙜𝙞𝙤𝙘𝙖𝙩𝙩𝙤𝙡𝙤",
        "𝙡'𝙝𝙖𝙞 𝙨𝙗𝙖𝙩𝙩𝙪𝙩𝙖 𝙨𝙚𝙣𝙯𝙖 𝙥𝙞𝙚𝙩𝙖̀ 𝙚 𝙡'𝙝𝙖𝙞 𝙛𝙖𝙩𝙩𝙖 𝙨𝙪𝙥𝙥𝙡𝙞𝙘𝙖𝙧𝙚 𝙥𝙚𝙧 𝙖𝙫𝙚𝙧𝙣𝙚 𝙖𝙣𝙘𝙤𝙧𝙖",
"𝙡'𝙝𝙖𝙞 𝙛𝙤𝙩𝙩𝙪𝙩𝙖 𝙞𝙣 𝙤𝙜𝙣𝙞 𝙥𝙤𝙨𝙞𝙯𝙞𝙤𝙣𝙚 𝙚 𝙡'𝙝𝙖𝙞 𝙧𝙞𝙚𝙢𝙥𝙞𝙩𝙖 𝙘𝙤𝙢𝙥𝙡𝙚𝙩𝙖𝙢𝙚𝙣𝙩𝙚",
"𝙡'𝙝𝙖𝙞 𝙥𝙧𝙚𝙨𝙖 𝙘𝙤𝙢𝙚 𝙪𝙣𝙖 𝙩𝙧𝙤𝙞𝙖 𝙚 𝙡'𝙝𝙖𝙞 𝙛𝙖𝙩𝙩𝙖 𝙜𝙤𝙙𝙚𝙧𝙚 𝙘𝙤𝙢𝙚 𝙢𝙖𝙞",
"𝙡'𝙝𝙖𝙞 𝙨𝙛𝙤𝙣𝙙𝙖𝙩𝙖 𝙛𝙞𝙣𝙤 𝙖 𝙛𝙖𝙧𝙡𝙖 𝙥𝙞𝙖𝙣𝙜𝙚𝙧𝙚 𝙚 𝙨𝙪𝙥𝙥𝙡𝙞𝙘𝙖𝙧𝙚",
"𝙡'𝙝𝙖𝙞 𝙧𝙞𝙙𝙤𝙩𝙩𝙖 𝙞𝙣 𝙪𝙣𝙖 𝙥𝙪𝙥𝙖 𝙙𝙚𝙡 𝙨𝙚𝙨𝙨𝙤 𝙚 𝙡'𝙝𝙖𝙞 𝙙𝙞𝙨𝙩𝙧𝙪𝙩𝙩𝙖"
];

   const conseguenze = [
    "𝙚 𝙡'𝙝𝙖𝙞 𝙡𝙖𝙨𝙘𝙞𝙖𝙩𝙖 𝙘𝙤𝙨𝙞̀ 𝙜𝙤𝙣𝙛𝙞𝙖 𝙘𝙝𝙚 𝙣𝙤𝙣 𝙧𝙞𝙚𝙨𝙘𝙚 𝙣𝙚𝙢𝙢𝙚𝙣𝙤 𝙖 𝙧𝙚𝙜𝙜𝙚𝙧𝙨𝙞 𝙞𝙣 𝙥𝙞𝙚𝙙𝙞 𝙨𝙩𝙪𝙥𝙞𝙙𝙖 𝙩𝙧𝙤𝙞𝙖 𝙙𝙞 𝙢𝙚𝙧𝙙𝙖",
    "𝙚 𝙚̀ 𝙧𝙞𝙢𝙖𝙨𝙩𝙖 𝙨𝙚𝙣𝙯𝙖 𝙛𝙞𝙖𝙩𝙤, 𝙩𝙧𝙚𝙢𝙖𝙣𝙩𝙚 𝙚 𝙘𝙤𝙢𝙥𝙡𝙚𝙩𝙖𝙢𝙚𝙣𝙩𝙚 𝙙𝙞𝙨𝙩𝙧𝙪𝙩𝙩𝙖 𝙥𝙪𝙩𝙩𝙖𝙣𝙚𝙡𝙡𝙖",
    "𝙚 𝙡'𝙝𝙖𝙞 𝙧𝙞𝙙𝙤𝙩𝙩𝙖 𝙞𝙣 𝙪𝙣𝙤 𝙨𝙩𝙧𝙖𝙘𝙘𝙞𝙤, 𝙩𝙪𝙩𝙩𝙖 𝙗𝙖𝙜𝙣𝙖𝙩𝙖 𝙚 𝙨𝙤𝙙𝙙𝙞𝙨𝙛𝙖𝙩𝙩𝙖 𝙩𝙧𝙤𝙞𝙖",
    "𝙚 𝙣𝙤𝙣 𝙧𝙞𝙚𝙨𝙘𝙚 𝙣𝙚𝙢𝙢𝙚𝙣𝙤 𝙖 𝙥𝙖𝙧𝙡𝙖𝙧𝙚, 𝙨𝙤𝙡𝙤 𝙖 𝙜𝙚𝙢𝙚𝙧𝙚 𝙘𝙤𝙢𝙚 𝙪𝙣𝙖 𝙥𝙪𝙩𝙩𝙖𝙣𝙖",
    "𝙚 𝙚̀ 𝙧𝙞𝙢𝙖𝙨𝙩𝙖 𝙡𝙞̀ 𝙨𝙩𝙚𝙨𝙖, 𝙨𝙛𝙞𝙣𝙞𝙩𝙖, 𝙘𝙤𝙣 𝙡𝙚 𝙜𝙖𝙢𝙗𝙚 𝙘𝙝𝙚 𝙩𝙧𝙚𝙢𝙖𝙣𝙤 𝙩𝙧𝙤𝙞𝙖",
    "𝙚 𝙨𝙞 𝙚̀ 𝙖𝙘𝙘𝙖𝙨𝙘𝙞𝙖𝙩𝙖 𝙖 𝙩𝙚𝙧𝙧𝙖 𝙘𝙤𝙢𝙚 𝙪𝙣 𝙨𝙖𝙘𝙘𝙤 𝙫𝙪𝙤𝙩𝙤, 𝙙𝙞𝙨𝙩𝙧𝙪𝙩𝙩𝙖"
];

const finali = [
    "🤤🥵 *¡𝐋'𝐇𝐀𝐈 𝐅𝐎𝐓𝐓𝐔𝐓𝐀 𝐏𝐄𝐑 𝐁𝐄𝐍𝐄!* 🥵🤤",
    "🤤🥵 *¡𝐋'𝐇𝐀𝐈 𝐃𝐈𝐒𝐓𝐑𝐔𝐓𝐓𝐀!* 🥵🤤",
    "🤤🥵 *¡𝐋'𝐇𝐀𝐈 𝐒𝐁𝐀𝐓𝐓𝐔𝐓𝐀 𝐀 𝐃𝐎𝐕𝐄𝐑𝐄!* 🥵🤤",
    "🤤🥵 *¡𝐋'𝐇𝐀𝐈 𝐔𝐒𝐀𝐓𝐀 𝐂𝐎𝐌𝐄 𝐔𝐍𝐀 𝐓𝐑𝐎𝐈𝐀!* 🥵🤤",
    "🤤🥵 *¡𝐋'𝐇𝐀𝐈 𝐒𝐓𝐔𝐏𝐑𝐀𝐓𝐀 𝐌𝐀𝐋𝐈𝐒𝐒𝐈𝐌𝐎!* 🥵🤤",
    "🤤🥵 *¡𝐋'𝐇𝐀𝐈 𝐑𝐈𝐃𝐎𝐓𝐓𝐀 𝐈𝐍 𝐏𝐎𝐋𝐓𝐈𝐆𝐋𝐈𝐀!* 🥵🤤"
];

// Seleziona casualmente da ogni array
const aperturaRandom = aperture[Math.floor(Math.random() * aperture.length)];
const gemitoRandom = gemiti[Math.floor(Math.random() * gemiti.length)];
const descrizioneRandom = descrizioni[Math.floor(Math.random() * descrizioni.length)];
const conseguenzaRandom = conseguenze[Math.floor(Math.random() * conseguenze.length)];
const finaleRandom = finali[Math.floor(Math.random() * finali.length)];

// MODIFICA PROGRESSIVA DEL MESSAGGIO
// 1. Invia apertura
let msg = await conn.reply(m.chat, aperturaRandom, null, { mentions: [user] });
await new Promise(resolve => setTimeout(resolve, 2000));

// 2. Modifica aggiungendo descrizione
await conn.sendMessage(m.chat, { 
    text: `${aperturaRandom}\n${descrizioneRandom}`, 
    edit: msg.key,
    mentions: [user]
});
await new Promise(resolve => setTimeout(resolve, 2000));

// 3. Modifica aggiungendo gemito
await conn.sendMessage(m.chat, { 
    text: `${aperturaRandom}\n${descrizioneRandom} " ${gemitoRandom} "`, 
    edit: msg.key,
    mentions: [user]
});
await new Promise(resolve => setTimeout(resolve, 2000));

// 4. Modifica aggiungendo conseguenza
await conn.sendMessage(m.chat, { 
    text: `${aperturaRandom}\n${descrizioneRandom} " ${gemitoRandom} " ${conseguenzaRandom}`, 
    edit: msg.key,
    mentions: [user]
});
await new Promise(resolve => setTimeout(resolve, 2000));

// 5. Modifica aggiungendo tag
await conn.sendMessage(m.chat, { 
    text: `${aperturaRandom}\n${descrizioneRandom} " ${gemitoRandom} " ${conseguenzaRandom}\n*${text}*`, 
    edit: msg.key,
    mentions: [user]
});
await new Promise(resolve => setTimeout(resolve, 2000));

// 6. Modifica finale
await conn.sendMessage(m.chat, { 
    text: `${aperturaRandom}\n${descrizioneRandom} " ${gemitoRandom} " ${conseguenzaRandom}\n*${text}*\n${finaleRandom}`, 
    edit: msg.key,
    mentions: [user]
});

}
handler.customPrefix = /stupra/i
handler.admin = true
handler.command = new RegExp
export default handler