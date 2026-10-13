#!/usr/bin/env python3
"""
Generates the hidden /skills/<slug>/ pages and turns matching tags on the
home and CV pages into links to them.

The site has no build step at serve time — this is run by hand when the
content below changes, and the generated HTML is committed.

    python3 tools/build-skills.py

Edit SKILLS to change the writing. Each entry is:
    slug: (display name, what it is, where I use it, worth knowing)
ALIASES maps the tag text that appears in the HTML onto a slug.
"""

import html
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SKILLS = {
    "sql": (
        "SQL",
        "The language for asking questions of a relational database. You describe "
        "the answer you want — these columns, from these tables, joined this way, "
        "filtered like so — and the database works out how to fetch it. It has "
        "outlasted every technology that was going to replace it, and it will "
        "outlast the next one too.",
        "Constantly, and it is the core of the job rather than a side skill. The "
        "modelling layer at Nexus Brands is SQL: the views that reconcile stock, "
        "sales and catalogue data between systems that each have their own idea "
        "of what a product is. At Companies House it was SQL against Snowflake, "
        "producing daily data quality metrics.",
        "That writing SQL and modelling data are the same skill. They are not. "
        "Anyone can learn joins in a weekend. Knowing which join is correct — "
        "because you understand the grain of the table and what a duplicate row "
        "actually means — takes considerably longer and matters considerably more.",
    ),
    "python": (
        "Python",
        "A general-purpose programming language that became the default for data "
        "work, largely because it is easy to read and has a library for everything. "
        "It is not the fastest language available, which almost never matters when "
        "the slow part is the database or the network.",
        "Every pipeline I own is Python. It pulls from APIs, reads flat-file drops, "
        "reshapes the results and loads them into the warehouse on a schedule. I "
        "also taught the undergraduate Python module at York for four years, which "
        "is the fastest way I know to find out whether you actually understand "
        "something.",
        "That the clever solution is the good one. Pipelines run unattended at "
        "three in the morning and get read a year later by someone who has never "
        "seen them. Boring, obvious code is a feature.",
    ),
    "pyspark": (
        "PySpark",
        "The Python interface to Apache Spark, which spreads a computation across "
        "many machines so you can process datasets far too large for one. You write "
        "something that looks like ordinary dataframe code and Spark works out how "
        "to distribute it.",
        "At Companies House, building automated pipelines that produced daily data "
        "quality metrics over the full register. Address data at that scale is not "
        "something you load into memory and have a look at.",
        "That you should reach for it by default. Spark has real overhead, and a "
        "dataset that fits comfortably on one machine will almost always be faster "
        "and simpler in plain Python. Distributed computing is a solution to a size "
        "problem, not a mark of seriousness.",
    ),
    "cpp": (
        "C++",
        "A compiled, low-level language that gives you precise control over memory "
        "and runs about as fast as anything will. The price is that it will let you "
        "do catastrophic things without complaint.",
        "My PhD. Four years of analysis pipelines in C++ and ROOT, ingesting, "
        "cleansing and analysing experimental physics data at multi-terabyte scale "
        "where the difference between fast and slow code was the difference between "
        "an answer this week and an answer next month.",
        "That having written C++ makes you a better programmer in other languages. "
        "What it genuinely gives you is an intuition for what the machine is "
        "actually doing — why a loop is slow, why memory layout matters — and that "
        "intuition does transfer.",
    ),
    "snowflake": (
        "Snowflake",
        "A cloud data warehouse that separates storage from compute, so you can "
        "scale the processing power up for a heavy job and back down afterwards "
        "without moving any data. You pay for what you run.",
        "At Companies House, as the platform behind the automated data quality "
        "pipelines — daily metrics over address data, feeding fraud prevention and "
        "operational reporting.",
        "That separating storage and compute makes cost stop mattering. It makes "
        "cost *visible*, which is different. A badly written query that scans "
        "everything no longer just runs slowly, it runs slowly and bills you for "
        "the privilege.",
    ),
    "databricks": (
        "Databricks",
        "A platform built around Spark that bundles notebooks, job scheduling and "
        "data storage together. It is aimed at teams doing large-scale processing "
        "and machine learning who would rather not run the cluster themselves.",
        "Exposure rather than deep specialism — alongside Snowflake and Azure "
        "pipelines in the data platform work. I am comfortable in it without "
        "claiming it as a core strength, and I would rather say so than oversell it.",
        "That notebooks are production code. They are excellent for exploring and "
        "poor at being depended upon — no clear entry point, hidden state from "
        "cells run out of order, and a diff that tells you nothing useful.",
    ),
    "mariadb": (
        "MariaDB / MySQL",
        "A relational database. MariaDB is a fork of MySQL that stayed open source "
        "after Oracle's acquisition; the two remain broadly compatible. It is the "
        "unglamorous, extremely well-understood workhorse of a great many systems.",
        "It is the group reporting warehouse at Nexus Brands — every downstream "
        "sales, stock, margin and catalogue report reads from it.",
        "That it is interchangeable with other SQL databases. It is nearly so, "
        "until it very much is not: MariaDB has no FULL OUTER JOIN, so you emulate "
        "it with a LEFT JOIN unioned to a RIGHT JOIN. Small differences like that "
        "are exactly where a query ported from somewhere else quietly returns the "
        "wrong answer.",
    ),
    "pandas": (
        "pandas",
        "The Python library for working with tabular data in memory. A dataframe is "
        "a table you can filter, join, group and reshape in code, which makes it the "
        "natural bridge between a file and a database.",
        "The middle of most pipelines: read the extract, reshape it, check it, write "
        "it out. Also the first thing I reach for when something looks wrong and I "
        "want to interrogate a dataset rather than guess.",
        "That it scales. Everything lives in memory, so there is a hard ceiling, and "
        "you tend to find it at the worst possible moment. Past that point the "
        "answer is a database or Spark, not a bigger machine.",
    ),
    "parquet": (
        "parquet",
        "A columnar file format for analytical data. Instead of storing row by row, "
        "it stores column by column, which compresses far better and lets a query "
        "read only the columns it actually needs.",
        "The landing layer of the pipelines at Nexus Brands. Raw extracts and API "
        "pulls land as parquet before being loaded, which means a failed run can be "
        "replayed from the files rather than by hammering the source system again.",
        "That it is just a faster CSV. The real win is that it carries its own "
        "schema and types. A CSV will happily tell you a product code is a number, "
        "strip the leading zeros, and let you find out months later.",
    ),
    "etl": (
        "ETL &amp; pipeline design",
        "Extract, Transform, Load — getting data out of source systems, reshaping "
        "it, and putting it somewhere it can be used. ELT reverses the last two, "
        "loading raw and transforming in the warehouse. The arguments about which "
        "letter goes where are less interesting than they sound.",
        "This is the spine of my job. Scheduled jobs pulling from an ERP, "
        "marketplace APIs, an integration platform and partner file drops, landing "
        "to staging, then loading into the warehouse.",
        "That the hard part is moving the data. The hard part is what happens when "
        "it goes wrong at 3am — whether a half-finished run leaves the warehouse in "
        "a broken state, and whether you can simply run it again. Pipelines should "
        "be rerunnable without fear. Most of the design effort goes there.",
    ),
    "data-modelling": (
        "Data modelling",
        "Deciding how data should be structured: what the tables are, what one row "
        "means in each, and how they relate. Relational modelling organises for "
        "correctness; dimensional modelling organises facts and dimensions for "
        "analysis.",
        "The part of the job I would defend as the most valuable. Deciding what "
        "counts as sellable stock, which identifier is authoritative when two "
        "systems disagree, and what the grain of a table actually is.",
        "That it is upfront paperwork you can skip to get to the dashboard. Every "
        "shortcut here surfaces later as numbers that do not reconcile, and by then "
        "the wrong definition is embedded in a dozen reports people already trust.",
    ),
    "rest-apis": (
        "REST APIs",
        "The common way systems expose data over HTTP — ask a URL for a thing, get "
        "structured data back, usually JSON. 'REST' describes a set of conventions "
        "that real APIs follow to wildly varying degrees.",
        "Most external data arrives this way: marketplace APIs for listings, "
        "inventory, subscriptions and compliance attributes. A good deal of the work "
        "is handling pagination, rate limits and the gap between documentation and "
        "behaviour.",
        "That the documentation is accurate. It frequently is not. Endpoints omit "
        "the paging token the docs promise, limits are lower than stated, and fields "
        "appear and vanish. You write against what the API does, not what it says.",
    ),
    "power-bi": (
        "Power BI",
        "Microsoft's business intelligence tool for building dashboards and reports "
        "over a data model, aimed at letting non-technical users explore numbers "
        "without writing queries.",
        "Management reporting — the presentation layer on top of the modelling work, "
        "where the measure of success is that nobody has to ask what a number means.",
        "That the dashboard is the deliverable. A dashboard is a window onto a data "
        "model. If the model underneath is wrong, you have built an efficient way to "
        "distribute a wrong number to more people, faster.",
    ),
    "machine-learning": (
        "Machine learning",
        "Fitting models to data so they can predict or classify without being "
        "explicitly programmed with the rules. In practice most useful work is "
        "regression, classification, clustering and forecasting rather than anything "
        "more exotic.",
        "At Companies House, applying regression and time-series forecasting to "
        "predict address data trends and support operational decisions. The physics "
        "background helps here — fitting models to noisy measurements was the day "
        "job for four years.",
        "That it fixes bad data. A model trained on inconsistent inputs learns the "
        "inconsistency and hands it back with a confidence score attached, which is "
        "worse than no answer because it looks like an answer.",
    ),
    "linux": (
        "Linux",
        "The operating system almost all servers run. Working in it means being "
        "comfortable at a command line — moving around a filesystem, reading logs, "
        "managing processes, and understanding who is permitted to do what.",
        "Everything scheduled runs on a Linux host. Which means the job includes the "
        "unglamorous parts: file permissions, cron, disk space, and working out why "
        "something that runs fine by hand fails under a scheduler.",
        "That permissions are an afterthought. A pipeline that writes files as one "
        "user and gets read by another will work perfectly until the day it does "
        "not, and the error will have nothing to do with your code.",
    ),
    "git": (
        "Git",
        "Version control: a complete history of every change, who made it and why, "
        "with the ability to work on something without disturbing what already "
        "works. The industry standard by a distance.",
        "Everywhere, including places it was not already established — I introduced "
        "Git workflows and coding standards at Companies House, which cut duplicated "
        "work between people unknowingly solving the same problem.",
        "That it is for teams. The biggest beneficiary of your commit history is you "
        "in six months, trying to work out why a working query was changed and "
        "whether it is safe to change back.",
    ),
    "data-quality": (
        "Data quality",
        "Whether the data is actually right: complete, consistent, current, and "
        "meaning what people think it means. It is less a tool than a discipline, "
        "and it is usually somebody's job only after something has gone wrong.",
        "An explicit role at Companies House — address data quality supporting fraud "
        "prevention — and a constant thread since. Finding the flags nobody has "
        "maintained in years, the listings attributed to the wrong account, the "
        "field that is always zero and silently trusted.",
        "That it is a cleanup project with an end date. It is a property of a "
        "system, not a state you reach. Without checks that run continuously, data "
        "quality decays from the moment you stop looking.",
    ),
    "bash": (
        "Bash",
        "The shell language that glues Unix systems together. Ideal for short, "
        "practical automation: move these files, run that job, check whether "
        "something worked.",
        "Scheduling and automation around the pipelines — the wiring between cron "
        "and the Python that does the actual work.",
        "That it scales up to real programs. Past about fifty lines, Bash becomes "
        "difficult to read and alarmingly easy to get wrong, usually around quoting "
        "and filenames with spaces. At that point it should have been Python an hour "
        "ago.",
    ),
    "root": (
        "ROOT",
        "A C++ data analysis framework built at CERN for particle physics. It "
        "handles enormous datasets, histogramming and statistical fitting, and is "
        "near-universal in the field while being almost unknown outside it.",
        "My PhD. Automated C++ and ROOT pipelines for ingesting, cleansing, "
        "analysing and visualising multi-terabyte experimental data.",
        "That domain-specific tools are a dead end on a CV. The framework does not "
        "transfer, but everything around it does: handling data far larger than "
        "memory, building reproducible analysis pipelines, and being sceptical about "
        "a result until you can trace it back to the measurement.",
    ),
    "dbt": (
        "dbt",
        "A tool for managing SQL transformations as a proper software project — "
        "models in version control, dependencies resolved automatically, tests and "
        "documentation alongside the code. It brought engineering practice to "
        "warehouse SQL.",
        "Familiarity with the concepts — SQL models, YAML and Jinja configuration — "
        "rather than years in production with it. Worth being precise about: the "
        "ideas behind it are how I work regardless of the tool.",
        "That you need dbt to work this way. The valuable parts are version "
        "control, tested transformations and explicit dependencies. dbt makes them "
        "convenient; it did not invent them.",
    ),
    "azure": (
        "Azure pipelines",
        "Microsoft's cloud platform for orchestrating data movement — scheduling "
        "jobs, moving data between services and managing the plumbing between "
        "systems, without running the servers yourself.",
        "Part of the data platform work alongside Snowflake and Databricks. "
        "Exposure rather than deep specialism, and I would rather be straight about "
        "that than inflate it.",
        "That managed orchestration removes the need to understand what is being "
        "orchestrated. It removes the need to maintain the scheduler. When a job "
        "fails at 3am, you still need to know exactly what it was doing.",
    ),
    "large-scale-data": (
        "Large-scale data",
        "The point at which data stops fitting comfortably in memory or on one "
        "machine, and the ordinary approaches stop working. Where it starts depends "
        "entirely on what you are doing with it.",
        "Four years of multi-terabyte experimental datasets during the PhD, and "
        "register-scale data at Companies House. Both taught the same lesson: at "
        "scale you cannot eyeball a mistake, so the checks have to be built in.",
        "That it is mostly about having bigger machines. It is mostly about doing "
        "less work — reading only the columns you need, filtering before you join, "
        "and not moving data you were never going to use.",
    ),
}

