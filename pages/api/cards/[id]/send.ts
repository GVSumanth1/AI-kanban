import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import sqlite3 from 'sqlite3';
import path from 'path';
import axios from 'axios';

const dbPath = path.join(process.cwd(), 'data', 'kanban.db');
const db = new sqlite3.Database(dbPath);

interface SendEmailRequest {
  message: string;
}

interface SendEmailResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SendEmailResponse>
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { message } = req.body as SendEmailRequest;

  if (!id || !message) {
    return res.status(400).json({ error: 'Card ID and message are required' });
  }

  try {
    // Fetch the card from database
    const card = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM kanban_cards WHERE id = ?',
        [id],
        (err: any, row: any) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    }) as any;

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      return res.status(500).json({
        error: 'n8n webhook URL not configured. Please set N8N_WEBHOOK_URL in .env.local',
      });
    }

    // Send to n8n webhook
    try {
      const response = await axios.post(
        n8nWebhookUrl,
        {
          to: card.sender_name,
          subject: `Re: ${card.subject}`,
          message: message,
          cardId: id,
        },
        {
          timeout: 30000, // 30 second timeout
        }
      );

      // Check if n8n returned an error
      if (response.data?.error) {
        return res.status(500).json({
          error: response.data.error,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Email sent successfully',
      });
    } catch (webhookError: any) {
      console.error('n8n webhook error:', webhookError.message);

      if (webhookError.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'Cannot connect to n8n. Is it running? Check N8N_WEBHOOK_URL in .env.local',
        });
      }

      if (webhookError.code === 'ENOTFOUND') {
        return res.status(503).json({
          error: 'n8n webhook URL is invalid or unreachable. Check N8N_WEBHOOK_URL in .env.local',
        });
      }

      if (webhookError.response?.status === 404) {
        return res.status(503).json({
          error: 'n8n webhook not found (404). Check the webhook path is correct.',
        });
      }

      return res.status(500).json({
        error: webhookError.response?.data?.message || 'Failed to send email via n8n',
      });
    }
  } catch (error: any) {
    console.error('Error in send endpoint:', error);
    res.status(500).json({
      error: error.message || 'Failed to process email send request',
    });
  }
}
