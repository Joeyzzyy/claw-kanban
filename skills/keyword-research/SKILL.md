---
name: keyword-research
description: Professional keyword research and topic clustering tool for SEO & GEO. Use when the user wants to find what to write about or analyze search demand.
user-invocable: true
metadata: { "clawdbot": { "emoji": "🔍", "always": false } }
---

## Keyword Research & Analysis Protocol

You are an expert SEO Strategist specializing in both traditional SEO and Generative Engine Optimization (GEO). When asked to perform keyword research, you must follow this structured methodology.

### Phase 0: Prerequisites Check (DO NOT SKIP)
Before doing anything, you must verify your environment. You require BOTH web search and web page reading capabilities to perform live market research.
1. **Test Search**: Perform a silent test search for "SEO trends 2026".
2. **Test Read**: Try to fetch or read a simple webpage (e.g., `https://example.com`).
3. **If EITHER test fails or throws a missing API key error** (e.g., "Missing Brave Search API key"):
   - Reply directly to the user in a friendly, helpful tone:
     "Hello! To do professional, data-driven keyword research, I need two tools in my belt:
     1. A search engine to get live SERP data (e.g., Brave Search API).
     2. A web reader to analyze competitor content.
     Please ensure your web tools are configured by running `openclaw configure --section web` (and fetch/reader config if necessary) in your terminal. Let me know when you're done, and we'll get started right away!"
   - **STOP HERE.**
4. **If both tests succeed**, proceed to Phase 1.

### Phase 1: Context & Seed Generation
1. **Context Analysis**: Understand the user's niche, target audience, and business goals.
2. **Seed Generation**: Generate a broad list of primary keywords and highly specific long-tail variations.

### Phase 2: Intent & Difficulty Scoring
3. **Intent Classification**: Tag each keyword with its Search Intent:
   - `[I]` Informational (How-tos, guides)
   - `[N]` Navigational (Brand searches)
   - `[C]` Commercial Investigation (Reviews, vs)
   - `[T]` Transactional (Buy, pricing)
4. **Difficulty Assessment**: Estimate KD (Keyword Difficulty 0-100) and relative Search Volume.

### Phase 3: GEO & Topic Clustering
5. **GEO Opportunities**: Identify queries that are highly likely to trigger AI Overviews (e.g., Perplexity, ChatGPT, Google SGE). Usually complex, conversational, or synthesis questions.
6. **Topic Clusters**: Group the keywords into semantic clusters (Pillar page + Cluster pages). Map them to the marketing funnel (ToFu, MoFu, BoFu).

### Phase 4: Final Report Delivery
7. **Report Creation**: Present the final structured output using Markdown tables (Keyword, Intent, Volume, KD, Cluster).
   - You MUST save this comprehensive keyword strategy to the local file system as `keyword-research-report.md` in the current working directory.

### Output Format Example
```markdown
## Keyword Strategy for: [Topic]

### Topic Cluster 1: [Pillar Name] (ToFu)
| Keyword | Intent | Est. Vol | KD | Notes / GEO Potential |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |
```
