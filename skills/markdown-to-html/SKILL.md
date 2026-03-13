---
name: markdown-to-html
description: Convert a Markdown file (like an SEO article) into a clean, standalone, styled HTML file. Completes the SEO content loop.
user-invocable: true
metadata: { "clawdbot": { "emoji": "🌐" } }
---

## Markdown to HTML Converter

You are responsible for turning SEO Markdown drafts into fully functional, beautifully styled, and responsive HTML files, ready for the user to view, host, or drop into their CMS.

### Input
The user will provide a Markdown string or ask you to read a specific `.md` file from the disk.

### Execution

1. **Parse the Markdown:**
   - Read the provided Markdown content.
   - Separate any YAML frontmatter from the main body if it exists. Extract metadata like `title` and `description` to use in the HTML `<head>`.

2. **Generate the HTML Structure:**
   Create a complete, valid HTML5 document. Use the following template as a baseline:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <meta name="description" content="{{DESCRIPTION}}">
    <style>
        :root {
            --bg-color: #ffffff;
            --text-color: #333333;
            --link-color: #2563eb;
            --heading-color: #111827;
            --code-bg: #f3f4f6;
            --border-color: #e5e7eb;
        }
        
        @media (prefers-color-scheme: dark) {
            :root {
                --bg-color: #111827;
                --text-color: #d1d5db;
                --link-color: #60a5fa;
                --heading-color: #f9fafb;
                --code-bg: #1f2937;
                --border-color: #374151;
            }
        }

        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--bg-color);
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }

        h1, h2, h3, h4, h5, h6 {
            color: var(--heading-color);
            line-height: 1.2;
            margin-top: 2em;
            margin-bottom: 0.5em;
        }

        a {
            color: var(--link-color);
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 1.5rem 0;
        }

        pre {
            background-color: var(--code-bg);
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
        }

        code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 0.9em;
            background-color: var(--code-bg);
            padding: 0.2em 0.4em;
            border-radius: 4px;
        }

        pre code {
            background-color: transparent;
            padding: 0;
        }

        blockquote {
            border-left: 4px solid var(--border-color);
            margin: 1.5rem 0;
            padding-left: 1rem;
            font-style: italic;
            color: #6b7280;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
        }

        th, td {
            border: 1px solid var(--border-color);
            padding: 0.75rem;
            text-align: left;
        }

        th {
            background-color: var(--code-bg);
        }
    </style>
</head>
<body>
    <article>
        {{BODY}}
    </article>
</body>
</html>
```

3. **Convert Markdown to HTML (Internal Logic):**
   - Translate standard Markdown elements into semantic HTML:
     - Headers (`#` to `<h1>`, `##` to `<h2>`, etc.)
     - Paragraphs (`<p>`)
     - Lists (`<ul>`, `<ol>`, `<li>`)
     - Links (`<a href="...">...</a>`)
     - Images (`<img src="..." alt="...">`)
     - Bold/Italic (`<strong>`, `<em>`)
     - Code blocks (`<pre><code>`)
     - Quotes (`<blockquote>`)

4. **Inject and Finalize:**
   - Replace `{{TITLE}}` with the document title (or "SEO Document").
   - Replace `{{DESCRIPTION}}` with the metadata description (or leave empty if none).
   - Replace `{{BODY}}` with your generated HTML.

5. **Output the Result:**
   - Save the resulting HTML to a file in the same directory as the input (e.g., if input was `draft.md`, output `draft.html`). 
   - Report the full absolute path of the generated HTML file to the user so they can open it in their browser.
   - Do **NOT** paste the entire HTML file into the chat unless explicitly asked.

### Workflow Note
If this task is part of a larger `kanban` workflow, make sure to attach the output `.html` file as an artifact in your `kanban_update(action="complete")` call.