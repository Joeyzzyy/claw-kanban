import type { Task, KanbanUpdateParams, KanbanQueryParams } from '../types';

const MAX_UPLOAD_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export class CloudBoardStore {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey: string, endpoint: string) {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Upload a file to Supabase Storage with retry
  private async uploadArtifact(localPath: string, filename: string): Promise<string> {
    const { existsSync, readFileSync } = await import('fs');
    const { basename } = await import('path');

    if (!existsSync(localPath)) {
      throw new Error(`File not found: ${localPath}`);
    }

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < MAX_UPLOAD_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[CloudStore] Retry ${attempt}/${MAX_UPLOAD_RETRIES - 1} for ${filename}`);
          await this.sleep(RETRY_DELAY_MS * attempt);
        }

        const fileBuffer = readFileSync(localPath);
        const blob = new Blob([fileBuffer]);
        const form = new FormData();
        form.append('file', blob, filename);
        form.append('filename', filename);

        const response = await fetch(`${this.endpoint}/upload`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
          },
          body: form,
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Upload failed: ${response.status} ${errText}`);
        }

        const json = (await response.json()) as { url: string };
        return json.url;
      } catch (error: any) {
        lastError = error;
        console.error(`[CloudStore] Upload attempt ${attempt + 1} failed for ${filename}:`, error.message);
      }
    }
    throw lastError ?? new Error(`Upload failed after ${MAX_UPLOAD_RETRIES} attempts`);
  }

  // Try to delete an uploaded artifact from Storage (best-effort cleanup)
  private async deleteUploadedArtifact(url: string): Promise<void> {
    try {
      // Extract the storage path from the public URL
      // URL format: https://<project>.supabase.co/storage/v1/object/public/artifacts/<path>
      const marker = '/storage/v1/object/public/artifacts/';
      const idx = url.indexOf(marker);
      if (idx === -1) return;
      const storagePath = decodeURIComponent(url.slice(idx + marker.length));

      const response = await fetch(`${this.endpoint}/upload?path=${encodeURIComponent(storagePath)}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${this.apiKey}` }
      });
      if (response.ok) {
        console.log(`[CloudStore] Cleaned up orphan artifact: ${storagePath}`);
      }
    } catch {
      // Best-effort — don't let cleanup failure propagate
    }
  }

  // Pre-process artifacts: upload local files, skip failures, track URLs for rollback
  public async processArtifacts(artifacts: any[]): Promise<{ processed: any[]; uploadedUrls: string[] }> {
    if (!artifacts || !Array.isArray(artifacts)) return { processed: [], uploadedUrls: [] };

    const processed = [];
    const uploadedUrls: string[] = [];

    for (const art of artifacts) {
      if (art.localPath) {
        try {
          console.log(`[CloudStore] Uploading local artifact: ${art.localPath}`);
          const url = await this.uploadArtifact(art.localPath, art.filename);
          uploadedUrls.push(url);
          processed.push({ filename: art.filename, type: art.type, url });
        } catch (uploadError: any) {
          // Drop the artifact entirely — never write localPath to the database
          console.warn(`[CloudStore] Dropping artifact ${art.filename}: ${uploadError.message}`);
        }
      } else {
        // Already has a URL or is metadata-only — keep as-is
        processed.push(art);
      }
    }
    return { processed, uploadedUrls };
  }

  async createTask(params: Omit<KanbanUpdateParams, 'action'>): Promise<Task> {
    const url = `${this.endpoint}/tasks`;

    // Process artifacts (upload local files)
    let uploadedUrls: string[] = [];
    if (params.artifacts && params.artifacts.length > 0) {
      const result = await this.processArtifacts(params.artifacts);
      params.artifacts = result.processed;
      uploadedUrls = result.uploadedUrls;
    }

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params),
    };

    console.log(`[CloudStore] Sending CREATE request to: ${url}`);
    console.log(`[CloudStore] Body: ${options.body}`);

    try {
      const response = await fetch(url, options);
      console.log(`[CloudStore] Response Status: ${response.status}`);
      const responseText = await response.text();
      console.log(`[CloudStore] Response Body: ${responseText}`);

      if (!response.ok) {
          throw new Error(`Failed to create task: ${response.status} ${responseText}`);
      }

      const result = JSON.parse(responseText);
      return this.mapCloudTaskToLocal(result.data);
    } catch (error) {
      // Task save failed — clean up already-uploaded files
      console.error('[CloudStore] Create failed, rolling back uploaded artifacts:', error);
      for (const artifactUrl of uploadedUrls) {
        await this.deleteUploadedArtifact(artifactUrl);
      }
      throw error;
    }
  }

  async updateTask(taskId: string, params: Omit<KanbanUpdateParams, 'action' | 'taskId'>): Promise<Task> {
    const url = `${this.endpoint}/tasks`;

    // Process artifacts (upload local files), then send as newArtifacts
    // so the server appends to existing artifacts instead of overwriting
    let uploadedUrls: string[] = [];
    let newArtifacts: any[] | undefined;
    if (params.artifacts && params.artifacts.length > 0) {
      const result = await this.processArtifacts(params.artifacts);
      newArtifacts = result.processed;
      uploadedUrls = result.uploadedUrls;
    }
    // Remove artifacts from params to avoid accidental overwrite
    const { artifacts: _removed, ...restParams } = params;

    // Subtask merging is handled server-side — backend merges by title
    const body: any = { id: taskId, ...restParams };
    if (newArtifacts && newArtifacts.length > 0) {
      body.newArtifacts = newArtifacts;
    }
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    };

    console.log(`[CloudStore] Sending UPDATE request to: ${url}`);
    console.log(`[CloudStore] Body: ${options.body}`);

    try {
      const response = await fetch(url, options);
      console.log(`[CloudStore] Response Status: ${response.status}`);
      const responseText = await response.text();
      console.log(`[CloudStore] Response Body: ${responseText}`);

      if (!response.ok) {
          throw new Error(`Failed to update task: ${response.status} ${responseText}`);
      }

      const result = JSON.parse(responseText);
      return this.mapCloudTaskToLocal(result.data);
    } catch (error) {
      // Task save failed — clean up already-uploaded files
      console.error('[CloudStore] Update failed, rolling back uploaded artifacts:', error);
      for (const artifactUrl of uploadedUrls) {
        await this.deleteUploadedArtifact(artifactUrl);
      }
      throw error;
    }
  }

  private mapCloudTaskToLocal(cloudTask: any): Task {
    return {
      id: cloudTask.id,
      title: cloudTask.title,
      description: cloudTask.description,
      column: cloudTask.column ?? cloudTask.status ?? 'backlog',
      progress: cloudTask.progress,
      tags: cloudTask.tags || [],
      subtasks: cloudTask.subtasks || [],
      sessionId: cloudTask.session_id || null,
      source: cloudTask.source || 'agent',
      result: cloudTask.result || null,
      logs: cloudTask.logs || [],
      createdAt: cloudTask.created_at,
      updatedAt: cloudTask.updated_at,
      startedAt: cloudTask.started_at || null,
      completedAt: cloudTask.completed_at || null,
    };
  }

  async queryTasks(params: KanbanQueryParams): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params.column && params.column !== 'all') searchParams.set('column', params.column);
    if (params.taskId) searchParams.set('taskId', params.taskId);
    if (params.keyword) searchParams.set('keyword', params.keyword);
    if (params.limit) searchParams.set('limit', String(params.limit));

    const url = `${this.endpoint}/tasks?${searchParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to query tasks: ${response.status} ${errText}`);
    }

    const result = await response.json();

    // Single task detail
    if (params.taskId || params.query === 'detail') {
      return { task: this.mapCloudTaskToLocal(result.data) };
    }

    // Stats only
    if (params.query === 'stats') {
      return result.stats;
    }

    // List / search: map all tasks
    const tasks = (result.data || []).map((t: any) => this.mapCloudTaskToLocal(t));
    return { tasks, stats: result.stats };
  }
}
