import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// CORS 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Whisper API 프록시 엔드포인트
app.post('/api/whisper', upload.single('file'), async (req, res) => {
    try {
        const apiKey = req.headers.authorization?.split(' ')[1];
        if (!apiKey) {
            return res.status(401).json({ error: 'API 키가 필요합니다.' });
        }

        if (!req.file) {
            return res.status(400).json({ error: '오디오 파일이 필요합니다.' });
        }

        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: 'recording.wav',
            contentType: 'audio/wav'
        });
        formData.append('model', 'whisper-1');
        formData.append('language', 'en');
        formData.append('response_format', 'json');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('Whisper API 프록시 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 
