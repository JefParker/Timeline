export async function onRequestPost(context) {
    try {
        const data = await context.request.json();
        const { username, password } = data;

        if (username === context.env.ADMIN_USERNAME && password === context.env.ADMIN_PASSWORD) {
            return new Response(JSON.stringify({ success: true }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: 'Bad request' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
