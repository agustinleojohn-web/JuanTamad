import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));

// Gemini AI Client setup
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Gemini OCR API route
app.post('/api/ocr-pdf', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png', prompt = 'Perform Optical Character Recognition (OCR) on this document page. Transcribe all text accurately, preserve structure, tables, and headings in clean Markdown format.' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 data in request body' });
    }

    if (!process.env.GEMINI_API_KEY || !aiClient) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please ensure GEMINI_API_KEY is available.',
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    const text = response.text || '';
    return res.json({ text });
  } catch (err: any) {
    console.error('OCR Error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to perform OCR via Gemini AI',
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JuanTamad full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
