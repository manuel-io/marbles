CREATE TABLE marbles_ranking (
id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE NOT NULL,
name TEXT NOT NULL,
team TEXT NOT NULL,
level TEXT NOT NULL,
moves INTEGER NOT NULL DEFAULT 0,
points INTEGER NOT NULL DEFAULT 0,
status INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX marbles_ranking_name_team_level_idx
ON marbles_ranking (name, team, level);