# Tag text as it appears in the HTML -> slug
ALIASES = {
    "SQL": "sql",
    "Python": "python",
    "Python viz": "python",
    "PySpark": "pyspark",
    "C++": "cpp",
    "Snowflake": "snowflake",
    "Databricks": "databricks",
    "MariaDB": "mariadb",
    "MariaDB / MySQL": "mariadb",
    "pandas": "pandas",
    "parquet": "parquet",
    "ETL": "etl",
    "ETL design": "etl",
    "ETL / ELT design": "etl",
    "data modelling": "data-modelling",
    "relational modelling": "data-modelling",
    "dimensional modelling": "data-modelling",
    "schema design": "data-modelling",
    "REST APIs": "rest-apis",
    "REST API integration": "rest-apis",
    "APIs": "rest-apis",
    "Power BI": "power-bi",
    "machine learning": "machine-learning",
    "Linux": "linux",
    "Git": "git",
    "Git workflows": "git",
    "data quality": "data-quality",
    "Bash": "bash",
    "ROOT": "root",
    "dbt concepts": "dbt",
    "Azure pipelines": "azure",
    "large-scale data": "large-scale-data",
    "large-scale datasets": "large-scale-data",
}

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{name_plain} — Rhidian Williams</title>
  <meta name="description" content="What {name_plain} is, and where I use it.">
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" href="/assets/favicon.svg">
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
  <nav>
    <a class="brand" href="/">rhidian.exe</a>
    <span class="links">
      <a href="/">Home</a>
      <a href="/cv/">CV</a>
      <a href="/darts/">Darts</a>
    </span>
  </nav>

  <main>
    <p class="skill-back"><a href="/cv/" id="back-link">← back to the CV</a></p>

    <div class="about-box">
      <h1>{name}</h1>
      <div class="sparkles">✦ ✧ ✦</div>
    </div>

    <section class="work">
      <h2>What it is</h2>
      <p>{what}</p>
    </section>

    <section class="projects">
      <h2>Where I use it</h2>
      <p>{where}</p>
    </section>

    <section class="plain">
      <h2>The bit people get wrong</h2>
      <p>{wrong}</p>
    </section>

    <p class="skill-back"><a href="/cv/" id="back-link-2">← back to the CV</a></p>
  </main>

  <footer><a href="/">rhidian.exe</a></footer>

  <script src="/assets/skills.js" defer></script>
  <script src="/assets/oche.js" defer></script>
