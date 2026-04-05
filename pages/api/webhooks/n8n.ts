import type { NextApiRequest, NextApiResponse } from 'next';
import { dbOperations } from '@/lib/db';
import { KanbanCard, CardPayload } from '@/types/kanban';

interface WebhookResponse {
  success?: boolean;
  card?: KanbanCard;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebhookResponse>
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate webhook secret token
  const webhookSecret = process.env.WEBHOOK_SECRET;
  const authHeader = req.headers.authorization;

  if (!webhookSecret) {
    console.error('WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix
  if (token !== webhookSecret) {
    return res.status(403).json({ error: 'Invalid webhook token' });
  }

  try {
    let payload: CardPayload = req.body;

    // Parse body if it's a string
    if (typeof payload === 'string') {
      payload = JSON.parse(payload);
    }

    // Validate required fields
    if (!payload.sender_name || !payload.sender_email || !payload.subject || !payload.category) {
      return res.status(400).json({ 
        error: 'Missing required fields: sender_name, sender_email, subject, category' 
      });
    }

    // Create the card
    const card = await dbOperations.createCard(payload);

    return res.status(201).json({
      success: true,
      card,
      message: `Card created from n8n webhook: ${payload.subject}`
    });
  } catch (error: any) {
    console.error('Error in n8n webhook:', error);
    return res.status(500).json({ error: error.message });
  }
}
