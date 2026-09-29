/**
 * Dokra Health - Compatibility Adapter
 * Task ID: DOKRA-HCS-MVP-001
 * 
 * Maps clean Dokra Canonical Card objects to the exact legacy
 * WebServiceData JSON structure expected by the mobile client:
 * 
 * WebServiceData
 *   ├── providerId
 *   ├── serviceId
 *   ├── eTag
 *   └── serviceInfo
 *       ├── serviceVersion
 *       ├── deactivationUrl
 *       ├── serviceDataApi
 *       ├── deactivationApi
 *       └── resourceInfo
 *           ├── templateType
 *           ├── contentUrl
 *           └── data (ViewData)
 *               ├── serviceIconUrl
 *               ├── serviceName
 *               ├── partnerName
 *               ├── ttsDesc
 *               ├── description
 *               ├── buttonList
 *               ├── insight (null)
 *               └── chart (null)
 */

function toLegacyWebServiceData(canonicalCard, computedEtag = null) {
  if (!canonicalCard) return null;

  const metadata = canonicalCard.metadata || {};
  const content = canonicalCard.content || {};
  const actions = canonicalCard.actions || [];
  const endpoints = canonicalCard.endpoints || {};

  // Map actions to legacy buttonList
  const buttonList = actions.map(action => ({
    title: action.title || '',
    ttsDesc: action.ttsPrompt || null,
    actionUrl: action.actionUrl || '',
    extra: action.extra || null
  }));

  const viewData = {
    serviceIconUrl: content.iconUrl || '',
    serviceName: content.title || '',
    partnerName: metadata.partnerName || 'Dokra Health',
    ttsDesc: metadata.ttsPrompt || content.title || '',
    description: content.description || '',
    buttonList: buttonList.length > 0 ? buttonList : null,
    insight: null,
    chart: null
  };

  const resourceInfo = {
    templateType: typeof content.templateType === 'number' ? content.templateType : 0,
    contentUrl: content.contentUrl || 'file:///android_asset/service_card_test_update.html',
    data: viewData
  };

  const serviceInfo = {
    serviceVersion: canonicalCard.version || 1,
    deactivationUrl: endpoints.deactivationUrl || 'https://api.dokrahealth.com/v1/cards/deactivate',
    serviceDataApi: endpoints.serviceDataApi || 'https://api.dokrahealth.com/v1/cards/data',
    deactivationApi: endpoints.deactivationApi || 'https://api.dokrahealth.com/v1/cards/deactivate',
    resourceInfo: resourceInfo
  };

  return {
    providerId: metadata.providerId || 'com.dokra.health',
    serviceId: canonicalCard.slug,
    eTag: computedEtag || canonicalCard.eTag || null,
    serviceInfo: serviceInfo
  };
}

module.exports = {
  toLegacyWebServiceData
};