</body>
</html>
"""


def build_pages():
    made = []
    for slug, (name, what, where, wrong) in SKILLS.items():
        d = os.path.join(ROOT, "skills", slug)
        os.makedirs(d, exist_ok=True)
        plain = re.sub(r"&amp;", "&", name)
        with open(os.path.join(d, "index.html"), "w") as f:
            f.write(PAGE.format(name=name, name_plain=plain,
                                what=what, where=where, wrong=wrong))
        made.append(slug)
    return made


def link_tags():
    """Turn <span class="tag">X</span> into a link where X has a page."""
    pages = {
        os.path.join(ROOT, "index.html"): "home",
        os.path.join(ROOT, "cv", "index.html"): "cv",
    }
    total = 0
    for path, origin in pages.items():
        s = open(path).read()

        def sub(m):
            nonlocal total
            text = m.group(1)
            slug = ALIASES.get(html.unescape(text).strip())
            if not slug or slug not in SKILLS:
                return m.group(0)
            total += 1
            return ('<a class="tag" href="/skills/%s/?from=%s">%s</a>'
                    % (slug, origin, text))

        s = re.sub(r'<span class="tag">(.*?)</span>', sub, s)
        open(path, "w").write(s)
    return total


if __name__ == "__main__":
    made = build_pages()
    linked = link_tags()
    print("built %d skill pages" % len(made))
    print("linked %d tags" % linked)
