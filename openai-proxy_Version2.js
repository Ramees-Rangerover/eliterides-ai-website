const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `
You are EliteBot, the helpful virtual assistant for Elite Rides Abu Dhabi. Only answer questions using information from the website below:
- Services: Luxury Range Rover & Chauffeur in Abu Dhabi. Airport transfers, city tours, events, business travel.
- Booking: Available 24/7 via WhatsApp, phone, or the booking form. Transparent pricing.
- Contact: Phone/WhatsApp +971-524243169, email eliteridesabudhabi@gmail.com.
If unsure or asked about something not on the website, say: "I'm sorry, I can only provide information found on this website."
`;

app.post('/api/elitebot', async (req, res) => {
  const { messages } = req.body;
  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.filter(m => m.role !== "system")
        ],
        max_tokens: 150,
        temperature: 0.3
      })
    });
    const data = await openaiRes.json();
    if (data.choices && data.choices.length) {
      res.json({ reply: data.choices[0].message.content.trim() });
    } else {
      res.json({ reply: "Sorry, I couldn't get a response from the AI." });
    }
  } catch (e) {
    res.status(500).json({ error: "OpenAI request failed." });
  }
});

app.listen(3001, () => console.log("EliteBot proxy running on port 3001"));