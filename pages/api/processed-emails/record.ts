import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { dbOperations } from '@/lib/db';

interface RecordResponse {
  success?: boolean;
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
  res: NextApiResponse<RecordResponse>
) {
  const isAuthorized = await validateAuth(req, res);
  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let messageId, senderEmail, subject;

  // Handle both JSON and comma-separated string formats
  if (typeof req.body === 'string') {
    const parts = req.body.split(',');
    messageId = parts[0]?.trim();
    senderEmail = parts[1]?.trim();
    subject = parts[2]?.trim();
  } else {
    messageId = req.body.messageId;
    senderEmail = req.body.senderEmail;
    subject = req.body.subject;
  }

  if (!messageId) {
    return res.status(400).json({ error: 'messageId required' });
  }

  try {
    // Insert into processed_emails
    await dbOperations.recordProcessedEmail(
      messageId,
      senderEmail || 'Unknown',
      subject || 'No Subject'
    );

    return res.status(200).json({ success: true });
  } catch (error: any) {
    // If duplicate UNIQUE constraint error, that's OK (already processed)
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(200).json({ success: true });
    }

    console.error('Error recording processed email:', error);
    return res.status(500).json({ error: error.message });
  }
}
