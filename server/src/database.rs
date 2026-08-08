use std::path::PathBuf;

use anyhow::{Context, Result};
use rusqlite::{Connection, OpenFlags, OptionalExtension, params};

#[derive(Clone)]
pub struct Database {
    path: PathBuf,
}

pub struct Archive {
    pub problems: Vec<ProblemSummary>,
    pub total_count: usize,
    pub page: usize,
    pub total_pages: usize,
}

pub struct ProblemSummary {
    pub id: i64,
    pub title: String,
    pub difficulty: String,
    pub tags: String,
}

pub struct Problem {
    pub id: i64,
    pub description: String,
    pub difficulty: String,
    pub tags: String,
}

impl Database {
    pub fn open(path: PathBuf) -> Result<Self> {
        let database = Self { path };
        let connection = database.connect()?;
        connection
            .query_row("SELECT COUNT(*) FROM problems", [], |_| Ok(()))
            .context("database does not contain the expected problems table")?;
        Ok(database)
    }

    pub fn list_problems(
        &self,
        requested_page: usize,
        page_size: usize,
        query: &str,
    ) -> Result<Archive> {
        let connection = self.connect()?;
        let search_query = fts_query(query);
        let total_count = if query.is_empty() {
            connection.query_row("SELECT COUNT(*) FROM problems", [], |row| {
                row.get::<_, i64>(0)
            })?
        } else {
            connection.query_row(
                "SELECT COUNT(*) FROM problem_search WHERE problem_search MATCH ?1",
                [&search_query],
                |row| row.get::<_, i64>(0),
            )?
        } as usize;

        let total_pages = total_count.div_ceil(page_size).max(1);
        let page = requested_page.min(total_pages);
        let offset = (page - 1) * page_size;
        let mut problems = if query.is_empty() {
            self.list_all(&connection, page_size, offset)?
        } else {
            self.list_search_results(&connection, &search_query, page_size, offset)?
        };

        for problem in &mut problems {
            problem.difficulty.make_ascii_lowercase();
        }

        Ok(Archive {
            problems,
            total_count,
            page,
            total_pages,
        })
    }

    pub fn get_problem(&self, id: i64) -> Result<Option<Problem>> {
        let connection = self.connect()?;
        let mut problem = connection
            .query_row(
                "SELECT p.id, p.description, p.difficulty, \
                        COALESCE(( \
                            SELECT group_concat(name, ', ') FROM ( \
                                SELECT t.name \
                                FROM problem_tags pt \
                                JOIN tags t ON t.id = pt.tag_id \
                                WHERE pt.problem_id = p.id \
                                ORDER BY t.name \
                            ) \
                        ), '') AS tags \
                 FROM problems p \
                 WHERE p.id = ?1",
                [id],
                |row| {
                    Ok(Problem {
                        id: row.get(0)?,
                        description: row.get(1)?,
                        difficulty: row.get(2)?,
                        tags: row.get(3)?,
                    })
                },
            )
            .optional()?;

        if let Some(problem) = &mut problem {
            problem.difficulty.make_ascii_lowercase();
        }
        Ok(problem)
    }

    fn connect(&self) -> Result<Connection> {
        Connection::open_with_flags(
            &self.path,
            OpenFlags::SQLITE_OPEN_READ_ONLY | OpenFlags::SQLITE_OPEN_NO_MUTEX,
        )
        .with_context(|| format!("failed to open SQLite database at {}", self.path.display()))
    }

    fn list_all(
        &self,
        connection: &Connection,
        limit: usize,
        offset: usize,
    ) -> Result<Vec<ProblemSummary>> {
        let mut statement = connection.prepare(
            "SELECT p.id, p.title, p.difficulty, \
                    COALESCE(( \
                        SELECT group_concat(name, ', ') FROM ( \
                            SELECT t.name \
                            FROM problem_tags pt \
                            JOIN tags t ON t.id = pt.tag_id \
                            WHERE pt.problem_id = p.id \
                            ORDER BY t.name \
                        ) \
                    ), '') AS tags \
             FROM problems p \
             ORDER BY p.id \
             LIMIT ?1 OFFSET ?2",
        )?;
        collect_summaries(&mut statement, params![limit as i64, offset as i64])
    }

    fn list_search_results(
        &self,
        connection: &Connection,
        query: &str,
        limit: usize,
        offset: usize,
    ) -> Result<Vec<ProblemSummary>> {
        let mut statement = connection.prepare(
            "WITH matches AS ( \
                SELECT problem_id, bm25(problem_search) AS rank \
                FROM problem_search \
                WHERE problem_search MATCH ?1 \
             ) \
             SELECT p.id, p.title, p.difficulty, \
                    COALESCE(( \
                        SELECT group_concat(name, ', ') FROM ( \
                            SELECT t.name \
                            FROM problem_tags pt \
                            JOIN tags t ON t.id = pt.tag_id \
                            WHERE pt.problem_id = p.id \
                            ORDER BY t.name \
                        ) \
                    ), '') AS tags \
             FROM matches \
             JOIN problems p ON p.id = matches.problem_id \
             ORDER BY matches.rank, p.id \
             LIMIT ?2 OFFSET ?3",
        )?;
        collect_summaries(&mut statement, params![query, limit as i64, offset as i64])
    }
}

fn collect_summaries<P>(
    statement: &mut rusqlite::Statement<'_>,
    parameters: P,
) -> Result<Vec<ProblemSummary>>
where
    P: rusqlite::Params,
{
    let rows = statement.query_map(parameters, |row| {
        Ok(ProblemSummary {
            id: row.get(0)?,
            title: row.get(1)?,
            difficulty: row.get(2)?,
            tags: row.get(3)?,
        })
    })?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn fts_query(query: &str) -> String {
    query
        .split_whitespace()
        .map(|word| format!("\"{}\"", word.replace('"', "\"\"")))
        .collect::<Vec<_>>()
        .join(" ")
}

#[cfg(test)]
mod tests {
    use super::fts_query;

    #[test]
    fn search_words_become_literal_terms() {
        assert_eq!(fts_query("prime OR number"), "\"prime\" \"OR\" \"number\"");
        assert_eq!(fts_query("say \"hello\""), "\"say\" \"\"\"hello\"\"\"");
    }
}
