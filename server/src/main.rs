mod database;

use std::{env, net::SocketAddr, path::PathBuf};

use askama::Template;
use axum::{
    Router,
    extract::{Path, Query, State},
    http::StatusCode,
    response::{Html, IntoResponse, Response},
    routing::get,
};
use database::{Database, Problem, ProblemSummary};
use serde::Deserialize;
use tower_http::{services::ServeDir, trace::TraceLayer};
use tracing_subscriber::EnvFilter;

const PAGE_SIZE: usize = 20;
const GITHUB_README_URL: &str =
    "https://github.com/viveknathani/teachyourselfmath/blob/master/README.md";

#[derive(Clone)]
struct AppState {
    database: Database,
}

#[derive(Debug, Deserialize)]
struct ArchiveQuery {
    page: Option<usize>,
    q: Option<String>,
}

#[derive(Template)]
#[template(path = "home.html")]
struct HomeTemplate {
    github_readme_url: &'static str,
    problems: Vec<ProblemSummary>,
    query: String,
    result_summary: String,
    page: usize,
    total_pages: usize,
    has_previous: bool,
    previous_url: String,
    has_next: bool,
    next_url: String,
}

#[derive(Template)]
#[template(path = "problem.html")]
struct ProblemTemplate {
    github_readme_url: &'static str,
    problem: Problem,
}

#[derive(Template)]
#[template(path = "club.html")]
struct ClubTemplate {
    github_readme_url: &'static str,
}

#[derive(Template)]
#[template(path = "riemann.html")]
struct RiemannTemplate {
    github_readme_url: &'static str,
}

#[derive(Debug)]
enum AppError {
    NotFound,
    Internal(anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            Self::NotFound => (
                StatusCode::NOT_FOUND,
                Html(
                    "<!doctype html><title>not found · teachyourselfmath</title>\
                     <p style=\"font:16px system-ui;padding:2rem\">problem not found · \
                     <a href=\"/\">back to the archive</a></p>",
                ),
            )
                .into_response(),
            Self::Internal(error) => {
                tracing::error!(error = ?error, "request failed");
                (StatusCode::INTERNAL_SERVER_ERROR, "something went wrong").into_response()
            }
        }
    }
}

impl From<anyhow::Error> for AppError {
    fn from(error: anyhow::Error) -> Self {
        Self::Internal(error)
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let database_path = env::var_os("DATABASE_PATH")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("data/problems.sqlite"));
    let database = Database::open(database_path)?;

    let app = Router::new()
        .route("/", get(home))
        .route("/problems/{id}", get(problem))
        .route("/club", get(club))
        .route("/riemann-hypothesis", get(riemann))
        .nest_service("/static", ServeDir::new(static_directory()))
        .fallback(not_found)
        .layer(TraceLayer::new_for_http())
        .with_state(AppState { database });

    let address: SocketAddr = env::var("BIND_ADDRESS")
        .unwrap_or_else(|_| "127.0.0.1:8080".to_owned())
        .parse()?;
    let listener = tokio::net::TcpListener::bind(address).await?;
    tracing::info!(%address, "teachyourselfmath is listening");
    axum::serve(listener, app).await?;
    Ok(())
}

async fn home(
    State(state): State<AppState>,
    Query(parameters): Query<ArchiveQuery>,
) -> Result<Html<String>, AppError> {
    let requested_page = parameters.page.unwrap_or(1).max(1);
    let query = parameters
        .q
        .unwrap_or_default()
        .trim()
        .chars()
        .take(200)
        .collect::<String>();
    let database = state.database;
    let database_query = query.clone();
    let archive = tokio::task::spawn_blocking(move || {
        database.list_problems(requested_page, PAGE_SIZE, &database_query)
    })
    .await
    .map_err(|error| AppError::Internal(error.into()))??;

    let result_summary = if query.is_empty() {
        format!("{} problems", archive.total_count)
    } else {
        format!(
            "{} {} for “{}”",
            archive.total_count,
            if archive.total_count == 1 {
                "result"
            } else {
                "results"
            },
            query
        )
    };

    let template = HomeTemplate {
        github_readme_url: GITHUB_README_URL,
        problems: archive.problems,
        query: query.clone(),
        result_summary,
        page: archive.page,
        total_pages: archive.total_pages,
        has_previous: archive.page > 1,
        previous_url: archive_url(archive.page.saturating_sub(1), &query),
        has_next: archive.page < archive.total_pages,
        next_url: archive_url(archive.page + 1, &query),
    };

    render(template)
}

async fn problem(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Html<String>, AppError> {
    let database = state.database;
    let problem = tokio::task::spawn_blocking(move || database.get_problem(id))
        .await
        .map_err(|error| AppError::Internal(error.into()))??
        .ok_or(AppError::NotFound)?;

    render(ProblemTemplate {
        github_readme_url: GITHUB_README_URL,
        problem,
    })
}

async fn club() -> Result<Html<String>, AppError> {
    render(ClubTemplate {
        github_readme_url: GITHUB_README_URL,
    })
}

async fn riemann() -> Result<Html<String>, AppError> {
    render(RiemannTemplate {
        github_readme_url: GITHUB_README_URL,
    })
}

async fn not_found() -> AppError {
    AppError::NotFound
}

fn render(template: impl Template) -> Result<Html<String>, AppError> {
    Ok(Html(template.render().map_err(anyhow::Error::from)?))
}

fn archive_url(page: usize, query: &str) -> String {
    if query.is_empty() {
        format!("/?page={page}")
    } else {
        let encoded_query = askama::filters::urlencode(query).expect("URL encoding is infallible");
        format!("/?page={page}&q={encoded_query}")
    }
}

fn static_directory() -> PathBuf {
    env::var_os("STATIC_DIRECTORY")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("server/static"))
}

#[cfg(test)]
mod tests {
    use super::archive_url;

    #[test]
    fn archive_url_encodes_search_query() {
        assert_eq!(archive_url(2, "prime number"), "/?page=2&q=prime%20number");
    }
}
