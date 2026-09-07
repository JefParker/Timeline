export const onRequest = async (context) => {
  const origin = context.request.headers.get("Origin") || "*";

  // 1. Handle CORS Preflight (OPTIONS) requests
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // 2. Handle the actual API request
  try {
    const response = await context.next();
    
    // 3. Add the CORS header to the response
    const corsResponse = new Response(response.body, response);
    corsResponse.headers.set("Access-Control-Allow-Origin", origin);
    
    return corsResponse;
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
};
