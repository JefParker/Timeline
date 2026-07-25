-- Timeline D1 schema.
--
-- Safe to run against an existing database: it only creates what is missing and
-- never drops anything. To wipe and rebuild from scratch, run schema-reset.sql
-- instead (that one IS destructive).
--
--   npx wrangler d1 execute timeline-db --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    puzzle_date TEXT NOT NULL,
    category TEXT NOT NULL,
    score INTEGER NOT NULL,
    time_ms INTEGER NOT NULL,
    placed_cards TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_puzzle_date ON leaderboard(puzzle_date);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score_time ON leaderboard(puzzle_date, score DESC, time_ms ASC);

-- Supports the per-user history lookup in /api/user and the delete-then-insert
-- in /api/leaderboard, both of which filter on user_id.
--
-- To additionally enforce one score per player per day at the database level,
-- run migrations/001_unique_user_date.sql. It is kept separate because it will
-- fail if any duplicate rows already exist.
--
-- Keep a real statement last: wrangler's SQL ingest warns about a "leftover
-- buffer" if the file ends with a trailing comment.
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard(user_id, puzzle_date);
