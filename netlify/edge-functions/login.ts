import type { Context } from "@netlify/edge-functions";

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export default async (request: Request, context: Context) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // TODO: Connect to Netlify DB when activated
    // For now, mock login - any email/password works
    const user = {
      id: 1,
      name: email.split('@')[0],
      email,
      is_admin: email === 'admin@chat.com',
      is_online: true,
      created_at: new Date().toISOString()
    };

    const token = btoa(`${user.id}:${Date.now()}`);

    return new Response(
      JSON.stringify({ 
        user,
        token,
        message: 'Login successful (mock)'
      }),
      { status: 200, headers: CORS_HEADERS }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Login failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
};

export const config = {
  path: "/api/login"
};
