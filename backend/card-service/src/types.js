/**
 * Dokra Health - Canonical Card Types & Constants
 * Task ID: DOKRA-HCS-MVP-001
 * 
 * Defines the clean, future-facing Dokra Canonical Card structure
 * used by Dokra Master Admin and backend services.
 */

/**
 * Valid Card Lifecycle Statuses
 */
const CARD_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
};

/**
 * Valid Template Types
 * MVP Constraint: Only Template 0 (Verified standard One UI card view) is allowed.
 */
const TEMPLATE_TYPE = {
  DEFAULT_CARD: 0
};

/**
 * Allowed Deep-Link & URL Schemes
 */
const ALLOWED_SCHEMES = [
  'dokrahealth://',
  'https://',
  'file:///android_asset/'
];

/**
 * Admin Studio RBAC Roles & Scopes
 */
const ADMIN_ROLES = {
  READONLY: { name: 'Read-only', scope: 'cards:read' },
  AUTHOR: { name: 'Content Author', scope: 'cards:author' },
  ADMIN: { name: 'Content Admin', scope: 'cards:admin' },
  SUPER_ADMIN: { name: 'Super Admin', scope: 'cards:all' }
};

module.exports = {
  CARD_STATUS,
  TEMPLATE_TYPE,
  ALLOWED_SCHEMES,
  ADMIN_ROLES
};
