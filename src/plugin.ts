import { CloudBoardStore } from "./store/cloud-store.js";
import type { KanbanUpdateParams, KanbanQueryParams } from "./types.js";
import { loadTemplate } from "./templates/loader.js";

const plugin = {
  id: "claw-kanban",
  name: "Claw Kanban",
  description:
    "Visual Kanban board for managing your lobster's tasks. Cloud-only — syncs to webkanbanforopenclaw.vercel.app.",

  // Make register purely synchronous, no async/await
  register(api: any) {
    const pluginConfig = (api.pluginConfig ?? {}) as { apiKey?: string; cloudApiEndpoint?: string };

    if (!pluginConfig.apiKey?.trim()) {
      console.warn("[claw-kanban] apiKey is required. Configure plugins.entries.claw-kanban.config.apiKey and restart.");
      return;
    }

    const store = new CloudBoardStore(
      pluginConfig.apiKey.trim(),
      pluginConfig.cloudApiEndpoint?.trim() ?? "https://webkanbanforopenclaw.vercel.app/api/v1"
    );
    console.log("[claw-kanban] Cloud mode: syncing to Claw Kanban Cloud.");

    // Load manifest tools synchronously since import attributes (with { type: "json" }) 
    // allow us to import JSON synchronously in many bundlers, or we can use require if needed.
    // For Tsup/Node, synchronous require of JSON is safest.
    const manifestTools = require("../openclaw.plugin.json").tools;

    api.registerTool({
      name: "kanban_update",
      description: "Create or update a task on the Kanban board",
      parameters: manifestTools.kanban_update.parameters,
      async execute(_id: string, params: KanbanUpdateParams) {
        try {
          if (params.action === "create") {
            // TEMPLATE INJECTION FOR CLOUD MODE
            if (params.template) {
              const template = loadTemplate(params.template);
              if (template) {
                params.description = params.description || template.description;
                params.tags = [...(params.tags || []), ...template.tags];
                // Only overwrite subtasks if none were explicitly provided, or merge them
                params.subtasks = params.subtasks && params.subtasks.length > 0 
                  ? params.subtasks 
                  : template.subtasks;
              }
            }

            const result = await store.createTask(params);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          if (params.taskId) {
            const updateParams = { ...params };
            if (params.action === "complete") {
              updateParams.column = "done";
              updateParams.progress = 100;
              // Mark all subtasks as done when completing the task
              // Even if the agent didn't pass them, we force-complete on the backend
              if (!updateParams.subtasks || updateParams.subtasks.length === 0) {
                // Send a special flag to tell the backend to mark all subtasks done
                (updateParams as any).completeAllSubtasks = true;
              }
            } else if (params.action === "fail") {
              updateParams.column = "failed";
            }
            const result = await store.updateTask(params.taskId, updateParams);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          return { content: [{ type: "text", text: JSON.stringify({ error: "taskId required for update/complete/fail" }) }] };
        } catch (error: any) {
          console.error("[claw-kanban] Tool execution failed:", error);
          return { content: [{ type: "text", text: `Error: ${error.message}` }] };
        }
      },
    });

    api.registerTool({
      name: "kanban_query",
      description: "Query the Kanban board — list tasks, get stats, search",
      parameters: manifestTools.kanban_query.parameters,
      async execute(_id: string, params: KanbanQueryParams) {
        try {
          const result = await store.queryTasks(params);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        } catch (error: any) {
          console.error("[claw-kanban] Query failed:", error);
          return { content: [{ type: "text", text: `Error: ${error.message}` }] };
        }
      },
    });

    // Auto-inject kanban tracking prompt before every agent run
    api.on('before_agent_start', async (_event: any, _context: any) => {
      return {
        prependContext: `## Claw Kanban — Task Tracking Protocol

You have access to a \`kanban_update\` tool for tracking your work on a visual Kanban board. Follow these rules:

### When to Track
- Track any substantive task: research, writing, analysis, code generation, SEO audits, file creation, etc.
- Do NOT track simple Q&A, greetings, or trivial one-shot replies.
- When in doubt, track it.

### Workflow
1. **Start**: At the beginning of a substantive task, call \`kanban_update(action="create", title="<concise title>", column="in_progress")\`. Save the returned \`taskId\`.
2. **Progress**: After completing a significant phase or step, call \`kanban_update(action="update", taskId="<id>", logMessage="<what you just accomplished>")\`. Update subtasks if applicable.
3. **Completion**: When the task is finished, call \`kanban_update(action="complete", taskId="<id>", result="<summary of deliverables>")\`.
   - If you generated any files, attach them: \`artifacts=[{filename: "name.md", type: "markdown", localPath: "/absolute/path/to/file"}]\`
4. **Failure**: If the task cannot be completed, call \`kanban_update(action="fail", taskId="<id>", result="<reason>")\`.

### File Delivery Rule
Whenever your task produces a report, article, analysis, or any document:
- You MUST save it to the local file system first.
- You MUST attach it via the \`artifacts\` array in your final \`kanban_update(action="complete")\` call.

### Template Hint
If a matching template exists (e.g. "keyword-research", "competitor-analysis", "on-page-seo-auditor", "seo-campaign", "sitemap-gap-analyzer"), pass \`template="<exact-name>"\` in the create call to auto-populate subtasks.`
      };
    });
  },
};

export const activate = plugin.register;
export const register = plugin.register;
export default plugin;
