# 🦞 Claw Kanban

<div align="center">

**OpenClaw plugin — Kanban board, SEO, EDM, and Video Clip tools for your AI agent**

*Watch your lobster run SEO campaigns, send emails, and clip videos — while you monitor everything on a live Kanban board synced to the cloud.*

[![npm version](https://img.shields.io/npm/v/claw-kanban.svg)](https://www.npmjs.com/package/claw-kanban)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenClaw Plugin](https://img.shields.io/badge/OpenClaw-Plugin-ff5a36.svg)](https://openclaw.ai)
[![Website](https://img.shields.io/badge/Cloud%20dashboard-teammate.work-6366f1.svg)](https://teammate.work)

**Latest release: v0.2.13** · [npm](https://www.npmjs.com/package/claw-kanban) · [Cloud dashboard](https://teammate.work) · [Issues](https://github.com/Joeyzzyy/claw-kanban/issues)

</div>

---

Equip your OpenClaw agent with a productivity plugin: bulk-generate EEAT-aware SEO content, automate Resend email campaigns, process videos into short clips — all while every task streams to a real-time Kanban on **[teammate.work](https://teammate.work)** (canonical URL, no `www`).

## Screenshots

![Claw Kanban dashboard](docs/screenshot-herosection.png)

## ✨ Core pillars

### 1. Visual Kanban (core)
As your agent writes articles, sends emails, or clips videos, the board updates in real time.

- Track subtasks and progress logs  
- Download artifacts (Markdown/HTML, clips) from the cloud dashboard  

### 2. SEO engine (sitemap → published content)
Sitemap gap analysis, SERP competitor intel, EEAT-style articles, and on-page audits.

### 3. EDM engine (Resend)
AI-assisted HTML emails, local audience tracking, delivery/open stats on task cards.

### 4. Video clip engine (upload → transcribe → split)
One pipeline from long video to topic-based shorts; CLI and agent-driven workflows.

---

## 🚀 Installation

```bash
openclaw plugins install claw-kanban
```

Requires **Node.js 22+** and a working OpenClaw setup. Package on npm: [`claw-kanban`](https://www.npmjs.com/package/claw-kanban) (see there for the latest version and full metadata).

## ⚙️ Quick start

1. **Sign in:** Open **[https://teammate.work](https://teammate.work)** (not `www`) with Google.  
2. **API key:** In the dashboard, use **Get your keys** and copy the key (`ck_sk_…`).  
3. **Configure the agent**, for example:  
   > Please save my Claw Kanban API Key: `ck_sk_...`

Or add to `~/.openclaw/openclaw.json` (or `~/.claw-kanban/config.json`):

```json
{
  "plugins": {
    "entries": {
      "claw-kanban": {
        "enabled": true,
        "config": {
          "apiKey": "ck_sk_your_key_here",
          "resendApiKey": "re_your_resend_key_here"
        }
      }
    }
  }
}
```

Default cloud API base URL: `https://teammate.work/api/v1` (override with `cloudApiEndpoint` if needed).

Restart the gateway after manual config changes: `openclaw gateway restart`.

## 🗣️ Example prompts

**SEO:**  
> Read my sitemap at https://example.com/sitemap.xml and find 5 high-ROI keyword gaps. Write an EEAT-compliant article for the best one.

**EDM:**  
> Design a launch email for our new Pro Plan using our brand colors. Send it to the audience list in my local folder.

**Video:**  
> Help me clip /Users/me/Downloads/meeting.mp4 into short segments. Keywords: product launch, pricing strategy.

## 🎬 Video CLI

```bash
claw-kanban video process ./meeting.mp4 --keywords "product launch" --output ./clips/
claw-kanban video list
claw-kanban video detail <projectId>
claw-kanban video download <projectId> --output ./clips/
claw-kanban video delete <projectId>
```

## 💖 Acknowledgements

SEO capabilities build on the [SEO & GEO Skills Library](https://github.com/aaron-he-zhu/seo-geo-claude-skills) by Aaron Zhu (MIT), plus an in-repo `markdown-to-html` skill for publish-ready HTML.

**Try our free companion:** [GEO-Lens Chrome Extension](https://chromewebstore.google.com/detail/geo-lens-geo-auditor-ai-v/hioiikdfioegkeidnbhcalfpmhaiiaab) — Professional GEO auditing tool with AI visibility monitoring for EEAT and CORE optimization.

## 📜 License

MIT — see [LICENSE](LICENSE).

---

*Built for OpenClaw. Not affiliated with or endorsed by the OpenClaw team.*
