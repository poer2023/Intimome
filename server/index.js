import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

const dataDir = path.join(process.cwd(), 'server', 'data');
const usersFile = path.join(dataDir, 'users.json');

const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '[]', 'utf-8');
};

ensureDataDir();

const readUsers = () => {
  try {
    const raw = fs.readFileSync(usersFile, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read users', e);
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
};

app.use(cors());
app.use(express.json());

app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码必填' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: '密码至少 6 位' });
  }
  const users = readUsers();
  if (users.some(u => u.username === username)) {
    return res.status(409).json({ success: false, message: '用户名已存在' });
  }
  const hashed = bcrypt.hashSync(password, 10);
  users.push({ username, password: hashed });
  writeUsers(users);
  return res.json({ success: true, user: { username } });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码必填' });
  }
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }
  return res.json({ success: true, user: { username } });
});

app.post('/api/insights', async (req, res) => {
  if (!apiKey) {
    return res.status(503).json({ success: false, message: '未配置 GEMINI_API_KEY' });
  }
  const { logs, language } = req.body || {};
  if (!Array.isArray(logs)) {
    return res.status(400).json({ success: false, message: '缺少日志数据' });
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    const langInstruction = language === 'zh' ? 'Simplified Chinese (Mandarin)' : 'English';
    const anonymizedData = logs.map(log => ({
      date: new Date(log.date).getDay(),
      duration: log.durationMinutes,
      type: log.type,
      mood: log.mood,
      rating: log.rating,
      positions: log.positions,
    }));

    const prompt = `
      Act as a professional, sexual wellness coach. 
      Analyze the following anonymous activity data (JSON) and provide a helpful, positive summary.
      IMPORTANT: Provide all response text in ${langInstruction}.
      Data: ${JSON.stringify(anonymizedData.slice(0, 20))}
      Return strict JSON matching: { "summary": "", "wellnessTip": "", "trendInsight": "" }
      Keep tone clinical, supportive, and sex-positive.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            wellnessTip: { type: Type.STRING },
            trendInsight: { type: Type.STRING },
          },
          required: ['summary', 'wellnessTip', 'trendInsight'],
        }
      }
    });

    const text = response.text;
    const parsed = text ? JSON.parse(text) : null;
    if (!parsed) throw new Error('Empty AI response');
    return res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Insight error', error);
    return res.status(500).json({ success: false, message: '生成分析失败' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
