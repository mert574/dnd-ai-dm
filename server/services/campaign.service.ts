import { CampaignDataStore, type CampaignRow, type CreateCampaignParams, type UpdateCampaignStatusParams } from '../datastores/campaign.datastore';
import type { Campaign, CampaignStatus } from '../db/types';
import { mapKeys, camelCase } from 'lodash-es';
import { parseJson } from '../utils/json';

export interface CreateCampaignData {
  name: string;
  userId: string;
}

export interface UpdateCampaignStatusData {
  campaignId: string;
  status: CampaignStatus;
}

export class CampaignService {
  private dataStore: CampaignDataStore;

  constructor() {
    this.dataStore = new CampaignDataStore();
  }

  async create(data: CreateCampaignData): Promise<Campaign> {
    let campaignCode: string;
    let codeExists = true;
    let attempts = 0;
    const maxAttempts = 10;

    while (codeExists && attempts < maxAttempts) {
      campaignCode = this.dataStore.generateCampaignCode();
      const existing = this.dataStore.getById(campaignCode);
      codeExists = !!existing;
      attempts++;
    }

    if (codeExists) {
      throw new Error('Failed to generate unique campaign code');
    }

    const params: CreateCampaignParams = {
      campaignCode: campaignCode!,
      name: data.name,
      status: 'active' as CampaignStatus,
      userId: data.userId
    };

    const row = this.dataStore.create(params);
    return this.toCampaign(row);
  }

  async getById(id: string): Promise<Campaign | null> {
    const row = this.dataStore.getById(id);
    return row ? this.toCampaign(row) : null;
  }

  async getByUserId(userId: string): Promise<Campaign[]> {
    const rows = this.dataStore.getByUserId(userId);
    return rows.map(row => this.toCampaign(row));
  }

  async getByStatus(status: CampaignStatus): Promise<Campaign[]> {
    const rows = this.dataStore.getByStatus(status);
    return rows.map(row => this.toCampaign(row));
  }

  async updateStatus(data: UpdateCampaignStatusData): Promise<Campaign | null> {
    const params: UpdateCampaignStatusParams = {
      campaignId: data.campaignId,
      status: data.status
    };

    const row = this.dataStore.updateStatus(params);
    return row ? this.toCampaign(row) : null;
  }

  private toCampaign(row: CampaignRow): Campaign {
    const mapped = mapKeys(row, (_, key) => camelCase(key));
    return {
      ...mapped,
      gameState: parseJson(row.game_state)
    } as Campaign;
  }
}

export const campaignService = new CampaignService();