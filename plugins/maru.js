let handler = async (m, { conn }) => {
    const message = `
Maru, la vera Babba Natale

In Toscana vive Maru, una ragazza di 16 anni con origini marocchine. Un giorno trova un vecchio mantello rosso nascosto nel fienile della nonna. Appena lo indossa, il mantello si illumina e una piccola renna compare dal nulla.

Maru scopre così di essere la nuova Babba Natale, scelta per portare gioia nel mondo. Non ha una slitta, ma una vespa rossa volante con cui viaggia sopra città e paesi, lasciando sorrisi e speranza in ogni luogo.

E ogni Natale, quando tutti cercano Babbo Natale nel cielo… in realtà vedono lei:
Maru, la Babba Natale toscana. 🎄✨
`.trim();

    await conn.sendMessage(m.chat, { text: message });
};

handler.command = /^(maru)$/i;

export default handler;
