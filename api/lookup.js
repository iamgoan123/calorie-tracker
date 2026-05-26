export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Add XAI_API_KEY in Vercel Environment Variables.' });
  try {
    const { prompt } = req.body;
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'grok-3-mini-fast',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: 'You are a nutrition expert. When given a food item, estimate its calories, protein, carbs, fat, and fiber as accurately as possible. Use your knowledge of Indian restaurant portions, street food, cafe menus, packaged foods, and home cooking. If unsure, give a reasonable rough estimate rather than refusing. Always return ONLY valid JSON, no other text.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    const data = await response.json();
    res.status(200).json({ text: data.choices?.[0]?.message?.content || '' });
  } catch (error) { res.status(500).json({ error: 'Failed. Check API key.' }); }
}
