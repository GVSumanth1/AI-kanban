import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { KanbanCard as KanbanCardType } from '@/types/kanban';
import { KanbanColumn } from './KanbanColumn';
import { DraftModal, SendModal } from './Modals';

type ModalType = 'draft' | 'send' | null;

export const KanbanBoard: React.FC = () => {
  const [cards, setCards] = useState<KanbanCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<KanbanCardType | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);

  // Fetch cards on mount
  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cards');
      setCards(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupedCards = {
    todo: cards.filter((c) => c.board_section === 'todo'),
    in_progress: cards.filter((c) => c.board_section === 'in_progress'),
    done: cards.filter((c) => c.board_section === 'done'),
  };

  // Handle opening draft (move Urgent card to in_progress)
  const handleOpenDraft = (card: KanbanCardType) => {
    moveCard(card.id, 'in_progress');
  };

  // Handle review details (move Information card to in_progress)
  const handleReviewDetails = (card: KanbanCardType) => {
    moveCard(card.id, 'in_progress');
  };

  // Handle skip (Promotional -> Done)
  const handleSkip = (card: KanbanCardType) => {
    moveCard(card.id, 'done');
  };

  // Handle send (Urgent -> open SendModal)
  const handleSend = (card: KanbanCardType) => {
    setSelectedCard(card);
    setModalType('send');
  };

  // Handle confirm send email (actually send and move to done)
  const handleSendEmail = async (card: KanbanCardType, message: string) => {
    try {
      // Send email via API
      await axios.post(`/api/cards/${card.id}/send`, {
        message: message,
      });

      // Move card to done after successful send
      await moveCard(card.id, 'done');
      
      closeModal();
    } catch (err: any) {
      console.error('Error sending email:', err);
      throw new Error(err.response?.data?.error || 'Failed to send email');
    }
  };

  // Handle save draft
  const handleSaveDraft = async (draft: string) => {
    if (!selectedCard) return;

    try {
      await axios.put(`/api/cards/${selectedCard.id}/draft`, {
        ai_draft: draft,
      });

      // Update local state
      setCards(
        cards.map((c) =>
          c.id === selectedCard.id ? { ...c, ai_draft: draft } : c
        )
      );

      // Move card to in_progress if not already there
      if (selectedCard.board_section === 'todo') {
        await moveCard(selectedCard.id, 'in_progress');
      }
    } catch (err) {
      console.error('Error saving draft:', err);
    }
  };

  // Handle mark as read (move Information card to done)
  const handleMarkAsRead = (card: KanbanCardType) => {
    moveCard(card.id, 'done');
  };

  // Move card to different section
  const moveCard = async (cardId: string, section: 'todo' | 'in_progress' | 'done') => {
    try {
      const response = await axios.put(`/api/cards/${cardId}/move`, {
        board_section: section,
      });

      // Update local state
      setCards(
        cards.map((c) =>
          c.id === cardId ? { ...c, board_section: section } : c
        )
      );

      if (selectedCard?.id === cardId) {
        setSelectedCard({ ...response.data });
      }
    } catch (err) {
      console.error('Error moving card:', err);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedCard(null);
  };

  if (loading) {
    return <div className="loading">Loading board...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="kanban-board-container">
      <div className="board-header">
        <h1>AI-Driven Kanban Inbox</h1>
        <button className="btn btn-refresh" onClick={fetchCards}>
          Refresh
        </button>
      </div>

      <div className="kanban-board">
        <KanbanColumn
          title="To-Do"
          sectionKey="todo"
          cards={groupedCards.todo}
          onOpenDraft={handleOpenDraft}
          onReviewDetails={handleReviewDetails}
          onMarkAsRead={handleMarkAsRead}
          onSkip={handleSkip}
          onSend={handleSend}
        />

        <KanbanColumn
          title="In Progress"
          sectionKey="in_progress"
          cards={groupedCards.in_progress}
          onOpenDraft={handleOpenDraft}
          onReviewDetails={handleReviewDetails}
          onMarkAsRead={handleMarkAsRead}
          onSkip={handleSkip}
          onSend={handleSend}
        />

        <KanbanColumn
          title="Done"
          sectionKey="done"
          cards={groupedCards.done}
          onOpenDraft={handleOpenDraft}
          onReviewDetails={handleReviewDetails}
          onMarkAsRead={handleMarkAsRead}
          onSkip={handleSkip}
          onSend={handleSend}
        />
      </div>

      {modalType === 'draft' && selectedCard && (
        <DraftModal
          card={selectedCard}
          onClose={closeModal}
          onSend={handleSend}
          onSaveDraft={handleSaveDraft}
        />
      )}

      {modalType === 'send' && selectedCard && (
        <SendModal
          card={selectedCard}
          onClose={closeModal}
          onSendEmail={handleSendEmail}
        />
      )}
    </div>
  );
};
