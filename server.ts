import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));

// Serve public assets (PWA icons, manifest, sw)
app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/manifest.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.sendFile(path.resolve(__dirname, 'public', 'manifest.json'));
});

app.get('/sw.js', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.resolve(__dirname, 'public', 'sw.js'));
});

// Quick Ping test endpoint
app.get('/api/ping', (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: Date.now(), service: 'NovelCraft Engine' });
});

// Download full project source zip
app.get('/api/download-zip', (_req: Request, res: Response) => {
  const zipFile = path.resolve(__dirname, 'public', 'novelcraft-studio-source.zip');
  res.download(zipFile, 'NovelCraft-Studio-Source.zip');
});

// Proxy API: forwards any user request through Node.js to bypass CORS
app.post('/api/proxy', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  try {
    const { url, method = 'GET', headers = {}, params = {}, body = null } = req.body;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL không hợp lệ hoặc bị thiếu.' });
      return;
    }

    // Build URL with query params
    const targetUrl = new URL(url);
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          targetUrl.searchParams.append(key, String(val));
        }
      });
    }

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': 'NovelCraft-Engine/1.0',
    };

    if (headers && typeof headers === 'object') {
      Object.entries(headers).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          requestHeaders[k] = String(v);
        }
      });
    }

    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: requestHeaders,
    };

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase()) && body !== null && body !== undefined) {
      if (typeof body === 'object') {
        if (!requestHeaders['Content-Type'] && !requestHeaders['content-type']) {
          requestHeaders['Content-Type'] = 'application/json';
        }
        fetchOptions.body = JSON.stringify(body);
      } else {
        fetchOptions.body = String(body);
      }
    }

    const response = await fetch(targetUrl.toString(), fetchOptions);
    const durationMs = Date.now() - startTime;
    const contentType = response.headers.get('content-type') || '';

    let responseData: any;
    if (contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }
    } else {
      responseData = await response.text();
      try {
        responseData = JSON.parse(responseData);
      } catch {
        // keep as text
      }
    }

    const resHeaders: Record<string, string> = {};
    response.headers.forEach((v, k) => {
      resHeaders[k] = v;
    });

    res.json({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      durationMs,
      contentType,
      headers: resHeaders,
      data: responseData,
    });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    res.status(502).json({
      ok: false,
      status: 502,
      statusText: 'Proxy Error',
      durationMs,
      error: err.message || 'Không thể kết nối đến máy chủ đích',
    });
  }
});

// Gemini AI generation endpoint with Google Search Grounding & Tuning Parameters
app.post('/api/ai/generate', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  try {
    const { 
      prompt, 
      systemInstruction, 
      temperature, 
      maxOutputTokens, 
      topP, 
      enableWebSearch = false, 
      customApiKey,
      model = 'gemini-3.8-flash'
    } = req.body;

    const apiKey = customApiKey || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      res.status(400).json({
        ok: false,
        error: 'Chưa có API Key. Vui lòng thêm API Key vào Trình Quản Lý API Key.',
      });
      return;
    }

    if (!prompt) {
      res.status(400).json({ ok: false, error: 'Prompt không được để trống.' });
      return;
    }

    // Create client instance (supporting custom user key if supplied)
    const client = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const config: any = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    if (temperature !== undefined && temperature !== null) {
      config.temperature = Number(temperature);
    }
    if (maxOutputTokens !== undefined && maxOutputTokens !== null && Number(maxOutputTokens) > 0) {
      config.maxOutputTokens = Number(maxOutputTokens);
    }
    if (topP !== undefined && topP !== null) {
      config.topP = Number(topP);
    }

    // Google Search Grounding when user toggles Web Search ON
    if (enableWebSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await client.models.generateContent({
      model: model || 'gemini-3.8-flash',
      contents: prompt,
      config,
    });

    const durationMs = Date.now() - startTime;

    // Check search grounding metadata if present
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = searchChunks
      .map((c: any) => c.web?.uri ? { title: c.web.title || c.web.uri, uri: c.web.uri } : null)
      .filter(Boolean);

    res.json({
      ok: true,
      text: response.text,
      durationMs,
      webSources,
    });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    res.status(500).json({
      ok: false,
      durationMs,
      error: err.message || 'Lỗi khi gọi mô hình Gemini AI',
    });
  }
});

// Start Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NovelCraft Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
