/**
 * Dokra Health - Card Validation Engine
 * Task ID: DOKRA-HCS-MVP-001
 */

const { CARD_STATUS, TEMPLATE_TYPE, ALLOWED_SCHEMES } = require('./types');

function validateUrlScheme(urlStr, fieldName) {
  if (!urlStr || typeof urlStr !== 'string') {
    throw new Error(`Field '${fieldName}' must be a non-empty string URL/URI.`);
  }
  const isAllowed = ALLOWED_SCHEMES.some(prefix => urlStr.startsWith(prefix));
  if (!isAllowed) {
    throw new Error(`Security Violation: Field '${fieldName}' contains disallowed scheme: '${urlStr}'. Only 'dokrahealth://' and HTTPS URLs are allowed.`);
  }
}

function validateCanonicalCard(card, isPublishing = false) {
  if (!card || typeof card !== 'object') {
    throw new Error('Card payload must be an object.');
  }

  // 1. Core identification
  if (!card.slug || typeof card.slug !== 'string' || !/^[a-z0-9\-_]+$/i.test(card.slug)) {
    throw new Error("Field 'slug' is required and must contain alphanumeric characters, hyphens, or underscores.");
  }

  // 2. Metadata validation
  if (!card.metadata || typeof card.metadata !== 'object') {
    throw new Error("Object 'metadata' is required.");
  }
  if (!card.metadata.providerId || typeof card.metadata.providerId !== 'string') {
    throw new Error("Field 'metadata.providerId' is required (e.g. 'com.dokra.health').");
  }

  // 3. Content validation
  if (!card.content || typeof card.content !== 'object') {
    throw new Error("Object 'content' is required.");
  }
  if (!card.content.title || typeof card.content.title !== 'string' || card.content.title.trim().length === 0) {
    throw new Error("Field 'content.title' is required and cannot be blank.");
  }
  if (!card.content.description || typeof card.content.description !== 'string') {
    throw new Error("Field 'content.description' is required.");
  }

  // 4. Template type validation (MVP Constraint: Only Template 0)
  const templateType = card.content.templateType;
  if (templateType === undefined || templateType === null || templateType !== TEMPLATE_TYPE.DEFAULT_CARD) {
    throw new Error(`Unsupported templateType: ${templateType}. MVP supports only verified templateType 0 (DEFAULT_CARD).`);
  }

  if (card.content.iconUrl) {
    validateUrlScheme(card.content.iconUrl, 'content.iconUrl');
  }
  if (card.content.contentUrl) {
    validateUrlScheme(card.content.contentUrl, 'content.contentUrl');
  }

  // 5. Action / CTA validation
  if (card.actions) {
    if (!Array.isArray(card.actions)) {
      throw new Error("Field 'actions' must be an array.");
    }
    const actionIds = new Set();
    for (const [idx, action] of card.actions.entries()) {
      if (!action.title || typeof action.title !== 'string') {
        throw new Error(`Action at index ${idx} requires a valid 'title'.`);
      }
      if (!action.actionUrl || typeof action.actionUrl !== 'string') {
        throw new Error(`Action at index ${idx} requires a valid 'actionUrl'.`);
      }
      validateUrlScheme(action.actionUrl, `actions[${idx}].actionUrl`);

      if (action.id) {
        if (actionIds.has(action.id)) {
          throw new Error(`Duplicate action ID detected: '${action.id}'.`);
        }
        actionIds.add(action.id);
      }
    }
  }

  // 6. Endpoints validation
  if (card.endpoints) {
    if (card.endpoints.deactivationUrl) {
      validateUrlScheme(card.endpoints.deactivationUrl, 'endpoints.deactivationUrl');
    }
    if (card.endpoints.serviceDataApi) {
      validateUrlScheme(card.endpoints.serviceDataApi, 'endpoints.serviceDataApi');
    }
    if (card.endpoints.deactivationApi) {
      validateUrlScheme(card.endpoints.deactivationApi, 'endpoints.deactivationApi');
    }
  }

  // 7. Scheduling validation
  if (card.scheduling) {
    const { startAt, endAt } = card.scheduling;
    if (startAt && isNaN(Date.parse(startAt))) {
      throw new Error("Field 'scheduling.startAt' must be a valid ISO-8601 date string.");
    }
    if (endAt && isNaN(Date.parse(endAt))) {
      throw new Error("Field 'scheduling.endAt' must be a valid ISO-8601 date string.");
    }
    if (startAt && endAt && Date.parse(startAt) > Date.parse(endAt)) {
      throw new Error("Field 'scheduling.startAt' cannot be after 'scheduling.endAt'.");
    }
  }

  // 8. Targeting validation
  if (card.targeting) {
    if (card.targeting.allowedCountries && !Array.isArray(card.targeting.allowedCountries)) {
      throw new Error("Field 'targeting.allowedCountries' must be an array of ISO-2 country codes.");
    }
  }

  return true;
}

module.exports = {
  validateCanonicalCard,
  validateUrlScheme
};
