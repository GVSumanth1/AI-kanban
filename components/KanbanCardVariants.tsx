import React, { useState } from 'react';
import { KanbanCard as KanbanCardType } from '@/types/kanban';

interface UrgentCardProps {
  card: KanbanCardType;
  onOpenDraft: (card: KanbanCardType) => void;
  onSend: (card: KanbanCardType) => void;
}

export const UrgentCard: React.FC<UrgentCardProps> = ({ card, onOpenDraft, onSend }) => {
  return (
    <div className="card card-urgent">
      <div className="card-header">
        <span className="badge badge-urgent">Urgent</span>
      </div>
      <div className="card-body">
        <p className="sender-name">{card.sender_name}</p>
        <p className="subject">{card.subject}</p>
        
        {card.board_section === 'todo' && (
          <div className="ai-generated">
            <div className="ai-item">
              <strong>Next Action:</strong> {card.next_action || 'N/A'}
            </div>
            <div className="ai-item">
              <strong>Deadline:</strong> {card.deadline || 'N/A'}
            </div>
          </div>
        )}

        {card.board_section === 'in_progress' && (
          <div className="draft-content">
            <strong>Draft Message:</strong>
            <p className="draft-text">{card.ai_draft || 'No draft available'}</p>
          </div>
        )}
      </div>

      {card.board_section === 'todo' && (
        <div className="card-footer">
          <button
            className="btn btn-primary"
            onClick={() => onOpenDraft(card)}
          >
            Open AI Draft
          </button>
        </div>
      )}

      {card.board_section === 'in_progress' && (
        <div className="card-footer">
          <button
            className="btn btn-success"
            onClick={() => onSend(card)}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

interface InformationCardProps {
  card: KanbanCardType;
  onReviewDetails: (card: KanbanCardType) => void;
  onMarkAsRead: (card: KanbanCardType) => void;
}

export const InformationCard: React.FC<InformationCardProps> = ({ 
  card, 
  onReviewDetails,
  onMarkAsRead 
}) => {
  const bullets = card.summary_bullets 
    ? JSON.parse(card.summary_bullets).bullets 
    : [];

  return (
    <div className="card card-information">
      <div className="card-header">
        <span className="badge badge-information">FYI</span>
      </div>
      <div className="card-body">
        <p className="sender-name">{card.sender_name}</p>
        <p className="subject">{card.subject}</p>
        
        {card.board_section === 'todo' && (
          <div className="ai-generated">
            <div className="ai-item">
              <strong>Read Time:</strong> {card.read_time || 'N/A'}
            </div>
          </div>
        )}

        {card.board_section === 'in_progress' && (
          <div className="key-points">
            <strong>Key Points</strong>
            <ul className="key-bullets">
              {bullets.map((bullet: string, idx: number) => (
                <li key={idx}>{bullet}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {card.board_section === 'todo' && (
        <div className="card-footer">
          <button
            className="btn btn-secondary"
            onClick={() => onReviewDetails(card)}
          >
            Review Details
          </button>
        </div>
      )}

      {card.board_section === 'in_progress' && (
        <div className="card-footer">
          <button
            className="btn btn-primary"
            onClick={() => onMarkAsRead(card)}
          >
            Mark as Read
          </button>
        </div>
      )}
    </div>
  );
};

interface PromotionalCardProps {
  card: KanbanCardType;
  onSkip: (card: KanbanCardType) => void;
}

export const PromotionalCard: React.FC<PromotionalCardProps> = ({ card, onSkip }) => {
  return (
    <div className="card card-promotional">
      <div className="card-header">
        <span className="badge badge-promotional">Promotional</span>
      </div>
      <div className="card-body">
        <p className="sender-name">{card.sender_name}</p>
        <p className="subject">{card.subject}</p>
      </div>
      
      {card.board_section === 'todo' && (
        <div className="card-footer">
          <button
            className="btn btn-danger"
            onClick={() => onSkip(card)}
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
};
