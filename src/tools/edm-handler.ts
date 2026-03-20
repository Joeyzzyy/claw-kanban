import type { CampaignStats, EdmQueryParams } from '../types.js';
import type { EdmCloudStore } from '../store/edm-store.js';

/**
 * Send marketing emails via Resend, then create a campaign record in the cloud.
 * Uses Resend Batch API for multiple recipients.
 */
export async function handleEdmSend(
  params: { to: string; from: string; subject: string; html: string },
  edmStore: EdmCloudStore | null
): Promise<{ success: boolean; campaignId?: string; emailIds?: string[]; message: string }> {
  if (!edmStore) {
    return { success: false, message: 'Cloud API key not configured. Cannot send emails.' };
  }

  const recipients = params.to
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return { success: false, message: 'No recipients specified.' };
  }

  // Use the cloud proxy to send emails using the user's stored Resend Key
  const response = await fetch(`${edmStore.endpoint}/edm/send`, {
    method: 'POST',
    headers: edmStore.headers(),
    body: JSON.stringify({
      to: params.to,
      from: params.from,
      subject: params.subject,
      html: params.html,
    }),
  });

  const data = await response.json() as any;
  
  if (!response.ok) {
    return {
      success: false,
      message: `Cloud Proxy Error (${response.status}): ${data.error || data.message || JSON.stringify(data)}`,
    };
  }

  const emailIds = data.emailIds as string[];

  // Create campaign record in the cloud (if store is available)
  let campaignId: string | undefined;
  if (edmStore) {
    try {
      const campaignRecipients = emailIds.map((emailId, i) => ({
        emailId,
        to: recipients[i] ?? recipients[0],
      }));

      const campaign = await edmStore.createCampaign({
        subject: params.subject,
        fromAddress: params.from,
        htmlSnapshot: params.html,
        tags: ['edm'],
        recipients: campaignRecipients,
      });
      campaignId = campaign.id;
    } catch (err: any) {
      console.warn(`[edm] Campaign record creation failed (emails were sent): ${err.message}`);
    }
  }

  const parts = [
    `Email sent successfully to ${recipients.join(', ')}.`,
    `IDs: ${emailIds.join(', ')}`,
  ];
  if (campaignId) {
    parts.push(`Campaign ID: ${campaignId} — use edm_track to check delivery status later.`);
  }

  return {
    success: true,
    campaignId,
    emailIds,
    message: parts.join(' '),
  };
}

/**
 * Refresh delivery status for a campaign by polling Resend GET /emails/{id}.
 */
export async function handleEdmTrack(
  campaignId: string,
  edmStore: EdmCloudStore
): Promise<{ success: boolean; stats: CampaignStats | null; message: string }> {
  // 1. Get campaign recipients from cloud
  const { recipients } = await edmStore.getCampaign(campaignId);

  if (!recipients || recipients.length === 0) {
    return { success: false, stats: null, message: 'No recipients found for this campaign.' };
  }

  // 2. Poll Resend via cloud proxy using user's stored Resend Key
  const emailIds = recipients.map((r) => r.emailId);
  const response = await fetch(`${edmStore.endpoint}/edm/track`, {
    method: 'POST',
    headers: edmStore.headers(),
    body: JSON.stringify({ emailIds }),
  });

  const data = await response.json() as any;
  if (!response.ok) {
    return {
      success: false,
      stats: null,
      message: `Cloud Proxy Error (${response.status}): ${data.error || data.message || JSON.stringify(data)}`,
    };
  }

  const updates = data.updates as { emailId: string; lastEvent: string; lastEventAt: string | null }[];

  // 3. Batch update recipients in cloud
  if (updates.length > 0) {
    await edmStore.updateRecipients(campaignId, updates);
  }

  // 4. Get fresh stats
  const stats = await edmStore.getCampaignStats(campaignId);

  return {
    success: true,
    stats,
    message: data.message || `Tracked ${updates.length}/${recipients.length} emails.`,
  };
}

/**
 * Query EDM campaigns — list, detail, stats, or filter recipients.
 */
export async function handleEdmQuery(
  params: EdmQueryParams,
  edmStore: EdmCloudStore
): Promise<any> {
  const limit = params.limit ?? 50;

  switch (params.query) {
    case 'list': {
      const campaigns = await edmStore.listCampaigns(limit);
      return {
        campaigns: campaigns.map((c) => ({
          id: c.id,
          subject: c.subject,
          fromAddress: c.fromAddress,
          totalRecipients: c.totalRecipients,
          createdAt: c.createdAt,
          stats: c.stats,
        })),
      };
    }

    case 'detail': {
      if (!params.campaignId) {
        return { error: 'campaignId is required for detail query' };
      }
      const { campaign, recipients } = await edmStore.getCampaign(params.campaignId);
      return { campaign, recipients };
    }

    case 'stats': {
      if (!params.campaignId) {
        return { error: 'campaignId is required for stats query' };
      }
      const stats = await edmStore.getCampaignStats(params.campaignId);
      return { campaignId: params.campaignId, stats };
    }

    case 'filter': {
      if (!params.campaignId) {
        return { error: 'campaignId is required for filter query' };
      }
      if (!params.filterEvent) {
        return { error: 'filterEvent is required for filter query' };
      }
      const recipients = await edmStore.filterRecipients(
        params.campaignId,
        params.filterEvent,
        params.exclude,
        limit
      );
      return {
        campaignId: params.campaignId,
        filterEvent: params.filterEvent,
        exclude: params.exclude ?? false,
        count: recipients.length,
        recipients,
      };
    }

    default:
      return { error: `Unknown query type: ${params.query}` };
  }
}
