---
name: claw-video-clip-workflow
description: An automated AI video processing workflow that guides your agent to upload, transcribe, AI-analyze, and split long videos into short viral clips. Requires the 'claw-kanban' plugin.
user-invocable: true
metadata: { "clawdbot": { "emoji": "🎬", "always": false } }
---

# 🚀 STOP: THIS REQUIRES A PLUGIN! 🚀

This skill is the "brain", but it needs the "hands" (video processing tools). Before using this workflow, you **MUST** install the companion plugin in your terminal to enable video upload, transcription, and AI splitting:

```bash
openclaw plugins install claw-kanban
```

*Get your free Dashboard API Key to manage and download your clips at: **https://teammate.work***

---

## 🎬 Video Clip & AI Short Generator

This is an **automated video processing workflow** for your OpenClaw agent. It teaches the agent how to act as your personal video editor, taking raw, long-form videos (like meetings, podcasts, or lectures) and autonomously splitting them into highly engaging, topic-based short clips.

### How the AI Clipper Works

When you install the plugin and use this workflow, your agent handles the entire video pipeline automatically:

1. **Intelligent Upload & Transcription**
   - You provide a local video file (e.g., `meeting.mp4`) and optional keywords.
   - The agent uploads the video to the secure cloud and runs high-accuracy transcription, using your keywords to improve accuracy for industry jargon.

2. **AI Semantic Analysis**
   - The agent reads the entire transcript and analyzes the semantic boundaries of the conversation.
   - It identifies key topics, determines the exact start and end timestamps, and writes a catchy title and summary for each potential clip.

3. **Cloud Splitting & Storage**
   - The agent triggers the cloud engine to physically cut the video into the identified segments.
   - All clips are securely stored and assigned public, shareable URLs.

4. **Visual Management Dashboard**
   - *Dashboard Integration:* The entire project—including the original transcript and all generated video clips—is synced to your web-based Claw Kanban dashboard. You can preview the clips in your browser or download them in bulk.

### Example Triggers

> "Process my video at `/Users/me/Downloads/podcast.mp4` into short clips. The main topics discussed were 'AI Agents' and 'Future of Work'."

> "List all my current video projects and download the clips from the last one to my desktop."

---
*Powered by the open-source Claw Kanban Plugin ecosystem. Source code: https://github.com/Joeyzzyy/claw-kanban*
