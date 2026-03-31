import type { NextApiRequest, NextApiResponse } from 'next';
import { dbOperations } from '@/lib/db';
import { KanbanCard, CardPayload } from '@/types/kanban';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KanbanCard | KanbanCard[] | { error: string }>
) {
  try {
    if (req.method === 'POST') {
      const payload: CardPayload = req.body;

      // Validate required fields
      if (!payload.sender_name || !payload.subject || !payload.category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const card = await dbOperations.createCard(payload);
      return res.status(201).json(card);
    }

    if (req.method === 'GET') {
      const cards = await dbOperations.getAllCards();
      return res.status(200).json(cards);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in /api/cards:', error);
    return res.status(500).json({ error: error.message });
  }
}
