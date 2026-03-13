# 🦞 Claw Kanban - A Visual Task Board for your OpenClaw Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenClaw Plugin](https://img.shields.io/badge/OpenClaw-Plugin-ff5a36.svg)](https://openclaw.ai)

Claw Kanban provides a real-time, visual Kanban board to track the tasks your OpenClaw agent is working on. See what's in progress, what's done, and what went wrong, all from a cloud-based web dashboard at [webkanbanforopenclaw.vercel.app](https://webkanbanforopenclaw.vercel.app).

![Screenshot of Claw Kanban UI](https://raw.githubusercontent.com/your-username/claw-kanban/main/docs/screenshot.png) 
*Note: You should replace the above screenshot URL with your own.*

---

## ✨ Features

-   🦞 **Visual Task Tracking**: A web-based UI to see what your AI agent is doing in real-time.
-   🤖 **Automatic Reporting**: The agent uses its skills to automatically create, update, and complete task cards as it works.
-   📊 **Clear Progress Overview**: Classic Kanban columns (Backlog, In Progress, Done, Failed) to quickly assess the state of all tasks.
-   ✍️ **Detailed Progress Logs**: Drill down into tasks to see a timestamped log of the key steps and intermediate results the agent has produced.
-   📱 **Responsive Design**: The UI works beautifully on both desktop and mobile browsers.

## 🎯 Who is this for?

This plugin is designed for anyone using OpenClaw agents and wanting to track task progress from anywhere. All task data syncs to the cloud, so you can view your Kanban board from any device at [webkanbanforopenclaw.vercel.app](https://webkanbanforopenclaw.vercel.app).

## 🚀 Installation

1.  **Download the latest release:** Go to the [GitHub Releases](https://github.com/Joeyzzyy/webkanbanforopenclaw/releases) page and download the latest `claw-kanban-vX.Y.Z.tgz` file.

2.  **Install the plugin:** Open your terminal and run the following command, replacing `<path_to_tgz>` with the actual path to the file you downloaded.
    ```bash
    openclaw plugins install <path_to_tgz>
    ```

3.  **Restart the Gateway:** For the plugin to be loaded, you need to restart your OpenClaw gateway.
    ```bash
    openclaw gateway restart
    ```

That's it! The plugin is now installed.

## ⚙️ Usage

### Configuration (Required)

The plugin requires an API Key to function. Configure your API Key in the plugin config—see **[CLOUD_USAGE.md](CLOUD_USAGE.md)** for setup instructions.

### Accessing the Dashboard

Once configured and the gateway has restarted, your agent's tasks will sync to the cloud. View them at:

**[https://webkanbanforopenclaw.vercel.app/dashboard](https://webkanbanforopenclaw.vercel.app/dashboard)**

### Interacting with your Agent

You don't need to do anything special! Just assign tasks to your OpenClaw agent as you normally would.

The agent is equipped with the `kanban-manage` skill. It will automatically:
-   **Create a new card** in "In Progress" when you give it a new, non-trivial task.
-   **Add log entries** to the card as it makes progress (e.g., after performing a web search or generating code).
-   **Move the card** to "Done" or "Failed" when the task is complete, along with a final result summary.

**Example Task:** *"Hey, could you research the top 3 sci-fi movies of the last decade and give me a brief summary of each?"*

The agent will create a card for this, and you'll see its research progress logged on the Kanban board in real-time.

## 💖 Acknowledgements & Credits

This plugin integrates and builds upon the excellent [SEO & GEO Skills Library](https://github.com/aaron-he-zhu/seo-geo-claude-skills) by Aaron Zhu. We have incorporated several of their powerful SEO skills (like Keyword Research, On-Page SEO Auditor, Sitemap Gap Analyzer, and Competitor Analysis) directly into Claw Kanban to provide a complete, closed-loop SEO workflow. We've also included a custom `markdown-to-html` skill to seamlessly turn those SEO Markdown drafts into publish-ready webpages.

We extend our gratitude to the original author for open-sourcing these high-quality skills. Our plugin merges these capabilities with a visual task management board to track the agent's progress as it executes these SEO workflows.

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## 💻 For Developers

Interested in contributing? Here’s how to get started:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Joeyzzyy/webkanbanforopenclaw.git
    cd claw-kanban
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:** This will watch for changes and rebuild automatically.
    ```bash
    npm run dev
    ```
4.  **Link for local testing:** To test your local changes without creating a `.tgz` file every time, you can link your project directory to your OpenClaw extensions folder.
    ```bash
    # Plugin ID is claw-kanban
    ln -s "$(pwd)" ~/.openclaw/extensions/claw-kanban 
    ```
    After linking, you'll still need to restart the gateway (`openclaw gateway restart`) to see changes.

---
*This README was co-authored by an OpenClaw agent.*
