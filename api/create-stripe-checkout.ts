// /api/create-stripe-checkout.js
const Stripe = require('stripe');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('=== API FUNCTION START ===');

  try {
    const { priceId, uid, planName } = req.body;

    console.log('Request data:', { priceId, uid, planName });

    // Validation
    if (!priceId || !uid || !planName) {
      console.log('Validation failed');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('Missing Stripe key');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Initialize Stripe
    console.log('Initializing Stripe...');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create session
    console.log('Creating session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: 'https://www.hobbiies.dk/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://www.hobbiies.dk/dashboard?cancelled=true',
      client_reference_id: uid,
      metadata: { uid, planName },
      subscription_data: {
        metadata: { uid, planName }
      }
    });

    console.log('Session created successfully:', session.id);

    return res.status(200).json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Message:', error.message);
    console.error('Type:', error.type);
    console.error('Code:', error.code);
    console.error('Full error:', error);

    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};