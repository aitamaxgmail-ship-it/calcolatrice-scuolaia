import { GoogleGenAI } from '@google/genai';

export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' }
  }
};

function cleanJson(text) {
  return String(text || '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY non configurata' });

  const { imageData, mimeType = 'image/jpeg', mode = 'summary' } = req.body || {};
  if (!imageData || typeof imageData !== 'string') return res.status(400).json({ error: 'Immagine mancante' });
  if (imageData.length > 9_000_000) return res.status(413).json({ error: 'Immagine troppo grande' });

  const prompts = {
    summary: `Sei il lettore intelligente di una app scolastica italiana. Analizza l'immagine allegata, che può contenere testo stampato, scrittura manuale, schemi o infografiche.
TRASCRIZIONE: riporta in transcription solo ciò che è realmente leggibile, mantenendo l'ordine logico e senza inventare.
RIASSUNTO: il campo summary deve essere un vero riassunto autonomo, NON una copia della trascrizione: scrivi 3 o 4 frasi brevi, massimo 90 parole, spiegando di cosa parla la pagina, quali sono le 2 o 3 informazioni o azioni essenziali e cosa bisogna ricordare. Per lettere o avvisi indica motivo, richiesta principale, eventuale scadenza e canali utili, ma ometti indirizzi personali, codici e dettagli ripetitivi non necessari.
CONCETTI: crea 3 o 4 concetti principali sensati, ciascuno con un titolo di 1-4 parole e una descrizione breve che spieghi il ruolo del concetto nel testo. Se una parola è dubbia, inseriscila in warnings invece di indovinarla.`,
    transcribe: `Leggi l'immagine allegata per una app scolastica italiana. Trascrivi il testo stampato o scritto a mano nel modo più fedele possibile, mantenendo formule, numeri e ordine delle righe. Non inventare le parti illeggibili: segnala i dubbi in warnings.`,
    exercise: `Leggi l'immagine allegata per una app scolastica italiana. Trascrivi il problema o l'esercizio, riconosci materia e dati, e prepara una breve spiegazione dei passaggi. Se una parte non è leggibile, segnalala in warnings e non inventarla.`
  };

  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Titolo breve e descrittivo della pagina, massimo 8 parole.' },
      transcription: { type: 'string' },
      summary: { type: 'string', description: 'Riassunto concreto e autonomo, 3 o 4 frasi, massimo 90 parole; non ripetere la trascrizione.' },
      concepts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' }
          },
          required: ['title', 'description']
        }
      },
      warnings: { type: 'array', items: { type: 'string' }, description: 'Parole o parti dell’immagine dubbie e da verificare.' },
      confidence: { type: 'string', description: 'Affidabilità complessiva: alta, media o bassa, con eventuale breve motivazione.' }
    },
    required: ['title', 'transcription', 'summary', 'concepts', 'warnings', 'confidence']
  };

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: [
        { inlineData: { mimeType, data: imageData } },
        { text: `${prompts[mode] || prompts.summary}\n\nRestituisci esclusivamente JSON valido con questa struttura.` }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.1
      }
    });
    const data = JSON.parse(cleanJson(response.text));
    return res.status(200).json(data);
  } catch (error) {
    console.error('Gemini error:', error);
    return res.status(502).json({ error: 'Gemini non ha potuto leggere questa immagine' });
  }
}
