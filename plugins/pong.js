const handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, { text: '*Pong!* 🏓' }, { quoted: m });
};

handler.help = ['pong'];
handler.tags = ['info'];
handler.command = ['pong'];

export default handler;