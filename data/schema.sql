CREATE TABLE problems (
    id          INTEGER PRIMARY KEY,
    source      TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty  TEXT NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    title       TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
) STRICT;

CREATE TABLE tags (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL
) STRICT;

CREATE TABLE problem_tags (
    problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    tag_id     INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, tag_id)
) STRICT, WITHOUT ROWID;

CREATE INDEX problem_tags_by_tag ON problem_tags(tag_id, problem_id);

CREATE VIRTUAL TABLE problem_search USING fts5(
    problem_id UNINDEXED,
    title,
    description,
    tokenize = 'unicode61'
);

PRAGMA user_version = 1;
