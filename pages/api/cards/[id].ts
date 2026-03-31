import type { NextApiRequest, NextApiResponse } from 'next';
import { dbOperations } from '@/lib/db';
import { KanbanCard, MoveCardPayload, UpdateCardPayload, BoardSection } from '@/types/kanban';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KanbanCard | { error: string }>
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid card ID' });
  }

  try {
    if (req.method === 'GET') {
      const card = await dbOperations.getCardById(id);
      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }
      return res.status(200).json(card);
    }

    if (req.method === 'DELETE') {
      await dbOperations.deleteCard(id);
      return res.status(200).json({ error: 'Card deleted' } as any);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in /api/cards/[id]:', error);
    return res.status(500).json({ error: error.message });
  }
}
