import axios from 'axios';

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('✧ Inserisci il nome della canzone nel formato:\n*artista - titolo* oppure *artista titolo*');
  
  try {
    const searchText = text.trim().replace(/\s+/g, ' ');
    let artist = '', title = '';
    
    if (searchText.includes('-')) {
      [artist, title] = searchText.split('-').map(s => s.trim());
    } else {
      const lastSpaceIndex = searchText.lastIndexOf(' ');
      if (lastSpaceIndex === -1) return m.reply('✧ Formato non valido. Usa:\n*artista - titolo* oppure *artista titolo*');
      artist = searchText.substring(0, lastSpaceIndex).trim();
      title = searchText.substring(lastSpaceIndex + 1).trim();
    }
    
    // Funzione per richiedere i testi
    const fetchLyrics = async (art, tit) => {
      const apiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(art)}/${encodeURIComponent(tit)}`;
      const { data } = await axios.get(apiUrl, { timeout: 10000 });
      if (!data || !data.lyrics) throw new Error('Testo non trovato');
      return data.lyrics.trim();
    };
    
    let lyrics = '';
    
    // Prova prima con artista - titolo
    try {
      lyrics = await fetchLyrics(artist, title);
    } catch (firstError) {
      // Se fallisce, prova invertendo (titolo - artista)
      try {
        lyrics = await fetchLyrics(title, artist);
      } catch (secondError) {
        throw new Error('Testo non trovato con nessuna combinazione');
      }
    }
    
    // Invia il testo a pezzi se troppo lungo
    const maxLength = 2000;
    if (lyrics.length > maxLength) {
      for (let i = 0; i < lyrics.length; i += maxLength) {
        const chunk = lyrics.substring(i, i + maxLength);
        await conn.sendMessage(m.chat, { text: chunk }, { quoted: m });
        await new Promise(resolve => setTimeout(resolve, 350));
      }
    } else {
      await conn.sendMessage(m.chat, { text: lyrics }, { quoted: m });
    }
    
  } catch (error) {
    console.error('Errore lyrics.ovh:', error?.message || error);
    m.reply('✧ Testo non trovato. Controlla ortografia o prova un altro artista/canzone.');
  }
};

handler.help = ['lyrics <artista> - <titolo>'];
handler.tags = ['music'];
handler.command = ['lyrics', 'testo', 'parole'];
handler.examples = [
  'lyrics Geolier - 081',
  'lyrics 081 - Geolier',
  'testo Eminem Lose Yourself',
  'parole Queen Bohemian Rhapsody'
];

export default handler;