export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: 'Extract the recipe from this URL: ' + url + '. Return ONLY valid JSON with no markdown: {"title":"name","emoji":"single food emoji","source":"author or site","time":"cook time","cuisine":"type","diff":"Easy or Medium or Hard","serves":"number","ingredients":[{"emoji":"single emoji","name":"ingredient name","amount":"quantity","have":true}],"kaiTip":"one helpful substitution tip"}. Mark have as true for common staples like salt pepper oil garlic onion butter flour sugar eggs. Mark have as false for specialty items.'
        }]
      })
    });
    const data = await response.json();
    const text = data.content[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
    res.status(200).json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ error: 'Failed to extract recipe' });
  }
}
