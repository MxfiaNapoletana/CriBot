//Plugin migliorato per obbligo
let handler = async (m, { conn }) => {
    const challenge = pickRandom(global.bucin);
    
    await conn.sendMessage(m.chat, { 
        text: `╭━━━━『 🎯 *OBBLIGO* 』━━━━╮
│
│ ${challenge}
│
╰━━━━━━━━━━━━━━━━━╯

⚠️ _Ricorda: è solo un gioco!_`,
        contextInfo: {
            forwardingScore: 99,
            isForwarded: true
        }
    }, { quoted: m });
};

handler.help = ['obbligo'];
handler.tags = ['fun'];
handler.command = /^obbligo/i;
export default handler;

function pickRandom(list) {
    return list[Math.floor(list.length * Math.random())];
}

global.bucin = [
    "Chiama un amico e fingi di essere un operatore di telemarketing che vende 'corsi di seduzione per gatti'",
    "Manda un messaggio vocale cantando 'Despacito' completamente stonato al tuo ultimo contatto",
    "Cambia la tua bio WhatsApp in 'Cerco qualcuno che mi insegni a fare il moonwalk' per 24 ore",
    "Scrivi 'Ti amo' a 3 contatti casuali e aspetta le risposte senza spiegare nulla per 10 minuti",
    "Fai finta di essere allergico al WiFi e spiega scientificamente il perché a qualcuno per 2 minuti",
    "Manda un selfie con 5 cucchiai attaccati al viso a un gruppo a caso",
    "Chiama qualcuno e parla solo in rima per tutta la conversazione",
    "Scrivi una recensione su Google Maps di un posto a caso dando 1 stella perché 'non accettano pagamenti in noccioline'",
    "Registra un video di te che reciti la tabellina del 7 come se fossi un rapper e mandalo nel gruppo famiglia",
    "Metti come stato WhatsApp 'Ho deciso: divento un influencer di scope. #BroomLife' e tienilo per 6 ore",
    "Scrivi a un vecchio compagno di scuola 'Ricordi quando mi hai rubato la merenda nel 2008? Voglio vendetta'",
    "Fingi di intervistare il tuo animale domestico (o una pianta) e posta il video su una storia",
    "Manda un audio dove racconti una barzelletta inventata sul momento che non ha senso",
    "Cambia il nome di un contatto in 'Mio Nemico Giurato' e mandagli 'Questa guerra non è finita'",
    "Pubblica una storia con te che balli una danza tribale inventata indossando un asciugamano come mantello",
    "Scrivi 'Ho un segreto da confessarti...' a 5 persone e quando rispondono manda solo '🦆'",
    "Fai un sondaggio Instagram chiedendo 'Meglio 100 paperelle di gomma o 1 cavallo gigante?' e prendi sul serio i risultati",
    "Manda un messaggio a qualcuno dicendo 'Sto arrivando' anche se non avete appuntamento e aspetta la confusione",
    "Registra un tutorial su come fare qualcosa di inutile (tipo 'come annodare i lacci in 47 modi diversi') e condividilo",
    "Scrivi a un gruppo 'URGENTE: Ho dimenticato come si respira, consigli?' e aspetta le risposte serie",
    "Fai finta di essere un ghost hunter e manda audio dove 'investighi' i rumori del tuo frigo",
    "Cambia la foto profilo con un disegno fatto malissimo di te stesso in MS Paint per 48 ore",
    "Manda 'Dobbiamo parlare' a 3 persone e quando rispondono preoccupate, chiedi solo 'Hai mai pensato al senso della vita?'",
    "Crea un account TikTok dedicato solo a video di te che apri porte in modi drammatici",
    "Scrivi una poesia d'amore dedicata alla pizza e mandala a un ristorante su Instagram",
    "Fai un video dove spieghi una teoria del complotto inventata (tipo 'le banane sono in realtà microfoni')",
    "Metti like a ogni singola foto (anche quelle vecchissime) di una persona random che segui",
    "Chiama qualcuno e fingi di averlo chiamato per sbaglio, ma continua la conversazione come se vi conosceste da sempre",
    "Registra un video ASMR dove sussurri ricette di cucina in modo inquietante",
    "Scrivi nel gruppo famiglia 'Ho visto il futuro in sogno' e inventa una profezia assurda",
    "Manda 'SPOILER ALERT' seguito da una frase completamente priva di senso a qualcuno che sta guardando una serie",
    "Fingi di essere un critico gastronomico e recensisci dettagliatamente l'ultimo snack che hai mangiato su una storia",
    "Cambia la suoneria del telefono con la tua voce che urla 'QUALCUNO MI STAAAA CHIAMANDOOO' e fai squillare in pubblico",
    "Scrivi 'Gioco di ruolo: tu sei un pirata, io sono un delfino. Iniziamo' a un contatto casuale",
    "Crea un curriculum falso dove elenchi skill assurde tipo 'Esperto nel parlare con i piccioni' e mandalo a un amico",
    "Fai una diretta Instagram dove leggi i termini e condizioni di un'app a voce alta con enfasi drammatica",
    "Manda a qualcuno 'Ho una confessione da fare' e quando rispondono di 'sono allergico alla Domenica'",
    "Registrati mentre fai un 'tutorial di makeup' usando solo evidenziatori e pennarelli",
    "Scrivi su un gruppo 'Mi hanno rapito gli alieni ma hanno pessimo WiFi' e non rispondere per 30 minuti",
    "Cambia tutti i nomi dei contatti in nomi di dinosauri per una giornata e usali normalmente nelle conversazioni",
    "Fai un video dove intervisti te stesso su temi profondi e rispondi cambiando voce",
    "Manda 'Scusa per quello che è successo' a qualcuno con cui non hai mai avuto problemi e non spiegare mai",
    "Pubblica una recensione entusiasta di un posto mai visitato inventando dettagli assurdi",
    "Registra un audiolibro di 30 secondi leggendo istruzioni IKEA come se fosse Shakespeare",
    "Crea una petizione online per cambiare il nome di una via nella tua città in 'Via del Formaggio Volante'",
    "Metti una foto pixelata come profilo e quando qualcuno chiede, rispondi 'È arte contemporanea, non capiresti'",
    "Fingi di vendere aria in bottiglia nei messaggi privati con tanto di descrizione prodotto dettagliata",
    "Scrivi una fanfiction su due oggetti della tua cucina che si innamorano e mandala a qualcuno",
    "Fai un video dove spieghi una teoria matematica inventata usando solo frutta come esempio",
    "Manda 'Ho bisogno del tuo aiuto ADESSO' e quando rispondono chiedi quale emoji rappresenta meglio il Martedì"
];

global.sfidaTroll = global.bucin; // Usa la stessa lista