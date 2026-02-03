// Plugin per trascrivere messaggi vocali usando Groq (Whisper)
import fetch from 'node-fetch';
import FormData from 'form-data';

// API Key di Groq
const GROQ_API_KEY = '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';

// Funzione per trascrivere con Groq Whisper
async function transcribeWithGroq(audioBuffer, filename = 'audio.ogg') {
  const formData = new FormData();
  formData.append('file', audioBuffer, {
    filename: filename,
    contentType: 'audio/ogg'
  });
  formData.append('model', 'whisper-large-v3-turbo'); // Modello velocissimo
  formData.append('language', 'it'); // Italiano
  formData.append('response_format', 'json');
  formData.append('temperature', '0'); // Più accurato
  
  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      ...formData.getHeaders()
    },
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `Errore API: ${response.status}`);
  }
  
  const data = await response.json();
  return data.text || 'Nessuna trascrizione disponibile';
}

let handler = async (m, { conn, command }) => {
  try {
    // Verifica che sia un messaggio audio/vocale
    let q = m.quoted ? m.quoted : m;
    let mime = q.mimetype || q.msg?.mimetype || '';
    
    if (!/audio|voice/.test(mime)) {
      return m.reply(
        '❌ *Rispondi a un messaggio vocale!*\n\n' +
        '📌 *Uso:* Rispondi a un vocale con il comando\n' +
        '📝 *Esempio:* Rispondi al vocale e scrivi *trascrivi*'
      );
    }
    
    await m.reply('🎤 *Trascrizione in corso...*\n⚡ Groq Whisper sta lavorando...');
    
    // Scarica l'audio
    let buffer = await q.download();
    
    if (!buffer) {
      return m.reply('❌ Impossibile scaricare l\'audio. Riprova!');
    }
    
    // Determina il filename corretto in base al mimetype
    let filename = 'audio.ogg';
    if (mime.includes('mp4')) filename = 'audio.mp4';
    else if (mime.includes('mpeg')) filename = 'audio.mp3';
    else if (mime.includes('wav')) filename = 'audio.wav';
    
    // Trascrivi con Groq
    const startTime = Date.now();
    const transcription = await transcribeWithGroq(buffer, filename);
    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);
    
    if (!transcription || transcription.trim() === '') {
      return m.reply('❌ Nessun testo rilevato nel messaggio vocale.');
    }
    
    // Invia la trascrizione
    await m.reply(
      `📝 *TRASCRIZIONE*\n\n` +
      `${transcription}\n\n` +
      `━━━━━━━━━━━━━━━\n` +
      `⚡ Groq Whisper v3 Turbo\n` +
      `⏱️ Tempo: ${processingTime}s\n` +
      `🎵 Durata: ${q.seconds || '?'}s`
    );
    
  } catch (error) {
    console.error('Errore trascrizione:', error);
    
    let errorMessage = '❌ *Errore durante la trascrizione*\n\n';
    
    if (error.message.includes('rate_limit')) {
      errorMessage += '⏰ Troppi vocali! Attendi un momento e riprova.\n';
    } else if (error.message.includes('invalid_api_key')) {
      errorMessage += '🔑 API Key non valida.\n';
    } else if (error.message.includes('audio')) {
      errorMessage += '🔇 Formato audio non supportato o danneggiato.\n';
    } else {
      errorMessage += '🔧 Errore tecnico del servizio.\n';
    }
    
    errorMessage += `\n📋 *Dettagli:* ${error.message}`;
    
    await m.reply(errorMessage);
  }
};

// Comandi per attivare il plugin
handler.command = /^(trascrivi|transcribe|totext|vocale|audio2text)$/i;
handler.help = ['trascrivi'];
handler.tags = ['tools'];
handler.description = 'Trascrivi un messaggio vocale in testo';

export default handler;