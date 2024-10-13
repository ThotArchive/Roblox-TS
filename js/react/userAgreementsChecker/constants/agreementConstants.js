export default {
  agreementLocalStorageKey: 'Roblox.UserAgreements',
  defaultCooldownInMs: 24 * 60 * 60 * 1000, // 24 hours; only used if the call to GUAC fails
  agreementTypeToTextKey: {
    TermsOfService: 'Modal.Agreement.TermsOfService',
    PrivacyPolicy: 'Modal.Agreement.PrivacyPolicy',
    RiderTerms: 'Modal.Agreement.RiderTerms',
    ChildrenPrivacyPolicy: 'Modal.Agreement.ChildrenPrivacyPolicy'
  },
  agreementListHeaderTextKey: 'Modal.Body',
  modalTitleKey: 'Modal.Title',
  acceptButtonTextKey: 'Modal.Agree'
};
