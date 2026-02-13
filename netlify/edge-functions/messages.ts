import type { Context } from "@netlify/edge-functions";

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
    const roomId = url.searchParams.get('room_id');

    // GET messages for a room
    if (request.method === 'GET') {
      if (!roomId) {
        return new Response(
          JSON.stringify({ error: 'room_id required' }), 
          { status: 400, headers }
        );
      }

      // TODO: Query Netlify DB when configured
      const messages = [
        {
          id: 1,
          room_id: roomId,
          user_id: 1,
          content: 'Sample message',
          created_at: new Date().toISOString()
        }
      ];

      return new Response(JSON.stringify(messages), { headers });
    }

    // POST new message
    if (request.method === 'POST') {
      const body = await request.json();
      const { room_id, user_id, content } = body;

      if (!room_id || !user_id || !content) {
        return new Response(
          JSON.stringify({ error: 'room_id, user_id, and content required' }),
          { status: 400, headers }
        );
      }

      // TODO: Insert into Netlify DB when configured
      const newMessage = {
        id: Date.now(),
        room_id,
        user_id,
        content,
        created_at: new Date().toISOString()
      };

      return new Response(JSON.stringify(newMessage), { status: 201, headers });
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
  path: "/api/messages"
};