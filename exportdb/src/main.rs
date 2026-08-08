use std::{
    env, fs,
    path::{Path, PathBuf},
    process,
};

use anyhow::{Context, Result, bail};
use native_tls::TlsConnector;
use postgres::{Client, IsolationLevel};
use postgres_native_tls::MakeTlsConnector;
use rusqlite::{Connection, params};

const DEFAULT_OUTPUT: &str = "data/problems.sqlite";
const INSECURE_TLS_ENV: &str = "DATABASE_TLS_INSECURE";
const SCHEMA: &str = include_str!("../../data/schema.sql");

#[derive(Debug)]
struct Problem {
    id: i32,
    source: String,
    description: String,
    difficulty: String,
    title: String,
    created_at: String,
    updated_at: String,
}

#[derive(Debug)]
struct Tag {
    id: i32,
    name: String,
}

#[derive(Debug)]
struct ProblemTag {
    problem_id: i32,
    tag_id: i32,
}

fn main() {
    if let Err(error) = run() {
        eprintln!("error: {error:#}");
        process::exit(1);
    }
}

fn run() -> Result<()> {
    let output = output_path()?;
    let database_url = env::var("DATABASE_URL").context(
        "DATABASE_URL is not set; it must contain the source PostgreSQL connection string",
    )?;

    if let Some(parent) = output.parent() {
        fs::create_dir_all(parent)
            .with_context(|| format!("failed to create {}", parent.display()))?;
    }

    let temporary_output = temporary_path(&output)?;
    if temporary_output.exists() {
        fs::remove_file(&temporary_output).with_context(|| {
            format!(
                "failed to remove stale temporary file {}",
                temporary_output.display()
            )
        })?;
    }

    let export_result = export(&database_url, &temporary_output);
    if let Err(error) = export_result {
        let _ = fs::remove_file(&temporary_output);
        return Err(error);
    }

    fs::rename(&temporary_output, &output).with_context(|| {
        format!(
            "failed to move {} to {}",
            temporary_output.display(),
            output.display()
        )
    })?;

    println!("wrote {}", output.display());
    Ok(())
}

fn output_path() -> Result<PathBuf> {
    let mut arguments = env::args_os().skip(1);
    let output = arguments
        .next()
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from(DEFAULT_OUTPUT));

    if arguments.next().is_some() {
        bail!("usage: exportdb [OUTPUT_PATH]");
    }

    Ok(output)
}

fn temporary_path(output: &Path) -> Result<PathBuf> {
    let file_name = output
        .file_name()
        .context("output path must include a file name")?
        .to_string_lossy();
    Ok(output.with_file_name(format!(".{file_name}.{}.tmp", process::id())))
}

fn export(database_url: &str, output: &PathBuf) -> Result<()> {
    println!("reading approved problems from PostgreSQL");
    let insecure_tls = env_flag(INSECURE_TLS_ENV)?;
    if insecure_tls {
        eprintln!(
            "warning: TLS certificate verification is disabled because {INSECURE_TLS_ENV}=true"
        );
    }
    let mut tls_builder = TlsConnector::builder();
    tls_builder.danger_accept_invalid_certs(insecure_tls);
    let tls = tls_builder.build().context("failed to initialize TLS")?;
    let mut postgres = Client::connect(database_url, MakeTlsConnector::new(tls))
        .context("failed to connect to the source PostgreSQL database")?;
    let mut source = postgres
        .build_transaction()
        .isolation_level(IsolationLevel::RepeatableRead)
        .read_only(true)
        .start()
        .context("failed to start a read-only PostgreSQL transaction")?;

    let problems = read_problems(&mut source)?;
    let tags = read_tags(&mut source)?;
    let problem_tags = read_problem_tags(&mut source)?;

    println!(
        "exporting {} problems, {} tags, and {} tag relationships",
        problems.len(),
        tags.len(),
        problem_tags.len()
    );

    let mut sqlite = Connection::open(output)
        .with_context(|| format!("failed to create {}", output.display()))?;
    sqlite
        .execute_batch("PRAGMA foreign_keys = ON;")
        .context("failed to enable SQLite foreign keys")?;
    sqlite
        .execute_batch(SCHEMA)
        .context("failed to create the SQLite schema")?;

    write_data(&mut sqlite, &problems, &tags, &problem_tags)?;
    validate(&sqlite, problems.len(), tags.len(), problem_tags.len())?;
    sqlite
        .execute_batch("PRAGMA optimize;")
        .context("failed to optimize the SQLite database")?;

    source
        .commit()
        .context("failed to finish the PostgreSQL transaction")?;
    Ok(())
}

fn env_flag(name: &str) -> Result<bool> {
    match env::var(name) {
        Ok(value) => match value.to_ascii_lowercase().as_str() {
            "1" | "true" | "yes" => Ok(true),
            "0" | "false" | "no" | "" => Ok(false),
            _ => bail!("{name} must be one of: true, false, 1, 0, yes, or no"),
        },
        Err(env::VarError::NotPresent) => Ok(false),
        Err(error) => Err(error).with_context(|| format!("failed to read {name}")),
    }
}

