// Cloudflare Workers API - Blogs Endpoint
export async function onRequestGet(context) {
  const blogs = [
    {
      id: 'b1',
      title: 'Experience Lucknow’s Finest Riverside Dining & Speedboat Rides',
      slug: 'riverside-dining-and-speedboat-rides-lucknow',
      excerpt: 'Discover why Wings River Café at Laxman Jhula Park offers an unforgettable blend of multicuisine delicacies and thrilling river adventures.',
      content: 'Wings River Café is not just a place to eat—it is a complete sensory destination situated right along the Gomti River at Laxman Mela Ground. Guests can enjoy mouthwatering multicuisine dishes on our elevated riverside deck while watching speedboats zip across the water.',
      category: 'Riverside Experience',
      cover_image: '/images/Screenshot_20260720-180544_Maps.png',
      author: 'Wings River Team',
      read_time: '4 min read',
      created_at: '2026-07-15'
    }
  ];

  return new Response(JSON.stringify({ success: true, data: blogs }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
