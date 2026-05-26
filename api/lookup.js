export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Add XAI_API_KEY in Vercel Environment Variables.' });
  try {
    const { prompt } = req.body;
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'grok-3-mini-fast', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await response.json();
    res.status(200).json({ text: data.choices?.[0]?.message?.content || '' });
  } catch (error) { res.status(500).json({ error: 'Failed. Check API key.' }); }
}
