/**
 * Dokra Health - Admin Service
 * Task ID: DOKRA-HCS-MVP-001
 * 
 * Orchestrates Admin Card Studio operations:
 * - Draft creation & validation
 * - Updating draft cards
 * - Publishing cards with immutable revision snapshots
 * - Rollback to previous revisions
 * - Listing revisions and audit logs
 */

const { validateCanonicalCard } = require('./validation');

class AdminService {
  constructor(database) {
    this.db = database;
  }

  createDraft(cardData, actorId = 'admin_default') {
    validateCanonicalCard(cardData, false);
    return this.db.createDraft(cardData, actorId);
  }

  getCard(id) {
    const card = this.db.getCardById(id);
    if (!card) {
      throw new Error(`Card with ID '${id}' not found.`);
    }
    return card;
  }

  listCards() {
    return this.db.listCards();
  }

  updateDraft(id, cardData, actorId = 'admin_default') {
    const currentCard = this.getCard(id);
    const merged = {
      ...currentCard,
      ...cardData,
      metadata: { ...currentCard.metadata, ...(cardData.metadata || {}) },
      content: { ...currentCard.content, ...(cardData.content || {}) },
      actions: cardData.actions !== undefined ? cardData.actions : currentCard.actions,
      scheduling: { ...currentCard.scheduling, ...(cardData.scheduling || {}) },
      targeting: { ...currentCard.targeting, ...(cardData.targeting || {}) },
      endpoints: { ...currentCard.endpoints, ...(cardData.endpoints || {}) },
      id
    };
    validateCanonicalCard(merged, false);
    return this.db.updateDraft(id, cardData, actorId);
  }

  publishCard(id, actorId = 'admin_default', changeSummary = 'Card published') {
    const currentCard = this.getCard(id);
    // Strict validation prior to publish
    validateCanonicalCard(currentCard, true);
    return this.db.publishCard(id, actorId, changeSummary);
  }

  rollbackCard(id, targetRevisionId, actorId = 'admin_default', reason = 'Admin rollback') {
    return this.db.rollbackCard(id, targetRevisionId, actorId, reason);
  }

  unpublishCard(id, actorId = 'admin_default', reason = 'Admin unpublish') {
    return this.db.unpublishCard(id, actorId, reason);
  }

  duplicateCard(id, actorId = 'admin_default') {
    return this.db.duplicateCard(id, actorId);
  }

  deleteCard(id, actorId = 'admin_default') {
    return this.db.deleteCard(id, actorId);
  }

  listRevisions(id) {
    return this.db.listRevisions(id);
  }

  listAuditEvents(id) {
    return this.db.listAuditEvents(id);
  }
}

module.exports = {
  AdminService
};
