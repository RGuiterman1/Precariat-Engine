// Vercel Serverless Function: /api/claude
// Proxies requests to Anthropic so the API key stays on the server.
// Set ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables.

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY environment variable is not set in Vercel. Go to your Vercel project Settings → Environment Variables and add it, then redeploy.'
    });
  }

  try {
    const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: bodyString
    });

    const text = await response.text();

    if (!response.ok) {
      let errorBody;
      try {
        errorBody = JSON.parse(text);
      } catch (e) {
        errorBody = { error: text || 'Unknown error from Anthropic API' };
      }
      const errMsg = errorBody.error?.message || errorBody.error || 'API returned status ' + response.status;
      return res.status(response.status).json({
        error: errMsg,
        details: errorBody
      });
    }

    try {
      return res.status(200).json(JSON.parse(text));
    } catch (e) {
      return res.status(500).json({ error: 'Anthropic returned non-JSON: ' + text.slice(0, 200) });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Proxy error: ' + (error.message || 'Unknown error')
    });
  }
}
