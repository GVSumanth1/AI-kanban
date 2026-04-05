import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { dbOperations } from '@/lib/db';
import { KanbanCard } from '@/types/kanban';

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
