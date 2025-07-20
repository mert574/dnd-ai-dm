import { getDatabase } from '../db/connection';
import type { MessageType } from '../db/types';

export interface MessageRow {
  id: number;
  content: string;
  type: MessageType;
  campaign_id: string;
  created_at: string;
}

export interface CreateMessageParams {
  content: string;
  type: MessageType;
  campaignId: string;
}

export class MessageDataStore {
  private db = getDatabase();

  private createMessageStmt = this.db.prepare(`
    INSERT INTO messages (content, type, campaign_id)
    VALUES (@content, @type, @campaignId)
    RETURNING *
  `);

  private getCampaignMessagesStmt = this.db.prepare(`
    SELECT * FROM messages
    WHERE campaign_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);

  private getMessageByIdStmt = this.db.prepare(`
    SELECT * FROM messages WHERE id = ?
  `);

  private deleteMessageStmt = this.db.prepare(`
    DELETE FROM messages WHERE id = ? AND campaign_id = ?
  `);

  create(params: CreateMessageParams): MessageRow {
    return this.createMessageStmt.get(params) as MessageRow;
  }

  getById(id: number): MessageRow | undefined {
    return this.getMessageByIdStmt.get(id) as MessageRow | undefined;
  }

  getByCampaignId(campaignId: string, limit: number = 50): MessageRow[] {
    return this.getCampaignMessagesStmt.all(campaignId, limit) as MessageRow[];
  }

  delete(messageId: number, campaignId: string): boolean {
    const result = this.deleteMessageStmt.run(messageId, campaignId);
    return result.changes > 0;
  }
}