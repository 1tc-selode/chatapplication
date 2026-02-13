import type { Context } from "@netlify/edge-functions";

// Mock messages storage
let messages: any[] = [];

export default async (request: Request, context: Context) => {
  // Set CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Handle OPTIONS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Extract room_id from URL path like /api/rooms/1/messages
    const roomPathMatch = pathname.match(/\/api\/rooms\/(\d+)\/messages/);
    let roomId = roomPathMatch ? roomPathMatch[1] : url.searchParams.get('room_id');

    // GET messages for a room
    if (request.method === 'GET') {
      if (!roomId) {
        return new Response(
          JSON.stringify({ error: 'room_id required' }), 
          { status: 400, headers }
        );
      }

      const roomMessages = messages
        .filter(m => m.room_id === parseInt(roomId))
        .map(m => ({
          ...m,
          user: { id: m.user_id, name: m.user_name || 'User' }
        }));

      return new Response(JSON.stringify(roomMessages), { headers });
    }

    // POST new message
    if (request.method === 'POST') {
      const body = await request.json();
      let { room_id, user_id, content } = body;
      
      // If room_id not in body, try to get from URL path
      if (!room_id && roomId) {
        room_id = roomId;
      }

      if (!room_id || !user_id || !content) {
        return new Response(
          JSON.stringify({ error: 'room_id, user_id, and content required' }),
          { status: 400, headers }
        );
      }

      const newMessage = {
        id: Date.now(),
        room_id: parseInt(room_id),
        user_id: parseInt(user_id),
        user_name: body.user_name || 'User',
        content,
        created_at: new Date().toISOString()
      };

      messages.push(newMessage);

      return new Response(
        JSON.stringify({
          ...newMessage,
          user: { id: newMessage.user_id, name: newMessage.user_name }
        }), 
        { status: 201, headers }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers }
    );
  }
};

export const config = {
  path: ["/api/messages*", "/api/rooms/*/messages*"]
};