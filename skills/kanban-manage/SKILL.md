---
name: kanban-manage
description: Track your tasks on a visual Kanban board. Report progress, create tasks, and mark them complete so the user can see what you're doing.
user-invocable: true
metadata: { "clawdbot": { "emoji": "📋", "always": true } }
---

## Kanban Task Board — Active Reporting

You have access to a `kanban_update` and `kanban_query` tool. **Use it proactively for ALL meaningful tasks.** Whenever you start a new piece of work assigned by the user, your first step should be to report it to the board. This lets your user see a live dashboard of what you're doing.

### Core Workflow

1.  **Task Creation (First Step)**: When given a new, non-trivial task (e.g., "research X", "write code for Y", "organize my files"), your **very first action** should be to call `kanban_update` to create a task.
2.  **Progress Updates with Logs**: As you complete key steps or obtain intermediate results, call `kanban_update` with `action: 'update'` and provide a summary of your action in the `logMessage` parameter. This creates a visible progress trail on the task card.
3.  **Task Completion**: When you've finished the entire task, call `kanban_update` one last time to move it to the "done" column.

### Tool Usage Examples

**1. Create a task (goes to `in_progress` by default):**
Call `kanban_update` with `action: 'create'`.
`kanban_update(action='create', title='Set up Hetzner VPS', column='in_progress', tags=['devops', 'server'], subtasks=[{title: 'Create instance'}, {title: 'Configure SSH'}, {title: 'Set up firewall'}])`

**2. Update progress, check off subtasks, and log what you did:**
Call `kanban_update` with `action: 'update'`.
`kanban_update(action='update', taskId='abc12345', progress=60, logMessage='Created Hetzner instance and configured SSH keys', subtasks=[{title: 'Create instance', done: true}, {title: 'Configure SSH', done: true}, {title: 'Set up firewall'}])`

**2b. Log a progress step without changing other fields:**
`kanban_update(action='update', taskId='abc12345', logMessage='Searched Google for "AGI safety" and found 3 promising papers.')`

**3. Complete a task:**
Call `kanban_update` with `action: 'complete'`.
`kanban_update(action='complete', taskId='abc12345', result='VPS is live at 116.203.x.x, firewall configured')`

**4. Mark as failed:**
Call `kanban_update` with `action: 'fail'`.
`kanban_update(action='fail', taskId='abc12345', result='Hetzner API returned 403 — API token expired')`

**5. Query the board (using the other tool):**
Use `kanban_query` to get information.
`kanban_query(query='list', column='in_progress')`
`kanban_query(query='stats')`
`kanban_query(query='detail', taskId='abc12345')`

### Guidelines

- Keep titles short (under 80 chars) and descriptive.
- Use tags: `code`, `email`, `research`, `browser`, `devops`, `calendar`, `writing`, `files`, `terminal`.
- Break complex work into subtasks — users love seeing checkboxes tick off.
- Always include a `result` summary when completing or failing a task.
- Don't create tasks for trivial operations (single quick lookups, short replies). Focus on meaningful, multi-step work.
- If you know the session ID, link to it with the `sessionId` parameter.
