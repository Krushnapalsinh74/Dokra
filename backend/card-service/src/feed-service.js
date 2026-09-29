/**
 * Dokra Health - Mobile Feed Service
 * Task ID: DOKRA-HCS-MVP-001
 * 
 * Handles scheduling/targeting evaluation, deterministic feed sorting,
 * compatibility adapter transformation, and SHA-256 ETag generation.
 */

const crypto = require('crypto');
const { toLegacyWebServiceData } = require('./adapter');

class FeedService {
  constructor(database) {
    this.db = database;
  }

  getFeed(options = {}) {
    const { country, lang, app_ver, now = new Date() } = options;
    const nowTimestamp = now.getTime();

    // 1. Get all published cards
    const rawPublishedCards = this.db.getActivePublishedCards();

    // 2. Filter by Scheduling & Targeting
    const eligibleCards = rawPublishedCards.filter(card => {
      // Scheduling Check
      if (card.scheduling) {
        if (card.scheduling.startAt && nowTimestamp < Date.parse(card.scheduling.startAt)) {
          return false;
        }
        if (card.scheduling.endAt && nowTimestamp > Date.parse(card.scheduling.endAt)) {
          return false;
        }
      }

      // Country Targeting Check
      if (card.targeting && card.targeting.allowedCountries && card.targeting.allowedCountries.length > 0) {
        if (country) {
          const normalizedReqCountry = country.toUpperCase();
          const isAllowed = card.targeting.allowedCountries.some(c => c.toUpperCase() === normalizedReqCountry);
          if (!isAllowed) return false;
        }
      }

      // App Version Check
      if (app_ver && card.targeting) {
        if (card.targeting.minAppVersion && app_ver < card.targeting.minAppVersion) {
          return false;
        }
        if (card.targeting.maxAppVersion && app_ver > card.targeting.maxAppVersion) {
          return false;
        }
      }

      return true;
    });

    // 3. Fixed Deterministic Ordering Rule:
    // priority DESC -> publishedAt ASC -> card ID ASC
    eligibleCards.sort((a, b) => {
      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;

      const timeA = a.audit?.publishedAt ? Date.parse(a.audit.publishedAt) : 0;
      const timeB = b.audit?.publishedAt ? Date.parse(b.audit.publishedAt) : 0;
      const timeDiff = timeA - timeB;
      if (timeDiff !== 0) return timeDiff;

      return (a.id || '').localeCompare(b.id || '');
    });

    // 4. Transform to Legacy WebServiceData format
    const legacyCards = eligibleCards.map(card => toLegacyWebServiceData(card));

    // 5. Deterministic SHA-256 ETag Generation
    // Compute hash of the exact legacy JSON representation
    const payloadJsonString = JSON.stringify(legacyCards);
    const sha256Hash = crypto.createHash('sha256').update(payloadJsonString, 'utf8').digest('hex');
    const computedEtag = `W/"${sha256Hash}"`;

    // Inject the computed feed ETag into each card object's eTag field for client model consistency
    const legacyCardsWithEtag = legacyCards.map(c => ({
      ...c,
      eTag: computedEtag
    }));

    return {
      etag: computedEtag,
      cards: legacyCardsWithEtag,
      rawCount: eligibleCards.length
    };
  }
}

module.exports = {
  FeedService
};
