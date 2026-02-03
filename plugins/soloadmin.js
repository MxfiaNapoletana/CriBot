export async function before(m, { conn, isAdmin, isBotAdmin }) {
  // Ignora messaggi che non sono da gruppi
  if (!m.isGroup) return true;
  
  // Ignora se il messaggio non contiene un comando
  if (!m.text || !m.text.startsWith('.')) return true;
  
  // Ottieni i dati della chat
  const chatData = global.db?.data?.chats?.[m.chat];
  
  // Se soloadmin non è attivo, lascia passare
  if (!chatData?.soloadmin) return true;
  
  // Se l'utente è admin, lascia passare
  if (isAdmin) return true;
  
  // Se l'utente non è admin e soloadmin è attivo, blocca il comando
  // Non risponde, semplicemente ignora
  return false;
}

export const disabled = false;