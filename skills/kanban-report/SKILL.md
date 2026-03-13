---
name: kanban-report
description: Generate a summary report of the Kanban board — what's in progress, what's done today, overall stats.
user-invocable: true
metadata: { "clawdbot": { "emoji": "📊" } }
---

## Kanban Report — Board Summary

When the user asks about task status, progress, or "what have you been doing", use the `kanban_query` tool to pull data and present a clear summary.

### Common user triggers

- "What's on the board?"
- "Show me your tasks"
- "What are you working on?"
- "Progress report"
- "What did you do today?"
- "/kanban" or "/board"

### How to respond

1. Call `kanban_query` with `{ "query": "stats" }` to get the overall picture
2. Call `kanban_query` with `{ "query": "list", "column": "in_progress" }` to get active tasks
3. Format a clean summary like this:

```
📋 Kanban Board

🔵 In Progress (3)
  • Set up Hetzner VPS — 60% [██████░░░░]
  • Draft blog post — 30% [███░░░░░░░]
  • Monitor email inbox — ongoing

✅ Done today (5)
  • Fixed login bug
  • Sent invoice to client
  • ...

📊 Stats: 23 total | 5 done today | 12 this week
⏱ Avg completion: 14 min
🏷 Top tags: code (8), email (5), research (3)
```

### Cloud mode

Tasks are synced to the web dashboard (webkanbanforopenclaw.vercel.app) when you use `kanban_update`. If the board looks empty, the user may need to configure the claw-kanban plugin with an apiKey and ensure tasks are being created via `kanban_update` as you work.
