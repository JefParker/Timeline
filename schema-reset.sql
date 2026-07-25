-- DESTRUCTIVE. Drops every table and recreates the schema from scratch.
-- All users and all scores are permanently lost.
--
-- This is deliberately a separate file from schema.sql so that running the
-- normal schema against production cannot wipe live data.
--
--   npx wrangler d1 execute timeline-db --remote --file=./schema-reset.sql

DROP TABLE IF EXISTS leaderboard;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leaderboard (
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

CREATE INDEX idx_leaderboard_puzzle_date ON leaderboard(puzzle_date);
CREATE INDEX idx_leaderboard_score_time ON leaderboard(puzzle_date, score DESC, time_ms ASC);
CREATE INDEX idx_leaderboard_user ON leaderboard(user_id, puzzle_date);
CREATE UNIQUE INDEX idx_leaderboard_user_date ON leaderboard(user_id, puzzle_date);
