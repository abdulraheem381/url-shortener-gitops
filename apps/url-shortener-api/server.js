import express from 'express';
import cors from 'cors';
import { customAlphabet } from 'nanoid';
import { createClient } from 'redis';

const app = express();
const port = process.env.PORT || 3001;

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
const REDIS_URL = process.env.REDIS_URL || null;

app.use(cors());
app.use(express.json());

const DB = new Map();
let redisClient = null;

if (REDIS_URL) {
  redisClient = createClient({ url: REDIS_URL });
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  redisClient.connect().then(() => console.log('Connected to Redis')).catch(console.error);
}

app.post('/shorten', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const shortId = nanoid();
    if (redisClient) {
      await redisClient.set(shortId, url);
    } else {
      DB.set(shortId, url);
    }

    res.json({ shortId, originalUrl: url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;
    let url;

    if (redisClient) {
      url = await redisClient.get(shortId);
    } else {
      url = DB.get(shortId);
    }

    if (!url) return res.status(404).send('Short URL not found');
    res.redirect(url);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Demo link getter (Internal only usually or for the dashboard)
app.get('/api/links', async (req, res) => {
    const links = [];
    if (redisClient) {
        const keys = await redisClient.keys('*');
        for (const key of keys) {
            links.push({ id: key, url: await redisClient.get(key) });
        }
    } else {
        DB.forEach((url, id) => links.push({ id, url }));
    }
    res.json(links);
});

app.get('/health', (req, res) => res.json({ status: 'ok', version: '2026.1.0' }));

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
