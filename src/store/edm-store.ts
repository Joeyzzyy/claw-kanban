import type { Campaign, CampaignStats, CampaignRecipient, EdmQueryParams } from '../types.js';

/**
 * Cloud store for EDM campaign data.
 * Wraps the backend API endpoints for campaign CRUD.
 */
export class EdmCloudStore {
  public apiKey: string;
  public endpoint: string;

  constructor(apiKey: string, endpoint: string) {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  public headers(json = true): Record<string, string> {
    const h: Record<string, string> = { Authorization: `Bearer ${this.apiKey}` };
    if (json) h['Content-Type'] = 'application/json';
    return h;
  }

  /** POST /campaigns — create a campaign with recipients */
  async createCampaign(data: {
    subject: string;
    fromAddress: string;
    htmlSnapshot: string;
    tags: string[];
    recipients: { emailId: string; to: string }[];
  }): Promise<Campaign> {
    const url = `${this.endpoint}/campaigns`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to create campaign: ${response.status} ${errText}`);
    }

    const result = (await response.json()) as { data: Campaign };
    return result.data;
  }

  /** GET /campaigns — list all campaigns */
  async listCampaigns(limit?: number): Promise<Campaign[]> {
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));

    const url = `${this.endpoint}/campaigns?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers(false),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to list campaigns: ${response.status} ${errText}`);
    }

    const result = (await response.json()) as { data: Campaign[] };
    return result.data;
  }

  /** GET /campaigns/{id} — campaign detail + recipients */
  async getCampaign(campaignId: string): Promise<{ campaign: Campaign; recipients: CampaignRecipient[] }> {
    const url = `${this.endpoint}/campaigns/${encodeURIComponent(campaignId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers(false),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to get campaign: ${response.status} ${errText}`);
    }

    const result = (await response.json()) as { data: { campaign: Campaign; recipients: CampaignRecipient[] } };
    return result.data;
  }

  /** GET /campaigns/{id}/stats — aggregated stats */
  async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    const url = `${this.endpoint}/campaigns/${encodeURIComponent(campaignId)}/stats`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers(false),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to get campaign stats: ${response.status} ${errText}`);
    }

    const result = (await response.json()) as { data: CampaignStats };
    return result.data;
  }

  /** PUT /campaigns/{id}/recipients — batch update recipient statuses */
  async updateRecipients(
    campaignId: string,
    updates: { emailId: string; lastEvent: string; lastEventAt: string | null }[]
  ): Promise<void> {
    const url = `${this.endpoint}/campaigns/${encodeURIComponent(campaignId)}/recipients`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify({ recipients: updates }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to update recipients: ${response.status} ${errText}`);
    }
  }

  /** GET /campaigns/{id}/recipients?event=...&exclude=... — filter recipients */
  async filterRecipients(
    campaignId: string,
    filterEvent: string,
    exclude?: boolean,
    limit?: number
  ): Promise<CampaignRecipient[]> {
    const params = new URLSearchParams();
    params.set('event', filterEvent);
    if (exclude) params.set('exclude', 'true');
    if (limit) params.set('limit', String(limit));

    const url = `${this.endpoint}/campaigns/${encodeURIComponent(campaignId)}/recipients?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers(false),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to filter recipients: ${response.status} ${errText}`);
    }

    const result = (await response.json()) as { data: CampaignRecipient[] };
    return result.data;
  }
}
