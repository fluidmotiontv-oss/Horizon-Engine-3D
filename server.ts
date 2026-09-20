import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { WebSocketServer } from 'ws';
import http from 'http';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Mock Storage for Renders and Scripts
const ASSETS_PATH = path.join(process.cwd(), 'public', 'assets', 'renders');
const SCRIPTS_PATH = path.join(process.cwd(), 'scripts', 'blender');

// Ensure directories exist
[ASSETS_PATH, SCRIPTS_PATH].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Queue Management
interface RenderJob {
  id: string;
  scriptName: string;
  status: 'pending' | 'rendering' | 'completed' | 'failed';
  progress: number;
}

let renderQueue: RenderJob[] = [];
let activeJobId: string | null = null;

// Mock job runner
setInterval(() => {
  if (!activeJobId && renderQueue.some(j => j.status === 'pending')) {
    const nextJob = renderQueue.find(j => j.status === 'pending');
    if (nextJob) {
      nextJob.status = 'rendering';
      activeJobId = nextJob.id;
    }
  }

  if (activeJobId) {
    const job = renderQueue.find(j => j.id === activeJobId);
    if (job) {
      job.progress += 5;
      if (job.progress >= 100) {
        job.progress = 100;
        job.status = 'completed';
        activeJobId = null;
      }
    }
  }

  // Broadcast to all clients
  broadcastStatus();
}, 2000);

function broadcastStatus() {
  const status = {
    activeJobs: renderQueue.filter(j => j.status === 'rendering' || j.status === 'pending').length,
    progress: activeJobId ? renderQueue.find(j => j.id === activeJobId)?.progress || 0 : 0,
    currentFrame: activeJobId ? Math.floor(Math.random() * 250) : 0,
    totalFrames: 250,
    nodeStatus: 'OK',
    performance: {
      cpu: activeJobId ? 45 + Math.random() * 40 : 5 + Math.random() * 5,
      memory: activeJobId ? 60 + Math.random() * 20 : 15 + Math.random() * 5,
      gpu: activeJobId ? 80 + Math.random() * 15 : 2 + Math.random() * 3,
      temp: activeJobId ? 72 + Math.random() * 20 : 38 + Math.random() * 5
    },
    queue: renderQueue
  };

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: 'STATUS_UPDATE', data: status }));
    }
  });
}

// API Routes
app.post('/api/jobs', (req, res) => {
  const { scriptName } = req.body;
  const newJob: RenderJob = {
    id: Math.random().toString(36).substr(2, 9),
    scriptName,
    status: 'pending',
    progress: 0
  };
  renderQueue.push(newJob);
  res.json(newJob);
});

app.delete('/api/jobs/:id', (req, res) => {
  renderQueue = renderQueue.filter(j => j.id !== req.params.id);
  res.json({ success: true });
});

app.post('/api/jobs/clear-completed', (req, res) => {
  renderQueue = renderQueue.filter(j => j.status !== 'completed');
  res.json({ success: true });
});

app.get('/api/scripts', (req, res) => {
  try {
    const files = fs.readdirSync(SCRIPTS_PATH).filter(f => f.endsWith('.py'));
    res.json(files.map(f => ({
      name: f,
      content: fs.readFileSync(path.join(SCRIPTS_PATH, f), 'utf-8')
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to list scripts' });
  }
});

app.post('/api/scripts', (req, res) => {
  const { name, content } = req.body;
  if (!name || !content) return res.status(400).json({ error: 'Missing name or content' });
  
  try {
    const safeName = name.replace(/[^a-z0-9_.-]/gi, '_');
    fs.writeFileSync(path.join(SCRIPTS_PATH, `${safeName}.py`), content);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save script' });
  }
});

app.post('/api/generate-script', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are a Blender Python (bpy) expert. Generate clean, modular Python scripts for Blender. 
        The scripts should handle scene setup, materials, and rendering. 
        Output ONLY the raw Python code without markdown formatting.`,
      }
    });

    res.json({ script: response.text });
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ error: 'Failed to generate script' });
  }
});

app.get('/api/renders', (req, res) => {
  try {
    const files = fs.readdirSync(ASSETS_PATH).filter(f => /\.(png|jpg|mp4|webm)$/i.test(f));
    res.json(files.map(f => ({
      name: f,
      url: `/assets/renders/${f}`,
      timestamp: fs.statSync(path.join(ASSETS_PATH, f)).mtimeMs
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to list renders' });
  }
});

// WebSocket for real-time render status
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws) => {
  console.log('Client connected to render status stream');
  broadcastStatus(); // Send initial state
});

// Vite Middleware
async function init() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Horizon Engine running at http://localhost:${PORT}`);
  });
}

init();
