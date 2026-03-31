import type { NextApiRequest, NextApiResponse } from 'next';
import { dbOperations } from '@/lib/db';
import { KanbanCard, UpdateCardPayload } from '@/types/kanban';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KanbanCard | { error: string }>
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid card ID' });
  }

  try {
    if (req.method === 'PUT') {
      const payload: UpdateCardPayload = req.body;

      if (!payload.ai_draft) {
        return res.status(400).json({ error: 'Missing ai_draft' });
      }

      const card = await dbOperations.updateAiDraft(id, payload.ai_draft);
      return res.status(200).json(card);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in /api/cards/[id]/draft:', error);
    return res.status(500).json({ error: error.message });
  }
}
