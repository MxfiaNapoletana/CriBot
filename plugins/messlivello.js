//Plugin fatto da Gabs333 x Staff ChatUnity
// ==========================================
// FILE: plugins/level-system-handler.js
// Gestione automatica exp e notifiche level-up
// ==========================================

import { promises as fs } from 'fs';

/**
 * Calcola l'exp necessaria per un determinato livello
 * Formula ottimizzata: progressione bilanciata
 * Livello 1→2: 2000 exp (400 messaggi)
 * Livello 2→3: 4000 exp (800 messaggi)
 * Livello 3→4: 6000 exp (1200 messaggi)
 * NOTA: Ogni messaggio dà 5 EXP istantaneamente (no cooldown)
 */
function expPerLivello(livello) {
  return 2000 * livello;
}

/**
 * Calcola il livello attuale in base all'exp
 */
function calcolaLivello(exp) {
  let livello = 1;
  while (exp >= expPerLivello(livello)) {
    livello++;
  }
  return livello - 1;
}

// ==========================================
// AGGIORNAMENTO AUTOMATICO (before)
// ==========================================
export async function before(m) {
  // Ignora messaggi del bot stesso e messaggi di sistema
  if (!m.sender || m.fromMe || !m.isGroup) return true;
  
  let user = global.db.data.users[m.sender];
  if (!user) return true;
  
  const expGuadagnata = 5;
  
  // Inizializza campi se non esistono
  if (!user.exp) user.exp = 0;
  if (!user.messaggi) user.messaggi = 0;
  if (!user.money) user.money = 0;
  
  // Sempre incrementa i messaggi
  user.messaggi += 1;
  
  // CALCOLA IL LIVELLO PRIMA di aggiungere exp
  const livelloPrecedente = calcolaLivello(user.exp);
  
  // Aggiungi exp ad ogni messaggio
  user.exp += expGuadagnata;
  
  // CALCOLA IL LIVELLO DOPO aver aggiunto exp
  const livelloAttuale = calcolaLivello(user.exp);
  

  
  // Notifica se è salito di livello
  if (livelloAttuale > livelloPrecedente) {
    // Ricompensa progressiva (più livello = più soldi)
    const ricompensa = 500 + (livelloAttuale * 100);
    user.money += ricompensa;
    
    const testo = `Complimenti @${m.sender.split('@')[0]}!\nHai scritto *${user.messaggi}* messaggi e hai raggiunto il livello *${livelloAttuale}*`;
    
    try {
      // Ottieni la foto profilo dell'utente
      let ppUser;
      try {
        ppUser = await this.profilePictureUrl(m.sender, 'image');
      } catch {
        // Se non ha foto profilo, usa l'immagine di default
        ppUser = 'https://i.imgur.com/AfFGxkr.jpg';
      }
      
      await this.sendMessage(m.chat, {
        text: testo,
        contextInfo: {
          mentionedJid: [m.sender],
          externalAdReply: {
            title: '𝐍𝐮𝐨𝐯𝐨 𝐥𝐢𝐯𝐞𝐥𝐥𝐨 🎉',
            thumbnailUrl: ppUser,
          },
        },
      }, { quoted: null });
      
    } catch (error) {
      
      // Fallback senza thumbnail
      try {
        await this.sendMessage(m.chat, {
          text: testo,
          mentions: [m.sender]
        });
      } catch (e) {
      }
    }
  }
  
  return true;
}