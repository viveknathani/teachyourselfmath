# teachyourselfmath

![build](https://github.com/viveknathani/teachyourselfmath/actions/workflows/build.yaml/badge.svg) ![stars](https://img.shields.io/github/stars/viveknathani/teachyourselfmath?style=social)

Welcome to my little math project on the internet. As of today, it is a collection of math problems and also hosts a small explainer series on the Reimann Hypothesis. Back in the day, it was more than this. Follow along to understand.

### background

Back in 2023, I was studying math from several textbooks. The process felt disorganized. In software, a site like LeetCode gives you one place to find problems. I wished something similar existed for math: a simple site with a large collection of problems.

The idea was to take a document, extract its math problems, and store them in a database. LaTeX can be read by both people and computers, so the main challenge was turning PDFs into LaTeX and removing everything that was not a problem.

At first, I used [Meta's Nougat model](https://facebookresearch.github.io/nougat/) to read academic PDFs and extract the math. It worked, but it was expensive to run. As language models became better at understanding images, I changed the process: turn each PDF page into an image, ask a model to find the problems, and convert them to LaTeX.

The site received more attention than I expected when it launched. People solved problems, left comments, and sent me lovely emails from around the world. You can read the two Hacker News launch posts [here](https://news.ycombinator.com/item?id=39113879) and [here](https://news.ycombinator.com/item?id=40363517). It was a good time.

Over time, the site became quieter. One day, while sitting in a cafe with my friends Advait and Sid, I said, “maybe I should start a math club.” They encouraged me to do it, and that became [teachyourselfmath.app/club](https://teachyourselfmath.app/club). We met in Bangalore, solved problems together, and had a lot of fun.

Later, maintaining the site started to feel heavier than the site itself. Its JavaScript backend had many dependencies and generated constant security alerts. That no longer made sense for a mostly read-only project.

So I simplified it. I removed accounts, comments, bookmarks, and the rest of the user-generated content. I moved the problem collection from PostgreSQL to a small SQLite database committed to this repository, and rewrote the server in Rust. Around the same time, I became curious about the Riemann hypothesis, so the site now also has a beginner-friendly series about it.

### setup

You only need [Rust](https://www.rust-lang.org/tools/install) 1.95 or newer. The SQLite database is already included in the repository.

Start the site with:

```bash
cargo run -p teachyourselfmath
```

Then open [localhost:8080](http://localhost:8080).

To use Docker instead:

```bash
docker build -t teachyourselfmath .
docker run --rm -p 8080:8080 teachyourselfmath
```

The `exportdb` program is only needed if you want to rebuild the SQLite database from the old PostgreSQL database:

```bash
DATABASE_URL='postgresql://...' cargo run -p exportdb
```

For a database with an untrusted certificate:

```bash
DATABASE_TLS_INSECURE=true DATABASE_URL='postgresql://...' cargo run -p exportdb
```

### contributing

I am happy to accept pull requests. No hard rules.

### acknowledgements

created by Vivek Nathani ([@viveknathani_](https://twitter.com/viveknathani_)), licensed under the [MIT License](./LICENSE).
