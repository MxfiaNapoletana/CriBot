let handler = async (m, { isROwner }) => {
  if (!isROwner) throw '⚠️ Solo il proprietario può usare questo comando.';

  if (!global.db.data.settings) global.db.data.settings = {};
  global.db.data.settings.sleepMode = true;

  if (typeof global.db.write === 'function') await global.db.write();

  await m.reply('💤 Modalità sleep attivata. Il bot non risponderà ai comandi finché non eseguirai .accendibot');
};

handler.help = ['spegnibot'];
handler.tags = ['owner'];
handler.command = ['spegnibot'];
handler.rowner = true;

export default handler;
