import type { Context } from "@netlify/edge-functions";

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Mock data
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
    // GET /api/rooms
    if (request.method === 'GET' && path === '/api/rooms') {
      return new Response(JSON.stringify(rooms), { headers: CORS_HEADERS });
    }

    // POST /api/rooms
    if (request.method === 'POST' && path === '/api/rooms') {
      const body = await request.json();
      const newRoom = {
        id: Date.now(),
        category_id: body.category_id,
        name: body.name,
        description: body.description || '',
        is_private: body.is_private || false,
        created_at: new Date().toISOString()
      };
      rooms.push(newRoom);
      return new Response(JSON.stringify(newRoom), { status: 201, headers: CORS_HEADERS });
    }

    // PUT /api/rooms/:id
    if (request.method === 'PUT' && path.match(/^\/api\/rooms\/\d+$/)) {
      const id = parseInt(path.split('/').pop() || '0');
      const body = await request.json();
      const index = rooms.findIndex(r => r.id === id);
      if (index !== -1) {
        rooms[index] = { ...rooms[index], ...body };
        return new Response(JSON.stringify(rooms[index]), { headers: CORS_HEADERS });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: CORS_HEADERS });
    }

    // DELETE /api/rooms/:id
    if (request.method === 'DELETE' && path.match(/^\/api\/rooms\/\d+$/)) {
      const id = parseInt(path.split('/').pop() || '0');
      rooms = rooms.filter(r => r.id !== id);
      return new Response(JSON.stringify({ message: 'Deleted' }), { headers: CORS_HEADERS });
    }

    // GET /api/rooms/:id/users
    if (request.method === 'GET' && path.match(/^\/api\/rooms\/\d+\/users$/)) {
      // Mock users
      const mockUsers = [
        { id: 1, name: 'Admin', email: 'admin@chat.com', is_admin: true, is_online: true },
        { id: 2, name: 'User', email: 'user@chat.com', is_admin: false, is_online: false }
      ];
      return new Response(JSON.stringify(mockUsers), { headers: CORS_HEADERS });
    }

    // POST /api/rooms/:id/users
    if (request.method === 'POST' && path.match(/^\/api\/rooms\/\d+\/users$/)) {
      const body = await request.json();
      return new Response(JSON.stringify({ message: 'User added to room' }), { headers: CORS_HEADERS });
    }

    // DELETE /api/rooms/:roomId/users/:userId
    if (request.method === 'DELETE' && path.match(/^\/api\/rooms\/\d+\/users\/\d+$/)) {
      return new Response(JSON.stringify({ message: 'User removed from room' }), { headers: CORS_HEADERS });
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
  path: "/api/rooms*"
};
