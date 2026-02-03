import * as baileys from '@realvare/based';

let handler = async (m, { conn, text }) => {
  // Estrae il codice di invito dal link del gruppo
  let [, code] = text.match(/chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i) || [];
  
  if (!code) throw '*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝚂𝙴𝚁𝙸𝚂𝙲𝙸 𝙸𝙻 𝙻𝙸𝙽𝙺 𝙳𝙴𝙻 𝙶𝚁𝚄𝙿𝙿𝙾*';
  
  // Query per ottenere i metadati del gruppo
  let response = await conn.query({
    tag: 'iq',
    attrs: {
      type: 'get',
      xmlns: 'w:g2',
      to: '@g.us'
    },
    content: [{
      tag: 'invite',
      attrs: { code: code }
    }]
  });
  
  // Estrae i metadati del gruppo
  let metadata = extractGroupMetadata(response);
  
  // Formatta le informazioni in una lista
  let formattedInfo = Object.keys(metadata)
    .map(key => '*' + capitalize(key) + ':* ' + metadata[key])
    .join('\n');
  
  // Prova a ottenere l'immagine del profilo del gruppo
  let profilePic = await conn.profilePictureUrl(metadata.id, 'image').catch(console.error);
  
  // Se c'è l'immagine, inviala con le info
  if (profilePic) {
    return conn.sendMessage(m.chat, {
      image: { url: profilePic },
      caption: formattedInfo
    }, { quoted: m });
  }
  
  // Altrimenti invia solo il testo formattato
  let textMessage = 
    '⫹⫺ 𝐈𝐃: ' + metadata.id +
    '\n⫹⫺ 𝐍𝐎𝐌𝐄: ' + metadata.subject +
    '\n⫹⫺ 𝐃𝐄𝐒𝐂𝐑𝐈𝐙𝐈𝐎𝐍𝐄:\n' + metadata.desc +
    '\n⫹⫺ 𝐅𝐎𝐔𝐍𝐃𝐄𝐑: ' + metadata.owner +
    '\n⫹⫺ 𝐂𝐑𝐄𝐀𝐓𝐎: ' + metadata.creation;
  
  await conn.reply(m.chat, textMessage, m);
};

handler.command = /^(ispeziona)$/i;
handler.rowner = true;

export default handler;

// Funzione per estrarre i metadati del gruppo dalla risposta
const extractGroupMetadata = (response) => {
  const groupNode = baileys.getBinaryNodeChild(response, 'group');
  const descNode = baileys.getBinaryNodeChild(groupNode, 'description');
  
  let description;
  if (descNode) {
    description = baileys.getBinaryNodeChild(descNode, 'body')?.content;
  }
  
  const metadata = {
    id: groupNode.attrs.id.includes('@') 
      ? groupNode.attrs.id 
      : baileys.jidEncode(groupNode.attrs.id, 'g.us'),
    subject: groupNode.attrs.subject,
    creation: new Date(+groupNode.attrs.creation * 1000).toLocaleString('it', { timeZone: 'Europe/Rome' }),
    owner: groupNode.attrs.creator 
      ? 'wa.me/' + baileys.jidNormalizedUser(groupNode.attrs.creator).split('@')[0]
      : groupNode.attrs.id.includes('-') 
        ? 'wa.me/' + groupNode.attrs.id.split('-')[0]
        : '',
    desc: description
  };
  
  return metadata;
};

// Funzione helper per capitalizzare la prima lettera
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}