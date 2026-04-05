import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { dbOperations } from '@/lib/db';

interface CheckResponse {
  isDuplicate: boolean;
  data?: any;
  error?: string;
}

const validateAuth = async (req: NextApiRequest, res: NextApiResponse): Promise<boolean> => {
  // Check 1: Valid NextAuth session
  const session = await getServerSession(req, res, authOptions);
  if (session) return true;

  // Check 2: Valid webhook Bearer token
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token === process.env.WEBHOOK_SECRET) return true;
  }

  return false;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckResponse>
) {
  const isAuthorized = await validateAuth(req, res);
  if (!isAuthorized) {
    return res.status(401).json({ isDuplicate: false, error: 'Unauthorized' });
  }

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
