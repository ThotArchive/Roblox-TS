import chatModule from '../chatModule';

const featureInterventionAnalytics = {
  interventionTypes: {
    partyChatNudge: 'INTERVENTION_PARTY_CHAT_NUDGE',
    partyChatTimeout: 'INTERVENTION_PARTY_CHAT_TIMEOUT'
  },
  eventTypes: {
    appealClicked: 'EVENT_APPEAL_CLICKED',
    ctaClicked: 'EVENT_CTA_CLICKED',
    learnClicked: 'EVENT_LEARN_CLICKED',
    modalAppeared: 'EVENT_MODAL_APPEARED'
  },
  eventContext: 'InExperienceInterventionEvent',
  eventName: 'InExperienceInterventionEvent'
};

chatModule.constant('featureInterventionAnalytics', featureInterventionAnalytics);

export default featureInterventionAnalytics;
