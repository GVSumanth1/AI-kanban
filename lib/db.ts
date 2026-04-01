import sqlite3 from 'sqlite3';
import path from 'path';
import { KanbanCard, BoardSection, CardPayload } from '../types/kanban';

const dbPath = path.join(process.cwd(), 'data', 'kanban.db');

const getDb = () => {
  return new sqlite3.Database(dbPath);
};

export const dbOperations = {
  /**
   * Create a new Kanban card from n8n ingestion
   */
  createCard: (payload: CardPayload): Promise<KanbanCard> => {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const id = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const query = `
        INSERT INTO kanban_cards (
          id, sender_name, sender_email, subject, category, next_action, deadline, 
          ai_draft, summary_bullets, read_time, board_section, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        id,
        payload.sender_name,
        payload.sender_email,
        payload.subject,
        payload.category,
        payload.next_action || null,
        payload.deadline || null,
        payload.ai_draft || null,
        payload.summary_bullets ? JSON.stringify(payload.summary_bullets) : null,
        payload.read_time || null,
        'todo',
        now,
        now,
      ];

      db.run(query, values, (err) => {
        if (err) {
          reject(err);
        } else {
          db.get(`SELECT * FROM kanban_cards WHERE id = ?`, [id], (err, row) => {
            db.close();
            if (err) {
              reject(err);
            } else {
              resolve(row as KanbanCard);
            }
          });
        }
      });
    });
  },

  /**
   * Get all cards organized by board section
   */
  getCardsBySection: (section: BoardSection): Promise<KanbanCard[]> => {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT * FROM kanban_cards 
        WHERE board_section = ? 
        ORDER BY created_at DESC
      `;

      db.all(query, [section], (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows as KanbanCard[]);
        }
      });
    });
  },

  /**
   * Get all cards
   */
  getAllCards: (): Promise<KanbanCard[]> => {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT * FROM kanban_cards 
        ORDER BY board_section, created_at DESC
      `;

      db.all(query, [], (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows as KanbanCard[]);
        }
      });
    });
  },

  /**
   * Get a single card by ID
   */
  getCardById: (id: string): Promise<KanbanCard | undefined> => {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `SELECT * FROM kanban_cards WHERE id = ?`;

      db.get(query, [id], (err, row) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(row as KanbanCard | undefined);
        }
      });
    });
  },

  /**
   * Move a card to a different board section
   */
  moveCard: (id: string, section: BoardSection): Promise<KanbanCard> => {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const now = new Date().toISOString();
      const query = `
        UPDATE kanban_cards 
        SET board_section = ?, updated_at = ? 
        WHERE id = ?
      `;

      db.run(query, [section, now, id], (err) => {
        if (err) {
          reject(err);
        } else {
          db.get(`SELECT * FROM kanban_cards WHERE id = ?`, [id], (err, row) => {
            db.close();
            if (err) {
              reject(err);
            } else {
              resolve(row as KanbanCard);
            }
          });
        }
      });
    });
  },

  /**
   * Update the AI draft of a card
   */
  updateAiDraft: (id: string, aiDraft: string): Promise<KanbanCard> => {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const now = new Date().toISOString();
      const query = `
        UPDATE kanban_cards 
        SET ai_draft = ?, updated_at = ? 
        WHERE id = ?
      `;

      db.run(query, [aiDraft, now, id], (err) => {
        if (err) {
          reject(err);
        } else {
          db.get(`SELECT * FROM kanban_cards WHERE id = ?`, [id], (err, row) => {
            db.close();
            if (err) {
              reject(err);
            } else {
              resolve(row as KanbanCard);
            }
          });
        }
      });
    });
  },

  /**
   * Delete a card
   */
  deleteCard: (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `DELETE FROM kanban_cards WHERE id = ?`;

      db.run(query, [id], (err) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },
};
