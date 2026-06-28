---
name: websearch
description: Perform web searches and fetch web pages using Ollama's web search and web fetch APIs. Use when the user asks to search the web, look something up, fetch a URL, or get current information on any topic.
---

# Web search skill

Use Ollama's hosted web search and web fetch REST APIs to run web searches,
fetch page content, and return concise answers with citations.

## Authentication

The API key is stored in the project `.env` file as `OLLAMA_API_KEY`. Load it
before making requests:

```bash
set -a && source ./.env && set +a
```

Authorization header for every request:

```
Authorization: Bearer $OLLAMA_API_KEY
```

## Endpoints

### 1. Web search — `POST https://ollama.com/api/web_search`

Body:

```json
{ "query": "<search query>", "max_results": 10 }
```

`max_results` defaults to 5, max 10. Returns:

```json
{ "results": [ { "title": "...", "url": "...", "content": "..." } ] }
```

### 2. Web fetch — `POST https://ollama.com/api/web_fetch`

Body:

```json
{ "url": "https://example.com/page" }
```

Returns:

```json
{ "title": "...", "content": "...", "links": ["...", "..."] }
```

Use web fetch to pull full page content for the most promising search result(s)
when the snippet is not enough to answer the question.

## Workflow

1. **Load the key**: `set -a && source ./.env && set +a`
2. **Search**: run one or more `web_search` calls via `curl` with the Bash
   tool. Use targeted queries; run multiple queries in parallel when the topic
   has distinct sub-questions.
3. **Fetch (optional)**: pick the 1–3 most relevant URLs from the search
   results and call `web_fetch` to get full page content. Run these in
   parallel too.
4. **Synthesize**: write a concise answer (usually 1–3 short paragraphs or a
   bulleted list) that directly addresses the user's question. Cite each
   claim with a markdown link to the source URL. Prefer primary sources
   (official docs, repos, reputable references) over blog aggregators.
5. **No answer?**: if search returns nothing relevant, say so plainly and
   suggest a refined query rather than fabricating content.

## Bash invocation patterns

Run a search:

```bash
set -a && source ./.env && set +a
curl -s https://ollama.com/api/web_search \
  --header "Authorization: Bearer $OLLAMA_API_KEY" \
  --header "Content-Type: application/json" \
  -d '{"query":"<query>","max_results":10}'
```

Run a fetch:

```bash
set -a && source ./.env && set +a
curl -s https://ollama.com/api/web_fetch \
  --header "Authorization: Bearer $OLLAMA_API_KEY" \
  --header "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

Always pipe through `python3 -m json.tool` (or `jq .`) for readability when
inspecting raw JSON, or use a heredoc to assign results to a shell variable for
processing.

## Output format

Present the answer to the user in this shape:

- A short direct answer first.
- Key points as bullets, each with a `[source](url)` link.
- If the user asked for a summary, keep it under ~200 words unless they ask for
  depth.

## Notes

- Do NOT use `webfetch`/`websearch` opencode tools for this skill — use the
  Ollama APIs via `curl` in the Bash tool so the request goes through the
  authenticated Ollama endpoint.
- Keep the `.env` file out of version control (it is already in `.gitignore`
  in this repo).