fn read_problems(source: &mut postgres::Transaction<'_>) -> Result<Vec<Problem>> {
    let rows = source
        .query(
            "SELECT id, source, description, difficulty, title, \
                    created_at::text, updated_at::text \
             FROM problems \
             WHERE status = 'APPROVED' \
             ORDER BY id",
            &[],
        )
        .context("failed to read approved problems")?;

    rows.into_iter()
        .map(|row| {
            Ok(Problem {
                id: row.try_get(0)?,
                source: row.try_get(1)?,
                description: row.try_get(2)?,
                difficulty: row.try_get(3)?,
                title: row.try_get(4)?,
                created_at: row.try_get(5)?,
                updated_at: row.try_get(6)?,
            })
        })
        .collect::<Result<Vec<_>, postgres::Error>>()
        .context("failed to decode an approved problem")
}

fn read_tags(source: &mut postgres::Transaction<'_>) -> Result<Vec<Tag>> {
    let rows = source
        .query(
            "SELECT DISTINCT tags.id, tags.name \
             FROM tags \
             JOIN problems_tags ON problems_tags.tag_id = tags.id \
             JOIN problems ON problems.id = problems_tags.problem_id \
             WHERE problems.status = 'APPROVED' \
             ORDER BY tags.id",
            &[],
        )
        .context("failed to read tags")?;

    rows.into_iter()
        .map(|row| {
            Ok(Tag {
                id: row.try_get(0)?,
                name: row.try_get(1)?,
            })
        })
        .collect::<Result<Vec<_>, postgres::Error>>()
        .context("failed to decode a tag")
}

fn read_problem_tags(source: &mut postgres::Transaction<'_>) -> Result<Vec<ProblemTag>> {
    let rows = source
        .query(
            "SELECT DISTINCT problems_tags.problem_id, problems_tags.tag_id \
             FROM problems_tags \
             JOIN problems ON problems.id = problems_tags.problem_id \
             WHERE problems.status = 'APPROVED' \
             ORDER BY problems_tags.problem_id, problems_tags.tag_id",
            &[],
        )
        .context("failed to read problem-tag relationships")?;

    rows.into_iter()
        .map(|row| {
            Ok(ProblemTag {
                problem_id: row.try_get(0)?,
                tag_id: row.try_get(1)?,
            })
        })
        .collect::<Result<Vec<_>, postgres::Error>>()
        .context("failed to decode a problem-tag relationship")
}

fn write_data(
    sqlite: &mut Connection,
    problems: &[Problem],
    tags: &[Tag],
    problem_tags: &[ProblemTag],
) -> Result<()> {
    let transaction = sqlite
        .transaction()
        .context("failed to start a SQLite transaction")?;

    {
        let mut insert_problem = transaction.prepare_cached(
            "INSERT INTO problems \
             (id, source, description, difficulty, title, created_at, updated_at) \
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        )?;
        let mut insert_search = transaction.prepare_cached(
            "INSERT INTO problem_search (problem_id, title, description) VALUES (?1, ?2, ?3)",
        )?;

        for problem in problems {
            insert_problem.execute(params![
                problem.id,
                problem.source,
                problem.description,
                problem.difficulty,
                problem.title,
                problem.created_at,
                problem.updated_at,
            ])?;
            insert_search.execute(params![problem.id, problem.title, problem.description])?;
        }
    }

    {
        let mut statement =
            transaction.prepare_cached("INSERT INTO tags (id, name) VALUES (?1, ?2)")?;
        for tag in tags {
            statement.execute(params![tag.id, tag.name])?;
        }
    }

    {
        let mut statement = transaction
            .prepare_cached("INSERT INTO problem_tags (problem_id, tag_id) VALUES (?1, ?2)")?;
        for relationship in problem_tags {
            statement.execute(params![relationship.problem_id, relationship.tag_id])?;
        }
    }

    transaction
        .commit()
        .context("failed to commit the SQLite export")?;
    Ok(())
}

fn validate(
    sqlite: &Connection,
    expected_problems: usize,
    expected_tags: usize,
    expected_problem_tags: usize,
) -> Result<()> {
    validate_count(sqlite, "problems", expected_problems)?;
    validate_count(sqlite, "tags", expected_tags)?;
    validate_count(sqlite, "problem_tags", expected_problem_tags)?;
    validate_count(sqlite, "problem_search", expected_problems)?;

    let foreign_key_errors: i64 = sqlite
        .query_row("SELECT COUNT(*) FROM pragma_foreign_key_check", [], |row| {
            row.get(0)
        })
        .context("failed to check SQLite foreign keys")?;
    if foreign_key_errors != 0 {
        bail!("SQLite validation found {foreign_key_errors} foreign-key violations");
    }

    Ok(())
}

fn validate_count(sqlite: &Connection, table: &str, expected: usize) -> Result<()> {
    let actual: i64 = sqlite
        .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |row| {
            row.get(0)
        })
        .with_context(|| format!("failed to count {table}"))?;

    if actual != expected as i64 {
        bail!("expected {expected} rows in {table}, found {actual}");
    }
    Ok(())
}
