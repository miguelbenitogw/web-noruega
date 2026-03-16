# ChatGPT Workflow: News to Markdown

Date: 2026-03-16  
Project: `prueba-web-noruega`

## 1. Goal

Convert raw news text into production-ready Markdown files for `content/news/` using a custom GPT in ChatGPT.

## 2. Output Contract (must always be respected)

The GPT must return:
1. Only one Markdown document.
2. Valid frontmatter + body.
3. No explanations outside the Markdown output.

Required frontmatter fields:
1. `slug`
2. `title`
3. `excerpt`
4. `date` (`YYYY-MM-DD`)
5. `tag`
6. `readTime` (`X min`)
7. `coverImage`
8. `status` (`draft` or `published`)
9. `publishAt` (ISO UTC)
10. `author`
11. `seoTitle`
12. `seoDescription`

## 3. System Prompt (copy/paste in your custom GPT)

```txt
You are an editorial formatter for Global Working.
Your only task is to convert raw news input into a single valid Markdown file with frontmatter.

Hard rules:
1) Output ONLY the final markdown file. No comments, no intro text.
2) Use this exact frontmatter schema and order:
   slug, title, excerpt, date, tag, readTime, coverImage, status, publishAt, author, seoTitle, seoDescription
3) date format must be YYYY-MM-DD.
4) publishAt must be ISO 8601 UTC (example: 2026-03-16T08:00:00Z).
5) slug must be lowercase, hyphen-separated, ASCII only.
6) Keep excerpt between 120-180 characters.
7) Keep seoTitle under 60 characters.
8) Keep seoDescription between 140-160 characters.
9) Do not include personal data unless explicitly provided in the input.
10) If data is missing, infer safely and set status: "draft".
11) Body must be clean Markdown with:
   - short intro paragraph
   - 2 to 5 H2 sections
   - bullet list where useful
   - final CTA paragraph
12) Write in Norwegian if input is Norwegian; otherwise keep source language.

Use this template exactly:
---
slug: ""
title: ""
excerpt: ""
date: "YYYY-MM-DD"
tag: ""
readTime: "X min"
coverImage: "/images/news/default.jpg"
status: "draft"
publishAt: "YYYY-MM-DDTHH:mm:ssZ"
author: "Global Working"
seoTitle: ""
seoDescription: ""
---

<body>
```

## 4. User Prompt Template (for each new article)

```txt
Transform this raw news into the required markdown format for Global Working.

Publishing intent:
- desired_status: published
- preferred_tag: <Plattform|Lovgivning|Suksesshistorie|Veiledning>
- desired_publish_datetime_utc: <YYYY-MM-DDTHH:mm:ssZ>
- cover_image: /images/news/<file>.jpg

Raw input:
<paste news text here>
```

## 4.1 Ready-to-Use Prompt (Spanish)

Copy/paste this directly into your custom GPT:

```txt
Convierte esta noticia en bruto al formato markdown requerido para Global Working.

Objetivo de publicación:
- desired_status: published
- preferred_tag: Plattform
- desired_publish_datetime_utc: 2026-03-16T08:00:00Z
- cover_image: /images/news/default.jpg

Reglas obligatorias:
1) Devuelve SOLO un único documento markdown final.
2) Incluye frontmatter con este orden exacto:
   slug, title, excerpt, date, tag, readTime, coverImage, status, publishAt, author, seoTitle, seoDescription
3) date en formato YYYY-MM-DD.
4) publishAt en formato ISO UTC.
5) excerpt entre 120 y 180 caracteres.
6) seoTitle por debajo de 60 caracteres.
7) seoDescription entre 140 y 160 caracteres.
8) Usa noruego si el texto fuente está en noruego.

Texto base:
<pega aquí la noticia en bruto>
```

## 4.2 Example Filled Prompt

```txt
Convierte esta noticia en bruto al formato markdown requerido para Global Working.

Objetivo de publicación:
- desired_status: published
- preferred_tag: Lovgivning
- desired_publish_datetime_utc: 2026-04-01T08:00:00Z
- cover_image: /images/news/innkjop-2026.jpg

Reglas obligatorias:
1) Devuelve SOLO un único documento markdown final.
2) Incluye frontmatter con este orden exacto:
   slug, title, excerpt, date, tag, readTime, coverImage, status, publishAt, author, seoTitle, seoDescription
3) date en formato YYYY-MM-DD.
4) publishAt en formato ISO UTC.
5) excerpt entre 120 y 180 caracteres.
6) seoTitle por debajo de 60 caracteres.
7) seoDescription entre 140 y 160 caracteres.
8) Usa noruego si el texto fuente está en noruego.

Texto base:
Fra 1. juli 2026 økes innkjøpsgrensen for arbeidskraft. Endringen gir kommuner og helseforetak større handlingsrom i planlegging av bemanning.
```

## 5. Manual QA Checklist (before commit)

1. Frontmatter exists and all 12 required fields are present.
2. `slug` is unique and URL-safe.
3. `date` and `publishAt` formats are valid.
4. `seoTitle` and `seoDescription` lengths are valid.
5. Body has no broken headings or malformed lists.
6. Content matches brand tone and legal clarity.
7. Save file as: `content/news/<date>-<slug>.md`.

## 6. Suggested File Naming Convention

Use:
1. `YYYY-MM-DD-slug.md`

Example:
1. `2026-03-16-kandidatportal-lansert.md`

## 7. Publishing Flow

1. Generate markdown with custom GPT.
2. Save file in `content/news/`.
3. Run local checks (`npm run lint` and preview).
4. Commit and deploy.
