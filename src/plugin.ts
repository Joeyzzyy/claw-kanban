import { CloudBoardStore } from "./store/cloud-store.js";
import { EdmCloudStore } from "./store/edm-store.js";
import type { KanbanUpdateParams, KanbanQueryParams, EdmQueryParams } from "./types.js";
import { loadTemplate } from "./templates/loader.js";
import { handleEdmSend, handleEdmTrack, handleEdmQuery } from "./tools/edm-handler.js";
import { getMergedConfig, saveGlobalConfig } from "./config.js";
import os from "node:os";
import path from "node:path";
import fsNode from "node:fs";

const plugin = {
  id: "claw-kanban",
  name: "Claw Kanban",
  description:
    "Visual Kanban board for managing your lobster's tasks. Cloud-only — syncs to webkanbanforopenclaw.vercel.app.",

  // Make register purely synchronous, no async/await
  register(api: any) {
    const rawConfig = (api.pluginConfig ?? {}) as { apiKey?: string; cloudApiEndpoint?: string; resendApiKey?: string };
    const pluginConfig = getMergedConfig(rawConfig);
    const manifestTools = require("../openclaw.plugin.json").tools;

    // --- Provide a config save tool to update the global config persistently ---
    api.registerTool({
      name: "kanban_config_save",
      description: "Save API keys persistently so the user doesn't have to re-enter them",
      parameters: {
        type: "object",
        properties: {
          apiKey: { type: "string" },
          resendApiKey: { type: "string" }
        }
      },
      async execute(_id: string, params: any) {
        saveGlobalConfig(params);
        return { content: [{ type: "text", text: "Configuration saved globally. NOTE: The OpenClaw gateway must be restarted for the new configuration to take effect." }] };
      }
    });

    // --- EDM tools (Resend API key required) ---
    const resendKey = pluginConfig.resendApiKey?.trim();
    const edmStore = pluginConfig.apiKey?.trim()
      ? new EdmCloudStore(
          pluginConfig.apiKey.trim(),
          pluginConfig.cloudApiEndpoint?.trim() ?? "https://webkanbanforopenclaw.vercel.app/api/v1"
        )
      : null;

    api.registerTool({
      name: "edm_send",
      description: "Send a marketing email via Resend (supports batch)",
      parameters: manifestTools.edm_send.parameters,
      async execute(_id: string, params: { to: string; from: string; subject: string; html: string }) {
        if (!resendKey) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                success: false,
                message: "Resend API key not configured. Please ask the user for their Resend API Key (they can get one at resend.com/api-keys), then use `kanban_config_save` to save it, and ask the user to restart OpenClaw."
              })
            }]
          };
        }
        try {
          const result = await handleEdmSend(resendKey, params, edmStore);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        } catch (error: any) {
          return { content: [{ type: "text", text: `Error: ${error.message}` }] };
        }
      },
    });

    api.registerTool({
      name: "edm_track",
      description: "Refresh delivery status for a campaign by polling Resend",
      parameters: manifestTools.edm_track.parameters,
      async execute(_id: string, params: { campaignId: string }) {
        if (!resendKey) {
          return { content: [{ type: "text", text: JSON.stringify({ success: false, message: "Resend API key not configured. Please ask the user for their Resend API Key, use `kanban_config_save` to save it, and ask the user to restart OpenClaw." }) }] };
        }
        if (!edmStore) {
          return { content: [{ type: "text", text: JSON.stringify({ success: false, message: "Cloud API key not configured. Campaign tracking requires apiKey." }) }] };
        }
        try {
          const result = await handleEdmTrack(resendKey, params.campaignId, edmStore);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        } catch (error: any) {
          return { content: [{ type: "text", text: `Error: ${error.message}` }] };
        }
      },
    });

    api.registerTool({
      name: "edm_query",
      description: "Query EDM campaigns — list campaigns, get stats, filter recipients",
      parameters: manifestTools.edm_query.parameters,
      async execute(_id: string, params: EdmQueryParams) {
        if (!edmStore) {
          return { content: [{ type: "text", text: JSON.stringify({ success: false, message: "Cloud API key not configured. Campaign queries require apiKey." }) }] };
        }
        try {
          const result = await handleEdmQuery(params, edmStore);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        } catch (error: any) {
          return { content: [{ type: "text", text: `Error: ${error.message}` }] };
        }
      },
    });

    // --- Kanban tools (require apiKey) ---
    const apiKey = pluginConfig.apiKey?.trim();
    const store = apiKey
      ? new CloudBoardStore(
          apiKey,
          pluginConfig.cloudApiEndpoint?.trim() ?? "https://webkanbanforopenclaw.vercel.app/api/v1"
        )
      : null;

    if (store) {
      console.log("[claw-kanban] Cloud mode: syncing to Claw Kanban Cloud.");
    } else {
      console.warn("[claw-kanban] apiKey not set — kanban tools will prompt user for config.");
    }

    api.registerTool({
      name: "kanban_update",
      description: "Create or update a task on the Kanban board",
      parameters: manifestTools.kanban_update.parameters,
      async execute(_id: string, params: KanbanUpdateParams) {
        if (!store) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                success: false,
                message: "Cloud API key not configured. Please ask the user for their Claw Kanban API Key (they can get it at https://webkanbanforopenclaw.vercel.app), then use `kanban_config_save` to save it."
              })
            }]
          };
        }
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
            // campaignId is already in updateParams from the spread, CloudBoardStore.updateTask sends it to the API
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
        if (!store) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                success: false,
                message: "Cloud API key not configured. Please ask the user for their Claw Kanban API Key (they can get it at https://webkanbanforopenclaw.vercel.app), then use `kanban_config_save` to save it."
              })
            }]
          };
        }
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
      let prependContext = `## Claw Kanban — Task Tracking Protocol\n\n`;

      if (!store) {
        prependContext += `**⚠️ ACTION REQUIRED**: The Claw Kanban API Key is not configured. 
Before tracking tasks, you MUST ask the user for their API Key (they can get one at https://webkanbanforopenclaw.vercel.app). 
Once they provide it, use the \`kanban_config_save\` tool to save it, AND TELL THE USER to restart their OpenClaw gateway for it to take effect. Do not attempt to use \`kanban_update\` until configured.\n\n`;
      }

      prependContext += `You have access to a \`kanban_update\` tool for tracking your work on a visual Kanban board. Follow these rules:

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

### Task Type
When creating a task, set \`taskType\` to categorize it:
- **SEO tasks** (keyword research, content optimization, site audits, ranking analysis, etc.): pass \`taskType="seo"\`
- **EDM tasks** (email campaign creation, sending marketing emails, delivery tracking, etc.): pass \`taskType="edm"\`
- **Other tasks**: omit \`taskType\` or pass \`taskType="general"\`

### EDM Workflow — Campaign Linking
When working on an EDM task (taskType="edm"):
1. After calling \`edm_send\`, the response includes a \`campaignId\`.
2. Save this \`campaignId\` — you MUST pass it when completing the task: \`kanban_update(action="complete", taskId="<id>", campaignId="<campaignId>", result="<summary>")\`
3. This links the task to the campaign record so the dashboard can display real delivery stats (recipients, open rate, click rate, etc.) instead of relying on text parsing.

### Template Hint
If a matching template exists (e.g. "keyword-research", "competitor-analysis", "on-page-seo-auditor", "seo-campaign", "sitemap-gap-analyzer"), pass \`template="<exact-name>"\` in the create call to auto-populate subtasks.`;

      return { prependContext };
    });
  },
};

export const activate = plugin.register;
export const register = plugin.register;
export default plugin;
