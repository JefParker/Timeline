export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const userId = url.searchParams.get('user_id');
    const displayName = url.searchParams.get('display_name');

    if (!date) {
        return new Response('Missing date parameter', { status: 400 });
    }

    try {
        const { results } = await env.DB.prepare(
            `SELECT l.user_id, l.score, l.time_ms, u.display_name 
             FROM leaderboard l 
             JOIN users u ON l.user_id = u.id 
             WHERE l.puzzle_date = ? 
             ORDER BY l.score DESC, l.time_ms ASC`
        ).bind(date).all();

        const NAMES_1980S = [
            "Michael", "Christopher", "Matthew", "Joshua", "David", "James", "Daniel", "Robert", "John", "Joseph",
            "Jason", "Justin", "Andrew", "Ryan", "William", "Brian", "Kevin", "Thomas", "Steven", "Timothy",
            "Richard", "Jeremy", "Eric", "Aaron", "Stephen", "Mark", "Anthony", "Jonathan", "Adam", "Kyle",
            "Jacob", "Nicholas", "Charles", "Paul", "Scott", "Benjamin", "Travis", "Jeffrey", "Chad",
            "Jessica", "Ashley", "Amanda", "Sarah", "Jennifer", "Brittany", "Stephanie", "Samantha", "Nicole",
            "Elizabeth", "Lauren", "Megan", "Tiffany", "Heather", "Amber", "Melissa", "Danielle", "Rachel",
            "Courtney", "Mary", "Andrea", "Kathryn", "Shannon", "Erica", "Christina", "Rebecca", "Michelle",
            "Kimberly", "Kelly", "Crystal", "Laura", "Erin", "Tara", "Kristen", "April", "Angela", "Monica"
        ];

        function mulberry32(a) {
            return function() {
              var t = a += 0x6D2B79F5;
              t = Math.imul(t ^ t >>> 15, t | 1);
              t ^= t + Math.imul(t ^ t >>> 7, t | 61);
              return ((t ^ t >>> 14) >>> 0) / 4294967296;
            }
        }

        function getSeedFromString(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
            }
            return hash;
        }

        let allResults = [...results];
        
        const seed = getSeedFromString(date + "-leaderboard");
        const randomFn = mulberry32(seed);
        
        // Shuffle the names deterministically
        const availableNames = [...NAMES_1980S];
        for (let i = availableNames.length - 1; i > 0; i--) {
            const j = Math.floor(randomFn() * (i + 1));
            [availableNames[i], availableNames[j]] = [availableNames[j], availableNames[i]];
        }
        
        // Always generate 9 placeholder players
        for (let i = 0; i < 9; i++) {
            const fakeScore = Math.floor(randomFn() * 5); // 0 to 4
            const fakeTimeMs = 240000 + Math.floor(randomFn() * 300000); // 4 to 9 mins
            allResults.push({
                user_id: `fake-${i}`,
                display_name: availableNames[i],
                score: fakeScore,
                time_ms: fakeTimeMs
            });
        }

        // Re-sort the combined results
        allResults.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.time_ms - b.time_ms;
        });

        const top10 = allResults.slice(0, 10);
        let userRank = -1;
        let userData = null;
        
        if (userId || displayName) {
            const index = allResults.findIndex(r => r.user_id === userId || (displayName && r.display_name === displayName));
            if (index !== -1) {
                userRank = index + 1;
                userData = allResults[index];
            }
        }

        return new Response(JSON.stringify({ top10, all: allResults, userRank, userData }), {
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const data = await request.json();
        const { user_id, display_name, puzzle_date, category, score, time_ms, placedCards } = data;

        if (!user_id || !puzzle_date || score === undefined || time_ms === undefined) {
            return new Response('Missing required fields', { status: 400 });
        }

        // Upsert user
        if (display_name) {
            await env.DB.prepare(
                `INSERT INTO users (id, display_name) VALUES (?, ?) 
                 ON CONFLICT(id) DO UPDATE SET display_name = excluded.display_name`
            ).bind(user_id, display_name).run();
        } else {
            const RANDOM_NAMES = ["Brainiac", "Whiz Kid", "Einstein", "Professor", "Egghead", "Sharpie", "Bright Bulb", "Kid Genius", "Know-It-All", "Walking Encyclopedia"];
            let hash = 0;
            for (let i = 0; i < user_id.length; i++) {
                hash = Math.imul(31, hash) + user_id.charCodeAt(i) | 0;
            }
            const nameIndex = Math.abs(hash) % RANDOM_NAMES.length;
            const generatedName = RANDOM_NAMES[nameIndex];
            
            // Ensure user exists at least with a generated name if missing
            await env.DB.prepare(
                `INSERT OR IGNORE INTO users (id, display_name) VALUES (?, ?)`
            ).bind(user_id, generatedName).run();
        }

        // Delete any existing score for this user and puzzle_date to prevent duplicates
        await env.DB.prepare(
            `DELETE FROM leaderboard WHERE user_id = ? AND puzzle_date = ?`
        ).bind(user_id, puzzle_date).run();

        // Insert score
        await env.DB.prepare(
            `INSERT INTO leaderboard (user_id, puzzle_date, category, score, time_ms, placed_cards) 
             VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(user_id, puzzle_date, category, score, time_ms, placedCards ? JSON.stringify(placedCards) : null).run();

        return new Response('OK', { status: 200 });
    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}
