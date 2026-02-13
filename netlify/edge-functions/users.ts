import type { Context } from "@netlify/edge-functions";

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Mock users
let users = [
  { id: 1, name: 'Admin', email: 'admin@chat.com', is_admin: true, is_online: false },
  { id: 2, name: 'User', email: 'user@chat.com', is_admin: false, is_online: false }
];

export default async (request: Request, context: Context) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // GET /api/users
    if (request.method === 'GET' && path === '/api/users') {
      return new Response(JSON.stringify(users), { headers: CORS_HEADERS });
    }

    // GET /api/status (check online status)
    if (request.method === 'GET' && path === '/api/status') {
      return new Response(JSON.stringify({ online_users: users.filter(u => u.is_online) }), { headers: CORS_HEADERS });
    }

    // PUT /api/users/:id
    if (request.method === 'PUT' && path.match(/^\/api\/users\/\d+$/)) {
      const id = parseInt(path.split('/').pop() || '0');
      const body = await request.json();
      const index = users.findIndex(u => u.id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...body };
        return new Response(JSON.stringify(users[index]), { headers: CORS_HEADERS });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: CORS_HEADERS });
    }

    // DELETE /api/users/:id
    if (request.method === 'DELETE' && path.match(/^\/api\/users\/\d+$/)) {
      const id = parseInt(path.split('/').pop() || '0');
      users = users.filter(u => u.id !== id);
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
  path: "/api/users*"
};
