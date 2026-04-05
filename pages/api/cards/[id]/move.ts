import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { dbOperations } from '@/lib/db';
import { KanbanCard, MoveCardPayload } from '@/types/kanban';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KanbanCard | { error: string }>
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid card ID' });
  }

  try {
    if (req.method === 'PUT') {
      const payload: MoveCardPayload = req.body;

      if (!payload.board_section) {
        return res.status(400).json({ error: 'Missing board_section' });
      }

      const card = await dbOperations.moveCard(id, payload.board_section);
      return res.status(200).json(card);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in /api/cards/[id]/move:', error);
    return res.status(500).json({ error: error.message });
  }
}
