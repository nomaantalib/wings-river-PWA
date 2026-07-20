// Cloudflare Workers API - Reviews Endpoint
export async function onRequestGet(context) {
  const reviews = [
    {
      id: 'r1',
      author_name: 'Ananya Sharma',
      rating: 5,
      review_text: 'Amazing riverside view with great food! The paneer tikka and cold coffee were fantastic. Riding the speedboat before dinner was the highlight of our weekend!',
      date_str: '2 days ago',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    }
  ];

  return new Response(JSON.stringify({ success: true, data: reviews }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
