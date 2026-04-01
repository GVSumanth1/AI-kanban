import React, { useState } from 'react';
import { KanbanCard } from '@/types/kanban';

interface DraftModalProps {
  card: KanbanCard;
  onClose: () => void;
  onSend: (card: KanbanCard) => void;
  onSaveDraft: (draft: string) => void;
}

export const DraftModal: React.FC<DraftModalProps> = ({ card, onClose, onSend, onSaveDraft }) => {
  const [draft, setDraft] = useState(card.ai_draft || '');

  const handleSaveDraft = () => {
    onSaveDraft(draft);
  };

  const handleSend = () => {
    onSend(card);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Urgent Email Draft</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="email-info">
            <p><strong>From:</strong> {card.sender_name}</p>
            <p><strong>Email:</strong> {card.sender_email}</p>
            <p><strong>Subject:</strong> {card.subject}</p>
            <p><strong>Next Action:</strong> {card.next_action}</p>
            <p><strong>Deadline:</strong> {card.deadline}</p>
          </div>

          <div className="draft-section">
            <label htmlFor="draft-textarea"><strong>AI Generated Draft</strong></label>
            <textarea
              id="draft-textarea"
              className="draft-textarea"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Edit the AI-generated draft here..."
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-secondary" onClick={handleSaveDraft}>Save Draft</button>
          <button className="btn btn-primary" onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

interface DetailsModalProps {
  card: KanbanCard;
  onClose: () => void;
  onMarkAsRead: (card: KanbanCard) => void;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({ card, onClose, onMarkAsRead }) => {
  const bullets = card.summary_bullets 
    ? typeof card.summary_bullets === 'string' 
      ? card.summary_bullets.split(' | ').filter(b => b.trim())
      : JSON.parse(card.summary_bullets).bullets 
    : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Email Details</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="email-info">
            <p><strong>From:</strong> {card.sender_name}</p>
            <p><strong>Email:</strong> {card.sender_email}</p>
            <p><strong>Subject:</strong> {card.subject}</p>
            <p><strong>Read Time:</strong> {card.read_time}</p>
          </div>

          <div className="bullets-section">
            <strong>Key Points</strong>
            <ul className="key-bullets">
              {bullets.map((bullet: string, idx: number) => (
                <li key={idx}>{bullet}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onMarkAsRead(card)}>
            Mark as Read
          </button>
        </div>
      </div>
    </div>
  );
};

interface SendModalProps {
  card: KanbanCard;
  onClose: () => void;
  onSendEmail: (card: KanbanCard, message: string) => Promise<void>;
}

export const SendModal: React.FC<SendModalProps> = ({ card, onClose, onSendEmail }) => {
  const [message, setMessage] = useState(card.ai_draft || '');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendEmail = async () => {
    try {
      setSending(true);
      setError(null);
      await onSendEmail(card, message);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Send Email</h2>
          <button className="btn-close" onClick={onClose} disabled={sending}>×</button>
        </div>

        <div className="modal-body">
          <div className="email-info">
            <p><strong>To:</strong> {card.sender_name}</p>
            <p><strong>Email:</strong> {card.sender_email}</p>
            <p><strong>Subject:</strong> {card.subject}</p>
          </div>

          <div className="draft-section">
            <label htmlFor="send-textarea"><strong>Message</strong></label>
            <textarea
              id="send-textarea"
              className="draft-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Edit the message here..."
              disabled={sending}
            />
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </button>
          <button 
            className="btn btn-success" 
            onClick={handleSendEmail}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
};
