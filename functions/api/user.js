export async function onRequestPut(context) {
    const { request, env } = context;
    try {
        const data = await request.json();
        const { user_id, display_name } = data;

        if (!user_id || !display_name) {
            return new Response('Missing required fields', { status: 400 });
        }

        await env.DB.prepare(
            `INSERT INTO users (id, display_name) VALUES (?, ?) 
             ON CONFLICT(id) DO UPDATE SET display_name = excluded.display_name`
        ).bind(user_id, display_name).run();

        return new Response('OK', { status: 200 });
    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    
    if (!userId) return new Response('Missing user_id', { status: 400 });
    
    try {
        const user = await env.DB.prepare('SELECT display_name FROM users WHERE id = ?').bind(userId).first();
        const history = await env.DB.prepare('SELECT puzzle_date, category, score, time_ms, placed_cards FROM leaderboard WHERE user_id = ?').bind(userId).all();
        
        return new Response(JSON.stringify({
            display_name: user ? user.display_name : null,
            history: history.results
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch(e) {
        return new Response(e.message, { status: 500 });
    }
}
