DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS leaderboard;
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
