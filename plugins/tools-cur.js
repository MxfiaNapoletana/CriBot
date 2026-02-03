import fs from 'fs';
import path from 'path';

// File utenti Last.fm
const DATA_DIR = './data';
const USERS_FILE = path.join(DATA_DIR, 'lastfm_users.json');

// Carica utenti salvati
let lastfmUsers = {};
try {
  if (fs.existsSync(USERS_FILE)) {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    lastfmUsers = JSON.parse(raw || '{}');
  }
} catch (e) {
  console.log('⚠️ Errore caricamento utenti Last.fm', e);
}

// Funzione per salvare gli utenti
function saveUsers() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(lastfmUsers, null, 2));
  } catch (e) {
    console.log('⚠️ Errore salvataggio utenti Last.fm', e);
  }
}

// API Keys
const LASTFM_API_KEY = '9d318a941610a02a535825a7e463727f';

// Funzione per ottenere statistiche dalla API di Last.fm
async function getTrackStats(artist, track) {
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log('⚠️ Errore stats Last.fm:', response.status);
      return { playcount: 0, listeners: 0 };
    }
    
    const data = await response.json();
    
    if (data.track) {
      return {
        playcount: parseInt(data.track.playcount) || 0,
        listeners: parseInt(data.track.listeners) || 0
      };
    }
  } catch (e) {
    console.log('⚠️ Errore recupero statistiche:', e);
  }
  return { playcount: 0, listeners: 0 };
}

// Funzione per formattare i numeri
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace('.0', '') + 'K';
  }
  return num.toString();
}

const handler = async (m, { conn, text = '', usedPrefix, command }) => {
  try {
    const sender = m.sender.split('@')[0];
    const senderJid = m.sender; // JID completo per le mention

    // Se l'utente fornisce un username, salvalo
    if (text && text.trim()) {
      const username = text.trim();
      lastfmUsers[sender] = username;
      saveUsers();

      await conn.sendMessage(m.chat, {
        text: `✅ Account Last.fm collegato!
👤 Username: ${username}

Usa ${usedPrefix}cur per vedere cosa stai ascoltando`
      }, { quoted: m });
      return;
    }

    // Controlla se l'utente ha registrato il suo account Last.fm
    if (!lastfmUsers[sender]) {
      await conn.sendMessage(m.chat, {
        text: `❗ Account Last.fm non collegato

Per collegare il tuo account:
${usedPrefix}cur <username>

Esempio: ${usedPrefix}cur tuo_username

ℹ️ Devi avere un account Last.fm collegato a Spotify/Apple Music`
      }, { quoted: m });
      return;
    }

    const username = lastfmUsers[sender];

    // Chiamata API Last.fm per ottenere la canzone corrente
    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;

    console.log('🔍 Richiesta Last.fm per:', username);
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Bot/1.0'
      }
    });

    const responseText = await response.text();
    console.log('📥 Risposta Last.fm:', responseText.substring(0, 200));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Errore parsing JSON:', parseError);
      throw new Error('Risposta non valida da Last.fm. Riprova tra qualche secondo.');
    }

    if (data.error) {
      if (data.error === 6) {
        throw new Error(`Utente "${username}" non trovato su Last.fm. Verifica l'username.`);
      }
      throw new Error(data.message || 'Errore API Last.fm');
    }

    if (!response.ok) {
      throw new Error(`Servizio Last.fm temporaneamente non disponibile (${response.status}). Riprova tra qualche minuto.`);
    }

    const tracks = data.recenttracks?.track;
    if (!tracks || tracks.length === 0) {
      await conn.sendMessage(m.chat, {
        text: `🎵 Nessuna traccia trovata

👤 @${sender}

Inizia ad ascoltare musica su Spotify/Apple Music collegato a Last.fm!`,
        mentions: [senderJid]
      }, { quoted: m });
      return;
    }

    const track = Array.isArray(tracks) ? tracks[0] : tracks;
    const isNowPlaying = track['@attr']?.nowplaying === 'true';

    const trackName = track.name;
    const artistName = track.artist?.['#text'] || track.artist || 'Sconosciuto';
    const albumName = track.album?.['#text'] || 'Sconosciuto';
    const trackUrl = track.url;

    // Ottieni statistiche del brano (con timeout)
    let stats = { playcount: 0, listeners: 0 };
    try {
      const statsPromise = getTrackStats(artistName, trackName);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 3000)
      );
      stats = await Promise.race([statsPromise, timeoutPromise]);
    } catch (e) {
      console.log('⚠️ Statistiche non disponibili:', e.message);
    }

    // Calcola tempo trascorso se non sta ascoltando ora
    let timeAgo = '';
    if (!isNowPlaying && track.date?.uts) {
      const timestamp = parseInt(track.date.uts, 10) * 1000;
      const now = Date.now();
      const diff = now - timestamp;

      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        timeAgo = `${days} giorno${days > 1 ? 'i' : ''} fa`;
      } else if (hours > 0) {
        timeAgo = `${hours} ora${hours > 1 ? 'e' : ''} fa`;
      } else if (minutes > 0) {
        timeAgo = `${minutes} minuto${minutes > 1 ? 'i' : ''} fa`;
      } else {
        timeAgo = `${seconds} secondo${seconds > 1 ? 'i' : ''} fa`;
      }
    }

    let statusEmoji = isNowPlaying ? '🎧' : '🎵';
    let statusText = isNowPlaying ? 'In riproduzione' : 'Ultima canzone';

    const message = `${statusEmoji} ${statusText} • @${sender}

🎤 *${trackName}*
🎸 ${artistName}
💿 ${albumName}

📊 ${formatNumber(stats.playcount)} play • 🔄 ${formatNumber(stats.listeners)} totali •
🌍 ${formatNumber(Math.floor(stats.listeners * 0.085))} ascoltatori • 🔥 0${!isNowPlaying && timeAgo ? `

⏰ Ascoltato ${timeAgo}` : ''}`;

    // Prepara i bottoni nel formato corretto
    const buttons = [
      { 
        buttonId: `${usedPrefix}play ${trackName} ${artistName}`, 
        buttonText: { displayText: "↩️ ⬇️ Scarica canzone" }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}testo ${trackName} ${artistName}`, 
        buttonText: { displayText: "↩️ 📝 Mostra testo" }, 
        type: 1 
      }
    ];

    // Invia messaggio con bottoni e mention WhatsApp
    await conn.sendMessage(m.chat, {
      text: message,
      footer: 'Last.fm',
      buttons: buttons,
      headerType: 1,
      mentions: [senderJid] // Aggiungi la mention WhatsApp
    }, { quoted: m });

  } catch (error) {
    console.error('❌ Errore Last.fm:', error);
    await conn.sendMessage(m.chat, {
      text: `❌ ERRORE LAST.FM

${error.message}

Verifica che:
- L'username Last.fm sia corretto
- Il profilo sia pubblico
- Spotify sia collegato a Last.fm
- Stai ascoltando musica

Se il problema persiste, Last.fm potrebbe avere problemi temporanei. Riprova tra qualche minuto.`
    }, { quoted: m });
  }
};

handler.command = handler.help = ['cur', 'np', 'nowplaying', 'lastfm'];
handler.tags = ['music'];

export default handler;