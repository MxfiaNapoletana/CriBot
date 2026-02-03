//Plugin fatto da Gabs333 x Staff ChatUnity
import fetch from "node-fetch";
import yts from 'yt-search';
import fs from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const MAX_DURATION = 600;
const activeDownloads = new Map(); // Previene download multipli simultanei

async function downloadAudio(videoUrl) {
  const apis = [
    async () => {
      const res = await fetch(`https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(videoUrl)}`);
      const data = await res.json();
      if (data.status === 200 && data.data?.download) {
        return data.data.download;
      }
      throw new Error('Agatz failed');
    },
    async () => {
      const res = await fetch(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`);
      const data = await res.json();
      if (data.url) {
        return data.url;
      }
      throw new Error('Ryzendesu failed');
    },
    async () => {
      const res = await fetch(`https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`);
      const data = await res.json();
      if (data.data?.download_url) {
        return data.data.download_url;
      }
      throw new Error('Yupra failed');
    }
  ];

  let lastError;
  for (const api of apis) {
    try {
      const url = await api();
      if (url) {
        console.log('✅ URL ottenuto:', url);
        return url;
      }
    } catch (e) {
      lastError = e;
      console.log('❌ API fallita:', e.message);
    }
  }

  throw new Error(lastError?.message || 'Nessuna API disponibile');
}

async function downloadVideo(videoUrl) {
  const apis = [
    async () => {
      const res = await fetch(`https://api.agatz.xyz/api/ytmp4?url=${encodeURIComponent(videoUrl)}`);
      const data = await res.json();
      if (data.status === 200 && data.data?.download) {
        return data.data.download;
      }
      throw new Error('Agatz failed');
    },
    async () => {
      const res = await fetch(`https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(videoUrl)}`);
      const data = await res.json();
      if (data.url) {
        return data.url;
      }
      throw new Error('Ryzendesu failed');
    },
    async () => {
      const res = await fetch(`https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(videoUrl)}`);
      const data = await res.json();
      if (data.data?.download_url) {
        return data.data.download_url;
      }
      throw new Error('Yupra failed');
    }
  ];

  let lastError;
  for (const api of apis) {
    try {
      const url = await api();
      if (url) {
        console.log('✅ URL video ottenuto:', url);
        return url;
      }
    } catch (e) {
      lastError = e;
      console.log('❌ API fallita:', e.message);
    }
  }

  throw new Error(lastError?.message || 'Nessuna API disponibile');
}

async function downloadAndSaveFile(url, filename) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
  
  const buffer = await response.buffer();
  const filepath = join(tmpdir(), filename);
  
  fs.writeFileSync(filepath, buffer);
  console.log('✅ File salvato:', filepath);
  
  return filepath;
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    // === CONTROLLO ANTI-SPAM PER UTENTE ===
    const userId = m.sender;
    const downloadKey = `${userId}-${command}`;
    
    if (activeDownloads.has(downloadKey)) {
      return m.reply('⏳ Hai già un download in corso, attendi che finisca!');
    }
    
    if (!text?.trim()) {
      return m.reply(`
╭﹕₊˚ ★ ⁺˳ꕤ₊⁺・꒱
  ━━✫ ❗ Inserisci un titolo
  
  📝 Esempio:
  ${usedPrefix + command} Blinding Lights
╰﹕₊˚ ★ ⁺˳ꕤ₊⁺・꒱
`);
    }

    // COMANDO: playaudio
    if (command === 'playaudio') {
      let videoUrl = text;
      let video;

      if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
        const search = await yts(text);
        if (!search?.all?.length) {
          return m.reply('❌ Nessun risultato trovato');
        }
        video = search.all[0];
        videoUrl = video.url;
      } else {
        const videoId = videoUrl.includes('v=') ? videoUrl.split('v=')[1].split('&')[0] : videoUrl.split('/').pop();
        const search = await yts({ videoId });
        video = search;
      }

      if (video.seconds && video.seconds > MAX_DURATION) {
        return m.reply(`⚠️ Video troppo lungo! Max 10 minuti, durata: ${video.timestamp}`);
      }

      // Imposta download attivo
      activeDownloads.set(downloadKey, true);
      
      await m.reply(`🎵 Scarico: *${video.title}*\n⏳ Attendere...`);

      let filepath;
      try {
        const downloadUrl = await downloadAudio(videoUrl);
        
        const filename = `audio_${Date.now()}.mp3`;
        filepath = await downloadAndSaveFile(downloadUrl, filename);
        
        await conn.sendMessage(m.chat, {
          audio: fs.readFileSync(filepath),
          mimetype: 'audio/mpeg',
          fileName: `${video.title}.mp3`
        }, { quoted: m });

        console.log('✅ Audio inviato per:', userId);
        
        fs.unlinkSync(filepath);

      } catch (e) {
        console.error('❌ Errore:', e);
        if (filepath && fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        return m.reply(`❌ Errore: ${e.message}`);
      } finally {
        // Rimuovi download attivo
        activeDownloads.delete(downloadKey);
      }
      return;
    }

    // COMANDO: playvideo
    if (command === 'playvideo') {
      let videoUrl = text;
      let video;

      if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
        const search = await yts(text);
        if (!search?.all?.length) {
          return m.reply('❌ Nessun risultato trovato');
        }
        video = search.all[0];
        videoUrl = video.url;
      } else {
        const videoId = videoUrl.includes('v=') ? videoUrl.split('v=')[1].split('&')[0] : videoUrl.split('/').pop();
        const search = await yts({ videoId });
        video = search;
      }

      if (video.seconds && video.seconds > MAX_DURATION) {
        return m.reply(`⚠️ Video troppo lungo! Max 10 minuti, durata: ${video.timestamp}`);
      }

      // Imposta download attivo
      activeDownloads.set(downloadKey, true);
      
      await m.reply(`🎬 Scarico: *${video.title}*\n⏳ Attendere...`);

      let filepath;
      try {
        const downloadUrl = await downloadVideo(videoUrl);
        
        const filename = `video_${Date.now()}.mp4`;
        filepath = await downloadAndSaveFile(downloadUrl, filename);

        await conn.sendMessage(m.chat, {
          video: fs.readFileSync(filepath),
          mimetype: 'video/mp4',
          caption: `✅ *${video.title}*\n\n🎤 ${video.author?.name || 'YouTube'}\n⏱️ ${video.timestamp}\n🔗 ${video.url}`,
        }, { quoted: m });

        console.log('✅ Video inviato per:', userId);
        
        fs.unlinkSync(filepath);

      } catch (e) {
        console.error('❌ Errore:', e);
        if (filepath && fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        return m.reply(`❌ Errore: ${e.message}`);
      } finally {
        // Rimuovi download attivo
        activeDownloads.delete(downloadKey);
      }
      return;
    }

    // COMANDO: play
    if (command === 'play') {
      const search = await yts(text);
      if (!search?.all?.length) {
        return m.reply('❌ Nessun risultato trovato');
      }

      const video = search.all[0];
      
      if (video.seconds > MAX_DURATION) {
        return m.reply(`
╭★────★────★────★────★────★
|  ⚠️ VIDEO TROPPO LUNGO
|
|  ⏳ Massimo: 10 minuti
|  ⌛ Durata: ${video.timestamp}
╰★────★────★────★────★────★
`);
      }

      const views = new Intl.NumberFormat('it-IT').format(video.views);
      
      const infoText = `
⋆ ︵︵ ★ 🎥 INFO VIDEO 🎥 ★ ︵︵ ⋆

✍️ Titolo: ${video.title}
⏳ Durata: ${video.timestamp}
👀 Visualizzazioni: ${views}
🔰 Canale: ${video.author.name}
🔳 Pubblicato: ${video.ago}
🔗 Link: ${video.url}

╰♡꒷ Clicca per scaricare ⪩
`;

      await conn.sendMessage(m.chat, {
        text: infoText,
        footer: 'Powered by ChatUnity',
        buttons: [
          { 
            buttonId: `${usedPrefix}playaudio ${video.url}`,
            buttonText: { displayText: '🎵 Audio' }, 
            type: 1 
          },
          { 
            buttonId: `${usedPrefix}playvideo ${video.url}`,
            buttonText: { displayText: '🎬 Video' }, 
            type: 1 
          }
        ],
        headerType: 4,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: video.author.name,
            thumbnailUrl: video.thumbnail,
            sourceUrl: video.url,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });
      
      return;
    }

  } catch (error) {
    console.error('❌ Errore handler:', error);
    return m.reply(`❌ Errore: ${error.message}`);
  }
};

handler.command = ['play', 'playaudio', 'playvideo'];
handler.help = ['play', 'playaudio', 'playvideo'];
handler.tags = ['downloader'];

export default handler;