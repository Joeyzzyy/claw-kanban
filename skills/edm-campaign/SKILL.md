---
name: edm-campaign
description: Create and send beautiful marketing emails (EDM) via Resend. Handles branding setup, HTML generation, and delivery.
user-invocable: true
metadata: { "clawdbot": { "emoji": "📧" } }
---

## EDM Marketing Email Campaign

You can help the user create and send professional marketing emails using the `edm_send` tool. Follow this workflow carefully.

### Step 1 — Load or Collect Branding

Check if a brand config file exists in the following order (using the Read tool):
1. Local project override: `{cwd}/.claw-kanban/edm/brand.json`
2. Global default: `~/.claw-kanban/edm/brand.json` (use the current user's home directory)

**If a file exists and is complete**, read it and show a brief summary to the user:
> "I found your brand config: **{productName}** — {tagline}. Sender: {senderName} <{senderEmail}>."
> "Shall we proceed with this branding, or would you like to update anything?"

**If no config is found**, collect the following from the user one by one (or in a grouped question):

| Field | Description | Example |
|-------|-------------|---------|
| `productName` | Product / company name | Acme Inc |
| `logoUrl` | URL to your logo image | https://example.com/logo.png |
| `brandColor` | Primary brand hex color | #4F46E5 |
| `tagline` | Short tagline or slogan | Build better, ship faster |
| `senderEmail` | From email address | marketing@acme.com |
| `senderName` | From display name | Acme Marketing |
| `footerText` | Email footer text | © 2026 Acme Inc. All rights reserved. |
| `websiteUrl` | Main website URL | https://acme.com |

Once collected, ask the user if they want to save this branding globally as their default, or just for this specific project.
- If **Global**: save to `~/.claw-kanban/edm/brand.json`
- If **Project only**: save to `{cwd}/.claw-kanban/edm/brand.json`
Create the directory if it doesn't exist.

**brand.json schema:**
```json
{
  "productName": "string",
  "logoUrl": "string",
  "brandColor": "string",
  "tagline": "string",
  "senderEmail": "string",
  "senderName": "string",
  "footerText": "string",
  "websiteUrl": "string"
}
```

### Step 2 — Campaign Brief

Ask the user:
- What is the **purpose** of this email? (product launch, newsletter, promotion, announcement, etc.)
- Who is the **target audience**?
- What is the **key message or CTA** (call to action)?
- Any **specific content** to include? (text, links, images, discount codes, etc.)
- **Recipient email(s)** — The user might provide a few emails directly, or they might ask you to load a mailing list file.

#### Handling Mailing Lists (Audience Data)
If the user wants to send to a list of emails, or mentions an audience file, check if an audience list exists at:
- `{cwd}/.claw-kanban/edm/audience.csv` or `{cwd}/.claw-kanban/edm/audience.json`

If the user provides you with a new list of emails (via text or file upload), save/update this list in `{cwd}/.claw-kanban/edm/audience.json` to act as the single source of truth for their local CRM/Mailing list.

**audience.json schema example:**
```json
[
  { "email": "user@example.com", "name": "Alice", "status": "active", "lastSent": "2026-03-13" }
]
```

### Step 3 — Generate HTML Email

Create a complete, responsive HTML marketing email with these requirements:

- **Inline CSS only** (no external stylesheets — email clients strip `<link>` and `<style>` in `<head>`)
- **Responsive** — works on desktop and mobile (use `max-width` on container, fluid images)
- **Brand elements** from `brand.json`:
  - Logo image at the top
  - Brand color used for CTA buttons, headers, accent elements
  - Product name in header
  - Tagline where appropriate
  - Footer with `footerText` and link to `websiteUrl`
- **Professional layout**: header → hero/content → CTA button → footer
- **Unsubscribe placeholder** in footer (e.g., "Unsubscribe" text link)

### Step 4 — Preview & Confirm

- Save the generated HTML to a local file (e.g., `{cwd}/.claw-kanban/edm/campaign-{timestamp}.html`)
- Tell the user where the file is saved so they can preview it in a browser
- Ask for confirmation before sending: "Ready to send this email to {recipients}?"

### Step 5 — Send via `edm_send`

Once the user confirms, call the `edm_send` tool:

```
edm_send(
  to: "recipient@example.com",
  from: "{senderName} <{senderEmail}>",
  subject: "Your compelling subject line",
  html: "<full HTML content>"
)
```

Report the result back to the user. If it succeeds, show the email IDs and the **Campaign ID**.

### Step 6 — Campaign Tracking & Local Audience Sync

After a successful send, inform the user:
> "Your campaign has been recorded with ID `{campaignId}`. You can check delivery status anytime with `edm_track`."

**IMPORTANT - Local Audience State Update:** 
If you used a mailing list from `{cwd}/.claw-kanban/edm/audience.json`, you MUST update that file locally to reflect the campaign send. For example, update the `lastSent` date or add the `campaignId` to the users' history, so the user has an up-to-date local CRM record synced with what went out.

### Step 7 — Initial Status Check

Wait a few moments after sending, then automatically call `edm_track(campaignId)` to fetch the initial delivery status. Present the results:
> "Initial delivery report: {deliveryRate}% delivered, {openRate}% opened, {bounceRate}% bounced."

If any emails bounced, flag them. Suggest the user can run `edm_query(query="filter", campaignId="...", filterEvent="bounced")` to see the full list.

### Tips

- Subject lines should be under 60 characters and compelling
- Always include a clear, prominent CTA button
- Keep the email scannable — use headings, short paragraphs, bullet points
- Test with a personal email first before sending to a larger list
- Resend requires domain verification for custom sender addresses — remind the user if they get a domain error
