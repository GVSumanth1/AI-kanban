import React from 'react';
import { KanbanCard as KanbanCardType } from '@/types/kanban';
import { UrgentCard, InformationCard, PromotionalCard } from './KanbanCardVariants';

interface KanbanColumnProps {
  title: string;
  sectionKey: 'todo' | 'in_progress' | 'done';
  cards: KanbanCardType[];
  onOpenDraft: (card: KanbanCardType) => void;
  onReviewDetails: (card: KanbanCardType) => void;
  onMarkAsRead: (card: KanbanCardType) => void;
  onSkip: (card: KanbanCardType) => void;
  onSend: (card: KanbanCardType) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  sectionKey,
  cards,
  onOpenDraft,
  onReviewDetails,
  onMarkAsRead,
  onSkip,
  onSend,
}) => {
  const renderCard = (card: KanbanCardType) => {
    if (card.category === 'Urgent') {
      return (
        <UrgentCard
          key={card.id}
          card={card}
          onOpenDraft={onOpenDraft}
          onSend={onSend}
        />
      );
    }

    if (card.category === 'Information') {
      return (
        <InformationCard
          key={card.id}
          card={card}
          onReviewDetails={onReviewDetails}
          onMarkAsRead={onMarkAsRead}
        />
      );
    }

    if (card.category === 'Promotional') {
      return (
        <PromotionalCard
          key={card.id}
          card={card}
          onSkip={onSkip}
        />
      );
    }

    return null;
  };

  return (
    <div className="kanban-column">
      <div className="column-header">
        <h2>{title}</h2>
        <span className="card-count">{cards.length}</span>
      </div>
      <div className="column-cards">
        {cards.length === 0 ? (
          <p className="empty-state">No cards</p>
        ) : (
          cards.map((card) => renderCard(card))
        )}
      </div>
    </div>
  );
};
