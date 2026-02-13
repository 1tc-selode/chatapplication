import type { Context } from "@netlify/edge-functions";

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export default async (request: Request, context: Context) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  return new Response(
    JSON.stringify({ 
      status: 'ok',
      message: 'Chat API is running (mock mode)',
      timestamp: new Date().toISOString()
    }), 
    { headers: CORS_HEADERS }
  );
};

export const config = {
  path: "/api/status"
};
