export default async function handler(req, res) {
  const https = await import('https');
  const PRODUCT_HUNT_TOKEN = process.env.PRODUCT_HUNT_TOKEN;

  if (!PRODUCT_HUNT_TOKEN) {
    return res.status(200).json({
      status: 'error',
      message: 'PRODUCT_HUNT_TOKEN not configured',
      envVars: Object.keys(process.env).filter(k => k.includes('TOKEN') || k.includes('HUNT') || k.includes('KEY'))
    });
  }

  const query = JSON.stringify({
    query: `query {
      posts(first: 3, order: NEWEST) {
        edges {
          node {
            id
            name
            tagline
            createdAt
            website
          }
        }
      }
    }`
  });

  const options = {
    hostname: 'api.producthunt.com',
    path: '/v2/api/graphql',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PRODUCT_HUNT_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 10000
  };

  try {
    const result = await new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch(e) {
            reject(new Error('Parse error: ' + e.message));
          }
        });
      });

      request.on('error', reject);
      request.on('timeout', () => reject(new Error('Timeout')));
      request.write(query);
      request.end();
    });

    if (result.errors) {
      res.status(200).json({
        status: 'error',
        message: 'Product Hunt API error',
        errors: result.errors
      });
    } else {
      res.status(200).json({
        status: 'ok',
        message: 'Product Hunt API connected successfully',
        tokenConfigured: true,
        products: result.data.posts.edges.map(e => ({
          name: e.node.name,
          tagline: e.node.tagline,
          createdAt: e.node.createdAt
        }))
      });
    }
  } catch (error) {
    res.status(200).json({
      status: 'error',
      message: error.message,
      tokenConfigured: true
    });
  }
}
