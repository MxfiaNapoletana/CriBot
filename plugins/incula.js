// COMANDO .INCULA CON MODIFICA PROGRESSIVA
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
        throw `Tagga qualcuno o rispondi a un messaggio! 🍑🔥`;
    }
    
    // Array di varianti per ogni parte del messaggio
    const aperture = [
        `*𝐒𝐓𝐀𝐈 𝐈𝐍𝐂𝐔𝐋𝐀𝐍𝐃𝐎 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐒𝐅𝐎𝐍𝐃𝐀𝐍𝐃𝐎 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐀𝐏𝐑𝐄𝐍𝐃𝐎 𝐈𝐋 𝐂𝐔𝐋𝐎 𝐀 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐃𝐈𝐋𝐀𝐓𝐀𝐍𝐃𝐎 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐒𝐏𝐀𝐂𝐂𝐀𝐍𝐃𝐎 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐃𝐈𝐒𝐓𝐑𝐔𝐆𝐆𝐄𝐍𝐃𝐎 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐀𝐋𝐋𝐀𝐑𝐆𝐀𝐍𝐃𝐎 ${text}!*`,
        `*𝐒𝐓𝐀𝐈 𝐑𝐎𝐕𝐈𝐍𝐀𝐍𝐃𝐎 ${text}!*`
    ];
    
    const gemiti = [
        "𝐎𝐡 𝐧𝐨.., 𝐞̀ 𝐭𝐫𝐨𝐩𝐩𝐨 𝐠𝐫𝐨𝐬𝐬𝐨, 𝐧𝐨𝐧 𝐜𝐞 𝐥𝐚 𝐟𝐚𝐜𝐜𝐢𝐨, 𝐚𝐡𝐡𝐡",
        "𝐌𝐚𝐝𝐨𝐧𝐧𝐚.., 𝐦𝐢 𝐬𝐭𝐚𝐢 𝐬𝐩𝐚𝐜𝐜𝐚𝐧𝐝𝐨 𝐢𝐧 𝐝𝐮𝐞, 𝐚𝐡𝐡𝐡𝐡",
        "𝐏𝐢𝐚𝐧𝐨.., 𝐩𝐢𝐚𝐧𝐨 𝐩𝐞𝐫 𝐟𝐚𝐯𝐨𝐫𝐞, 𝐟𝐚 𝐦𝐚𝐥𝐞, 𝐨𝐡𝐡𝐡",
        "𝐍𝐨𝐧 𝐜𝐞 𝐥𝐚 𝐟𝐚𝐜𝐜𝐢𝐨.., 𝐞̀ 𝐭𝐫𝐨𝐩𝐩𝐨 𝐥𝐮𝐧𝐠𝐨, 𝐚𝐡𝐡𝐡𝐡",
        "𝐀𝐢𝐢𝐢.., 𝐦𝐢 𝐬𝐭𝐚𝐢 𝐝𝐢𝐥𝐚𝐭𝐚𝐧𝐝𝐨 𝐭𝐫𝐨𝐩𝐩𝐨, 𝐦𝐦𝐦𝐡𝐡",
        "𝐅𝐞𝐫𝐦𝐚𝐭𝐢.., 𝐦𝐢 𝐬𝐭𝐚𝐢 𝐚𝐩𝐫𝐞𝐧𝐝𝐨 𝐭𝐫𝐨𝐩𝐩𝐨, 𝐨𝐡𝐡𝐡",
        "𝐎𝐡 𝐝𝐢𝐨.., 𝐦𝐢 𝐬𝐭𝐚𝐢 𝐬𝐟𝐨𝐧𝐝𝐚𝐧𝐝𝐨, 𝐚𝐡𝐡𝐡𝐡"
    ];
    
    const descrizioni = [
        "𝙡𝙤 𝙝𝙖𝙞 𝙞𝙣𝙘𝙪𝙡𝙖𝙩𝙤 𝙨𝙚𝙣𝙯𝙖 𝙥𝙞𝙚𝙩𝙖̀ 𝙚 𝙡𝙤 𝙝𝙖𝙞 𝙖𝙥𝙚𝙧𝙩𝙤 𝙘𝙤𝙢𝙚 𝙪𝙣 𝙘𝙖𝙣𝙘𝙚𝙡𝙡𝙤",
        "𝙜𝙡𝙞 𝙝𝙖𝙞 𝙨𝙛𝙤𝙣𝙙𝙖𝙩𝙤 𝙞𝙡 𝙘𝙪𝙡𝙤 𝙚 𝙡𝙤 𝙝𝙖𝙞 𝙛𝙖𝙩𝙩𝙤 𝙪𝙧𝙡𝙖𝙧𝙚 𝙘𝙤𝙢𝙚 𝙪𝙣 𝙖𝙣𝙞𝙢𝙖𝙡𝙚",
        "𝙡𝙤 𝙝𝙖𝙞 𝙙𝙞𝙡𝙖𝙩𝙖𝙩𝙤 𝙛𝙞𝙣𝙤 𝙖 𝙛𝙖𝙧𝙡𝙤 𝙡𝙖𝙘𝙧𝙞𝙢𝙖𝙧𝙚 𝙚 𝙩𝙧𝙚𝙢𝙖𝙧𝙚",
        "𝙜𝙡𝙞 𝙝𝙖𝙞 𝙨𝙥𝙖𝙘𝙘𝙖𝙩𝙤 𝙞𝙡 𝙘𝙪𝙡𝙤 𝙘𝙤𝙢𝙚 𝙪𝙣 𝙛𝙧𝙪𝙩𝙩𝙤 𝙢𝙖𝙩𝙪𝙧𝙤",
        "𝙜𝙡𝙞 𝙝𝙖𝙞 𝙛𝙤𝙩𝙩𝙪𝙩𝙤 𝙞𝙡 𝙘𝙪𝙡𝙤 𝙛𝙞𝙣𝙤 𝙖 𝙙𝙞𝙨𝙩𝙧𝙪𝙜𝙜𝙚𝙧𝙡𝙤 𝙘𝙤𝙢𝙥𝙡𝙚𝙩𝙖𝙢𝙚𝙣𝙩𝙚",
        "𝙜𝙡𝙞 𝙝𝙖𝙞 𝙖𝙡𝙡𝙖𝙧𝙜𝙖𝙩𝙤 𝙞𝙡 𝙘𝙪𝙡𝙤 𝙛𝙞𝙣𝙤 𝙖 𝙧𝙤𝙢𝙥𝙚𝙧𝙡𝙤 𝙞𝙣 𝙙𝙪𝙚",
        "𝙜𝙡𝙞 𝙝𝙖𝙞 𝙛𝙖𝙩𝙩𝙤 𝙢𝙖𝙡𝙚 𝙘𝙤𝙨𝙞̀ 𝙩𝙖𝙣𝙩𝙤 𝙘𝙝𝙚 𝙝𝙖 𝙥𝙞𝙖𝙣𝙩𝙤 𝙘𝙤𝙢𝙚 𝙪𝙣 𝙗𝙖𝙢𝙗𝙞𝙣𝙤"
    ];
    
    const conseguenze = [
        "𝙚 𝙤𝙧𝙖 𝙣𝙤𝙣 𝙧𝙞𝙚𝙨𝙘𝙚 𝙣𝙚𝙢𝙢𝙚𝙣𝙤 𝙖 𝙨𝙩𝙖𝙧𝙚 𝙨𝙚𝙙𝙪𝙩𝙤 𝙥𝙚𝙧 𝙪𝙣𝙖 𝙨𝙚𝙩𝙩𝙞𝙢𝙖𝙣𝙖 𝙘𝙪𝙡𝙤 𝙧𝙤𝙩𝙩𝙤",
        "𝙚 𝙡𝙤 𝙝𝙖𝙞 𝙡𝙖𝙨𝙘𝙞𝙖𝙩𝙤 𝙘𝙤𝙨𝙞̀ 𝙖𝙥𝙚𝙧𝙩𝙤 𝙘𝙝𝙚 𝙘𝙞 𝙥𝙖𝙨𝙨𝙖 𝙪𝙣 𝙩𝙞𝙧 𝙨𝙩𝙧𝙤𝙣𝙯𝙤",
        "𝙚 𝙜𝙡𝙞 𝙝𝙖𝙞 𝙧𝙞𝙙𝙤𝙩𝙩𝙤 𝙞𝙡 𝙘𝙪𝙡𝙤 𝙘𝙤𝙢𝙚 𝙪𝙣 𝙘𝙧𝙖𝙩𝙚𝙧𝙚 𝙡𝙪𝙣𝙖𝙧𝙚 𝙘𝙪𝙡𝙤 𝙙𝙞𝙨𝙩𝙧𝙪𝙩𝙩𝙤",
        "𝙚 𝙣𝙤𝙣 𝙧𝙞𝙚𝙨𝙘𝙚 𝙣𝙚𝙢𝙢𝙚𝙣𝙤 𝙖 𝙘𝙖𝙢𝙢𝙞𝙣𝙖𝙧𝙚 𝙙𝙧𝙞𝙩𝙩𝙤 𝙥𝙤𝙫𝙚𝙧𝙚𝙩𝙩𝙤",
        "𝙚 𝙚̀ 𝙧𝙞𝙢𝙖𝙨𝙩𝙤 𝙡𝙞̀ 𝙨𝙩𝙚𝙨𝙤 𝙘𝙤𝙣 𝙞𝙡 𝙘𝙪𝙡𝙤 𝙘𝙝𝙚 𝙥𝙪𝙡𝙨𝙖 𝙚 𝙗𝙧𝙪𝙘𝙞𝙖",
        "𝙚 𝙨𝙞 𝙚̀ 𝙖𝙘𝙘𝙖𝙨𝙘𝙞𝙖𝙩𝙤 𝙖 𝙩𝙚𝙧𝙧𝙖 𝙘𝙤𝙣 𝙞𝙡 𝙘𝙪𝙡𝙤 𝙘𝙝𝙚 𝙜𝙡𝙞 𝙨𝙖𝙣𝙜𝙪𝙞𝙣𝙖"
    ];
    
    const finali = [
        "🍑🔥 *¡𝐋𝐎 𝐇𝐀𝐈 𝐈𝐍𝐂𝐔𝐋𝐀𝐓𝐎 𝐃𝐈 𝐁𝐑𝐔𝐓𝐓𝐎!* 🔥🍑",
        "🍑🔥 *¡𝐆𝐋𝐈 𝐇𝐀𝐈 𝐒𝐅𝐎𝐍𝐃𝐀𝐓𝐎 𝐈𝐋 𝐂𝐔𝐋𝐎!* 🔥🍑",
        "🍑🔥 *¡𝐋𝐎 𝐇𝐀𝐈 𝐀𝐏𝐄𝐑𝐓𝐎 𝐂𝐎𝐌𝐄 𝐔𝐍 𝐂𝐀𝐍𝐂𝐄𝐋𝐋𝐎!* 🔥🍑",
        "🍑🔥 *¡𝐋𝐎 𝐇𝐀𝐈 𝐃𝐈𝐋𝐀𝐓𝐀𝐓𝐎 𝐌𝐀𝐋𝐈𝐒𝐒𝐈𝐌𝐎!* 🔥🍑",
        "🍑🔥 *¡𝐆𝐋𝐈 𝐇𝐀𝐈 𝐃𝐈𝐒𝐓𝐑𝐔𝐓𝐓𝐎 𝐈𝐋 𝐂𝐔𝐋𝐎!* 🔥🍑",
        "🍑🔥 *¡𝐋𝐎 𝐇𝐀𝐈 𝐑𝐈𝐃𝐎𝐓𝐓𝐎 𝐈𝐍 𝐏𝐎𝐋𝐓𝐈𝐆𝐋𝐈𝐀!* 🔥🍑"
    ];
    
    // Seleziona casualmente UNA frase da ogni array
    const aperturaRandom = aperture[Math.floor(Math.random() * aperture.length)];
    const gemitoRandom = gemiti[Math.floor(Math.random() * gemiti.length)];
    const descrizioneRandom = descrizioni[Math.floor(Math.random() * descrizioni.length)];
    const conseguenzaRandom = conseguenze[Math.floor(Math.random() * conseguenze.length)];
    const finaleRandom = finali[Math.floor(Math.random() * finali.length)];
    
    // MODIFICA PROGRESSIVA - OGNI STEP SOSTITUISCE COMPLETAMENTE IL MESSAGGIO
    
    // 1. Invia apertura (es: "STAI INCULANDO @user!")
    let msg = await conn.reply(m.chat, aperturaRandom, null, { mentions: [user] });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Sostituisci con descrizione (es: "lo hai inculato senza pietà...")
    await conn.sendMessage(m.chat, { 
        text: descrizioneRandom, 
        edit: msg.key,
        mentions: [user]
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Sostituisci con gemito (es: "Oh no.., è troppo grosso...")
    await conn.sendMessage(m.chat, { 
        text: `" ${gemitoRandom} "`, 
        edit: msg.key,
        mentions: [user]
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. Sostituisci con conseguenza (es: "e ora non riesce nemmeno a stare seduto...")
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
    
    // 6. Sostituisci con finale (es: "🍑🔥 LO HAI INCULATO DI BRUTTO! 🔥🍑")
    await conn.sendMessage(m.chat, { 
        text: finaleRandom, 
        edit: msg.key,
        mentions: [user]
    });
}

handler.customPrefix = /incula/i
handler.admin = true
handler.command = new RegExp
export default handler