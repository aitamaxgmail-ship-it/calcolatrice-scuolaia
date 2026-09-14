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
    summary: `Sei il lettore intelligente di una app scolastica italiana. Analizza l'immagine allegata, che può contenere testo stampato, scrittura manuale, schemi o infografiche. Trascrivi solo ciò che è realmente leggibile, mantenendo l'ordine logico. Correggi gli errori evidenti dell'OCR senza inventare contenuti. Poi crea un riassunto chiaro e una mappa concettuale con 3 o 4 grandi linee. Se una parola è dubbia, inseriscila in warnings invece di indovinarla.`,
    transcribe: `Leggi l'immagine allegata per una app scolastica italiana. Trascrivi il testo stampato o scritto a mano nel modo più fedele possibile, mantenendo formule, numeri e ordine delle righe. Non inventare le parti illeggibili: segnala i dubbi in warnings.`,
    exercise: `Leggi l'immagine allegata per una app scolastica italiana. Trascrivi il problema o l'esercizio, riconosci materia e dati, e prepara una breve spiegazione dei passaggi. Se una parte non è leggibile, segnalala in warnings e non inventarla.`
  };

  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      transcription: { type: 'string' },
      summary: { type: 'string' },
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
      warnings: { type: 'array', items: { type: 'string' } },
      confidence: { type: 'string' }
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
