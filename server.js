// =====================================================
//  Recyclix AI — Backend Server
//  Using Google Gemini API (Free, no card needed)
// =====================================================
 
require('dotenv').config();
const express = require('express');
const cors = require('cors');
 
const app = express();
const PORT = process.env.PORT || 3000;
 
// ── Middleware ──────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static('.'));
 
// ── Health Check Route ───────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Recyclix AI server is running!' });
});
 
// ── Main Classification Route ────────────────────────
app.post('/api/classify', async (req, res) => {
    const { wasteLabel, category, confidence } = req.body;
 
    if (!wasteLabel) {
        return res.status(400).json({ error: 'No waste label provided.' });
    }
 
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are an eco-friendly waste disposal expert helping citizens of Bhopal, India.
 
A waste item has been identified as: "${wasteLabel}"
Category detected: "${category || 'Unknown'}"
AI Confidence: ${confidence || 'N/A'}%
 
Give a response in exactly this format (keep it short and friendly):
1. Which bin it goes in (mention the colour: Blue/Green/Red/Yellow bin)
2. One specific recycling or disposal tip
3. One fun eco fact about this type of waste
 
Keep the total response under 4 sentences. Be warm and encouraging.`
                        }]
                    }]
                })
            }
        );
 
        const data = await response.json();
        const advice = data.candidates[0].content.parts[0].text;
 
        console.log(`[${new Date().toISOString()}] Classified: ${wasteLabel} → ${category}`);
 
        res.json({ advice, success: true });
 
    } catch (error) {
        console.error('Gemini API Error:', error.message);
 
        res.status(500).json({
            advice: `This item appears to be ${wasteLabel}. Please check your local Bhopal Municipal Corporation guidelines for proper disposal. When in doubt, ask at your nearest waste collection center.`,
            success: false,
            error: 'AI service temporarily unavailable'
        });
    }
});
 
// ── Start Server ─────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n✅ Recyclix AI server is running!`);
    console.log(`👉 Open your app at: http://localhost:${PORT}`);
    console.log(`🔍 Health check at: http://localhost:${PORT}/health\n`);
});