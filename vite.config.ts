import { defineConfig } from 'vite';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { IncomingMessage, ServerResponse } from 'http';

const DB_PATH = './leaderboard.json';

interface LeaderboardEntry {
  name: string;
  score: number;
  clicks: number;
  date: string;
}

const SEED_DATA: LeaderboardEntry[] = [
  { name: "TacoMaster69", score: 3201, clicks: 94, date: "2025-06-10T14:23:00Z" },
  { name: "SpeedClicker", score: 2847, clicks: 112, date: "2025-06-09T22:15:00Z" },
  { name: "NachoAverage", score: 2654, clicks: 87, date: "2025-06-11T08:30:00Z" },
  { name: "BurritoKing", score: 2100, clicks: 76, date: "2025-06-08T16:45:00Z" },
  { name: "SalsaQueen", score: 1956, clicks: 68, date: "2025-06-10T20:12:00Z" },
  { name: "CrunchTime", score: 1789, clicks: 63, date: "2025-06-07T12:00:00Z" },
  { name: "GuacGod", score: 1534, clicks: 55, date: "2025-06-11T03:22:00Z" },
  { name: "HotSauceHero", score: 1201, clicks: 42, date: "2025-06-06T19:30:00Z" },
  { name: "ChipDip", score: 987, clicks: 38, date: "2025-06-05T10:15:00Z" },
  { name: "QueSoGood", score: 743, clicks: 29, date: "2025-06-04T21:00:00Z" },
];

function loadDB(): LeaderboardEntry[] {
  try {
    if (existsSync(DB_PATH)) {
      const raw = readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch { /* ignore */ }
  // Seed on first run
  writeFileSync(DB_PATH, JSON.stringify(SEED_DATA, null, 2));
  return [...SEED_DATA];
}

function saveDB(entries: LeaderboardEntry[]) {
  writeFileSync(DB_PATH, JSON.stringify(entries, null, 2));
}

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve(null); }
    });
  });
}

export default defineConfig({
  plugins: [
    {
      name: 'leaderboard-api',
      configureServer(server) {
        server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          if (req.url === '/api/leaderboard' && req.method === 'GET') {
            const entries = loadDB();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(entries));
            return;
          }

          if (req.url === '/api/leaderboard' && req.method === 'POST') {
            const data = await parseBody(req);
            if (!data || typeof data.score !== 'number' || typeof data.clicks !== 'number') {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid data' }));
              return;
            }

            const name = (typeof data.name === 'string' && data.name.trim())
              ? data.name.trim().slice(0, 24)
              : 'Anonymous';

            const entries = loadDB();
            entries.push({
              name,
              score: data.score,
              clicks: data.clicks,
              date: new Date().toISOString(),
            });
            entries.sort((a, b) => b.score - a.score);
            const trimmed = entries.slice(0, 50);
            saveDB(trimmed);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(trimmed));
            return;
          }

          next();
        });
      },
    },
  ],
});
