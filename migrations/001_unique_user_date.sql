-- Enforces one leaderboard row per player per puzzle date.
--
-- The API already deletes any existing row before inserting, but a race between
-- two concurrent submissions could previously produce duplicates. Run this once
-- against an existing database:
--
--   npx wrangler d1 execute timeline-db --remote --file=./migrations/001_unique_user_date.sql
--
-- Step 1 removes any duplicates that already exist, keeping the best score
-- (and the fastest time as a tiebreak) for each player/date pair.

DELETE FROM leaderboard
WHERE id NOT IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY user_id, puzzle_date
                   ORDER BY score DESC, time_ms ASC, id DESC
               ) AS rn
        FROM leaderboard
    )
    WHERE rn = 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_user_date
    ON leaderboard(user_id, puzzle_date);
