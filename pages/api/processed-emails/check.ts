import type { NextApiRequest, NextApiResponse } from 'next';
import { dbOperations } from '@/lib/db';

interface CheckResponse {
  isDuplicate: boolean;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ isDuplicate: false, error: 'Method not allowed' });
  }

  const { messageId } = req.query;

  if (!messageId || typeof messageId !== 'string') {
    return res.status(400).json({ isDuplicate: false, error: 'messageId required' });
  }

  try {
    // Check if message already processed
    const processed = await dbOperations.getProcessedEmail(messageId);

    if (processed) {
      return res.status(200).json({ isDuplicate: true, data: processed });
    } else {
      return res.status(200).json({ isDuplicate: false });
    }
  } catch (error: any) {
    console.error('Error checking processed email:', error);
    return res.status(500).json({ isDuplicate: false, error: error.message });
  }
}
