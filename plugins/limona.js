// COMANDO .LIMONE CON MODIFICA PROGRESSIVA
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
        throw `Tagga qualcuno o rispondi a un messaggio! 💋😘`;
    }
    
    // Array di varianti per ogni parte del messaggio
    const aperture = [
        `*𝐒𝐓𝐀𝐈 𝐁𝐀𝐂𝐈𝐀𝐍𝐃𝐎 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐋𝐈𝐌𝐎𝐍𝐀𝐍𝐃𝐎 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐃𝐀𝐍𝐃𝐎 𝐔𝐍 𝐁𝐀𝐂𝐈𝐎 𝐀 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐅𝐀𝐂𝐄𝐍𝐃𝐎 𝐔𝐍 𝐋𝐈𝐌𝐎𝐍𝐄 𝐀 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐀𝐕𝐕𝐈𝐂𝐈𝐍𝐀𝐍𝐃𝐎𝐓𝐈 𝐀 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐏𝐄𝐑 𝐁𝐀𝐂𝐈𝐀𝐑𝐄 ${text}!*`
    ];
    
    const baci = [
        "𝐌𝐦𝐦𝐡... 𝐜𝐡𝐞 𝐥𝐚𝐛𝐛𝐫𝐚 𝐦𝐨𝐫𝐛𝐢𝐝𝐞, 𝐦𝐮𝐚𝐡",
        "𝐎𝐡... 𝐜𝐡𝐞 𝐛𝐚𝐜𝐢𝐨 𝐚𝐩𝐩𝐚𝐬𝐬𝐢𝐨𝐧𝐚𝐭𝐨, 𝐦𝐦𝐦𝐡",
        "𝐀𝐡𝐡... 𝐥𝐞 𝐭𝐮𝐞 𝐥𝐚𝐛𝐛𝐫𝐚 𝐬𝐨𝐧𝐨 𝐝𝐨𝐥𝐜𝐢, 𝐦𝐮𝐚𝐡",
        "𝐌𝐦𝐦... 𝐜𝐡𝐞 𝐛𝐞𝐥𝐥𝐨, 𝐚𝐧𝐜𝐨𝐫𝐚, 𝐚𝐧𝐜𝐨𝐫𝐚",
        "𝐎𝐡 𝐝𝐢𝐨... 𝐜𝐡𝐞 𝐥𝐢𝐦𝐨𝐧𝐞 𝐢𝐧𝐭𝐞𝐧𝐬𝐨, 𝐦𝐦𝐦𝐡",
        "𝐀𝐡𝐡... 𝐧𝐨𝐧 𝐟𝐞𝐫𝐦𝐚𝐫𝐭𝐢, 𝐜𝐨𝐧𝐭𝐢𝐧𝐮𝐚, 𝐦𝐮𝐚𝐡",
        "𝐌𝐦𝐦𝐡... 𝐦𝐢 𝐟𝐚𝐢 𝐯𝐞𝐧𝐢𝐫𝐞 𝐢 𝐛𝐫𝐢𝐯𝐢𝐝𝐢, 𝐦𝐮𝐚𝐡"
    ];
    
    const descrizioni = [
        "𝙜𝙡𝙞 𝙝𝙖𝙞 𝙙𝙖𝙩𝙤 𝙪𝙣 𝙗𝙖𝙘𝙞𝙤 𝙖𝙥𝙥𝙖𝙨𝙨𝙞𝙤𝙣𝙖𝙩𝙤 𝙘𝙝𝙚 𝙜𝙡𝙞 𝙝𝙖 𝙛𝙖𝙩𝙩𝙤 𝙥𝙚𝙧𝙙𝙚𝙧𝙚 𝙡𝙖 𝙩𝙚𝙨𝙩𝙖",
        "𝙡𝙤 𝙝𝙖𝙞 𝙡𝙞𝙢𝙤𝙣𝙖𝙩𝙤 𝙘𝙤𝙣 𝙩𝙖𝙣𝙩𝙖 𝙥𝙖𝙨𝙨𝙞𝙤𝙣𝙚 𝙘𝙝𝙚 𝙨𝙞 𝙚̀ 𝙨𝙘𝙞𝙤𝙡𝙩𝙤 𝙩𝙧𝙖 𝙡𝙚 𝙩𝙪𝙚 𝙗𝙧𝙖𝙘𝙘𝙞𝙖",
        "𝙜𝙡𝙞 𝙝𝙖𝙞 𝙙𝙖𝙩𝙤 𝙪𝙣 𝙗𝙖𝙘𝙞𝙤 𝙘𝙤𝙨𝙞̀ 𝙙𝙤𝙡𝙘𝙚 𝙘𝙝𝙚 𝙝𝙖 𝙙𝙞𝙢𝙚𝙣𝙩𝙞𝙘𝙖𝙩𝙤 𝙞𝙡 𝙥𝙧𝙤𝙥𝙧𝙞𝙤 𝙣𝙤𝙢𝙚",
        "𝙡𝙤 𝙝𝙖𝙞 𝙗𝙖𝙘𝙞𝙖𝙩𝙤 𝙘𝙤𝙣 𝙩𝙖𝙣𝙩𝙖 𝙞𝙣𝙩𝙚𝙣𝙨𝙞𝙩𝙖̀ 𝙘𝙝𝙚 𝙜𝙡𝙞 𝙝𝙖𝙞 𝙛𝙖𝙩𝙩𝙤 𝙫𝙚𝙙𝙚𝙧𝙚 𝙡𝙚 𝙨𝙩𝙚𝙡𝙡𝙚",
        "𝙜𝙡𝙞 𝙝𝙖𝙞 𝙛𝙖𝙩𝙩𝙤 𝙪𝙣 𝙡𝙞𝙢𝙤𝙣𝙚 𝙘𝙤𝙨𝙞̀ 𝙥𝙖𝙨𝙨𝙞𝙤𝙣𝙖𝙡𝙚 𝙘𝙝𝙚 𝙜𝙡𝙞 𝙝𝙖 𝙩𝙤𝙡𝙩𝙤 𝙞𝙡 𝙛𝙞𝙖𝙩𝙤",
        "𝙡𝙤 𝙝𝙖𝙞 𝙗𝙖𝙘𝙞𝙖𝙩𝙤 𝙘𝙤𝙣 𝙩𝙖𝙣𝙩𝙤 𝙖𝙢𝙤𝙧𝙚 𝙘𝙝𝙚 𝙚̀ 𝙧𝙞𝙢𝙖𝙨𝙩𝙤 𝙨𝙚𝙣𝙯𝙖 𝙥𝙖𝙧𝙤𝙡𝙚",
        "𝙜𝙡𝙞 𝙝𝙖𝙞 𝙙𝙖𝙩𝙤 𝙪𝙣 𝙗𝙖𝙘𝙞𝙤 𝙢𝙖𝙜𝙞𝙘𝙤 𝙘𝙝𝙚 𝙡𝙤 𝙝𝙖 𝙛𝙖𝙩𝙩𝙤 𝙞𝙣𝙣𝙖𝙢𝙤𝙧𝙖𝙧𝙚 𝙥𝙚𝙧𝙙𝙪𝙩𝙖𝙢𝙚𝙣𝙩𝙚"
    ];
    
    const conseguenze = [
        "𝙚 𝙤𝙧𝙖 𝙣𝙤𝙣 𝙧𝙞𝙚𝙨𝙘𝙚 𝙖 𝙨𝙢𝙚𝙩𝙩𝙚𝙧𝙚 𝙙𝙞 𝙨𝙤𝙧𝙧𝙞𝙙𝙚𝙧𝙚 𝙘𝙤𝙢𝙚 𝙪𝙣 𝙨𝙘𝙚𝙢𝙤",
        "𝙚 𝙝𝙖 𝙞𝙡 𝙘𝙪𝙤𝙧𝙚 𝙘𝙝𝙚 𝙗𝙖𝙩𝙩𝙚 𝙛𝙤𝙧𝙩𝙚 𝙘𝙤𝙢𝙚 𝙪𝙣 𝙩𝙖𝙢𝙗𝙪𝙧𝙤",
        "𝙚 𝙡𝙚 𝙜𝙪𝙖𝙣𝙘𝙚 𝙜𝙡𝙞 𝙨𝙤𝙣𝙤 𝙙𝙞𝙫𝙚𝙣𝙩𝙖𝙩𝙚 𝙧𝙤𝙨𝙨𝙚 𝙘𝙤𝙢𝙚 𝙥𝙤𝙢𝙤𝙙𝙤𝙧𝙞",
        "𝙚 𝙣𝙤𝙣 𝙧𝙞𝙚𝙨𝙘𝙚 𝙖 𝙥𝙚𝙣𝙨𝙖𝙧𝙚 𝙖𝙙 𝙖𝙡𝙩𝙧𝙤 𝙘𝙝𝙚 𝙖 𝙩𝙚",
        "𝙚 𝙚̀ 𝙧𝙞𝙢𝙖𝙨𝙩𝙤 𝙡𝙞̀ 𝙞𝙢𝙗𝙖𝙢𝙗𝙤𝙡𝙖𝙩𝙤 𝙘𝙤𝙣 𝙜𝙡𝙞 𝙤𝙘𝙘𝙝𝙞 𝙖 𝙘𝙪𝙤𝙧𝙞𝙘𝙞𝙣𝙤",
        "𝙚 𝙨𝙞 𝙚̀ 𝙞𝙣𝙣𝙖𝙢𝙤𝙧𝙖𝙩𝙤 𝙥𝙚𝙧𝙙𝙪𝙩𝙖𝙢𝙚𝙣𝙩𝙚 𝙙𝙞 𝙩𝙚"
    ];
    
    const finali = [
        "💋😘 *¡𝐆𝐋𝐈 𝐇𝐀𝐈 𝐃𝐀𝐓𝐎 𝐔𝐍 𝐁𝐀𝐂𝐈𝐎 𝐈𝐍𝐃𝐈𝐌𝐄𝐍𝐓𝐈𝐂𝐀𝐁𝐈𝐋𝐄!* 😘💋",
        "💋😘 *¡𝐋𝐎 𝐇𝐀𝐈 𝐋𝐈𝐌𝐎𝐍𝐀𝐓𝐎 𝐀𝐋𝐋𝐀 𝐆𝐑𝐀𝐍𝐃𝐄!* 😘💋",
        "💋😘 *¡𝐆𝐋𝐈 𝐇𝐀𝐈 𝐅𝐀𝐓𝐓𝐎 𝐏𝐄𝐑𝐃𝐄𝐑𝐄 𝐋𝐀 𝐓𝐄𝐒𝐓𝐀!* 😘💋",
        "💋😘 *¡𝐂𝐇𝐄 𝐁𝐀𝐂𝐈𝐎 𝐀𝐏𝐏𝐀𝐒𝐒𝐈𝐎𝐍𝐀𝐓𝐎!* 😘💋",
        "💋😘 *¡𝐋𝐎 𝐇𝐀𝐈 𝐅𝐀𝐓𝐓𝐎 𝐈𝐍𝐍𝐀𝐌𝐎𝐑𝐀𝐑𝐄!* 😘💋",
        "💋😘 *¡𝐁𝐀𝐂𝐈𝐎 𝐌𝐀𝐆𝐈𝐂𝐎 𝐂𝐎𝐍𝐒𝐄𝐆𝐍𝐀𝐓𝐎!* 😘💋"
    ];
    
    // Seleziona casualmente UNA frase da ogni array
    const aperturaRandom = aperture[Math.floor(Math.random() * aperture.length)];
    const bacioRandom = baci[Math.floor(Math.random() * baci.length)];
    const descrizioneRandom = descrizioni[Math.floor(Math.random() * descrizioni.length)];
    const conseguenzaRandom = conseguenze[Math.floor(Math.random() * conseguenze.length)];
    const finaleRandom = finali[Math.floor(Math.random() * finali.length)];
    
    // MODIFICA PROGRESSIVA - OGNI STEP SOSTITUISCE COMPLETAMENTE IL MESSAGGIO
    
    // 1. Invia apertura (es: "STAI BACIANDO @user!")
    let msg = await conn.reply(m.chat, aperturaRandom, null, { mentions: [user] });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Sostituisci con descrizione (es: "gli hai dato un bacio appassionato...")
    await conn.sendMessage(m.chat, { 
        text: descrizioneRandom, 
        edit: msg.key,
        mentions: [user]
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Sostituisci con bacio (es: "Mmmh... che labbra morbide...")
    await conn.sendMessage(m.chat, { 
        text: `" ${bacioRandom} "`, 
        edit: msg.key,
        mentions: [user]
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. Sostituisci con conseguenza (es: "e ora non riesce a smettere di sorridere...")
    await conn.sendMessage(m.chat, { 
        text: conseguenzaRandom, 
        edit: msg.key,
        mentions: [user]
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 5. Sostituisci con tag utente (es: "@user")
    await conn.sendMessage(m.chat, { 
        text: `*${text}*`, 
        edit: msg.key,
        mentions: [user]
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 6. Sostituisci con finale (es: "💋😘 GLI HAI DATO UN BACIO INDIMENTICABILE! 😘💋")
    await conn.sendMessage(m.chat, { 
        text: finaleRandom, 
        edit: msg.key,
        mentions: [user]
    });
}

handler.help = ['limone']
handler.tags = ['fun']
handler.command = /^(limone|bacio|kiss)$/i
export default handler