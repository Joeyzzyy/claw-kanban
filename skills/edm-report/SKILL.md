---
name: edm-report
description: View EDM campaign analytics — delivery stats, open rates, bounce reports, and filter recipients for re-marketing.
user-invocable: true
metadata: { "clawdbot": { "emoji": "📊" } }
---

## EDM Campaign Report & Analytics

Help the user review their email campaign performance and identify recipients for follow-up actions.

### When to Trigger

Activate this skill when the user asks about:
- "邮件发送情况" / "email delivery status"
- "campaign 报告" / "campaign report"
- "谁没打开邮件" / "who didn't open"
- "打开率" / "open rate"
- "退信" / "bounced emails"
- Any question about EDM/email campaign performance

### Workflow

#### Step 1 — List Recent Campaigns

Call `edm_query(query="list")` to show recent campaigns. Present a summary table:

| Campaign | Subject | Recipients | Sent | Status |
|----------|---------|------------|------|--------|

If no campaigns exist, inform the user and suggest using the `edm-campaign` skill to send their first email.

#### Step 2 — Refresh Status

Ask the user which campaign to inspect (or auto-select the most recent one). Then call `edm_track(campaignId)` to poll Resend for the latest delivery events.

**IMPORTANT - Local CRM Sync:** After pulling the latest stats, if you find emails that bounced or complained, you MUST update the user's local mailing list (typically located at `{cwd}/.claw-kanban/edm/audience.json`). Mark those emails with `status: "bounced"` or `status: "unsubscribed"` so the user doesn't accidentally email them again in the next campaign.

#### Step 3 — Show Analytics

Call `edm_query(query="stats", campaignId="...")` and present the stats clearly:

> **Campaign: {subject}**
> - Total: {total} recipients
> - Delivered: {delivered} ({deliveryRate}%)
> - Opened: {opened} ({openRate}%)
> - Clicked: {clicked} ({clickRate}%)
> - Bounced: {bounced} ({bounceRate}%)
> - Complained: {complained}
> - Failed: {failed}

#### Step 4 — Filter & Re-marketing

If the user wants to follow up (e.g., "who didn't open?"), use the filter query:

- **Unopened**: `edm_query(query="filter", campaignId="...", filterEvent="opened", exclude=true)`
- **Bounced**: `edm_query(query="filter", campaignId="...", filterEvent="bounced")`
- **Clicked**: `edm_query(query="filter", campaignId="...", filterEvent="clicked")`
- **Not clicked**: `edm_query(query="filter", campaignId="...", filterEvent="clicked", exclude=true)`

Present the filtered list and offer to:
1. Export the email list for a follow-up campaign
2. Create a new campaign targeting just these recipients using the `edm-campaign` skill

### Tips

- Always refresh status (`edm_track`) before showing stats to get the latest data
- Open tracking may take hours — advise the user to check back later for more accurate open rates
- Bounce rates above 5% may indicate list quality issues — flag this proactively
