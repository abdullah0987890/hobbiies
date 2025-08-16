import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { postalCode } = req.query;

  if (!postalCode || typeof postalCode !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid postalCode' });
  }

  try {
    // Add delay to respect rate limits (1 request per second)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const apiUrl = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(postalCode)}&country=Denmark&format=json&limit=1&accept-language=da`;
    
    const apiRes = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'HobbiesApp/1.0 (info@hobbiies.dk)', // Required by Nominatim policy
        'Accept': 'application/json',
      },
    });

    if (!apiRes.ok) {
      console.error(`Nominatim API error: ${apiRes.status} ${apiRes.statusText}`);
      return res.status(502).json({ 
        error: 'Geocoding service unavailable', 
        status: apiRes.status 
      });
    }

    const data = await apiRes.json();

    if (!Array.isArray(data)) {
      console.error('Unexpected response format from Nominatim:', data);
      return res.status(502).json({ error: 'Invalid response from geocoding service' });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Postal code not found' });
    }

    // Return formatted response
    const result = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      display_name: data[0].display_name,
      postalCode: postalCode
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error('Geocoding error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }}