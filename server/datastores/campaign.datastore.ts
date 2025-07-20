import { getDatabase } from '../db/connection';
import type { CampaignStatus } from '../db/types';

export interface CampaignRow {
  id: string;
  name: string;
  status: CampaignStatus;
  game_state: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  dm_name?: string;
}

export interface CreateCampaignParams {
  campaignCode: string;
  name: string;
  status: CampaignStatus;
  userId: string;
}

export interface UpdateCampaignStatusParams {
  campaignId: string;
  status: CampaignStatus;
}

export class CampaignDataStore {
  private db = getDatabase();

  private createCampaignStmt = this.db.prepare(`
    INSERT INTO campaigns (id, name, status, user_id)
    VALUES (@campaignCode, @name, @status, @userId)
    RETURNING *
  `);

  private getCampaignByIdStmt = this.db.prepare(`
    SELECT c.*, u.name as dm_name
    FROM campaigns c
    JOIN user u ON u.id = c.user_id
    WHERE c.id = ?
  `);

  private updateCampaignStatusStmt = this.db.prepare(`
    UPDATE campaigns
    SET status = @status, updated_at = CURRENT_TIMESTAMP
    WHERE id = @campaignId
    RETURNING *
  `);

  private getCampaignsByUserStmt = this.db.prepare(`
    SELECT * FROM campaigns
    WHERE user_id = ?
    ORDER BY created_at DESC
  `);

  private getCampaignsByStatusStmt = this.db.prepare(`
    SELECT c.*, u.name as dm_name
    FROM campaigns c
    JOIN user u ON u.id = c.user_id
    WHERE c.status = ?
    ORDER BY c.created_at DESC
  `);

  create(params: CreateCampaignParams): CampaignRow {
    return this.createCampaignStmt.get(params) as CampaignRow;
  }

  getById(id: string): CampaignRow | undefined {
    return this.getCampaignByIdStmt.get(id) as CampaignRow | undefined;
  }

  updateStatus(params: UpdateCampaignStatusParams): CampaignRow | undefined {
    return this.updateCampaignStatusStmt.get(params) as CampaignRow | undefined;
  }

  getByUserId(userId: string): CampaignRow[] {
    return this.getCampaignsByUserStmt.all(userId) as CampaignRow[];
  }

  getByStatus(status: CampaignStatus): CampaignRow[] {
    return this.getCampaignsByStatusStmt.all(status) as CampaignRow[];
  }

  generateCampaignCode(): string {
    const adjectives = ['BRAVE', 'DARK', 'MYSTIC', 'WILD', 'EPIC', 'MAGICAL'];
    const nouns = ['DRAGON', 'QUEST', 'SWORD', 'SPELL', 'REALM', 'TALE', 'ADVENTURE', 'LEGEND'];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    return `${adj}-${noun}-${num}`;
  }
}