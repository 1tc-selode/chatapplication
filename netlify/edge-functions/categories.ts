import type { Context } from "@netlify/edge-functions";

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Mock data
let categories = [
  { id: 1, name: 'General', description: 'General discussions', created_at: new Date().toISOString() }
];

let rooms = [
  { id: 1, category_id: 1, name: 'Welcome', description: 'Welcome room', is_private: false, created_at: new Date().toISOString() }
];

export default async (request: Request, context: Context) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // GET /api/categories
    if (request.method === 'GET' && path === '/api/categories') {
      return new Response(
        JSON.stringify(categories.map(cat => ({
          ...cat,
          rooms: rooms.filter(r => r.category_id === cat.id)
        }))),
        { headers: CORS_HEADERS }
      );
    }

    // POST /api/categories
    if (request.method === 'POST' && path === '/api/categories') {
      const body = await request.json();
      const newCategory = {
        id: Date.now(),
        name: body.name,
        description: body.description || '',
        created_at: new Date().toISOString()
      };
      categories.push(newCategory);
      return new Response(JSON.stringify(newCategory), { status: 201, headers: CORS_HEADERS });
    }

    // PUT /api/categories/:id
    if (request.method === 'PUT' && path.startsWith('/api/categories/')) {
      const id = parseInt(path.split('/').pop() || '0');
      const body = await request.json();
      const index = categories.findIndex(c => c.id === id);
      if (index !== -1) {
        categories[index] = { ...categories[index], ...body };
        return new Response(JSON.stringify(categories[index]), { headers: CORS_HEADERS });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: CORS_HEADERS });
    }

    // DELETE /api/categories/:id
    if (request.method === 'DELETE' && path.startsWith('/api/categories/')) {
      const id = parseInt(path.split('/').pop() || '0');
      categories = categories.filter(c => c.id !== id);
      rooms = rooms.filter(r => r.category_id !== id);
      return new Response(JSON.stringify({ message: 'Deleted' }), { headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: CORS_HEADERS });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
};

export const config = {
  path: "/api/categories*"
};
