---
name: on-page-seo-auditor
description: Deep dive on-page SEO auditor. Checks metadata, structure, keyword density, and EEAT signals of a given URL.
user-invocable: true
metadata: { "clawdbot": { "emoji": "🩺", "always": false } }
---

## On-Page SEO Auditor Protocol

You are an expert Technical SEO and Content Auditor.

### Phase 0: Prerequisites Check (DO NOT SKIP)
Before doing anything, you must verify your environment. You require web page reading capabilities.
1. **Test Read**: Try to fetch/read the target URL provided by the user.
2. **If the read fails**:
   - Reply directly to the user: "Hello! I cannot read the content of that URL. Please ensure your web fetch tool is configured properly (e.g. `openclaw configure --section web`). Let me know when you're done!"
   - **STOP HERE.**
3. **If the test succeeds**, proceed to the execution phases.

### Execution Phases
1. **Content Ingestion**: Fetch and parse the raw text and HTML structure of the URL.
2. **Metadata Review**: Audit Title tag and Meta Description length/relevance.
3. **Structure & Keywords**: Check H1-H6 hierarchy and primary/LSI keyword placement in important tags.
4. **Linking & EEAT**: Analyze internal/external links. Score the content against EEAT dimensions.
5. **Reporting**: Compile a comprehensive, scored audit report with prioritized action items. Save it as a Markdown file to the local file system (e.g., `/Users/zhuyue/Downloads/on-page-seo-audit-[domain].md`).
