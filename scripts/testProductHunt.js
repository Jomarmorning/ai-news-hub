const https = require('https');

const PRODUCT_HUNT_API = 'https://api.producthunt.com/v2/api/graphql';
const PRODUCT_HUNT_TOKEN = process.env.PRODUCT_HUNT_TOKEN;

console.log('Testing Product Hunt API...');
console.log('Token exists:', !!PRODUCT_HUNT_TOKEN);
console.log('Token length:', PRODUCT_HUNT_TOKEN ? PRODUCT_HUNT_TOKEN.length : 0);

if (!PRODUCT_HUNT_TOKEN) {
  console.error('❌ PRODUCT_HUNT_TOKEN not configured');
  process.exit(1);
}

const query = JSON.stringify({
  query: `query {
    posts(first: 5, order: NEWEST) {
      edges {
        node {
          id
          name
          tagline
          thumbnail { url }
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

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.errors) {
        console.error('❌ API Error:', JSON.stringify(json.errors, null, 2));
        process.exit(1);
      } else {
        console.log('✅ Product Hunt API 连接成功！');
        console.log('获取到', json.data.posts.edges.length, '个产品');
        console.log('\n最新产品：');
        json.data.posts.edges.forEach((edge, i) => {
          console.log(`${i + 1}. ${edge.node.name} - ${edge.node.tagline}`);
        });
        process.exit(0);
      }
    } catch(e) {
      console.error('❌ Parse error:', e.message);
      console.error('Raw:', data.substring(0, 500));
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Request timeout');
  req.destroy();
  process.exit(1);
});

req.write(query);
req.end();
